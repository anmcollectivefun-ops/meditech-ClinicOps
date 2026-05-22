// ============================================================================
// BIBLIOTEKA ZADAŃ I OSIĄGNIĘĆ — Silnik grywalizacji
// ============================================================================
// Fundament: zestaw uniwersalny działający dla każdego wydarzenia.
// Nakładka: dodatkowe/podmienione zadania dla konkretnych typów eventów.
// ============================================================================

export type TaskDef = {
  stage: number
  category: 'system'
  points: number
  title: string
  icon?: string
  description?: string
  tip?: string // podpowiedź grywalizacyjna - pojawia się w "podpowiadaczu"
}

export type StageInfo = {
  num: number
  name: string
  timeframe: string
  icon: string
  color: string
}

// ============================================================================
// ETAPY UNIWERSALNE (timeframe dopasowuje się do typu eventu w UI)
// ============================================================================
export const STAGES: StageInfo[] = [
  { num: 1, name: 'Fundamenty',          timeframe: 'bardzo wcześnie',  icon: '🏗️', color: '#6366f1' },
  { num: 2, name: 'Ekipa i wizja',       timeframe: 'wcześnie',          icon: '✨', color: '#8b5cf6' },
  { num: 3, name: 'Detale i formalności', timeframe: 'w środku',          icon: '📋', color: '#ec4899' },
  { num: 4, name: 'Logistyka i goście',  timeframe: 'coraz bliżej',      icon: '📮', color: '#f59e0b' },
  { num: 5, name: 'Ostatnia prosta',     timeframe: '2-4 tyg. przed',    icon: '⏱️', color: '#10b981' },
  { num: 6, name: 'Tydzień eventu',      timeframe: '1-7 dni przed',     icon: '🎯', color: '#ef4444' },
  { num: 7, name: 'W dniu wydarzenia',   timeframe: 'dziś!',              icon: '🎉', color: '#d4af37' }
]

// ============================================================================
// UNIWERSALNE ZADANIA BAZOWE — działają dla każdego typu eventu
// ============================================================================
const UNIVERSAL_TASKS: TaskDef[] = [
  // ETAP 1: Fundamenty
  { stage: 1, category: 'system', points: 30, title: 'Ustalenie budżetu wydarzenia',           icon: '💰', tip: 'Najważniejszy krok — wszystkie kolejne decyzje wyjdą z budżetu!' },
  { stage: 1, category: 'system', points: 40, title: 'Wybór i rezerwacja miejsca',             icon: '📍', tip: 'Najlepsze miejsca bookują się z dużym wyprzedzeniem.' },
  { stage: 1, category: 'system', points: 25, title: 'Ustalenie daty i godziny',               icon: '📅', tip: 'Sprawdź kalendarz szkolny i święta — unikniesz kolizji.' },
  { stage: 1, category: 'system', points: 20, title: 'Wstępna lista gości',                    icon: '👥', tip: 'Pomoże oszacować koszty i wielkość sali.' },

  // ETAP 2: Ekipa
  { stage: 2, category: 'system', points: 35, title: 'Rezerwacja fotografa',                   icon: '📸', tip: 'Dobry fotograf to wspomnienia na całe życie.' },
  { stage: 2, category: 'system', points: 30, title: 'Catering lub menu z lokalem',            icon: '🍽️', tip: 'Zapytaj o opcje dla dzieci, wegetarian i alergików.' },
  { stage: 2, category: 'system', points: 25, title: 'Dekoracje i motyw przewodni',            icon: '🎨', tip: 'Jeden spójny motyw — dużo lepszy efekt niż miks styli.' },

  // ETAP 3: Detale
  { stage: 3, category: 'system', points: 30, title: 'Projekt i zamówienie zaproszeń',         icon: '✉️', tip: 'E-zaproszenie oszczędza czas i pieniądze!' },
  { stage: 3, category: 'system', points: 25, title: 'Ubiór na wydarzenie',                    icon: '👔', tip: 'Przymiarki zaplanuj z zapasem na poprawki.' },
  { stage: 3, category: 'system', points: 20, title: 'Lista potrzebnych rzeczy i zakupów',     icon: '🛒', tip: 'Dziel zakupy na tygodnie — mniejszy stres.' },

  // ETAP 4: Logistyka
  { stage: 4, category: 'system', points: 30, title: 'Wysłanie zaproszeń do gości',            icon: '📨', tip: 'Zaproszenia elektroniczne docierają w 10 minut do wszystkich.' },
  { stage: 4, category: 'system', points: 20, title: 'Organizacja transportu / noclegów',      icon: '🚗', tip: 'Dla gości spoza miasta — zbierz linki do hoteli.' },
  { stage: 4, category: 'system', points: 20, title: 'Playlista / muzyka na wydarzenie',       icon: '🎵', tip: 'Zbierz ulubione utwory od bliskich — każdy się ucieszy.' },

  // ETAP 5: Ostatnia prosta
  { stage: 5, category: 'system', points: 30, title: 'Zebranie RSVP — ostateczna lista',       icon: '✅', tip: 'Potwierdź ostateczne liczby z cateringiem na 2 tyg. przed.' },
  { stage: 5, category: 'system', points: 25, title: 'Plan usadzenia gości',                   icon: '🪑', tip: 'Unikaj sadzania skłóconych osób obok siebie 😉' },
  { stage: 5, category: 'system', points: 15, title: 'Zakup prezentów podziękowań dla gości',  icon: '🎁' },

  // ETAP 6: Tydzień
  { stage: 6, category: 'system', points: 20, title: 'Potwierdzenie godzin z ekipą',           icon: '📞', tip: 'Telefon do każdej firmy 3 dni przed — spokój głowy.' },
  { stage: 6, category: 'system', points: 15, title: 'Przygotowanie torby awaryjnej',          icon: '👜', tip: 'Plastry, szpilki, nitka, chusteczki — naprawdę się przydają.' },
  { stage: 6, category: 'system', points: 10, title: 'Wypoczynek — dobrze się wyspać!',        icon: '😴', tip: 'Wyspana osoba to uśmiechnięta osoba na zdjęciach.' },

  // ETAP 7: W dniu
  { stage: 7, category: 'system', points: 15, title: 'Pożywne śniadanie',                       icon: '🥐', tip: 'Pusta głowa = pusty brzuch. Zjedz coś!' },
  { stage: 7, category: 'system', points: 100, title: 'Cieszyć się chwilą! 🎉',                 icon: '🥂', tip: 'To Twój dzień. Oddychaj, uśmiechaj się, zapamiętuj.' }
]

// ============================================================================
// NAKŁADKI PER TYP EVENTU — dokładają/podmieniają zadania
// ============================================================================
const EVENT_OVERLAYS: Record<string, TaskDef[]> = {
  slub: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór rodzaju ślubu (cywilny/kościelny/konkordatowy)', icon: '💍' },
    { stage: 1, category: 'system', points: 35, title: 'Rezerwacja terminu w USC / parafii',  icon: '⛪' },
    { stage: 2, category: 'system', points: 35, title: 'Rezerwacja DJ-a lub zespołu',          icon: '🎤' },
    { stage: 2, category: 'system', points: 20, title: 'Wybór świadków',                        icon: '🤝' },
    { stage: 2, category: 'system', points: 25, title: 'Zapis na nauki przedmałżeńskie',       icon: '📖' },
    { stage: 3, category: 'system', points: 30, title: 'Wybór i zamówienie obrączek',          icon: '💫' },
    { stage: 3, category: 'system', points: 35, title: 'Zamówienie sukni ślubnej',             icon: '👰' },
    { stage: 3, category: 'system', points: 25, title: 'Zakup garnituru i dodatków',           icon: '🤵' },
    { stage: 4, category: 'system', points: 20, title: 'Wybór piosenki na pierwszy taniec',    icon: '💃', tip: 'Ćwiczcie razem — zobaczycie ile radości!' },
    { stage: 5, category: 'system', points: 10, title: 'Rozchodzenie butów ślubnych',          icon: '👠', tip: 'Serio — obtarte pięty w dniu ślubu to koszmar.' },
    { stage: 6, category: 'system', points: 10, title: 'Manicure i pedicure',                  icon: '💅' }
  ],

  chrzciny: [
    { stage: 1, category: 'system', points: 35, title: 'Ustalenie terminu chrztu w parafii',   icon: '⛪' },
    { stage: 1, category: 'system', points: 30, title: 'Wybór chrzestnych',                     icon: '👫', tip: 'Chrzestni to ogromna odpowiedzialność — wybór starannie!' },
    { stage: 2, category: 'system', points: 20, title: 'Dokumenty z parafii (zaświadczenia)',  icon: '📄' },
    { stage: 3, category: 'system', points: 25, title: 'Zakup szatki do chrztu',                icon: '👶' },
    { stage: 3, category: 'system', points: 20, title: 'Świeca chrzcielna',                     icon: '🕯️' },
    { stage: 4, category: 'system', points: 20, title: 'Zamówienie tortu chrzcielnego',         icon: '🎂' },
    { stage: 4, category: 'system', points: 15, title: 'Prezenty dla chrzestnych (podziękowania)', icon: '🎁' }
  ],

  komunia: [
    { stage: 1, category: 'system', points: 30, title: 'Rozmowa z katechetą / parafią',        icon: '⛪' },
    { stage: 2, category: 'system', points: 30, title: 'Zakup alby/sukienki komunijnej',        icon: '👗' },
    { stage: 2, category: 'system', points: 25, title: 'Buty i dodatki komunijne',              icon: '👞' },
    { stage: 3, category: 'system', points: 20, title: 'Modlitewnik, świeca, różaniec',        icon: '📿' },
    { stage: 3, category: 'system', points: 25, title: 'Pamiątka komunijna (różaniec/zegarek)', icon: '⌚' },
    { stage: 4, category: 'system', points: 25, title: 'Organizacja przyjęcia komunijnego',    icon: '🍰' },
    { stage: 4, category: 'system', points: 15, title: 'Fryzjer / stylistka dziecka',           icon: '💇' }
  ],

  urodziny18: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór klubu / restauracji / sali',     icon: '🎊' },
    { stage: 2, category: 'system', points: 20, title: 'Motyw / dress code imprezy',            icon: '🎭', tip: 'Klasyczna black tie czy szalona piżama party?' },
    { stage: 3, category: 'system', points: 20, title: 'Zakup stylizacji urodzinowej',          icon: '✨' },
    { stage: 3, category: 'system', points: 25, title: 'DJ / zespół / playlista',               icon: '🎧' },
    { stage: 4, category: 'system', points: 20, title: 'Zamówienie tortu urodzinowego',         icon: '🎂' },
    { stage: 4, category: 'system', points: 15, title: 'Alkohol / napoje na imprezę',           icon: '🥂' },
    { stage: 5, category: 'system', points: 15, title: 'Dekoracje i balony',                    icon: '🎈' },
    { stage: 5, category: 'system', points: 10, title: 'Animacje / atrakcje (fotobudka, itp.)', icon: '📷' }
  ],

  urodziny: [
    { stage: 1, category: 'system', points: 20, title: 'Wybór formy (sala/dom/restauracja/plener)', icon: '🏠' },
    { stage: 2, category: 'system', points: 20, title: 'Motyw imprezy / dekoracje',             icon: '🎨' },
    { stage: 3, category: 'system', points: 20, title: 'Zamówienie tortu',                      icon: '🎂' },
    { stage: 3, category: 'system', points: 15, title: 'Prezent dla solenizanta',               icon: '🎁' },
    { stage: 4, category: 'system', points: 15, title: 'Atrakcje (gry, animator, muzyka)',     icon: '🎮' },
    { stage: 5, category: 'system', points: 10, title: 'Balony, świeczki, serwetki',            icon: '🎈' }
  ],

  baby_shower: [
    { stage: 1, category: 'system', points: 30, title: 'Wybór terminu (7-8 miesiąc ciąży)',    icon: '🤰', tip: 'Nie za wcześnie i nie za późno — okolice 32-34 tyg.' },
    { stage: 2, category: 'system', points: 25, title: 'Motyw (różowy/niebieski/neutralny)',   icon: '🎀' },
    { stage: 2, category: 'system', points: 20, title: 'Lista marzeń (wyprawka dla dziecka)',  icon: '👶' },
    { stage: 3, category: 'system', points: 20, title: 'Zabawy i konkursy dla gości',           icon: '🎲', tip: 'Zgadnij obwód brzuszka, smak słoiczka, itp.' },
    { stage: 3, category: 'system', points: 20, title: 'Słodki stół (cupcake, tort pieluchowy)', icon: '🧁' },
    { stage: 4, category: 'system', points: 15, title: 'Dekoracje w wybranym motywie',          icon: '🎊' },
    { stage: 4, category: 'system', points: 10, title: 'Upominki dla gości (podziękowania)',   icon: '💝' }
  ],

  gender_reveal: [
    { stage: 1, category: 'system', points: 35, title: 'Ustalenie sposobu ujawnienia płci',    icon: '❓', tip: 'Tort z kolorowym nadzieniem? Balony? Konfetti? Fajerwerki?' },
    { stage: 2, category: 'system', points: 30, title: 'Przekazanie wyniku USG do cukierni/firmy', icon: '🤫', tip: 'Nikt z rodziny ani Wy nie możecie znać wyniku!' },
    { stage: 2, category: 'system', points: 20, title: 'Dekoracje w dwóch kolorach',            icon: '💙💗' },
    { stage: 3, category: 'system', points: 25, title: 'Zamówienie "tortu tajemnicy"',          icon: '🎂' },
    { stage: 3, category: 'system', points: 15, title: 'Gadżety do głosowania (team pink/blue)', icon: '🗳️' },
    { stage: 4, category: 'system', points: 20, title: 'Kamerzysta / fotograf na moment ujawnienia', icon: '📹', tip: 'Reakcji nie powtórzysz — warto mieć dobrej jakości film!' }
  ],

  jubileusz: [
    { stage: 1, category: 'system', points: 30, title: 'Wybór formy jubileuszu (oficjalny/rodzinny)', icon: '🎊' },
    { stage: 2, category: 'system', points: 25, title: 'Przygotowanie prezentacji/wspomnień',   icon: '📽️', tip: 'Stare zdjęcia, filmy — wzruszeń nie zabraknie!' },
    { stage: 3, category: 'system', points: 20, title: 'Lista gości specjalnych (VIP)',         icon: '⭐' },
    { stage: 3, category: 'system', points: 20, title: 'Przemowa / toast jubileuszowy',         icon: '🎤' },
    { stage: 4, category: 'system', points: 20, title: 'Pamiątka jubileuszowa dla gości',       icon: '🏆' },
    { stage: 4, category: 'system', points: 15, title: 'Tort jubileuszowy z datą',              icon: '🎂' }
  ],

  rocznica: [
    { stage: 1, category: 'system', points: 25, title: 'Wybór stylu celebracji (kameralnie/huczny)', icon: '💑' },
    { stage: 2, category: 'system', points: 25, title: 'Prezent symboliczny (wg tradycji rocznic)', icon: '💝', tip: '1. papier, 5. drewno, 25. srebro, 50. złoto...' },
    { stage: 2, category: 'system', points: 20, title: 'Zapisy wspomnień / list do partnera',  icon: '💌' },
    { stage: 3, category: 'system', points: 20, title: 'Odtworzenie pierwszej randki/podróży poślubnej', icon: '💕', tip: 'Sentiment na dużym poziomie.' },
    { stage: 4, category: 'system', points: 20, title: 'Tort / deser rocznicowy',               icon: '🍰' }
  ],

  inne: [
    { stage: 2, category: 'system', points: 20, title: 'Cel wydarzenia — zapisz go w notatniku', icon: '🎯' },
    { stage: 3, category: 'system', points: 15, title: 'Scenariusz / plan minutowy',            icon: '📝' }
  ]
}

// ============================================================================
// FUNKCJA ŁĄCZĄCA: uniwersalny set + nakładka dla typu eventu
// ============================================================================
export function getTasksForEventType(eventType: string | null | undefined): TaskDef[] {
  const universal = [...UNIVERSAL_TASKS]
  const normalizedType = (eventType || 'inne').toLowerCase().trim()
  const overlay = EVENT_OVERLAYS[normalizedType] || []
  return [...universal, ...overlay].sort((a, b) => a.stage - b.stage)
}

// ============================================================================
// ETYKIETY TYPÓW EVENTÓW
// ============================================================================
export const EVENT_TYPE_LABELS: Record<string, string> = {
  slub: 'Ślub',
  chrzciny: 'Chrzciny',
  komunia: 'Komunia',
  urodziny18: '18-stka',
  urodziny: 'Urodziny',
  baby_shower: 'Baby Shower',
  gender_reveal: 'Gender Reveal',
  jubileusz: 'Jubileusz',
  rocznica: 'Rocznica',
  inne: 'Wydarzenie'
}

// ============================================================================
// OSIĄGNIĘCIA (BADGES) — odblokowywane warunkowo
// ============================================================================
export type Achievement = {
  key: string
  title: string
  description: string
  icon: string
  color: string
  check: (ctx: AchievementContext) => boolean
}

export type AchievementContext = {
  completedCount: number
  totalCount: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  customTasksCount: number
  completedStages: number[] // numery etapów w pełni zaliczonych
  tasksWithIcons: number
  earlyBirdCount: number // zadania ukończone > 2 tyg. przed terminem
  lastMinuteCount: number // zadania ukończone w dniu terminu
  completedBeforeNoon: number
  completedAfterMidnight: number
  hasRepeatingTask: boolean
  notificationsEnabled: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    key: 'first_step',
    title: 'Pierwszy krok',
    description: 'Ukończ pierwsze zadanie',
    icon: '🌱',
    color: '#10b981',
    check: (c) => c.completedCount >= 1
  },
  {
    key: 'warming_up',
    title: 'Rozgrzewka',
    description: 'Ukończ 5 zadań',
    icon: '🔥',
    color: '#f59e0b',
    check: (c) => c.completedCount >= 5
  },
  {
    key: 'on_fire',
    title: 'W ogniu!',
    description: 'Ukończ 15 zadań',
    icon: '🚀',
    color: '#ef4444',
    check: (c) => c.completedCount >= 15
  },
  {
    key: 'master_planner',
    title: 'Mistrz/yni planowania',
    description: 'Ukończ 30 zadań',
    icon: '👑',
    color: '#d4af37',
    check: (c) => c.completedCount >= 30
  },
  {
    key: 'legend',
    title: 'Legenda organizacji',
    description: 'Ukończ 50 zadań',
    icon: '🦄',
    color: '#8b5cf6',
    check: (c) => c.completedCount >= 50
  },
  {
    key: 'foundation_laid',
    title: 'Fundamenty gotowe',
    description: 'Zakończ cały Etap 1',
    icon: '🏗️',
    color: '#6366f1',
    check: (c) => c.completedStages.includes(1)
  },
  {
    key: 'team_assembled',
    title: 'Ekipa zebrana',
    description: 'Zakończ cały Etap 2',
    icon: '🤝',
    color: '#8b5cf6',
    check: (c) => c.completedStages.includes(2)
  },
  {
    key: 'final_countdown',
    title: 'Finalne odliczanie',
    description: 'Zakończ cały Etap 5',
    icon: '⏰',
    color: '#10b981',
    check: (c) => c.completedStages.includes(5)
  },
  {
    key: 'streak_3',
    title: 'Seria 3 dni',
    description: '3 dni z rzędu z zadaniem',
    icon: '🎯',
    color: '#f59e0b',
    check: (c) => c.currentStreak >= 3 || c.longestStreak >= 3
  },
  {
    key: 'streak_7',
    title: 'Tydzień w ruchu',
    description: '7 dni z rzędu z zadaniem',
    icon: '🏅',
    color: '#d4af37',
    check: (c) => c.currentStreak >= 7 || c.longestStreak >= 7
  },
  {
    key: 'streak_30',
    title: 'Miesiąc konsekwencji',
    description: '30 dni z rzędu z zadaniem',
    icon: '🏆',
    color: '#d4af37',
    check: (c) => c.currentStreak >= 30 || c.longestStreak >= 30
  },
  {
    key: 'custom_creator',
    title: 'Własny styl',
    description: 'Dodaj 5 własnych zadań',
    icon: '✍️',
    color: '#ec4899',
    check: (c) => c.customTasksCount >= 5
  },
  {
    key: 'icon_collector',
    title: 'Ikonomaniak',
    description: '10 zadań z własną ikonką',
    icon: '🎨',
    color: '#8b5cf6',
    check: (c) => c.tasksWithIcons >= 10
  },
  {
    key: 'early_bird',
    title: 'Ranny ptaszek',
    description: '10 zadań zrobionych na długo przed terminem',
    icon: '🐦',
    color: '#10b981',
    check: (c) => c.earlyBirdCount >= 10
  },
  {
    key: 'deadline_hero',
    title: 'Bohater deadline\'ów',
    description: 'Ukończ 5 zadań w dniu terminu',
    icon: '⚡',
    color: '#ef4444',
    check: (c) => c.lastMinuteCount >= 5
  },
  {
    key: 'morning_person',
    title: 'Poranna osoba',
    description: '5 zadań ukończonych przed południem',
    icon: '☀️',
    color: '#f59e0b',
    check: (c) => c.completedBeforeNoon >= 5
  },
  {
    key: 'night_owl',
    title: 'Nocny marek',
    description: '5 zadań ukończonych po północy',
    icon: '🦉',
    color: '#6366f1',
    check: (c) => c.completedAfterMidnight >= 5
  },
  {
    key: 'routine_master',
    title: 'Mistrz rutyny',
    description: 'Stwórz powtarzające się zadanie',
    icon: '🔄',
    color: '#06b6d4',
    check: (c) => c.hasRepeatingTask
  },
  {
    key: 'connected',
    title: 'W kontakcie',
    description: 'Włącz powiadomienia push',
    icon: '🔔',
    color: '#3b82f6',
    check: (c) => c.notificationsEnabled
  },
  {
    key: 'halfway',
    title: 'Półmetek',
    description: 'Ukończ 50% wszystkich zadań',
    icon: '⚖️',
    color: '#8b5cf6',
    check: (c) => c.totalCount > 0 && c.completedCount / c.totalCount >= 0.5
  },
  {
    key: 'completionist',
    title: 'Perfekcjonist(k)a',
    description: 'Ukończ 100% zadań systemowych',
    icon: '💎',
    color: '#d4af37',
    check: (c) => c.totalCount > 0 && c.completedCount >= c.totalCount
  }
]

// ============================================================================
// POZIOMY
// ============================================================================
export const LEVELS = [
  { min: 0,    max: 99,   name: 'Nowicjusz/ka',          icon: '🌱', color: '#94a3b8' },
  { min: 100,  max: 249,  name: 'Uczeń/enica',           icon: '📚', color: '#6366f1' },
  { min: 250,  max: 499,  name: 'Planista/tka',          icon: '📝', color: '#8b5cf6' },
  { min: 500,  max: 799,  name: 'Organizator/ka',        icon: '⚡', color: '#ec4899' },
  { min: 800,  max: 1199, name: 'Ekspert/ka',            icon: '⭐', color: '#f59e0b' },
  { min: 1200, max: 1799, name: 'Mistrz/yni',            icon: '👑', color: '#d4af37' },
  { min: 1800, max: Infinity, name: 'Event Planner PRO', icon: '🦄', color: '#8b5cf6' }
]

export function getLevel(points: number) {
  return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0]
}

export function getNextLevel(points: number) {
  const current = getLevel(points)
  const currentIdx = LEVELS.indexOf(current)
  return LEVELS[currentIdx + 1] || null
}

// ============================================================================
// IKONY DO WYBORU DLA WŁASNYCH ZADAŃ
// ============================================================================
export const AVAILABLE_ICONS = [
  '📝', '📌', '📋', '📞', '📧', '💰', '💳', '💍', '💐', '🌸',
  '🎂', '🥂', '🍽️', '🍰', '🧁', '🎁', '🎈', '🎉', '🎊', '✨',
  '💃', '🎤', '🎵', '🎧', '📸', '📹', '🎬', '👔', '👗', '👠',
  '👰', '🤵', '💅', '💇', '🛒', '📍', '🚗', '✈️', '🏨', '⛪',
  '🕯️', '💒', '📖', '📄', '✏️', '📐', '📏', '🗓️', '⏰', '⏱️',
  '🎯', '🏆', '⭐', '❤️', '💕', '💖', '🌟', '🔥', '⚡', '✅'
]

// ============================================================================
// WYZWANIA TYGODNIOWE (losowane na podstawie tygodnia roku)
// ============================================================================
export type WeeklyChallenge = {
  title: string
  description: string
  icon: string
  reward: number
  checkFn: 'tasks_per_week' | 'stages_per_week' | 'points_per_week'
  target: number
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { title: 'Maraton zadań',      description: 'Ukończ 5 zadań w tym tygodniu',      icon: '🏃', reward: 50,  checkFn: 'tasks_per_week',  target: 5 },
  { title: 'Potrójny kombos',    description: 'Ukończ 3 zadania z jednego etapu',   icon: '💪', reward: 30,  checkFn: 'tasks_per_week',  target: 3 },
  { title: 'Punktowy wyścig',    description: 'Zdobądź 100 punktów w tygodniu',     icon: '🎯', reward: 25,  checkFn: 'points_per_week', target: 100 },
  { title: 'Konsekwencja',       description: 'Ukończ 7 zadań w ciągu 7 dni',       icon: '📆', reward: 70,  checkFn: 'tasks_per_week',  target: 7 }
]

// Deterministyczny wybór wyzwania na tydzień
export function getWeeklyChallenge(): WeeklyChallenge {
  const now = new Date()
  const weekNum = Math.floor((now.getTime() / (1000 * 60 * 60 * 24 * 7)))
  return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length]
}