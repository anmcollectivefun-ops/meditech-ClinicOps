create extension if not exists pgcrypto;

alter table public.b2b_applications
  add column if not exists patient_id uuid default gen_random_uuid();

update public.b2b_applications
set patient_id = gen_random_uuid()
where patient_id is null;

create index if not exists b2b_applications_patient_id_idx
  on public.b2b_applications (patient_id);

comment on column public.b2b_applications.patient_id is
  'Stable patient identifier used to connect intake submissions, appointments, QR access and the future patient portal.';
