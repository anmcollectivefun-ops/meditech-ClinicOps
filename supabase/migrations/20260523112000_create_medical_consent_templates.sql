create table if not exists public.medical_consent_templates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.b2b_events(id) on delete cascade,
  title text not null,
  description text,
  document_type text not null default 'consent',
  required_for_treatment text,
  validity_months integer,
  version integer not null default 1,
  is_global_required boolean not null default false,
  is_active boolean not null default true,
  content_template text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medical_consent_templates_event_id_idx
  on public.medical_consent_templates(event_id);

create index if not exists medical_consent_templates_event_active_idx
  on public.medical_consent_templates(event_id, is_active);

alter table public.medical_consent_templates enable row level security;

create policy "medical_consent_templates_select_authenticated"
  on public.medical_consent_templates
  for select
  to authenticated
  using (true);

create policy "medical_consent_templates_insert_authenticated"
  on public.medical_consent_templates
  for insert
  to authenticated
  with check (true);

create policy "medical_consent_templates_update_authenticated"
  on public.medical_consent_templates
  for update
  to authenticated
  using (true)
  with check (true);

