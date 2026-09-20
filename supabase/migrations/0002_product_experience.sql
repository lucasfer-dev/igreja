-- Product experience: onboarding, member portal, communications and safer self-service.

alter table public.churches
  add column if not exists created_by uuid references auth.users(id) on delete set null;

insert into public.permissions(key, description) values
  ('church.manage', 'Gerenciar dados e configurações da igreja'),
  ('communications.manage', 'Gerenciar avisos e comunicação'),
  ('kids.read', 'Visualizar crianças e check-ins'),
  ('kids.manage', 'Gerenciar crianças e check-ins')
on conflict (key) do nothing;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'all',
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  is_private boolean not null default true,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists public.kids_children (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  full_name text not null,
  birth_date date,
  guardian_name text not null,
  guardian_phone text,
  allergies text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.kids_checkins (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  child_id uuid not null references public.kids_children(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  security_code text not null,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  checked_in_by uuid references auth.users(id) on delete set null
);

create index if not exists announcements_church_published_idx on public.announcements(church_id, published_at desc);
create index if not exists prayer_requests_user_idx on public.prayer_requests(user_id, created_at desc);
create index if not exists kids_children_church_idx on public.kids_children(church_id, active);
create index if not exists kids_checkins_church_idx on public.kids_checkins(church_id, checked_in_at desc);

alter table public.announcements enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.kids_children enable row level security;
alter table public.kids_checkins enable row level security;

drop policy if exists "profile self insert" on public.profiles;
create policy "profile self insert"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "church onboarding insert" on public.churches;
create policy "church onboarding insert"
on public.churches for insert to authenticated
with check (
  created_by = (select auth.uid())
  and not exists (
    select 1 from public.church_users cu
    where cu.user_id = (select auth.uid())
      and cu.status = 'active'
  )
);

drop policy if exists "church owner update" on public.churches;
create policy "church owner update"
on public.churches for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_permission(id, 'church.manage')
)
with check (
  created_by = (select auth.uid())
  or private.has_permission(id, 'church.manage')
);

drop policy if exists "units onboarding insert" on public.church_units;
create policy "units onboarding insert"
on public.church_units for insert to authenticated
with check (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and c.created_by = (select auth.uid())
  )
);

drop policy if exists "roles onboarding insert" on public.roles;
create policy "roles onboarding insert"
on public.roles for insert to authenticated
with check (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and c.created_by = (select auth.uid())
  )
);

drop policy if exists "role permissions onboarding insert" on public.role_permissions;
create policy "role permissions onboarding insert"
on public.role_permissions for insert to authenticated
with check (
  exists (
    select 1
    from public.roles r
    join public.churches c on c.id = r.church_id
    where r.id = role_id
      and c.created_by = (select auth.uid())
  )
);

drop policy if exists "church users onboarding insert" on public.church_users;
create policy "church users onboarding insert"
on public.church_users for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.churches c
    where c.id = church_id
      and c.created_by = (select auth.uid())
  )
);

drop policy if exists "members self read" on public.church_members;
create policy "members self read"
on public.church_members for select to authenticated
using (
  auth_user_id = (select auth.uid())
  and private.is_church_user(church_id)
);

drop policy if exists "events church user read" on public.events;
create policy "events church user read"
on public.events for select to authenticated
using (private.is_church_user(church_id));

create policy "announcements tenant read"
on public.announcements for select to authenticated
using (private.is_church_user(church_id) and published = true);

create policy "announcements manage"
on public.announcements for all to authenticated
using (private.has_permission(church_id, 'communications.manage'))
with check (private.has_permission(church_id, 'communications.manage'));

create policy "prayer own read"
on public.prayer_requests for select to authenticated
using (user_id = (select auth.uid()) and private.is_church_user(church_id));

create policy "prayer own insert"
on public.prayer_requests for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_church_user(church_id));

create policy "kids read"
on public.kids_children for select to authenticated
using (private.has_permission(church_id, 'kids.read'));

create policy "kids manage"
on public.kids_children for all to authenticated
using (private.has_permission(church_id, 'kids.manage'))
with check (private.has_permission(church_id, 'kids.manage'));

create policy "kids checkins read"
on public.kids_checkins for select to authenticated
using (private.has_permission(church_id, 'kids.read'));

create policy "kids checkins manage"
on public.kids_checkins for all to authenticated
using (private.has_permission(church_id, 'kids.manage'))
with check (private.has_permission(church_id, 'kids.manage'));

grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert on public.prayer_requests to authenticated;
grant select, insert, update, delete on public.kids_children, public.kids_checkins to authenticated;
grant insert, update on public.churches to authenticated;
grant insert on public.church_units, public.roles, public.role_permissions, public.church_users to authenticated;
grant insert on public.profiles to authenticated;
