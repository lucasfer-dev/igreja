-- ChurchOS foundation
-- PostgreSQL / Supabase
-- Every exposed tenant table must use RLS.

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin
  create type public.membership_status as enum (
    'visitor','attendee','member','leader','volunteer','inactive'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.org_user_status as enum ('active','invited','suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.visitor_stage as enum ('new','contacted','returned','integrated','member');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_direction as enum ('income','expense');
exception when duplicate_object then null;
end $$;

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  cnpj text,
  logo_url text,
  primary_color text not null default '#0f766e',
  secondary_color text,
  phone text,
  whatsapp text,
  email text,
  settings jsonb not null default '{}'::jsonb,
  plan_key text not null default 'basic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.church_units (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  slug text not null,
  address jsonb,
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  unique(church_id, slug)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade,
  key text not null,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique(church_id, key)
);

create table if not exists public.permissions (
  key text primary key,
  description text not null
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key(role_id, permission_key)
);

create table if not exists public.church_users (
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  role_id uuid not null references public.roles(id),
  status public.org_user_status not null default 'active',
  created_at timestamptz not null default now(),
  primary key(church_id, user_id)
);

create table if not exists public.church_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  birth_date date,
  cpf text,
  status public.membership_status not null default 'member',
  joined_at date,
  conversion_date date,
  baptism_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  source text,
  first_visit_at date,
  visited_event_id uuid,
  assigned_user_id uuid references auth.users(id) on delete set null,
  stage public.visitor_stage not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitor_contacts (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  contacted_by uuid references auth.users(id) on delete set null,
  channel text,
  notes text,
  contacted_at timestamptz not null default now()
);

create table if not exists public.cells (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  name text not null,
  leader_member_id uuid references public.church_members(id) on delete set null,
  co_leader_member_id uuid references public.church_members(id) on delete set null,
  host_member_id uuid references public.church_members(id) on delete set null,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  weekday smallint check (weekday between 0 and 6),
  starts_at time,
  capacity integer check (capacity is null or capacity > 0),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cell_members (
  cell_id uuid not null references public.cells(id) on delete cascade,
  member_id uuid not null references public.church_members(id) on delete cascade,
  joined_at date not null default current_date,
  active boolean not null default true,
  primary key(cell_id, member_id)
);

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ministry_members (
  ministry_id uuid not null references public.ministries(id) on delete cascade,
  member_id uuid not null references public.church_members(id) on delete cascade,
  role_name text,
  active boolean not null default true,
  primary key(ministry_id, member_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  title text not null,
  description text,
  category text,
  banner_url text,
  address text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  price numeric(12,2) not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.visitors
  drop constraint if exists visitors_visited_event_id_fkey;

alter table public.visitors
  add constraint visitors_visited_event_id_fkey
  foreign key (visited_event_id) references public.events(id) on delete set null;

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid references public.church_members(id) on delete set null,
  visitor_id uuid references public.visitors(id) on delete set null,
  full_name text,
  email text,
  phone text,
  status text not null default 'registered',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  check (member_id is not null or visitor_id is not null or full_name is not null)
);

create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  cell_id uuid references public.cells(id) on delete cascade,
  member_id uuid references public.church_members(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  source text not null default 'manual'
);

create table if not exists public.volunteer_schedules (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  ministry_id uuid references public.ministries(id) on delete set null,
  member_id uuid not null references public.church_members(id) on delete cascade,
  function_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  direction public.transaction_direction not null,
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  occurred_at date not null default current_date,
  description text,
  member_id uuid references public.church_members(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  church_id uuid not null references public.churches(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create index if not exists church_members_church_idx on public.church_members(church_id);
create index if not exists church_members_name_idx on public.church_members(church_id, full_name);
create index if not exists visitors_church_stage_idx on public.visitors(church_id, stage);
create index if not exists cells_church_idx on public.cells(church_id);
create index if not exists ministries_church_idx on public.ministries(church_id);
create index if not exists events_church_start_idx on public.events(church_id, starts_at);
create index if not exists transactions_church_date_idx on public.transactions(church_id, occurred_at);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists audit_logs_church_idx on public.audit_logs(church_id, created_at desc);

insert into public.permissions(key, description) values
  ('members.read', 'Visualizar membros'),
  ('members.create', 'Cadastrar membros'),
  ('members.update', 'Editar membros'),
  ('members.delete', 'Excluir/inativar membros'),
  ('visitors.read', 'Visualizar visitantes'),
  ('visitors.manage', 'Gerenciar visitantes'),
  ('cells.read', 'Visualizar células'),
  ('cells.manage', 'Gerenciar células'),
  ('ministries.read', 'Visualizar ministérios'),
  ('ministries.manage', 'Gerenciar ministérios'),
  ('events.read', 'Visualizar eventos'),
  ('events.manage', 'Gerenciar eventos'),
  ('attendance.read', 'Visualizar presença'),
  ('attendance.manage', 'Registrar presença'),
  ('finance.read', 'Visualizar financeiro'),
  ('finance.manage', 'Gerenciar financeiro'),
  ('audit.read', 'Visualizar auditoria')
on conflict (key) do nothing;

create or replace function private.is_church_user(target_church_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.church_users cu
    where cu.church_id = target_church_id
      and cu.user_id = (select auth.uid())
      and cu.status = 'active'
  );
$$;

create or replace function private.has_permission(target_church_id uuid, target_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.church_users cu
    join public.role_permissions rp on rp.role_id = cu.role_id
    where cu.church_id = target_church_id
      and cu.user_id = (select auth.uid())
      and cu.status = 'active'
      and rp.permission_key = target_permission
  );
$$;

revoke all on function private.is_church_user(uuid) from public;
revoke all on function private.has_permission(uuid, text) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_church_user(uuid) to authenticated;
grant execute on function private.has_permission(uuid, text) to authenticated;

alter table public.churches enable row level security;
alter table public.church_units enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.church_users enable row level security;
alter table public.church_members enable row level security;
alter table public.visitors enable row level security;
alter table public.visitor_contacts enable row level security;
alter table public.cells enable row level security;
alter table public.cell_members enable row level security;
alter table public.ministries enable row level security;
alter table public.ministry_members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.attendances enable row level security;
alter table public.volunteer_schedules enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profile self read"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "profile self update"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "church tenant read"
on public.churches for select to authenticated
using (private.is_church_user(id));

create policy "units tenant read"
on public.church_units for select to authenticated
using (private.is_church_user(church_id));

create policy "church users tenant read"
on public.church_users for select to authenticated
using (private.is_church_user(church_id));

create policy "roles tenant read"
on public.roles for select to authenticated
using (private.is_church_user(church_id));

create policy "permissions authenticated read"
on public.permissions for select to authenticated
using (true);

create policy "role permissions tenant read"
on public.role_permissions for select to authenticated
using (
  exists (
    select 1 from public.roles r
    where r.id = role_id
      and private.is_church_user(r.church_id)
  )
);

create policy "members read"
on public.church_members for select to authenticated
using (private.has_permission(church_id, 'members.read'));

create policy "members insert"
on public.church_members for insert to authenticated
with check (private.has_permission(church_id, 'members.create'));

create policy "members update"
on public.church_members for update to authenticated
using (private.has_permission(church_id, 'members.update'))
with check (private.has_permission(church_id, 'members.update'));

create policy "members delete"
on public.church_members for delete to authenticated
using (private.has_permission(church_id, 'members.delete'));

create policy "visitors read"
on public.visitors for select to authenticated
using (private.has_permission(church_id, 'visitors.read'));

create policy "visitors manage insert"
on public.visitors for insert to authenticated
with check (private.has_permission(church_id, 'visitors.manage'));

create policy "visitors manage update"
on public.visitors for update to authenticated
using (private.has_permission(church_id, 'visitors.manage'))
with check (private.has_permission(church_id, 'visitors.manage'));

create policy "visitors manage delete"
on public.visitors for delete to authenticated
using (private.has_permission(church_id, 'visitors.manage'));

create policy "cells read"
on public.cells for select to authenticated
using (private.has_permission(church_id, 'cells.read'));

create policy "cells manage"
on public.cells for all to authenticated
using (private.has_permission(church_id, 'cells.manage'))
with check (private.has_permission(church_id, 'cells.manage'));

create policy "ministries read"
on public.ministries for select to authenticated
using (private.has_permission(church_id, 'ministries.read'));

create policy "ministries manage"
on public.ministries for all to authenticated
using (private.has_permission(church_id, 'ministries.manage'))
with check (private.has_permission(church_id, 'ministries.manage'));

create policy "events read"
on public.events for select to authenticated
using (private.has_permission(church_id, 'events.read'));

create policy "events manage"
on public.events for all to authenticated
using (private.has_permission(church_id, 'events.manage'))
with check (private.has_permission(church_id, 'events.manage'));

create policy "attendance read"
on public.attendances for select to authenticated
using (private.has_permission(church_id, 'attendance.read'));

create policy "attendance manage"
on public.attendances for all to authenticated
using (private.has_permission(church_id, 'attendance.manage'))
with check (private.has_permission(church_id, 'attendance.manage'));

create policy "finance read"
on public.transactions for select to authenticated
using (private.has_permission(church_id, 'finance.read'));

create policy "finance manage"
on public.transactions for all to authenticated
using (private.has_permission(church_id, 'finance.manage'))
with check (private.has_permission(church_id, 'finance.manage'));

create policy "visitor contacts tenant"
on public.visitor_contacts for all to authenticated
using (private.has_permission(church_id, 'visitors.read'))
with check (private.has_permission(church_id, 'visitors.manage'));

create policy "event registrations read"
on public.event_registrations for select to authenticated
using (private.has_permission(church_id, 'events.read'));

create policy "event registrations manage"
on public.event_registrations for all to authenticated
using (private.has_permission(church_id, 'events.manage'))
with check (private.has_permission(church_id, 'events.manage'));

create policy "schedules tenant read"
on public.volunteer_schedules for select to authenticated
using (private.is_church_user(church_id));

create policy "schedules manage"
on public.volunteer_schedules for all to authenticated
using (private.has_permission(church_id, 'ministries.manage'))
with check (private.has_permission(church_id, 'ministries.manage'));

create policy "notifications own"
on public.notifications for select to authenticated
using ((select auth.uid()) = user_id and private.is_church_user(church_id));

create policy "notifications own update"
on public.notifications for update to authenticated
using ((select auth.uid()) = user_id and private.is_church_user(church_id))
with check ((select auth.uid()) = user_id and private.is_church_user(church_id));

create policy "audit read"
on public.audit_logs for select to authenticated
using (private.has_permission(church_id, 'audit.read'));

create policy "cell members read"
on public.cell_members for select to authenticated
using (
  exists (
    select 1 from public.cells c
    where c.id = cell_id
      and private.has_permission(c.church_id, 'cells.read')
  )
);

create policy "cell members manage"
on public.cell_members for all to authenticated
using (
  exists (
    select 1 from public.cells c
    where c.id = cell_id
      and private.has_permission(c.church_id, 'cells.manage')
  )
)
with check (
  exists (
    select 1 from public.cells c
    where c.id = cell_id
      and private.has_permission(c.church_id, 'cells.manage')
  )
);

create policy "ministry members read"
on public.ministry_members for select to authenticated
using (
  exists (
    select 1 from public.ministries m
    where m.id = ministry_id
      and private.has_permission(m.church_id, 'ministries.read')
  )
);

create policy "ministry members manage"
on public.ministry_members for all to authenticated
using (
  exists (
    select 1 from public.ministries m
    where m.id = ministry_id
      and private.has_permission(m.church_id, 'ministries.manage')
  )
)
with check (
  exists (
    select 1 from public.ministries m
    where m.id = ministry_id
      and private.has_permission(m.church_id, 'ministries.manage')
  )
);

grant select, insert, update, delete
on public.church_members,
   public.visitors,
   public.visitor_contacts,
   public.cells,
   public.cell_members,
   public.ministries,
   public.ministry_members,
   public.events,
   public.event_registrations,
   public.attendances,
   public.volunteer_schedules,
   public.transactions,
   public.notifications
to authenticated;

grant select
on public.churches,
   public.church_units,
   public.church_users,
   public.roles,
   public.permissions,
   public.role_permissions,
   public.audit_logs
to authenticated;
