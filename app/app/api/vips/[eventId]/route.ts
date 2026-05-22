import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Gwarantuje, że Vercel zawsze prześle świeże dane, zamiast blokować je w pamięci
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  // 1. POBIERAMY WSZYSTKICH przypisanych do eventu
  const { data, error } = await supabase
    .from('vips')
    .select('id, name, role, description, photo_url')
    .eq('event_id', eventId)
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, {
    status: 500,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });

  const vips = data || [];

  // 2. Pełna lista ról rodzinnych (zaktualizowana o nowe statusy)
  const familyRoles = [
    'Partner', 'Partnerka', 'Mąż', 'Żona', 'Mama', 'Tata', 'Teściowa', 'Teść', 
    'Ojczym', 'Macocha', 'Rodzic', 'Babcia', 'Dziadek', 'Wnuczek', 'Wnuczka', 
    'Ciocia', 'Wujek', 'Siostra', 'Brat', 'Rodzeństwo', 'Córka', 'Syn', 'Dziecko', 
    'Przyszła Mama', 'Przyszły Tata'
  ];

  // 3. Rozdzielenie na grupy docelowe
  // Klucze wyjściowe (parents, witnesses) pozostawione dla kompatybilności wstecznej
  const parents = vips.filter(vip => familyRoles.includes(vip.role));
  const witnesses = vips.filter(vip => !familyRoles.includes(vip.role));

  return NextResponse.json({ 
    vips,        
    parents,     // Rodzina (teraz zawiera też mężów, żony, wnuków itd.)
    witnesses    // Ekipa ratunkowa, świadkowie, pomocnicy, przyjaciele
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}