-- Privacy hardening for event registrations and volunteer schedules.
-- Keep self-service working while preventing cross-person and cross-tenant reads.

drop policy if exists "event registrations read" on public.event_registrations;
drop policy if exists "event registrations authorized read" on public.event_registrations;
drop policy if exists "event registrations manage" on public.event_registrations;
drop policy if exists "member event registration insert own" on public.event_registrations;

create policy "event registrations authorized read"
on public.event_registrations for select to authenticated
using (
  private.has_permission(church_id,'events.manage')
  or (
    member_id is not null
    and exists (
      select 1
      from public.church_members m
      where m.id = event_registrations.member_id
        and m.church_id = event_registrations.church_id
        and m.auth_user_id = (select auth.uid())
    )
  )
);

create policy "event registrations manage"
on public.event_registrations for all to authenticated
using (private.has_permission(church_id,'events.manage'))
with check (
  private.has_permission(church_id,'events.manage')
  and exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and e.church_id = event_registrations.church_id
  )
  and (
    event_registrations.member_id is null
    or exists (
      select 1 from public.church_members m
      where m.id = event_registrations.member_id
        and m.church_id = event_registrations.church_id
    )
  )
  and (
    event_registrations.visitor_id is null
    or exists (
      select 1 from public.visitors v
      where v.id = event_registrations.visitor_id
        and v.church_id = event_registrations.church_id
    )
  )
);

create policy "member event registration insert own"
on public.event_registrations for insert to authenticated
with check (
  member_id is not null
  and visitor_id is null
  and exists (
    select 1
    from public.church_members m
    where m.id = event_registrations.member_id
      and m.church_id = event_registrations.church_id
      and m.auth_user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.events e
    where e.id = event_registrations.event_id
      and e.church_id = event_registrations.church_id
      and e.status = 'published'
  )
);

drop policy if exists "schedules tenant read" on public.volunteer_schedules;
drop policy if exists "schedules authorized read" on public.volunteer_schedules;
drop policy if exists "schedules manage" on public.volunteer_schedules;
drop policy if exists "volunteer update own schedule" on public.volunteer_schedules;

create policy "schedules authorized read"
on public.volunteer_schedules for select to authenticated
using (
  private.has_permission(church_id,'ministries.manage')
  or exists (
    select 1
    from public.church_members m
    where m.id = volunteer_schedules.member_id
      and m.church_id = volunteer_schedules.church_id
      and m.auth_user_id = (select auth.uid())
  )
);

create policy "schedules manage"
on public.volunteer_schedules for all to authenticated
using (private.has_permission(church_id,'ministries.manage'))
with check (
  private.has_permission(church_id,'ministries.manage')
  and exists (
    select 1 from public.church_members m
    where m.id = volunteer_schedules.member_id
      and m.church_id = volunteer_schedules.church_id
  )
  and exists (
    select 1 from public.events e
    where e.id = volunteer_schedules.event_id
      and e.church_id = volunteer_schedules.church_id
  )
  and (
    volunteer_schedules.ministry_id is null
    or exists (
      select 1 from public.ministries mi
      where mi.id = volunteer_schedules.ministry_id
        and mi.church_id = volunteer_schedules.church_id
    )
  )
);

