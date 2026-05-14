-- Apply after 20260513000400_chat_module.sql.
-- Lets admins post chat messages for any active member profile.

create or replace function public.current_user_can_post_chat_message(
  target_member_id uuid,
  target_member_name text,
  target_member_in_game_name text,
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
        and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
    )
    and (
      public.current_user_can_manage_chat_messages()
      or public.current_member_id() = target_member_id
    )
    and (
      creator_user_id = auth.uid()
      or lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;