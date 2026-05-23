create extension if not exists pgcrypto;

create table if not exists public.event_partners (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  type text not null default 'speaker',
  first_name text,
  last_name text,
  title text,
  company text,
  bio text,
  photo_url text,
  website_url text,
  linkedin_url text,
  twitter_url text,
  sponsor_name text,
  sponsor_category text,
  sponsor_url text,
  logo_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_partners
  add column if not exists event_id uuid references public.b2b_events(id) on delete cascade,
  add column if not exists type text not null default 'speaker',
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists title text,
  add column if not exists company text,
  add column if not exists bio text,
  add column if not exists photo_url text,
  add column if not exists website_url text,
  add column if not exists linkedin_url text,
  add column if not exists twitter_url text,
  add column if not exists sponsor_name text,
  add column if not exists sponsor_category text,
  add column if not exists sponsor_url text,
  add column if not exists logo_url text,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_visible boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists event_partners_event_id_idx
  on public.event_partners(event_id);

create index if not exists event_partners_event_type_idx
  on public.event_partners(event_id, type);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  name text not null,
  type text not null default 'single',
  sessions_count integer not null default 1,
  doctor_id uuid references public.event_partners(id) on delete set null,
  preparation_id uuid references public.event_partners(id) on delete set null,
  room text,
  treatment_category text not null default 'standard',
  pre_recommendations text,
  post_recommendations text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.treatments
  add column if not exists event_id uuid references public.b2b_events(id) on delete cascade,
  add column if not exists name text,
  add column if not exists type text not null default 'single',
  add column if not exists sessions_count integer not null default 1,
  add column if not exists doctor_id uuid references public.event_partners(id) on delete set null,
  add column if not exists preparation_id uuid references public.event_partners(id) on delete set null,
  add column if not exists room text,
  add column if not exists treatment_category text not null default 'standard',
  add column if not exists pre_recommendations text,
  add column if not exists post_recommendations text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists treatments_event_id_idx
  on public.treatments(event_id);

create index if not exists treatments_event_active_idx
  on public.treatments(event_id, is_active);

create index if not exists treatments_doctor_id_idx
  on public.treatments(doctor_id);

create index if not exists treatments_preparation_id_idx
  on public.treatments(preparation_id);

create table if not exists public.treatment_consent_templates (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  template_id uuid not null references public.medical_consent_templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (treatment_id, template_id)
);

create index if not exists treatment_consent_templates_treatment_id_idx
  on public.treatment_consent_templates(treatment_id);

create index if not exists treatment_consent_templates_template_id_idx
  on public.treatment_consent_templates(template_id);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  treatment_id uuid references public.treatments(id) on delete set null,
  treatment_name text,
  doctor_id uuid references public.event_partners(id) on delete set null,
  appointment_date timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists event_id uuid references public.b2b_events(id) on delete cascade,
  add column if not exists patient_id uuid references public.patients(id) on delete cascade,
  add column if not exists treatment_id uuid references public.treatments(id) on delete set null,
  add column if not exists treatment_name text,
  add column if not exists doctor_id uuid references public.event_partners(id) on delete set null,
  add column if not exists appointment_date timestamptz,
  add column if not exists status text not null default 'scheduled',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists appointments_event_id_idx
  on public.appointments(event_id);

create index if not exists appointments_patient_id_idx
  on public.appointments(patient_id);

create index if not exists appointments_treatment_id_idx
  on public.appointments(treatment_id);

create index if not exists appointments_doctor_id_idx
  on public.appointments(doctor_id);

create index if not exists appointments_date_idx
  on public.appointments(appointment_date);

alter table public.patient_consents
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null;

create index if not exists patient_consents_appointment_id_idx
  on public.patient_consents(appointment_id);

alter table public.event_partners enable row level security;
alter table public.treatments enable row level security;
alter table public.treatment_consent_templates enable row level security;
alter table public.appointments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_partners'
      and policyname = 'event_partners_authenticated_all'
  ) then
    create policy "event_partners_authenticated_all"
      on public.event_partners
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'treatments'
      and policyname = 'treatments_authenticated_all'
  ) then
    create policy "treatments_authenticated_all"
      on public.treatments
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'treatment_consent_templates'
      and policyname = 'treatment_consent_templates_authenticated_all'
  ) then
    create policy "treatment_consent_templates_authenticated_all"
      on public.treatment_consent_templates
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'appointments_authenticated_all'
  ) then
    create policy "appointments_authenticated_all"
      on public.appointments
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;
