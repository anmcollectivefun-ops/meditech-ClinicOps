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
  const { eventId } = await params

  const { data, error } = await supabase
    .from('gifts')
    .select('slot_id, type, name, description, photo_url, reserved, reserved_by, iban, account_holder')
    .eq('event_id', eventId)
    .order('type')
    .order('slot_id')

  if (error) return NextResponse.json({ error: error.message }, {
    status: 500,
    headers: { 'Access-Control-Allow-Origin': '*' }
  })

  return NextResponse.json({ gifts: data || [] }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}