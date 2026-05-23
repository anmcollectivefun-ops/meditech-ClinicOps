create or replace function public.patient_portal_by_pesel(input_pesel text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_pesel text;
  portal_patient public.patients%rowtype;
  portal_consents jsonb;
begin
  normalized_pesel := regexp_replace(coalesce(input_pesel, ''), '\D', '', 'g');

  if length(normalized_pesel) = 0 then
    return null;
  end if;

  select *
    into portal_patient
  from public.patients
  where regexp_replace(coalesce(pesel::text, ''), '\D', '', 'g') = normalized_pesel
  limit 1;

  if portal_patient.id is null then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      to_jsonb(pc)
      || jsonb_build_object('medical_consent_templates', to_jsonb(mct))
      order by pc.created_at desc
    ),
    '[]'::jsonb
  )
    into portal_consents
  from public.patient_consents pc
  left join public.medical_consent_templates mct
    on mct.id = pc.template_id
  where pc.patient_id = portal_patient.id;

  return jsonb_build_object(
    'patient', to_jsonb(portal_patient),
    'consents', portal_consents
  );
end;
$$;

create or replace function public.patient_portal_sign_consent(input_pesel text, input_consent_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_pesel text;
  updated_id uuid;
begin
  normalized_pesel := regexp_replace(coalesce(input_pesel, ''), '\D', '', 'g');

  if length(normalized_pesel) = 0 then
    return null;
  end if;

  update public.patient_consents pc
  set
    status = 'signed',
    signed_at = now()
  from public.patients p
  where pc.id = input_consent_id
    and pc.patient_id = p.id
    and regexp_replace(coalesce(p.pesel::text, ''), '\D', '', 'g') = normalized_pesel
  returning pc.id into updated_id;

  if updated_id is null then
    return null;
  end if;

  return public.patient_portal_by_pesel(normalized_pesel);
end;
$$;

grant execute on function public.patient_portal_by_pesel(text) to anon, authenticated;
grant execute on function public.patient_portal_sign_consent(text, uuid) to anon, authenticated;
