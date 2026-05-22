// @ts-nocheck
// Supabase Edge Functions run in Deno. The Next.js project typecheck does not
// resolve URL imports, so this file is type-checked by the Supabase/Deno toolchain.
// @ts-ignore Deno URL import
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// @ts-ignore Deno URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits))

const safeArray = <T>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value : []

const isConfirmedRsvp = (value: unknown) =>
  ['confirmed', 'potwierdzone', 'accepted', 'yes', 'tak', 'true', 'approved', 'zaakceptowane'].includes(
    String(value || '').toLowerCase()
  )

const includesAny = (value: unknown, words: string[]) => {
  const text = String(value || '').toLowerCase()
  return words.some((word) => text.includes(word))
}

const normalizePercent = (value: unknown) => Math.max(0, Math.min(100, Math.round(numberValue(value))))

const normalizeReport = (report: Record<string, unknown>, fallback: Record<string, unknown>) => {
  const resolveScore = report.resolve_score && typeof report.resolve_score === 'object'
    ? report.resolve_score as Record<string, unknown>
    : fallback.resolve_score as Record<string, unknown>

  return {
    total_co2_saved: round(numberValue(report.total_co2_saved, numberValue(fallback.total_co2_saved))),
    digital_invites_co2: round(numberValue(report.digital_invites_co2, numberValue(fallback.digital_invites_co2))),
    transport_co2: round(numberValue(report.transport_co2, numberValue(fallback.transport_co2))),
    plastic_co2: round(numberValue(report.plastic_co2, numberValue(fallback.plastic_co2))),
    paper_saved_kg: round(numberValue(report.paper_saved_kg, numberValue(fallback.paper_saved_kg))),
    menu_co2: round(numberValue(report.menu_co2, numberValue(fallback.menu_co2))),
    gadgets_co2: round(numberValue(report.gadgets_co2, numberValue(fallback.gadgets_co2))),
    food_waste_risk: normalizePercent(report.food_waste_risk ?? fallback.food_waste_risk),
    transport_efficiency: normalizePercent(report.transport_efficiency ?? fallback.transport_efficiency),
    circularity_score: normalizePercent(report.circularity_score ?? fallback.circularity_score),
    local_suppliers_count: Math.max(0, Math.round(numberValue(report.local_suppliers_count, numberValue(fallback.local_suppliers_count)))),
    trees_equivalent: Math.max(0, Math.round(numberValue(report.trees_equivalent, numberValue(fallback.trees_equivalent)))),
    km_equivalent: Math.max(0, Math.round(numberValue(report.km_equivalent, numberValue(fallback.km_equivalent)))),
    resolve_score: {
      virtualize: normalizePercent(resolveScore.virtualize),
      optimizeShare: normalizePercent(resolveScore.optimizeShare),
      loop: normalizePercent(resolveScore.loop),
      exchange: normalizePercent(resolveScore.exchange),
      regenerate: normalizePercent(resolveScore.regenerate),
    },
    recommendations: Array.isArray(report.recommendations) ? report.recommendations : fallback.recommendations,
    sources: Array.isArray(report.sources) ? report.sources : fallback.sources,
    scenarios: report.scenarios && typeof report.scenarios === 'object' ? report.scenarios : fallback.scenarios,
    areas: Array.isArray(report.areas) ? report.areas : fallback.areas,
    ai_summary: String(report.ai_summary || fallback.ai_summary || ''),
    confidence: String(report.confidence || fallback.confidence || 'fallback'),
  }
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

const safeSelect = async (supabase: ReturnType<typeof createClient>, table: string, columns: string, eventId: string) => {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('event_id', eventId)

  if (error) {
    console.warn(`Eco analysis ${table} load error:`, error.message)
    return []
  }

  return data || []
}

const buildFallbackReport = (aggregates: Record<string, number>) => {
  const totalCo2Saved = round(
    aggregates.digitalInvitesCo2 +
    aggregates.transportCo2 +
    aggregates.plasticCo2 +
    aggregates.menuCo2 +
    aggregates.gadgetsCo2
  )

  const recommendations: Array<Record<string, string>> = []

  if (aggregates.foodWasteRisk > 25) {
    recommendations.push({
      title: 'Domknij RSVP przed zamówieniem cateringu',
      description: 'Część osób nie potwierdziła obecności, co zwiększa ryzyko nadwyżek jedzenia.',
      impact: 'wysoki',
      actionLabel: 'Przejdź do zgłoszeń',
    })
  }

  if (aggregates.realCarpoolingChoices === 0 && aggregates.activeCarpoolAds > 0) {
    recommendations.push({
      title: 'Przypomnij gościom o wspólnych przejazdach',
      description: 'Masz aktywne ogłoszenia carpooling, ale brak potwierdzonych wyborów uczestników.',
      impact: 'średni',
      actionLabel: 'Przejdź do transportu',
    })
  }

  if (aggregates.gadgetWasteRisk > 30) {
    recommendations.push({
      title: 'Zamów gadżety według realnych wyborów uczestników',
      description: 'Zapas gadżetów jest większy niż aktualne wybory uczestników.',
      impact: 'średni',
      actionLabel: 'Przejdź do gadżetów',
    })
  }

  if (aggregates.circularityScore < 60) {
    recommendations.push({
      title: 'Podnieś wynik GOZ przez RSVP, carpooling i lokalnych dostawców',
      description: 'Największy wpływ dadzą domknięte RSVP, wspólne przejazdy i lokalne zakupy.',
      impact: 'średni',
      actionLabel: 'Zobacz GOZ',
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Brak krytycznych ryzyk',
      description: 'Na podstawie aktualnych danych AI Eco Engine nie wykrył pilnych ryzyk środowiskowych.',
      impact: 'niski',
      actionLabel: 'Kontynuuj monitoring',
    })
  }

  return {
    total_co2_saved: totalCo2Saved,
    digital_invites_co2: aggregates.digitalInvitesCo2,
    transport_co2: aggregates.transportCo2,
    plastic_co2: aggregates.plasticCo2,
    paper_saved_kg: aggregates.paperSavedKg,
    menu_co2: aggregates.menuCo2,
    gadgets_co2: aggregates.gadgetsCo2,
    food_waste_risk: aggregates.foodWasteRisk,
    transport_efficiency: aggregates.transportEfficiency,
    circularity_score: aggregates.circularityScore,
    local_suppliers_count: aggregates.localSuppliersCount,
    trees_equivalent: Math.max(Math.round(totalCo2Saved / 21), 0),
    km_equivalent: Math.max(Math.round(totalCo2Saved / 0.2), 0),
    resolve_score: {
      virtualize: aggregates.avoidedPrintsCount > 0 ? 85 : 30,
      optimizeShare: Math.min(100, Math.round((aggregates.transportEfficiency + (100 - aggregates.foodWasteRisk)) / 2)),
      loop: Math.min(100, 100 - aggregates.gadgetWasteRisk),
      exchange: Math.min(100, aggregates.proEcoDecisions * 15),
      regenerate: Math.min(100, aggregates.localSuppliersCount * 20 + aggregates.vegeMeals * 8),
    },
    recommendations,
    sources: [
      { label: 'Cyfrowe zaproszenia', value: `${aggregates.digitalInvitesCo2} kg`, detail: `${aggregates.totalApplications} zgłoszeń / zaproszeń` },
      { label: 'Transport', value: `${aggregates.transportCo2} kg`, detail: `${aggregates.realCarpoolingChoices} realnych wyborów carpooling` },
      { label: 'Plastik i papier', value: `${aggregates.plasticCo2} kg`, detail: 'cyfrowe materiały, event pass i ograniczenie wydruków' },
      { label: 'Menu / catering', value: `${aggregates.menuCo2} kg`, detail: `${aggregates.vegeMeals} pozycji vege / vegan` },
      { label: 'Gadżety', value: `${aggregates.gadgetsCo2} kg`, detail: `${aggregates.gadgetReserved} świadomych wyborów gadżetów` },
      { label: 'Uniknięte wydruki', value: `${aggregates.avoidedPrintsCount} szt.`, detail: 'zaproszenia, identyfikatory i informacje cyfrowe' },
      { label: 'Papier', value: `${aggregates.paperSavedKg} kg`, detail: 'szacunek masy papieru niewydrukowanego' },
      { label: 'Food waste', value: `${aggregates.foodWastePortionsRisk} porcji`, detail: 'porcje obarczone ryzykiem przez niepotwierdzone RSVP' },
      { label: 'Budżet / oszczędności', value: `${aggregates.estimatedCostSavings} PLN`, detail: 'potencjał z wydruków, gadżetów i cateringu' },
      { label: 'ReSOLVE', value: `${aggregates.circularityScore}%`, detail: 'syntetyczny wynik GOZ z lokalnego AI Eco Engine' },
    ],
    scenarios: {
      current: { label: 'Obecny plan', co2: totalCo2Saved, cost: 'bieżący', waste: `${Math.max(aggregates.foodWasteRisk, aggregates.gadgetWasteRisk)}%` },
      optimized: { label: 'Plan zoptymalizowany', co2: round(totalCo2Saved * 1.25), cost: `${aggregates.estimatedCostSavings} PLN oszczędności`, waste: `${Math.max(Math.round(aggregates.foodWasteRisk * 0.65), Math.round(aggregates.gadgetWasteRisk * 0.65))}%` },
    },
    areas: [
      { name: 'Transport', status: aggregates.transportEfficiency > 60 || aggregates.realCarpoolingChoices > 0 ? 'dobrze' : 'wymaga uwagi', value: `${aggregates.transportEfficiency}%`, description: 'Efektywność floty i realnych wyborów carpooling.' },
      { name: 'RSVP / Catering', status: aggregates.foodWasteRisk > 25 ? 'ryzyko' : 'dobrze', value: `${aggregates.foodWasteRisk}%`, description: 'Ryzyko nadwyżek jedzenia zależne od niepotwierdzonych RSVP.' },
      { name: 'Menu', status: aggregates.vegeMeals > 0 ? 'dobrze' : 'wymaga uwagi', value: `${aggregates.vegeMeals}`, description: 'Liczba pozycji vege / vegan wykrytych w menu.' },
      { name: 'Gadżety', status: aggregates.gadgetWasteRisk > 30 ? 'ryzyko' : 'dobrze', value: `${aggregates.gadgetWasteRisk}%`, description: 'Ryzyko nadwyżek gadżetów względem wyborów uczestników.' },
      { name: 'Materiały cyfrowe', status: aggregates.avoidedPrintsCount > 0 ? 'dobrze' : 'monitoring', value: `${aggregates.avoidedPrintsCount}`, description: 'Uniknięte wydruki dzięki stronie gościa i Event Pass.' },
      { name: 'Budżet', status: aggregates.estimatedCostSavings > 0 ? 'dobrze' : 'monitoring', value: `${aggregates.estimatedCostSavings} PLN`, description: 'Szacowany potencjał oszczędności operacyjnych.' },
      { name: 'Podwykonawcy', status: aggregates.localSuppliersCount > 0 ? 'dobrze' : 'wymaga uwagi', value: `${aggregates.localSuppliersCount}`, description: 'Lokalni lub wysoko ocenieni dostawcy.' },
      { name: 'ReSOLVE', status: aggregates.circularityScore >= 60 ? 'dobrze' : 'wymaga uwagi', value: `${aggregates.circularityScore}%`, description: 'Syntetyczny wynik obiegu zamkniętego.' },
    ],
    ai_summary: 'Raport fallback został wygenerowany lokalnie na podstawie zagregowanych danych wydarzenia.',
    confidence: 'fallback',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { eventId } = await req.json()

    if (!eventId) {
      return new Response(JSON.stringify({ error: 'Missing eventId' }), {
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

    const [
      eventResult,
      applications,
      attendeeUnits,
      meals,
      mealChoices,
      gadgets,
      gadgetChoices,
      transportChoices,
      carpoolingAds,
      carpoolingReservations,
      cateringOffers,
      contractors,
      budgetItems,
      fleet,
    ] = await Promise.all([
      supabase.from('b2b_events').select('id, title, menu_section_visible, gadgets_section_visible, transport_section_visible, eventpass_section_visible, materials_section_visible').eq('id', eventId).single(),
      safeSelect(supabase, 'b2b_applications', 'status, rsvp_status, access_status, ticket_status, is_active_participant, transport', eventId),
      safeSelect(supabase, 'event_attendee_units', 'unit_type, age_group, checked_in, qr_token, wristband_issued', eventId),
      safeSelect(supabase, 'event_meals', 'name, dietary_category, meal_type, max_portions, reserved_portions, is_active', eventId),
      safeSelect(supabase, 'event_attendee_meal_choices', 'meal_id, quantity, status', eventId),
      safeSelect(supabase, 'event_gadgets', 'stock_quantity, quantity, total_quantity, max_per_person, track_stock, is_active, allow_decline', eventId),
      safeSelect(supabase, 'event_attendee_gadget_choices', 'gadget_id, quantity, status, declined_gadget', eventId),
      safeSelect(supabase, 'event_attendee_transport_choices', 'transport, transport_type, status', eventId),
      safeSelect(supabase, 'carpooling_ads', 'seats_avail, used, status', eventId),
      safeSelect(supabase, 'carpooling_reservations', 'status', eventId),
      safeSelect(supabase, 'event_catering_offers', 'avoids_plastic, local_products, reusable_packaging, food_donation_possible, portioning_by_rsvp, supplier_city, status', eventId),
      safeSelect(supabase, 'contractors', 'is_local, local_supplier, local, eco_score, sustainability_score, city', eventId),
      safeSelect(supabase, 'event_budget_items', 'category, amount, estimated_cost, actual_cost, type, contractor_id, status', eventId),
      safeSelect(supabase, 'transport_fleet', 'capacity, seats, max_passengers, occupied', eventId),
    ])

    if (eventResult.error) {
      console.warn('Eco analysis event load error:', eventResult.error.message)
    }

    const safeApplications = safeArray(applications)
    const safeAttendeeUnits = safeArray(attendeeUnits)
    const safeMeals = safeArray(meals)
    const safeMealChoices = safeArray(mealChoices)
    const safeGadgets = safeArray(gadgets)
    const safeGadgetChoices = safeArray(gadgetChoices)
    const safeTransportChoices = safeArray(transportChoices)
    const safeCarpoolingAds = safeArray(carpoolingAds)
    const safeCarpoolingReservations = safeArray(carpoolingReservations)
    const safeCateringOffers = safeArray(cateringOffers)
    const safeContractors = safeArray(contractors)
    const safeBudgetItems = safeArray(budgetItems)
    const safeFleet = safeArray(fleet)

    const totalApplications = safeApplications.length
    const confirmedRsvp = safeApplications.filter((app: Record<string, unknown>) =>
      isConfirmedRsvp(app.rsvp_status || app.status || app.access_status)
    ).length
    const approvedParticipants = safeApplications.filter((app: Record<string, unknown>) =>
      ['active', 'accepted', 'approved', 'zaakceptowane', 'confirmed', 'potwierdzone'].includes(String(app.access_status || app.status || '').toLowerCase())
    ).length
    const activeParticipantsCount = Math.max(approvedParticipants, safeAttendeeUnits.length, confirmedRsvp, totalApplications)

    const vegeMeals = safeMeals.filter((meal: Record<string, unknown>) =>
      includesAny(`${meal.dietary_category || ''} ${meal.meal_type || ''} ${meal.name || ''}`, ['vege', 'vegetarian', 'wegetariań', 'vegan', 'wegan', 'plant'])
    ).length
    const selectedMeals = safeMealChoices.filter((choice: Record<string, unknown>) => String(choice.status || '').toLowerCase() !== 'cancelled').length
    const gadgetReserved = safeGadgetChoices.filter((choice: Record<string, unknown>) =>
      choice.declined_gadget !== true && !['declined', 'cancelled'].includes(String(choice.status || '').toLowerCase())
    ).reduce((sum: number, choice: Record<string, unknown>) => sum + numberValue(choice.quantity, 1), 0)
    const gadgetDeclines = safeGadgetChoices.filter((choice: Record<string, unknown>) => choice.declined_gadget === true || String(choice.status || '').toLowerCase() === 'declined').length
    const gadgetStock = safeGadgets.reduce((sum: number, gadget: Record<string, unknown>) =>
      sum + numberValue(gadget.stock_quantity || gadget.quantity || gadget.total_quantity), 0
    )
    const gadgetOverstockCount = Math.max(gadgetStock - gadgetReserved, 0)
    const gadgetWasteRisk = gadgetStock > 0 ? Math.round((gadgetOverstockCount / gadgetStock) * 100) : 0

    const realCarpoolingChoices = safeTransportChoices.filter((choice: Record<string, unknown>) =>
      includesAny(`${choice.transport || ''} ${choice.transport_type || ''}`, ['carpool'])
    ).length || safeApplications.filter((app: Record<string, unknown>) => includesAny(app.transport, ['carpool'])).length
    const activeCarpoolAds = safeCarpoolingAds.filter((ad: Record<string, unknown>) => !ad.status || String(ad.status).toLowerCase() === 'active').length
    const reservedCarpoolSeats = safeCarpoolingReservations.filter((reservation: Record<string, unknown>) => String(reservation.status || '').toLowerCase() === 'reserved').length
    const fleetCapacity = safeFleet.reduce((sum: number, vehicle: Record<string, unknown>) =>
      sum + numberValue(vehicle.capacity || vehicle.seats || vehicle.max_passengers), 0
    )
    const transportEfficiency = fleetCapacity > 0
      ? Math.min(100, Math.round((activeParticipantsCount / fleetCapacity) * 100))
      : realCarpoolingChoices > 0
        ? Math.min(100, Math.round((realCarpoolingChoices / Math.max(activeParticipantsCount, 1)) * 100))
        : 0

    const localSuppliersCount = safeContractors.filter((contractor: Record<string, unknown>) => {
      const localFlag = contractor.is_local === true || contractor.local_supplier === true || contractor.local === true
      const ecoScore = numberValue(contractor.eco_score || contractor.sustainability_score)
      return localFlag || ecoScore >= 70
    }).length

    const cateringEcoSignals = safeCateringOffers.filter((offer: Record<string, unknown>) =>
      offer.avoids_plastic === true ||
      offer.local_products === true ||
      offer.reusable_packaging === true ||
      offer.food_donation_possible === true ||
      offer.portioning_by_rsvp === true
    ).length

    const avoidedPrintsCount = totalApplications * 3 + activeParticipantsCount
    const paperSavedKg = round(avoidedPrintsCount * 0.005)
    const foodWastePortionsRisk = Math.max(totalApplications - confirmedRsvp, 0)
    const foodWasteRisk = totalApplications > 0 ? Math.round((foodWastePortionsRisk / totalApplications) * 100) : 0
    const digitalInvitesCo2 = round(totalApplications * 0.16)
    const transportCo2 = round((Math.max(realCarpoolingChoices, reservedCarpoolSeats) * 2.4) + (fleetCapacity > 0 ? 1.8 : 0))
    const plasticCo2 = round(activeParticipantsCount * 0.1)
    const menuCo2 = round(vegeMeals * 1.2)
    const gadgetsCo2 = round(Math.max(gadgetReserved, gadgetDeclines) * 0.25)
    const estimatedCostSavings = Math.round((avoidedPrintsCount * 0.5) + (gadgetOverstockCount * 15) + (foodWastePortionsRisk * 45 * 0.35))
    const localBudgetShare = safeContractors.length > 0 ? Math.round((localSuppliersCount / safeContractors.length) * 100) : 0
    const proEcoDecisions = [
      totalApplications > 0,
      realCarpoolingChoices > 0,
      reservedCarpoolSeats > 0,
      vegeMeals > 0,
      gadgetReserved > 0 || gadgetDeclines > 0,
      localSuppliersCount > 0,
      cateringEcoSignals > 0,
      safeBudgetItems.length > 0,
      eventResult.data?.eventpass_section_visible === true,
      eventResult.data?.materials_section_visible === true,
    ].filter(Boolean).length

    const circularityScore = Math.min(100,
      (avoidedPrintsCount > 0 ? 20 : 0) +
      (confirmedRsvp > 0 && foodWasteRisk < 25 ? 20 : 0) +
      (realCarpoolingChoices > 0 || transportEfficiency > 50 ? 20 : 0) +
      (vegeMeals > 0 ? 15 : 0) +
      (localSuppliersCount > 0 ? 15 : 0) +
      (gadgetReserved > 0 || gadgetWasteRisk < 30 ? 10 : 0)
    )

    const fallbackReport = buildFallbackReport({
      totalApplications,
      activeParticipantsCount,
      confirmedRsvp,
      digitalInvitesCo2,
      transportCo2,
      plasticCo2,
      menuCo2,
      gadgetsCo2,
      paperSavedKg,
      avoidedPrintsCount,
      foodWastePortionsRisk,
      foodWasteRisk,
      gadgetReserved,
      gadgetStock,
      gadgetOverstockCount,
      gadgetWasteRisk,
      realCarpoolingChoices,
      activeCarpoolAds,
      transportEfficiency,
      localSuppliersCount,
      localBudgetShare,
      estimatedCostSavings,
      circularityScore,
      proEcoDecisions,
      vegeMeals,
      selectedMeals,
    })

    let report = fallbackReport
    let provider = Deno.env.get('AI_PROVIDER') || 'deepseek'
    let model = Deno.env.get('AI_MODEL') || 'deepseek-chat'

    try {
      const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
      if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY')

      const aiPayload = {
        totalApplications,
        activeParticipantsCount,
        confirmedRsvp,
        unconfirmedRsvp: Math.max(totalApplications - confirmedRsvp, 0),
        menuOptions: safeMeals.length,
        vegeMeals,
        selectedMeals,
        gadgetsCount: safeGadgets.length,
        selectedGadgets: gadgetReserved,
        declinedGadgets: gadgetDeclines,
        gadgetStock,
        gadgetOverstockCount,
        activeCarpoolAds,
        carpoolingReservations: reservedCarpoolSeats,
        realCarpoolingChoices,
        transportChoices: safeTransportChoices.length,
        fleetCapacity,
        cateringEcoSignals,
        cateringOffersCount: safeCateringOffers.length,
        localSuppliersCount,
        contractorsCount: safeContractors.length,
        budgetItemsCount: safeBudgetItems.length,
        budgetTotal: safeBudgetItems.reduce((sum: number, item: Record<string, unknown>) =>
          sum + numberValue(item.actual_cost || item.estimated_cost || item.amount), 0
        ),
        fallbackReport,
      }

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
              content: 'Jesteś AI Eco Engine dla planera wydarzeń. Odpowiadasz wyłącznie poprawnym JSON-em. Nie prosisz o dane osobowe. Analizujesz tylko agregaty i zwracasz praktyczne rekomendacje GOZ po polsku.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                task: 'Wygeneruj raport ekologiczny wydarzenia. Zachowaj dokładnie wymagane klucze i używaj liczb, nie stringów, dla metryk liczbowych.',
                requiredShape: {
                  total_co2_saved: 'number',
                  digital_invites_co2: 'number',
                  transport_co2: 'number',
                  plastic_co2: 'number',
                  paper_saved_kg: 'number',
                  menu_co2: 'number',
                  gadgets_co2: 'number',
                  food_waste_risk: 'number',
                  transport_efficiency: 'number',
                  circularity_score: 'number',
                  local_suppliers_count: 'number',
                  trees_equivalent: 'number',
                  km_equivalent: 'number',
                  resolve_score: { virtualize: 'number', optimizeShare: 'number', loop: 'number', exchange: 'number', regenerate: 'number' },
                  recommendations: 'array',
                  sources: 'array',
                  scenarios: 'object',
                  areas: 'array',
                  ai_summary: 'string',
                  confidence: 'string',
                },
                aggregates: aiPayload,
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

      report = normalizeReport(parseAiJson(content), { ...fallbackReport, confidence: 'ai' })
      report.confidence = report.confidence === 'fallback' ? 'ai' : report.confidence
    } catch (aiError) {
      console.warn('DeepSeek eco analysis fallback:', aiError instanceof Error ? aiError.message : aiError)
      report = fallbackReport
      provider = provider || 'deepseek'
      model = model || 'fallback'
    }

    const payload = {
      event_id: eventId,
      report,
      provider,
      model,
      confidence: report.confidence,
      updated_at: new Date().toISOString(),
    }

    const { error: saveError } = await supabase
      .from('eco_ai_reports')
      .upsert(payload, { onConflict: 'event_id' })

    if (saveError) {
      console.warn('Eco AI report save error:', saveError.message)
    }

    return new Response(JSON.stringify({ report, saveError: saveError?.message || null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('generate-eco-analysis error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
