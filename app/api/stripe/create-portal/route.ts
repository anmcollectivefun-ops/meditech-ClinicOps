import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // Weryfikacja zalogowanego użytkownika
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacji' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const body = await req.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'Brak ID wydarzenia' }, { status: 400 })
    }

    // Pobierz stripe_customer_id z bazy — po numerze eventu i user_id (bezpieczne)
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, stripe_customer_id, title')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Wydarzenie nie znalezione lub brak dostępu' }, { status: 404 })
    }

    if (!event.stripe_customer_id) {
      return NextResponse.json({ error: 'Brak powiązanego konta Stripe dla tego wydarzenia' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: event.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/b2b/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Błąd Stripe Portal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}