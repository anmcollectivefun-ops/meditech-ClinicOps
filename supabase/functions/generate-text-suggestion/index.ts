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
}: Record<string, any>) => {
  const eventTitle = event?.title || 'wydarzenie'
  const location = event?.location ? ` w lokalizacji ${event.location}` : ''
  const short = String(length || '').toLowerCase().includes('krót')

  let suggestion = currentValue || ''

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
    reason: 'Użyto podstawowych danych wydarzenia i lokalnego fallbacku bez wywołania modelu AI.',
    missing_context: event?.title ? [] : ['Uzupełnij tytuł wydarzenia, aby sugestie były dokładniejsze.'],
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

    const fallback = fallbackSuggestion({ sectionKey, fieldKey, currentValue, event, tone, length })

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
              content: [
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
