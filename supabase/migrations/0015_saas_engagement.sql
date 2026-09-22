-- Product engagement layer: news and consent-based WhatsApp follow-up.
alter table public.visitors
  add column if not exists whatsapp_opt_in boolean not null default false,
  add column if not exists whatsapp_opt_in_at timestamptz;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  summary text,
  body text not null,
  cover_url text,
  featured boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_followup_rules (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  trigger_stage text not null check (trigger_stage in ('new','contacted','returned','integrated','member')),
  delay_hours integer not null default 0 check (delay_hours between 0 and 720),
  template_name text not null,
  language_code text not null default 'pt_BR',
  preview_text text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_outbox (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete cascade,
  rule_id uuid references public.whatsapp_followup_rules(id) on delete set null,
  to_phone text not null,
  template_name text not null,
  language_code text not null default 'pt_BR',
  scheduled_for timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','cancelled')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists news_posts_church_idx on public.news_posts(church_id,published_at desc);
create index if not exists whatsapp_rules_church_idx on public.whatsapp_followup_rules(church_id,active,trigger_stage);
create index if not exists whatsapp_outbox_due_idx on public.whatsapp_outbox(status,scheduled_for);

alter table public.news_posts enable row level security;
alter table public.whatsapp_followup_rules enable row level security;
alter table public.whatsapp_outbox enable row level security;

create policy "news tenant read" on public.news_posts for select to authenticated
using (private.is_church_user(church_id) and published=true);
create policy "news manage" on public.news_posts for all to authenticated
using (private.has_permission(church_id,'communications.manage'))
with check (private.has_permission(church_id,'communications.manage'));

create policy "whatsapp rules manage" on public.whatsapp_followup_rules for all to authenticated
using (private.has_permission(church_id,'communications.manage'))
with check (private.has_permission(church_id,'communications.manage'));

create policy "whatsapp outbox manage" on public.whatsapp_outbox for all to authenticated
using (private.has_permission(church_id,'communications.manage') or private.has_permission(church_id,'visitors.manage'))
with check (private.has_permission(church_id,'communications.manage') or private.has_permission(church_id,'visitors.manage'));

grant select,insert,update,delete on public.news_posts, public.whatsapp_followup_rules, public.whatsapp_outbox to authenticated;
