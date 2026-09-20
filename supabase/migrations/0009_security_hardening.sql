-- Security hardening: explicit reports permission and scoped chat membership.
-- Keeps community rooms available to the whole church while restricting
-- cell/ministry/event rooms to explicit participants or communications managers.

insert into public.permissions(key, description) values
  ('reports.read', 'Visualizar relatórios e indicadores consolidados')
on conflict (key) do nothing;

insert into public.role_permissions(role_id, permission_key)
select r.id, 'reports.read'
from public.roles r
where r.key = 'church_admin'
on conflict do nothing;

alter table public.chat_rooms
  add constraint chat_rooms_id_church_unique unique (id, church_id);

create table if not exists public.chat_room_members (
  church_id uuid not null references public.churches(id) on delete cascade,
  room_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (room_id, user_id),
  foreign key (room_id, church_id)
    references public.chat_rooms(id, church_id)
    on delete cascade
);

create index if not exists chat_room_members_user_idx
  on public.chat_room_members(user_id, room_id);

create index if not exists chat_room_members_church_idx
  on public.chat_room_members(church_id, room_id);

alter table public.chat_room_members enable row level security;

drop policy if exists "chat rooms tenant read" on public.chat_rooms;
create policy "chat rooms authorized read"
on public.chat_rooms for select to authenticated
using (
  private.is_church_user(church_id)
  and (
    room_type = 'community'
    or private.has_permission(church_id, 'communications.manage')
    or exists (
      select 1
      from public.chat_room_members crm
      where crm.room_id = chat_rooms.id
        and crm.church_id = chat_rooms.church_id
        and crm.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "chat messages tenant read" on public.chat_messages;
create policy "chat messages authorized read"
on public.chat_messages for select to authenticated
using (
  private.is_church_user(church_id)
  and exists (
    select 1
    from public.chat_rooms r
    where r.id = chat_messages.room_id
      and r.church_id = chat_messages.church_id
      and (
        r.room_type = 'community'
        or private.has_permission(r.church_id, 'communications.manage')
        or exists (
          select 1
          from public.chat_room_members crm
          where crm.room_id = r.id
            and crm.church_id = r.church_id
            and crm.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "chat messages tenant insert" on public.chat_messages;
create policy "chat messages authorized insert"
on public.chat_messages for insert to authenticated
with check (
  sender_user_id = (select auth.uid())
  and private.is_church_user(church_id)
  and exists (
    select 1
    from public.chat_rooms r
    where r.id = chat_messages.room_id
      and r.church_id = chat_messages.church_id
      and (
        r.room_type = 'community'
        or private.has_permission(r.church_id, 'communications.manage')
        or exists (
          select 1
          from public.chat_room_members crm
          where crm.room_id = r.id
            and crm.church_id = r.church_id
            and crm.user_id = (select auth.uid())
        )
      )
  )
);

create policy "chat room members self read"
on public.chat_room_members for select to authenticated
using (
  user_id = (select auth.uid())
  and private.is_church_user(church_id)
);

create policy "chat room members manage"
on public.chat_room_members for all to authenticated
using (private.has_permission(church_id, 'communications.manage'))
with check (
  private.has_permission(church_id, 'communications.manage')
  and exists (
    select 1
    from public.church_users cu
    where cu.church_id = chat_room_members.church_id
      and cu.user_id = chat_room_members.user_id
      and cu.status = 'active'
  )
);

grant select, insert, update, delete on public.chat_room_members to authenticated;

create or replace function private.touch_chat_room()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_rooms
  set last_message_at = new.created_at
  where id = new.room_id
    and church_id = new.church_id;
  return new;
end;
$$;

revoke all on function private.touch_chat_room() from public, anon, authenticated;
