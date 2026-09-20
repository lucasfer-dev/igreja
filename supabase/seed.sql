-- Development bootstrap for ChurchOS.
-- Create the administrator in Supabase Auth first.
-- Then replace ADMIN_AUTH_USER_ID below before running this file.

do $$
declare
  church_id uuid;
  role_id uuid;
  admin_user_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if admin_user_id = '00000000-0000-0000-0000-000000000000' then
    raise notice 'Replace ADMIN_AUTH_USER_ID before running this seed.';
    return;
  end if;

  insert into public.churches(name, slug, plan_key)
  values ('Igreja Demonstração', 'igreja-demonstracao', 'basic')
  returning id into church_id;

  insert into public.church_units(church_id, name, slug, is_main)
  values (church_id, 'Unidade Principal', 'principal', true);

  insert into public.roles(church_id, key, name, is_system)
  values (church_id, 'church_admin', 'Administrador da Igreja', true)
  returning id into role_id;

  insert into public.role_permissions(role_id, permission_key)
  select role_id, key
  from public.permissions;

  insert into public.church_users(church_id, user_id, role_id, status)
  values (church_id, admin_user_id, role_id, 'active');
end $$;
