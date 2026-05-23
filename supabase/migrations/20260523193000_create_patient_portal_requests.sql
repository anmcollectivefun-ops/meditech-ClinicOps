create table if not exists public.patient_portal_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  request_type text not null default 'post_treatment_question',
  subject text,
  message text not null,
  status text not null default 'new',
  response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patient_portal_requests
  add column if not exists patient_id uuid references public.patients(id) on delete cascade,
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null,
  add column if not exists request_type text not null default 'post_treatment_question',
  add column if not exists subject text,
  add column if not exists message text,
  add column if not exists status text not null default 'new',
  add column if not exists response text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.patient_portal_requests
  drop constraint if exists patient_portal_requests_type_check;

alter table public.patient_portal_requests
  add constraint patient_portal_requests_type_check
  check (request_type in ('post_treatment_question', 'appointment_request', 'followup_request', 'other'));

alter table public.patient_portal_requests
  drop constraint if exists patient_portal_requests_status_check;

alter table public.patient_portal_requests
  add constraint patient_portal_requests_status_check
  check (status in ('new', 'in_progress', 'answered', 'closed'));

alter table public.patient_consents
  add column if not exists answers jsonb;

create index if not exists patient_portal_requests_patient_id_idx
  on public.patient_portal_requests(patient_id);

create index if not exists patient_portal_requests_status_idx
  on public.patient_portal_requests(status);

create index if not exists patient_portal_requests_created_at_idx
  on public.patient_portal_requests(created_at desc);

alter table public.patient_portal_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_portal_requests'
      and policyname = 'patient_portal_requests_insert_public'
  ) then
    create policy "patient_portal_requests_insert_public"
      on public.patient_portal_requests
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_portal_requests'
      and policyname = 'patient_portal_requests_authenticated_all'
  ) then
    create policy "patient_portal_requests_authenticated_all"
      on public.patient_portal_requests
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
