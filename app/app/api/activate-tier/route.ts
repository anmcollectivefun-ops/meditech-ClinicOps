import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET!

// Używamy service_role żeby ominąć RLS (to jest webhook, nie user)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Weryfikacja autoryzacji
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event_id, tier, order_id } = await req.json()

  if (!event_id || !['web', 'pro'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Aktualizacja tieru
  const { error } = await supabase
    .from('events')
    .update({ tier, last_order_id: order_id })
    .eq('id', event_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}