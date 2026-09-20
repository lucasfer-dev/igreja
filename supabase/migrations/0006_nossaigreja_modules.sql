-- Modules inspired by public church-management feature categories.

insert into public.permissions(key, description) values
  ('worship.read','Visualizar louvor e repertórios'),
  ('worship.manage','Gerenciar louvor e repertórios'),
  ('assets.read','Visualizar patrimônio'),
  ('assets.manage','Gerenciar patrimônio'),
  ('donations.read','Visualizar ofertas e doações'),
  ('donations.manage','Gerenciar ofertas e doações')
on conflict (key) do nothing;

insert into public.role_permissions(role_id, permission_key)
select r.id, p.key
from public.roles r
cross join public.permissions p
where r.key='church_admin'
  and p.key in ('worship.read','worship.manage','assets.read','assets.manage','donations.read','donations.manage')
on conflict do nothing;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  artist text,
  key text,
  lyrics text,
  chords text,
  link_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.worship_sets (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  notes text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.worship_set_songs (
  set_id uuid not null references public.worship_sets(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position integer not null default 0,
  transpose_to text,
  primary key (set_id, song_id)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid references public.church_units(id) on delete set null,
  name text not null,
  category text,
  serial_number text,
  location text,
  purchase_date date,
  purchase_value numeric(12,2),
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_campaigns (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  description text,
  goal_amount numeric(12,2),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  campaign_id uuid references public.donation_campaigns(id) on delete set null,
  member_id uuid references public.church_members(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'pix',
  anonymous boolean not null default false,
  status text not null default 'received',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists songs_church_idx on public.songs(church_id,title);
create index if not exists worship_sets_church_idx on public.worship_sets(church_id,scheduled_at);
create index if not exists assets_church_idx on public.assets(church_id,status);
create index if not exists donations_church_idx on public.donations(church_id,occurred_at desc);
create index if not exists donation_campaigns_church_idx on public.donation_campaigns(church_id,active);

alter table public.songs enable row level security;
alter table public.worship_sets enable row level security;
alter table public.worship_set_songs enable row level security;
alter table public.assets enable row level security;
alter table public.donation_campaigns enable row level security;
alter table public.donations enable row level security;

create policy "songs read" on public.songs for select to authenticated using (private.has_permission(church_id,'worship.read'));
create policy "songs manage" on public.songs for all to authenticated using (private.has_permission(church_id,'worship.manage')) with check (private.has_permission(church_id,'worship.manage'));

create policy "worship sets read" on public.worship_sets for select to authenticated using (private.has_permission(church_id,'worship.read'));
create policy "worship sets manage" on public.worship_sets for all to authenticated using (private.has_permission(church_id,'worship.manage')) with check (private.has_permission(church_id,'worship.manage'));

create policy "worship set songs read" on public.worship_set_songs for select to authenticated using (
  exists(select 1 from public.worship_sets s where s.id=set_id and private.has_permission(s.church_id,'worship.read'))
);
create policy "worship set songs manage" on public.worship_set_songs for all to authenticated using (
  exists(select 1 from public.worship_sets s where s.id=set_id and private.has_permission(s.church_id,'worship.manage'))
) with check (
  exists(select 1 from public.worship_sets s where s.id=set_id and private.has_permission(s.church_id,'worship.manage'))
);

create policy "assets read" on public.assets for select to authenticated using (private.has_permission(church_id,'assets.read'));
create policy "assets manage" on public.assets for all to authenticated using (private.has_permission(church_id,'assets.manage')) with check (private.has_permission(church_id,'assets.manage'));

create policy "campaigns tenant read" on public.donation_campaigns for select to authenticated using (private.is_church_user(church_id));
create policy "campaigns manage" on public.donation_campaigns for all to authenticated using (private.has_permission(church_id,'donations.manage')) with check (private.has_permission(church_id,'donations.manage'));

create policy "donations read" on public.donations for select to authenticated using (private.has_permission(church_id,'donations.read'));
create policy "donations manage" on public.donations for all to authenticated using (private.has_permission(church_id,'donations.manage')) with check (private.has_permission(church_id,'donations.manage'));

grant select,insert,update,delete on public.songs, public.worship_sets, public.worship_set_songs, public.assets, public.donation_campaigns, public.donations to authenticated;
