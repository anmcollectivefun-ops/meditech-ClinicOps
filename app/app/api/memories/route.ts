import { NextResponse } from 'next/server'
import { createClient } from '../../lib/supabase'

// 1. NAGŁÓWKI CORS - pozwalają na komunikację z Twoimi stronami WWW
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Zezwala na dostęp z każdej domeny
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 2. METODA OPTIONS - Przeglądarka zawsze wykonuje tzw. "preflight request" z innej domeny
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { event_id, added_by, file_url, file_type } = await request.json()

    if (!event_id || !file_url) {
      return NextResponse.json({ message: 'Brak wymaganych danych' }, { status: 400, headers: corsHeaders })
    }

    const supabase = createClient()

    const { data, error } = await supabase.from('memories').insert([{
      event_id,
      added_by: added_by || 'Gość',
      file_url,
      file_type: file_type || 'image',
    }]).select().single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400, headers: corsHeaders })
    }

    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders })
  } catch (err) {
    return NextResponse.json({ message: 'Błąd serwera' }, { status: 500, headers: corsHeaders })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')

    if (!event_id) {
      return NextResponse.json({ message: 'Brak event_id' }, { status: 400, headers: corsHeaders })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400, headers: corsHeaders })
    }

    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders })
  } catch (err) {
    return NextResponse.json({ message: 'Błąd serwera' }, { status: 500, headers: corsHeaders })
  }
}