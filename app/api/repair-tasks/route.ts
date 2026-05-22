import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTasksForEventType } from '../../lib/taskLibrary'

// Service role omija RLS — endpoint tylko dla zalogowanego właściciela
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Weryfikacja: tylko zalogowany użytkownik może wywołać naprawę swoich eventów
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu autoryzacji' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
  }

  // Pobierz wszystkie eventy użytkownika
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('id, type')
    .eq('user_id', user.id)

  if (eventsError || !events) {
    return NextResponse.json({ error: 'Błąd pobierania eventów', details: eventsError?.message }, { status: 500 })
  }

  const results: { eventId: string; type: string; action: string; count?: number; error?: string }[] = []

  for (const event of events) {
    // Sprawdź czy event ma już zadania
    const { count } = await supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)

    if (count !== null && count > 0) {
      results.push({ eventId: event.id, type: event.type, action: 'skipped', count })
      continue
    }

    // Brak zadań — seedujemy
    const tasksToInsert = getTasksForEventType(event.type).map(({ title, stage, category, points }) => ({
      title,
      stage,
      category,
      points,
      event_id: event.id,
      status: false,
    }))

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('tasks')
      .insert(tasksToInsert)
      .select('id')

    if (insertError) {
      results.push({ eventId: event.id, type: event.type, action: 'error', error: insertError.message })
    } else {
      results.push({ eventId: event.id, type: event.type, action: 'seeded', count: inserted?.length ?? tasksToInsert.length })
    }
  }

  const seeded = results.filter(r => r.action === 'seeded')
  const skipped = results.filter(r => r.action === 'skipped')
  const errors = results.filter(r => r.action === 'error')

  return NextResponse.json({
    message: `Naprawa zakończona. Zaseedowano: ${seeded.length}, Pominięto (miały zadania): ${skipped.length}, Błędy: ${errors.length}`,
    results,
  })
}