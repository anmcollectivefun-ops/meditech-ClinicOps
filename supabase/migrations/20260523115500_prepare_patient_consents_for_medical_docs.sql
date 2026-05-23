create table if not exists public.patient_consents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  template_id uuid references public.medical_consent_templates(id) on delete set null,
  status text not null default 'pending',
  file_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.patient_consents
  add column if not exists template_id uuid references public.medical_consent_templates(id) on delete set null;

alter table public.patient_consents
  add column if not exists status text not null default 'pending';

alter table public.patient_consents
  add column if not exists file_url text;

alter table public.patient_consents
  add column if not exists signed_at timestamptz;

alter table public.patient_consents
  add column if not exists created_at timestamptz not null default now();

create index if not exists patient_consents_event_id_idx
  on public.patient_consents(event_id);

create index if not exists patient_consents_patient_id_idx
  on public.patient_consents(patient_id);

create index if not exists patient_consents_template_id_idx
  on public.patient_consents(template_id);

alter table public.patient_consents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_consents'
      and policyname = 'patient_consents_select_authenticated'
  ) then
    create policy "patient_consents_select_authenticated"
      on public.patient_consents
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_consents'
      and policyname = 'patient_consents_insert_authenticated'
  ) then
    create policy "patient_consents_insert_authenticated"
      on public.patient_consents
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_consents'
      and policyname = 'patient_consents_update_authenticated'
  ) then
    create policy "patient_consents_update_authenticated"
      on public.patient_consents
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;
