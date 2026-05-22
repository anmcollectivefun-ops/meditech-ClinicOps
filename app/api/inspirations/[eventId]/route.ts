import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicjalizacja klienta Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Nagłówki CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Obsługa zapytania preflight (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// GŁÓWNA METODA GET
// Zwróć uwagę na zmianę w typowaniu 'params' (teraz to Promise)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // W nowym Next.js musimy "poczekać" (await) na parametry
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Brak ID wydarzenia' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Pobieranie danych z bazy
    const { data, error } = await supabase
      .from('inspirations')
      .select('*')
      .eq('event_id', eventId)
      .single()

    // Brak danych to nie błąd krytyczny – po prostu Panna Młoda jeszcze nic nie zapisała
    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { message: 'Brak zapisanych inspiracji dla tego wydarzenia', data: null },
        { status: 200, headers: corsHeaders }
      )
    }

    if (error) {
      throw error
    }

    // Zwracamy dane do WordPressa
    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders,
    })

  } catch (error: any) {
    console.error('Błąd w API inspiracji:', error)
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500, headers: corsHeaders }
    )
  }
}