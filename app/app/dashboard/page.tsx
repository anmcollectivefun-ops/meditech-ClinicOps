'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  CalendarHeart, Plus, LogOut, User, LayoutDashboard, 
  BookOpen, Sparkles, ChevronRight, Users,
  Settings, Mail, CheckSquare, Wallet, HeartHandshake,
  X, Camera, MapPin, Clock, Bus, Globe, Copy, ExternalLink, Save,
  MonitorPlay, Image as ImageIcon,
  Crown, MessageCircle, Zap, Music, ImagePlus, MessageSquareHeart, Lock,
  Gift, BookOpenCheck, Lightbulb, Shirt, Palette, Utensils, CalendarDays,
  Armchair, Printer, Send, PiggyBank, ListTodo, Store, Phone, PenLine,
  MailPlus, UploadCloud, Heart, Baby, Bed, Car, FileText, ShieldCheck,
  Trophy, Bell, Info, HelpCircle, AlertTriangle, CreditCard, Receipt,
  Smartphone, Download
} from 'lucide-react'

// IMPORT HOOKA DO PWA
import { usePWAInstall } from '../hooks/usePWAInstall'

// ============================================================================
// KONFIGURACJA
// ============================================================================
const NEEDS_CEREMONY = ['slub', 'komunia', 'chrzciny', 'rocznica', 'jubileusz', 'inne']
const COMING_SOON_SITES: string[] = [] // Wyczyszczone - odblokowuje edycję dla wszystkich!
const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

// ============================================================================
// SYSTEM MOTYWÓW
// ============================================================================
const APP_THEMES = {
  emerald:        { name: 'Butelkowa Zieleń',    bgApp: 'bg-[#F4F6F5]', bgCard: 'bg-[#2A3B32]',  textMain: 'text-[#E8EDE9]', textAccent: 'text-[#A3B8AD]', border: 'border-[#3D5247]',  btn: 'bg-[#2A3B32] hover:bg-[#1F2C25] text-white',            textTheme: 'text-[#2A3B32]',  bgLight: 'bg-[#2A3B32]/10',  ring: 'focus:border-[#2A3B32]'  },
  sage:           { name: 'Szałwia & Złoto',     bgApp: 'bg-[#FAFAFA]', bgCard: 'bg-[#899B8B]',  textMain: 'text-white',      textAccent: 'text-[#D4AF37]', border: 'border-[#9EAF9F]',  btn: 'bg-[#899B8B] hover:bg-[#7A8B7B] text-white',            textTheme: 'text-[#899B8B]',  bgLight: 'bg-[#899B8B]/10',  ring: 'focus:border-[#899B8B]'  },
  bw:             { name: 'High Fashion B&W',    bgApp: 'bg-white',     bgCard: 'bg-black',       textMain: 'text-white',      textAccent: 'text-gray-400',  border: 'border-gray-800',   btn: 'bg-black hover:bg-gray-800 text-white',                 textTheme: 'text-black',      bgLight: 'bg-gray-100',      ring: 'focus:border-black'       },
  terracotta:     { name: 'Terakota & Błękit',   bgApp: 'bg-[#F2F5F8]', bgCard: 'bg-[#C26D5C]',  textMain: 'text-[#FFF5F3]', textAccent: 'text-[#E8B4A9]', border: 'border-[#D17C6B]',  btn: 'bg-[#C26D5C] hover:bg-[#A85B4B] text-white',            textTheme: 'text-[#C26D5C]',  bgLight: 'bg-[#C26D5C]/10',  ring: 'focus:border-[#C26D5C]'  },
  royal_navy:     { name: 'Królewski Granat',    bgApp: 'bg-[#F4F6F8]', bgCard: 'bg-[#1B2A47]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#E3D3B5]', border: 'border-[#2C3E5D]',  btn: 'bg-[#1B2A47] hover:bg-[#111C30] text-white',            textTheme: 'text-[#1B2A47]',  bgLight: 'bg-[#1B2A47]/10',  ring: 'focus:border-[#1B2A47]'  },
  espresso:       { name: 'Ciemne Espresso',     bgApp: 'bg-[#FCFAF8]', bgCard: 'bg-[#3E2A23]',  textMain: 'text-[#F5EBE6]', textAccent: 'text-[#C4A484]', border: 'border-[#5A4036]',  btn: 'bg-[#3E2A23] hover:bg-[#2A1C17] text-[#F5EBE6]',      textTheme: 'text-[#3E2A23]',  bgLight: 'bg-[#3E2A23]/10',  ring: 'focus:border-[#3E2A23]'  },
  dusty_rose:     { name: 'Pudrowy Róż',         bgApp: 'bg-[#FFFDFD]', bgCard: 'bg-[#C59B99]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#684C4A]', border: 'border-[#D17C6B]',  btn: 'bg-[#C59B99] hover:bg-[#AD8583] text-white',            textTheme: 'text-[#B28280]',  bgLight: 'bg-[#C59B99]/15',  ring: 'focus:border-[#C59B99]'  },
  lavender_haze:  { name: 'Wrzosowy Pastel',     bgApp: 'bg-[#FAFAFD]', bgCard: 'bg-[#A29EBB]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#4A4453]', border: 'border-[#B4B0CB]',  btn: 'bg-[#A29EBB] hover:bg-[#8B86A6] text-white',            textTheme: 'text-[#8A86A3]',  bgLight: 'bg-[#A29EBB]/15',  ring: 'focus:border-[#A29EBB]'  },
  sky_blue:       { name: 'Pastelowy Błękit',    bgApp: 'bg-[#F4F8FA]', bgCard: 'bg-[#8FB8D1]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#3B5B6E]', border: 'border-[#7A9EBA]',  btn: 'bg-[#8FB8D1] hover:bg-[#7A9EBA] text-white',            textTheme: 'text-[#7A9EBA]',  bgLight: 'bg-[#8FB8D1]/15',  ring: 'focus:border-[#8FB8D1]'  },
  fresh_mint:     { name: 'Świeża Mięta',        bgApp: 'bg-[#F5FAFA]', bgCard: 'bg-[#A2D5C6]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#3E7060]', border: 'border-[#8DBDAF]',  btn: 'bg-[#A2D5C6] hover:bg-[#8DBDAF] text-white',            textTheme: 'text-[#8DBDAF]',  bgLight: 'bg-[#A2D5C6]/20',  ring: 'focus:border-[#A2D5C6]'  },
  peach_pastel:   { name: 'Brzoskwiniowy Pastel',bgApp: 'bg-[#FFFBF9]', bgCard: 'bg-[#EBBCA3]',  textMain: 'text-[#FFFFFF]',  textAccent: 'text-[#7D5845]', border: 'border-[#D6A991]',  btn: 'bg-[#EBBCA3] hover:bg-[#D6A991] text-white',            textTheme: 'text-[#EBBCA3]',  bgLight: 'bg-[#EBBCA3]/15',  ring: 'focus:border-[#EBBCA3]'  },
  gold_luxury:    { name: 'Złoty Luksus',        bgApp: 'bg-[#FDFBF7]', bgCard: 'bg-[#D4AF37]',  textMain: 'text-black',      textAccent: 'text-[#333333]', border: 'border-[#B8860B]',  btn: 'bg-black text-[#D4AF37] hover:bg-zinc-800',             textTheme: 'text-[#B8860B]',  bgLight: 'bg-[#D4AF37]/10',  ring: 'focus:border-[#D4AF37]'  },
  midnight_gold:  { name: 'Nocne Złoto',         bgApp: 'bg-[#0A0A0A]', bgCard: 'bg-[#1A1A1A]',  textMain: 'text-[#D4AF37]',  textAccent: 'text-[#F7E7CE]', border: 'border-[#D4AF37]',  btn: 'bg-[#D4AF37] text-black hover:bg-[#B8860B]',            textTheme: 'text-[#D4AF37]',  bgLight: 'bg-[#D4AF37]/10',  ring: 'focus:border-[#D4AF37]'  },
}

// Kolory i ikony per typ eventu
const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; badge: string; badgeText: string; photo: string }> = {
  slub:          { label: 'Ślub',          icon: '💍', badge: 'bg-rose-100',   badgeText: 'text-rose-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/03/para-mloda.webp' },
  chrzciny:      { label: 'Chrzciny',      icon: '🕊️', badge: 'bg-sky-100',    badgeText: 'text-sky-700',     photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/chrzciny.webp' },
  komunia:       { label: 'Komunia',       icon: '✝️', badge: 'bg-indigo-100', badgeText: 'text-indigo-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/komunia.webp' },
  urodziny:      { label: 'Urodziny',      icon: '🎂', badge: 'bg-amber-100',  badgeText: 'text-amber-700',   photo: 'https://anmcollective.pl/wp-content/uploads/2026/03/prezentyy.webp' },
  urodziny18:    { label: '18-stka',       icon: '🎉', badge: 'bg-violet-100', badgeText: 'text-violet-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/18.webp' },
  baby_shower:   { label: 'Baby Shower',   icon: '🍼', badge: 'bg-pink-100',   badgeText: 'text-pink-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/babyshower.webp' },
  gender_reveal: { label: 'Gender Reveal', icon: '💙', badge: 'bg-blue-100',   badgeText: 'text-blue-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/genderrevue.webp' },
  jubileusz:     { label: 'Jubileusz',     icon: '🏆', badge: 'bg-yellow-100', badgeText: 'text-yellow-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/jubileusz.webp' },
  rocznica:      { label: 'Rocznica',      icon: '💑', badge: 'bg-red-100',    badgeText: 'text-red-700',     photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/roczmice.webp' },
  inne:          { label: 'Inne',          icon: '🗓️', badge: 'bg-slate-100',  badgeText: 'text-slate-600',   photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/inne.webp' },
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const [user, setUser] = useState<null | { email: string; id: string }>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events') 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [orderingSiteFor, setOrderingSiteFor] = useState<any | null>(null)
  const [themeKey, setThemeKey] = useState<keyof typeof APP_THEMES>('emerald')
  const t = APP_THEMES[themeKey]

  const router = useRouter()
  const supabase = createClient()
  const { triggerInstall, isInstallable, isInstalled } = usePWAInstall();

  useEffect(() => {
    const saved = localStorage.getItem('anm-dashboard-theme')
    if (saved && saved in APP_THEMES) setThemeKey(saved as keyof typeof APP_THEMES)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('anm-dashboard-theme', themeKey)
  }, [themeKey])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser({ email: user.email ?? '', id: user.id })

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEvents(data || [])
      setLoading(false)
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const switchTab = (tab: string) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  async function handleSaveSettings() {
    if (!editingEvent) return
    setSaving(true)
    
    const { id, user_id, created_at, ...updates } = editingEvent
    
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', editingEvent.id)

    if (error) {
      alert('Błąd zapisu: ' + error.message)
    } else {
      setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e))
      setEditingEvent(null)
    }
    setSaving(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Skopiowano unikalny kod wydarzenia! Możesz go wkleić na stronie WWW.')
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bgApp}`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src="/192x192.png" alt="ANM" className="w-12 h-12 rounded-2xl opacity-60" />
          <p className={`${t.textTheme} font-bold tracking-widest uppercase text-sm`}>Wczytywanie Twojego świata...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${t.bgApp} font-sans flex flex-col md:flex-row transition-colors duration-500`}>

      {/* TOP BAR (MOBILE) */}
      <div className={`md:hidden ${t.bgCard} ${t.textMain} p-4 flex justify-between items-center sticky top-0 z-50 shadow-md border-b ${t.border} transition-colors duration-500`}>
        <div className="flex items-center gap-2">
          <img src="/192x192.png" alt="ANM" className="w-8 h-8 rounded-xl" />
          <span className={`font-serif text-xl font-bold ${t.textMain}`}>ANM Planner</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 ${t.textMain}`}>
          {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-all duration-300 ease-in-out
        fixed md:sticky top-0 left-0 h-screen w-72 ${t.bgCard} border-r ${t.border} flex flex-col z-40 shadow-2xl md:shadow-none
      `}>
        {/* LOGO */}
        <div className={`p-6 hidden md:flex items-center gap-4 border-b ${t.border}`}>
          <img src="/192x192.png" alt="ANM" className="w-12 h-12 rounded-2xl shadow-lg flex-shrink-0" />
          <div>
            <div className={`font-serif text-2xl font-extrabold ${t.textMain} leading-tight`}>ANM</div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${t.textAccent} font-bold`}>Planer Eventowy</p>
          </div>
        </div>

        {/* PRZEŁĄCZNIK MOTYWU W SIDEBARZE */}
        <div className={`px-5 py-4 border-b ${t.border} hidden md:block`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${t.textAccent} mb-3`}>Motyw</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(APP_THEMES) as Array<keyof typeof APP_THEMES>).map(key => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                title={APP_THEMES[key].name}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${themeKey === key ? 'scale-125 border-white' : 'border-transparent opacity-70 hover:opacity-100'} ${APP_THEMES[key].bgCard}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 hide-scrollbar">
          <div>
            <p className={`px-4 text-[10px] font-black uppercase tracking-widest ${t.textAccent} mb-3`}>Panel Główny</p>
            <nav className="space-y-1">
              <SidebarBtn theme={t} icon={<LayoutDashboard />} label="Moje Wydarzenia" active={activeTab === 'events'} onClick={() => switchTab('events')} />
              <button
                onClick={() => router.push('/dashboard/new')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all mt-3 ${t.btn}`}
              >
                <Plus size={18} /> Stwórz Nowy Event
              </button>
            </nav>
          </div>

          <div>
            <p className={`px-4 text-[10px] font-black uppercase tracking-widest ${t.textAccent} mb-3`}>Co potrafi planer?</p>
            <nav className="space-y-1">
              <SidebarBtn theme={t} icon={<BookOpen />} label="1. Wersja Darmowa" active={activeTab === 'tier_free'} onClick={() => switchTab('tier_free')} />
              <SidebarBtn theme={t} icon={<Globe />} label="2. Ze Stroną WWW" active={activeTab === 'tier_web'} onClick={() => switchTab('tier_web')} highlight />
              <SidebarBtn theme={t} icon={<Crown />} label="3. Strona PRO" active={activeTab === 'tier_pro'} onClick={() => switchTab('tier_pro')} premium />
              <div className={`pt-3 mt-2 border-t ${t.border}`}>
                <SidebarBtn theme={t} icon={<FileText />} label="Zestawienie Funkcji" active={activeTab === 'features_overview'} onClick={() => switchTab('features_overview')} />
                <SidebarBtn theme={t} icon={<MonitorPlay />} label="Instrukcja Edycji Strony" active={activeTab === 'instruction'} onClick={() => switchTab('instruction')} />
                <SidebarBtn theme={t} icon={<HelpCircle />} label="Jak to działa? (FAQ)" active={activeTab === 'how_it_works'} onClick={() => switchTab('how_it_works')} />
              </div>
            </nav>
          </div>

          <div>
            <p className={`px-4 text-[10px] font-black uppercase tracking-widest ${t.textAccent} mb-3`}>Ustawienia</p>
            <nav className="space-y-1">
              <SidebarBtn theme={t} icon={<User />} label="Moje Konto" active={activeTab === 'account'} onClick={() => switchTab('account')} />
              <SidebarBtn theme={t} icon={<CreditCard />} label="Moje Subskrypcje" active={activeTab === 'subscriptions'} onClick={() => switchTab('subscriptions')} />
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t ${t.border}`}>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${t.textMain} opacity-60 hover:opacity-100 hover:bg-black/10 transition-all`}>
            <LogOut size={18} /> Wyloguj się
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative flex flex-col hide-scrollbar">

        {/* PASEK MOTYWU (MOBILE) */}
        <div className="md:hidden bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-2 flex items-center gap-3 flex-wrap sticky top-16 z-40">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motyw:</span>
          {(Object.keys(APP_THEMES) as Array<keyof typeof APP_THEMES>).map(key => (
            <button
              key={key}
              onClick={() => setThemeKey(key)}
              title={APP_THEMES[key].name}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${themeKey === key ? 'scale-125 border-slate-600' : 'border-transparent'} ${APP_THEMES[key].bgCard}`}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex-1">
          
          {/* =================================================================== */}
          {/* ZAKŁADKA: MOJE WYDARZENIA                                           */}
          {/* =================================================================== */}
          {activeTab === 'events' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* NAGŁÓWEK */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${t.textTheme} opacity-60 mb-2`}>ANM Planner</p>
                  <h2 className={`font-serif text-4xl md:text-5xl font-extrabold ${t.textTheme} mb-1 tracking-tight`}>Moje Wydarzenia</h2>
                  <p className="text-slate-500 font-medium text-sm">
                    {events.length === 0 ? 'Zacznij od stworzenia pierwszego projektu.' : `${events.length} projekt${events.length === 1 ? '' : events.length < 5 ? 'y' : 'ów'} w organizacji`}
                  </p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/new')}
                  className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all ${t.btn}`}
                >
                  <Plus size={16} /> Nowe wydarzenie
                </button>
              </div>

              {events.length === 0 ? (
                <div className={`bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 ${t.bgLight}`}></div>

                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${t.bgLight}`}>
                    <CalendarHeart className={t.textTheme} size={40} />
                  </div>
                  <h3 className={`font-serif text-3xl md:text-4xl font-bold ${t.textTheme} mb-4`}>Twój planer jest jeszcze pusty</h3>
                  <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed text-lg">
                    Aby w pełni zobaczyć, jak działa planer i odkryć jego wszystkie niezwykłe możliwości, <strong>stwórz swój pierwszy event</strong>. To nic nie kosztuje i zajmie tylko kilka sekund!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <button onClick={() => router.push('/dashboard/new')} className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 ${t.btn}`}>
                      <Plus size={18} /> Stwórz pierwsze wydarzenie
                    </button>

                    {!isInstalled && isInstallable && (
                      <button 
                        onClick={triggerInstall}
                        className={`inline-flex items-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-black text-sm uppercase tracking-widest shadow-sm transition-all hover:-translate-y-1`}
                      >
                        <Smartphone size={18} /> Pobierz Aplikację
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* KARTA: DODAJ NOWY */}
                  <div
                    onClick={() => router.push('/dashboard/new')}
                    className={`group rounded-[24px] border-2 border-dashed border-slate-200 hover:border-slate-300 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 min-h-[300px] bg-white/40 hover:bg-white/80`}
                  >
                    <div className={`w-16 h-16 rounded-full ${t.bgLight} group-hover:scale-110 transition-all flex items-center justify-center mb-4`}>
                      <Plus className={t.textTheme} size={28} />
                    </div>
                    <span className={`font-black uppercase tracking-widest text-xs transition-colors ${t.textTheme} opacity-50 group-hover:opacity-100`}>Dodaj Nowe</span>
                  </div>

                  {events.map(event => {
                    const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.inne
                    const days = getDaysUntil(event.event_date)
                    const isPast = days !== null && days < 0
                    return (
                      <div
                        key={event.id}
                        className={`group relative rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-200 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col min-h-[300px] bg-white`}
                        onClick={() => router.push(`/dashboard/events/${event.id}`)}
                      >
                        {/* NAGŁÓWEK KARTY — Motyw przewodni + Zdjęcie białego szkicu */}
                        <div className={`relative overflow-hidden flex-shrink-0 h-40 ${t.bgCard}`}>
                          
                          <div
                            className="absolute inset-y-0 right-0 w-3/4 transition-transform duration-700 ease-out group-hover:scale-105 opacity-40 mix-blend-screen filter brightness-0 invert pointer-events-none"
                            style={{ 
                              backgroundImage: `url(${cfg.photo})`, 
                              backgroundSize: 'contain', 
                              backgroundPosition: 'right center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />

                          <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-sm border border-white/20 text-white">
                                {cfg.icon}
                              </div>
                              {days !== null && (
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${isPast ? 'bg-black/20 text-white/60 border-white/10' : 'bg-white/15 text-white border-white/20'}`}>
                                  {isPast ? 'Po terminie' : days === 0 ? 'Dziś! 🎉' : `za ${days} dni`}
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-serif text-xl font-extrabold text-white line-clamp-2 leading-tight">
                                {event.title}
                              </h3>
                              <p className="text-white/80 text-xs font-bold mt-1.5">
                                {event.event_date ? new Date(event.event_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Brak daty'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CIAŁO KARTY */}
                        <div className="bg-white flex-1 p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={`${cfg.badge} ${cfg.badgeText} text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Users size={12} /> {event.guest_count || 0}
                            </span>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingEvent(event) }}
                            className="flex items-center justify-center gap-2 w-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            <Settings size={12} /> Edytuj dane / WWW
                          </button>

                          <div className="mt-auto">
                            {!COMING_SOON_SITES.includes(event.type) ? (
                              event.invitation_url ? (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                                  <div className="flex items-center gap-1.5 text-emerald-700">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Masz stronę</span>
                                  </div>
                                  <a
                                    href={event.invitation_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                                  >
                                    Otwórz <ExternalLink size={10} />
                                  </a>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOrderingSiteFor(event) }}
                                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${t.btn}`}
                                >
                                  <Sparkles size={12} /> Kup stronę WWW
                                </button>
                              )
                            ) : (
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-400 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center">
                                Szablony wkrótce
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none text-slate-600">
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* ZAKŁADKI EDUKACYJNE I POMOCNICZE                                    */}
          {/* =================================================================== */}
          {activeTab === 'tier_free' && <TierFreeContent theme={t} />}
          {activeTab === 'tier_web' && <TierWebContent theme={t} />}
          {activeTab === 'tier_pro' && <TierProContent theme={t} />}
          {activeTab === 'features_overview' && <FeaturesOverviewContent theme={t} />}
          {activeTab === 'instruction' && <InstructionContent theme={t} />}
          {activeTab === 'how_it_works' && <HowItWorksContent theme={t} />}

          {/* =================================================================== */}
          {/* ZAKŁADKA: MOJE KONTO                                                */}
          {/* =================================================================== */}
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <h2 className="font-serif text-4xl font-extrabold text-slate-800 mb-8 tracking-tight">Ustawienia Konta</h2>
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-sm ${t.bgCard} ${t.textMain}`}>
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Zalogowany jako</p>
                    <p className={`text-xl font-black ${t.textTheme}`}>{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button onClick={() => alert('Zmiana hasła wkrótce dostępna.')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                    <span className="font-bold text-slate-700 flex items-center gap-3"><Settings size={18} className="text-slate-400 group-hover:text-slate-600" /> Zmień hasło</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500" />
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-600 transition-all group">
                    <span className="font-bold flex items-center gap-3"><LogOut size={18} /> Wyloguj się z urządzenia</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ZAKŁADKA: SUBSKRYPCJE                                               */}
          {/* =================================================================== */}
        {activeTab === 'subscriptions' && <SubscriptionsContent user={user} events={events} theme={t} />}

        </div>
      </main>

      {/* MODAL: KUP STRONĘ WWW */}
      {orderingSiteFor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setOrderingSiteFor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${t.bgLight}`}></div>
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10 ${t.bgLight}`}>
              <Globe size={32} className={t.textTheme} />
            </div>

            <h3 className="font-serif text-3xl font-bold text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{orderingSiteFor.title}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {orderingSiteFor.id}
                </code>
                <button 
                  onClick={() => copyToClipboard(orderingSiteFor.id)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>&quot;Uwagi do zamówienia&quot;</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${orderingSiteFor.id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setOrderingSiteFor(null)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${t.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

      {/* PANEL EDYCJI USTAWIEŃ EVENTU */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${editingEvent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingEvent(null)}></div>
        
        <div className={`absolute top-0 right-0 w-full max-w-lg h-full bg-slate-50 shadow-2xl border-l border-slate-200 transform transition-transform duration-500 ease-out flex flex-col overflow-hidden ${editingEvent ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className={`p-6 flex justify-between items-center shrink-0 ${t.bgCard} ${t.textMain}`}>
            <div>
              <h3 className="font-serif text-2xl font-bold">Konfiguracja</h3>
              <p className="text-xs opacity-70 mt-1 uppercase tracking-wider font-bold">{editingEvent?.title}</p>
            </div>
            <button onClick={() => setEditingEvent(null)} className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className={`font-black text-lg flex items-center gap-2 border-b border-slate-100 pb-3 ${t.textTheme}`}><Settings size={18}/> Podstawowe dane</h4>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój unikalny Kod Wydarzenia</p>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                    {editingEvent?.id}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(editingEvent?.id || '');
                      alert('Skopiowano kod wydarzenia!');
                    }} 
                    className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                    title="Kopiuj Kod"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Podaj ten kod podczas zamawiania e-Zaproszenia w naszym sklepie internetowym, abyśmy mogli automatycznie połączyć stronę z tym planerem!
                </p>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nazwa wydarzenia w panelu</label>
                <input value={editingEvent?.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all ${t.ring}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Data</label>
                  <input type="date" value={editingEvent?.event_date || ''} onChange={e => setEditingEvent({...editingEvent, event_date: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none transition-all uppercase ${t.ring}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Godzina</label>
                  <input type="time" value={editingEvent?.event_time || ''} onChange={e => setEditingEvent({...editingEvent, event_time: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none transition-all ${t.ring}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Liczba gości</label>
                  <input type="number" value={editingEvent?.guest_count || ''} onChange={e => setEditingEvent({...editingEvent, guest_count: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all ${t.ring}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Budżet (zł)</label>
                  <input type="number" value={editingEvent?.budget || ''} onChange={e => setEditingEvent({...editingEvent, budget: e.target.value})} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all ${t.ring}`} />
                </div>
              </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* POLE: PŁEĆ */}
                {['baby_shower', 'gender_reveal', 'chrzciny', 'urodziny', 'komunia'].includes(editingEvent?.type) && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Płeć (Bohatera wydarzenia)</label>
                    <select 
                      value={editingEvent?.gender || ''} 
                      onChange={e => setEditingEvent({...editingEvent, gender: e.target.value})} 
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all ${t.ring}`}
                    >
                      <option value="">-- Wybierz (lub zostaw puste) --</option>
                      <option value="Chłopiec">Chłopiec 💙</option>
                      <option value="Dziewczynka">Dziewczynka 🩷</option>
                      <option value="Niespodzianka">Niespodzianka ✨</option>
                    </select>
                  </div>
                )}

                {/* NOWE POLE: WIEK / ROCZNICA */}
                {['urodziny', 'urodziny18', 'rocznica', 'jubileusz'].includes(editingEvent?.type) && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Które urodziny / rocznica? (Cyfra)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={editingEvent?.event_years || ''} 
                      onChange={e => setEditingEvent({...editingEvent, event_years: e.target.value})} 
                      placeholder="np. 18, 50, 1..."
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all ${t.ring}`} 
                    />
                  </div>
                )}
              </div>
            </div>

            {COMING_SOON_SITES.includes(editingEvent?.type) ? (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-amber-500"><Sparkles size={24}/></div>
                <h4 className="font-serif text-xl font-bold text-slate-800 mb-2">Strona WWW w przygotowaniu</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pracujemy nad dedykowanymi, pięknymi szablonami stron internetowych dla tego typu wydarzeń. Edycja materiałów logistycznych będzie dostępna wkrótce!
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className={`font-black text-lg flex items-center gap-2 ${t.textTheme}`}><Camera size={18}/> Moduł Strony: Powitanie</h4>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex gap-2">
                    <span className="text-lg">💡</span>
                    Te informacje od razu zaktualizują się na głównym ekranie (Hero) Twojej Strony Wydarzenia.
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Główny napis (np. Imiona)</label>
                    <input value={editingEvent?.hero_names || ''} onChange={e => setEditingEvent({...editingEvent, hero_names: e.target.value})} placeholder="np. Anita & Sebastian" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-serif outline-none transition-all placeholder:text-slate-400 text-slate-900 ${t.ring}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Zdjęcia - układ 3 kart (opcjonalne)</label>
                    <div className="grid grid-cols-1 gap-2">
                      <input value={editingEvent?.hero_img_left || ''} onChange={e => setEditingEvent({...editingEvent, hero_img_left: e.target.value})} placeholder="URL Lewego Zdjęcia" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${t.ring}`} />
                      <input value={editingEvent?.hero_img_center || ''} onChange={e => setEditingEvent({...editingEvent, hero_img_center: e.target.value})} placeholder="URL Środkowego Zdjęcia" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${t.ring}`} />
                      <input value={editingEvent?.hero_img_right || ''} onChange={e => setEditingEvent({...editingEvent, hero_img_right: e.target.value})} placeholder="URL Prawego Zdjęcia" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${t.ring}`} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className={`font-black text-lg flex items-center gap-2 border-b border-slate-100 pb-3 ${t.textTheme}`}><MapPin size={18}/> Moduł Strony: Logistyka</h4>
                  
                  {NEEDS_CEREMONY.includes(editingEvent?.type) && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={14}/> Ceremonia / Część oficjalna</label>
                      <textarea value={editingEvent?.ceremony_info || ''} onChange={e => setEditingEvent({...editingEvent, ceremony_info: e.target.value})} placeholder="np. 15 Sierpnia 2027, 16:00&#10;Kościół św. Anny&#10;Miastowo" rows={3} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-xs outline-none transition-all placeholder:text-slate-400 text-slate-900 ${t.ring}`} />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={14}/> Miejsce Przyjęcia / Imprezy</label>
                    <textarea value={editingEvent?.party_info || ''} onChange={e => setEditingEvent({...editingEvent, party_info: e.target.value})} placeholder="np. Dworek pod Lipami&#10;Ul. Leśna 12&#10;Miastkowo" rows={3} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-xs outline-none transition-all placeholder:text-slate-400 text-slate-900 ${t.ring}`} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className={`font-black text-lg flex items-center gap-2 border-b border-slate-100 pb-3 ${t.textTheme}`}><Bus size={18}/> Dodatkowe usługi dla gości</h4>
                  
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                      <input type="checkbox" checked={editingEvent?.plans_transport || false} onChange={e => setEditingEvent({...editingEvent, plans_transport: e.target.checked})} className="w-5 h-5 rounded text-indigo-500 border-slate-300" />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Transport</span>
                        <span className="text-[10px] text-slate-500 font-medium">Zaznacz, jeśli organizujecie transport</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                      <input type="checkbox" checked={editingEvent?.plans_accommodation || false} onChange={e => setEditingEvent({...editingEvent, plans_accommodation: e.target.checked})} className="w-5 h-5 rounded text-indigo-500 border-slate-300" />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Noclegi</span>
                        <span className="text-[10px] text-slate-500 font-medium">Zaznacz, jeśli pomagacie w bazie noclegowej</span>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-200 shrink-0 flex gap-3">
            <button onClick={() => setEditingEvent(null)} className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs">
              Anuluj
            </button>
            <button onClick={handleSaveSettings} disabled={saving} className={`flex-1 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest text-xs hover:-translate-y-0.5 ${t.btn}`}>
              {saving ? 'Zapisywanie...' : <><Save size={16}/> Zapisz Zmiany</>}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ============================================================================
// KOMPONENTY POMOCNICZE
// ============================================================================

function SidebarBtn({ icon, label, active, onClick, highlight = false, premium = false, theme }: any) {
  const activeClass = active
    ? `bg-black/10 shadow-inner ${theme.textMain} font-black`
    : `hover:bg-black/5 ${theme.textMain} opacity-70 hover:opacity-100`;

  let customClass = activeClass;
  if (premium) customClass = active ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 shadow-md' : 'text-amber-400 hover:bg-amber-400/10';
  if (highlight && !premium) customClass = active ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-500/10';

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${customClass}`}
    >
      {icon} {label}
      {premium && !active && <Crown size={12} className="ml-auto" />}
    </button>
  )
}

function FullFeatureCard({ icon, title, description, highlight = false, premium = false, comingSoon = false, theme }: any) {
  let borderClass = 'border-slate-200'
  let iconBg = `${theme.bgLight} ${theme.textTheme}`
  let badge = null

  if (highlight) {
    borderClass = `${theme.border} shadow-sm`
    iconBg = `${theme.bgCard} text-white`
    badge = <span className={`text-[9px] font-black uppercase tracking-widest ${theme.bgLight} ${theme.textTheme} px-2 py-1 rounded-full ml-auto`}>Na stronie WWW</span>
  }

  if (premium) {
    borderClass = 'border-emerald-300 shadow-md'
    iconBg = 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
    badge = <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full ml-auto flex items-center gap-1"><Crown size={10}/> PRO</span>
  }

  if (comingSoon) {
    borderClass = 'border-slate-200 opacity-70'
    iconBg = 'bg-slate-100 text-slate-400'
    badge = <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-full ml-auto">Wkrótce</span>
  }

  return (
    <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg bg-white flex gap-5 ${borderClass}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-2">
          <h4 className="text-lg font-bold text-slate-800 leading-tight flex-1">{title}</h4>
          {badge}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function InstructionStep({ num, title, description, icon, placeholder, highlight = false, theme }: any) {
  return (
    <div className="relative">
      <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${highlight ? `${theme.bgCard} text-white` : `${theme.bgLight} ${theme.textTheme}`}`}>
        {num === '★' ? <Sparkles size={24}/> : num}
      </div>
      <div className="pl-16">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed">{description}</p>
        
        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 aspect-video md:aspect-[21/9]">
          <div className="mb-4 opacity-50">{icon}</div>
          <p className="font-bold text-center uppercase tracking-widest text-sm">
            [MIEJSCE NA ZDJĘCIE / SCREENSHOT]
          </p>
          <p className="text-xs text-center mt-2">{placeholder}</p>
        </div>
      </div>
    </div>
  )
}

function CodeIcon({ size = 24, className }: { size?: number, className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
}

// ============================================================================
// ZAWARTOŚĆ ZAKŁADEK (Przepisana na dynamiczne motywy i ujednolicone czcionki)
// ============================================================================
function TierFreeContent({ theme }: { theme: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-12">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textTheme} text-[10px] font-bold uppercase tracking-[0.2em] mb-4`}>
          <BookOpen size={14} /> Poziom 1 — Bez zobowiązań
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Wersja Darmowa</h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
          To Twój <strong>prywatny planer online</strong> — potężny, bezpieczny notes, do którego masz dostęp tylko Ty. Wszystkie moduły są odblokowane w 100%, tak jak w wersji z e-Zaproszeniem. Różnica jest jedna: <strong>wszystkie dane wpisujesz ręcznie</strong>.
        </p>
      </div>

      <div className="space-y-5">
        <FullFeatureCard theme={theme} icon={<Users />} title="Goście — Twoja prywatna książka adresowa" description="Otrzymujesz pełną bazę gości. Sam uzupełniasz wszystkie dane — imię, nazwisko, mail, telefon, relację. Zmieniasz status RSVP (Brak odpowiedzi / Potwierdzone / Odmowa). Gotową listę w każdej chwili możesz wydrukować." />
        <FullFeatureCard theme={theme} icon={<Wallet />} title="Budżet — Pełna kontrola nad kasą" description="Wpisujesz wszystkie swoje wydatki ręcznie, przypisujesz do kategorii. Pasek postępu pokazuje, ile procent jest pokryte. Masz pełną kontrolę nad terminami zaliczek — system przypomina o ratach." />
        <FullFeatureCard theme={theme} icon={<ListTodo />} title="Zadania — Grywalizacja przygotowań" description="Ustawiasz i odhaczasz wszystkie swoje zadania. Dostajesz gotową ścieżkę 7 etapów przygotowań. Zdobywasz punkty i awansujesz przez kolejne poziomy organizatora eventów." />
        <FullFeatureCard theme={theme} icon={<Store />} title="Ekipa — Twoje centrum usługodawców" description="Dodajesz, usuwasz i edytujesz członków ekipy. Szybka wyszukiwarka na Google Maps pozwala odnaleźć usługi w okolicy. Z poziomu ekipy możesz importować kontrakty prosto do zakładki budżetowej." />
        <FullFeatureCard theme={theme} icon={<Music />} title="Muzyka — Playlista i Spotify" description="Sam układasz listę wymarzonych utworów. Drukujesz ją lub wysyłasz mailem bezpośrednio do DJ-a. Dodatkowo możesz podpiąć z boku swoją playlistę ze Spotify w formie odtwarzacza." />
        <FullFeatureCard theme={theme} icon={<MessageSquareHeart />} title="Kapsuła Czasu — Listy w przyszłość" description="Piszesz listy do siebie lub do bliskich na przyszłość (np. na 10. rocznicę). System formatuje je do druku jako piękne karty okolicznościowe gotowe do zamknięcia w skrzynce z winem." />
        <FullFeatureCard theme={theme} icon={<Gift />} title="Prezenty — Lista marzeń i zbiórki" description="Ustalasz co najbardziej chcesz otrzymać, a co nie. Dodajesz cele zbiórek (np. na podróż) i wgrywasz numery IBAN. Gościom telefonicznie proponujesz konkretne, wolne sloty z tej listy." />
        <FullFeatureCard theme={theme} icon={<HeartHandshake />} title="Najbliżsi — Twój orszak i rodzice" description="Wrzucasz osoby VIP i rozdzielasz dla nich role. Możesz przypisać im zadania bojowe (np. Świadek odbiera tort) i wysłać tę check-listę jednym kliknięciem na ich e-mail." />
        <FullFeatureCard theme={theme} icon={<Camera />} title="Wspomnienia — Centrum pamiątkowe" description="Zbierasz w jednym miejscu prywatne zdjęcia czy filmy linkując je z serwisów zewnętrznych." />
        <FullFeatureCard theme={theme} icon={<Armchair />} title="Stoły — Plan usadzenia gości" description="Pracujemy nad interaktywnym planem stołów drag & drop dla Twojej wygody." comingSoon />
        <FullFeatureCard theme={theme} icon={<CalendarDays />} title="Organizacja — Harmonogram, FAQ i Menu" description="Zapisujesz harmonogram dnia wydarzenia krok po kroku. Ustalasz menu dla sali. Działa system szkiców pozwalający zbudować alternatywny Plan B na wypadek deszczu." />
        <FullFeatureCard theme={theme} icon={<BookOpenCheck />} title="Historia — Oś czasu i Quiz" description="Zapisujesz swoją historię krok po kroku. Opcjonalnie dorzucasz Pytania Quizowe. Taki quiz możesz wydrukować na stoły i zorganizować zabawę dla gości w trakcie kolacji." />
        <FullFeatureCard theme={theme} icon={<Shirt />} title="Inspiracje — Moodboard i Dress Code" description="Komponujesz paletę barw i dobierasz wytyczne ubioru dla kobiet i mężczyzn. Wklejasz fotki-inspiracje na tajną tablicę u dołu. Wszystko to jest wyłącznie na Twój własny użytek." />
      </div>

      <div className={`mt-16 p-8 rounded-3xl border text-center ${theme.bgLight} ${theme.border}`}>
        <h3 className={`font-serif text-2xl font-bold mb-3 ${theme.textTheme}`}>To wszystko masz za darmo</h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Wszystkie 13 modułów działa od teraz. Używaj planera jako swojego prywatnego notatnika organizacyjnego tak długo, jak potrzebujesz. Gdy poczujesz, że chcesz zautomatyzować proces informowania gości — po prostu dołączysz do nas Stronę WWW.
        </p>
      </div>
    </div>
  )
}

function TierWebContent({ theme }: { theme: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-12">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textTheme} text-[10px] font-bold uppercase tracking-[0.2em] mb-4`}>
          <Globe size={14} /> Poziom 2 — Pakiet ze Stroną WWW
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Wersja ze Stroną WWW</h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
          Masz wszystko to, co w wersji darmowej (pełna baza 13 modułów), ale <strong>pięć kluczowych sekcji dodatkowo pojawia się na Twojej prywatnej stronie E-Zaproszenia</strong>. Dane edytujesz w planerze, a jednym kliknięciem publikujesz je na żywo na stronie dla gości.
        </p>
      </div>

      <div className="mb-12">
        <h3 className={`text-xl font-bold border-b pb-4 mb-6 flex items-center gap-3 ${theme.textTheme} ${theme.border}`}>
          <Sparkles /> Pięć sekcji edytujesz na żywo na Twojej stronie
        </h3>

        <div className="space-y-5">
          <FullFeatureCard theme={theme} highlight icon={<HeartHandshake />} title="Najbliżsi — Orszak na Waszej stronie" description="Dodajesz zdjęcia i opisy swoich najbliższych na stronę, by czuli się wyróżnieni. Decydujesz, kto pojawia się publicznie, zaznaczając odpowiednią flagę przy danej osobie." />
          <FullFeatureCard theme={theme} highlight icon={<BookOpenCheck />} title="Historia — Interaktywna oś czasu z quizem" description="Twoja historia wraz z quizem i zdjęciami ląduje na Twojej własnej stronie jako przewijana oś czasu. Goście mogą zgadywać wciągający quiz, a Ty w panelu decydujesz, co publikujesz." />
          <FullFeatureCard theme={theme} highlight icon={<CalendarDays />} title="Organizacja — Harmonogram, FAQ i Menu na stronie" description="Tworzysz menu, harmonogram oraz FAQ. Posiadasz zaawansowany system szkiców, dzięki któremu w sekundę przełączasz widoczność Planu A na Plan B na publicznej witrynie gości." />
          <FullFeatureCard theme={theme} highlight icon={<Shirt />} title="Inspiracje — Dress Code dla gości" description="Kolory i wytyczne lądują na publicznej witrynie. Natomiast Twoja tablica z inspiracjami (Moodboard) z dolnej części zakładki, ZAWSZE pozostaje w 100% ukryta przed gośćmi." />
          <FullFeatureCard theme={theme} highlight icon={<Gift />} title="Prezenty — Lista rezerwacji na żywo" description="Twoja lista prezentów wyświetla się gościom. Mogą oni przeglądać sloty i klikając „Zarezerwuj” blokować je przez powieleniem prezentu. Pojawiają się tam też konta do zrzutek." />
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6 flex items-center gap-3">
          <BookOpen className="text-slate-400"/> Pozostałe sekcje działają jak w wersji darmowej
        </h3>
        <div className="space-y-5">
          <FullFeatureCard theme={theme} icon={<Users />} title="Goście" description="Baza uzupełniana ręcznie, bez automatycznych RSVP. Możesz jednak stąd jednym kliknięciem wysłać zaproszenia na e-maile." />
          <FullFeatureCard theme={theme} icon={<Wallet />} title="Budżet" description="Całkowicie prywatne finanse. Nigdy nie pojawiają się w sieci." />
          <FullFeatureCard theme={theme} icon={<ListTodo />} title="Zadania" description="Prywatny notes, odznaki, trofea i przypomnienia organizacyjne." />
          <FullFeatureCard theme={theme} icon={<Store />} title="Ekipa" description="Zawsze ukryta książka kontaktów biznesowych do Twojego eventu." />
          <FullFeatureCard theme={theme} icon={<Music />} title="Muzyka" description="Ustalasz własną playlistę. Pobieranie propozycji muzycznych od gości to funkcja z pakietu PRO." />
          <FullFeatureCard theme={theme} icon={<MessageSquareHeart />} title="Kapsuła Czasu" description="Własne wpisy na pamiątkę w przyszłość. Możliwość wysyłania życzeń online odblokujesz w PRO." />
          <FullFeatureCard theme={theme} icon={<Camera />} title="Wspomnienia" description="Wgrywasz własne linki do galerii. Zewnętrzny upload zdjęć przez telefon przez gości znajduje się w wersji PRO." />
        </div>
      </div>

      <div className={`mt-12 p-8 rounded-3xl text-center border relative overflow-hidden ${theme.bgCard} ${theme.border}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <h3 className="font-serif text-3xl font-bold text-white mb-4 relative z-10">Zamów Stronę Wydarzenia</h3>
        <p className="text-white/80 mb-8 max-w-lg mx-auto relative z-10">
          Wybierz jeden z naszych wzorów w sklepie, a my podepniemy go do Twojego planera. Ożyw Najbliższych, Historię i Organizację jednym kliknięciem!
        </p>
        <a href={INVITATION_SHOP_URL} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1">
          Zobacz Sklep ANM <ChevronRight size={18} />
        </a>
      </div>
    </div>
  )
}

function TierProContent({ theme }: { theme: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-md">
          <Crown size={14} /> Poziom 3 — Maksimum Automatyzacji
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Wersja ze Stroną PRO</h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
          Wszystko to, co w wersji ze Stroną WWW, ale z <strong>pełną automatyzacją zbierania danych od gości</strong>. Koniec z ręcznym przepisywaniem. Strona obsługuje wszystko i wypełnia Twój planer sama.
        </p>
      </div>

      <div className="mb-12">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[32px] p-1 shadow-2xl shadow-emerald-200/40">
          <div className="bg-white rounded-[28px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Serce Pakietu PRO</span>
                  <h3 className="text-2xl font-black text-slate-800">RSVP — Automatyczna Lista Gości</h3>
                </div>
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-6">
                To absolutnie najważniejsza funkcja pakietu. Goście z poziomu strony jednym przyciskiem wypełniają KOMPLET danych, jakich tylko zażądasz. Poniższe informacje na bieżąco, noc i dzień, napełniają Twoją tabelę gości i generują automatyczne wydruki do firm zewnętrznych:
              </p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-3">Co gość wypełnia jednym formularzem?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-emerald-600"/> Adres e-mail</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-600"/> Numer telefonu</div>
                  <div className="flex items-center gap-2"><Utensils size={14} className="text-emerald-600"/> Wybór diety i alergeny</div>
                  <div className="flex items-center gap-2"><Heart size={14} className="text-emerald-600"/> Osobę towarzyszącą i Dzieci</div>
                  <div className="flex items-center gap-2"><Car size={14} className="text-emerald-600"/> Zapotrzebowanie na transport</div>
                  <div className="flex items-center gap-2"><Bed size={14} className="text-emerald-600"/> Potrzebę wynajęcia hotelu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6 flex items-center gap-3">
          <Sparkles className="text-emerald-500"/> Pozostałe automatyzacje PRO
        </h3>
        <div className="space-y-5">
          <FullFeatureCard theme={theme} premium icon={<Music />} title="Muzyka — Propozycje od gości" description="Podczas wypełniania ankiety, goście proponują również po jednej super-piosenki dla DJ'a. Ty z pozycji planera je widzisz, zatwierdzasz lub usuwasz przed wysłaniem ostatecznej listy wykonawcy." />
          <FullFeatureCard theme={theme} premium icon={<MessageSquareHeart />} title="Kapsuła Czasu — Życzenia Live" description="Przez dedykowaną podstronę Twoi uczestnicy wpisują życzenia do Kapsuły i określają na którą rocznicę ją dedykują. Nie musisz ich ścigać z mikrofonem i zeszytem." />
          <FullFeatureCard theme={theme} premium icon={<UploadCloud />} title="Wspomnienia — Upload zdjęć od gości" description="Strefa uploadu zdjęć po zakończeniu imprezy! Wszystkie wykonane wczoraj rano selfie na smartfonach znajomych wylądują bezpiecznie w Twojej pamiątkowej chmurze tego planera." />
        </div>
      </div>

      <div className="mt-12 p-8 bg-slate-900 rounded-[32px] text-center border border-slate-800 relative overflow-hidden shadow-2xl">
        <Crown size={48} className="mx-auto text-amber-400 mb-4 relative z-10" />
        <h3 className="font-serif text-3xl font-bold text-white mb-4 relative z-10">Zaoszczędź dziesiątki godzin</h3>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10 leading-relaxed">
          Zrezygnuj z dzwonienia, z notesów, z zagubionych maili. Niech goście sami wypełnią RSVP, prześlą dedykacje muzyczne i zrzucą zdjęcia po zabawie. Aktywuj pakiet PRO.
        </p>
        <a href={INVITATION_SHOP_URL} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-900 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1">
          Zobacz Sklep <ChevronRight size={18} />
        </a>
      </div>
    </div>
  )
}

function FeaturesOverviewContent({ theme }: { theme: any }) {
  const PDF_FEATURES = [
    {
      name: "Goście",
      icon: <Users size={16} />,
      free: "Informujesz się i dodajesz gości ręcznie (imię i nazwisko, email, nr tel, relacja, liczba dzieci które też przyjdą, dieta i alergie, status czy przyjdzie czy nie). Listę możesz wydrukować. Masz wszystko w jednym miejscu. [cite: 1]",
      web: "Wypisujesz wszystkich zaproszonych, wysyłasz im na maila link do strony a swoją obecność i inne informacje goście wypełniają sami a ty możesz umieścić te informacje ręcznie do tej zakładki, bez wydzwaniania po gościach. [cite: 1]",
      pro: "Dodajesz wszystkich zaproszonych, link do strony wysyłasz im na maila a swoją obecność i inne informacje goście wypełniają sami. Wszystkie informacje dodają się same do tej zakładki a ty masz wszystko w jednym miejscu. [cite: 1]"
    },
    {
      name: "Budżet",
      icon: <Wallet size={16} />,
      free: "Wszystkie wydatki, całkowity budżet na event i ile zostało do zapłaty. Na bieżąco dodajesz nowe wydatki i możesz całą listę, zaliczki i umowy z zakładki ekipa wydrukować. Można jednym kliknięciem przesłać kwoty firm zapisanych w zakładce ekipa. Rzeczy z budżetów i koszty i termin płatność pojawiają się automatycznie w kalendarzu w zakładce zadania. [cite: 1, 2]",
      web: "Tak samo jak w wersji darmowej. [cite: 1, 2]",
      pro: "Tak samo jak w wersji darmowej. [cite: 1, 2]"
    },
    {
      name: "Zadania",
      icon: <ListTodo size={16} />,
      free: "Umieszczasz wszystkie zadania związane z eventem i termin w kalendarzu. Pod spodem masz przeliczone ile zostało ukończonych, ile zadań zostało w danych miesiącu i ile jest już po terminie. Nie trzeba samemu przeliczać w kalendarzu. [cite: 2, 3, 4]",
      web: "Jak w wersji darmowej. [cite: 2, 3, 4]",
      pro: "Jak w wersji darmowej. [cite: 2, 3, 4]"
    },
    {
      name: "Ekipa",
      icon: <Store size={16} />,
      free: "Opcja znajdź wykonawców w okolicy - sala, dj, fotograf, wizaż i włosy, florystyka, cukiernia w miejscowości którą wybierzesz. Niżej masz swoją listę ekipy, możesz ręcznie sobie wpisać np. fotografa i jaki jest koszt jego usługi, jego dane kontaktowe. Można na tej części zapisywać, porównywać i wyceniać podwykonawców. [cite: 4, 5]",
      web: "Jak w wersji darmowej. [cite: 4, 5]",
      pro: "Jak w wersji darmowej. [cite: 4, 5]"
    },
    {
      name: "Playlista",
      icon: <Music size={16} />,
      free: "Tworzysz w tej opcji sam playlistę którą możesz wydrukować lub bezpośrednio wysłać do dja. Można również zintegrować ze swoją playlistą na Spotify. [cite: 5]",
      web: "Goście mogą na stronie dodać swoje propozycje piosenek a ty dodajesz je ręcznie. [cite: 5]",
      pro: "Goście również mogą dodawać do tej playlisty piosenki które automatycznie dodają się na playlistę. [cite: 5]"
    },
    {
      name: "Kapsułka czasu",
      icon: <MessageSquareHeart size={16} />,
      free: "W tym miejscu w wersji darmowej możesz sobie przepisać wszystkie życzenia od gości np. z laurek czy kartek żeby mieć je w jednym miejscu żebyście mogli do niej wrócić za 5, 10 lat. [cite: 5, 6]",
      web: "Goście mogą dodać na stronie życzenia które możesz otworzyć za kilka lat ale dodajesz je do zakładki ręcznie. [cite: 5]",
      pro: "W wersji premium trafiają tu wszystkie życzenia od gości ze strony zaproszeniowej i wszystko masz widoczne w tej zakładce. [cite: 5]"
    },
    {
      name: "Prezenty",
      icon: <Gift size={16} />,
      free: "Prezenty i rezerwacja, zbiórka na cele. Masz swoją listę prezentów jakie chciałbyś dostać (np. bierzecie ślub i budujecie dom, przydały by się wam nowe sprzęty AGD). W darmowej wersji zaznaczasz i pytasz gości sam kto i co chce ci złożyć w prezencie żeby prezenty się nie powtarzały i żeby nie dostać dwóch sokowirówek. [cite: 6, 7]",
      web: "Goście mogą zarezerwować prezent przez stronę internetową a ty zaznaczasz to w tej zakładce. [cite: 6]",
      pro: "Lista jest umieszczona jako sugestia dla gości na prezent jeśli nie mają pomysłu. Mogą zarezerwować taki prezent dla ciebie żebyś nie dostał dwóch takich samych rzeczy a wszystkie informacje aktualizują ci się na stronie. [cite: 6]"
    },
    {
      name: "Najbliżsi",
      icon: <HeartHandshake size={16} />,
      free: "Tutaj dodajesz gości którzy są ci najbliżsi w każdej wersji. Można wysyłać podziękowania albo zadania i wysyła się automatycznie na maila tej osoby. [cite: 7]",
      web: "Dodajesz informacje i zdjęcia najbliższych a oni wyświetlają się na twojej stronie. Można wysyłać podziękowania albo zadania i wysyła się automatycznie na maila tej osoby. [cite: 7]",
      pro: "Zakładka na stronie się aktualizuje po wypisaniu i dodaniu zdjęć najbliższych. Można wysyłać podziękowania albo zadania i wysyła się automatycznie na maila tej osoby. [cite: 7]"
    },
    {
      name: "Wspomnienia",
      icon: <Camera size={16} />,
      free: "W darmowej wersji tworzysz sam bazę zdjęć z danego eventu. [cite: 7]",
      web: "Na stronie goście mogą dodać swoje zdjęcia z tego dnia ale nie pokazują się w tej zakładce. [cite: 7]",
      pro: "W wersji premium ze stroną ty i goście możecie wrzucać zdjęcia przez stronę i każdy może je obejrzeć, a ty masz wszystko w tej zakładce z automatu. [cite: 7]"
    },
    {
      name: "Stoły",
      icon: <Armchair size={16} />,
      free: "Możesz w niej zrobić wizualizacje ustawienia stołów i umiejscowienia gości. [cite: 7, 8]",
      web: "To samo. [cite: 7, 8]",
      pro: "To samo. [cite: 7, 8]"
    },
    {
      name: "Organizacja i menu",
      icon: <CalendarDays size={16} />,
      free: "Tworzysz warianty osi czasu, ustalasz menu i katering. [cite: 8]",
      web: "Ten plan automatycznie aktualizuje się na stronie. [cite: 8]",
      pro: "Wszystko jest widoczne od razu na stronie. [cite: 8]"
    },
    {
      name: "Historia",
      icon: <BookOpenCheck size={16} />,
      free: "Brak danych.",
      web: "Po wypisaniu wszystkiego jest to później widoczne na stronie, można również zrobić quiz np o jubilacie albo parze młodej. [cite: 8]",
      pro: "To też bardziej dla osób ze stroną internetową, po wypisaniu wszystkiego jest to później widoczne na stronie, można również zrobić quiz np o jubilacie albo parze młodej. [cite: 8]"
    },
    {
      name: "Inspiracje",
      icon: <Shirt size={16} />,
      free: "Uzupełniasz dresscode i motyw przewodni eventu. [cite: 8]",
      web: "Uzupełniasz dresscode i motyw przewodni eventu a on pokazuje się na stronie. [cite: 8]",
      pro: "Uzupełniasz dresscode i motyw przewodni, to też jest od razu widoczne na stronie jeśli ją posiadasz. [cite: 8]"
    }
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textTheme} text-[10px] font-bold uppercase tracking-[0.2em] mb-4`}>
          <FileText size={14} /> Specyfikacja
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Zestawienie Funkcji</h2>
        <p className="text-slate-500 text-lg leading-relaxed">
          Poniższa tabela dokładnie opisuje zachowanie każdego z modułów w zależności od wybranego przez Ciebie pakietu ANM. Dowiedz się, co otrzymujesz w wersji darmowej, a jakie ułatwienia oferuje połączenie ze stroną internetową i stroną PRO.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className={`${theme.bgCard} text-white`}>
              <th className="p-4 font-black uppercase tracking-wider text-xs w-1/5">Funkcja</th>
              <th className="p-4 font-black uppercase tracking-wider text-xs w-1/4 border-l border-white/10">Za darmo</th>
              <th className="p-4 font-black uppercase tracking-wider text-xs w-1/4 border-l border-white/10">Ze stroną WWW<br/><span className="text-[9px] font-medium opacity-80">(Bez PRO)</span></th>
              <th className="p-4 font-black uppercase tracking-wider text-xs w-[28%] border-l border-white/10 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900"><div className="flex items-center gap-1.5"><Crown size={14}/> PRO ze stroną</div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-600">
            {PDF_FEATURES.map((feature, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800 flex items-center gap-2 mt-2">
                  <span className={`${theme.bgLight} ${theme.textTheme} p-1.5 rounded-lg`}>{feature.icon}</span>
                  {feature.name}
                </td>
                <td className="p-4 border-l border-slate-200 leading-relaxed align-top">{feature.free}</td>
                <td className="p-4 border-l border-slate-200 leading-relaxed align-top">{feature.web}</td>
                <td className="p-4 border-l border-slate-200 leading-relaxed align-top bg-amber-50/30">{feature.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InstructionContent({ theme }: { theme: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textTheme} text-[10px] font-bold uppercase tracking-[0.2em] mb-4`}>
          <MonitorPlay size={14} /> Baza Wiedzy
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Instrukcja Edycji Strony WWW</h2>
        <p className="text-slate-500 text-lg leading-relaxed">
          Zapomnij o trudnych kreatorach stron. Twoja Strona Wydarzenia jest w 100% zintegrowana z tym planerem. Wpisujesz dane tutaj, a one automatycznie i w ułamku sekundy pojawiają się na stronie dla gości. Zobacz, jak to działa!
        </p>
      </div>

      <div className="space-y-12">
        <InstructionStep 
          theme={theme} 
          num="1" 
          title="Ekran powitalny i logistyka (Karta Wydarzenia)" 
          description={
            <>
              Edycja zaczyna się już podczas tworzenia eventu! Nawet jeśli nie masz jeszcze strony, już w kreatorze wpisujesz <strong>główny napis (np. Wasze imiona), datę i godzinę (do zegara odliczającego czas) oraz adresy ceremonii i przyjęcia</strong> (które wygenerują mapę dojazdu). <br/><br/>
              W każdej chwili możesz do tego wrócić i zmienić te informacje. Wystarczy, że na głównym pulpicie "Moje Wydarzenia" klikniesz przycisk <strong><Settings size={14} className="inline mb-0.5"/> Edytuj dane / WWW</strong> znajdujący się bezpośrednio na karcie wybranego wydarzenia.
            </>
          } 
          icon={<Settings size={48} />} 
          placeholder="Kliknij 'Edytuj dane / WWW' na karcie wydarzenia, by zmienić nagłówek i adresy." 
        />

        <InstructionStep 
          theme={theme} 
          num="2" 
          title="Sekcje zarządzane z wnętrza Planera" 
          description={
            <>
              Cała główna zawartość Twojej strony jest zasilana bezpośrednio z zakładek wewnątrz planera. Wejdź w swoje wydarzenie i uzupełniaj:
              <ul className="mt-4 space-y-3 font-medium text-slate-600">
                <li><strong className="text-slate-800">Najbliżsi (VIP):</strong> Zaznacz flagę "Pokaż na mojej stronie WWW" przy wybranych osobach z orszaku, dodaj ich zdjęcie i krótki opis.</li>
                <li><strong className="text-slate-800">Organizacja:</strong> Tutaj tworzysz swoje bloki Menu, punkty Harmonogramu i dodajesz ważne informacje (FAQ - np. gdzie zaparkować).</li>
                <li><strong className="text-slate-800">Historia:</strong> Budujesz oś czasu. Opcjonalnie możesz dodać do kroków wciągające pytania quizowe dla uczestników imprezy!</li>
                <li><strong className="text-slate-800">Inspiracje:</strong> Definiujesz główną paletę kolorów i zasady Dress Code'u (Twój prywatny Moodboard z linkami zostaje zawsze ukryty).</li>
                <li><strong className="text-slate-800">Prezenty:</strong> Wystawiasz listę marzeń i udostępniasz konta do zbiórek, by ułatwić życie gościom.</li>
              </ul>
            </>
          } 
          icon={<LayoutDashboard size={48} />} 
          placeholder="Wejdź w wydarzenie i korzystaj z menu bocznego, by uzupełniać bloki strony." 
        />

        <InstructionStep 
          theme={theme} 
          num="★" 
          highlight 
          title="Magiczny przycisk: Opublikuj na WWW" 
          description={
            <>
              Nic nie pojawia się na Twojej publicznej stronie bez Twojej wyraźnej zgody! Każdy nowo dodany element w zakładkach takich jak Organizacja, czy Historia ma domyślnie przypisany status <strong>Szkicu</strong> (jest widoczny tylko dla Ciebie wewnątrz planera). <br/><br/>
              Gdy upewnisz się, że menu lub wpis jest gotowy, klikasz przycisk <strong>Opublikuj na WWW</strong>. Zmiana jest natychmiastowa! Jeśli zmienisz zdanie, klikasz <strong>Schowaj</strong> i dany element znika z oczu gości. Dzięki temu możesz spokojnie stworzyć np. Plan A (na słońce) i Plan B (na deszcz), a opublikować ten, który okaże się potrzebny.
            </>
          } 
          icon={<Globe size={48} />} 
          placeholder="Zarządzaj tym, co widzą goście, używając statusów OPUBLIKUJ i SCHOWAJ." 
        />
      </div>
    </div>
  )
}

function HowItWorksContent({ theme }: { theme: any }) {
  const EDITABLE_SECTIONS = [
    { title: 'Najbliżsi (VIP)', img: 'https://anmcollective.pl/wp-content/uploads/2026/03/wedingplenerki.webp', icon: <HeartHandshake size={14}/> },
    { title: 'Historia (Oś czasu)', img: 'https://anmcollective.pl/wp-content/uploads/2026/03/kontakt.webp', icon: <BookOpenCheck size={14}/> },
    { title: 'Organizacja i FAQ', img: 'https://anmcollective.pl/wp-content/uploads/2026/03/menu.webp', icon: <CalendarDays size={14}/> },
    { title: 'Dress Code', img: 'https://anmcollective.pl/wp-content/uploads/2026/03/info.webp', icon: <Shirt size={14}/> },
    { title: 'Lista Prezentów', img: 'https://anmcollective.pl/wp-content/uploads/2026/03/prezentyy.webp', icon: <Gift size={14}/> },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* NAGŁÓWEK I KOBIETA Z TELEFONEM */}
      <div className="mb-12 border-b border-slate-200 pb-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textTheme} text-[10px] font-bold uppercase tracking-[0.2em] mb-4`}>
            <HelpCircle size={14} /> Krok po kroku
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">Jak to wszystko działa?</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Przebrnijmy przez zawiłości i wyjaśnijmy, jak zaprząc planer do pracy, aby to on zajął się komunikacją z gośćmi, a Ty mogła cieszyć się organizacją.
          </p>
        </div>
        <div className="w-full md:w-1/3 shrink-0">
          <img 
            src="https://anmcollective.fun/wp-content/uploads/2026/04/Kobieta_trzyma_telefon_202604250757.webp" 
            alt="Kobieta z telefonem" 
            className="w-full h-auto rounded-[32px] shadow-xl rotate-2 hover:rotate-0 transition-transform duration-500" 
          />
        </div>
      </div>

      <div className="space-y-8">

        {/* KROK 1: DARMOWA APLIKACJA */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          <div className={`w-16 h-16 rounded-[20px] ${theme.bgLight} ${theme.textTheme} flex items-center justify-center font-black text-2xl shrink-0 shadow-sm`}>
            1
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Cała aplikacja do Twojej dyspozycji za darmo</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Baw się, planuj, zapisuj inspiracje, buduj harmonogramy i odhaczaj zadania. Twój prywatny notes jest dostępny w 100% za darmo i bez żadnych ukrytych limitów.
            </p>
          </div>
        </div>

        {/* KROK 2: E-ZAPROSZENIE */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
            <div className={`w-16 h-16 rounded-[20px] ${theme.bgCard} text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md`}>
              2
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Chcesz więcej? Zamów e-Zaproszenie!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zbudujemy dla Ciebie dedykowaną stronę internetową. Wystarczy, że przy zakupie podasz swój unikalny Kod Eventu. <strong>Czekasz od 24 do 72h</strong> na podpięcie strony przez naszą ekipę. Gdy strona zostanie połączona — możesz edytować jej układ prosto z wnętrza planera!
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 text-center ${theme.textTheme}`}>
              Tymi sekcjami zarządzasz na żywo (Klikasz i publikujesz):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {EDITABLE_SECTIONS.map((sec, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <div className={`h-20 ${theme.bgCard} relative overflow-hidden flex items-center justify-center`}>
                    <div 
                      className="absolute inset-y-0 right-0 w-3/4 transition-transform duration-700 ease-out group-hover:scale-110 opacity-40 mix-blend-screen filter brightness-0 invert pointer-events-none" 
                      style={{ backgroundImage: `url(${sec.img})`, backgroundSize: 'contain', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }} 
                    />
                  </div>
                  <div className="p-3 flex items-center gap-2">
                    <div className={theme.textTheme}>{sec.icon}</div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-700 leading-tight">{sec.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KROK 3: ODBIÓR NA MAILA */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-[20px] bg-slate-100 text-slate-400 flex items-center justify-center font-black text-2xl shrink-0 shadow-inner">
            3
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Odbierasz zgłoszenia na e-mail (Wersja Standard)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              W podstawowej wersji ze stroną, wszystkie dane wypełnione przez gości (odpowiedzi RSVP, diety, propozycje playlisty, wiadomości do Kapsuły Czasu czy zarezerwowane prezenty) <strong>lądują prosto na Twoim mailu!</strong> Czytasz wiadomość i na spokojnie ręcznie odhaczasz sobie te informacje w planerze.
            </p>
          </div>
        </div>

        {/* KROK 4: PAKIET PRO */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm border border-white/30 backdrop-blur-md">
                <Crown size={14} /> Poziom Ostateczny
              </div>
              <h3 className="font-serif text-4xl font-extrabold text-white mb-4 leading-tight">Masz niedosyt? Dokup PRO!</h3>
              <p className="text-emerald-50 text-base leading-relaxed mb-6">
                To sprawi, że wszystkie dane <strong>spłyną tutaj całkowicie automatycznie</strong>. Nie będziesz musiała sprawdzać maili, ani ręcznie przepisywać odpowiedzi. Nic Cię nie interesuje!
              </p>
              <ul className="space-y-3 text-sm font-bold text-emerald-100 mb-8">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-300 rounded-full shadow-sm"></div> Wchodzisz do planera i widzisz, kto potwierdził obecność.</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-300 rounded-full shadow-sm"></div> Wybrane dania i diety same przypisują się do gości.</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-300 rounded-full shadow-sm"></div> Piosenki same układają się w gotową listę.</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-300 rounded-full shadow-sm"></div> Po imprezie przesłane przez gości zdjęcia od razu lądują u Ciebie!</li>
              </ul>
            </div>
            
            <div className="w-full lg:w-5/12 shrink-0 relative">
              {/* Główny obraz z aplikacji */}
              <img 
                src="https://anmcollective.fun/wp-content/uploads/2026/04/zestawienie-apki.png" 
                alt="Aplikacja ANM" 
                className="w-full h-auto drop-shadow-2xl relative z-20 hover:scale-105 transition-transform duration-700" 
              />
              {/* Ozdobny blask pod zdjęciem */}
              <div className="absolute inset-0 bg-emerald-300 opacity-20 blur-2xl rounded-full z-10"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function SubscriptionsContent({ user, events, theme }: { user: any, events: any[], theme: any }) {
  const [loadingPortalId, setLoadingPortalId] = useState<string | null>(null)
  const supabase = createClient()

  const openBillingPortal = async (eventId: string) => {
    setLoadingPortalId(eventId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { alert('Sesja wygasła. Zaloguj się ponownie.'); return }

      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Błąd: ' + (data.error || 'Nie udało się otworzyć portalu płatności.'))
      }
    } catch {
      alert('Błąd połączenia z portalem płatności.')
    } finally {
      setLoadingPortalId(null)
    }
  }

  const activeSubs = events.filter(e => e.tier === 'pro' && e.stripe_customer_id)

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Moje Subskrypcje</h2>
        <p className="text-slate-500 text-lg leading-relaxed">Zarządzaj aktywnymi pakietami i pobieraj faktury.</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 mb-10 flex gap-6 items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 text-blue-600 shadow-sm"><ShieldCheck size={32} /></div>
        <div><h3 className="text-lg font-black text-blue-900 mb-2">Faktury KSeF</h3><p className="text-sm text-blue-800">Kopie faktur pobierzesz w Portalu Płatności Stripe.</p></div>
      </div>
      <h3 className="font-black text-xl text-slate-800 mb-6">Aktywne pakiety PRO</h3>
      <div className="space-y-4 mb-12">
        {activeSubs.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-sm">Brak aktywnych subskrypcji PRO.</p>
          </div>
        ) : (
          activeSubs.map((event) => (
            <div key={event.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Aktywna</span>
                  <span className="text-xs text-slate-500 font-bold">{event.title}</span>
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-1">Pakiet PRO</h4>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Nr wydarzenia: <code className="font-mono">{event.id}</code>
                </p>
                {event.subscription_end_date && (
                  <p className="text-xs text-slate-500 mt-1">
                    Ważna do: <strong>{new Date(event.subscription_end_date).toLocaleDateString('pl-PL')}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => openBillingPortal(event.id)}
                disabled={loadingPortalId === event.id}
                className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${theme.btn}`}
              >
                {loadingPortalId === event.id ? (
                  <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Łączenie...</>
                ) : (
                  'Portal Płatności →'
                )}
              </button>
            </div>
          ))
        )}
      </div>
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mt-12">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-800"><FileText size={18} className="text-slate-500" /> Ważne informacje prawne</h3>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p><strong>Jak anulować subskrypcję?</strong><br />Kliknij &quot;Portal Płatności&quot; przy aktywnej subskrypcji. Zostaniesz przekierowany na stronę Stripe, gdzie możesz anulować plan, zmienić kartę lub pobrać faktury. Dostęp PRO pozostaje aktywny do końca opłaconego okresu.</p>
          <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row gap-4 mt-6">
            <a href="https://sklep.anmcollective.pl/regulamin/" target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline flex items-center gap-1 w-fit transition-colors ${theme.textTheme}`}>
              Pełny Regulamin Subskrypcji <ExternalLink size={12} />
            </a>
            <a href="https://anmcollective.pl/kontakt-2/" target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline flex items-center gap-1 w-fit transition-colors ${theme.textTheme}`}>
              Kontakt z obsługą <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}