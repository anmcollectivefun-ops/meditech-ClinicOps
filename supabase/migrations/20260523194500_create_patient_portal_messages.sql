create table if not exists public.patient_portal_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.patient_portal_requests(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  sender_type text not null default 'patient',
  sender_name text,
  body text not null,
  is_ai_draft boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.patient_portal_messages
  add column if not exists request_id uuid references public.patient_portal_requests(id) on delete cascade,
  add column if not exists patient_id uuid references public.patients(id) on delete cascade,
  add column if not exists sender_type text not null default 'patient',
  add column if not exists sender_name text,
  add column if not exists body text,
  add column if not exists is_ai_draft boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table public.patient_portal_messages
  drop constraint if exists patient_portal_messages_sender_type_check;

alter table public.patient_portal_messages
  add constraint patient_portal_messages_sender_type_check
  check (sender_type in ('patient', 'staff', 'system'));

create index if not exists idx_patient_portal_messages_request_id
  on public.patient_portal_messages(request_id);

create index if not exists idx_patient_portal_messages_patient_id_created_at
  on public.patient_portal_messages(patient_id, created_at);

drop policy if exists "patient portal requests anon read" on public.patient_portal_requests;
create policy "patient portal requests anon read"
  on public.patient_portal_requests for select
  to anon
  using (true);

alter table public.patient_portal_messages enable row level security;

drop policy if exists "patient portal messages anon read" on public.patient_portal_messages;
create policy "patient portal messages anon read"
  on public.patient_portal_messages for select
  to anon
  using (true);

drop policy if exists "patient portal messages anon insert" on public.patient_portal_messages;
create policy "patient portal messages anon insert"
  on public.patient_portal_messages for insert
  to anon
  with check (sender_type = 'patient');

drop policy if exists "patient portal messages staff manage" on public.patient_portal_messages;
create policy "patient portal messages staff manage"
  on public.patient_portal_messages for all
  to authenticated
  using (true)
  with check (true);
