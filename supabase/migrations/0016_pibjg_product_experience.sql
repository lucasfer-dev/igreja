-- PIBJG product experience: connection card and pastoral care.
-- Keeps all public submissions server-side; no anonymous table grants are introduced.

alter table public.visitors
  add column if not exists birth_date date,
  add column if not exists visit_status text check (visit_status in ('first_time','returning')),
  add column if not exists location_status text check (location_status in ('local','other_city')),
  add column if not exists interests text[] not null default '{}',
  add column if not exists prayer_request text,
  add column if not exists lgpd_consent boolean not null default false,
  add column if not exists lgpd_consent_at timestamptz;

create table if not exists public.visitor_care_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  body text not null,
  status text not null default 'new' check (status in ('new','praying','following','completed')),
  confidential boolean not null default true,
  assigned_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visitors_church_stage_created_idx
  on public.visitors(church_id, stage, created_at desc);
create index if not exists visitor_care_church_status_idx
  on public.visitor_care_requests(church_id, status, created_at desc);
create index if not exists visitor_care_visitor_idx
  on public.visitor_care_requests(visitor_id);

insert into public.permissions(key, description) values
  ('care.read', 'Visualizar solicitações de cuidado e oração autorizadas'),
  ('care.manage', 'Gerenciar acompanhamento pastoral e pedidos de oração')
on conflict (key) do nothing;

insert into public.role_permissions(role_id, permission_key)
select r.id, p.key
from public.roles r
cross join (values ('care.read'),('care.manage')) as p(key)
where r.key in ('church_admin','pastor')
on conflict do nothing;

alter table public.visitor_care_requests enable row level security;

create policy "visitor care authorized read"
on public.visitor_care_requests for select to authenticated
using (
  private.has_permission(church_id,'care.read')
  or private.has_permission(church_id,'care.manage')
);

create policy "visitor care authorized manage"
on public.visitor_care_requests for all to authenticated
using (private.has_permission(church_id,'care.manage'))
with check (private.has_permission(church_id,'care.manage'));

create policy "prayer care authorized read"
on public.prayer_requests for select to authenticated
using (
  private.has_permission(church_id,'care.read')
  or private.has_permission(church_id,'care.manage')
);

create policy "prayer care authorized update"
on public.prayer_requests for update to authenticated
using (private.has_permission(church_id,'care.manage'))
with check (private.has_permission(church_id,'care.manage'));

grant select, insert, update, delete on public.visitor_care_requests to authenticated;

alter table public.news_posts
  add column if not exists category text not null default 'Igreja',
  add column if not exists audience text not null default 'members'
    check (audience in ('all','members','leadership'));

drop policy if exists "news tenant read" on public.news_posts;
create policy "news tenant read" on public.news_posts for select to authenticated
using (
  private.is_church_user(church_id)
  and published = true
  and published_at <= now()
  and (
    audience in ('all','members')
    or (audience = 'leadership' and private.has_permission(church_id,'communications.manage'))
  )
);
