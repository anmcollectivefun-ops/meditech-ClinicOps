import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// === NAGŁÓWKI CORS (Zezwolenie na przyjmowanie danych ze strony WWW) ===
// ============================================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ============================================================================
// === FUNKCJE POMOCNICZE ===
// ============================================================================

const toBool = (val: any) => {
  if (Array.isArray(val)) val = val[0];
  if (!val) return false;
  const str = String(val).toLowerCase().trim();
  return ['tak', 'yes', 'true', 'on', '1'].includes(str);
};

const mapRsvp = (val: any): string => {
  if (!val) return 'Brak odpowiedzi';
  const str = String(val).toLowerCase().trim();
  if (str.includes('będę') || str.includes('bede') || str === 'tak') return 'Potwierdzone';
  if (str.includes('nie dam') || str.startsWith('nie')) return 'Odmowa';
  return 'Brak odpowiedzi';
};

const mapDiet = (val: any): string => {
  if (!val) return 'Brak';
  const str = String(val).toLowerCase().trim();
  if (str.includes('mięs') || str.includes('mies')) return 'Mięsne';
  if (str.includes('wege') || str.includes('vege')) return 'Vege';
  if (str.includes('laktoz')) return 'Bezlaktozy';
  if (str === 'inne') return 'Inne';
  return 'Brak';
};

const parseChildren = (val: any): number => {
  if (Array.isArray(val)) val = val[0];
  if (!val) return 0;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? 0 : n;
};

// ============================================================================
// === GŁÓWNY ENDPOINT POST ===
// ============================================================================

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('=== NOWE ZGŁOSZENIE (WEBHOOK) ===');
    
    let formData: any = {};
    if (contentType.includes('application/json')) {
      formData = await request.json();
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const form = await request.formData();
      formData = Object.fromEntries(form.entries());
    } else {
      const raw = await request.text();
      try {
        formData = JSON.parse(raw);
      } catch {
        formData = Object.fromEntries(new URLSearchParams(raw));
      }
    }

    const eventId = formData.event_id || null;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Brak event_id — upewnij się, że formularz przesyła event_id' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ========================================================================
    // 🎀 ZWROTNICA DLA BABY SHOWER ANKIETY
    // ========================================================================
    if (
      formData.guessed_birth_date ||
      formData.guessed_hair_color ||
      formData.guessed_height ||
      formData.guessed_name_length ||
      formData.guessed_weight ||
      formData.guessed_eye_color ||
      formData.guessed_initials ||
      formData.guessed_sibling ||
      formData.character_guess
    ) {
      console.log('🎀 Wykryto zgłoszenie Baby Shower!');
      const guestName = formData.name || formData.imie_i_nazwisko || formData.first_name || 'Anonimowy gość';
      
      const babyShowerData = {
        event_id: eventId,
        guest_name: guestName,
        guest_email: formData.email || null,
        guest_phone: formData.phone || formData.telefon || null,
        guessed_birth_date: formData.guessed_birth_date || null,
        guessed_hair_color: formData.guessed_hair_color || null,
        guessed_height: formData.guessed_height ? parseFloat(formData.guessed_height) : null,
        guessed_name_length: formData.guessed_name_length ? parseInt(formData.guessed_name_length) : null,
        guessed_weight: formData.guessed_weight ? parseFloat(formData.guessed_weight) : null,
        guessed_eye_color: formData.guessed_eye_color || null,
        guessed_initials: formData.guessed_initials ? String(formData.guessed_initials).toUpperCase() : null,
        guessed_sibling: formData.guessed_sibling || null,
        character_guess: formData.character_guess || null,
        source: 'guest'
      };

      const { data, error } = await supabase.from('baby_shower_responses').insert([babyShowerData]).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ message: 'Odpowiedź zapisana pomyślnie!', action: 'baby_shower_added' }, { status: 200, headers: corsHeaders });
    }

    // ========================================================================
    // 🚨 ZWROTNICA DLA EKIPY RATUNKOWEJ (VIP + ZADANIE)
    // ========================================================================
    if (formData.form_type === 'rescue_team') {
      console.log('🚨 Wykryto zgłoszenie do Ekipy Ratunkowej!');

      const heroName = formData.name || 'Nieznany Bohater';
      const heroEmail = formData.email || null;
      const heroPhone = formData.phone || null;
      const missionType = formData.mission_type || 'Tajnia misja';
      const missionDetails = formData.mission_details || 'Brak dodatkowych uwag';

      // 1. Zapis do VIP (żeby wyświetlić na WWW po zatwierdzeniu)
      const { data: vipData, error: vipError } = await supabase
        .from('vips')
        .insert({
          event_id: eventId,
          name: heroName,
          phone: heroPhone,
          email: heroEmail,
          role: 'Ratownik',
          description: `Misja: ${missionType} | Szczegóły: ${missionDetails}`,
          show_on_website: false,
        })
        .select()
        .single();

      if (vipError) return NextResponse.json({ error: vipError.message }, { status: 500, headers: corsHeaders });

      // 2. Zapis jako zadanie (Task) dla Mamy
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          event_id: eventId,
          title: `🆘 Misja Ratunkowa: ${missionType} (${heroName})`,
          description: `Kontakt: ${heroPhone || 'Brak tel'} | ${heroEmail || 'Brak email'}\n\nSzczegóły od bohatera:\n${missionDetails}`,
          status: 'do_zrobienia', 
        });

      if (taskError) console.error('❌ Błąd tworzenia zadania:', taskError);

      return NextResponse.json({ message: 'Zgłoszenie ratunkowe przyjęte!', action: 'rescue_added_with_task' }, { status: 200, headers: corsHeaders });
    }

    // ========================================================================
    // ⏳ ZWROTNICA DLA KAPSUŁKI CZASU
    // ========================================================================
    if (formData.Kapsu_ka || formData.open_date) {
      const { data, error } = await supabase.from('time_capsules').insert({
        event_id: eventId, author: formData.author || 'Nieznany nadawca', open_date: formData.open_date || 'Nieznana data', message: formData.description || 'Brak wiadomości', source: 'gosc' 
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ message: 'Kapsułka zapisana!', action: 'capsule_added' }, { status: 200, headers: corsHeaders });
    }

    // ========================================================================
    // 🎵 ZWROTNICA DLA FORMULARZA MUZYCZNEGO
    // ========================================================================
    if (formData.artist || formData.title) {
      const { data, error } = await supabase.from('playlist').insert({
        event_id: eventId, artist: formData.artist || 'Nieznany wykonawca', title: formData.title || 'Nieznany tytuł', added_by: formData.added_by || formData.added || formData.od_kogo || 'Gość', source: 'gosc'
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ message: 'Utwór zapisany!', action: 'music_added' }, { status: 200, headers: corsHeaders });
    }

    // ========================================================================
    // 🎁 ZWROTNICA DLA REZERWACJI PREZENTÓW
    // ========================================================================
    if (formData.rezerwacja) {
      const rezerwacja = String(formData.rezerwacja);
      const slotMatch = rezerwacja.match(/\d+/);
      const slotId = slotMatch ? parseInt(slotMatch[0]) : null;

      if (!slotId || slotId < 1 || slotId > 6) return NextResponse.json({ error: 'Nieprawidłowy numer prezentu' }, { status: 400, headers: corsHeaders });

      const { data: existing } = await supabase.from('gifts').select('reserved, reserved_by').eq('event_id', eventId).eq('slot_id', slotId).eq('type', 'gift').maybeSingle();
      if (existing?.reserved) return NextResponse.json({ message: 'Ten prezent jest już zarezerwowany', action: 'already_reserved' }, { status: 409, headers: corsHeaders });

      const { error } = await supabase.from('gifts').update({ reserved: true, reserved_by: formData.name || formData.imie_i_nazwisko || 'Gość', reserved_at: new Date().toISOString() }).eq('event_id', eventId).eq('slot_id', slotId).eq('type', 'gift');
      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ message: 'Rezerwacja zapisana!', action: 'gift_reserved', slotId }, { status: 200, headers: corsHeaders });
    }

    // ========================================================================
    // 👥 STANDARDOWY SCENARIUSZ RSVP (GOŚĆ)
    // ========================================================================
    const guestName = formData.name || formData.imie_i_nazwisko || 'Nieznany gość';
    const guestEmail = formData.email || null;
    const guestPhone = formData.phone || formData.telefon || null;

    let existingGuest: any = null;

    if (guestEmail) {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).eq('email', guestEmail).maybeSingle();
      if (data) existingGuest = data;
    }
    if (!existingGuest && guestPhone) {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).eq('phone', guestPhone).maybeSingle();
      if (data) existingGuest = data;
    }
    if (!existingGuest && guestName !== 'Nieznany gość') {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).ilike('name', guestName).maybeSingle();
      if (data) existingGuest = data;
    }

    const guestData = {
      event_id: eventId,
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      rsvp_status: mapRsvp(formData.rsvp_status || formData.RSVP),
      plus_one: toBool(formData.companion || formData.osoba_towarzyszaca),
      children_count: toBool(formData.plus_one || formData.z_dziecmi) ? parseChildren(formData.children_count) : 0,
      diet: mapDiet(formData.diet),
      allergies: toBool(formData.allergies) ? (formData.allergy_text || 'Tak (brak opisu)') : 'Brak',
      accommodation: toBool(formData.needs_accommodation || formData.nocleg),
      needs_accommodation: toBool(formData.needs_accommodation || formData.nocleg),
      needs_transport: toBool(formData.needs_transport || formData.transport),
      message: formData.message || formData.wiadomosc || null,
    };

    if (existingGuest) {
      const { error } = await supabase.from('guests').update(guestData).eq('id', existingGuest.id);
      if (error) throw error;
      return NextResponse.json({ message: 'Dane zaktualizowane!', action: 'updated' }, { status: 200, headers: corsHeaders });
    } else {
      const { data, error } = await supabase.from('guests').insert([{ ...guestData, invitation_sent: false, relationship: 'Rodzina' }]).select().single();
      if (error) throw error;
      return NextResponse.json({ message: 'Nowy gość dodany!', action: 'created', guestId: data.id }, { status: 200, headers: corsHeaders });
    }

  } catch (error: any) {
    console.error('❌ Błąd krytyczny:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500, headers: corsHeaders });
  }
}