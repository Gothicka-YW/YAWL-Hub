create extension if not exists pgcrypto;

create table if not exists public.member_auth_links (
  auth_user_id uuid primary key,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.member_auth_links is 'Links a signed-in Supabase Auth user id to one member row after invite-code claim.';

create unique index if not exists member_auth_links_member_id_key
  on public.member_auth_links (member_id);

drop trigger if exists set_member_auth_links_updated_at on public.member_auth_links;

create trigger set_member_auth_links_updated_at
before update on public.member_auth_links
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.member_auth_links enable row level security;

grant select on table public.member_auth_links to authenticated;

drop policy if exists "users can read their member auth link" on public.member_auth_links;

create policy "users can read their member auth link"
on public.member_auth_links
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or public.current_user_can_manage_members()
);

create table if not exists public.member_invites (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  invite_code_hash text not null unique,
  created_by_email text not null default public.current_staff_email(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  claimed_by_auth_user_id uuid,
  revoked_at timestamptz,
  constraint member_invites_expiry_check
    check (expires_at > created_at)
);

comment on table public.member_invites is 'One-time claim codes that let a signed-in user attach their auth account to a member row.';

create index if not exists member_invites_member_created_idx
  on public.member_invites (member_id, created_at desc);

create unique index if not exists member_invites_active_member_key
  on public.member_invites (member_id)
  where claimed_at is null and revoked_at is null;

alter table public.member_invites enable row level security;

grant select on table public.member_invites to authenticated;

drop policy if exists "staff can read member invites" on public.member_invites;

create policy "staff can read member invites"
on public.member_invites
for select
to authenticated
using (public.current_user_can_manage_members());

create or replace function public.normalize_member_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select regexp_replace(upper(coalesce(raw_code, '')), '[^A-Z0-9]', '', 'g');
$$;

create or replace function public.hash_member_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(public.normalize_member_invite_code(raw_code), 'sha256'::text), 'hex');
$$;

create or replace function public.member_has_linked_account(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and (
      exists (
        select 1
        from public.member_auth_links
        where member_id = target_member_id
      )
      or exists (
        select 1
        from public.member_accounts
        where member_id = target_member_id
      )
    );
$$;

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select member_id
  from (
    select member_id, 0 as priority
    from public.member_auth_links
    where auth_user_id = auth.uid()

    union all

    select member_id, 1 as priority
    from public.member_accounts
    where lower(email) = public.current_user_email()
  ) as member_links
  order by priority
  limit 1;
$$;

create or replace function public.create_member_invite(
  p_member_id uuid,
  p_invite_code text,
  p_expires_in_days integer default 14
)
returns table (invite_id uuid, member_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := public.normalize_member_invite_code(p_invite_code);
  next_expires_at timestamptz := now() + make_interval(days => least(greatest(coalesce(p_expires_in_days, 14), 1), 30));
  new_invite_id uuid;
begin
  if not public.current_user_can_manage_members() then
    raise exception 'Only staff with member access can create invite codes.';
  end if;

  if p_member_id is null then
    raise exception 'Choose a member before creating an invite code.';
  end if;

  if length(normalized_code) < 10 then
    raise exception 'Invite codes must be at least 10 characters long.';
  end if;

  if not exists (
    select 1
    from public.members
    where id = p_member_id
      and is_active = true
  ) then
    raise exception 'Choose an active member before creating an invite code.';
  end if;

  if public.member_has_linked_account(p_member_id) then
    raise exception 'That member already has a claimed account.';
  end if;

  update public.member_invites as invites
  set revoked_at = now()
  where invites.member_id = p_member_id
    and invites.claimed_at is null
    and invites.revoked_at is null;

  insert into public.member_invites (
    member_id,
    invite_code_hash,
    expires_at,
    created_by_email
  )
  values (
    p_member_id,
    public.hash_member_invite_code(p_invite_code),
    next_expires_at,
    public.current_staff_email()
  )
  returning id, public.member_invites.expires_at
  into new_invite_id, next_expires_at;

  invite_id := new_invite_id;
  member_id := p_member_id;
  expires_at := next_expires_at;
  return next;
exception
  when unique_violation then
    raise exception 'That invite code is already in use. Generate a new code and try again.';
end;
$$;

create or replace function public.claim_member_invite(p_invite_code text)
returns table (member_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := public.normalize_member_invite_code(p_invite_code);
  existing_member_id uuid := public.current_member_id();
  current_auth_user_id uuid := auth.uid();
  target_invite_id uuid;
  target_member_id uuid;
begin
  if current_auth_user_id is null then
    raise exception 'Sign in before claiming an invite code.';
  end if;

  if length(normalized_code) < 10 then
    raise exception 'Enter a valid invite code.';
  end if;

  if existing_member_id is not null then
    raise exception 'This account is already linked to a member.';
  end if;

  select invites.id, invites.member_id
    into target_invite_id, target_member_id
  from public.member_invites as invites
  join public.members as members
    on members.id = invites.member_id
  where invites.invite_code_hash = public.hash_member_invite_code(p_invite_code)
    and invites.claimed_at is null
    and invites.revoked_at is null
    and invites.expires_at > now()
    and members.is_active = true
  order by invites.created_at desc
  limit 1;

  if target_invite_id is null or target_member_id is null then
    raise exception 'Invite code is invalid or expired.';
  end if;

  if public.member_has_linked_account(target_member_id) then
    update public.member_invites
    set revoked_at = coalesce(revoked_at, now())
    where id = target_invite_id;

    raise exception 'That member already has a claimed account.';
  end if;

  insert into public.member_auth_links (auth_user_id, member_id)
  values (current_auth_user_id, target_member_id);

  update public.member_invites
  set claimed_at = now(),
      claimed_by_auth_user_id = current_auth_user_id
  where id = target_invite_id;

  member_id := target_member_id;
  return next;
end;
$$;

grant execute on function public.create_member_invite(uuid, text, integer) to authenticated;
grant execute on function public.claim_member_invite(text) to authenticated;

alter table public.wishlist_posts
  add column if not exists created_by_user_id uuid;

alter table public.wishlist_posts
  alter column created_by_user_id set default auth.uid(),
  alter column created_by_email drop not null,
  alter column created_by_email drop default;

alter table public.wishlist_comments
  add column if not exists created_by_user_id uuid;

alter table public.wishlist_comments
  alter column created_by_user_id set default auth.uid(),
  alter column created_by_email drop not null,
  alter column created_by_email drop default;

alter table public.events
  add column if not exists created_by_user_id uuid;

alter table public.events
  alter column created_by_user_id set default auth.uid(),
  alter column created_by_email drop not null,
  alter column created_by_email drop default;

create index if not exists events_owner_user_lookup_idx
  on public.events (host_member_id, created_by_user_id, created_by_email);

create or replace function public.current_user_can_manage_event_member(
  target_member_id uuid,
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_events()
    or (
      target_member_id is not null
      and public.current_member_id() = target_member_id
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
    );
$$;

drop policy if exists "event managers can insert events" on public.events;
drop policy if exists "event managers can update events" on public.events;
drop policy if exists "members and event managers can insert events" on public.events;
drop policy if exists "members and event managers can update events" on public.events;

create policy "members and event managers can insert events"
on public.events
for insert
to authenticated
with check (public.current_user_can_manage_event_member(host_member_id, created_by_user_id, created_by_email));

create policy "members and event managers can update events"
on public.events
for update
to authenticated
using (public.current_user_can_manage_event_member(host_member_id, created_by_user_id, created_by_email))
with check (public.current_user_can_manage_event_member(host_member_id, created_by_user_id, created_by_email));