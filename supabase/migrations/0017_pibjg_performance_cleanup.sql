-- Follow-up performance/security-policy cleanup after product experience rollout.

create index if not exists news_posts_created_by_idx
  on public.news_posts(created_by);
create index if not exists visitor_care_assigned_user_idx
  on public.visitor_care_requests(assigned_user_id);
create index if not exists whatsapp_rules_created_by_idx
  on public.whatsapp_followup_rules(created_by);
create index if not exists whatsapp_outbox_church_idx
  on public.whatsapp_outbox(church_id);
create index if not exists whatsapp_outbox_rule_idx
  on public.whatsapp_outbox(rule_id);
create index if not exists whatsapp_outbox_visitor_idx
  on public.whatsapp_outbox(visitor_id);

drop policy if exists "visitor care authorized read" on public.visitor_care_requests;
drop policy if exists "visitor care authorized manage" on public.visitor_care_requests;

create policy "visitor care authorized read"
on public.visitor_care_requests for select to authenticated
using (
  private.has_permission(church_id,'care.read')
  or private.has_permission(church_id,'care.manage')
);

create policy "visitor care authorized insert"
on public.visitor_care_requests for insert to authenticated
with check (private.has_permission(church_id,'care.manage'));

create policy "visitor care authorized update"
on public.visitor_care_requests for update to authenticated
using (private.has_permission(church_id,'care.manage'))
with check (private.has_permission(church_id,'care.manage'));

create policy "visitor care authorized delete"
on public.visitor_care_requests for delete to authenticated
using (private.has_permission(church_id,'care.manage'));

drop policy if exists "prayer own read" on public.prayer_requests;
drop policy if exists "prayer care authorized read" on public.prayer_requests;

create policy "prayer authorized read"
on public.prayer_requests for select to authenticated
using (
  (
    user_id = (select auth.uid())
    and private.is_church_user(church_id)
  )
  or private.has_permission(church_id,'care.read')
  or private.has_permission(church_id,'care.manage')
);

drop policy if exists "news manage" on public.news_posts;
drop policy if exists "news tenant read" on public.news_posts;

create policy "news authorized read"
on public.news_posts for select to authenticated
using (
  private.has_permission(church_id,'communications.manage')
  or (
    private.is_church_user(church_id)
    and published = true
    and published_at <= now()
    and audience in ('all','members')
  )
);

create policy "news manage insert"
on public.news_posts for insert to authenticated
with check (private.has_permission(church_id,'communications.manage'));

create policy "news manage update"
on public.news_posts for update to authenticated
using (private.has_permission(church_id,'communications.manage'))
with check (private.has_permission(church_id,'communications.manage'));

create policy "news manage delete"
on public.news_posts for delete to authenticated
using (private.has_permission(church_id,'communications.manage'));
