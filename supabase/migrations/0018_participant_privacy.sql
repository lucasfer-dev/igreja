-- Restrict operational participant data to managers or the authenticated person.
-- Members can still read their own event registration and volunteer schedule.

drop policy if exists "event registrations read" on public.event_registrations;
drop policy if exists "event registrations authorized read" on public.event_registrations;

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

drop policy if exists "schedules tenant read" on public.volunteer_schedules;
drop policy if exists "schedules authorized read" on public.volunteer_schedules;

create policy "schedules authorized read"
on public.volunteer_schedules for select to authenticated
using (
  private.has_permission(church_id,'ministries.manage')
  or (
    exists (
      select 1
      from public.church_members m
      where m.id = volunteer_schedules.member_id
        and m.church_id = volunteer_schedules.church_id
        and m.auth_user_id = (select auth.uid())
    )
  )
);
