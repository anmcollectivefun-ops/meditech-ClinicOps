// @ts-nocheck
// Supabase Edge Functions run in Deno. The Next.js project typecheck does not
// resolve URL imports, so this file is type-checked by the Supabase/Deno toolchain.
// @ts-ignore Deno URL import
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// @ts-ignore Deno URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-api-version, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const safeArray = (value: unknown) => Array.isArray(value) ? value : []

const safeSelect = async (supabase: ReturnType<typeof createClient>, table: string, columns: string, eventId: string) => {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('event_id', eventId)

  if (error) {
    console.warn(`AI text context ${table} load error:`, error.message)
    return []
  }

  return data || []
}

const parseAiJson = (content: string) => {
  try {
    return JSON.parse(content)
  } catch {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1))
    }
    throw new Error('AI response did not contain valid JSON.')
  }
}

const fallbackSuggestion = ({
  sectionKey,
  fieldKey,
  currentValue,
  event,
  tone,
  length,
  mode,
  documentType,
  relatedEntityTitle,
}: Record<string, any>) => {
  const eventTitle = event?.title || 'wydarzenie'
  const location = event?.location ? ` w lokalizacji ${event.location}` : ''
  const short = String(length || '').toLowerCase().includes('krót')
  const isMedicalDocument = mode === 'medical_document' || ['medical_documents', 'medical_docs', 'patient_consents'].includes(String(sectionKey || ''))
  const procedure = relatedEntityTitle || event?.title || '[NAZWA PROCEDURY]'

  let suggestion = currentValue || ''

  if (!suggestion && isMedicalDocument) {
    if (documentType === 'questionnaire') {
      suggestion = [
        `WYWIAD MEDYCZNY PRZED PROCEDURĄ: ${procedure}`,
        '',
        'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNEJ',
        'Pacjent: [IMIE_PACJENTA] [NAZWISKO_PACJENTA]',
        'Data wypełnienia: [DATA]',
        '',
        '1. Cel wywiadu',
        'Zebranie informacji istotnych dla bezpiecznej kwalifikacji pacjenta do procedury.',
        '',
        '2. Pytania ogólne',
        '- Choroby przewlekłe: [TAK/NIE/OPIS]',
        '- Stale przyjmowane leki: [TAK/NIE/OPIS]',
        '- Alergie lub nadwrażliwości: [TAK/NIE/OPIS]',
        '- Ciąża lub karmienie piersią: [TAK/NIE/NIE DOTYCZY]',
        '- Wcześniejsze zabiegi w tym obszarze: [TAK/NIE/OPIS]',
        '',
        '3. Przeciwwskazania i czynniki ryzyka',
        '- Aktywna infekcja lub stan zapalny: [TAK/NIE]',
        '- Zaburzenia gojenia lub skłonność do bliznowców: [TAK/NIE]',
        '- Inne istotne informacje: [OPIS]',
        '',
        '4. Oświadczenie pacjenta',
        'Oświadczam, że podane informacje są zgodne z moją wiedzą.',
        '',
        'Podpis pacjenta: ____________________    Podpis personelu: ____________________',
        '',
        'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem.'
      ].join('\n')
    } else if (documentType === 'aftercare' || documentType === 'precare') {
      const phase = documentType === 'precare' ? 'PRZED PROCEDURĄ' : 'PO PROCEDURZE'
      suggestion = [
        `ZALECENIA DLA PACJENTA ${phase}: ${procedure}`,
        '',
        'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNEJ',
        '',
        '1. Cel dokumentu',
        'Przekazanie pacjentowi zrozumiałych zaleceń organizacyjnych i medycznych związanych z procedurą.',
        '',
        '2. Zalecenia ogólne',
        '- Stosować się do indywidualnych zaleceń osoby wykonującej procedurę.',
        '- Nie pomijać informacji o lekach, alergiach i chorobach przewlekłych.',
        '- Skontaktować się z placówką w razie niepokojących objawów lub wątpliwości.',
        '',
        '3. Objawy wymagające kontaktu',
        '- nasilający się ból, obrzęk lub zaczerwienienie,',
        '- objawy reakcji alergicznej,',
        '- gorączka, infekcja lub zaburzenia gojenia,',
        '- każdy objaw budzący niepokój pacjenta.',
        '',
        '4. Kontrola',
        'Termin kontroli / follow-up: [TERMIN]',
        '',
        'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem.'
      ].join('\n')
    } else if (documentType === 'followup') {
      suggestion = [
        `FOLLOW-UP DO PACJENTA PO WIZYCIE / PROCEDURZE: ${procedure}`,
        '',
        'Status treści: WERSJA ROBOCZA DO WERYFIKACJI',
        '',
        'Dzień dobry [IMIE_PACJENTA],',
        '',
        'kontaktujemy się po wizycie, aby upewnić się, że wszystko przebiega prawidłowo.',
        '',
        'Prosimy o kontakt z placówką, jeśli pojawiły się niepokojące objawy, nasilony ból, obrzęk, zaczerwienienie, objawy infekcji lub reakcja alergiczna.',
        '',
        'Termin kontroli / kolejnego kontaktu: [TERMIN]',
        '',
        'Pozdrawiamy,',
        '[NAZWA_PLACOWKI]',
        '',
        'Uwaga: treść wymaga zatwierdzenia przez osobę uprawnioną przed wysyłką.'
      ].join('\n')
    } else if (documentType === 'rodo') {
      suggestion = [
        'INFORMACJA O PRZETWARZANIU DANYCH OSOBOWYCH I ZGODY PACJENTA',
        '',
        'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI PRAWNEJ',
        '',
        '1. Administrator danych',
        'Administratorem danych jest: [NAZWA_PLACOWKI], [ADRES], [KONTAKT].',
        '',
        '2. Cele przetwarzania danych',
        '- obsługa pacjenta i rezerwacji,',
        '- prowadzenie dokumentacji związanej z wizytą,',
        '- kontakt organizacyjny,',
        '- działania marketingowe wyłącznie po wyrażeniu odrębnej zgody.',
        '',
        '3. Zgody szczegółowe',
        '[ ] Wyrażam zgodę na kontakt SMS/e-mail w sprawach organizacyjnych.',
        '[ ] Wyrażam zgodę na kontakt marketingowy.',
        '[ ] Wyrażam zgodę na wykorzystanie wizerunku / zdjęć przed i po, jeżeli dotyczy.',
        '',
        'Podpis pacjenta: ____________________    Data: [DATA]',
        '',
        'Uwaga: dokument wymaga weryfikacji prawnej przed użyciem.'
      ].join('\n')
    } else {
      suggestion = [
        `ZGODA PACJENTA NA PROCEDURĘ: ${procedure}`,
        '',
        'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNO-PRAWNEJ',
        'Pacjent: [IMIE_PACJENTA] [NAZWISKO_PACJENTA]',
        'Data: [DATA]',
        'Placówka: [NAZWA_PLACOWKI]',
        '',
        '1. Opis procedury',
        'Pacjent został poinformowany o charakterze, celu i spodziewanym przebiegu procedury.',
        '',
        '2. Możliwe przeciwwskazania',
        '- aktywne infekcje lub stany zapalne,',
        '- ciąża lub karmienie piersią, jeżeli dotyczy procedury,',
        '- alergie lub nadwrażliwości na stosowane preparaty,',
        '- inne przeciwwskazania wskazane przez osobę kwalifikującą.',
        '',
        '3. Możliwe działania niepożądane / powikłania',
        '- ból, obrzęk, zaczerwienienie, siniaki,',
        '- reakcja alergiczna,',
        '- infekcja lub zaburzenia gojenia,',
        '- efekt odbiegający od oczekiwań pacjenta.',
        '',
        '4. Alternatywy i możliwość odmowy',
        'Pacjent został poinformowany o możliwości rezygnacji z procedury oraz o dostępnych alternatywach, jeżeli występują.',
        '',
        '5. Oświadczenia pacjenta',
        '[ ] Oświadczam, że miałem/am możliwość zadania pytań.',
        '[ ] Oświadczam, że przekazałem/am prawdziwe informacje o stanie zdrowia.',
        '[ ] Wyrażam świadomą zgodę na wykonanie procedury.',
        '',
        '6. Zalecenia',
        'Pacjent otrzymał zalecenia przed i po procedurze oraz został poinformowany o konieczności kontaktu w razie niepokojących objawów.',
        '',
        'Podpis pacjenta: ____________________    Podpis osoby uprawnionej: ____________________',
        '',
        'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem z pacjentem.'
      ].join('\n')
    }
  }

  if (!suggestion) {
    if (String(fieldKey || '').includes('title')) {
      suggestion = sectionKey === 'faq'
        ? 'Najważniejsze informacje'
        : sectionKey === 'transport'
          ? 'Transport i dojazd'
          : sectionKey === 'menu'
            ? 'Menu wydarzenia'
            : `Sekcja wydarzenia ${eventTitle}`
    } else if (String(fieldKey || '').includes('cta')) {
      suggestion = sectionKey === 'menu'
        ? 'Wybierz menu'
        : sectionKey === 'transport'
          ? 'Potwierdź transport'
          : sectionKey === 'workshops'
            ? 'Zapisz się'
            : 'Sprawdź szczegóły'
    } else {
      suggestion = short
        ? `Sprawdź aktualne informacje dotyczące wydarzenia ${eventTitle}${location}.`
        : `Tutaj znajdziesz aktualne informacje dotyczące wydarzenia ${eventTitle}${location}. Organizator może aktualizować tę sekcję na bieżąco, dlatego warto wracać do strony przed wydarzeniem.`
    }
  }

  if (tone === 'eco' && !suggestion.toLowerCase().includes('cyfrow')) {
    suggestion += short
      ? ' Korzystamy z cyfrowego flow, aby ograniczyć wydruki.'
      : ' To element cyfrowego centrum uczestnika, które pomaga ograniczać wydruki i szybciej aktualizować informacje.'
  }

  return {
    suggestion,
    reason: isMedicalDocument
      ? 'Użyto bezpiecznego lokalnego szkieletu dokumentu medycznego. Treść jest projektem do zatwierdzenia.'
      : 'Użyto podstawowych danych wydarzenia i lokalnego fallbacku bez wywołania modelu AI.',
    missing_context: isMedicalDocument
      ? ['Uzupełnij nazwę procedury, przeciwwskazania, możliwe powikłania, zalecenia oraz dane placówki przed zatwierdzeniem.']
      : (event?.title ? [] : ['Uzupełnij tytuł wydarzenia, aby sugestie były dokładniejsze.']),
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      eventId,
      sectionKey,
      fieldKey,
      currentValue = '',
      relatedEntityId = null,
      relatedEntityTitle = '',
      mode = 'general',
      documentType = 'consent',
      tone = 'premium',
      length = 'średnia',
      instruction = '',
    } = body || {}

    if (!eventId || !sectionKey || !fieldKey) {
      return new Response(JSON.stringify({ error: 'Missing eventId, sectionKey or fieldKey' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase Edge Function environment variables.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: event, error: eventError } = await supabase
      .from('b2b_events')
      .select(`
        id,
        title,
        description,
        location,
        event_date,
        start_date,
        end_date,
        menu_section_title,
        menu_section_description,
        gadgets_section_title,
        gadgets_section_description,
        transport_section_title,
        transport_section_description,
        workshops_section_title,
        workshops_section_description,
        faq_section_title,
        faq_section_description,
        eventpass_section_title,
        eventpass_section_description
      `)
      .eq('id', eventId)
      .maybeSingle()

    if (eventError) {
      console.warn('AI text event context error:', eventError.message)
    }

    const context: Record<string, unknown> = {
      event: event || null,
      sectionKey,
      fieldKey,
      currentValue,
      relatedEntityId,
      relatedEntityTitle,
      mode,
      documentType,
      tone,
      length,
      instruction,
      items: {},
    }

    if (['workshops', 'sessions', 'agenda', 'speakers'].includes(sectionKey)) {
      context.items.sessions = await safeSelect(
        supabase,
        'event_sessions',
        'id, title, description, session_type, speaker_name, location, start_time, end_time, is_public, is_active',
        eventId
      )
      context.items.speakers = await safeSelect(
        supabase,
        'speakers',
        'id, first_name, last_name, title, bio, is_visible',
        eventId
      )
    }

    if (sectionKey === 'menu') {
      context.items.meals = await safeSelect(
        supabase,
        'event_meals',
        'id, name, description, meal_type, dietary_category, allergens, is_active',
        eventId
      )
      context.items.cateringOffers = await safeSelect(
        supabase,
        'event_catering_offers',
        'company_name, notes, avoids_plastic, local_products, reusable_packaging, food_donation_possible, portioning_by_rsvp, status',
        eventId
      )
    }

    if (sectionKey === 'transport') {
      const [transportChoices, carpoolingAds, carpoolingReservations, routes] = await Promise.all([
        safeSelect(supabase, 'event_attendee_transport_choices', 'transport, transport_type, status', eventId),
        safeSelect(supabase, 'carpooling_ads', 'route_from, seats_avail, used, status', eventId),
        safeSelect(supabase, 'carpooling_reservations', 'status, route_from', eventId),
        safeSelect(supabase, 'organized_transport_routes', 'route_name, public_title, public_description, vehicle_type, is_public, is_active', eventId),
      ])
      context.items.transport = {
        transportChoicesCount: safeArray(transportChoices).length,
        carpoolingAdsCount: safeArray(carpoolingAds).length,
        carpoolingReservationsCount: safeArray(carpoolingReservations).length,
        publicRoutes: routes,
      }
    }

    if (sectionKey === 'gadgets') {
      context.items.gadgets = await safeSelect(
        supabase,
        'event_gadgets',
        'id, name, public_label, description, category, stock_quantity, track_stock, is_active, allow_decline',
        eventId
      )
    }

    if (sectionKey === 'eco') {
      const { data: report } = await supabase
        .from('eco_ai_reports')
        .select('report, confidence, updated_at')
        .eq('event_id', eventId)
        .maybeSingle()

      context.items.ecoReport = report?.report || null
    }

    if (sectionKey === 'faq') {
      const [meals, routes, sessions] = await Promise.all([
        safeSelect(supabase, 'event_meals', 'name, dietary_category, is_active', eventId),
        safeSelect(supabase, 'organized_transport_routes', 'public_title, route_name, is_public, is_active', eventId),
        safeSelect(supabase, 'event_sessions', 'title, session_type, is_public, is_active', eventId),
      ])
      context.items.faqSignals = {
        mealsCount: safeArray(meals).length,
        routesCount: safeArray(routes).length,
        sessionsCount: safeArray(sessions).length,
      }
    }

    const isMedicalDocument = mode === 'medical_document' || ['medical_documents', 'medical_docs', 'patient_consents'].includes(String(sectionKey || ''))
    const fallback = fallbackSuggestion({ sectionKey, fieldKey, currentValue, event, tone, length, mode, documentType, relatedEntityTitle })

    try {
      const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
      if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY')

      const model = Deno.env.get('AI_MODEL') || 'deepseek-chat'

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: isMedicalDocument
                ? [
                    'Jesteś asystentem tworzenia roboczych szablonów dokumentów dla placówki medycznej.',
                    'Tworzysz wyłącznie projekt dokumentu po polsku, do późniejszej weryfikacji przez osobę uprawnioną medycznie i prawnie.',
                    'Nie udzielasz diagnozy, nie kwalifikujesz pacjenta, nie zastępujesz lekarza ani prawnika.',
                    'Nie twierdzisz, że dokument jest zgodny z prawem lub gotowy do użycia.',
                    'Każdy dokument oznacz jako wersję roboczą do zatwierdzenia.',
                    'Nie wymyślaj konkretnych dawek, procedur, przeciwwskazań ani powikłań, jeśli nie wynikają z kontekstu lub instrukcji.',
                    'Używaj sekcji: dane pacjenta, dane placówki, opis procedury, przeciwwskazania, ryzyka/powikłania, alternatywy, oświadczenia pacjenta, zalecenia, podpisy, wersja dokumentu.',
                    'Dla wywiadu medycznego twórz pytania i pola odpowiedzi, nie rozpoznania.',
                    'Dla RODO twórz szkic administracyjny z miejscami na dane placówki i zgody szczegółowe.',
                    'Zwróć wyłącznie JSON w kształcie: {"suggestion":"...","reason":"...","missing_context":["..."]}.',
                  ].join(' ')
                : [
                    'Jesteś AI copywriterem i asystentem event managera w ANM Eco Planner.',
                    'Pomagasz tworzyć treści strony wydarzenia na podstawie danych już uzupełnionych w plannerze.',
                    'Pisz po polsku. Pisz konkretnie, nowocześnie i naturalnie.',
                    'Nie wymyślaj faktów, prelegentów, godzin, cen ani lokalizacji.',
                    'Jeśli czegoś brakuje, użyj neutralnego sformułowania.',
                    'Nie nadpisuj danych. Zwracasz tylko propozycję tekstu.',
                    'Dopasuj ton i długość do parametrów.',
                    'Zwróć wyłącznie JSON w kształcie: {"suggestion":"...","reason":"...","missing_context":["..."]}.',
                  ].join(' '),
            },
            {
              role: 'user',
              content: JSON.stringify({
                context,
                expectedJson: {
                  suggestion: 'tekst propozycji',
                  reason: 'krótkie wyjaśnienie, z jakich danych skorzystano',
                  missing_context: ['lista brakujących danych, jeśli są'],
                },
              }),
            },
          ],
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`DeepSeek error ${response.status}: ${text}`)
      }

      const aiData = await response.json()
      const content = aiData?.choices?.[0]?.message?.content
      if (!content) throw new Error('DeepSeek response missing content.')

      const parsed = parseAiJson(content)

      return new Response(JSON.stringify({
        suggestion: String(parsed.suggestion || fallback.suggestion || ''),
        reason: String(parsed.reason || fallback.reason || ''),
        missing_context: Array.isArray(parsed.missing_context) ? parsed.missing_context : fallback.missing_context,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (aiError) {
      console.warn('AI text suggestion fallback:', aiError instanceof Error ? aiError.message : aiError)

      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('generate-text-suggestion error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
