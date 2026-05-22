import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  // Pobieramy 3 rzeczy naraz!
  const [scheduleReq, infoReq, menuReq] = await Promise.all([
    supabase.from('schedule_items').select('*').eq('event_id', eventId).order('time', { ascending: true }),
    supabase.from('info_items').select('*').eq('event_id', eventId).order('created_at', { ascending: true }),
    supabase.from('menu_items').select('*').eq('event_id', eventId).order('created_at', { ascending: true })
  ]);

  // Sortowanie chronologiczne harmonogramu po stronie aplikacji — zabezpiecza przed
  // niepoprawnym lexikograficznym sortowaniem gdy kolumna 'time' jest typem text
  // i zawiera godziny bez wiodącego zera (np. "9:00" zamiast "09:00").
  const parseTime = (t: string | null): number => {
    if (!t) return Infinity
    const [h, m] = t.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const sortedSchedule = (scheduleReq.data || []).slice().sort(
    (a, b) => parseTime(a.time) - parseTime(b.time)
  )

  return NextResponse.json({
    schedule: sortedSchedule,
    info: infoReq.data || [],
    menu: menuReq.data || []
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
}