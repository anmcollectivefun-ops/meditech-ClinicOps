alter table public.event_partners
  add column if not exists staff_role text,
  add column if not exists employment_type text,
  add column if not exists work_schedule jsonb not null default '{"days":[],"start":"","end":"","note":""}'::jsonb,
  add column if not exists absence_status text not null default 'available',
  add column if not exists absence_note text;

alter table public.event_partners
  drop constraint if exists event_partners_staff_role_check;

alter table public.event_partners
  add constraint event_partners_staff_role_check
  check (staff_role in ('doctor', 'nurse', 'reception', 'assistant', 'coordinator', 'manager', 'other'));

alter table public.event_partners
  drop constraint if exists event_partners_absence_status_check;

alter table public.event_partners
  add constraint event_partners_absence_status_check
  check (absence_status in ('available', 'vacation', 'sick_leave', 'duty'));

update public.event_partners
set staff_role = 'doctor'
where staff_role is null
  and type in ('speaker', 'doctor');

create index if not exists event_partners_staff_role_idx
  on public.event_partners(staff_role);

create index if not exists event_partners_absence_status_idx
  on public.event_partners(absence_status);
