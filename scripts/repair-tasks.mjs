import { createClient } from '@supabase/supabase-js'

// Używamy zmiennych środowiskowych, aby nie publikować kluczy na GitHubie
const SUPABASE_URL = 'https://zzpwsqeftniacsnelpoc.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Błąd: Brak zmiennej środowiskowej SUPABASE_SERVICE_ROLE_KEY!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ============================================================================
// Zadania uniwersalne (z taskLibrary.ts)
// ============================================================================
const UNIVERSAL_TASKS = [
  { stage: 1, category: 'system', points: 30, title: 'Ustalenie budżetu wydarzenia', icon: '💰' },
  { stage: 1, category: 'system', points: 40, title: 'Wybór i rezerwacja miejsca', icon: '📍' },
  { stage: 1, category: 'system', points: 25, title: 'Ustalenie daty i godziny', icon: '📅' },
  { stage: 1, category: 'system', points: 20, title: 'Wstępna lista gości', icon: '👥' },
  { stage: 2, category: 'system', points: 35, title: 'Rezerwacja fotografa', icon: '📸' },
  { stage: 2, category: 'system', points: 30, title: 'Catering lub menu z lokalem', icon: '🍽️' },
  { stage: 2, category: 'system', points: 25, title: 'Dekoracje i motyw przewodni', icon: '🎨' },
  { stage: 3, category: 'system', points: 30, title: 'Projekt i zamówienie zaproszeń', icon: '✉️' },
  { stage: 3, category: 'system', points: 25, title: 'Ubiór na wydarzenie', icon: '👔' },
  { stage: 3, category: 'system', points: 20, title: 'Lista potrzebnych rzeczy i zakupów', icon: '🛒' },
  { stage: 4, category: 'system', points: 30, title: 'Wysłanie zaproszeń do gości', icon: '📨' },
  { stage: 4, category: 'system', points: 20, title: 'Organizacja transportu / noclegów', icon: '🚗' },
  { stage: 4, category: 'system', points: 20, title: 'Playlista / muzyka na wydarzenie', icon: '🎵' },
  { stage: 5, category: 'system', points: 30, title: 'Zebranie RSVP — ostateczna lista', icon: '✅' },
  { stage: 5, category: 'system', points: 25, title: 'Plan usadzenia gości', icon: '🪑' },
  { stage: 5, category: 'system', points: 15, title: 'Zakup prezentów podziękowań dla gości', icon: '🎁' },
  { stage: 6, category: 'system', points: 20, title: 'Potwierdzenie godzin z ekipą', icon: '📞' },
  { stage: 6, category: 'system', points: 15, title: 'Przygotowanie torby awaryjnej', icon: '👜' },
  { stage: 6, category: 'system', points: 10, title: 'Wypoczynek — dobrze się wyspać!', icon: '😴' },
  { stage: 7, category: 'system', points: 15, title: 'Pożywne śniadanie', icon: '🥐' },
  { stage: 7, category: 'system', points: 100, title: 'Cieszyć się chwilą! 🎉', icon: '🥂' },
]

const EVENT_OVERLAYS = {
  slub: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór rodzaju ślubu (cywilny/kościelny/konkordatowy)', icon: '💍' },
    { stage: 1, category: 'system', points: 35, title: 'Rezerwacja terminu w USC / parafii', icon: '⛪' },
    { stage: 2, category: 'system', points: 35, title: 'Rezerwacja DJ-a lub zespołu', icon: '🎤' },
    { stage: 2, category: 'system', points: 20, title: 'Wybór świadków', icon: '🤝' },
    { stage: 2, category: 'system', points: 25, title: 'Zapis na nauki przedmałżeńskie', icon: '📖' },
    { stage: 3, category: 'system', points: 30, title: 'Wybór i zamówienie obrączek', icon: '💫' },
    { stage: 3, category: 'system', points: 35, title: 'Zamówienie sukni ślubnej', icon: '👰' },
    { stage: 3, category: 'system', points: 25, title: 'Zakup garnituru i dodatków', icon: '🤵' },
    { stage: 4, category: 'system', points: 20, title: 'Wybór piosenki na pierwszy taniec', icon: '💃' },
    { stage: 5, category: 'system', points: 10, title: 'Rozchodzenie butów ślubnych', icon: '👠' },
    { stage: 6, category: 'system', points: 10, title: 'Manicure i pedicure', icon: '💅' },
  ],
  chrzciny: [
    { stage: 1, category: 'system', points: 35, title: 'Ustalenie terminu chrztu w parafii', icon: '⛪' },
    { stage: 1, category: 'system', points: 30, title: 'Wybór chrzestnych', icon: '👫' },
    { stage: 2, category: 'system', points: 20, title: 'Dokumenty z parafii (zaświadczenia)', icon: '📄' },
    { stage: 3, category: 'system', points: 25, title: 'Zakup szatki do chrztu', icon: '👶' },
    { stage: 3, category: 'system', points: 20, title: 'Świeca chrzcielna', icon: '🕯️' },
    { stage: 4, category: 'system', points: 20, title: 'Zamówienie tortu chrzcielnego', icon: '🎂' },
    { stage: 4, category: 'system', points: 15, title: 'Prezenty dla chrzestnych (podziękowania)', icon: '🎁' },
  ],
  komunia: [
    { stage: 1, category: 'system', points: 30, title: 'Rozmowa z katechetą / parafią', icon: '⛪' },
    { stage: 2, category: 'system', points: 30, title: 'Zakup alby/sukienki komunijnej', icon: '👗' },
    { stage: 2, category: 'system', points: 25, title: 'Buty i dodatki komunijne', icon: '👞' },
    { stage: 3, category: 'system', points: 20, title: 'Modlitewnik, świeca, różaniec', icon: '📿' },
    { stage: 3, category: 'system', points: 25, title: 'Pamiątka komunijna (różaniec/zegarek)', icon: '⌚' },
    { stage: 4, category: 'system', points: 25, title: 'Organizacja przyjęcia komunijnego', icon: '🍰' },
    { stage: 4, category: 'system', points: 15, title: 'Fryzjer / stylistka dziecka', icon: '💇' },
  ],
  urodziny18: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór klubu / restauracji / sali', icon: '🎊' },
    { stage: 2, category: 'system', points: 20, title: 'Motyw / dress code imprezy', icon: '🎭' },
    { stage: 3, category: 'system', points: 20, title: 'Zakup stylizacji urodzinowej', icon: '✨' },
    { stage: 3, category: 'system', points: 25, title: 'DJ / zespół / playlista', icon: '🎧' },
    { stage: 4, category: 'system', points: 20, title: 'Zamówienie tortu urodzinowego', icon: '🎂' },
    { stage: 4, category: 'system', points: 15, title: 'Alkohol / napoje na imprezę', icon: '🥂' },
    { stage: 5, category: 'system', points: 15, title: 'Dekoracje i balony', icon: '🎈' },
    { stage: 5, category: 'system', points: 10, title: 'Animacje / atrakcje (fotobudka, itp.)', icon: '📷' },
  ],
  urodziny: [
    { stage: 1, category: 'system', points: 20, title: 'Wybór formy (sala/dom/restauracja/plener)', icon: '🏠' },
    { stage: 2, category: 'system', points: 20, title: 'Motyw imprezy / dekoracje', icon: '🎨' },
    { stage: 3, category: 'system', points: 20, title: 'Zamówienie tortu', icon: '🎂' },
    { stage: 3, category: 'system', points: 15, title: 'Prezent dla solenizanta', icon: '🎁' },
    { stage: 4, category: 'system', points: 15, title: 'Atrakcje (gry, animator, muzyka)', icon: '🎮' },
    { stage: 5, category: 'system', points: 10, title: 'Balony, świeczki, serwetki', icon: '🎈' },
  ],
  baby_shower: [
    { stage: 1, category: 'system', points: 30, title: 'Wybór terminu (7-8 miesiąc ciąży)', icon: '🤰' },
    { stage: 2, category: 'system', points: 25, title: 'Motyw (różowy/niebieski/neutralny)', icon: '🎀' },
    { stage: 2, category: 'system', points: 20, title: 'Lista marzeń (wyprawka dla dziecka)', icon: '👶' },
    { stage: 3, category: 'system', points: 20, title: 'Zabawy i konkursy dla gości', icon: '🎲' },
    { stage: 3, category: 'system', points: 20, title: 'Słodki stół (cupcake, tort pieluchowy)', icon: '🧁' },
    { stage: 4, category: 'system', points: 15, title: 'Dekoracje w wybranym motywie', icon: '🎊' },
    { stage: 4, category: 'system', points: 10, title: 'Upominki dla gości (podziękowania)', icon: '💝' },
  ],
  gender_reveal: [
    { stage: 1, category: 'system', points: 35, title: 'Ustalenie sposobu ujawnienia płci', icon: '❓' },
    { stage: 2, category: 'system', points: 30, title: 'Przekazanie wyniku USG do cukierni/firmy', icon: '🤫' },
    { stage: 2, category: 'system', points: 20, title: 'Dekoracje w dwóch kolorach', icon: '💙' },
    { stage: 3, category: 'system', points: 25, title: 'Zamówienie "tortu tajemnicy"', icon: '🎂' },
    { stage: 3, category: 'system', points: 15, title: 'Gadżety do głosowania (team pink/blue)', icon: '🗳️' },
    { stage: 4, category: 'system', points: 20, title: 'Kamerzysta / fotograf na moment ujawnienia', icon: '📹' },
  ],
  jubileusz: [
    { stage: 1, category: 'system', points: 30, title: 'Wybór formy jubileuszu (oficjalny/rodzinny)', icon: '🎊' },
    { stage: 2, category: 'system', points: 25, title: 'Przygotowanie prezentacji/wspomnień', icon: '📽️' },
    { stage: 3, category: 'system', points: 20, title: 'Lista gości specjalnych (VIP)', icon: '⭐' },
    { stage: 3, category: 'system', points: 20, title: 'Przemowa / toast jubileuszowy', icon: '🎤' },
    { stage: 4, category: 'system', points: 20, title: 'Pamiątka jubileuszowa dla gości', icon: '🏆' },
    { stage: 4, category: 'system', points: 15, title: 'Tort jubileuszowy z datą', icon: '🎂' },
  ],
  rocznica: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór stylu celebracji (kameralnie/huczny)', icon: '💑' },
    { stage: 2, category: 'system', points: 25, title: 'Prezent symboliczny (wg tradycji rocznic)', icon: '💝' },
    { stage: 2, category: 'system', points: 20, title: 'Zapisy wspomnień / list do partnera', icon: '💌' },
    { stage: 3, category: 'system', points: 20, title: 'Odtworzenie pierwszej randki/podróży poślubnej', icon: '💕' },
    { stage: 4, category: 'system', points: 20, title: 'Tort / deser rocznicowy', icon: '🍰' },
  ],
  inne: [
    { stage: 2, category: 'system', points: 20, title: 'Cel wydarzenia — zapisz go w notatniku', icon: '🎯' },
    { stage: 3, category: 'system', points: 15, title: 'Scenariusz / plan minutowy', icon: '📝' },
  ],
}

function getTasksForEventType(eventType) {
  const normalized = (eventType || 'inne').toLowerCase().trim()
  const overlay = EVENT_OVERLAYS[normalized] || []
  return [...UNIVERSAL_TASKS, ...overlay].sort((a, b) => a.stage - b.stage)
}

async function repairTasks() {
  console.log('🔧 Start naprawy zadań...\n')

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, type, title')
    .order('created_at')

  if (eventsError) {
    console.error('❌ Błąd pobierania eventów:', eventsError.message)
    process.exit(1)
  }

  console.log(`📋 Znaleziono ${events.length} eventów:\n`)

  for (const event of events) {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)

    if (count > 0) {
      console.log(`   ✅ [${event.id}] "${event.title}" (${event.type}) — ma już ${count} zadań, pomijam`)
      continue
    }

    const tasksToInsert = getTasksForEventType(event.type).map(({ title, stage, category, points }) => ({
      title,
      stage,
      category,
      points,
      event_id: event.id,
      status: false,
    }))

    const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert)

    if (insertError) {
      console.error(`   ❌ [${event.id}] "${event.title}" — błąd insertu: ${insertError.message}`)
    } else {
      console.log(`   🌱 [${event.id}] "${event.title}" (${event.type}) — zaseedowano ${tasksToInsert.length} zadań`)
    }
  }

  console.log('\n✅ Naprawa zakończona.')
}

repairTasks()