-- Targeted indexes for the highest-frequency tenant, authorization and operational queries.

create index if not exists church_users_user_status_church_idx
  on public.church_users(user_id, status, church_id);

create index if not exists church_members_auth_user_church_idx
  on public.church_members(auth_user_id, church_id)
  where auth_user_id is not null;

create index if not exists notifications_church_user_unread_idx
  on public.notifications(church_id, user_id, created_at desc)
  where read_at is null and archived_at is null;

create index if not exists volunteer_schedules_church_status_start_idx
  on public.volunteer_schedules(church_id, status, starts_at);

create index if not exists kids_checkins_church_open_idx
  on public.kids_checkins(church_id, checked_in_at desc)
  where checked_out_at is null;

create index if not exists event_registrations_church_event_idx
  on public.event_registrations(church_id, event_id);

create index if not exists attendances_church_event_occurred_idx
  on public.attendances(church_id, event_id, occurred_at desc);

create index if not exists donations_church_member_occurred_idx
  on public.donations(church_id, member_id, occurred_at desc);

create index if not exists chat_messages_church_room_created_idx
  on public.chat_messages(church_id, room_id, created_at desc);

create index if not exists visitor_contacts_church_visitor_idx
  on public.visitor_contacts(church_id, visitor_id);

create index if not exists ministry_members_member_ministry_idx
  on public.ministry_members(member_id, ministry_id);

create index if not exists cell_members_member_cell_idx
  on public.cell_members(member_id, cell_id);
