import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 1. WYŁĄCZENIE PAMIĘCI PODRĘCZNEJ (Zawsze świeże dane!)
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Poprawione wyciąganie ID zgodnie z najnowszym standardem Next.js
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Brak ID wydarzenia' }, { status: 400 })
    }

    const { data: event, error } = await supabase
      .from('events')
      // TUTAJ JEST ZMIANA - dodane: type, event_years, gender
      .select('title, type, event_date, event_time, event_years, gender, hero_names, hero_img_left, hero_img_center, hero_img_right, ceremony_info, party_info, map_iframe')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Nie znaleziono wydarzenia' }, { status: 404 })
    }

    // 2. NAGŁÓWKI CORS (Pozwalają na odczyt z innej domeny - WordPressa)
    return NextResponse.json(event, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}