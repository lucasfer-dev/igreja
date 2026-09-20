-- Engagement and operations expansion.

alter table public.church_members
  add column if not exists photo_url text,
  add column if not exists address text,
  add column if not exists marital_status text,
  add column if not exists profession text,
  add column if not exists gender text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text;

insert into public.permissions(key, description) values
  ('feed.read', 'Visualizar mural da igreja'),
  ('feed.manage', 'Gerenciar mural da igreja'),
  ('content.read', 'Visualizar biblioteca de conteúdos'),
  ('content.manage', 'Gerenciar biblioteca de conteúdos')
on conflict (key) do nothing;

insert into public.role_permissions(role_id, permission_key)
select r.id, p.key
from public.roles r
cross join public.permissions p
where r.key = 'church_admin'
  and p.key in ('feed.read','feed.manage','content.read','content.manage')
on conflict do nothing;

create table if not exists public.member_history (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  member_id uuid not null references public.church_members(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  title text,
  body text not null,
  media_url text,
  post_type text not null default 'post',
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.content_library (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  description text,
  category text,
  content_type text not null default 'article',
  url text,
  media_url text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.kids_guardians (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  child_id uuid not null references public.kids_children(id) on delete cascade,
  full_name text not null,
  phone text,
  relationship text,
  can_pickup boolean not null default true,
  document_hint text,
  created_at timestamptz not null default now()
);

create index if not exists member_history_member_idx on public.member_history(member_id, occurred_at desc);
create index if not exists posts_church_idx on public.posts(church_id, published_at desc);
create index if not exists content_library_church_idx on public.content_library(church_id, published_at desc);
create index if not exists kids_guardians_child_idx on public.kids_guardians(child_id);
create index if not exists church_members_birth_idx on public.church_members(church_id, birth_date);
create index if not exists event_registrations_event_idx on public.event_registrations(event_id);
create index if not exists attendances_church_occurred_idx on public.attendances(church_id, occurred_at desc);

alter table public.member_history enable row level security;
alter table public.posts enable row level security;
alter table public.content_library enable row level security;
alter table public.kids_guardians enable row level security;

create policy "member history read"
on public.member_history for select to authenticated
using (private.has_permission(church_id, 'members.read'));

create policy "member history manage"
on public.member_history for all to authenticated
using (private.has_permission(church_id, 'members.update'))
with check (private.has_permission(church_id, 'members.update'));

create policy "posts tenant read"
on public.posts for select to authenticated
using (private.is_church_user(church_id) and published = true);

create policy "posts manage"
on public.posts for all to authenticated
using (private.has_permission(church_id, 'feed.manage'))
with check (private.has_permission(church_id, 'feed.manage'));

create policy "content tenant read"
on public.content_library for select to authenticated
using (private.is_church_user(church_id) and published = true);

create policy "content manage"
on public.content_library for all to authenticated
using (private.has_permission(church_id, 'content.manage'))
with check (private.has_permission(church_id, 'content.manage'));

create policy "kids guardians read"
on public.kids_guardians for select to authenticated
using (private.has_permission(church_id, 'kids.read'));

create policy "kids guardians manage"
on public.kids_guardians for all to authenticated
using (private.has_permission(church_id, 'kids.manage'))
with check (private.has_permission(church_id, 'kids.manage'));

create policy "member event registration read own"
on public.event_registrations for select to authenticated
using (
  exists (
    select 1 from public.church_members m
    where m.id = member_id
      and m.auth_user_id = (select auth.uid())
      and m.church_id = event_registrations.church_id
  )
);

create policy "member event registration insert own"
on public.event_registrations for insert to authenticated
with check (
  exists (
    select 1 from public.church_members m
    where m.id = member_id
      and m.auth_user_id = (select auth.uid())
      and m.church_id = event_registrations.church_id
  )
);

create policy "volunteer update own schedule"
on public.volunteer_schedules for update to authenticated
using (
  exists (
    select 1 from public.church_members m
    where m.id = member_id
      and m.auth_user_id = (select auth.uid())
      and m.church_id = volunteer_schedules.church_id
  )
)
with check (
  exists (
    select 1 from public.church_members m
    where m.id = member_id
      and m.auth_user_id = (select auth.uid())
      and m.church_id = volunteer_schedules.church_id
  )
);

create policy "notifications communication insert"
on public.notifications for insert to authenticated
with check (
  private.has_permission(church_id, 'communications.manage')
  and exists (
    select 1 from public.church_users cu
    where cu.church_id = notifications.church_id
      and cu.user_id = notifications.user_id
      and cu.status = 'active'
  )
);

grant select, insert, update, delete on public.member_history to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.content_library to authenticated;
grant select, insert, update, delete on public.kids_guardians to authenticated;
grant insert on public.event_registrations to authenticated;
grant insert on public.notifications to authenticated;
