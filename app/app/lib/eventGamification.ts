export type EventType = 
  | 'slub' 
  | 'komunia' 
  | 'chrzciny' 
  | 'rocznica' 
  | 'jubileusz' 
  | 'baby_shower' 
  | 'gender_reveal' 
  | 'urodziny' 
  | 'inne'

// ----------------------------------------------------------------------------
// TYPY
// ----------------------------------------------------------------------------

export interface Stage {
  num: number
  name: string
  timeframe: string
  icon: string
  color: string
}

export interface InitialTask {
  title: string
  icon: string
  stage: number
  category: 'system' | 'custom'
  points: number
}

export interface Level {
  threshold: number
  name: string
  emoji: string
  description: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  /** Warunek odblokowania osiągnięcia */
  condition: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  totalPoints: number
  completedCount: number
  totalCount: number
  completedByStage: Record<number, number>
  totalByStage: Record<number, number>
}

export interface EventGamificationConfig {
  type: EventType
  label: string
  emoji: string
  welcomeMessage: string
  motivationalQuote: string
  encouragementOnComplete: string
  stages: Stage[]
  tasks: InitialTask[]
  levels: Level[]
  achievements: Achievement[]
  themeColors: {
    primary: string
    secondary: string
    accent: string
  }
}

// ============================================================================
// 1. ŚLUB
// ============================================================================
export const SLUB_CONFIG: EventGamificationConfig = {
  type: 'slub',
  label: 'Ślub i Wesele',
  emoji: '💍',
  welcomeMessage: 'Witaj w drodze do najpiękniejszego dnia w Twoim życiu!',
  motivationalQuote: 'Każde wielkie wesele zaczyna się od pierwszego kroku. Idziesz świetnie!',
  encouragementOnComplete: 'Wszystkie zadania w tym etapie zaliczone! Jesteś coraz bliżej swojego "Tak"!',
  themeColors: {
    primary: '#cba052',
    secondary: '#e8ce7a',
    accent: '#8b3a4a',
  },
  stages: [
    { num: 1, name: 'Zaręczyny i marzenia', timeframe: '12-24 m-cy przed', icon: '💍', color: '#cba052' },
    { num: 2, name: 'Wielkie planowanie',   timeframe: '9-12 m-cy przed',  icon: '📋', color: '#a38440' },
    { num: 3, name: 'Konkretne wybory',     timeframe: '6-9 m-cy przed',   icon: '✨', color: '#8b3a4a' },
    { num: 4, name: 'Finalizacja',          timeframe: '3-6 m-cy przed',   icon: '💎', color: '#722f3c' },
    { num: 5, name: 'Ostatnia prosta',      timeframe: '1-3 m-ce przed',   icon: '🎉', color: '#5c2731' },
    { num: 6, name: 'Tydzień przed',        timeframe: 'Tydzień przed',    icon: '⏰', color: '#3e1a21' },
    { num: 7, name: 'WIELKI DZIEŃ',         timeframe: 'Dzień ślubu',      icon: '👰‍♀️', color: '#253a2a' },
  ],
  tasks: [
    // Etap 1
    { title: 'Ustalcie wstępną datę i sezon', icon: '📅', stage: 1, category: 'system', points: 15 },
    { title: 'Określcie wstępny budżet całkowity', icon: '💰', stage: 1, category: 'system', points: 20 },
    { title: 'Zróbcie wstępną listę gości', icon: '👥', stage: 1, category: 'system', points: 15 },
    { title: 'Wybierzcie świadków', icon: '🤝', stage: 1, category: 'system', points: 10 },
    // Etap 2
    { title: 'Zarezerwujcie salę weselną', icon: '🏛️', stage: 2, category: 'system', points: 30 },
    { title: 'Zarezerwujcie kościół / USC', icon: '⛪', stage: 2, category: 'system', points: 25 },
    { title: 'Wybierzcie fotografa', icon: '📸', stage: 2, category: 'system', points: 25 },
    { title: 'Wybierzcie kamerzystę', icon: '🎥', stage: 2, category: 'system', points: 20 },
    { title: 'Wybierzcie zespół / DJ-a', icon: '🎵', stage: 2, category: 'system', points: 25 },
    // Etap 3
    { title: 'Wybór sukni ślubnej', icon: '👗', stage: 3, category: 'system', points: 30 },
    { title: 'Wybór garnituru', icon: '🤵', stage: 3, category: 'system', points: 20 },
    { title: 'Zamówcie obrączki', icon: '💍', stage: 3, category: 'system', points: 20 },
    { title: 'Wybierzcie florystę i dekoracje', icon: '💐', stage: 3, category: 'system', points: 20 },
    { title: 'Wybierzcie cukiernię i tort', icon: '🎂', stage: 3, category: 'system', points: 15 },
    // Etap 4
    { title: 'Wyślijcie zaproszenia do gości', icon: '✉️', stage: 4, category: 'system', points: 25 },
    { title: 'Wybór menu degustacyjnego', icon: '🍽️', stage: 4, category: 'system', points: 20 },
    { title: 'Próby fryzury i makijażu', icon: '💄', stage: 4, category: 'system', points: 15 },
    { title: 'Załatwcie dokumenty USC / kościelne', icon: '📜', stage: 4, category: 'system', points: 20 },
    // Etap 5
    { title: 'Zbierzcie potwierdzenia RSVP', icon: '✅', stage: 5, category: 'system', points: 20 },
    { title: 'Ustalcie plan stołów', icon: '🪑', stage: 5, category: 'system', points: 25 },
    { title: 'Przekażcie listę utworów do DJ-a', icon: '🎶', stage: 5, category: 'system', points: 15 },
    { title: 'Przygotujcie upominki dla gości', icon: '🎁', stage: 5, category: 'system', points: 15 },
    // Etap 6
    { title: 'Próba generalna (jeśli planujecie)', icon: '🎭', stage: 6, category: 'system', points: 15 },
    { title: 'Spakuj walizkę na noc poślubną', icon: '🧳', stage: 6, category: 'system', points: 10 },
    { title: 'Manicure i ostatnie kosmetyki', icon: '💅', stage: 6, category: 'system', points: 10 },
    { title: 'Potwierdź wszystkie rezerwacje', icon: '☎️', stage: 6, category: 'system', points: 15 },
    // Etap 7
    { title: 'Powiedz "Tak"!', icon: '💍', stage: 7, category: 'system', points: 50 },
    { title: 'Baw się dobrze ze swoimi gośćmi', icon: '🥂', stage: 7, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Ślubny Nowicjusz',      emoji: '🌱', description: 'Zaczynasz wspaniałą przygodę!' },
    { threshold: 50,  name: 'Planistka Amatorka',    emoji: '📒', description: 'Już wiesz, że to nie żarty.' },
    { threshold: 150, name: 'Mistrzyni Organizacji', emoji: '✨', description: 'Trzymasz wszystko w garści!' },
    { threshold: 300, name: 'Wedding Plannerka PRO', emoji: '👰', description: 'Profesjonalny poziom!' },
    { threshold: 500, name: 'Bogini Ślubu',          emoji: '👑', description: 'Twoje wesele będzie legendarne!' },
  ],
  achievements: [
    { id: 'first_step',  title: 'Pierwszy krok',     description: 'Odhaczyłaś/eś pierwsze zadanie', icon: '🌱',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'venue_locked', title: 'Sala zarezerwowana', description: 'Najważniejszy krok: macie miejsce!', icon: '🏛️',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 1 },
    { id: 'half_way',    title: 'Półmetek',          description: '50% zadań za Tobą — robisz to!', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'almost_there', title: 'Już prawie!',      description: '90% zadań ukończonych', icon: '🎯',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.9 },
    { id: 'i_do',        title: 'Powiedziano "Tak"!', description: 'Wszystkie zadania ukończone!', icon: '💍',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 2. KOMUNIA
// ============================================================================
export const KOMUNIA_CONFIG: EventGamificationConfig = {
  type: 'komunia',
  label: 'Pierwsza Komunia',
  emoji: '🕊️',
  welcomeMessage: 'Witaj w przygotowaniach do tego wyjątkowego dnia w życiu Waszego dziecka!',
  motivationalQuote: 'Pierwsza Komunia to święto wiary, rodziny i miłości. Każde Twoje zadanie ma znaczenie.',
  encouragementOnComplete: 'Etap zaliczony! Coraz bliżej tego pamiętnego dnia.',
  themeColors: {
    primary: '#5b8def',
    secondary: '#bcd4ff',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Decyzja i parafia',   timeframe: '6-12 m-cy przed', icon: '⛪', color: '#5b8def' },
    { num: 2, name: 'Strona duchowa',      timeframe: '4-6 m-cy przed',  icon: '🕊️', color: '#4a7bd8' },
    { num: 3, name: 'Strój i symbole',     timeframe: '2-4 m-ce przed',  icon: '👔', color: '#3968c1' },
    { num: 4, name: 'Przyjęcie',           timeframe: '1-2 m-ce przed',  icon: '🎂', color: '#2855aa' },
    { num: 5, name: 'Ostatnie szlify',     timeframe: '2-4 tyg. przed',  icon: '✨', color: '#174293' },
    { num: 6, name: 'Tydzień przed',       timeframe: '1-7 dni przed',   icon: '⏰', color: '#0d4db8' },
    { num: 7, name: 'WIELKI DZIEŃ',        timeframe: 'Dzień Komunii',   icon: '🕊️', color: '#063080' },
  ],
  tasks: [
    // Etap 1
    { title: 'Zapiszcie dziecko na katechezę', icon: '📖', stage: 1, category: 'system', points: 15 },
    { title: 'Ustalcie datę z parafią', icon: '📅', stage: 1, category: 'system', points: 20 },
    { title: 'Określcie wstępny budżet', icon: '💰', stage: 1, category: 'system', points: 15 },
    { title: 'Zróbcie listę gości', icon: '👥', stage: 1, category: 'system', points: 10 },
    // Etap 2
    { title: 'Spowiedź pierwszorazowa dziecka', icon: '🙏', stage: 2, category: 'system', points: 20 },
    { title: 'Świadectwo chrztu z parafii chrztu', icon: '📜', stage: 2, category: 'system', points: 15 },
    { title: 'Modlitewnik / różaniec', icon: '📿', stage: 2, category: 'system', points: 10 },
    { title: 'Próby w kościele', icon: '⛪', stage: 2, category: 'system', points: 15 },
    // Etap 3
    { title: 'Strój komunijny dla dziecka', icon: '👗', stage: 3, category: 'system', points: 25 },
    { title: 'Buty i dodatki', icon: '👞', stage: 3, category: 'system', points: 10 },
    { title: 'Świeca komunijna', icon: '🕯️', stage: 3, category: 'system', points: 10 },
    { title: 'Pamiątka (krzyżyk, książeczka)', icon: '✝️', stage: 3, category: 'system', points: 10 },
    { title: 'Strój dla rodziców', icon: '👔', stage: 3, category: 'system', points: 15 },
    // Etap 4
    { title: 'Zarezerwuj lokal lub catering', icon: '🍽️', stage: 4, category: 'system', points: 30 },
    { title: 'Zamów tort komunijny', icon: '🎂', stage: 4, category: 'system', points: 20 },
    { title: 'Wybierz fotografa / kamerzystę', icon: '📸', stage: 4, category: 'system', points: 20 },
    { title: 'Wyślij zaproszenia do gości', icon: '✉️', stage: 4, category: 'system', points: 15 },
    { title: 'Wybierz dekoracje stołu i sali', icon: '🌸', stage: 4, category: 'system', points: 15 },
    // Etap 5
    { title: 'Zbierz potwierdzenia gości', icon: '✅', stage: 5, category: 'system', points: 15 },
    { title: 'Plan stołów (jeśli potrzebny)', icon: '🪑', stage: 5, category: 'system', points: 10 },
    { title: 'Sprawdź pogodę i plan B', icon: '☔', stage: 5, category: 'system', points: 10 },
    { title: 'Przygotuj upominki dla gości', icon: '🎁', stage: 5, category: 'system', points: 15 },
    { title: 'Fryzura próbna dziecka', icon: '💇', stage: 5, category: 'system', points: 10 },
    // Etap 6
    { title: 'Potwierdź godziny z fotografem i lokalem', icon: '📞', stage: 6, category: 'system', points: 15 },
    { title: 'Przygotuj strój dziecka i pamiątki', icon: '👗', stage: 6, category: 'system', points: 10 },
    { title: 'Zadbaj o dobry sen przed uroczystością', icon: '😴', stage: 6, category: 'system', points: 10 },
    // Etap 7
    { title: 'Zabierz wszystkie pamiątki do kościoła', icon: '🕯️', stage: 7, category: 'system', points: 20 },
    { title: 'Cieszcie się tym dniem!', icon: '🕊️', stage: 7, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Początkujący Organizator', emoji: '🌱', description: 'Pierwsze kroki na drodze wiary!' },
    { threshold: 40,  name: 'Strażnik Tradycji',        emoji: '📖', description: 'Tradycja nie ma przed Tobą tajemnic.' },
    { threshold: 120, name: 'Mistrz Uroczystości',      emoji: '✨', description: 'Wszystko pod kontrolą!' },
    { threshold: 250, name: 'Anioł Stróż Komunii',      emoji: '👼', description: 'Czuwasz nad każdym detalem.' },
    { threshold: 400, name: 'Święty Spokój',            emoji: '🕊️', description: 'Możesz odetchnąć — jesteś gotowa/y!' },
  ],
  achievements: [
    { id: 'first_step',     title: 'Pierwsze "Amen"',  description: 'Pierwsze zadanie odhaczone', icon: '🙏',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'church_ready',   title: 'Strona duchowa',  description: 'Wszystkie kościelne formalności', icon: '⛪',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 3 },
    { id: 'outfit_done',    title: 'Mały święty',      description: 'Strój komunijny gotowy', icon: '👗',
      condition: ctx => (ctx.completedByStage[3] ?? 0) >= 2 },
    { id: 'half_way',       title: 'Półmetek',         description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done',       title: 'Pełnia łaski',     description: 'Wszystkie zadania ukończone', icon: '🕊️',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 3. CHRZCINY
// ============================================================================
export const CHRZCINY_CONFIG: EventGamificationConfig = {
  type: 'chrzciny',
  label: 'Chrzciny',
  emoji: '👶',
  welcomeMessage: 'Witajcie w przygotowaniach do pierwszej wielkiej uroczystości Waszego maluszka!',
  motivationalQuote: 'Chrzciny to dzień, w którym cała rodzina powita nowego członka. Krok po kroku — damy radę!',
  encouragementOnComplete: 'Brawo! Maluszek byłby z Was dumny (jakby wiedział).',
  themeColors: {
    primary: '#f5b7c1',
    secondary: '#bcd4ff',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Decyzje i parafia',  timeframe: '2-3 m-ce przed',     icon: '⛪',  color: '#f5b7c1' },
    { num: 2, name: 'Rodzice chrzestni',   timeframe: '1-2 m-ce przed',     icon: '🤝',  color: '#e89aaa' },
    { num: 3, name: 'Strój i pamiątki',    timeframe: '3-6 tyg. przed',     icon: '👶',  color: '#db7d93' },
    { num: 4, name: 'Przyjęcie',           timeframe: '2-4 tyg. przed',     icon: '🎂',  color: '#ce607c' },
    { num: 5, name: 'Ostatnie szlify',     timeframe: 'Tydzień przed',      icon: '✨',  color: '#c14365' },
    { num: 6, name: 'DZIEŃ CHRZTU',        timeframe: 'Dzień Chrztu',       icon: '👼',  color: '#b4264e' },
  ],
  tasks: [
    // Etap 1
    { title: 'Ustalcie datę z parafią', icon: '📅', stage: 1, category: 'system', points: 20 },
    { title: 'Złóżcie dokumenty w kancelarii parafii', icon: '📜', stage: 1, category: 'system', points: 15 },
    { title: 'Określcie budżet uroczystości', icon: '💰', stage: 1, category: 'system', points: 10 },
    { title: 'Zróbcie listę gości', icon: '👥', stage: 1, category: 'system', points: 10 },
    // Etap 2
    { title: 'Wybierzcie rodziców chrzestnych', icon: '🤝', stage: 2, category: 'system', points: 20 },
    { title: 'Poproście oficjalnie chrzestnych', icon: '💌', stage: 2, category: 'system', points: 10 },
    { title: 'Chrzestni — zaświadczenie o praktykowaniu', icon: '📃', stage: 2, category: 'system', points: 15 },
    { title: 'Spotkanie z księdzem', icon: '⛪', stage: 2, category: 'system', points: 10 },
    // Etap 3
    { title: 'Strój do chrztu (szatka)', icon: '👼', stage: 3, category: 'system', points: 20 },
    { title: 'Świeca chrzcielna', icon: '🕯️', stage: 3, category: 'system', points: 10 },
    { title: 'Pamiątka chrztu (medalik, krzyżyk)', icon: '✝️', stage: 3, category: 'system', points: 10 },
    { title: 'Stylizacja rodziców', icon: '👔', stage: 3, category: 'system', points: 10 },
    // Etap 4
    { title: 'Zarezerwuj lokal / catering / dom', icon: '🍽️', stage: 4, category: 'system', points: 30 },
    { title: 'Zamów tort z imieniem', icon: '🎂', stage: 4, category: 'system', points: 20 },
    { title: 'Wybierz fotografa', icon: '📸', stage: 4, category: 'system', points: 15 },
    { title: 'Wyślij zaproszenia do gości', icon: '✉️', stage: 4, category: 'system', points: 15 },
    { title: 'Dekoracje (różowe / niebieskie / inne)', icon: '🌸', stage: 4, category: 'system', points: 10 },
    // Etap 5
    { title: 'Potwierdzenia od gości', icon: '✅', stage: 5, category: 'system', points: 10 },
    { title: 'Spakuj torbę dla maluszka', icon: '🎒', stage: 5, category: 'system', points: 15 },
    { title: 'Plan dnia uroczystości', icon: '📋', stage: 5, category: 'system', points: 10 },
    { title: 'Upominki dla chrzestnych', icon: '🎁', stage: 5, category: 'system', points: 15 },
    // Etap 6
    { title: 'Zabierz świecę i szatkę do kościoła', icon: '🕯️', stage: 6, category: 'system', points: 20 },
    { title: 'Cieszcie się tym wyjątkowym dniem!', icon: '👶', stage: 6, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Świeżo upieczony rodzic', emoji: '🍼', description: 'Pierwsze kroki w roli organizatora!' },
    { threshold: 30,  name: 'Organizator chrzcin',     emoji: '📒', description: 'Już wiesz, co robić.' },
    { threshold: 80,  name: 'Mistrz powitania',        emoji: '✨', description: 'Wszystko idzie jak po maśle!' },
    { threshold: 150, name: 'Boski Patron',            emoji: '🤍', description: 'Pełna kontrola nad uroczystością.' },
    { threshold: 250, name: 'Anioł Stróż',             emoji: '👼', description: 'Maluszek będzie miał idealny dzień!' },
  ],
  achievements: [
    { id: 'first_step',   title: 'Pierwszy krok',         description: 'Odhaczyłaś/eś pierwsze zadanie', icon: '🌱',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'godparents',   title: 'Mamy chrzestnych!',     description: 'Etap chrzestnych ukończony', icon: '🤝',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 2 },
    { id: 'outfit_ready', title: 'Aniołek gotowy',        description: 'Strój i pamiątki kompletne', icon: '👼',
      condition: ctx => (ctx.completedByStage[3] ?? 0) >= 2 },
    { id: 'half_way',     title: 'Półmetek',              description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done',     title: 'Witamy w rodzinie!',    description: 'Wszystkie zadania ukończone', icon: '👶',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 4. ROCZNICA
// ============================================================================
export const ROCZNICA_CONFIG: EventGamificationConfig = {
  type: 'rocznica',
  label: 'Rocznica',
  emoji: '💕',
  welcomeMessage: 'Witaj w przygotowaniach do celebracji Waszej miłości!',
  motivationalQuote: 'Każdy rok razem to skarb. Niech ta rocznica będzie wyjątkowa.',
  encouragementOnComplete: 'Świetna robota! Kolejny krok w stronę magicznej rocznicy.',
  themeColors: {
    primary: '#e91e63',
    secondary: '#f8bbd0',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Pomysł i koncepcja',  timeframe: '2-6 m-cy przed', icon: '💡', color: '#e91e63' },
    { num: 2, name: 'Planowanie',          timeframe: '1-3 m-ce przed', icon: '📋', color: '#c2185b' },
    { num: 3, name: 'Organizacja',         timeframe: '3-4 tyg. przed', icon: '✨', color: '#ad1457' },
    { num: 4, name: 'Finalizacja',         timeframe: 'Tydzień przed',  icon: '💎', color: '#880e4f' },
    { num: 5, name: 'DZIEŃ ROCZNICY',      timeframe: 'Dzień rocznicy', icon: '💕', color: '#560027' },
  ],
  tasks: [
    // Etap 1
    { title: 'Wybierzcie formę celebracji (kolacja / przyjęcie / wyjazd)', icon: '💡', stage: 1, category: 'system', points: 20 },
    { title: 'Określcie budżet', icon: '💰', stage: 1, category: 'system', points: 10 },
    { title: 'Zaplanujcie listę gości (jeśli przyjęcie)', icon: '👥', stage: 1, category: 'system', points: 10 },
    // Etap 2
    { title: 'Zarezerwujcie lokal / restaurację / hotel', icon: '🏛️', stage: 2, category: 'system', points: 30 },
    { title: 'Wybierzcie motyw przewodni', icon: '🎨', stage: 2, category: 'system', points: 15 },
    { title: 'Zamówcie prezent dla partnera/partnerki', icon: '🎁', stage: 2, category: 'system', points: 20 },
    { title: 'Wyślijcie zaproszenia (jeśli przyjęcie)', icon: '✉️', stage: 2, category: 'system', points: 15 },
    // Etap 3
    { title: 'Wybór menu / dań', icon: '🍽️', stage: 3, category: 'system', points: 15 },
    { title: 'Tort lub deser na rocznicę', icon: '🎂', stage: 3, category: 'system', points: 15 },
    { title: 'Fotograf / kamerzysta (jeśli potrzebny)', icon: '📸', stage: 3, category: 'system', points: 15 },
    { title: 'Dekoracje i kwiaty', icon: '💐', stage: 3, category: 'system', points: 15 },
    { title: 'Playlista wspomnień', icon: '🎵', stage: 3, category: 'system', points: 10 },
    // Etap 4
    { title: 'Potwierdzenia od gości', icon: '✅', stage: 4, category: 'system', points: 10 },
    { title: 'Wzruszająca mowa / list', icon: '💌', stage: 4, category: 'system', points: 20 },
    { title: 'Album wspomnień / prezentacja foto', icon: '📷', stage: 4, category: 'system', points: 20 },
    { title: 'Stylizacja na ten dzień', icon: '👗', stage: 4, category: 'system', points: 10 },
    // Etap 5
    { title: 'Wręczcie sobie prezenty', icon: '🎁', stage: 5, category: 'system', points: 20 },
    { title: 'Cieszcie się sobą!', icon: '💕', stage: 5, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Romantyk Amator',       emoji: '🌹', description: 'Pierwsze kroki w organizacji!' },
    { threshold: 40,  name: 'Mistrz Ceremonii',      emoji: '🥂', description: 'Wszystko nabiera kształtów.' },
    { threshold: 100, name: 'Strażnik Wspomnień',    emoji: '📷', description: 'Dbasz o każdy detal.' },
    { threshold: 200, name: 'Bohater Rocznicy',      emoji: '💎', description: 'Profesjonalny poziom!' },
    { threshold: 350, name: 'Legenda Miłości',       emoji: '💕', description: 'Ta rocznica będzie niezapomniana!' },
  ],
  achievements: [
    { id: 'first_step',  title: 'Pierwszy gest',     description: 'Pierwsze zadanie odhaczone', icon: '🌹',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'venue',       title: 'Mamy miejsce!',     description: 'Lokalizacja wybrana', icon: '🏛️',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 1 },
    { id: 'memories',    title: 'Album wspomnień',   description: 'Prezent / album przygotowany', icon: '📷',
      condition: ctx => (ctx.completedByStage[4] ?? 0) >= 2 },
    { id: 'half_way',    title: 'Półmetek',          description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done',    title: 'Forever yours',     description: 'Wszystkie zadania ukończone', icon: '💕',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 5. JUBILEUSZ
// ============================================================================
export const JUBILEUSZ_CONFIG: EventGamificationConfig = {
  type: 'jubileusz',
  label: 'Jubileusz',
  emoji: '🏆',
  welcomeMessage: 'Witaj w przygotowaniach do uczczenia ważnego momentu!',
  motivationalQuote: 'Jubileusz to świętowanie historii, dorobku i bliskich. Każdy szczegół ma znaczenie.',
  encouragementOnComplete: 'Coraz bliżej wielkiego święta! Robisz to wzorowo.',
  themeColors: {
    primary: '#b8860b',
    secondary: '#fff8dc',
    accent: '#8b4513',
  },
  stages: [
    { num: 1, name: 'Decyzja i koncepcja',  timeframe: '6-12 m-cy przed', icon: '💡', color: '#b8860b' },
    { num: 2, name: 'Goście i zaproszenia', timeframe: '3-6 m-cy przed',  icon: '👥', color: '#a0760a' },
    { num: 3, name: 'Organizacja',          timeframe: '1-3 m-ce przed',  icon: '📋', color: '#896608' },
    { num: 4, name: 'Finalizacja',          timeframe: '2-4 tyg. przed',  icon: '✨', color: '#715607' },
    { num: 5, name: 'Ostatnia prosta',      timeframe: 'Tydzień przed',   icon: '🎊', color: '#5a4605' },
    { num: 6, name: 'DZIEŃ JUBILEUSZU',     timeframe: 'Dzień jubileuszu',icon: '🏆', color: '#423604' },
  ],
  tasks: [
    // Etap 1
    { title: 'Określ powód i typ jubileuszu', icon: '🏆', stage: 1, category: 'system', points: 15 },
    { title: 'Ustal datę uroczystości', icon: '📅', stage: 1, category: 'system', points: 15 },
    { title: 'Zaplanuj budżet', icon: '💰', stage: 1, category: 'system', points: 15 },
    { title: 'Wybierz formę (uroczysta gala / kameralne spotkanie)', icon: '🎭', stage: 1, category: 'system', points: 15 },
    // Etap 2
    { title: 'Stwórz pełną listę gości', icon: '👥', stage: 2, category: 'system', points: 20 },
    { title: 'Zaprojektuj zaproszenia', icon: '✉️', stage: 2, category: 'system', points: 15 },
    { title: 'Wyślij zaproszenia', icon: '📮', stage: 2, category: 'system', points: 20 },
    { title: 'Zbierz pierwsze potwierdzenia', icon: '✅', stage: 2, category: 'system', points: 10 },
    // Etap 3
    { title: 'Zarezerwuj salę / lokal', icon: '🏛️', stage: 3, category: 'system', points: 30 },
    { title: 'Wybierz catering / menu', icon: '🍽️', stage: 3, category: 'system', points: 20 },
    { title: 'Wybierz fotografa / kamerzystę', icon: '📸', stage: 3, category: 'system', points: 20 },
    { title: 'Wybierz oprawę muzyczną', icon: '🎵', stage: 3, category: 'system', points: 15 },
    { title: 'Zaplanuj prezentację / wspomnienia', icon: '🎬', stage: 3, category: 'system', points: 20 },
    // Etap 4
    { title: 'Zamów tort jubileuszowy', icon: '🎂', stage: 4, category: 'system', points: 15 },
    { title: 'Dekoracje sali', icon: '🌸', stage: 4, category: 'system', points: 15 },
    { title: 'Przemówienia / mowy', icon: '🎤', stage: 4, category: 'system', points: 20 },
    { title: 'Album / prezent dla jubilata', icon: '📔', stage: 4, category: 'system', points: 25 },
    // Etap 5
    { title: 'Plan stołów', icon: '🪑', stage: 5, category: 'system', points: 15 },
    { title: 'Próba prezentacji multimedialnej', icon: '💻', stage: 5, category: 'system', points: 10 },
    { title: 'Upominki dla gości', icon: '🎁', stage: 5, category: 'system', points: 15 },
    { title: 'Stylizacja na ten dzień', icon: '👔', stage: 5, category: 'system', points: 10 },
    // Etap 6
    { title: 'Powitaj gości i ciesz się dniem!', icon: '🥂', stage: 6, category: 'system', points: 30 },
    { title: 'Zrób sesję rodzinną', icon: '📸', stage: 6, category: 'system', points: 20 },
  ],
  levels: [
    { threshold: 0,   name: 'Inicjator Jubileuszu', emoji: '🌱', description: 'Zaczynasz przygotowania!' },
    { threshold: 50,  name: 'Mistrz Tradycji',      emoji: '📜', description: 'Tradycja w pełni doceniona.' },
    { threshold: 120, name: 'Strażnik Pamięci',     emoji: '📷', description: 'Dbasz o każdą historię.' },
    { threshold: 250, name: 'Bohater Jubileuszu',   emoji: '🎖️', description: 'Profesjonalny organizator!' },
    { threshold: 400, name: 'Legenda Pokoleń',      emoji: '🏆', description: 'Ten dzień zostanie zapamiętany na lata!' },
  ],
  achievements: [
    { id: 'first_step',   title: 'Pierwsza świeczka',  description: 'Pierwsze zadanie odhaczone', icon: '🕯️',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'guests_done',  title: 'Lista gości gotowa', description: 'Etap zaproszeń zaliczony', icon: '✉️',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 3 },
    { id: 'venue',        title: 'Mamy miejsce!',      description: 'Sala zarezerwowana', icon: '🏛️',
      condition: ctx => (ctx.completedByStage[3] ?? 0) >= 1 },
    { id: 'half_way',     title: 'Półmetek',           description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done',     title: 'Wielki Jubileusz!',  description: 'Wszystkie zadania ukończone', icon: '🏆',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 6. BABY SHOWER
// ============================================================================
export const BABY_SHOWER_CONFIG: EventGamificationConfig = {
  type: 'baby_shower',
  label: 'Baby Shower',
  emoji: '🍼',
  welcomeMessage: 'Witajcie w przygotowaniach do uroczego powitania bociana!',
  motivationalQuote: 'Baby Shower to święto przyszłej Mamy. Niech będzie magiczny i pełen miłości!',
  encouragementOnComplete: 'Bocian byłby z Was dumny — kolejny krok bliżej idealnego dnia!',
  themeColors: {
    primary: '#ffb6c1',
    secondary: '#bcd4ff',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Pomysł i ogłoszenie',     timeframe: '6-8 tyg. przed', icon: '🍼', color: '#ffb6c1' },
    { num: 2, name: 'Motyw i estetyka',         timeframe: '4-6 tyg. przed', icon: '🎀', color: '#f0a4b1' },
    { num: 3, name: 'Goście i logistyka',       timeframe: '3-4 tyg. przed', icon: '👥', color: '#e192a1' },
    { num: 4, name: 'Atrakcje i przygotowania', timeframe: '1-2 tyg. przed', icon: '🎉', color: '#d28091' },
    { num: 5, name: 'DZIEŃ BABY SHOWER',        timeframe: 'Dzień imprezy',  icon: '👶', color: '#c36e81' },
  ],
  tasks: [
    // Etap 1
    { title: 'Ustalcie datę imprezy', icon: '📅', stage: 1, category: 'system', points: 15 },
    { title: 'Wybierzcie miejsce (dom / lokal / ogród)', icon: '🏡', stage: 1, category: 'system', points: 20 },
    { title: 'Określcie budżet', icon: '💰', stage: 1, category: 'system', points: 10 },
    { title: 'Wstępna lista gości', icon: '👥', stage: 1, category: 'system', points: 10 },
    // Etap 2
    { title: 'Wybierzcie motyw przewodni (np. miś, balony, bawełna)', icon: '🎨', stage: 2, category: 'system', points: 20 },
    { title: 'Paleta kolorów (różowy / niebieski / pastelowy)', icon: '🌈', stage: 2, category: 'system', points: 10 },
    { title: 'Zaprojektuj zaproszenia', icon: '✉️', stage: 2, category: 'system', points: 15 },
    { title: 'Wyślij zaproszenia', icon: '📮', stage: 2, category: 'system', points: 15 },
    // Etap 3
    { title: 'Zbierz potwierdzenia od gości', icon: '✅', stage: 3, category: 'system', points: 15 },
    { title: 'Zamów catering / przygotuj poczęstunek', icon: '🍽️', stage: 3, category: 'system', points: 20 },
    { title: 'Tort baby shower', icon: '🎂', stage: 3, category: 'system', points: 15 },
    { title: 'Lista prezentów (rejestr / inspiracje)', icon: '🎁', stage: 3, category: 'system', points: 15 },
    // Etap 4
    { title: 'Zaplanuj zabawy i konkursy', icon: '🎲', stage: 4, category: 'system', points: 20 },
    { title: 'Dekoracje i balony', icon: '🎈', stage: 4, category: 'system', points: 15 },
    { title: 'Strefa foto / ścianka', icon: '📸', stage: 4, category: 'system', points: 15 },
    { title: 'Upominki dla gości', icon: '💝', stage: 4, category: 'system', points: 10 },
    { title: 'Playlista', icon: '🎵', stage: 4, category: 'system', points: 10 },
    { title: 'Stylizacja przyszłej Mamy', icon: '👗', stage: 4, category: 'system', points: 15 },
    // Etap 5
    { title: 'Przygotuj wszystko rano', icon: '🌅', stage: 5, category: 'system', points: 20 },
    { title: 'Bawcie się i celebrujcie!', icon: '👶', stage: 5, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Świeża Mamuśka',          emoji: '🤰', description: 'Pierwsze kroki w organizacji!' },
    { threshold: 30,  name: 'Organizator Brzuszka',    emoji: '🍼', description: 'Wszystko zaczyna się układać.' },
    { threshold: 80,  name: 'Mistrz Niespodzianek',    emoji: '🎉', description: 'Goście będą zachwyceni!' },
    { threshold: 150, name: 'Bocianowa VIP',           emoji: '🦩', description: 'Profesjonalny poziom!' },
    { threshold: 250, name: 'Królowa Baby Shower',     emoji: '👶', description: 'Idealny dzień gwarantowany!' },
  ],
  achievements: [
    { id: 'first_step',   title: 'Pierwsze "kop!"',   description: 'Pierwsze zadanie odhaczone', icon: '🤰',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'theme_chosen', title: 'Mamy klimat!',      description: 'Motyw przewodni wybrany', icon: '🎀',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 2 },
    { id: 'guests_in',    title: 'Goście idą!',       description: 'Logistyka pod kontrolą', icon: '👥',
      condition: ctx => (ctx.completedByStage[3] ?? 0) >= 2 },
    { id: 'half_way',     title: 'Półmetek',          description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done',     title: 'Gotowi na dzidziusia!', description: 'Wszystkie zadania ukończone', icon: '👶',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// FUNKCJE POMOCNICZE (dodane w celu naprawy błędu importu)
// ============================================================================

export function getEventGamificationConfig(type: string | null | undefined): EventGamificationConfig {
  const safeType = (type || 'inne').toLowerCase().trim() as EventType
  switch (safeType) {
    case 'slub': return SLUB_CONFIG;
    case 'komunia': return KOMUNIA_CONFIG;
    case 'chrzciny': return CHRZCINY_CONFIG;
    case 'rocznica': return ROCZNICA_CONFIG;
    case 'jubileusz': return JUBILEUSZ_CONFIG;
    case 'baby_shower': return BABY_SHOWER_CONFIG;
    case 'urodziny': return URODZINY_CONFIG;
    case 'gender_reveal': return GENDER_REVEAL_CONFIG;
    case 'inne': return INNE_CONFIG;
    default: return INNE_CONFIG;
  }
}

export function getCurrentLevel(points: number, levels: Level[]): Level {
  // Szukamy najwyższego poziomu, którego próg punktowy został osiągnięty
  // Zakładamy, że tablica levels jest posortowana od najniższego progu do najwyższego
  return levels.slice().reverse().find(level => points >= level.threshold) || levels[0];
}

export function getNextLevel(points: number, levels: Level[]): Level | null {
  // Szukamy pierwszego poziomu, którego próg punktowy jest większy od obecnych punktów
  return levels.find(level => points < level.threshold) || null;
}

export function getUnlockedAchievements(
  ctx: AchievementContext, 
  achievements: Achievement[]
): Achievement[] {
  // Zwracamy tylko te osiągnięcia, których warunek (condition) zwraca true
  return achievements.filter(achievement => achievement.condition(ctx));
}

// ============================================================================
// 7. URODZINY
// ============================================================================
export const URODZINY_CONFIG: EventGamificationConfig = {
  type: 'urodziny',
  label: 'Urodziny',
  emoji: '🎂',
  welcomeMessage: 'Witaj w przygotowaniach do wielkiego świętowania!',
  motivationalQuote: 'Każde urodziny to powód do radości. Niech ten dzień będzie wyjątkowy!',
  encouragementOnComplete: 'Świetnie! Idziesz jak burza.',
  themeColors: {
    primary: '#ff6b9d',
    secondary: '#ffd1dc',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Pomysł i koncepcja',  timeframe: '1-2 m-ce przed', icon: '💡', color: '#ff6b9d' },
    { num: 2, name: 'Goście i zaproszenia', timeframe: '3-4 tyg. przed', icon: '✉️', color: '#e85a8a' },
    { num: 3, name: 'Atrakcje i jedzenie', timeframe: '1-2 tyg. przed', icon: '🎁', color: '#d14977' },
    { num: 4, name: 'Ostatnie szlify',     timeframe: 'Dni przed',      icon: '✨', color: '#ba3864' },
    { num: 5, name: 'DZIEŃ URODZIN',       timeframe: 'Dziś!',          icon: '🎉', color: '#a32751' },
  ],
  tasks: [
    { title: 'Wybierz miejsce (dom / lokal / plener)', icon: '🏡', stage: 1, category: 'system', points: 15 },
    { title: 'Ustal datę i godzinę', icon: '📅', stage: 1, category: 'system', points: 10 },
    { title: 'Określ budżet', icon: '💰', stage: 1, category: 'system', points: 10 },
    { title: 'Motyw imprezy', icon: '🎨', stage: 1, category: 'system', points: 15 },
    { title: 'Lista gości', icon: '👥', stage: 2, category: 'system', points: 15 },
    { title: 'Zaprojektuj zaproszenia', icon: '✉️', stage: 2, category: 'system', points: 15 },
    { title: 'Wyślij zaproszenia', icon: '📮', stage: 2, category: 'system', points: 15 },
    { title: 'Zbierz potwierdzenia', icon: '✅', stage: 2, category: 'system', points: 10 },
    { title: 'Zamów tort urodzinowy', icon: '🎂', stage: 3, category: 'system', points: 20 },
    { title: 'Catering / poczęstunek', icon: '🍽️', stage: 3, category: 'system', points: 20 },
    { title: 'Atrakcje (animator / DJ / fotobudka)', icon: '🎲', stage: 3, category: 'system', points: 15 },
    { title: 'Dekoracje i balony', icon: '🎈', stage: 3, category: 'system', points: 15 },
    { title: 'Prezent dla solenizanta', icon: '🎁', stage: 3, category: 'system', points: 20 },
    { title: 'Playlista', icon: '🎵', stage: 4, category: 'system', points: 10 },
    { title: 'Strefa foto / ścianka', icon: '📸', stage: 4, category: 'system', points: 10 },
    { title: 'Stylizacja na ten dzień', icon: '👗', stage: 4, category: 'system', points: 10 },
    { title: 'Świętujcie i bawcie się!', icon: '🎉', stage: 5, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Imprezowy Nowicjusz',  emoji: '🌱', description: 'Zaczynasz przygotowania!' },
    { threshold: 30,  name: 'Imprezowicz',          emoji: '🎈', description: 'Wszystko zaczyna się układać.' },
    { threshold: 80,  name: 'Mistrz Zabawy',        emoji: '🎉', description: 'Goście będą zachwyceni!' },
    { threshold: 150, name: 'Bohater Imprezy',      emoji: '🎂', description: 'Profesjonalny poziom!' },
    { threshold: 250, name: 'Legenda Urodzin',      emoji: '👑', description: 'Niezapomniana impreza gwarantowana!' },
  ],
  achievements: [
    { id: 'first_step', title: 'Pierwszy krok', description: 'Pierwsze zadanie odhaczone', icon: '🌱',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'venue', title: 'Mamy miejsce!', description: 'Lokalizacja wybrana', icon: '🏡',
      condition: ctx => (ctx.completedByStage[1] ?? 0) >= 1 },
    { id: 'half_way', title: 'Półmetek', description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done', title: 'Sto lat!', description: 'Wszystkie zadania ukończone', icon: '🎂',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 8. GENDER REVEAL
// ============================================================================
export const GENDER_REVEAL_CONFIG: EventGamificationConfig = {
  type: 'gender_reveal',
  label: 'Gender Reveal',
  emoji: '🎀',
  welcomeMessage: 'Witajcie w przygotowaniach do najsłodszej tajemnicy!',
  motivationalQuote: 'Tajemnica brzucha zostanie odkryta — ten dzień zapamiętacie na zawsze!',
  encouragementOnComplete: 'Świetnie! Coraz bliżej wielkiego momentu.',
  themeColors: {
    primary: '#ff85a2',
    secondary: '#85b9ff',
    accent: '#ffd700',
  },
  stages: [
    { num: 1, name: 'Plan i tajemnica',      timeframe: '3-4 tyg. przed', icon: '🤫', color: '#ff85a2' },
    { num: 2, name: 'Motyw i sposób reveal', timeframe: '2-3 tyg. przed', icon: '🎈', color: '#dd7693' },
    { num: 3, name: 'Goście i atrakcje',     timeframe: '1-2 tyg. przed', icon: '👥', color: '#bb6884' },
    { num: 4, name: 'Finalizacja',           timeframe: 'Dni przed',      icon: '✨', color: '#995a75' },
    { num: 5, name: 'DZIEŃ REVEAL!',         timeframe: 'Dzień imprezy',  icon: '🎉', color: '#774c66' },
  ],
  tasks: [
    { title: 'Zdobądźcie kopertę z USG / wynikiem płci', icon: '🤫', stage: 1, category: 'system', points: 25 },
    { title: 'Wybierzcie zaufaną osobę do organizacji niespodzianki', icon: '🤝', stage: 1, category: 'system', points: 15 },
    { title: 'Ustalcie datę', icon: '📅', stage: 1, category: 'system', points: 10 },
    { title: 'Określcie miejsce', icon: '🏡', stage: 1, category: 'system', points: 15 },
    { title: 'Wybierzcie sposób reveal (balon / tort / dym)', icon: '🎈', stage: 2, category: 'system', points: 25 },
    { title: 'Zamówcie produkt do reveal', icon: '🎁', stage: 2, category: 'system', points: 20 },
    { title: 'Motyw przewodni i kolory', icon: '🎨', stage: 2, category: 'system', points: 10 },
    { title: 'Zaproszenia "Boy or Girl?"', icon: '✉️', stage: 2, category: 'system', points: 15 },
    { title: 'Zbierz potwierdzenia gości', icon: '✅', stage: 3, category: 'system', points: 10 },
    { title: 'Konkurs głosowania (Team Pink / Team Blue)', icon: '🗳️', stage: 3, category: 'system', points: 15 },
    { title: 'Catering / poczęstunek', icon: '🍽️', stage: 3, category: 'system', points: 15 },
    { title: 'Fotograf lub osoba do nagrywania', icon: '📸', stage: 3, category: 'system', points: 20 },
    { title: 'Dekoracje (różowe + niebieskie)', icon: '🎈', stage: 4, category: 'system', points: 15 },
    { title: 'Próba reveal (sprawdź czy działa!)', icon: '🧪', stage: 4, category: 'system', points: 20 },
    { title: 'Włącz kamerę!', icon: '🎬', stage: 5, category: 'system', points: 25 },
    { title: 'Wielkie odkrycie!', icon: '🎉', stage: 5, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Sekretny Agent',         emoji: '🕵️', description: 'Tajemnica w Twoich rękach!' },
    { threshold: 25,  name: 'Mistrz Suspensu',        emoji: '🤫', description: 'Nikt nic nie wie. Idealnie.' },
    { threshold: 60,  name: 'Strateg Niespodzianek',  emoji: '🎯', description: 'Plan działa jak złoto.' },
    { threshold: 120, name: 'Bohater Reveal Party',   emoji: '🎈', description: 'Goście będą oszołomieni!' },
    { threshold: 200, name: 'Legenda Tajemnic',       emoji: '🎀', description: 'Ten reveal to majstersztyk!' },
  ],
  achievements: [
    { id: 'first_step', title: 'Sekret w rękach', description: 'Pierwsze zadanie odhaczone', icon: '🤫',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'method', title: 'Plan gotowy', description: 'Sposób reveal wybrany', icon: '🎈',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 2 },
    { id: 'half_way', title: 'Półmetek', description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done', title: "It's a...!", description: 'Wszystkie zadania ukończone', icon: '🎉',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

// ============================================================================
// 9. INNE — UNIWERSALNY EVENT
// ============================================================================
export const INNE_CONFIG: EventGamificationConfig = {
  type: 'inne',
  label: 'Inne wydarzenie',
  emoji: '🌟',
  welcomeMessage: 'Witaj w przygotowaniach do Twojego wydarzenia!',
  motivationalQuote: 'Każde dobre wydarzenie zaczyna się od planu. Krok po kroku.',
  encouragementOnComplete: 'Świetna robota! Idziesz w dobrym kierunku.',
  themeColors: {
    primary: '#6366f1',
    secondary: '#a5b4fc',
    accent: '#fbbf24',
  },
  stages: [
    { num: 1, name: 'Koncepcja',     timeframe: 'Wcześnie',           icon: '💡', color: '#6366f1' },
    { num: 2, name: 'Planowanie',    timeframe: 'Środek przygotowań', icon: '📋', color: '#5046d8' },
    { num: 3, name: 'Organizacja',   timeframe: 'Bliżej daty',        icon: '✨', color: '#3a2cbf' },
    { num: 4, name: 'Finalizacja',   timeframe: 'Tydzień przed',      icon: '💎', color: '#241ca6' },
    { num: 5, name: 'DZIEŃ EVENTU',  timeframe: 'Dzień wydarzenia',   icon: '🎉', color: '#0e0c8d' },
  ],
  tasks: [
    { title: 'Określ cel i typ wydarzenia', icon: '🎯', stage: 1, category: 'system', points: 15 },
    { title: 'Ustal datę', icon: '📅', stage: 1, category: 'system', points: 15 },
    { title: 'Określ budżet', icon: '💰', stage: 1, category: 'system', points: 15 },
    { title: 'Stwórz wstępną listę uczestników', icon: '👥', stage: 1, category: 'system', points: 10 },
    { title: 'Zarezerwuj miejsce', icon: '🏛️', stage: 2, category: 'system', points: 30 },
    { title: 'Wybierz motyw / koncepcję wizualną', icon: '🎨', stage: 2, category: 'system', points: 15 },
    { title: 'Zaprojektuj zaproszenia', icon: '✉️', stage: 2, category: 'system', points: 15 },
    { title: 'Wyślij zaproszenia', icon: '📮', stage: 2, category: 'system', points: 15 },
    { title: 'Catering / menu', icon: '🍽️', stage: 3, category: 'system', points: 20 },
    { title: 'Fotograf / dokumentacja', icon: '📸', stage: 3, category: 'system', points: 15 },
    { title: 'Muzyka / oprawa dźwiękowa', icon: '🎵', stage: 3, category: 'system', points: 15 },
    { title: 'Dekoracje', icon: '🌸', stage: 3, category: 'system', points: 15 },
    { title: 'Potwierdzenia gości', icon: '✅', stage: 4, category: 'system', points: 10 },
    { title: 'Plan dnia / agenda', icon: '📋', stage: 4, category: 'system', points: 15 },
    { title: 'Upominki / pamiątki', icon: '🎁', stage: 4, category: 'system', points: 15 },
    { title: 'Przybądź wcześnie i sprawdź wszystko', icon: '⏰', stage: 5, category: 'system', points: 20 },
    { title: 'Ciesz się swoim wydarzeniem!', icon: '🌟', stage: 5, category: 'system', points: 30 },
  ],
  levels: [
    { threshold: 0,   name: 'Świeży Organizator',  emoji: '🌱', description: 'Pierwsze kroki w planowaniu!' },
    { threshold: 50,  name: 'Mistrz Planowania',   emoji: '📒', description: 'Wszystko nabiera kształtów.' },
    { threshold: 150, name: 'Pro Eventu',          emoji: '✨', description: 'Trzymasz wszystko w garści.' },
    { threshold: 300, name: 'Mistrz Ceremonii',    emoji: '🎖️', description: 'Profesjonalny poziom!' },
    { threshold: 500, name: 'Legenda',             emoji: '🌟', description: 'Twoje wydarzenie będzie niezapomniane!' },
  ],
  achievements: [
    { id: 'first_step', title: 'Pierwszy krok', description: 'Pierwsze zadanie odhaczone', icon: '🌱',
      condition: ctx => ctx.completedCount >= 1 },
    { id: 'venue', title: 'Mamy miejsce!', description: 'Lokalizacja zarezerwowana', icon: '🏛️',
      condition: ctx => (ctx.completedByStage[2] ?? 0) >= 1 },
    { id: 'half_way', title: 'Półmetek', description: '50% zadań za Tobą', icon: '⛅',
      condition: ctx => ctx.completedCount / Math.max(ctx.totalCount, 1) >= 0.5 },
    { id: 'all_done', title: 'Misja zakończona!', description: 'Wszystkie zadania ukończone', icon: '🌟',
      condition: ctx => ctx.completedCount === ctx.totalCount && ctx.totalCount > 0 },
  ],
}

/**
 * Funkcja pomocnicza budująca kontekst dla systemu osiągnięć.
 * Mapuje dane wejściowe na strukturę zrozumiałą dla warunków (conditions) osiągnięć.
 */
export function buildAchievementContext(data: Record<string, unknown>): AchievementContext {
  return {
    totalPoints: (data.totalPoints as number) || (data.points as number) || 0,
    completedCount: (data.completedCount as number) || (data.tasksCompleted as number) || 0,
    totalCount: (data.totalCount as number) || (data.totalTasks as number) || 0,
    completedByStage: (data.completedByStage as Record<number, number>) || {},
    totalByStage: (data.totalByStage as Record<number, number>) || {},
  };
}