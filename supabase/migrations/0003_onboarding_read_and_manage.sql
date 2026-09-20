-- Allow the authenticated creator to finish onboarding before church membership exists.

create policy "church creator read"
on public.churches for select to authenticated
using (created_by = (select auth.uid()));

create policy "units creator read"
on public.church_units for select to authenticated
using (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and c.created_by = (select auth.uid())
  )
);

create policy "units owner manage"
on public.church_units for update to authenticated
using (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and (c.created_by = (select auth.uid()) or private.has_permission(c.id, 'church.manage'))
  )
)
with check (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and (c.created_by = (select auth.uid()) or private.has_permission(c.id, 'church.manage'))
  )
);

create policy "roles creator read"
on public.roles for select to authenticated
using (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and c.created_by = (select auth.uid())
  )
);

create policy "roles owner manage"
on public.roles for update to authenticated
using (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and (c.created_by = (select auth.uid()) or private.has_permission(c.id, 'church.manage'))
  )
)
with check (
  exists (
    select 1 from public.churches c
    where c.id = church_id
      and (c.created_by = (select auth.uid()) or private.has_permission(c.id, 'church.manage'))
  )
);
