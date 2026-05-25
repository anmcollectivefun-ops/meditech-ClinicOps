-- ClinicOps demo seed
-- Event / clinic demo:
-- fc42d456-d5e2-4731-9e09-4bd1ab569bc9
--
-- Jak użyć:
-- 1. Otwórz Supabase SQL Editor.
-- 2. Wklej cały plik.
-- 3. Uruchom.
--
-- Seed korzysta z istniejących pacjentów z tabeli public.patients.
-- Nie tworzy prawdziwych danych osobowych. Zakłada, że masz już 20-30 fikcyjnych pacjentów.

begin;

create extension if not exists pgcrypto;

-- Urealniamy stare ograniczenie typu partnera, jeśli zostało po wersji eventowej.
alter table public.event_partners
  drop constraint if exists event_partners_type_check;

alter table public.event_partners
  add constraint event_partners_type_check
  check (type in ('speaker', 'sponsor', 'doctor', 'preparation', 'partner', 'staff'));

-- Tabela historii komunikacji, jeśli nie została jeszcze utworzona.
create table if not exists public.patient_communication_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.b2b_events(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  treatment_id uuid references public.treatments(id) on delete set null,
  channel text default 'portal',
  direction text default 'outgoing',
  subject text,
  message text not null,
  status text default 'draft',
  communication_goal text default 'followup',
  ai_suggested boolean default false,
  replied_at timestamptz,
  converted_to_appointment boolean default false,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists patient_communication_logs_event_id_idx
  on public.patient_communication_logs(event_id);

create index if not exists patient_communication_logs_patient_id_created_at_idx
  on public.patient_communication_logs(patient_id, created_at desc);

alter table public.patient_communication_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_communication_logs'
      and policyname = 'patient_communication_logs_authenticated_all'
  ) then
    create policy "patient_communication_logs_authenticated_all"
      on public.patient_communication_logs
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Lekarze i personel demo.
insert into public.event_partners (
  event_id, type, first_name, last_name, title, company, bio, display_order,
  is_visible, staff_role, employment_type, work_schedule, absence_status
)
select *
from (
  values
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'doctor', 'Anna', 'Kowalska',
      'lek. med. dermatolog, medycyna estetyczna', 'ClinicOps Demo',
      'Specjalistka dermatologii i medycyny estetycznej. W demo prowadzi pacjentów wymagających konsultacji, kwalifikacji zabiegowej i kontroli efektów.',
      1, true, 'doctor', 'contract',
      '{"days":["monday","tuesday","thursday"],"start":"09:00","end":"15:00","note":"Konsultacje, toksyna botulinowa, skin quality"}'::jsonb,
      'available'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'doctor', 'Dawid', 'Kowalski',
      'lek. med. ginekolog, laseroterapia', 'ClinicOps Demo',
      'Lekarz prowadzący konsultacje zabiegowe, laseroterapię oraz procedury regeneracyjne. Przykładowy profil do grafiku i przypisywania wizyt.',
      2, true, 'doctor', 'contract',
      '{"days":["wednesday","friday"],"start":"12:00","end":"20:00","note":"Laseroterapia, konsultacje kontrolne"}'::jsonb,
      'available'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'doctor', 'Marta', 'Zielińska',
      'lek. med. chirurgia estetyczna', 'ClinicOps Demo',
      'Specjalistka od procedur modelujących i planów zabiegowych. W demo pokazuje przypisanie lekarza do procedur premium.',
      3, true, 'doctor', 'contract',
      '{"days":["tuesday","wednesday","saturday"],"start":"10:00","end":"16:00","note":"Konsultacje, modelowanie, kontrole"}'::jsonb,
      'available'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'staff', 'Karolina', 'Nowak',
      'Koordynatorka recepcji', 'ClinicOps Demo',
      'Osoba odpowiedzialna za pierwszy kontakt, komunikację z pacjentem, dokumenty i follow-up.',
      4, true, 'reception', 'full_time',
      '{"days":["monday","tuesday","wednesday","thursday","friday"],"start":"08:00","end":"16:00","note":"Recepcja, portal pacjenta, zgody"}'::jsonb,
      'available'
    )
) as rows (
  event_id, type, first_name, last_name, title, company, bio, display_order,
  is_visible, staff_role, employment_type, work_schedule, absence_status
)
where not exists (
  select 1
  from public.event_partners ep
  where ep.event_id = rows.event_id
    and ep.first_name = rows.first_name
    and ep.last_name = rows.last_name
    and ep.staff_role = rows.staff_role
);

-- Preparaty i magazyn demo.
insert into public.event_partners (
  event_id, type, sponsor_name, sponsor_category, first_name, title, company,
  bio, display_order, is_visible, unit_price, currency, stock_quantity,
  low_stock_threshold, storage_location, supplier_name, expiry_date
)
select *
from (
  values
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'preparation',
      'Hyaluron Soft Lift 1 ml', 'wypełniacz / kwas hialuronowy',
      'Hyaluron Soft Lift 1 ml', 'wypełniacz / kwas hialuronowy', 'MediSupply Demo',
      'Preparat demonstracyjny do procedur modelowania ust i delikatnej wolumetrii. Używany w demo do przypisywania materiałów do zabiegów.',
      10, true, 420.00, 'PLN', 18, 5, 'Lodówka A / półka 2', 'MediSupply Demo', (current_date + interval '14 months')::date
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'preparation',
      'Botulinum Demo 100 j.', 'toksyna botulinowa',
      'Botulinum Demo 100 j.', 'toksyna botulinowa', 'Aesthetic Pharma Demo',
      'Preparat demonstracyjny do procedur mimicznych. Dane magazynowe są fikcyjne i służą prezentacji modułu stanów magazynowych.',
      11, true, 690.00, 'PLN', 9, 3, 'Lodówka B / sejf medyczny', 'Aesthetic Pharma Demo', (current_date + interval '10 months')::date
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'preparation',
      'Skin Booster HA Complex', 'skin quality / mezoterapia',
      'Skin Booster HA Complex', 'skin quality / mezoterapia', 'DermaLab Demo',
      'Preparat demonstracyjny do poprawy jakości skóry, mezoterapii i planów serii zabiegowej.',
      12, true, 310.00, 'PLN', 24, 6, 'Magazyn zabiegowy / szafka 3', 'DermaLab Demo', (current_date + interval '18 months')::date
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid, 'preparation',
      'LaserGel Cooling', 'materiał pomocniczy',
      'LaserGel Cooling', 'materiał pomocniczy', 'LaserMed Demo',
      'Materiał pomocniczy do procedur laserowych. Pokazuje alerty niskiego stanu i koszty materiałowe.',
      13, true, 85.00, 'PLN', 4, 5, 'Gabinet laserowy', 'LaserMed Demo', (current_date + interval '8 months')::date
    )
) as rows (
  event_id, type, sponsor_name, sponsor_category, first_name, title, company,
  bio, display_order, is_visible, unit_price, currency, stock_quantity,
  low_stock_threshold, storage_location, supplier_name, expiry_date
)
where not exists (
  select 1
  from public.event_partners ep
  where ep.event_id = rows.event_id
    and ep.type = 'preparation'
    and ep.sponsor_name = rows.sponsor_name
);

-- Szablony dokumentów demo.
insert into public.medical_consent_templates (
  event_id, title, description, document_type, required_for_treatment,
  validity_months, version, is_global_required, is_active, content_template
)
select *
from (
  values
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
      'RODO i zgoda na przetwarzanie danych medycznych',
      'Dokument wymagany dla każdego pacjenta przed obsługą w portalu i gabinecie.',
      'rodo', 'global', 24, 1, true, true,
      'Pacjent potwierdza zapoznanie się z informacją o przetwarzaniu danych osobowych i danych medycznych w celach obsługi wizyty.'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
      'Wywiad medyczny przed zabiegiem',
      'Kwestionariusz kwalifikacyjny przed procedurami estetycznymi.',
      'questionnaire', 'global', 6, 1, true, true,
      '[{"question":"Czy występują choroby przewlekłe?","type":"textarea"},{"question":"Czy przyjmuje Pani/Pan leki przeciwkrzepliwe?","type":"yes_no"},{"question":"Czy występują alergie?","type":"textarea"}]'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
      'Świadoma zgoda na zabieg z użyciem toksyny botulinowej',
      'Zgoda zabiegowa dla procedur toksyny botulinowej.',
      'consent', 'botox', 6, 1, false, true,
      'Pacjent potwierdza omówienie wskazań, przeciwwskazań, możliwych działań niepożądanych oraz zaleceń po zabiegu.'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
      'Świadoma zgoda na zabieg z użyciem kwasu hialuronowego',
      'Zgoda zabiegowa dla modelowania ust i wolumetrii.',
      'consent', 'filler', 6, 1, false, true,
      'Pacjent potwierdza kwalifikację do zabiegu, omówienie ryzyk oraz zaleceń pozabiegowych.'
    ),
    (
      'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
      'Zalecenia po zabiegu medycyny estetycznej',
      'Uniwersalne zalecenia widoczne w Portalu Pacjenta po wykonanej procedurze.',
      'info', 'aftercare', 3, 1, false, true,
      'Po zabiegu należy stosować się do zaleceń personelu, obserwować miejsce zabiegowe i skontaktować się z kliniką w razie niepokojących objawów.'
    )
) as rows (
  event_id, title, description, document_type, required_for_treatment,
  validity_months, version, is_global_required, is_active, content_template
)
where not exists (
  select 1
  from public.medical_consent_templates mct
  where mct.event_id = rows.event_id
    and mct.title = rows.title
);

-- Zabiegi demo.
with doctors as (
  select id, first_name, last_name
  from public.event_partners
  where event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
    and staff_role = 'doctor'
),
preps as (
  select id, sponsor_name
  from public.event_partners
  where event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
    and type = 'preparation'
)
insert into public.treatments (
  event_id, name, type, sessions_count, doctor_id, preparation_id,
  price_amount, currency, room, treatment_category,
  pre_recommendations, post_recommendations, is_active
)
select
  'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
  rows.name,
  rows.type,
  rows.sessions_count,
  d.id,
  p.id,
  rows.price_amount,
  rows.currency,
  rows.room,
  rows.treatment_category,
  rows.pre_recommendations,
  rows.post_recommendations,
  rows.is_active
from (
  values
    (
      'Natural Volume Lips', 'single', 1, 'Anna', 'Hyaluron Soft Lift 1 ml',
      1400.00, 'PLN', 'Gabinet 2', 'filler',
      'Kwalifikacja lekarska, aktualny wywiad medyczny i podpisana zgoda zabiegowa.',
      'Unikać sauny, intensywnego wysiłku i ucisku okolicy zabiegowej przez 48 godzin.',
      true
    ),
    (
      'Botox okolica czoła i lwia zmarszczka', 'single', 1, 'Anna', 'Botulinum Demo 100 j.',
      900.00, 'PLN', 'Gabinet 1', 'botox',
      'Omówić przeciwwskazania, leki oraz oczekiwany zakres korekcji mimiki.',
      'Nie masować okolicy zabiegowej, nie kłaść się przez kilka godzin, kontrola po 14 dniach.',
      true
    ),
    (
      'Skin Booster - seria 3 zabiegów', 'series', 3, 'Marta', 'Skin Booster HA Complex',
      2100.00, 'PLN', 'Gabinet 3', 'skin_quality',
      'Plan serii, dokumentacja fotograficzna i wywiad dotyczący skóry.',
      'Nawilżanie, fotoprotekcja, kontrola reakcji skóry i przypomnienie o kolejnej sesji.',
      true
    ),
    (
      'Laser frakcyjny CO2 - twarz', 'single', 1, 'Dawid', 'LaserGel Cooling',
      1800.00, 'PLN', 'Gabinet laserowy', 'laser',
      'Kwalifikacja do laseroterapii, omówienie rekonwalescencji i fotoprotekcji.',
      'Ścisła fotoprotekcja, regeneracja bariery skóry, kontrola po 10-14 dniach.',
      true
    ),
    (
      'Konsultacja premium z planem terapii', 'single', 1, 'Marta', null,
      350.00, 'PLN', 'Gabinet konsultacyjny', 'consultation',
      'Przygotować historię dotychczasowych zabiegów i oczekiwania pacjenta.',
      'Wysłanie planu terapii do Portalu Pacjenta i follow-up recepcji po 7 dniach.',
      true
    )
) as rows (
  name, type, sessions_count, doctor_first_name, prep_name,
  price_amount, currency, room, treatment_category,
  pre_recommendations, post_recommendations, is_active
)
left join doctors d on d.first_name = rows.doctor_first_name
left join preps p on p.sponsor_name = rows.prep_name
where not exists (
  select 1
  from public.treatments t
  where t.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
    and t.name = rows.name
);

-- Powiązanie zabiegów z dokumentami.
insert into public.treatment_consent_templates (treatment_id, template_id)
select t.id, mct.id
from public.treatments t
join public.medical_consent_templates mct
  on mct.event_id = t.event_id
where t.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and (
    mct.is_global_required = true
    or (t.treatment_category = 'botox' and mct.required_for_treatment = 'botox')
    or (t.treatment_category = 'filler' and mct.required_for_treatment = 'filler')
    or (mct.required_for_treatment = 'aftercare')
  )
on conflict (treatment_id, template_id) do nothing;

-- Przykładowe wizyty dla istniejących pacjentów.
with pats as (
  select id, row_number() over (order by created_at desc, id) as rn
  from public.patients
  order by created_at desc, id
  limit 14
),
trs as (
  select
    id, name, doctor_id, price_amount, currency,
    row_number() over (order by name) as rn,
    count(*) over () as cnt
  from public.treatments
  where event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
    and is_active is not false
)
insert into public.appointments (
  event_id, patient_id, treatment_id, treatment_name, doctor_id,
  price_amount, currency, paid_amount, payment_status, paid_at,
  appointment_date, status, notes
)
select
  'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid,
  p.id,
  t.id,
  t.name,
  t.doctor_id,
  t.price_amount,
  coalesce(t.currency, 'PLN'),
  case
    when p.rn in (1, 2, 3, 7, 9) then t.price_amount
    when p.rn in (4, 10) then round(t.price_amount * 0.5, 2)
    else 0
  end,
  case
    when p.rn in (1, 2, 3, 7, 9) then 'paid'
    when p.rn in (4, 10) then 'partially_paid'
    else 'unpaid'
  end,
  case when p.rn in (1, 2, 3, 7, 9) then now() - interval '2 days' else null end,
  now() + ((p.rn - 7) * interval '3 days') + interval '10 hours',
  case
    when p.rn <= 5 then 'completed'
    when p.rn in (6, 7, 8, 9, 10, 11, 12) then 'scheduled'
    else 'cancelled'
  end,
  case
    when p.rn <= 5 then 'Wizyta demonstracyjna: wykonano procedurę, pacjent wymaga follow-up.'
    when p.rn <= 12 then 'Wizyta demonstracyjna: pacjent umówiony, dokumenty do sprawdzenia.'
    else 'Wizyta demonstracyjna anulowana przez pacjenta.'
  end
from pats p
join trs t on t.rn = ((p.rn - 1) % t.cnt) + 1
where not exists (
  select 1
  from public.appointments a
  where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
    and a.patient_id = p.id
    and a.treatment_id = t.id
    and date(a.appointment_date) = date(now() + ((p.rn - 7) * interval '3 days') + interval '10 hours')
);

-- Dokumenty pacjentów wygenerowane do wizyt.
insert into public.patient_consents (
  event_id, patient_id, template_id, appointment_id, status, signed_at, answers
)
select
  a.event_id,
  a.patient_id,
  tct.template_id,
  a.id,
  case
    when row_number() over (partition by a.patient_id order by mct.document_type, mct.title) % 3 = 0 then 'signed'
    else 'pending'
  end,
  case
    when row_number() over (partition by a.patient_id order by mct.document_type, mct.title) % 3 = 0 then now() - interval '1 day'
    else null
  end,
  case
    when mct.document_type = 'questionnaire' then '{"choroby_przewlekle":"nie zgłoszono w demo","leki":"brak danych alarmowych","alergie":"do potwierdzenia podczas wizyty"}'::jsonb
    else null
  end
from public.appointments a
join public.treatment_consent_templates tct on tct.treatment_id = a.treatment_id
join public.medical_consent_templates mct on mct.id = tct.template_id
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and not exists (
    select 1
    from public.patient_consents pc
    where pc.patient_id = a.patient_id
      and pc.template_id = tct.template_id
      and pc.appointment_id = a.id
  );

-- Historia choroby / wpisy lekarza dla wykonanych wizyt.
insert into public.patient_clinical_notes (
  event_id, patient_id, appointment_id, doctor_id, treatment_id,
  record_type, procedure_performed, recommendations, medications,
  preparations_used, doctor_notes, created_by, created_at
)
select
  a.event_id,
  a.patient_id,
  a.id,
  a.doctor_id,
  a.treatment_id,
  'procedure',
  'Wykonano procedurę: ' || coalesce(a.treatment_name, 'wizyta kontrolna') || '. Parametry i zakres zgodne z kwalifikacją demonstracyjną.',
  'Zalecenia przekazane pacjentowi w Portalu Pacjenta. Kontrola lub kontakt follow-up zgodnie z planem opieki.',
  'Leki: brak nowych leków w danych demonstracyjnych.',
  coalesce(ep.sponsor_name, 'Preparat zgodny z kartą zabiegu lub brak preparatu.'),
  'Notatka demo: pacjent poinformowany o zaleceniach, objawach alarmowych i terminie kontroli. Bez danych prawdziwych.',
  'Lekarz demo',
  a.appointment_date + interval '45 minutes'
from public.appointments a
left join public.treatments t on t.id = a.treatment_id
left join public.event_partners ep on ep.id = t.preparation_id
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and a.status = 'completed'
  and not exists (
    select 1
    from public.patient_clinical_notes n
    where n.appointment_id = a.id
      and n.record_type = 'procedure'
  );

insert into public.patient_clinical_notes (
  event_id, patient_id, appointment_id, doctor_id, treatment_id,
  record_type, recommendations, doctor_notes, created_by, created_at
)
select
  a.event_id,
  a.patient_id,
  a.id,
  a.doctor_id,
  a.treatment_id,
  'followup',
  'Recepcja powinna skontaktować się z pacjentem i zapytać o samopoczucie po zabiegu. W razie pytań przekazać wiadomość lekarzowi prowadzącemu.',
  'Plan demo: follow-up 7-14 dni po zabiegu oraz propozycja kontroli efektu.',
  'AI Patient Journey Manager',
  now() - interval '12 hours'
from public.appointments a
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and a.status = 'completed'
  and not exists (
    select 1
    from public.patient_clinical_notes n
    where n.appointment_id = a.id
      and n.record_type = 'followup'
  );

-- Pytania z Portalu Pacjenta i odpowiedzi recepcji.
with source_appointments as (
  select
    a.*,
    row_number() over (order by a.appointment_date desc) as rn
  from public.appointments a
  where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  limit 6
),
inserted_requests as (
  insert into public.patient_portal_requests (
    patient_id, appointment_id, request_type, subject, message, status, response, created_at, updated_at
  )
  select
    patient_id,
    id,
    case when rn in (1, 4) then 'appointment_request' when rn in (2, 5) then 'followup_request' else 'post_treatment_question' end,
    case
      when rn in (1, 4) then 'Prośba o termin kontroli'
      when rn in (2, 5) then 'Pytanie o zalecenia po zabiegu'
      else 'Pytanie po zabiegu'
    end,
    case
      when rn in (1, 4) then 'Dzień dobry, proszę o propozycję terminu kontroli po ostatniej wizycie.'
      when rn in (2, 5) then 'Dzień dobry, chciałabym/chciałbym potwierdzić zalecenia po zabiegu i zapytać, kiedy mogę wrócić do aktywności.'
      else 'Dzień dobry, mam pytanie dotyczące samopoczucia po zabiegu i proszę o informację, czy wszystko jest w normie.'
    end,
    case when rn in (1, 2, 3) then 'new' else 'answered' end,
    case when rn in (1, 2, 3) then null else 'Dziękujemy za wiadomość. Przekazaliśmy informację do zespołu i wrócimy z konkretnym terminem lub zaleceniami.' end,
    now() - (rn * interval '8 hours'),
    now() - (rn * interval '6 hours')
  from source_appointments sa
  where not exists (
    select 1
    from public.patient_portal_requests pr
    where pr.patient_id = sa.patient_id
      and pr.appointment_id = sa.id
      and pr.subject in ('Prośba o termin kontroli', 'Pytanie o zalecenia po zabiegu', 'Pytanie po zabiegu')
  )
  returning id, patient_id, subject, message, response, status, created_at
)
insert into public.patient_portal_messages (
  request_id, patient_id, sender_type, sender_name, body, is_ai_draft, created_at
)
select id, patient_id, 'patient', 'Pacjent demo', message, false, created_at
from inserted_requests;

insert into public.patient_portal_messages (
  request_id, patient_id, sender_type, sender_name, body, is_ai_draft, created_at
)
select pr.id, pr.patient_id, 'staff', 'Recepcja ClinicOps', pr.response, true, pr.updated_at
from public.patient_portal_requests pr
where pr.response is not null
  and not exists (
    select 1
    from public.patient_portal_messages pm
    where pm.request_id = pr.id
      and pm.sender_type = 'staff'
  );

-- Historia komunikacji wielokanałowej.
insert into public.patient_communication_logs (
  event_id, patient_id, appointment_id, treatment_id, channel, direction,
  subject, message, status, communication_goal, ai_suggested,
  replied_at, converted_to_appointment, sent_at, created_at
)
select
  a.event_id,
  a.patient_id,
  a.id,
  a.treatment_id,
  case when row_number() over (order by a.appointment_date) % 3 = 0 then 'sms'
       when row_number() over (order by a.appointment_date) % 3 = 1 then 'portal'
       else 'email'
  end,
  'outgoing',
  case when a.status = 'completed' then 'Follow-up po wizycie' else 'Przypomnienie o nadchodzącej wizycie' end,
  case when a.status = 'completed'
       then 'Dzień dobry, dziękujemy za wizytę. Przypominamy o zaleceniach w Portalu Pacjenta i zapraszamy do kontaktu w razie pytań.'
       else 'Dzień dobry, przypominamy o nadchodzącej wizycie w klinice. Prosimy o uzupełnienie dokumentów w Portalu Pacjenta.'
  end,
  'sent',
  case when a.status = 'completed' then 'followup' else 'documents' end,
  true,
  case when a.status = 'completed' then a.appointment_date + interval '2 days' else null end,
  case when a.status = 'completed' then true else false end,
  now() - interval '1 day',
  now() - interval '1 day'
from public.appointments a
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and not exists (
    select 1
    from public.patient_communication_logs l
    where l.appointment_id = a.id
      and l.subject in ('Follow-up po wizycie', 'Przypomnienie o nadchodzącej wizycie')
  );

-- Zadania Patient Experience Manager.
insert into public.event_checklist_groups (
  event_id, title, description, category, color, is_open, display_order,
  patient_id, journey_type, stage_key
)
select
  a.event_id,
  'Ścieżka pacjenta - ' || coalesce(p.first_name, 'Pacjent') || ' ' || coalesce(p.last_name, ''),
  'Automatyczna ścieżka opieki demo: dokumenty, follow-up, zalecenia i kontrola.',
  'patient_path',
  '#06b6d4',
  true,
  row_number() over (order by a.appointment_date),
  a.patient_id,
  'patient_path',
  'patient_journey'
from public.appointments a
join public.patients p on p.id = a.patient_id
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and a.status in ('completed', 'scheduled')
  and not exists (
    select 1
    from public.event_checklist_groups g
    where g.event_id = a.event_id
      and g.patient_id = a.patient_id
      and g.stage_key = 'patient_journey'
  )
limit 8;

insert into public.event_checklist_items (
  event_id, group_id, patient_id, appointment_id, treatment_id, doctor_id,
  journey_action, title, notes, priority, due_date, assigned_to,
  is_done, status, display_order
)
select
  a.event_id,
  g.id,
  a.patient_id,
  a.id,
  a.treatment_id,
  a.doctor_id,
  case when a.status = 'completed' then 'followup' else 'send_documents' end,
  case when a.status = 'completed' then 'Kontakt kontrolny po zabiegu' else 'Uzupełnić dokumenty przed wizytą' end,
  case when a.status = 'completed'
       then 'Zadzwonić lub wysłać wiadomość do pacjenta, zapytać o samopoczucie i przypomnieć zalecenia.'
       else 'Sprawdzić kompletność zgód i wywiadu medycznego przed dopuszczeniem pacjenta do zabiegu.'
  end,
  case when a.status = 'completed' then 'normal' else 'high' end,
  case when a.status = 'completed' then (current_date + 7) else (a.appointment_date::date - 1) end,
  'Opiekun pacjenta',
  false,
  'todo',
  row_number() over (partition by g.id order by a.appointment_date)
from public.appointments a
join public.event_checklist_groups g
  on g.event_id = a.event_id
 and g.patient_id = a.patient_id
 and g.stage_key = 'patient_journey'
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and not exists (
    select 1
    from public.event_checklist_items i
    where i.appointment_id = a.id
      and i.patient_id = a.patient_id
      and i.journey_action in ('followup', 'send_documents')
  );

-- Komunikaty do Portalu Pacjenta.
insert into public.personal_announcements (
  event_id, patient_id, treatment_id, appointment_id, title, description,
  category, priority, is_active, starts_at
)
select
  a.event_id,
  a.patient_id,
  a.treatment_id,
  a.id,
  case when a.status = 'completed' then 'Zalecenia po wizycie' else 'Przypomnienie o dokumentach' end,
  case when a.status = 'completed'
       then 'Dziękujemy za wizytę. W razie pytań możesz skorzystać z wiadomości w Portalu Pacjenta. Pamiętaj o zaleceniach przekazanych przez lekarza.'
       else 'Przed wizytą uzupełnij dokumenty i wywiad medyczny w Portalu Pacjenta.'
  end,
  case when a.status = 'completed' then 'aftercare' else 'documents' end,
  'normal',
  true,
  now()
from public.appointments a
where a.event_id = 'fc42d456-d5e2-4731-9e09-4bd1ab569bc9'::uuid
  and not exists (
    select 1
    from public.personal_announcements pa
    where pa.appointment_id = a.id
      and pa.patient_id = a.patient_id
  );

commit;

-- Po uruchomieniu odśwież panel demo.
-- Jeśli któraś tabela ze starej architektury nie istnieje, Supabase pokaże błąd.
-- Wtedy wyślij mi dokładny komunikat błędu, a dopasuję seed do Twojej bazy.
