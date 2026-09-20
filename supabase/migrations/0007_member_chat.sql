-- Member app community chat foundation.
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  description text,
  room_type text not null default 'community' check (room_type in ('community','cell','ministry','event')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists chat_rooms_church_last_idx on public.chat_rooms(church_id,last_message_at desc);
create index if not exists chat_messages_room_created_idx on public.chat_messages(room_id,created_at desc);
create index if not exists chat_messages_sender_idx on public.chat_messages(sender_user_id);

alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

create policy "chat rooms tenant read" on public.chat_rooms for select to authenticated
using (private.is_church_user(church_id));

create policy "chat rooms manage" on public.chat_rooms for insert to authenticated
with check (private.has_permission(church_id,'communications.manage') and created_by=(select auth.uid()));

create policy "chat rooms update manage" on public.chat_rooms for update to authenticated
using (private.has_permission(church_id,'communications.manage'))
with check (private.has_permission(church_id,'communications.manage'));

create policy "chat messages tenant read" on public.chat_messages for select to authenticated
using (
  private.is_church_user(church_id)
  and exists (
    select 1 from public.chat_rooms r
    where r.id=room_id and r.church_id=chat_messages.church_id
  )
);

create policy "chat messages tenant insert" on public.chat_messages for insert to authenticated
with check (
  private.is_church_user(church_id)
  and sender_user_id=(select auth.uid())
  and exists (
    select 1 from public.chat_rooms r
    where r.id=room_id and r.church_id=chat_messages.church_id
  )
);

grant select,insert,update on public.chat_rooms to authenticated;
grant select,insert on public.chat_messages to authenticated;

create or replace function private.touch_chat_room()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.chat_rooms
  set last_message_at = new.created_at
  where id = new.room_id and church_id = new.church_id;
  return new;
end;
$$;

revoke all on function private.touch_chat_room() from public, anon, authenticated;

create trigger chat_messages_touch_room
after insert on public.chat_messages
for each row execute function private.touch_chat_room();

insert into public.chat_rooms(church_id,name,description,room_type,created_by)
select c.id,'Comunidade','Conversa geral da igreja','community',cu.user_id
from public.churches c
join lateral (
  select user_id from public.church_users
  where church_id=c.id and status='active'
  order by created_at asc limit 1
) cu on true
where not exists (
  select 1 from public.chat_rooms r
  where r.church_id=c.id and r.room_type='community' and r.name='Comunidade'
);
