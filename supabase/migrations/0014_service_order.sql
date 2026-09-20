-- Service order / order of worship.
insert into public.permissions(key, description) values
  ('service_order.read','Visualizar ordem do culto'),
  ('service_order.manage','Gerenciar ordem do culto')
on conflict (key) do nothing;

insert into public.role_permissions(role_id, permission_key)
select distinct rp.role_id, 'service_order.read'
from public.role_permissions rp
where rp.permission_key='worship.read'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_key)
select distinct rp.role_id, 'service_order.manage'
from public.role_permissions rp
where rp.permission_key='worship.manage'
on conflict do nothing;

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft','ready','live','completed')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_order_items (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  order_id uuid not null references public.service_orders(id) on delete cascade,
  position integer not null check (position > 0),
  item_type text not null default 'custom' check (item_type in (
    'opening','welcome','prayer','worship','offering','announcement',
    'sermon','communion','video','transition','closing','custom'
  )),
  title text not null,
  description text,
  planned_minutes integer check (planned_minutes is null or planned_minutes between 0 and 480),
  responsible_member_id uuid references public.church_members(id) on delete set null,
  song_id uuid references public.songs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(order_id, position)
);

create index if not exists service_orders_church_scheduled_idx
  on public.service_orders(church_id, scheduled_at desc);
create index if not exists service_orders_event_idx
  on public.service_orders(event_id);
create index if not exists service_orders_created_by_idx
  on public.service_orders(created_by);
create index if not exists service_order_items_church_idx
  on public.service_order_items(church_id);
create index if not exists service_order_items_order_position_idx
  on public.service_order_items(order_id, position);
create index if not exists service_order_items_responsible_idx
  on public.service_order_items(responsible_member_id);
create index if not exists service_order_items_song_idx
  on public.service_order_items(song_id);

alter table public.service_orders enable row level security;
alter table public.service_order_items enable row level security;

create policy "service orders read"
on public.service_orders for select to authenticated
using (private.has_permission(church_id,'service_order.read'));

create policy "service orders manage"
on public.service_orders for all to authenticated
using (private.has_permission(church_id,'service_order.manage'))
with check (private.has_permission(church_id,'service_order.manage'));

create policy "service order items read"
on public.service_order_items for select to authenticated
using (
  exists(
    select 1 from public.service_orders o
    where o.id=order_id
      and o.church_id=service_order_items.church_id
      and private.has_permission(o.church_id,'service_order.read')
  )
);

create policy "service order items manage"
on public.service_order_items for all to authenticated
using (
  exists(
    select 1 from public.service_orders o
    where o.id=order_id
      and o.church_id=service_order_items.church_id
      and private.has_permission(o.church_id,'service_order.manage')
  )
)
with check (
  exists(
    select 1 from public.service_orders o
    where o.id=order_id
      and o.church_id=service_order_items.church_id
      and private.has_permission(o.church_id,'service_order.manage')
  )
);

grant select,insert,update,delete on public.service_orders, public.service_order_items to authenticated;
