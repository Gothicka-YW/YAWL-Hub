create or replace function public.hash_member_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(public.normalize_member_invite_code(raw_code), 'sha256'::text), 'hex');
$$;