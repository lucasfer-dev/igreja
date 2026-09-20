-- Giving and worship workflow refinement.
alter table public.donations
  add column if not exists fund text not null default 'Geral',
  add column if not exists notes text;

alter table public.songs
  add column if not exists bpm integer check (bpm is null or bpm between 20 and 300),
  add column if not exists meter text,
  add column if not exists category text,
  add column if not exists duration_seconds integer check (duration_seconds is null or duration_seconds >= 0);

alter table public.worship_sets
  add column if not exists leader_member_id uuid references public.church_members(id) on delete set null,
  add column if not exists rehearsal_at timestamptz,
  add column if not exists status text not null default 'draft'
    check (status in ('draft','ready','completed'));

alter table public.worship_set_songs
  add column if not exists notes text;

create index if not exists donations_church_fund_idx on public.donations(church_id,fund,occurred_at desc);
create index if not exists songs_church_category_idx on public.songs(church_id,category);
create index if not exists worship_sets_leader_idx on public.worship_sets(leader_member_id);

create policy "donations member own read"
on public.donations for select to authenticated
using (
  exists (
    select 1 from public.church_members m
    where m.id=donations.member_id
      and m.church_id=donations.church_id
      and m.auth_user_id=(select auth.uid())
  )
);

create policy "donations member own insert"
on public.donations for insert to authenticated
with check (
  exists (
    select 1 from public.church_members m
    where m.id=donations.member_id
      and m.church_id=donations.church_id
      and m.auth_user_id=(select auth.uid())
  )
);
