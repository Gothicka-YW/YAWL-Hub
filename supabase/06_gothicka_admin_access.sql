-- Ready to run for Gothicka admin access.
-- This email should match the email you will use with Supabase Auth later.

insert into public.staff_permissions (
  email,
  display_name,
  permission_role,
  can_manage_members,
  can_manage_roles,
  can_manage_events,
  is_active,
  notes
)
values (
  lower('ywa.paint@gmail.com'),
  'Gothicka',
  'admin',
  true,
  true,
  true,
  true,
  'Primary YoAngels admin'
)
on conflict (email)
do update set
  display_name = excluded.display_name,
  permission_role = excluded.permission_role,
  can_manage_members = excluded.can_manage_members,
  can_manage_roles = excluded.can_manage_roles,
  can_manage_events = excluded.can_manage_events,
  is_active = excluded.is_active,
  notes = excluded.notes,
  updated_at = now();