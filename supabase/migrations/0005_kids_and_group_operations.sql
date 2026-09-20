alter table public.kids_children
  add column if not exists photo_url text,
  add column if not exists medications text,
  add column if not exists restrictions text;

alter table public.kids_checkins
  add column if not exists room text,
  add column if not exists teacher_name text,
  add column if not exists checkout_guardian_id uuid references public.kids_guardians(id) on delete set null;

create index if not exists kids_checkins_checkout_guardian_idx on public.kids_checkins(checkout_guardian_id);
create index if not exists cell_members_member_idx on public.cell_members(member_id);
create index if not exists ministry_members_member_idx on public.ministry_members(member_id);
