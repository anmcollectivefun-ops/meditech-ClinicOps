create table if not exists public.patient_clinical_notes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  doctor_id uuid references public.event_partners(id) on delete set null,
  treatment_id uuid references public.treatments(id) on delete set null,
  record_type text not null default 'visit_note',
  procedure_performed text,
  recommendations text,
  medications text,
  preparations_used text,
  doctor_notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patient_clinical_notes
  add column if not exists event_id uuid references public.b2b_events(id) on delete cascade,
  add column if not exists patient_id uuid references public.patients(id) on delete cascade,
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null,
  add column if not exists doctor_id uuid references public.event_partners(id) on delete set null,
  add column if not exists treatment_id uuid references public.treatments(id) on delete set null,
  add column if not exists record_type text not null default 'visit_note',
  add column if not exists procedure_performed text,
  add column if not exists recommendations text,
  add column if not exists medications text,
  add column if not exists preparations_used text,
  add column if not exists doctor_notes text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.patient_clinical_notes
  drop constraint if exists patient_clinical_notes_record_type_check;

alter table public.patient_clinical_notes
  add constraint patient_clinical_notes_record_type_check
  check (record_type in ('visit_note', 'procedure', 'recommendation', 'prescription', 'followup'));

create index if not exists patient_clinical_notes_event_id_idx
  on public.patient_clinical_notes(event_id);

create index if not exists patient_clinical_notes_patient_id_created_at_idx
  on public.patient_clinical_notes(patient_id, created_at desc);

create index if not exists patient_clinical_notes_appointment_id_idx
  on public.patient_clinical_notes(appointment_id);

create index if not exists patient_clinical_notes_doctor_id_idx
  on public.patient_clinical_notes(doctor_id);

alter table public.patient_clinical_notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_clinical_notes'
      and policyname = 'patient_clinical_notes_authenticated_all'
  ) then
    create policy "patient_clinical_notes_authenticated_all"
      on public.patient_clinical_notes
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
