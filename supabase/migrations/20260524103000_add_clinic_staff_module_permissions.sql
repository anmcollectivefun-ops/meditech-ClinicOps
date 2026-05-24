alter table public.event_staff_access
  add column if not exists can_view_patients boolean not null default true,
  add column if not exists can_view_appointments boolean not null default true,
  add column if not exists can_view_documents boolean not null default true,
  add column if not exists can_view_messages boolean not null default true,
  add column if not exists can_view_qr boolean not null default true,
  add column if not exists can_view_finance boolean not null default false,
  add column if not exists can_view_ai_analytics boolean not null default false,
  add column if not exists can_manage_settings boolean not null default false;

update public.event_staff_access
set
  can_view_patients = true,
  can_view_appointments = true,
  can_view_documents = true,
  can_view_messages = true,
  can_view_qr = true,
  can_view_finance = role = 'manager',
  can_view_ai_analytics = role = 'manager',
  can_manage_settings = role = 'manager'
where role is not null;
