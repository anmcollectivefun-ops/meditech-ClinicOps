import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
  }

  const { taskId, status, completedAt } = await req.json()
  if (!taskId) {
    return NextResponse.json({ error: 'Brak taskId' }, { status: 400 })
  }

  // Sprawdź czy task należy do eventu użytkownika
  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('id, event_id')
    .eq('id', taskId)
    .single()

  if (!task) {
    return NextResponse.json({ error: 'Task nie znaleziony' }, { status: 404 })
  }

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', task.event_id)
    .eq('user_id', user.id)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Brak uprawnień do tego zadania' }, { status: 403 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('tasks')
    .update({ status, completed_at: completedAt ?? null })
    .eq('id', taskId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}