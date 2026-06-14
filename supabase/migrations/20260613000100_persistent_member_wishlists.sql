-- Converts weekly wish list posts into one persistent post per member.
-- The newest active post is kept, older comments are preserved, and older
-- duplicate posts are removed before the member-level unique key is added.

create temporary table wishlist_post_survivors on commit drop as
select member_id, id as survivor_id
from (
  select
    member_id,
    id,
    row_number() over (
      partition by member_id
      order by is_active desc, updated_at desc, created_at desc, id desc
    ) as row_number
  from public.wishlist_posts
) ranked
where row_number = 1;

update public.wishlist_comments as comments
set wishlist_id = survivors.survivor_id
from public.wishlist_posts as posts
join wishlist_post_survivors as survivors
  on survivors.member_id = posts.member_id
where comments.wishlist_id = posts.id
  and posts.id <> survivors.survivor_id;

delete from public.wishlist_posts as posts
using wishlist_post_survivors as survivors
where posts.member_id = survivors.member_id
  and posts.id <> survivors.survivor_id;

update public.wishlist_posts
set
  is_active = true,
  week_start_date = (
    (now() at time zone 'America/New_York')::date
    - extract(dow from now() at time zone 'America/New_York')::integer
  );

alter table public.wishlist_posts
  alter column week_start_date drop not null,
  alter column summary set default 'Persistent wish list, updated whenever the member needs.',
  alter column status_note set default 'Wish list is active and ready for updates.';

update public.wishlist_posts
set summary = 'Persistent wish list, updated whenever the member needs.'
where summary in (
  'Weekly wishlist for the current Sunday reset.',
  'Weekly wish list for the current Sunday reset.'
);

update public.wishlist_posts
set status_note = 'Wish list is active and ready for updates.'
where status_note in (
  'Wishlist posted for this week.',
  'Wish list posted for this week.'
);

create unique index if not exists wishlist_posts_member_key
  on public.wishlist_posts (member_id);

comment on table public.wishlist_posts is
  'One persistent wish list board per member. Members continuously update the same post.';

comment on column public.wishlist_posts.week_start_date is
  'Legacy rollout metadata. Persistent wish list behavior does not use this value.';

comment on table public.wishlist_items is
  'Structured items inside a member''s persistent wish list board.';

comment on table public.wishlist_comments is
  'Gift comments on persistent member wish list posts.';

create or replace function public.enforce_wishlist_item_limits()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  existing_count integer;
  out_of_store_count integer;
  current_id uuid;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  current_id := coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  select count(*), count(*) filter (where availability_status = 'out_of_store')
    into existing_count, out_of_store_count
  from public.wishlist_items
  where wishlist_id = new.wishlist_id
    and id <> current_id;

  if existing_count >= 20 then
    raise exception 'Each wish list can contain at most 20 items.';
  end if;

  if new.availability_status = 'out_of_store' and out_of_store_count >= 10 then
    raise exception 'Each wish list can contain at most 10 out-of-store items.';
  end if;

  return new;
end;
$$;
