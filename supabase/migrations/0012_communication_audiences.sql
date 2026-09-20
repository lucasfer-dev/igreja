-- Communication audience metadata for targeted in-app announcements.

alter table public.announcements
  add column if not exists audience_type text not null default 'church'
    check (audience_type in ('church','unit','cell','ministry','event','person')),
  add column if not exists audience_ref_id uuid;

create index if not exists announcements_church_audience_idx
  on public.announcements(church_id, audience_type, audience_ref_id, published_at desc);
