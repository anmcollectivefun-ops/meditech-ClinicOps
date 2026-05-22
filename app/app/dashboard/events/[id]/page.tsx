/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */ 
'use client'
import { useGetBabyShowerResponses } from '../../../hooks/useGetBabyShowerResponses';
import Calendar from '../../../components/Calendar'
import Gamification from '../../../components/Gamification'
import { getTasksForEventType, STAGES } from '../../../lib/taskLibrary'
import confetti from 'canvas-confetti'
import { useNotifications } from '../../../hooks/useNotifications'
import { useEventPlan } from '../../../lib/useEventPlan'
import PremiumLock from '../../../components/PremiumLock'
import { useEffect, useState, use, useCallback, useMemo, useRef } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  AlertCircle, ArrowLeft, Baby, Bed, Bell, BookOpen, Calendar as CalendarIcon, 
  CalendarDays, Camera, Car, Check, CheckCircle2, CheckSquare, ChevronDown, 
  ChevronLeft, ChevronRight, ChevronUp, Circle, Clock, Copy, Crown, Download, 
  Edit3, ExternalLink, Eye, EyeOff, Gift, Globe, Grid3X3, Heart, HeartHandshake, 
  HelpCircle, Image as ImageIcon, Inbox, Info, LayoutDashboard, Lightbulb, Link, 
  ListMusic, ListTodo, Lock, Mail, MapPin, Maximize2, Menu, MessageCircle, 
  MessageSquare, Minus, MousePointer2, Music, Palette, Phone, PieChart, Plus, 
  Printer, RotateCw, Save, Search, Send, Settings, Shapes, Share2, Shirt, 
  ShoppingBag, Sparkle, Sparkles, Store, Trash2, Trophy, Type, UploadCloud, 
  User, UserCircle, Users, Utensils, Wallet, X, Zap, LifeBuoy,   
} from 'lucide-react';

// ============================================================================
// BAZA ZDJĘĆ - BIAŁE SZKICE (W TLE KAFELKÓW)
// ============================================================================
const SKETCH_ASSETS = {
  rsvp: 'https://anmcollective.pl/wp-content/uploads/2026/03/odpowiedzi.webp',
  presents: 'https://anmcollective.pl/wp-content/uploads/2026/03/prezentyy.webp',
  music: 'https://anmcollective.pl/wp-content/uploads/2026/03/djplaylita.webp',
  timeCapsule: 'https://anmcollective.pl/wp-content/uploads/2026/03/kapsulkaczasu.webp',
  memories: 'https://anmcollective.pl/wp-content/uploads/2026/03/mur-wspomnien.webp',
  budget: 'https://anmcollective.pl/wp-content/uploads/2026/03/budzet.webp',
  website: 'https://anmcollective.pl/wp-content/uploads/2026/03/strona-www.webp',
  vendors: 'https://anmcollective.pl/wp-content/uploads/2026/03/para-mloda.webp',
  tasks: 'https://anmcollective.pl/wp-content/uploads/2026/03/info.webp',
  organization: 'https://anmcollective.pl/wp-content/uploads/2026/03/menu.webp',
  tables: 'https://anmcollective.pl/wp-content/uploads/2026/03/menu2.webp',
  story: 'https://anmcollective.pl/wp-content/uploads/2026/03/kontakt.webp',
  vip: 'https://anmcollective.pl/wp-content/uploads/2026/03/wedingplenerki.webp',
}

// ============================================================================
// BANERY DLA POSZCZEGÓLNYCH ZAKŁADEK
// ============================================================================
const TAB_IMAGES: Record<string, string> = {
  overview: 'https://anmcollective.pl/wp-content/uploads/2026/03/info.webp',
  guests: 'https://anmcollective.pl/wp-content/uploads/2026/03/email.webp',
  budget: 'https://anmcollective.pl/wp-content/uploads/2026/03/budzet.webp',
  tasks: 'https://anmcollective.pl/wp-content/uploads/2026/03/zmiana-danych.webp',
  vendors: 'https://anmcollective.pl/wp-content/uploads/2026/03/strona-www.webp',
  music: 'https://anmcollective.pl/wp-content/uploads/2026/03/djplaylita.webp',
  timeCapsule: 'https://anmcollective.pl/wp-content/uploads/2026/03/kapsulkaczasu.webp',
  presents: 'https://anmcollective.pl/wp-content/uploads/2026/03/prezentyy.webp',
  
 
  vip: 'https://anmcollective.pl/wp-content/uploads/2026/03/wedingplenerki.webp',      
  gallery: 'https://anmcollective.pl/wp-content/uploads/2026/03/mur-wspomnien.webp',  
  tables: 'https://anmcollective.pl/wp-content/uploads/2026/03/menu2.webp',           
  organization: 'https://anmcollective.pl/wp-content/uploads/2026/03/menu.webp',      
  story: 'https://anmcollective.pl/wp-content/uploads/2026/03/kontakt.webp',          
  inspirations: 'https://anmcollective.pl/wp-content/uploads/2026/03/info.webp',       
}
// ============================================================================
// SYSTEM MOTYWÓW - ZAKTUALIZOWANY O LUKSUSOWE ZŁOTO I CZERŃ
// ============================================================================
const APP_THEMES = {
  emerald: {
    name: 'Butelkowa Zieleń',
    bgApp: 'bg-[#F4F6F5]',
    bgCard: 'bg-[#2A3B32]',
    textMain: 'text-[#E8EDE9]',
    textAccent: 'text-[#A3B8AD]',
    border: 'border-[#3D5247]',
    btn: 'bg-[#2A3B32] hover:bg-[#1F2C25] text-white',
    textTheme: 'text-[#2A3B32]',
    bgLight: 'bg-[#2A3B32]/10',
    ring: 'focus:border-[#2A3B32]'
  },
  sage: {
    name: 'Szałwia & Złoto',
    bgApp: 'bg-[#FAFAFA]',
    bgCard: 'bg-[#899B8B]',
    textMain: 'text-white',
    textAccent: 'text-[#D4AF37]',
    border: 'border-[#9EAF9F]',
    btn: 'bg-[#899B8B] hover:bg-[#7A8B7B] text-white',
    textTheme: 'text-[#899B8B]',
    bgLight: 'bg-[#899B8B]/10',
    ring: 'focus:border-[#899B8B]'
  },
  bw: {
    name: 'High Fashion B&W',
    bgApp: 'bg-white',
    bgCard: 'bg-black',
    textMain: 'text-white',
    textAccent: 'text-gray-400',
    border: 'border-gray-800',
    btn: 'bg-black hover:bg-gray-800 text-white',
    textTheme: 'text-black',
    bgLight: 'bg-gray-100',
    ring: 'focus:border-black'
  },
  terracotta: {
    name: 'Terakota & Błękit',
    bgApp: 'bg-[#F2F5F8]',
    bgCard: 'bg-[#C26D5C]',
    textMain: 'text-[#FFF5F3]',
    textAccent: 'text-[#E8B4A9]',
    border: 'border-[#D17C6B]',
    btn: 'bg-[#C26D5C] hover:bg-[#A85B4B] text-white',
    textTheme: 'text-[#C26D5C]',
    bgLight: 'bg-[#C26D5C]/10',
    ring: 'focus:border-[#C26D5C]'
  },
  royal_navy: {
    name: 'Królewski Granat',
    bgApp: 'bg-[#F4F6F8]',
    bgCard: 'bg-[#1B2A47]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#E3D3B5]',
    border: 'border-[#2C3E5D]',
    btn: 'bg-[#1B2A47] hover:bg-[#111C30] text-white',
    textTheme: 'text-[#1B2A47]',
    bgLight: 'bg-[#1B2A47]/10',
    ring: 'focus:border-[#1B2A47]'
  },
  espresso: {
    name: 'Ciemne Espresso',
    bgApp: 'bg-[#FCFAF8]',
    bgCard: 'bg-[#3E2A23]',
    textMain: 'text-[#F5EBE6]',
    textAccent: 'text-[#C4A484]',
    border: 'border-[#5A4036]',
    btn: 'bg-[#3E2A23] hover:bg-[#2A1C17] text-[#F5EBE6]',
    textTheme: 'text-[#3E2A23]',
    bgLight: 'bg-[#3E2A23]/10',
    ring: 'focus:border-[#3E2A23]'
  },
  dusty_rose: {
    name: 'Pudrowy Róż',
    bgApp: 'bg-[#FFFDFD]',
    bgCard: 'bg-[#C59B99]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#684C4A]',
    border: 'border-[#D17C6B]',
    btn: 'bg-[#C59B99] hover:bg-[#AD8583] text-white',
    textTheme: 'text-[#B28280]',
    bgLight: 'bg-[#C59B99]/15',
    ring: 'focus:border-[#C59B99]'
  },
  lavender_haze: {
    name: 'Wrzosowy Pastel',
    bgApp: 'bg-[#FAFAFD]',
    bgCard: 'bg-[#A29EBB]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#4A4453]',
    border: 'border-[#B4B0CB]',
    btn: 'bg-[#A29EBB] hover:bg-[#8B86A6] text-white',
    textTheme: 'text-[#8A86A3]',
    bgLight: 'bg-[#A29EBB]/15',
    ring: 'focus:border-[#A29EBB]'
  },
  sky_blue: {
    name: 'Pastelowy Błękit',
    bgApp: 'bg-[#F4F8FA]',
    bgCard: 'bg-[#8FB8D1]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#3B5B6E]',
    border: 'border-[#7A9EBA]',
    btn: 'bg-[#8FB8D1] hover:bg-[#7A9EBA] text-white',
    textTheme: 'text-[#7A9EBA]',
    bgLight: 'bg-[#8FB8D1]/15',
    ring: 'focus:border-[#8FB8D1]'
  },
  fresh_mint: {
    name: 'Świeża Mięta',
    bgApp: 'bg-[#F5FAFA]',
    bgCard: 'bg-[#A2D5C6]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#3E7060]',
    border: 'border-[#8DBDAF]',
    btn: 'bg-[#A2D5C6] hover:bg-[#8DBDAF] text-white',
    textTheme: 'text-[#8DBDAF]',
    bgLight: 'bg-[#A2D5C6]/20',
    ring: 'focus:border-[#A2D5C6]'
  },
  peach_pastel: {
    name: 'Brzoskwiniowy Pastel',
    bgApp: 'bg-[#FFFBF9]',
    bgCard: 'bg-[#EBBCA3]',
    textMain: 'text-[#FFFFFF]',
    textAccent: 'text-[#7D5845]',
    border: 'border-[#D6A991]',
    btn: 'bg-[#EBBCA3] hover:bg-[#D6A991] text-white',
    textTheme: 'text-[#EBBCA3]',
    bgLight: 'bg-[#EBBCA3]/15',
    ring: 'focus:border-[#EBBCA3]'
  },
  // --- NOWE LUKSUSOWE MOTYWY ---
  gold_luxury: {
    name: 'Złoty Luksus',
    bgApp: 'bg-[#FDFBF7]',
    bgCard: 'bg-[#D4AF37]', // Piękne, czyste złoto
    textMain: 'text-black', // Wyraźne czarne napisy na złocie
    textAccent: 'text-[#333333]',
    border: 'border-[#B8860B]',
    btn: 'bg-black text-[#D4AF37] hover:bg-zinc-800',
    textTheme: 'text-[#B8860B]',
    bgLight: 'bg-[#D4AF37]/10',
    ring: 'focus:border-[#D4AF37]'
  },
  midnight_gold: {
    name: 'Nocne Złoto',
    bgApp: 'bg-[#0A0A0A]',
    bgCard: 'bg-[#1A1A1A]', // Głęboka czerń kafelka
    textMain: 'text-[#D4AF37]', // Złoty tekst na czarnym tle
    textAccent: 'text-[#F7E7CE]', // Jasne, szampańskie złoto dla detali
    border: 'border-[#D4AF37]', // Złota ramka dookoła kafelka
    btn: 'bg-[#D4AF37] text-black hover:bg-[#B8860B]',
    textTheme: 'text-[#D4AF37]',
    bgLight: 'bg-[#D4AF37]/10',
    ring: 'focus:border-[#D4AF37]'
  }
}

// ============================================================================
// KONFIGURACJA PRODUKTU I STAŁE
// ============================================================================
const INVITATION_SHOWCASE_IMAGES = [
  { url: 'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/palma.webp', alt: 'Styl tropikalny' },
  { url: 'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/brzoza.png', alt: 'Styl leśny' },
  { url: 'https://sklep.anmcollective.pl/wp-content/uploads/2026/03/gipsowka-r.jpg', alt: 'Styl romantyczny' },
  { url: 'https://sklep.anmcollective.pl/wp-content/uploads/2026/03/peonia-r.jpg', alt: 'Styl klasyczny' },
]

const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/e-zaproszenia-slubne/'

const INVITATION_PRICING = { normalPrice: 700, promoPrice: 400, promoActive: true, promoLabel: 'PROMOCJA WIOSENNA' }
const INVITATION_SHORTS = [
  { id: 'XguQM9x85g4', title: 'Zobacz stronę w akcji' },
  { id: 'hydyGSu81h0', title: 'Jak działa formularz RSVP' },
]

const EVENT_EMOJIS: Record<string, string> = {
  slub: '💍', urodziny18: '🎂', baby_shower: '👶',
  gender_reveal: '🎀', komunia: '✝️', chrzciny: '🕊️',
  jubileusz: '🎊', rocznica: '💑', urodziny: '🎉', inne: '✨'
}

const TABS = [
  { id: 'overview', label: 'Przegląd', icon: LayoutDashboard },
  { id: 'guests', label: 'Goście', icon: Users },
  { id: 'budget', label: 'Budżet', icon: Wallet },
  { id: 'tasks', label: 'Zadania', icon: CheckSquare },
  { id: 'vendors', label: 'Ekipa', icon: Store },
  { id: 'music', label: 'Muzyka', icon: Music },
  { id: 'timeCapsule', label: 'Kapsułka', icon: MessageCircle },
  { id: 'presents', label: 'Prezenty', icon: Gift },
  { id: 'survey', label: 'Ankieta', icon: Trophy },
  { id: 'vip', label: 'Najbliżsi', icon: HeartHandshake },
  { id: 'gallery', label: 'Wspomnienia', icon: Camera },
  { id: 'tables', label: 'Stoły', icon: Utensils },
  { id: 'organization', label: 'Organizacja', icon: CalendarDays },
  { id: 'story', label: 'Historia', icon: BookOpen },
  { id: 'inspirations', label: 'Inspiracje', icon: Lightbulb },
]

// ============================================================================
// GŁÓWNA STRONA WYDARZENIA
// ============================================================================
export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const [isTimerActive, setIsTimerActive] = useState(false)

  const [themeKey, setThemeKey] = useState<keyof typeof APP_THEMES>('emerald')
  const t = APP_THEMES[themeKey]
  const [isDarkMode, setIsDarkMode] = useState(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // =========================================================================
  // SYSTEM ZAPAMIĘTYWANIA TRYBU CIEMNEGO W LOCALSTORAGE
  // =========================================================================
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('anm-dark-mode')
    if (savedDarkMode === 'true') {
      setIsDarkMode(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('anm-dark-mode', isDarkMode.toString())
  }, [isDarkMode])

  const refreshGuests = useCallback(async () => {
    const { data } = await supabase.from('guests').select('*').eq('event_id', id).order('created_at')
    setGuests(data || [])
  }, [id, supabase])

  const handleDeleteEvent = useCallback(async () => {
    setDeleting(true)
    await supabase.from('tasks').delete().eq('event_id', id)
    await supabase.from('events').delete().eq('id', id)
    router.push('/dashboard')
  }, [id, supabase, router])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      if (!data) { router.push('/dashboard'); return }
      setEvent(data)
      await refreshGuests()
      setLoading(false)
    }
    load()
  }, [id, supabase, router, refreshGuests])
useEffect(() => {
    if (!event?.event_date) return;

    const targetDate = new Date(event.event_date).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTimerActive(false);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
      setIsTimerActive(true);
    };

    updateTimer(); // Pierwsze wywołanie
    const intervalId = setInterval(updateTimer, 1000); // Aktualizacja co sekundę

    return () => clearInterval(intervalId); // Czyszczenie po wyjściu z zakładki
  }, [event?.event_date]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Ładowanie...</p>
      </div>
    </div>
  )

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* MODAL POTWIERDZENIA USUNIĘCIA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Usuń wydarzenie</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Czy na pewno chcesz usunąć <span className="font-bold text-slate-900">&quot;{event?.title}&quot;</span>?
              Usunięcie wydarzenia spowoduje <span className="font-bold text-red-600">bezpowrotną utratę</span> wszystkich zapisanych zadań i postępów.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Usuwanie...</> : <><Trash2 size={14} /> Usuń wydarzenie</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : t.bgApp} font-sans pb-20 transition-colors duration-500`}>
        <style>{`
          input, textarea, select {
            color: #1e293b !important;
          }
          input::placeholder, textarea::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
          }

          /* --- MAGICZNY BLOK DARK MODE (GŁĘBOKA CZERŃ) --- */
          .dark .bg-white { background-color: #111111 !important; border-color: #333333 !important; }
          .dark .bg-slate-50 { background-color: #000000 !important; border-color: #333333 !important; }
          .dark .bg-slate-100 { background-color: #222222 !important; }
          
          .dark .text-slate-900, .dark .text-slate-800 { color: #ffffff !important; }
          .dark .text-slate-700, .dark .text-slate-600 { color: #cccccc !important; }
          .dark .text-slate-500 { color: #888888 !important; }
          
          .dark .border-slate-100, .dark .border-slate-200, .dark .border-slate-300 { border-color: #333333 !important; }
          
          /* Poprawka dla inputów w trybie ciemnym */
          .dark input, .dark textarea, .dark select { 
            background-color: #000000 !important; 
            color: #ffffff !important; 
            border-color: #333333 !important; 
          }
          .dark input::placeholder, .dark textarea::placeholder {
            color: #666666 !important;
          }
        `}</style>
        {/* ========================================================== */}
        {/* PŁYWAJĄCY PRZYCISK MENU MOBILE (Zawsze na wierzchu) */}
        {/* ========================================================== */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden fixed top-3 right-3 z-[90] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 border backdrop-blur-md ${
            isDarkMode 
              ? 'bg-[#111111]/90 border-[#D4AF37] shadow-[#D4AF37]/10' 
              : 'bg-white/90 border-slate-200 shadow-slate-300/50'
          } ${mobileMenuOpen ? 'scale-90' : 'hover:scale-105'}`}
        >
          {mobileMenuOpen ? <X size={20} className={isDarkMode ? 'text-[#D4AF37]' : 'text-slate-800'} /> : <Menu size={20} className={isDarkMode ? 'text-[#D4AF37]' : 'text-slate-800'} />}
        </button>

        {/* PASEK ZMIANY MOTYWU ORAZ DARK MODE */}
        <div className={`${isDarkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-100'} print:hidden border-b p-3 pr-16 lg:pr-3 flex justify-between items-center relative z-20 flex-wrap`}>

        </div>

        {/* PASEK ZMIANY MOTYWU ORAZ DARK MODE */}
        <div className={`${isDarkMode ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-100'} border-b p-3 flex justify-between items-center relative z-20 flex-wrap`}>
          
          {/* Lewa strona - Wybór koloru kafelków */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-widest mr-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Zmień motyw:</span>
            {(Object.keys(APP_THEMES) as Array<keyof typeof APP_THEMES>).map(key => (
              <button
                key={key} onClick={() => setThemeKey(key)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${themeKey === key ? 'scale-125 border-gray-600' : 'border-transparent'} ${APP_THEMES[key].bgCard}`}
                title={APP_THEMES[key].name}
              />
            ))}
          </div>

          {/* Prawa strona */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm bg-red-600 hover:bg-red-700 text-white"
              title="Usuń wydarzenie"
            >
              <Trash2 size={13} /> Usuń
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs fonfont-bold uppercase tracking-wider transition-all shadow-sm ${
                isDarkMode
                  ? 'bg-amber-400 text-amber-900 hover:bg-amber-300'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isDarkMode ? '☀️ Jasny' : '🌙 Ciemny'}
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* NAWIGACJA GŁÓWNA (Z PRZYCISKIEM MENU W PRAWYM GÓRNYM ROGU) */}
        {/* ========================================================== */}
       <nav className={`${t.bgCard} relative z-40 border-b ${t.border} flex items-center justify-between shadow-md transition-colors duration-500`}>
          
          {/* Lewa strona - Scrololwana dla desktopu / mobile */}
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar px-6 py-3 flex-1">
            <button onClick={() => router.push('/dashboard')} className={`flex items-center gap-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${t.textMain} opacity-80 hover:opacity-100`}>
              <ArrowLeft size={16} /> Panel główny
            </button>
            
            {/* Delikatny separator w kolorze pasującym do motywu */}
            <div className={`w-px h-5 shrink-0 ${t.textMain} opacity-20`}></div>
            
            <EventSwitcher currentId={id} router={router} theme={t} supabase={supabase} />
          </div>

         
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* NAGŁÓWEK */}
          <div className={`relative overflow-hidden rounded-[32px] p-8 sm:p-12 shadow-xl transition-all duration-700 group cursor-default border mb-8 ${t.bgCard} ${t.border}`}>
            <div className="absolute right-0 sm:right-10 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-80 sm:h-80 opacity-50 mix-blend-screen pointer-events-none group-hover:opacity-80 transition-all duration-700 group-hover:scale-105">
              <img src={TAB_IMAGES[activeTab] || TAB_IMAGES.overview} className="w-full h-full object-contain filter brightness-0 invert drop-shadow-2xl" alt="" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-5 shadow-sm">
                  <span className="text-base">{EVENT_EMOJIS[event.type] || '✨'}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${t.textMain}`}>{event.type?.replace('_', ' ')}</span>
                </div>
                <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 font-serif ${t.textMain}`}>{event.title}</h1>
                {event.event_date && (
                  <div className={`flex items-center gap-2 mt-4 font-medium ${t.textAccent}`}>
                    <CalendarIcon size={18} />
                    {new Date(event.event_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
              {isTimerActive && (
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 mt-4 sm:mt-0">
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl sm:text-5xl font-light tabular-nums tracking-tight ${t.textMain}`}>{timeLeft.days}</span>
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-1 ${t.textAccent}`}>Dni</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-light opacity-40 pb-3 ${t.textMain}`}>:</div>
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl sm:text-5xl font-light tabular-nums tracking-tight ${t.textMain}`}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-1 ${t.textAccent}`}>Godz</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-light opacity-40 pb-3 ${t.textMain}`}>:</div>
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl sm:text-5xl font-light tabular-nums tracking-tight ${t.textMain}`}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-1 ${t.textAccent}`}>Min</span>
                  </div>
                  <div className={`hidden sm:block text-3xl font-light opacity-40 pb-3 ${t.textMain}`}>:</div>
                  <div className="hidden sm:flex flex-col items-center">
                    <span className={`text-5xl font-light tabular-nums tracking-tight ${t.textMain}`}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${t.textAccent}`}>Sek</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NAWIGACJA DESKTOP (POZIOMA) - odpięta od góry (brak sticky) */}
          <div className="hidden lg:flex justify-center mb-10 pointer-events-none">
            <div className={`${isDarkMode ? 'bg-[#111111] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-slate-100 border-slate-200'} rounded-full p-2 shadow-sm border flex items-center gap-2 pointer-events-auto`}>
              {TABS.map(tab => {
                const Icon = tab.icon
                const isSelected = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative group p-4 rounded-full transition-all ${isSelected ? t.bgCard : (isDarkMode ? 'hover:bg-[#222222]' : 'hover:bg-white')}`}
                  >
                    {/* Ikona przyjmuje kolor motywu, a po kliknięciu kolor głównego tekstu */}
                    <Icon size={20} className={`relative z-10 transition-colors duration-300 ${isSelected ? t.textMain : t.textTheme}`} />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block whitespace-nowrap shadow-xl">
                      {tab.label}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* NAWIGACJA MOBILE (PIONOWA - WYSZUWANY PANEL BOCZNY) */}
          <div className={`lg:hidden fixed inset-y-0 right-0 z-50 w-72 ${isDarkMode ? 'bg-[#111111]/95 border-[#D4AF37]' : 'bg-white/95 border-slate-100'} backdrop-blur-3xl shadow-2xl border-l transform transition-transform duration-500 ease-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`p-6 pb-4 border-b flex justify-between items-center ${isDarkMode ? 'border-[#D4AF37]/40' : 'border-slate-100'}`}>
              <div>
                <h3 className={`font-black text-xl ${t.textTheme}`}>Menu Eventu</h3>
                <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Wybierz zakładkę</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-[#D4AF37] hover:bg-[#222]' : 'text-slate-400 hover:bg-slate-100'}`}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isSelected = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                      isSelected 
                        ? `${t.bgCard} ${t.textMain} shadow-md` 
                        : (isDarkMode ? 'text-slate-300 hover:bg-[#222222]' : 'text-slate-600 hover:bg-slate-100')
                    }`}
                  >
                    {/* W mobile ikony również są kolorowe */}
                    <Icon size={18} className={isSelected ? t.textMain : t.textTheme} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* TŁO PRZYCIEMNIAJĄCE NA MOBILE (Zamyka menu po kliknięciu w tło) */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}

          {/* KONTENER ZAKŁADEK */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            {activeTab === 'overview' && <OverviewTab event={event} guests={guests} eventId={id} theme={t} supabase={supabase} setActiveTab={setActiveTab} />}
            {activeTab === 'guests' && <GuestsTab eventId={id} event={event} guests={guests} refreshGuests={refreshGuests} theme={t} supabase={supabase} />}
            {activeTab === 'budget' && <BudgetTab eventId={id} theme={t} supabase={supabase} />}
            {activeTab === 'tasks' && <TasksTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'vendors' && <VendorsTab eventId={id} theme={t} supabase={supabase} />}
            {activeTab === 'music' && <MusicTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'timeCapsule' && <TimeCapsuleTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'presents' && <PresentsTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'survey' && <SurveyTab eventId={id} event={event} theme={t} supabase={supabase} />}
            
            {/* NOWE ZAKŁADKI */}
            {activeTab === 'vip' && <VipTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'gallery' && <GalleryTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'tables' && <TablesTab eventId={id} theme={t} supabase={supabase} />}
            
            {/* Zakładki, w których wprowadziliśmy podział na Planer i WWW */}
            {activeTab === 'organization' && <OrganizationTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'story' && <StoryTab eventId={id} event={event} theme={t} supabase={supabase} />}
            {activeTab === 'inspirations' && <InspirationsTab eventId={id} event={event} theme={t} supabase={supabase} />}
          </div>

          {/* GLOBALNA STOPKA REKLAMOWA */}
          <PromoFooter event={event} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 1. ZAKŁADKA PRZEGLĄD
// ============================================================================
function OverviewTab({ event, guests, eventId, theme, supabase, setActiveTab }: { event: any, guests: any[], eventId: string, theme: any, supabase: any, setActiveTab: (tab: string) => void }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [playlist, setPlaylist] = useState<any[]>([])
  const [capsulesCount, setCapsulesCount] = useState(0)
  
  // Nowe stany dla dodatkowych sekcji
  const [vipsCount, setVipsCount] = useState(0)
  const [memoriesStats, setMemoriesStats] = useState({ photos: 0, videos: 0 })
  const [giftsStats, setGiftsStats] = useState({ total: 0, reserved: 0 })
  const [budgetStats, setBudgetStats] = useState({ estimated: 0, paid: 0 })
  const [storyCount, setStoryCount] = useState(0)
  const [orgCount, setOrgCount] = useState(0)
  const [tasksStats, setTasksStats] = useState({ total: 0, completed: 0 })

  // Stany do wysyłki raportów mailem
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [reportToExport, setReportToExport] = useState<null | 'funnel' | 'kitchen' | 'logistics'>(null)

  useEffect(() => {
    async function loadStats() {
      const [vRes, pRes, cRes, vipRes, memRes, giftRes, budgetRes, storyRes, orgRes, taskRes] = await Promise.all([
        supabase.from('vendors').select('name, email, category, status').eq('event_id', eventId),
        supabase.from('playlist').select('source').eq('event_id', eventId),
        supabase.from('time_capsules').select('id').eq('event_id', eventId),
        supabase.from('vips').select('id').eq('event_id', eventId),
        supabase.from('memories').select('file_type').eq('event_id', eventId),
        supabase.from('gifts').select('reserved, type').eq('event_id', eventId),
        supabase.from('budget_items').select('estimated_cost, paid_amount').eq('event_id', eventId),
        supabase.from('story_nodes').select('id').eq('event_id', eventId),
        supabase.from('schedule_items').select('id').eq('event_id', eventId),
        supabase.from('tasks').select('status').eq('event_id', eventId)
      ])
      
      if (vRes.data) setVendors(vRes.data)
      if (pRes.data) setPlaylist(pRes.data)
      if (cRes.data) setCapsulesCount(cRes.data.length)
      
      if (vipRes.data) setVipsCount(vipRes.data.length)
      
      if (memRes.data) {
        const photos = memRes.data.filter((m: any) => !m.file_type?.includes('video')).length
        const videos = memRes.data.filter((m: any) => m.file_type?.includes('video')).length
        setMemoriesStats({ photos, videos })
      }
      
      if (giftRes.data) {
        const giftsOnly = giftRes.data.filter((g: any) => g.type === 'gift')
        const reserved = giftsOnly.filter((g: any) => g.reserved).length
        setGiftsStats({ total: 6, reserved }) 
      }
      
      if (budgetRes.data) {
        const estimated = budgetRes.data.reduce((sum: number, item: any) => sum + (Number(item.estimated_cost) || 0), 0)
        const paid = budgetRes.data.reduce((sum: number, item: any) => sum + (Number(item.paid_amount) || 0), 0)
        setBudgetStats({ estimated, paid })
      }
      
      if (storyRes.data) setStoryCount(storyRes.data.length)
      if (orgRes.data) setOrgCount(orgRes.data.length)
      
      if (taskRes.data) {
        const completed = taskRes.data.filter((t: any) => t.status).length
         setTasksStats({ total: taskRes.data.length, completed })
      }
    }
    loadStats()
  }, [eventId, supabase])

  const totalAdults = guests.length + guests.filter(g => g.plus_one).length
  const totalChildren = guests.reduce((sum, g) => sum + (Number(g.children_count) || 0), 0)
  const sentInvitations = guests.filter(g => g.invitation_sent).length
  const confirmedRSVP = guests.filter(g => g.rsvp_status === 'Potwierdzone').length
  const declinedRSVP = guests.filter(g => g.rsvp_status === 'Odmowa').length
  const dietVege = guests.filter(g => g.diet === 'Vege').length
  const dietMeat = guests.filter(g => g.diet === 'Mięsne').length
  const dietOther = guests.filter(g => ['Bezlaktozy', 'Inne'].includes(g.diet)).length
  const withAllergies = guests.filter(g => g.allergies && g.allergies !== 'Brak').length
  const needsHotel = guests.filter(g => g.accommodation).length
  const needsTransportCount = guests.filter(g => g.needs_transport).length

  const totalVendors = vendors.length
  const signedVendors = vendors.filter(v => ['Umowa', 'Zaliczka', 'Opłacone'].includes(v.status)).length
  const mySongs = playlist.filter(p => p.source === 'wlasna').length
  const guestSongs = playlist.filter(p => p.source === 'gosc').length

  // Generator treści maila do podwykonawcy
  const generateReportContent = (type: 'funnel' | 'kitchen' | 'logistics') => {
    const title = event?.title || 'Wydarzenie';
    let subject = '';
    let body = '';
    
    if (type === 'funnel') {
      subject = `Raport RSVP - ${title}`;
      body = `Cześć!\n\nPrzesyłam aktualny raport z potwierdzeń obecności (RSVP) na nasze wydarzenie:\n\n` +
             `- Zaproszonych ogółem: ${guests.length}\n` +
             `- Potwierdzonych: ${confirmedRSVP}\n` +
             `- Odmów: ${declinedRSVP}\n` +
             `- Brak odpowiedzi (w trakcie): ${guests.length - confirmedRSVP - declinedRSVP}\n\n` +
             `Pozdrawiam!`;
    } else if (type === 'kitchen') {
      subject = `Raport dla kuchni (Diety/Alergie) - ${title}`;
      body = `Cześć!\n\nPrzesyłam aktualne zestawienie diet i preferencji kulinarnych naszych gości:\n\n` +
             `- Dieta Standard (Mięsne): ${dietMeat} os.\n` +
             `- Dieta Wegetariańska: ${dietVege} os.\n` +
             `- Inne diety (bez laktozy, itp.): ${dietOther} os.\n` +
             `- Zgłoszone alergie (osób): ${withAllergies}\n\n` +
             `Pozdrawiam!`;
    } else if (type === 'logistics') {
      subject = `Raport logistyczny (Noclegi/Transport) - ${title}`;
      body = `Cześć!\n\nPrzesyłam zestawienie logistyczne dotyczące gości na naszym wydarzeniu:\n\n` +
             `- Liczba dorosłych: ${totalAdults}\n` +
             `- Liczba dzieci: ${totalChildren}\n` +
             `- Goście zgłaszający potrzebę noclegu: ${needsHotel}\n` +
             `- Goście zgłaszający potrzebę transportu: ${needsTransportCount}\n\n` +
             `Pozdrawiam!`;
    }
    return { subject: encodeURIComponent(subject), body: encodeURIComponent(body) };
  }

  const handleSendReport = (vendorEmail: string) => {
    if (!reportToExport || !vendorEmail) return;
    const { subject, body } = generateReportContent(reportToExport);
    window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`;
    setShowEmailModal(false);
  }

  return (
    <div className="space-y-6">
      
      {/* MAGIA KONTRASTU W TRYBIE CIEMNYM DLA DOLNYCH KART */}
      <style>{`
        .dark .overview-card-title { color: #ffffff !important; }
        .dark .overview-stat-label { color: #cbd5e1 !important; opacity: 1 !important; }
        .dark .overview-box-bg { background-color: #222222 !important; border-color: #333333 !important; }
        .dark .overview-alert-box { background-color: rgba(225, 29, 72, 0.15) !important; border-color: rgba(225, 29, 72, 0.3) !important; }
        .dark .overview-alert-text { color: #fb7185 !important; }
        .dark .overview-alert-icon { color: rgba(225, 29, 72, 0.2) !important; }
        .dark .overview-warning-box { background-color: rgba(245, 158, 11, 0.15) !important; }
        .dark .overview-warning-text { color: #fbbf24 !important; }
        .dark .overview-progress-bar { background-color: #ffffff !important; }
        .sketch-img-custom { transition-duration: 600ms; }
      `}</style>

      {/* GŁÓWNA SIATKA KAFELKÓW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">

        <div onClick={() => setActiveTab('overview')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 opacity-40 mix-blend-screen pointer-events-none group-hover:opacity-80 transition-all duration-500 group-hover:scale-110">
            <img src={SKETCH_ASSETS.website} className="w-full h-full object-contain filter brightness-0 invert" alt="" />
          </div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Sparkle size={12} /> Strona</div>
            <div className={`text-lg sm:text-xl font-bold text-emerald-300 leading-tight drop-shadow-sm`}>{!!event?.invitation_url ? 'Otwórz stronę' : 'Zrób zaproszenie'}</div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80`}>{!!event?.invitation_url ? 'Aktywna' : 'Brak strony'}</div>
          </div>
        </div>

        {/* GOŚCIE */}
        <div onClick={() => setActiveTab('guests')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.rsvp} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Users size={12} /> Goście</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{confirmedRSVP}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {totalAdults + totalChildren}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Potwierdzeni</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Wszyscy</span>
            </div>
          </div>
        </div>

        {/* ZADANIA */}
        <div onClick={() => setActiveTab('tasks')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.tasks} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><CheckSquare size={12} /> Zadania</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{tasksStats.completed}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {tasksStats.total || '-'}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Ukończone</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Wszystkie</span>
            </div>
          </div>
        </div>

        {/* BUDŻET */}
        <div onClick={() => setActiveTab('budget')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.budget} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Wallet size={12} /> Budżet</div>
            <div className={`text-lg sm:text-xl font-bold mt-1 transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{budgetStats.estimated > 0 ? `${(budgetStats.paid / 1000).toFixed(1)}k` : '0'}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {(budgetStats.estimated / 1000).toFixed(1)}k</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Zapłacono</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Całość</span>
            </div>
          </div>
        </div>

        {/* EKIPA */}
        <div onClick={() => setActiveTab('vendors')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.vendors} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Store size={12} /> Ekipa</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{signedVendors}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {totalVendors}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Podpisane</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Wszystkie</span>
            </div>
          </div>
        </div>

        {/* MUZYKA */}
        <div onClick={() => setActiveTab('music')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.music} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Music size={12} /> Playlista</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{mySongs}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {guestSongs}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Twoje</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Od gości</span>
            </div>
          </div>
        </div>

        {/* KAPSUŁKA CZASU */}
        <div onClick={() => setActiveTab('timeCapsule')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.timeCapsule} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><MessageCircle size={12} /> Kapsułka</div>
            <div className={`text-xl sm:text-2xl font-bold text-emerald-300 drop-shadow-sm`}>
              {capsulesCount}
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80`}>Zabezpieczonych listów</div>
          </div>
        </div>

        {/* PREZENTY */}
        <div onClick={() => setActiveTab('presents')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.presents} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Gift size={12} /> Prezenty</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{giftsStats.reserved}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {giftsStats.total}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Zarezerw.</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Wszystkie</span>
            </div>
          </div>
        </div>

        {/* VIP */}
        <div onClick={() => setActiveTab('vip')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.vip} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><HeartHandshake size={12} /> Najbliżsi</div>
            <div className={`text-xl sm:text-2xl font-bold text-emerald-300 drop-shadow-sm`}>
              {vipsCount}
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80 font-bold`}>Osób w orszaku</div>
          </div>
        </div>

        {/* WSPOMNIENIA (GALERIA) */}
        <div onClick={() => setActiveTab('gallery')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.memories} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Camera size={12} /> Wspomnienia</div>
            <div className={`text-xl sm:text-2xl font-bold transition-colors`}>
              <span className="text-emerald-300 drop-shadow-sm">{memoriesStats.photos}</span> 
              <span className="text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-sm"> / {memoriesStats.videos}</span>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1`}>
              <span className="text-emerald-300/80 font-bold">Zdjęć</span> <span className="text-white/30">/</span> <span className="text-amber-200/80 font-bold">Filmów</span>
            </div>
          </div>
        </div>

        {/* STOŁY */}
        <div onClick={() => setActiveTab('tables')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.tables} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Utensils size={12} /> Stoły</div>
            <div className={`text-lg sm:text-xl font-bold mt-1 text-emerald-300 drop-shadow-sm`}>Zarządzaj</div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80 font-bold`}>Plan usadzenia gości</div>
          </div>
        </div>

        {/* ORGANIZACJA */}
        <div onClick={() => setActiveTab('organization')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.organization} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><CalendarDays size={12} /> Organizacja</div>
            <div className={`text-xl sm:text-2xl font-bold text-emerald-300 drop-shadow-sm`}>
              {orgCount}
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80 font-bold`}>Punktów harmonogramu</div>
          </div>
        </div>

        {/* HISTORIA */}
        <div onClick={() => setActiveTab('story')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.story} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><BookOpen size={12} /> Historia</div>
            <div className={`text-xl sm:text-2xl font-bold text-emerald-300 drop-shadow-sm`}>
              {storyCount}
            </div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80 font-bold`}>Wydarzeń na osi</div>
          </div>
        </div>

        {/* INSPIRACJE */}
        <div onClick={() => setActiveTab('inspirations')} className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
          <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-60 mix-blend-screen pointer-events-none sketch-img-custom group-hover:opacity-100 group-hover:scale-[1.2] group-hover:rotate-[-5deg]"><img src={SKETCH_ASSETS.website} className="w-full h-full object-contain filter brightness-0 invert" alt="" /></div>
          <div className="relative z-10">
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 text-white/80`}><Lightbulb size={12} /> Inspiracje</div>
            <div className={`text-lg sm:text-xl font-bold mt-1 text-emerald-300 drop-shadow-sm`}>Dress Code</div>
            <div className={`text-[10px] sm:text-xs font-medium mt-1 text-emerald-300/80 font-bold`}>Ustawienia motywu</div>
          </div>
        </div>

      </div>

      <EducationBanner
        icon="💡"
        title="Czy wiesz, że możesz oszczędzić godziny dzwonienia?"
        description="Ze stroną zaproszeniową goście sami wypełnią dane — dieta, alergie, RSVP, osoba towarzysząca. Wszystko trafia bezpośrednio tutaj. Zero telefonów."
        ctaLabel="Zobacz szablony"
        theme={theme}
      />

      {/* DOLNE KARTY RAPORTOWE */}
      {guests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className={`font-bold mb-5 flex items-center gap-2 ${theme.textTheme} overview-card-title`}><PieChart size={18} /> Lejek Zaproszeń</h3>
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center"><span className="text-sm font-semibold text-slate-500">Wysłane zaproszenia</span><span className={`text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg ${theme.textTheme} overview-box-bg overview-card-title`}>{sentInvitations} / {guests.length}</span></div>
              <div className="w-full bg-slate-100 overview-box-bg rounded-full h-2"><div className={`h-2 rounded-full transition-all ${theme.bgCard} overview-progress-bar`} style={{ width: `${guests.length > 0 ? (sentInvitations / guests.length) * 100 : 0}%` }}></div></div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-semibold text-slate-500">Odmowy (RSVP)</span><span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg overview-alert-box overview-alert-text">{declinedRSVP} osób</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-semibold text-slate-500">Brak odpowiedzi</span><span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg overview-warning-box overview-warning-text">{guests.length - confirmedRSVP - declinedRSVP} osób</span></div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button onClick={() => { setReportToExport('funnel'); setShowEmailModal(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 ${theme.btn}`}>
                <Send size={14} /> Wyślij raport
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className={`font-bold mb-5 flex items-center gap-2 ${theme.textTheme} overview-card-title`}><Utensils size={18} /> Raport dla kuchni</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-orange-50 p-4 rounded-2xl text-center overview-box-bg border border-orange-100"><div className="text-2xl font-extrabold text-orange-600 overview-card-title">{dietMeat}</div><div className="text-[10px] font-bold uppercase mt-1 text-orange-600 opacity-80 overview-stat-label">Mięsne</div></div>
              <div className="bg-emerald-50 p-4 rounded-2xl text-center overview-box-bg border border-emerald-100"><div className="text-2xl font-extrabold text-emerald-600 overview-card-title">{dietVege}</div><div className="text-[10px] font-bold uppercase mt-1 text-emerald-600 opacity-80 overview-stat-label">Vege</div></div>
              <div className="bg-blue-50 p-4 rounded-2xl text-center overview-box-bg border border-blue-100"><div className="text-2xl font-extrabold text-blue-600 overview-card-title">{dietOther}</div><div className="text-[10px] font-bold uppercase mt-1 text-blue-600 opacity-80 overview-stat-label">Inne diety</div></div>
              <div className="bg-rose-50 p-4 rounded-2xl text-center relative overflow-hidden overview-alert-box border border-rose-100"><AlertCircle className="absolute -right-2 -bottom-2 text-rose-200 overview-alert-icon" size={40} /><div className="text-2xl font-extrabold text-rose-600 relative z-10 overview-alert-text">{withAllergies}</div><div className="text-[10px] font-bold text-rose-800/60 uppercase mt-1 relative z-10 overview-alert-text">Alergie!</div></div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button onClick={() => { setReportToExport('kitchen'); setShowEmailModal(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 ${theme.btn}`}>
                <Send size={14} /> Wyślij raport
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className={`font-bold mb-5 flex items-center gap-2 ${theme.textTheme} overview-card-title`}><Users size={18} /> Logistyka i noclegi</h3>
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl overview-box-bg"><span className="text-sm font-semibold text-indigo-700">Dorośli</span><span className="text-sm font-extrabold text-indigo-700 overview-card-title">{totalAdults}</span></div>
              <div className="flex justify-between items-center p-3 bg-fuchsia-50 border border-fuchsia-100 rounded-xl overview-box-bg"><span className="text-sm font-semibold text-fuchsia-700">Dzieci</span><span className="text-sm font-extrabold text-fuchsia-700 overview-card-title">{totalChildren}</span></div>
              <div className="flex justify-between items-center p-3 bg-teal-50 border border-teal-100 rounded-xl overview-box-bg"><span className="text-sm font-semibold text-teal-700">Potrzebuje noclegu</span><span className="text-sm font-extrabold text-teal-700 overview-card-title">{needsHotel}</span></div>
              <div className="flex justify-between items-center p-3 bg-cyan-50 border border-cyan-100 rounded-xl overview-box-bg"><span className="text-sm font-semibold text-cyan-700">Potrzebuje transportu</span><span className="text-sm font-extrabold text-cyan-700 overview-card-title">{needsTransportCount}</span></div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button onClick={() => { setReportToExport('logistics'); setShowEmailModal(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 ${theme.btn}`}>
                <Send size={14} /> Wyślij raport
              </button>
            </div>
          </div>
        </div>
      )}

      {event.notes && (
        <div className={`${theme.bgLight} rounded-3xl p-6 relative overflow-hidden overview-box-bg`}>
          <h3 className={`font-bold mb-2 flex items-center gap-2 relative z-10 ${theme.textTheme} overview-card-title`}>Notatki do wydarzenia</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10 overview-stat-label">{event.notes}</p>
        </div>
      )}

      {/* MODAL: WYBÓR ODBIORCY DO RAPORTU */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800">Wyślij raport z planera</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            {vendors.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 font-bold">Brak dodanych firm w zakładce "Ekipa".</p>
                <p className="text-xs text-slate-400 mt-1">Zapisz podwykonawcę (z adresem e-mail), aby błyskawicznie przesyłać mu raporty z postępów.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Wybierz odbiorcę z Twojej ekipy:</p>
                {vendors.map((vendor, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendReport(vendor.email)} 
                    disabled={!vendor.email} 
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${vendor.email ? `bg-white border-slate-200 ${theme.ring} hover:shadow-md hover:-translate-y-0.5` : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'}`}
                  >
                    <div>
                      <p className="font-bold text-slate-800">{vendor.name} <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">{vendor.category}</span></p>
                      <p className="text-xs text-slate-500 mt-0.5">{vendor.email || 'Brak adresu e-mail (zaktualizuj w Ekipie)'}</p>
                    </div>
                    {vendor.email && <Send size={16} className={theme.textTheme} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}


// ============================================================================
// KARTA STRONY ZAPROSZENIOWEJ
// ============================================================================
function InvitationStatCard({ event, theme }: { event: any, theme: any }) {
  const hasInvitationSite = !!event?.invitation_url
  return (
    <a href={hasInvitationSite ? event.invitation_url : INVITATION_SHOP_URL} target="_blank" rel="noopener noreferrer"
      className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-center text-center group cursor-pointer ${theme.bgCard} ${theme.border}`}>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 opacity-40 mix-blend-screen pointer-events-none group-hover:opacity-80 transition-all duration-500 group-hover:scale-110">
        <img src={SKETCH_ASSETS.website} className="w-full h-full object-contain filter brightness-0 invert" alt="" />
      </div>
      <div className="relative z-10">
        <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 ${theme.textAccent}`}><Sparkle size={12} /> Strona</div>
        <div className={`text-xl sm:text-2xl font-black ${theme.textMain} leading-tight`}>{hasInvitationSite ? 'Otwórz stronę' : 'Zrób zaproszenie'}</div>
        <div className={`text-[10px] sm:text-xs font-medium opacity-70 mt-1 ${theme.textMain}`}>{hasInvitationSite ? 'Aktywna' : 'Brak strony'}</div>
      </div>
    </a>
  )
}
// ============================================================================
// BANER EDUKACYJNY
// ============================================================================
function EducationBanner({ icon = '💡', title, description, ctaLabel = 'Dowiedz się więcej', ctaUrl = INVITATION_SHOP_URL, theme }: { icon?: string, title: string, description: string, ctaLabel?: string, ctaUrl?: string, theme?: any }) {
  return (
    <div className={`${theme ? theme.bgLight : 'bg-amber-50'} rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm`}>
      <div className="text-3xl shrink-0">{icon}</div>
      <div className="flex-1"><h4 className={`font-black text-sm mb-1 ${theme ? theme.textTheme : 'text-amber-900'}`}>{title}</h4><p className={`text-sm leading-relaxed ${theme ? 'text-slate-600' : 'text-amber-800/80'}`}>{description}</p></div>
      <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className={`shrink-0 ${theme ? theme.btn : 'bg-amber-600 hover:bg-amber-700 text-white'} px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2`}>{ctaLabel} <ExternalLink size={12} /></a>
    </div>
  )
}

// ============================================================================
// 2. ZAKŁADKA GOŚCIE
// ============================================================================
function GuestsTab({ eventId, event, guests, refreshGuests, theme, supabase }: { eventId: string, event: any, guests: any[], refreshGuests: () => Promise<void>, theme: any, supabase: any }) {
  // Nasz mądry mózg dla planów (bez słowa "plan")
  const { isPro, canImportFromWeb, loading: planLoading } = useEventPlan(eventId)
  const hasSite = !!event?.invitation_url
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Rodzina')
  const [plusOne, setPlusOne] = useState(false)
  const [childrenCount, setChildrenCount] = useState(0)
  const [diet, setDiet] = useState('Brak')
  const [accommodation, setAccommodation] = useState(false)
  const [attendsCeremony, setAttendsCeremony] = useState(true)
  const [attendsParty, setAttendsParty] = useState(true)
  const [allergies, setAllergies] = useState('Brak')
  const [rsvpStatus, setRsvpStatus] = useState('Brak odpowiedzi')
  const [loading, setLoading] = useState(false)
  const [printFilter, setPrintFilter] = useState<'all' | 'confirmed' | 'pending'>('all')

  const [showPromoModal, setShowPromoModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  async function addGuest() {
    if (!name.trim()) return
    setLoading(true)
    await supabase.from('guests').insert({
      event_id: eventId, name, email, phone, relationship, plus_one: plusOne,
      children_count: childrenCount, diet, accommodation, attends_ceremony: attendsCeremony,
      attends_party: attendsParty, allergies, rsvp_status: rsvpStatus, invitation_sent: false
    })
    setName(''); setEmail(''); setPhone(''); setPlusOne(false); setChildrenCount(0)
    setDiet('Brak'); setAccommodation(false); setAllergies('Brak'); setRsvpStatus('Brak odpowiedzi')
    await refreshGuests()
    setLoading(false)
  }

  async function removeGuest(id: string) {
    if (!confirm('Na pewno usunąć tego gościa?')) return
    await supabase.from('guests').delete().eq('id', id)
    await refreshGuests()
  }

  async function toggleStatus(id: string, field: string, current: boolean) {
    await supabase.from('guests').update({ [field]: !current }).eq('id', id)
    await refreshGuests()
  }

  async function updateGuest(id: string, updates: Record<string, any>) {
    await supabase.from('guests').update(updates).eq('id', id)
    await refreshGuests()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  const confirmedRSVP = guests.filter(g => g.rsvp_status === 'Potwierdzone').length
  const pendingRSVP = guests.filter(g => g.rsvp_status !== 'Potwierdzone' && g.rsvp_status !== 'Odmowa').length
  const guestsToPrint = guests.filter(g => {
    if (printFilter === 'confirmed') return g.rsvp_status === 'Potwierdzone'
    if (printFilter === 'pending') return g.rsvp_status !== 'Potwierdzone' && g.rsvp_status !== 'Odmowa'
    return true
  })



// --- NOWA FUNKCJA DRUKOWANIA GOŚCI ---
  const handlePrintGuests = () => {
    const w = window.open('', '_blank')
    if (!w) { alert("Zezwól na wyskakujące okienka (pop-upy), aby wydrukować listę."); return }

    const rows = guestsToPrint.map((g, i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${i + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${g.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${g.rsvp_status || 'Brak'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${g.diet !== 'Brak' ? g.diet : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${g.needs_transport ? 'Tak' : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${g.accommodation ? 'Tak' : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${g.plus_one ? 'Tak' : '-'}</td>
      </tr>
    `).join('')

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista Gości</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { margin-bottom: 5px; font-size: 24px; }
          p { color: #64748b; margin-bottom: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
          th { background: #f8fafc; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; color: #475569; }
        </style>
      </head>
      <body>
        <h1>Lista Gości</h1>
        <p>Wydrukowano z ANM Planner. Liczba osób na poniższej liście: <strong>${guestsToPrint.length}</strong></p>
        <table>
          <thead>
            <tr><th>Lp.</th><th>Imię i nazwisko</th><th>Status RSVP</th><th>Dieta</th><th>Transport</th><th>Nocleg</th><th>Osoba Tow.</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }




  if (planLoading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Ładowanie gości...</div>

  // Deklaracja plakietki na podstawie planu
  let PlanBadge = null
  if (!hasSite) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><User size={12}/> Wersja Darmowa (Zaznaczasz Ręcznie)</span>
  } else if (hasSite && !isPro) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Globe size={12}/> Strona WWW (Brak Powrotu Danych)</span>
  } else {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><Crown size={12}/> Pakiet PRO (Auto-RSVP Live)</span>
  }

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      
      {/* 1. NAGŁÓWEK ZAKŁADKI (ODPIĘTY - BRAK STICKY) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Users /> Baza Gości </h3>
          <p className="text-sm text-slate-500 mt-1">Dodawaj gości i zarządzaj potwierdzeniami obecności (RSVP).</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <select
            value={printFilter}
            onChange={e => setPrintFilter(e.target.value as any)}
            className="flex-1 md:flex-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 bg-white outline-none shadow-sm"
          >
            <option value="all">📋 Wszyscy ({guests.length})</option>
            <option value="confirmed">✅ Potwierdzone ({confirmedRSVP})</option>
            <option value="pending">⏳ Bez odpowiedzi ({pendingRSVP})</option>
          </select>
          <button onClick={handlePrintGuests} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all">
            <Printer size={16} /> Drukuj Listę
          </button>
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER (Z DILOMA PRZYCISKAMI) */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>A może niech goście zrobią to za Ciebie?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tutaj możesz ręcznie zapisywać wszystkie informacje o dietach, noclegach i osobach towarzyszących. Ale po utworzeniu Strony Zaproszeniowej (Pakiet PRO), goście sami wypełnią formularz obecności, a wszystkie dane spłyną tu automatycznie!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Formularza
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Formularz RSVP działa dla Ciebie na żywo!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kiedy goście wejdą na Waszą stronę WWW i wypełnią ankietę (potwierdzą obecność, dietę czy osoby towarzyszące), wszystkie dane automatycznie i na żywo zaktualizują się w tym panelu (w pakiecie PRO).
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. PODSUMOWANIE RSVP Z AKTYWNYM UPSELL DO STRIPE */}
      {guests.length > 0 && (
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between rounded-3xl px-6 py-5 border shadow-sm gap-4 ${theme.bgLight} ${theme.border} print:hidden`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm ${theme.textTheme}`}><Users size={24} /></div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${theme.textTheme}`}>Baza Gości</p>
              <div className="flex items-end gap-2 mt-1">
                <p className={`text-2xl font-black leading-none ${theme.textTheme}`}>{confirmedRSVP} <span className="text-sm font-medium">potwierdzonych z {guests.length} zaproszonych</span></p>
              </div>
            </div>
          </div>
          
          {isPro ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 shadow-sm w-full md:w-auto justify-center">
              <Zap size={16} /> Auto-RSVP Aktywne ze Stroną
            </div>
          ) : (
            <button 
              disabled={upgrading}
              onClick={async () => {
                if (!hasSite) {
                  setShowPromoModal(true);
                } else {
                  setUpgrading(true);
                  try {
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ eventId })
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else alert('Błąd: ' + data.error);
                  } catch (e) {
                    alert('Wystąpił błąd z połączeniem.');
                  }
                  setUpgrading(false);
                }
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 w-full md:w-auto bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-sm font-bold text-amber-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 shrink-0"
            >
              {upgrading ? (
                <span className="animate-pulse">Ładowanie płatności...</span>
              ) : (
                <>
                  <Lock size={16} className="text-amber-500 shrink-0" /> 
                  <span>Automatyczne pobieranie zablokowane. <span className="underline decoration-amber-400 underline-offset-2">Odblokuj pakiet PRO</span></span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* FORMULARZ DODAWANIA NOWEGO GOŚCIA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 relative overflow-hidden print:hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${theme.bgLight}`}></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10 gap-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme.bgLight} ${theme.textTheme}`}><Plus size={20} /></div> 
            Dodaj nowego gościa
          </h3>
          {hasSite && (
            <div className="bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl text-xs text-amber-800 flex items-center gap-2 max-w-xs shadow-sm">
              <span className="text-lg">📧</span>
              <strong>Wskazówka:</strong> Upewnij się, że wpisany tu adres e-mail jest dokładny – gość musi podać taki sam na stronie WWW, aby dane się połączyły!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="space-y-4 lg:col-span-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Imię i nazwisko *" className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-bold outline-none transition-all shadow-sm ${theme.ring}`} />
            <div className="grid grid-cols-2 gap-3">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none shadow-sm" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon" className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none shadow-sm" />
            </div>
          </div>
          <div className="space-y-4">
            <select value={relationship} onChange={e => setRelationship(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none shadow-sm appearance-none">
              <option value="Rodzina">Relacja: Rodzina</option><option value="Przyjaciele">Relacja: Przyjaciele</option><option value="Praca">Relacja: Praca</option>
            </select>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm">
              <span className="text-sm font-bold text-slate-600 flex-1">Liczba dzieci:</span>
              <input type="number" min="0" value={childrenCount} onChange={e => setChildrenCount(parseInt(e.target.value) || 0)} className={`w-12 rounded-lg text-center font-black outline-none py-1 ${theme.bgLight} ${theme.textTheme}`} />
            </div>
          </div>
          <div className="space-y-4">
            <select value={diet} onChange={e => setDiet(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none shadow-sm appearance-none">
              <option value="Brak">Dieta: Brak (Standard)</option><option value="Vege">Dieta: Wegetariańska</option><option value="Mięsne">Dieta: Mięsna</option><option value="Bezlaktozy">Dieta: Bez laktozy</option><option value="Inne">Dieta: Inna</option>
            </select>
            <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Alergie (np. orzechy)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none shadow-sm" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8 relative z-10">
          <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={16} className="text-slate-400" /> Status RSVP:</span>
            <select value={rsvpStatus} onChange={e => setRsvpStatus(e.target.value)} className={`bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none shadow-sm ${theme.ring}`}>
              <option value="Brak odpowiedzi">⏳ Brak odpowiedzi</option><option value="Potwierdzone">✅ Potwierdzone</option><option value="Odmowa">❌ Odmowa</option>
            </select>
          </div>
          <div className={`flex-1 flex flex-wrap items-center gap-4 p-4 rounded-2xl border ${theme.bgLight} border-transparent`}>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={plusOne} onChange={e => setPlusOne(e.target.checked)} className="w-4 h-4 rounded text-blue-600" /><span className={`text-xs font-bold ${theme.textTheme}`}>+ Osoba tow.</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={accommodation} onChange={e => setAccommodation(e.target.checked)} className="w-4 h-4 rounded text-blue-600" /><span className={`text-xs font-bold ${theme.textTheme}`}>Nocleg</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={attendsCeremony} onChange={e => setAttendsCeremony(e.target.checked)} className="w-4 h-4 rounded text-blue-600" /><span className={`text-xs font-bold ${theme.textTheme}`}>Ceremonia</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={attendsParty} onChange={e => setAttendsParty(e.target.checked)} className="w-4 h-4 rounded text-blue-600" /><span className={`text-xs font-bold ${theme.textTheme}`}>Przyjęcie</span></label>
          </div>
        </div>
        <button onClick={addGuest} disabled={loading} className={`w-full py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2 relative z-10 transform hover:-translate-y-0.5 ${theme.btn}`}>
          {loading ? 'Zapisywanie...' : 'ZAPISZ GOŚCIA'}
        </button>
      </div>

      {/* MAŁA WSKAZÓWKA O EDYCJI */}
      {guests.length > 0 && (
        <div className={`p-4 rounded-2xl border flex gap-3 items-center print:hidden ${theme.bgLight} ${theme.border}`}>
          <div className="text-xl opacity-70">💡</div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Nawet jeśli goście sami się zapisali przez stronę, w każdej chwili możesz kliknąć wizytówkę danej osoby poniżej i <strong>ręcznie edytować</strong> każdą informację (np. jeśli zadzwonią z wiadomością o zmianie diety lub liczby dzieci).
          </p>
        </div>
      )}

      {/* LISTA GOŚCI */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center font-bold print:hidden gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-800 text-lg">Zarządzaj gośćmi ({guests.length})</span>
            {PlanBadge}
          </div>
          <span className="text-xs text-slate-500 font-medium">Kliknij kartę aby rozwinąć szczegóły</span>
        </div>
        
        {/* NAGŁÓWEK TYLKO DO DRUKU */}
        <div className="hidden print:block px-6 py-4 border-b border-slate-200">
          <h2 className="text-2xl font-black">Lista Gości Weselnych</h2>
          <p className="text-sm text-slate-500">Razem: {guests.length} zaproszonych</p>
        </div>

        {guests.length === 0 ? (
          <div className="text-center py-16 px-4 print:hidden">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.bgLight}`}><Users className={theme.textTheme} size={40} /></div>
            <p className="text-slate-500 font-medium text-base">Brak zapisanych gości</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Użyj formularza powyżej lub poczekaj na zgłoszenia ze strony zaproszeniowej.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
           {guestsToPrint.map(g => (
              <GuestCard key={g.id} guest={g} event={event} onToggle={toggleStatus} onUpdate={updateGuest} onRemove={removeGuest} theme={theme} supabase={supabase} />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NIE MASZ STRONY WWW (PROMOCJA) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

function GuestCard({ guest, event, onToggle, onUpdate, onRemove, theme, supabase }: { guest: any, event: any, onToggle: any, onUpdate: any, onRemove: any, theme: any, supabase: any }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [form, setForm] = useState({ ...guest })

  useEffect(() => {
    if (!editing) setForm({ ...guest })
  }, [guest, editing])

  async function handleSave() {
    await onUpdate(guest.id, {
      name: form.name, email: form.email, phone: form.phone, relationship: form.relationship,
      rsvp_status: form.rsvp_status, plus_one: form.plus_one, children_count: Number(form.children_count) || 0,
      diet: form.diet, allergies: form.allergies, accommodation: form.accommodation,
      needs_transport: form.needs_transport, attends_ceremony: form.attends_ceremony,
      attends_party: form.attends_party, message: form.message,
    })
    setEditing(false)
  }

  const statusColor = guest.rsvp_status === 'Potwierdzone' ? 'bg-emerald-500' : guest.rsvp_status === 'Odmowa' ? 'bg-red-500' : 'bg-amber-400'

  return (
    <div className={`transition-all ${expanded ? theme.bgLight : 'hover:bg-slate-50/50'} print:break-inside-avoid print:bg-white print:border-b print:border-slate-200`}>
      <div className="p-5 flex items-center gap-4 cursor-pointer print:cursor-default" onClick={() => !editing && setExpanded(!expanded)}>
        <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-md relative print:border print:border-slate-300 print:text-black print:bg-white print:shadow-none ${theme.bgCard}`}>
          {guest.name.charAt(0).toUpperCase()}
          <div className={`absolute -top-1 -right-1 w-4 h-4 ${statusColor} border-2 border-white rounded-full print:hidden`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-black text-slate-900">{guest.name}</p>
            {guest.relationship && <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase print:border print:border-slate-200">{guest.relationship}</span>}
            {guest.plus_one && <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-700 rounded print:border print:border-slate-200">+1</span>}
            {guest.children_count > 0 && <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-700 rounded print:border print:border-slate-200">👶{guest.children_count}</span>}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase print:border print:border-slate-300 print:text-black print:bg-transparent ${guest.rsvp_status === 'Potwierdzone' ? 'bg-emerald-100 text-emerald-700' : guest.rsvp_status === 'Odmowa' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {guest.rsvp_status || 'Brak odp.'}
            </span>
          </div>
          <div className="flex gap-3 text-xs text-slate-500 mt-1">
            {guest.email && <span>✉️ {guest.email}</span>}
            {guest.phone && <span>📞 {guest.phone}</span>}
            {guest.diet && guest.diet !== 'Brak' && <span className="print:block hidden">🍽️ Dieta: {guest.diet}</span>}
            {guest.accommodation && <span className="print:block hidden">🏨 Nocleg</span>}
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors print:hidden">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* ROZWINIĘTE SZCZEGÓŁY - UKRYTE PRZY DRUKOWANIU */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 bg-white/50 print:hidden">
          <div className="flex justify-between items-center py-3 mb-4 border-b border-slate-100">
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button onClick={() => setEditing(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${theme.btn}`}>
                    <Edit3 size={14} /> Edytuj dane
                  </button>
                  <button onClick={() => setShowEmail(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-bold transition-colors">
                    <Mail size={14} /> Wyślij zaproszenie
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${theme.btn}`}><Save size={14} /> Zapisz</button>
                  <button onClick={() => { setEditing(false); setForm({ ...guest }) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"><X size={14} /> Anuluj</button>
                </>
              )}
            </div>
            <button onClick={() => onRemove(guest.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors">
              <Trash2 size={14} /> Usuń gościa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Dane kontaktowe</h4>
              <Field label="Imię i nazwisko" icon={<Users size={14} />}>
                {editing ? <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="field-input" /> : <span>{guest.name}</span>}
              </Field>
              <Field label="Email" icon={<Mail size={14} />}>
                {editing ? <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="field-input" /> : <span>{guest.email || '—'}</span>}
              </Field>
              <Field label="Telefon" icon={<Phone size={14} />}>
                {editing ? <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="field-input" /> : <span>{guest.phone || '—'}</span>}
              </Field>
              <Field label="Relacja" icon={<Heart size={14} />}>
                {editing ? (
                  <select value={form.relationship || 'Rodzina'} onChange={e => setForm({ ...form, relationship: e.target.value })} className="field-input">
                    <option value="Rodzina">Rodzina</option><option value="Przyjaciele">Przyjaciele</option><option value="Praca">Praca</option>
                  </select>
                ) : <span>{guest.relationship || '—'}</span>}
              </Field>
              <Field label="Status RSVP" icon={<CheckSquare size={14} />}>
                {editing ? (
                  <select value={form.rsvp_status || 'Brak odpowiedzi'} onChange={e => setForm({ ...form, rsvp_status: e.target.value })} className="field-input">
                    <option value="Brak odpowiedzi">⏳ Brak odpowiedzi</option><option value="Potwierdzone">✅ Potwierdzone</option><option value="Odmowa">❌ Odmowa</option>
                  </select>
                ) : <span>{guest.rsvp_status || 'Brak odpowiedzi'}</span>}
              </Field>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Preferencje i logistyka</h4>
              <Field label="Dieta" icon={<Utensils size={14} />}>
                {editing ? (
                  <select value={form.diet || 'Brak'} onChange={e => setForm({ ...form, diet: e.target.value })} className="field-input">
                    <option value="Brak">Brak (Standard)</option><option value="Mięsne">Mięsne</option><option value="Vege">Wegetariańska</option><option value="Bezlaktozy">Bez laktozy</option><option value="Inne">Inna</option>
                  </select>
                ) : <span>{guest.diet || 'Brak'}</span>}
              </Field>
              <Field label="Alergie" icon={<AlertCircle size={14} />}>
                {editing ? <input value={form.allergies || ''} onChange={e => setForm({ ...form, allergies: e.target.value })} className="field-input" /> : <span>{guest.allergies || 'Brak'}</span>}
              </Field>
              <Field label="Osoba towarzysząca" icon={<Heart size={14} />}>
                {editing ? <input type="checkbox" checked={!!form.plus_one} onChange={e => setForm({ ...form, plus_one: e.target.checked })} className="w-4 h-4" /> : <span>{guest.plus_one ? '✅ Tak' : '❌ Nie'}</span>}
              </Field>
              <Field label="Liczba dzieci" icon={<Baby size={14} />}>
                {editing ? <input type="number" min="0" value={form.children_count || 0} onChange={e => setForm({ ...form, children_count: parseInt(e.target.value) || 0 })} className="field-input w-20" /> : <span>{guest.children_count || 0}</span>}
              </Field>
              <Field label="Nocleg" icon={<Bed size={14} />}>
                {editing ? <input type="checkbox" checked={!!form.accommodation} onChange={e => setForm({ ...form, accommodation: e.target.checked })} className="w-4 h-4" /> : <span>{guest.accommodation ? '✅ Tak' : '❌ Nie'}</span>}
              </Field>
              <Field label="Transport" icon={<Car size={14} />}>
                {editing ? <input type="checkbox" checked={!!form.needs_transport} onChange={e => setForm({ ...form, needs_transport: e.target.checked })} className="w-4 h-4" /> : <span>{guest.needs_transport ? '✅ Tak' : '❌ Nie'}</span>}
              </Field>
            </div>
          </div>
          {(guest.message || editing) && (
            <div className="mt-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><MessageCircle size={14} /> Wiadomość od gościa</h4>
              {editing ? <textarea value={form.message || ''} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="w-full field-input" /> : <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap">{guest.message || '—'}</p>}
            </div>
          )}
          <div className="mt-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Statusy (kliknij aby zmienić)</h4>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label="✉️ Wysłano zaproszenie" active={guest.invitation_sent} onClick={() => onToggle(guest.id, 'invitation_sent', guest.invitation_sent)} theme={theme} />
              <StatusBadge label="🏨 Nocleg" active={guest.accommodation} onClick={() => onToggle(guest.id, 'accommodation', guest.accommodation)} theme={theme} />
              <StatusBadge label="🚗 Transport" active={guest.needs_transport} onClick={() => onToggle(guest.id, 'needs_transport', guest.needs_transport)} theme={theme} />
              <StatusBadge label="⛪ Ceremonia" active={guest.attends_ceremony} onClick={() => onToggle(guest.id, 'attends_ceremony', guest.attends_ceremony)} theme={theme} />
              <StatusBadge label="🎉 Wesele" active={guest.attends_party} onClick={() => onToggle(guest.id, 'attends_party', guest.attends_party)} theme={theme} />
            </div>
          </div>
        </div>
      )}
      {showEmail && (
        <EmailModal guest={guest} event={event} supabase={supabase} onClose={() => setShowEmail(false)} theme={theme} />
      )}
      <style jsx>{`
        :global(.field-input) {
          background: white;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          padding: 0.4rem 0.6rem;
          font-size: 0.875rem;
          outline: none;
          width: 100%;
        }
        :global(.field-input:focus) {
          border-color: rgb(156 163 175);
          box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.1);
        }
      `}</style>
    </div>
  )
}

function Field({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1.5 text-slate-500 font-semibold min-w-[140px] text-xs uppercase tracking-wider">{icon} {label}</div>
      <div className="flex-1 font-medium text-slate-800">{children}</div>
    </div>
  )
}
// ============================================================
// KOMPONENT: EmailModal
// ============================================================
function EmailModal({ guest, event, onClose, theme, supabase }: { guest: any, event: any, onClose: () => void, theme: any, supabase: any }) {
  const hasSite = !!event?.invitation_url
  const [customUrl, setCustomUrl] = useState(event?.invitation_url || '')
  const [customNote, setCustomNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const coupleNames = event?.title || 'Para Młoda'
  const weddingDate = event?.event_date ? new Date(event.event_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const venueName = event?.venue_name || event?.location || ''

  const emailHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Zaproszenie ślubne</title>
</head>
<body style="margin:0;padding:0;background:#f9f5f0;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f8f0e8 0%,#fce8d8 50%,#f8e8f0 100%);padding:40px 40px 30px;text-align:center;border-bottom:1px solid #f0e0d0;">
      <div style="font-size:36px;margin-bottom:8px;">💐</div>
      <div style="font-size:11px;letter-spacing:4px;color:#b89c8a;text-transform:uppercase;font-family:sans-serif;margin-bottom:16px;">Zaproszenie na Wesele</div>
      <h1 style="font-size:38px;color:#6b4c3b;margin:0;font-weight:400;line-height:1.2;">${coupleNames}</h1>
      ${weddingDate ? `<p style="font-size:16px;color:#9c7a6e;margin:12px 0 0;font-style:italic;">${weddingDate}</p>` : ''}
      ${venueName ? `<p style="font-size:13px;color:#b89c8a;margin:6px 0 0;font-family:sans-serif;">${venueName}</p>` : ''}
    </div>
    <div style="padding:40px;">
      <p style="font-size:18px;color:#5a3e35;line-height:1.6;margin:0 0 20px;">
        Drogi/a <strong>${guest.name}</strong>,
      </p>
      <p style="font-size:15px;color:#7a5c50;line-height:1.8;margin:0 0 24px;">
        Z ogromną radością zapraszamy Cię, abyś stał/a się częścią jednego z najważniejszych dni naszego życia. 
        Twoja obecność sprawi, że ta chwila będzie jeszcze bardziej wyjątkowa.
      </p>
      ${customNote ? `
      <div style="background:#fdf6f0;border-left:3px solid #d4a574;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="font-size:14px;color:#7a5c50;line-height:1.7;margin:0;font-style:italic;">${customNote}</p>
      </div>` : ''}
      ${customUrl ? `
      <div style="text-align:center;margin:32px 0;">
        <p style="font-size:13px;color:#9c7a6e;margin:0 0 16px;font-family:sans-serif;">Potwierdź swoją obecność i dowiedz się więcej:</p>
        <a href="${customUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4a574,#c2836a);color:white;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:15px;font-family:sans-serif;font-weight:bold;letter-spacing:1px;box-shadow:0 4px 16px rgba(194,131,106,0.4);">
          🌸 Przejdź do zaproszenia
        </a>
        <p style="font-size:11px;color:#b89c8a;margin:12px 0 0;font-family:sans-serif;">${customUrl}</p>
      </div>` : ''}
      <div style="border-top:1px solid #f0e0d0;padding-top:24px;margin-top:24px;text-align:center;">
        <p style="font-size:24px;color:#c2836a;margin:0 0 8px;">Z miłością,</p>
        <p style="font-size:18px;color:#6b4c3b;font-weight:bold;margin:0;">${coupleNames}</p>
        <div style="font-size:24px;margin-top:12px;">💕</div>
      </div>
    </div>
    <div style="background:#f9f5f0;padding:20px;text-align:center;border-top:1px solid #f0e0d0;">
      <p style="font-size:11px;color:#b89c8a;margin:0;font-family:sans-serif;letter-spacing:1px;">
        To zaproszenie zostało wygenerowane z systemu planera weselnego
      </p>
    </div>
  </div>
</body>
</html>`

  const emailSubject = `Zaproszenie ślubne — ${coupleNames}${weddingDate ? ` · ${weddingDate}` : ''}`

  async function handleSend() {
    if (!guest.email) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: guest.email,
          to_name: guest.name,
          subject: emailSubject,
          html_content: emailHtml,
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Błąd serwera')
      }
      await supabase.from('guests').update({ invitation_sent: true }).eq('id', guest.id)
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'Nie udało się wysłać.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Mail size={20} className="text-violet-500" /> Wyślij zaproszenie
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Do: <strong>{guest.name}</strong>{guest.email && ` · ${guest.email}`}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              🔗 Link do strony zaproszenia
            </label>
            {hasSite ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
                <span className="text-emerald-500">✅</span>
                <span className="text-emerald-800 font-bold text-xs truncate flex-1">{event.invitation_url}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">automatyczny</span>
              </div>
            ) : (
              <input
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://... (zostaw puste jeśli nie masz jeszcze strony)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-300"
              />
            )}
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              💬 Osobista wiadomość (opcjonalnie)
            </label>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Np. Bardzo się cieszymy, że będziecie z nami!"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-300 resize-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Podgląd emaila</p>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <iframe srcDoc={emailHtml} className="w-full" style={{ height: '320px', border: 'none' }} title="Email preview" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {!guest.email && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              ⚠️ Ten gość nie ma zapisanego e-maila — uzupełnij go najpierw w danych gościa.
            </p>
          )}
          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">❌ {error}</p>
          )}
          {sent ? (
            <div className="flex items-center justify-center gap-3 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-black text-emerald-800">Zaproszenie wysłane!</p>
                <p className="text-xs text-emerald-600">{guest.email}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending || !guest.email}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-violet-200"
            >
              {sending
                ? <><span className="animate-spin inline-block">⏳</span> Wysyłanie...</>
                : <><Mail size={16} /> Wyślij zaproszenie{guest.email ? ` → ${guest.email}` : ''}</>
              }
            </button>
          )}
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Email zostanie wysłany przez Brevo jako piękny HTML.
          </p>
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// ZAKŁADKA BUDŻET
// ============================================================================
function BudgetTab({ eventId, theme, supabase }: { eventId: string, theme: any, supabase: any }) {
  const [items, setItems] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Lokal i Catering', estimated_cost: '', paid_amount: '', due_date: '' })

  useEffect(() => {
    async function load() {
      const [budgetRes, vendorsRes] = await Promise.all([
        supabase.from('budget_items').select('*').eq('event_id', eventId).order('created_at', { ascending: true }),
        supabase.from('vendors').select('*').eq('event_id', eventId)
      ])
      if (budgetRes.data) setItems(budgetRes.data)
      if (vendorsRes.data) setVendors(vendorsRes.data)
    }
    load()
  }, [eventId, supabase])

  async function handleAddItem() {
    if (!form.name) return
    setLoading(true)
    const newItem = {
      event_id: eventId,
      name: form.name,
      category: form.category,
      estimated_cost: Number(form.estimated_cost) || 0,
      actual_cost: Number(form.estimated_cost) || 0,
      paid_amount: Number(form.paid_amount) || 0,
      due_date: form.due_date || null
    }
    const { data, error } = await supabase.from('budget_items').insert([newItem]).select().single()
    if (error) alert(`Błąd: ${error.message}`)
    else if (data) {
      setItems([...items, data])
    }
    setForm({ name: '', category: 'Lokal i Catering', estimated_cost: '', paid_amount: '', due_date: '' })
    setShowForm(false)
    setLoading(false)
  }

  async function handleImportVendor(vendor: any) {
    setLoading(true)
    let initialPaid = 0
    if (vendor.status === 'Opłacone') initialPaid = vendor.price
    if (vendor.status === 'Zaliczka') initialPaid = vendor.price * 0.2 // przykładowo 20%

    const newItem = {
      event_id: eventId,
      name: vendor.name,
      category: vendor.category || 'Inne',
      estimated_cost: vendor.price || 0,
      actual_cost: vendor.price || 0,
      paid_amount: initialPaid,
      due_date: null
    }

    const { data, error } = await supabase.from('budget_items').insert([newItem]).select().single()
    if (error) alert(`Błąd: ${error.message}`)
    else if (data) setItems([...items, data])

    setShowImport(false)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Usunąć ten wydatek?')) return
    await supabase.from('budget_items').delete().eq('id', id)
    setItems(items.filter(item => item.id !== id))
  }

  async function handleUpdate(id: string, updates: any) {
    const { error, data } = await supabase.from('budget_items').update(updates).eq('id', id).select().single()
    if (error) { alert(`Błąd aktualizacji: ${error.message}`); return }
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const totalEstimated = items.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0)
  const totalPaid = items.reduce((sum, item) => sum + (Number(item.paid_amount) || 0), 0)
  const leftToPay = Math.max(0, totalEstimated - totalPaid)

  const eligibleVendors = vendors.filter(v =>
    ['Umowa', 'Zaliczka', 'Opłacone'].includes(v.status) &&
    !items.some(item => item.name === v.name)
  )

  // Bardziej uniwersalne kategorie pasujące do każdego rodzaju eventu
  const categories = [
    'Lokal i Catering', 'Foto i Wideo', 'Muzyka i Oprawa', 
    'Ubiór i Wizerunek', 'Włosy i Makijaż', 'Dekoracje i Kwiaty', 
    'Papeteria', 'Strona WWW / E-zaproszenie', 'Atrakcje dodatkowe', 
    'Transport i Noclegi', 'Inne'
  ]

  // --- NOWA FUNKCJA DRUKOWANIA BUDŻETU ---
  const handlePrintBudget = () => {
    const w = window.open('', '_blank')
    if (!w) { alert("Zezwól na wyskakujące okienka (pop-upy), aby wydrukować raport."); return }

    const rows = items.map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.estimated_cost} zł</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.paid_amount} zł</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: ${item.estimated_cost - item.paid_amount > 0 ? '#e11d48' : '#059669'}; font-weight: bold;">
          ${Math.max(0, item.estimated_cost - item.paid_amount)} zł
        </td>
      </tr>
    `).join('')

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Raport Budżetowy</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { margin-bottom: 15px; font-size: 24px; }
          .summary { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .summary p { margin: 5px 0; font-size: 15px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
          th { background: #f1f5f9; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; color: #475569; }
        </style>
      </head>
      <body>
        <h1>Raport Finansowy</h1>
        <div class="summary">
          <p>Całkowity planowany koszt: <strong>${totalEstimated.toLocaleString()} zł</strong></p>
          <p>Suma wpłaconych zaliczek: <strong>${totalPaid.toLocaleString()} zł</strong></p>
          <p style="color: #e11d48;">Pozostało do zapłaty: <strong>${leftToPay.toLocaleString()} zł</strong></p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Kategoria</th>
              <th>Wydatki / Opis</th>
              <th style="text-align: right;">Koszt planowany</th>
              <th style="text-align: right;">Wpłacono</th>
              <th style="text-align: right;">Pozostało</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="space-y-8 relative animate-in fade-in duration-500">
      
      {/* NAGŁÓWEK TYLKO DO DRUKU */}
      <div className="hidden print:block mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Raport Budżetowy</h2>
        <div className="flex gap-8 text-sm font-bold text-slate-600">
          <p>Całkowity koszt: {totalEstimated.toLocaleString()} zł</p>
          <p>Pozostało do zapłaty: <span className="text-rose-600">{leftToPay.toLocaleString()} zł</span></p>
        </div>
      </div>

      <div className="print:hidden">
        <EducationBanner 
          icon="💡" 
          title="Budżet pod pełną kontrolą!" 
          description="Zapisuj tu wszystkie wydatki, od wielkich umów po drobne zakupy (jak kosmetyczka czy dekoracje). Pamiętaj, że możesz jednym kliknięciem zaimportować kwoty od firm zapisanych w zakładce Ekipa!" 
          ctaLabel="Zarządzaj wydatkami" 
          theme={theme} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center relative overflow-hidden group">
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-xl ${theme.bgCard} group-hover:scale-150 transition-transform duration-700`}></div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Całkowity budżet</h3>
          <div className={`text-4xl sm:text-5xl font-black relative z-10 ${theme.textTheme}`}>{totalEstimated.toLocaleString()} zł</div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-rose-500 opacity-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Pozostało do zapłaty</h3>
          <div className="text-4xl sm:text-5xl font-black text-rose-600 relative z-10">{leftToPay.toLocaleString()} zł</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className={`p-5 rounded-3xl border flex gap-4 items-center animate-in fade-in print:hidden ${theme.bgLight} ${theme.border}`}>
          <div className="text-2xl opacity-70">👛</div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className={theme.textTheme}>Ciekawostka:</strong> Zazwyczaj około 40-50% budżetu pochłania sam lokal i jedzenie. Uzupełniając pole <strong>Termin płatności</strong> zyskasz pewność, że żadna rata dla podwykonawców Ci nie umknie! Gdy data się zbliży, zobaczysz tu specjalne powiadomienie (🔔).
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
        <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Wallet /> Kalkulacja Kosztów</h3>
        <div className="flex flex-wrap justify-end gap-3 w-full md:w-auto">
          
          <button onClick={handlePrintBudget} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm">
            <Printer size={16} /> Drukuj Raport
          </button>

          <div className="relative">
            <button onClick={() => { setShowImport(!showImport); setShowForm(false) }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-sm ${theme.bgLight} ${theme.textTheme} border-transparent`}>
              <Download size={16} /> Dodaj z Ekipy
            </button>
            {showImport && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Wybierz zakontraktowaną firmę</div>
                <div className="max-h-60 overflow-y-auto">
                  {eligibleVendors.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">Brak nowych umów w zakładce Ekipa.</div>
                  ) : (
                    eligibleVendors.map(v => (
                      <button key={v.id} onClick={() => handleImportVendor(v)} className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 transition-colors flex justify-between items-center group">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                          <div className="text-xs text-slate-500">{v.category}</div>
                        </div>
                        <div className={`text-sm font-black group-hover:scale-110 transition-transform ${theme.textTheme}`}>+ {v.price.toLocaleString()} zł</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => { setShowForm(!showForm); setShowImport(false) }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${theme.btn}`}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Anuluj' : 'Nowy wydatek'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 animate-in fade-in slide-in-from-top-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none ${theme.ring}`}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nazwa / Opis (np. Obrączki)" className={`lg:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none ${theme.ring}`} />
            
            <div className="flex flex-col gap-1 relative">
              <span className="text-[10px] uppercase font-bold text-slate-400 absolute -top-2 left-3 bg-slate-50 px-1">Termin zapłaty</span>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none ${theme.ring}`} />
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-slate-400 font-bold text-xs">Koszt:</span>
              <input type="number" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })} placeholder="0" className="w-full text-sm font-black text-slate-700 outline-none text-right" />
              <span className="text-slate-400 font-bold text-sm">zł</span>
            </div>
            
            {/* Opcjonalna szybka zaliczka, można schować pod "Zaawansowane" ale zostawiamy dla wygody */}
            <div className="lg:col-start-5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
              <span className={`font-bold text-xs ${theme.textTheme}`}>Wpłacono:</span>
              <input type="number" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: e.target.value })} placeholder="0" className={`w-full text-sm font-black outline-none text-right ${theme.textTheme}`} />
              <span className={`font-bold text-sm ${theme.textTheme}`}>zł</span>
            </div>
          </div>
          <button onClick={handleAddItem} disabled={loading} className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md ${theme.btn}`}>Zapisz wydatek do budżetu</button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 p-5 border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-2">Kategoria</div>
          <div className="col-span-3">Opis i Termin</div>
          <div className="col-span-2 text-right">Planowane</div>
          <div className="col-span-3">Status opłacenia</div>
          <div className="col-span-2 text-center print:hidden">Akcje</div>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-16 print:hidden">
            <Wallet size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold">Budżet jest pusty</p>
            <p className="text-sm text-slate-400 mt-1">Pobierz zawarte umowy z zakładki "Ekipa" lub dodaj koszty ręcznie.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((item, index) => (
              <BudgetTableRow key={item.id} item={item} index={index} onUpdate={handleUpdate} onDelete={handleDelete} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ZAKŁADKA ZADANIA I HARMONOGRAM — NOWA WERSJA
// ============================================================================
function TasksTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // To uruchamia nasze powiadomienia Push z Koku 1!
  const { permission, requestPermission } = useNotifications()

  const fetchTasks = async () => {
    // Czekamy na załadowanie eventu — bez type nie wiemy, jakie zadania seedować
    if (!event?.type) return

    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', eventId)
      .order('stage', { ascending: true })

    if (fetchError) {
      console.error('[tasks] fetch error:', fetchError.message)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      // Baza pusta dla tego eventu — seedujemy zadania dopasowane do typu
      const initialTasks = getTasksForEventType(event.type).map(({ title, stage, category, points }) => ({
        title,
        stage,
        category,
        points,
        event_id: eventId,
        status: false,
      }))

      const { data: inserted, error: insertError } = await supabase
        .from('tasks')
        .insert(initialTasks)
        .select()

      if (insertError) {
        console.error('[tasks] insert error:', insertError.message)
      } else if (inserted) {
        setTasks(inserted)
      }
    } else {
      setTasks(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [eventId, event?.type])

  async function toggleTask(id: string, currentStatus: boolean) {
    const completing = !currentStatus
    const now = completing ? new Date().toISOString() : null

    // Optimistyczna aktualizacja UI
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: completing, completed_at: now } : t))

    // Zapis przez API (service role — omija RLS)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (token) {
      const res = await fetch('/api/tasks/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId: id, status: completing, completedAt: now }),
      })
      if (!res.ok) {
        // Cofnij optimistyczną aktualizację jeśli API zwróciło błąd
        console.error('[toggleTask] API error:', await res.text())
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus, completed_at: null } : t))
        return
      }
    } else {
      // Fallback: próba bezpośrednio (działa jeśli RLS na tasks pozwala)
      const { error } = await supabase.from('tasks').update({ status: completing, completed_at: now }).eq('id', id)
      if (error) {
        console.error('[toggleTask] direct update error:', error.message)
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus, completed_at: null } : t))
        return
      }
    }

    if (completing) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      })
    }
  }

  const systemTasks = useMemo(() => tasks.filter(t => t.category === 'system'), [tasks])

  if (loading) {
    return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Konfiguruję Twój planner...</div>
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* MONIT O POWIADOMIENIA PUSH */}
      {permission === 'default' && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg text-white print:hidden">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full animate-bounce"><Bell size={24} /></div>
            <div>
              <h4 className="font-black text-lg">Włącz przypomnienia!</h4>
              <p className="text-sm opacity-80">Pozwól nam wysyłać Ci powiadomienia na telefon, gdy zbliża się termin zadania lub płatności z kalendarza.</p>
            </div>
          </div>
          <button 
            onClick={requestPermission}
            className="px-6 py-3 bg-white text-indigo-600 font-black rounded-xl text-sm shadow-md hover:scale-105 transition-transform shrink-0"
          >
            Włącz powiadomienia
          </button>
        </div>
      )}

      {/* SEKCJA 1: KALENDARZ MIESIĘCZNY (Zastępuje Koszyki) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className={`text-2xl font-black ${theme.textMain}`}>Twój Kalendarz</h2>
          <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-lg uppercase tracking-wider">Centrum Dowodzenia</span>
        </div>
        <Calendar 
          eventId={eventId} 
          event={event} 
          theme={theme} 
          supabase={supabase} 
          onTaskAdded={fetchTasks} 
        />
      </section>

      {/* SEKCJA 2: LISTA ZADAŃ */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <h2 className={`text-2xl font-black ${theme.textMain}`}>Plan Działania</h2>
          <ListTodo size={24} className={theme.textAccent} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STAGES.map(stage => {
            const stageTasks = systemTasks.filter(t => t.stage === stage.num)
            if (stageTasks.length === 0) return null
            const isComplete = stageTasks.every(t => t.status)

            return (
              <div key={stage.num} className={`bg-white rounded-3xl p-6 shadow-sm border relative overflow-hidden transition-all ${isComplete ? 'border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
                {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>}
                
                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: stage.color }}>
                      {stage.timeframe}
                    </div>
                    <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                      <span>{stage.icon}</span> {stage.name}
                    </h3>
                  </div>
                  {isComplete && <div className="bg-emerald-50 text-emerald-500 p-2 rounded-full"><Check size={16}/></div>}
                </div>

                <div className="space-y-2 relative z-10">
                  {stageTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id, task.status)} 
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${task.status ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                    >
                      <button className={`shrink-0 ${task.status ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {task.status ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${task.status ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {task.icon && <span className="mr-2">{task.icon}</span>}
                          {task.title}
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                        +{task.points} pkt
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SEKCJA 3: GRYWALIZACJA */}
      <section className="space-y-4 pt-8 border-t border-slate-200/50">
        <div className="flex flex-col items-center justify-center mb-6">
          <span className="text-4xl mb-2">🏆</span>
          <h2 className={`text-3xl font-black ${theme.textMain}`}>Twoje Osiągnięcia</h2>
          <p className={`text-sm mt-1 opacity-80 ${theme.textMain}`}>Baw się dobrze, organizując swój event!</p>
        </div>
        <Gamification
          eventId={eventId}
          eventType={event?.type}
          theme={theme}
          supabase={supabase}
          tasks={tasks}
          notificationsEnabled={permission === 'granted'}
        />
      </section>
    </div>
  )
}

// ============================================================================
// ZAKŁADKA EKIPA
// ============================================================================
function VendorsTab({ eventId, theme, supabase }: { eventId: string, theme: any, supabase: any }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [hiddenPromo, setHiddenPromo] = useState(false) // Pozwala ukryć automatyczny wpis
  const [form, setForm] = useState({ name: '', category: 'Fotograf', price: '', status: 'Szukam', contact: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('vendors').select('*').eq('event_id', eventId).order('created_at')
      if (data) setVendors(data)
    }
    load()
  }, [eventId, supabase])

  async function handleSaveVendor() {
    if (!form.name) return
    setLoading(true)
    const newVendor = { event_id: eventId, name: form.name, category: form.category, price: Number(form.price) || 0, status: form.status, contact: form.contact, phone: form.phone, email: form.email }

    const { data, error } = await supabase.from('vendors').insert([newVendor]).select().single()
    if (error) {
      alert(`Błąd zapisu! Sprawdź tabelę 'vendors'. Komunikat: ${error.message}`)
    } else if (data) {
      setVendors([...vendors, data])
    }

    setForm({ name: '', category: 'Fotograf', price: '', status: 'Szukam', contact: '', phone: '', email: '' })
    setShowForm(false)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (id === 'promo-anm') {
      setHiddenPromo(true) // Ukrywa wizytówkę demo na życzenie użytkownika
      return
    }
    if (!confirm('Usunąć tego usługodawcę?')) return
    await supabase.from('vendors').delete().eq('id', id)
    setVendors(vendors.filter(v => v.id !== id))
  }

  async function handleUpdate(id: string, updates: Record<string, any>) {
    if (id === 'promo-anm') {
      // Jeśli klient edytuje automatyczny wpis, zapisujemy go fizycznie do bazy
      setLoading(true)
      const newVendor = { event_id: eventId, ...updates }
      const { data, error } = await supabase.from('vendors').insert([newVendor]).select().single()
      if (!error && data) {
        setVendors([data, ...vendors])
        setHiddenPromo(true)
      }
      setLoading(false)
      return
    }
    await supabase.from('vendors').update(updates).eq('id', id)
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  // Wstawianie Waszej firmy automatycznie na 1 miejsce (jeśli jeszcze nie dodana z bazy)
  const displayVendors = [...vendors]
  const hasAnmAdded = vendors.some(v => v.name.includes('ANM Collective'))
  
  if (!hiddenPromo && !hasAnmAdded) {
    displayVendors.unshift({
      id: 'promo-anm',
      name: 'ANM Collective',
      category: 'Strona WWW / E-zaproszenie',
      price: 400,
      status: 'Polecane',
      phone: '572 069 851',
      email: 'kontakt@anmcollective.pl',
      contact: 'Włodzimierz 5a, 98-105 Wodzierady\n\nNajpiękniejsze e-zaproszenia i interaktywne strony ślubne z systemem RSVP.\nOferta: https://anmcollective.pl/zaproszenia-slubne/'
    })
  }

  const searchCategories = [
    { name: 'Lokal / Sala', query: 'restauracja sala bankietowa event', icon: <Store size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-100', hover: 'hover:border-indigo-300' },
    { name: 'Fotograf', query: 'fotograf sesja', icon: <Camera size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-100', hover: 'hover:border-emerald-300' },
    { name: 'Muzyka / DJ', query: 'dj zespół muzyczny oprawa', icon: <Music size={18} />, color: 'text-amber-600', bg: 'bg-amber-100', hover: 'hover:border-amber-300' },
    { name: 'Wizaż i Włosy', query: 'makijaż fryzjer salon urody', icon: <Sparkles size={18} />, color: 'text-pink-600', bg: 'bg-pink-100', hover: 'hover:border-pink-300' },
    { name: 'Dekoracje', query: 'kwiaciarnia dekoracje eventowe', icon: <Sparkle size={18} />, color: 'text-rose-600', bg: 'bg-rose-100', hover: 'hover:border-rose-300' },
    { name: 'Barman', query: 'barman na wesele drink bar', icon: <Store size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-100', hover: 'hover:border-cyan-300' },
    { name: 'Cukiernia', query: 'tort cukiernia słodki stół', icon: <Utensils size={18} />, color: 'text-orange-600', bg: 'bg-orange-100', hover: 'hover:border-orange-300' },
  ]

  const formCategories = [
    'Lokal / Catering', 'Fotograf', 'Kamerzysta', 'Muzyka (DJ / Zespół)', 
    'Wizaż i Włosy', 'Dekoracje / Florystyka', 'Cukiernia', 'Barman', 
    'Atrakcje (Fotobudka, itp.)', 'Transport', 'Strona WWW / E-zaproszenie', 'Inne'
  ]

  const openGoogleMaps = (query: string) => {
    if (!searchCity) { alert("Najpierw wpisz miejscowość, w której szukasz!"); return }
    const searchQuery = encodeURIComponent(`${query} ${searchCity}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
     
   {/* NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative z-10">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><HeartHandshake /> Zarządzaj Ekipą</h3>
          <p className="text-sm text-slate-500 mt-1">Zapisuj, porównuj i wyceniaj podwykonawców w jednym miejscu.</p>
        </div>
      </div>

      <div className={`p-5 rounded-3xl border flex gap-4 items-center shadow-sm ${theme.bgLight} ${theme.border}`}>
        <div className="text-2xl opacity-70">💡</div>
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className={theme.textTheme}>Wskazówka:</strong> Zanim podpiszesz umowę, ustaw status podwykonawcy na "W trakcie rozmów". Kiedy wpłacisz zaliczkę lub opłacisz całość, zmień status – <strong>usługodawca od razu zaktualizuje się i będzie można dodać go do zakładki Budżet!</strong>
        </p>
      </div>

      {/* WYSZUKIWARKA / KAFELKI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none ${theme.bgLight}`}></div>
        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-2"><Search size={20} className={theme.textTheme} /><h3 className={`text-xl font-black ${theme.textTheme}`}>Szybkie wyszukiwanie w okolicy</h3></div>
          <p className="text-sm text-slate-600">Wpisz miejscowość (np. Warszawa). Otworzymy Mapy Google z wybraną kategorią usług.</p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin size={18} className="text-slate-400" /></div>
            <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="Wpisz miasto docelowe..." className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none shadow-sm transition-all focus:bg-white ${theme.ring}`} />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Nienachalny Kafelek ANM Collective (Jako pierwszy) */}
          <button onClick={() => window.open('https://anmcollective.pl/zaproszenia-slubne/', '_blank')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group">
            <div className="p-3 rounded-xl bg-white text-rose-500 mb-3 group-hover:scale-110 transition-transform shadow-sm"><Sparkles size={18} /></div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 text-center leading-tight">E-zaproszenia<br/><span className="text-[9px] opacity-70 font-bold">ANM Collective</span></span>
          </button>

          {/* Reszta standardowych kafelków */}
          {searchCategories.map((cat, idx) => (
            <button key={idx} onClick={() => openGoogleMaps(cat.query)} className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${cat.hover} group`}>
              <div className={`p-3 rounded-xl ${cat.bg} ${cat.color} mb-3 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

   {/* LISTA EKIPY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2"><Store size={18} className={theme.textTheme}/> Baza podwykonawców</h4>
          <button onClick={() => setShowForm(!showForm)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md w-full sm:w-auto ${theme.btn}`}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Anuluj dodawanie' : 'Nowy podwykonawca'}
          </button>
        </div>
        
        {showForm && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nazwa firmy lub Imię i Nazwisko *" className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none ${theme.ring}`} />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none ${theme.ring}`}>
                {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-slate-500 font-bold text-sm">Cena:</span>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Całkowity koszt" className={`w-full text-sm font-black outline-none ${theme.textTheme}`} />
                <span className="text-slate-400 font-bold text-sm">zł</span>
              </div>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none ${theme.ring}`}>
                <option value="Szukam">🔍 Szukam / Wycena</option><option value="Rozmowy">💬 W trakcie rozmów</option><option value="Umowa">📝 Podpisana umowa</option><option value="Zaliczka">💸 Zaliczka wpłacona</option><option value="Opłacone">✅ W pełni opłacone</option>
              </select>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Numer telefonu" className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none ${theme.ring}`} />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Adres e-mail" className={`bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none ${theme.ring}`} />
              <div className="sm:col-span-2"><textarea value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Szczegóły kontaktu, osoba decyzyjna, notatki (np. adres instagrama, link do portfolio)..." rows={3} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none resize-none ${theme.ring}`} /></div>
            </div>
            <button onClick={handleSaveVendor} disabled={loading} className={`w-full py-3.5 rounded-xl font-bold shadow-md transition-all ${theme.btn}`}>{loading ? 'Zapisywanie...' : 'Zapisz usługodawcę na liście'}</button>
          </div>
        )}

        {displayVendors.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <Store size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">Brak zapisanych usługodawców</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Kliknij przycisk "Nowy podwykonawca" u góry lub znajdź firmę na mapie, by dodać pierwszą pozycję do swojego planera.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} onUpdate={handleUpdate} onRemove={handleDelete} theme={theme} categories={formCategories} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VendorCard({ vendor, onUpdate, onRemove, theme, categories }: { vendor: any, onUpdate: any, onRemove: any, theme: any, categories: string[] }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...vendor })

  useEffect(() => {
    if (!editing) setForm({ ...vendor })
  }, [vendor, editing])

  async function handleSave() {
    await onUpdate(vendor.id, { name: form.name, category: form.category, price: Number(form.price) || 0, status: form.status, contact: form.contact, phone: form.phone, email: form.email })
    setEditing(false)
  }

  // Zmodyfikowana logika kolorów - uwzględnia status "Polecane"
  const statusColor = form.status === 'Opłacone' || form.status === 'Umowa' || form.status === 'Zaliczka' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
    : form.status === 'Rozmowy' ? 'bg-amber-100 text-amber-700 border-amber-200' 
    : form.status === 'Polecane' ? 'bg-rose-100 text-rose-600 border-rose-200' 
    : 'bg-slate-100 text-slate-600 border-slate-200'

  const isPromo = vendor.id === 'promo-anm'

  if (editing) {
    return (
      <div className={`bg-white border-2 rounded-2xl p-5 shadow-sm animate-in fade-in ${theme.border}`}>
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800">Edytuj wizytówkę</h4>
          <button onClick={() => onRemove(vendor.id)} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"><Trash2 size={14} /> Usuń firmę</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field-input font-bold" placeholder="Nazwa firmy" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="field-input">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400 text-xs font-bold">PLN</span>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={`w-full py-2 outline-none text-sm font-bold ${theme.textTheme}`} placeholder="Całkowity koszt" />
          </div>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="field-input font-bold">
            {isPromo && <option value="Polecane">✨ Polecane</option>}
            <option value="Szukam">🔍 Szukam / Wycena</option><option value="Rozmowy">💬 W trakcie rozmów</option><option value="Umowa">📝 Podpisana umowa</option><option value="Zaliczka">💸 Zaliczka wpłacona</option><option value="Opłacone">✅ W pełni opłacone</option>
          </select>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="field-input" placeholder="Telefon" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="field-input" placeholder="Email" />
          <textarea value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="field-input sm:col-span-2" placeholder="Osoba kontaktowa, notatki..." rows={3} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${theme.btn}`}>Zapisz zmiany</button>
          <button onClick={() => setEditing(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold transition-all">Anuluj</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col sm:flex-row justify-between gap-4 ${isPromo ? 'border-rose-200 shadow-sm bg-gradient-to-r from-white to-rose-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-transparent ${theme.bgLight} ${theme.textTheme}`}>{vendor.category}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${statusColor}`}>
            {vendor.status === 'Polecane' ? '✨ Polecany Wpis' : (vendor.status || 'Szukam')}
          </span>
        </div>
        <h4 className="text-lg font-black text-slate-800 mb-1">{vendor.name}</h4>
        
        {vendor.price > 0 && <div className={`text-sm font-black mb-3 ${theme.textTheme}`}>Koszt: {vendor.price.toLocaleString()} zł</div>}
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          {vendor.phone && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <Phone size={12} className="text-slate-400" /> {vendor.phone}
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <Mail size={12} className="text-slate-400" /> {vendor.email}
            </div>
          )}
        </div>
        
        {vendor.contact && (
          <div className={`mt-4 text-xs p-3 rounded-xl border whitespace-pre-wrap ${isPromo ? 'bg-rose-50/40 border-rose-100 text-rose-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            <strong className={`${isPromo ? 'text-rose-900' : 'text-slate-700'}`}>Szczegóły:</strong><br />{vendor.contact}
          </div>
        )}
      </div>
      <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
        <button onClick={() => setEditing(true)} className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"><Edit3 size={14} /> Edytuj firmę</button>
      </div>
    </div>
  )
}

// ============================================================================
// KOMPONENTY POMOCNICZE EKIPA
// ============================================================================
function EventSwitcher({ currentId, router, theme, supabase }: { currentId: string, router: any, theme: any, supabase: any }) {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('events').select('id, title, type').eq('user_id', user.id).order('created_at', { ascending: false })
      setEvents(data || [])
    }
    load()
  }, [supabase])

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
      {events.map(ev => {
        const isSelected = ev.id === currentId;
        return (
          <button 
            key={ev.id} 
            onClick={() => router.push(`/dashboard/events/${ev.id}`)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              isSelected 
                ? 'bg-white/95 text-slate-900 border-white/50 shadow-md scale-105' 
                : `bg-transparent border-transparent ${theme.textMain} opacity-70 hover:opacity-100 hover:bg-white/20`
            }`}
          >
            <span className={isSelected ? 'drop-shadow-sm' : ''}>{EVENT_EMOJIS[ev.type] || '✨'}</span>
            <span>{ev.title}</span>
          </button>
        )
      })}
    </div>
  )
}

function StatusBadge({ label, active, onClick, theme }: { label: string, active: boolean, onClick: () => void, theme: any }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black transition-all border-2 ${active ? `${theme.bgCard} ${theme.border} text-white shadow-md` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>{label}</button>
  )
}

// ============================================================================
// ZAKŁADKA MUZYKA
// ============================================================================
function MusicTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [songs, setSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDjModal, setShowDjModal] = useState(false)
  const [djList, setDjList] = useState<any[]>([])
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')
  
  // Stan dla wysyłki do DJ-a
  const [listToSend, setListToSend] = useState<any[]>([])

  // Stan dla Spotify
  const [spotifyUrl, setSpotifyUrl] = useState(event?.spotify_url || '')
  const [savingSpotify, setSavingSpotify] = useState(false)
  const [showSpotifyHelp, setShowSpotifyHelp] = useState(false) // Stan dla instrukcji Spotify

  const [showPromoModal, setShowPromoModal] = useState(false)
  
  // NASZ NOWY MÓZG (Hook z pakietami)
  const { canImportFromWeb, loading: planLoading } = useEventPlan(eventId)
  const hasSite = !!event?.invitation_url
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  useEffect(() => {
    async function loadMusic() {
      const { data } = await supabase.from('playlist').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      if (data) setSongs(data)
    }
    loadMusic()
  }, [eventId, supabase])

  async function handleAddSong() {
    if (!artist || !title) return
    setLoading(true)
    const newSong = { event_id: eventId, artist, title, added_by: 'Para Młoda', source: 'wlasna' }
    const { data, error } = await supabase.from('playlist').insert([newSong]).select().single()
    if (error) {
      alert(`Błąd zapisu! Komunikat: ${error.message}`)
    } else if (data) {
      setSongs([data, ...songs])
    }
    setArtist(''); setTitle('')
    setLoading(false)
  }

  async function handleDeleteSong(id: string) {
    if (!confirm('Usunąć ten utwór z listy?')) return
    await supabase.from('playlist').delete().eq('id', id)
    setSongs(songs.filter(s => s.id !== id))
  }

  async function handleOpenDjModal(list: any[]) {
    setListToSend(list)
    setShowDjModal(true)
    const { data } = await supabase.from('vendors').select('*').eq('event_id', eventId).eq('category', 'Muzyka')
    setDjList(data || [])
  }

  function sendToDJ(djEmail: string, djName: string) {
    let listText = "Przekazujemy listę utworów:\n\n"
    listToSend.forEach((s, idx) => { listText += `${idx + 1}. ${s.artist} - ${s.title} (od: ${s.added_by})\n` })
    const subject = encodeURIComponent('Playlista weselna - ' + event.title)
    const body = encodeURIComponent(`Cześć ${djName}!\n\nPrzesyłamy nasze muzyczne zestawienie:\n\n${listText}\n\nPozdrawiamy!`)
    window.location.href = `mailto:${djEmail}?subject=${subject}&body=${body}`
    setShowDjModal(false)
  }

  function printPlaylist(listToPrint: any[], listTitle: string) {
    const w = window.open('', '_blank')
    if (!w) { alert("Zezwól na wyskakujące okienka (pop-upy), aby wydrukować listę."); return }
    
    let listHtml = listToPrint.map((s, i) => `
      <li style="margin-bottom: 8px;">
        <strong>${s.title}</strong> - ${s.artist} 
        <span style="font-size: 11px; color: #666; margin-left: 6px;">(od: ${s.added_by})</span>
      </li>
    `).join('')

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wydruk Playlisty - ${listTitle}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
          h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; }
          ul { list-style-type: decimal; padding-left: 20px; font-size: 14px; line-height: 1.6; }
          .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <h1>${listTitle}</h1>
        <ul>${listHtml}</ul>
        <div class="footer">Wydrukowano z aplikacji ANM Planner</div>
      </body>
      </html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  async function saveSpotify() {
    setSavingSpotify(true)
    const { error } = await supabase.from('events').update({ spotify_url: spotifyUrl }).eq('id', eventId)
    if (error) alert("Błąd zapisu Spotify: " + error.message)
    else alert("Playlista Spotify zapisana pomyślnie! 🎧")
    setSavingSpotify(false)
  }

  const getSpotifyEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('/embed/')) return url;
    const cleanUrl = url.split('?')[0]; 
    return cleanUrl.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/');
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  const embedUrl = getSpotifyEmbedUrl(spotifyUrl)
  const mySongs = songs.filter(s => s.source === 'wlasna')
  const guestSongs = songs.filter(s => s.source === 'gosc')

  if (planLoading) return <div className="text-center py-10 animate-pulse text-slate-400 font-bold">Ładowanie muzyki...</div>

  return (
    <div className="space-y-8 print:space-y-4 animate-in fade-in duration-500 relative">
      
      {/* ODPIĘTY NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Music /> Zarządzaj Muzyką</h3>
          <p className="text-sm text-slate-500 mt-1">Twórz własną playlistę i przeglądaj propozycje od gości.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => alert('Dzięki! Utwory zapisują się w bazie na bieżąco. 🎶')} className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> Zapisz w planerze
          </button>
          {hasSite ? (
            <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Zobacz swoją stronę
            </a>
          ) : (
            <button onClick={() => setShowPromoModal(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Opublikuj na WWW
            </button>
          )}
        </div>
      </div>

      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Zbieraj muzyczne hity od swoich gości!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zrób swoją playlistę marzeń w planerze. A jeśli stworzysz z nami Stronę Zaproszeniową, Twoi goście podczas wypełniania formularza RSVP będą mogli zaproponować własne piosenki, które z automatu wpadną prosto do tego panelu!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Interaktywna playlista ze stroną WWW</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Super! Na Twojej stronie zaproszeniowej działa pole, w którym goście podczas RSVP przesyłają Wam dedykacje muzyczne. Tutaj stworzysz też własną listę z hitami. Gdy skończycie, wystarczy jedno kliknięcie, aby wydrukować gotową listę lub wysłać ją prosto mailem do DJ-a!
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* SEKCJA SPOTIFY */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden print:hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <h4 className="text-xl font-black flex items-center gap-2 mb-2 text-emerald-400">
              <span className="bg-emerald-500 text-slate-900 p-1.5 rounded-full"><Music size={16} /></span> 
              Integracja ze Spotify
            </h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Masz już gotową playlistę na Spotify? Wklej link do niej poniżej, aby mieć do niej szybki dostęp prosto ze swojego planera.
            </p>

            <button 
              onClick={() => setShowSpotifyHelp(!showSpotifyHelp)} 
              className="text-xs text-emerald-500 hover:text-emerald-400 mb-4 flex items-center gap-1 font-bold transition-colors"
            >
              <Info size={14} /> Jak pobrać link do playlisty ze Spotify?
            </button>

            {showSpotifyHelp && (
              <div className="bg-slate-800 rounded-xl p-4 mb-5 border border-slate-700 text-sm text-slate-300 animate-in fade-in slide-in-from-top-2">
                <p className="font-bold text-white mb-2">Krok po kroku:</p>
                <ol className="list-decimal list-inside space-y-1.5 ml-1">
                  <li>Otwórz aplikację <strong>Spotify</strong> (na telefonie lub komputerze).</li>
                  <li>Wejdź w swoją publiczną playlistę.</li>
                  <li>Kliknij ikonę trzech kropek (<strong>...</strong>).</li>
                  <li>Wybierz <strong>Udostępnij</strong>.</li>
                  <li>Kliknij <strong>Skopiuj link do playlisty</strong>.</li>
                  <li>Wklej skopiowany link w pole poniżej i zapisz!</li>
                </ol>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                value={spotifyUrl} 
                onChange={e => setSpotifyUrl(e.target.value)} 
                placeholder="Wklej link (np. https://open.spotify.com/...)" 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-colors text-white placeholder:text-slate-500" 
              />
              <button 
                onClick={saveSpotify} 
                disabled={savingSpotify} 
                className="px-6 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 transition-all whitespace-nowrap"
              >
                {savingSpotify ? 'Zapisuję...' : 'Podłącz Spotify'}
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 shrink-0">
            {embedUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 h-[152px] bg-slate-800 relative">
                <iframe 
                  src={embedUrl} 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="absolute inset-0"
                ></iframe>
              </div>
            ) : (
              <div className="h-[152px] border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Music size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Brak podłączonej playlisty</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        
        {/* LEWA KOLUMNA: WŁASNA PLAYLISTA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
            <h4 className="font-black text-slate-800 flex items-center gap-2"><Sparkles size={18} className={theme.textTheme} /> Nasza Playlista</h4>
            {mySongs.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => printPlaylist(mySongs, 'Nasza Playlista')} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"><Printer size={14} /> Drukuj</button>
                <button onClick={() => handleOpenDjModal(mySongs)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${theme.btn}`}><Send size={14} /> Wyślij do DJ-a</button>
              </div>
            )}
          </div>
          
          <div className={`flex flex-col gap-3 mb-6 p-4 rounded-2xl border border-transparent ${theme.bgLight} print:hidden`}>
            <div className="flex flex-col xl:flex-row gap-3">
              <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Wykonawca" className={`flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none ${theme.ring}`} />
              <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSong()} placeholder="Tytuł utworu" className={`flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none ${theme.ring}`} />
            </div>
            <button onClick={handleAddSong} disabled={loading} className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${theme.btn}`}>{loading ? 'Dodawanie...' : 'Dodaj utwór do listy'}</button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-2">
            {mySongs.length === 0 ? <p className="text-sm text-slate-400 text-center py-6">Brak dodanych utworów.</p> : (
              mySongs.map((song, idx) => (
                <div key={song.id || idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                    <div><p className="text-sm font-black text-slate-800 leading-tight">{song.title}</p><p className="text-xs text-slate-500 font-medium">{song.artist}</p></div>
                  </div>
                  <button onClick={() => handleDeleteSong(song.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all print:hidden"><Trash2 size={16} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRAWA KOLUMNA: PROPOZYCJE GOŚCI */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col h-full print:border-none print:shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
            <h4 className="font-black text-slate-800 flex items-center gap-2"><Users size={18} className={theme.textTheme} /> Propozycje Gości</h4>
            {canImportFromWeb && guestSongs.length > 0 && (
              <div className="flex gap-2 relative z-30">
                <button onClick={() => printPlaylist(guestSongs, 'Propozycje Muzyczne od Gości')} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"><Printer size={14} /> Drukuj</button>
                <button onClick={() => handleOpenDjModal(guestSongs)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${theme.btn}`}><Send size={14} /> Wyślij do DJ-a</button>
              </div>
            )}
          </div>

          {!canImportFromWeb && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm print:hidden">
              <PremiumLock 
                feature="Pobieranie muzyki ze strony" 
                description="Goście mogą sami proponować piosenki przez formularz na Twojej stronie WWW. Zostaną one automatycznie pobrane do tego planera! Aktywuj pakiet PRO, aby to odblokować." 
                eventId={eventId}
              />
            </div>
          )}
          
          <div className={`space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-2 ${!canImportFromWeb ? 'opacity-20 select-none pointer-events-none filter grayscale-[80%]' : ''}`}>
            {guestSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center mt-10">
                <UserCircle size={32} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Goście nie dodali jeszcze żadnych propozycji.</p>
                {canImportFromWeb && <p className="text-xs text-slate-400 mt-1">Czekamy na wpisanie przez gościa pierwszego utworu.</p>}
              </div>
            ) : (
              guestSongs.map((song, idx) => (
                <div key={song.id || idx} className="flex justify-between items-center p-3 bg-slate-50/80 rounded-xl border border-slate-100 group">
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${theme.bgLight} ${theme.textTheme}`}><Music size={12} /></span>
                    <div><p className="text-sm font-black text-slate-800 leading-tight">{song.title}</p><p className="text-xs text-slate-600 font-medium">{song.artist}</p><p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Od: {song.added_by}</p></div>
                  </div>
                  {canImportFromWeb && <button onClick={() => handleDeleteSong(song.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all print:hidden"><Trash2 size={16} /></button>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: WYŚLIJ DO DJ-a */}
      {showDjModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-slate-800">Wybierz odbiorcę z Ekipy</h3><button onClick={() => setShowDjModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
            {djList.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl"><p className="text-sm text-slate-600 font-medium">Brak dodanych DJ-ów w zakładce "Ekipa".</p><p className="text-xs text-slate-400 mt-1">Dodaj wykonawcę z kategorią "Muzyka", aby wysłać listę.</p></div>
            ) : (
              <div className="space-y-2">
                {djList.map(dj => (
                  <button key={dj.id} onClick={() => sendToDJ(dj.email, dj.name)} disabled={!dj.email} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${dj.email ? `bg-white border-slate-200 ${theme.ring} hover:shadow-md` : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'}`}>
                    <div><p className="font-bold text-slate-800">{dj.name}</p><p className="text-xs text-slate-500">{dj.email || 'Brak adresu e-mail'}</p></div>{dj.email && <Send size={16} className={theme.textTheme} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOWY MODAL: KUP STRONĘ WWW Z KODEM EVENTU */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}



function BudgetTableRow({ item, index, onUpdate, onDelete, theme }: { item: any, index: number, onUpdate: any, onDelete: any, theme: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: item.name,
    estimated_cost: item.estimated_cost,
    paid_amount: item.paid_amount,
    due_date: item.due_date || ''
  })

  const estimated = Number(item.estimated_cost) || 0
  const paid = Number(item.paid_amount) || 0
  const left = Math.max(0, estimated - paid)
  const progressPercent = estimated > 0 ? Math.min(100, Math.round((paid / estimated) * 100)) : 0

  let statusText = "Nierozpoczęte"
  let statusBadge = "bg-slate-100 text-slate-500"

  if (paid >= estimated && estimated > 0) {
    statusText = "Opłacone"
    statusBadge = "bg-emerald-100 text-emerald-700"
  } else if (paid > 0) {
    statusText = "Częściowo"
    statusBadge = "bg-amber-100 text-amber-700"
  }

  // Weryfikacja terminu płatności dla powiadomień
  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && left > 0;
  const isApproaching = item.due_date && new Date(item.due_date) < new Date(Date.now() + 7 * 86400000) && left > 0 && !isOverdue;

  async function handleSave() {
    await onUpdate(item.id, {
      name: form.name,
      estimated_cost: Number(form.estimated_cost),
      paid_amount: Number(form.paid_amount),
      due_date: form.due_date || null
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`p-4 ${theme.bgLight} flex flex-col lg:flex-row gap-3 items-center border-l-4 ${theme.border} print:hidden`}>
        <div className="w-full lg:w-48 font-bold text-slate-700 text-sm truncate">{item.category}</div>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={`w-full lg:flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none ${theme.ring}`} placeholder="Opis" />
        <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={`w-full lg:w-32 bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none text-slate-600 ${theme.ring}`} />
        <div className="flex items-center gap-1 w-full lg:w-32">
          <input type="number" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })} className={`w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold outline-none text-right ${theme.ring}`} placeholder="Koszt" />
          <span className="text-xs font-bold text-slate-400">zł</span>
        </div>
        <div className="flex items-center gap-1 w-full lg:w-32">
          <input type="number" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: e.target.value })} className={`w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold outline-none text-right ${theme.textTheme} ${theme.ring}`} placeholder="Wpłacono" />
          <span className={`text-xs font-bold ${theme.textTheme}`}>zł</span>
        </div>
        <div className="flex gap-2 w-full lg:w-auto justify-end shrink-0">
          <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm ${theme.btn}`}>Zapisz</button>
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Anuluj</button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 hover:bg-slate-50 transition-colors items-center border-b lg:border-none border-slate-100 print:border-b print:break-inside-avoid">
      
      {/* Kolumna 1: Kategoria */}
      <div className="col-span-12 lg:col-span-2 flex items-center justify-between lg:block">
        <span className="lg:hidden text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kategoria:</span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${theme.bgLight} ${theme.textTheme}`}>{item.category}</span>
      </div>

      {/* Kolumna 2: Opis i Termin (z powiadomieniami push UI) */}
      <div className="col-span-12 lg:col-span-3">
        <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
          {item.due_date ? (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-200' : isApproaching ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <CalendarIcon size={10} /> Termin: {item.due_date}
            </span>
          ) : (
            <span className="text-slate-400 italic">Brak terminu</span>
          )}
          {(isOverdue || isApproaching) && (
            <span className={`${isOverdue ? 'text-rose-500 animate-pulse' : 'text-amber-500'} print:hidden`} title="Zbliża się termin płatności!">
              <Bell size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Kolumna 3: Planowany koszt */}
      <div className="col-span-6 lg:col-span-2 text-sm font-black text-slate-700 lg:text-right text-right">
        <span className="lg:hidden block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Planowane</span>
        {estimated.toLocaleString()} zł
      </div>

      {/* Kolumna 4: Wpłacone i Pasek postępu */}
      <div className="col-span-6 lg:col-span-3 flex flex-col lg:items-end justify-center">
        <span className="lg:hidden block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Zapłacone</span>
        <div className="w-full flex items-center lg:justify-end gap-3">
          <div className="flex flex-col flex-1 max-w-[120px]">
            <div className="flex justify-between items-end mb-1">
              <span className={`text-xs font-black ${theme.textTheme}`}>{paid.toLocaleString()} zł</span>
              <span className="text-[9px] font-bold text-slate-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${theme.bgCard}`} style={{ width: `${progressPercent}%` }}></div>
            </div>
            {left > 0 && <div className="text-[9px] font-bold text-rose-500 text-right mt-1 print:hidden">Do spłaty: {left.toLocaleString()}</div>}
          </div>
          <span className={`hidden lg:flex text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full items-center gap-1 shrink-0 print:hidden ${statusBadge}`}>
            {statusText === 'Opłacone' ? <Check size={10} /> : statusText === 'Częściowo' ? <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
            {statusText}
          </span>
        </div>
      </div>

      {/* Kolumna 5: Akcje Desktop (ukryte do druku) */}
      <div className="hidden lg:flex col-span-2 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <button onClick={() => setIsEditing(true)} className={`p-2 hover:bg-slate-100 rounded-xl transition-colors ${theme.textTheme}`} title="Edytuj"><Edit3 size={14} /></button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Usuń"><Trash2 size={14} /></button>
      </div>

      {/* Akcje Mobile (ukryte do druku) */}
      <div className="col-span-12 flex gap-2 mt-2 lg:hidden print:hidden border-t border-slate-100 pt-3">
        <button onClick={() => setIsEditing(true)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><Edit3 size={12} className="inline mr-1"/> Edytuj</button>
        <button onClick={() => onDelete(item.id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100"><Trash2 size={12}/></button>
      </div>
    </div>
  )
}

// ============================================================================
// ZAKŁADKA KAPSUŁKA CZASU
// ============================================================================
function TimeCapsuleTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [capsules, setCapsules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [author, setAuthor] = useState('')
  const [openDate, setOpenDate] = useState('1. rocznica')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ author: '', openDate: '', message: '' })

  const [showPromoModal, setShowPromoModal] = useState(false)
  const hasSite = !!event?.invitation_url
  
  // Nasz Mózg do pakietów
  const { canImportFromWeb, loading: planLoading } = useEventPlan(eventId)

  useEffect(() => {
    async function loadCapsules() {
      const { data } = await supabase.from('time_capsules').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      if (data) setCapsules(data)
    }
    loadCapsules()
  }, [eventId, supabase])

  async function handleAddCapsule() {
    if (!author || !message) return
    setLoading(true)
    const newCapsule = { event_id: eventId, author, open_date: openDate, message, source: 'wlasna' }
    const { data, error } = await supabase.from('time_capsules').insert([newCapsule]).select().single()
    if (error) {
      alert(`Błąd zapisu! Komunikat: ${error.message}`)
      console.error(error)
    } else if (data) {
      setCapsules([data, ...capsules])
    }
    setAuthor(''); setMessage(''); setOpenDate('1. rocznica')
    setLoading(false)
  }

  async function handleDeleteCapsule(id: string) {
    if (!confirm('Na pewno usunąć tę wiadomość z kapsułki?')) return
    await supabase.from('time_capsules').delete().eq('id', id)
    setCapsules(capsules.filter(c => c.id !== id))
  }

  async function handleSaveEdit(id: string) {
    await supabase.from('time_capsules').update({
      author: editForm.author, open_date: editForm.openDate, message: editForm.message
    }).eq('id', id)
    setCapsules(capsules.map(c => c.id === id ? { ...c, author: editForm.author, open_date: editForm.openDate, message: editForm.message } : c))
    setEditingId(null)
  }

  function printCapsule(authorName: string, date: string, msg: string) {
    const w = window.open('', '_blank')
    if (!w) { alert("Zezwól na wyskakujące okienka (pop-upy), aby wydrukować list."); return }

    w.document.write(`<!DOCTYPE html><html><head><title>Kapsułka Czasu</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Playfair+Display&display=swap" rel="stylesheet">
    <style>
      @font-face { font-family:'Angella White'; src:url('https://anmcollective.fun/wp-content/uploads/2026/02/Angella-White-Personal-Use-Only.ttf') format('truetype'); }
      * { box-sizing:border-box; margin:0; padding:0; }
      body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f9f6f1; font-family:'Playfair Display',serif; }
      .card { width:580px; padding:65px; border:7px double #bfa37e; border-radius:18px; text-align:center; color:#3a4739; background:#fff; }
      .top  { font-size:10px; text-transform:uppercase; letter-spacing:4px; color:#bfa37e; margin-bottom:14px; }
      .sub  { font-family:'Angella White',cursive; font-size:2.2rem; color:#3a4739; opacity:.65; margin-bottom:36px; }
      .line { width:55px; height:1px; background:#bfa37e; margin:28px auto; }
      .from { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:600; margin-bottom:30px; }
      .msg  { font-family:'Cormorant Garamond',serif; font-size:1.6rem; line-height:1.75; font-style:italic; color:#2a3329; white-space: pre-wrap; }
      .open { display:inline-block; margin-top:28px; padding:13px 34px; background:#3a4739; color:#fff; border-radius:50px; font-size:11px; letter-spacing:2px; text-transform:uppercase; }
      @media print { body { background:white; } }
    </style></head>
    <body><div class="card">
      <div class="top">Wiadomość z Kapsułki Czasu</div>
      <div class="sub">${event.title || 'Nasze Wesele'} 🌿</div>
      <div class="line"></div>
      <div class="from">Od: ${authorName}</div>
      <div class="msg">"${msg}"</div>
      <div class="line"></div>
      <div class="open">OTWORZYĆ: ${date}</div>
    </div></body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 900)
  }

  const manualCapsules = capsules.filter(c => c.source === 'wlasna')
  const guestCapsules = capsules.filter(c => c.source === 'gosc')

  if (planLoading) return <div className="text-center py-10 animate-pulse text-slate-400 font-bold">Ładowanie kapsuły...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative print:space-y-4">
      
      {/* 1. GŁÓWNY NAGŁÓWEK (Odpięty z sticky) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><MessageCircle /> Kapsułka Czasu</h3>
          <p className="text-sm text-slate-500 mt-1">Piszcie do siebie w przyszłość i zbierajcie życzenia od gości.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => alert('Twoje wpisy zapisują się na bieżąco! 🌿')} className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> Zapisz w planerze
          </button>
          
          {hasSite ? (
            <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Zobacz swoją stronę
            </a>
          ) : (
            <button onClick={() => setShowPromoModal(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Opublikuj na WWW
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER Z DILOMA PRZYCISKAMI */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Listy w przyszłość – od Was i Waszych Gości!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tutaj możesz napisać życzenia i przemyślenia, które przeczytacie za 5, 10 lub 15 lat. Czy wiesz, że po stworzeniu z nami e-zaproszenia, również Twoi goście będą mogli dodawać swoje życzenia prosto do Waszej wirtualnej Kapsuły Czasu za pomocą formularza na stronie?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Twoja Kapsuła Czasu działa na stronie WWW</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                W tym miejscu możesz pisać własne przemyślenia, a także odbierać życzenia od gości z formularza na stronie! Wydrukuj je, zapieczętujcie w kopertach i odczytajcie w wybraną rocznicę.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* CIEKAWOSTKA / INSPIRACJA */}
      <div className={`p-5 rounded-3xl border flex gap-4 items-center animate-in fade-in print:hidden ${theme.bgLight} ${theme.border}`}>
        <div className="text-2xl opacity-70">🍷</div>
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className={theme.textTheme}>Pomysł na Kapsułę:</strong> Po imprezie wydrukujcie wszystkie poniższe listy, kupcie butelkę dobrego wina i zamknijcie je razem w drewnianej skrzynce. Ustalcie wspólnie, że otworzycie ją dopiero na 1., 5. lub 10. rocznicę. To niesamowicie wzruszający wehikuł czasu!
        </p>
      </div>

      {/* 3. GŁÓWNA ZAWARTOŚĆ KAPSUŁY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        
        {/* LEWA: WŁASNE WPISY */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Edit3 size={18} className={theme.textTheme} /> Nasze Wpisy do Kapsuły</h4>

          <div className={`flex flex-col gap-3 mb-6 p-4 rounded-2xl border border-transparent ${theme.bgLight} print:hidden`}>
            <div className="flex flex-col xl:flex-row gap-3">
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Autor wpisu (np. Panna Młoda)" className={`flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none ${theme.ring}`} />
              <input value={openDate} onChange={e => setOpenDate(e.target.value)} placeholder="Kiedy otworzyć? (np. 1. rocznica)" className={`flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none ${theme.ring}`} />
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Wpisz list w przyszłość do samej/samego siebie lub do Was..." rows={3} className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none ${theme.ring}`} />
            <button onClick={handleAddCapsule} disabled={loading} className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${theme.btn}`}>{loading ? 'Zapisywanie...' : 'Zabezpiecz wiadomość w kapsule'}</button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2">
            {manualCapsules.length === 0 ? <p className="text-sm text-slate-400 text-center py-6">Brak własnych wpisów w Kapsule Czasu.</p> : (
              manualCapsules.map((cap) => (
                <div key={cap.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all hover:shadow-md">
                  {editingId === cap.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input value={editForm.author} onChange={e => setEditForm({ ...editForm, author: e.target.value })} className="flex-1 field-input text-xs font-bold" placeholder="Autor" />
                        <input value={editForm.openDate} onChange={e => setEditForm({ ...editForm, openDate: e.target.value })} className="flex-1 field-input text-xs font-bold" placeholder="Data otwarcia" />
                      </div>
                      <textarea value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })} className="w-full field-input text-sm" rows={3} />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg">Anuluj</button>
                        <button onClick={() => handleSaveEdit(cap.id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${theme.btn}`}>Zapisz</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditForm({ author: cap.author, openDate: cap.open_date, message: cap.message }); setEditingId(cap.id) }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteCapsule(cap.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                      <div className="pr-12">
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textAccent}`}>Otworzyć: {cap.open_date}</div>
                        <h5 className="font-black text-slate-800 text-sm mb-2">{cap.author}</h5>
                        <p className="text-sm text-slate-600 italic line-clamp-3">"{cap.message}"</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                        <button onClick={() => printCapsule(cap.author, cap.open_date, cap.message)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-current ${theme.textTheme} ${theme.bgLight}`}>
                          <Printer size={14} /> Drukuj do koperty
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRAWA: ZGŁOSZENIA OD GOŚCI Z PAKIETU PRO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col h-full print:border-none print:shadow-none">
          <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Sparkles size={18} className={theme.textTheme} /> Wiadomości od Gości</h4>
          
          {/* NOWY ZAMEK PAKIETU PRO */}
          {!canImportFromWeb && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm print:hidden">
              <PremiumLock 
                feature="Wiadomości do Kapsuły Czasu z WWW" 
                description="Goście mogą sami przesyłać Wam wzruszające listy w przyszłość za pomocą formularza na stronie e-Zaproszenia. Trafią one od razu tutaj! Odblokuj pakiet PRO." 
                eventId={eventId}
              />
            </div>
          )}
          
          <div className={`space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 ${!canImportFromWeb ? 'opacity-20 select-none pointer-events-none filter grayscale-[80%]' : ''}`}>
            {guestCapsules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center mt-10">
                <MessageCircle size={32} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Twoi goście nie przesłali jeszcze żadnych życzeń.</p>
                {canImportFromWeb && <p className="text-xs text-slate-400 mt-1">Sprawdzaj tę sekcję po wysłaniu zaproszeń do gości!</p>}
              </div>
            ) : (
              guestCapsules.map((cap) => (
                <div key={cap.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 group relative">
                  {canImportFromWeb && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteCapsule(cap.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <div className="pr-12">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Otworzyć: {cap.open_date}</div>
                    <h5 className="font-black text-slate-800 text-sm mb-2">{cap.author}</h5>
                    <p className="text-sm text-slate-600 italic line-clamp-3">"{cap.message}"</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button onClick={() => printCapsule(cap.author, cap.open_date, cap.message)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:bg-white text-slate-600">
                      <Printer size={14} /> Drukuj do koperty
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NOWY MODAL: KUP STRONĘ WWW Z KODEM EVENTU */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(eventId);
                    alert('Skopiowano kod wydarzenia!');
                  }} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================================
// ZAKŁADKA PREZENTY
// ============================================================================
function PresentsTab({ eventId, event, theme, supabase }: {
  eventId: string, event: any, theme: any, supabase: any
}) {
  // Nasz inteligentny hak z pakietami SaaS (CZYŚCIUTKI, BEZ "plan")
  const { isPro, canImportFromWeb, canExportToWeb, loading: planLoading } = useEventPlan(eventId)
  
  const hasSite = !!event?.invitation_url
  const isPremium = canImportFromWeb // Jeśli w pełni połączony dwukierunkowo
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  const [gifts, setGifts] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [reservingSlot, setReservingSlot] = useState<number | null>(null)
  const [reservingName, setReservingName] = useState('')
  const [ibanModal, setIbanModal] = useState<any | null>(null)
  
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => { loadAll() }, [eventId])

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase.from('gifts').select('*').eq('event_id', eventId)
    if (data) {
      const map: Record<string, any> = {}
      data.forEach((g: any) => { map[`${g.type}_${g.slot_id}`] = g })
      setGifts(map)
    }
    setLoading(false)
  }

  async function upsert(type: 'gift' | 'dream', slotId: number, updates: any) {
    const key = `${type}_${slotId}`
    const existing = gifts[key]
    if (existing?.id) {
      const { data } = await supabase.from('gifts').update(updates).eq('id', existing.id).select().single()
      if (data) setGifts(prev => ({ ...prev, [key]: data }))
    } else {
      const { data } = await supabase.from('gifts')
        .insert({ event_id: eventId, type, slot_id: slotId, ...updates })
        .select().single()
      if (data) setGifts(prev => ({ ...prev, [key]: data }))
    }
  }

  async function startEdit(type: 'gift' | 'dream', slotId: number) {
    const key = `${type}_${slotId}`
    const existing = gifts[key] || {}
    setEditForm({ ...existing, type, slot_id: slotId })
    setEditingKey(key)
  }

  async function saveEdit() {
    if (!editingKey) return
    const { type, slot_id, ...updates } = editForm
    await upsert(type, slot_id, updates)
    setEditingKey(null)
  }

  async function manualReserve(slotId: number) {
    await upsert('gift', slotId, {
      reserved: true,
      reserved_by: reservingName || 'Gość',
      reserved_at: new Date().toISOString()
    })
    setReservingSlot(null)
    setReservingName('')
  }

  async function unblock(slotId: number) {
    if (!confirm('Odblokować ten prezent?')) return
    await upsert('gift', slotId, { reserved: false, reserved_by: '', reserved_at: null })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  const reservedCount = Object.values(gifts).filter((g: any) => g?.type === 'gift' && g?.reserved).length
  const namedGifts = Object.values(gifts).filter((g: any) => g?.type === 'gift' && g?.name).length

  if (planLoading || loading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Ładowanie prezentów...</div>

  // Deklaracja odpowiedniej plakietki bez użycia słowa "plan"
  let PlanBadge = null
  if (!hasSite) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><User size={12}/> Wersja Darmowa (Zaznaczasz Ręcznie)</span>
  } else if (hasSite && !isPro) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Globe size={12}/> Strona WWW (Bez Rezerwacji Gości)</span>
  } else {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><Crown size={12}/> Pakiet PRO (Auto-Rezerwacja Live)</span>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* 1. GŁÓWNY NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Gift /> Lista Prezentów i Zbiórki</h3>
          <p className="text-sm text-slate-500 mt-1">Zarządzaj wirtualną listą prezentów oraz zbiórkami do kopert.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => alert('Wszystko zapisuje się na bieżąco! 🎁')} className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> Zapisz w planerze
          </button>
          
          {hasSite ? (
            <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Zobacz swoją stronę
            </a>
          ) : (
            <button onClick={() => setShowPromoModal(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Opublikuj na WWW
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Zbuduj listę marzeń dla gości!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zamiast dublujących się żelazek, daj gościom wybór! Wypełnij poniższą listę, a na Waszej Stronie Zaproszeniowej (Pakiet PRO) pojawi się interaktywny moduł rezerwacji. Goście sami zaznaczą, co chcą Wam podarować!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Twoja lista prezentów działa na żywo!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Każdy dodany cel finansowy i prezent automatycznie pojawia się na Waszej stronie. W pakiecie PRO, gdy gość kliknie 'Zarezerwuj', prezent w tym planerze natychmiast się zablokuje, a Ty zobaczysz, kto go wybrał.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. PODSUMOWANIE REZERWACJI Z AKTYWNYM UPSELL DO STRIPE */}
      <div className={`rounded-3xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${theme.bgLight} ${theme.border}`}>
        <div>
          <h2 className={`text-2xl font-black ${theme.textTheme}`}>Stan rezerwacji 🎁</h2>
          <p className={`text-sm mt-1 text-slate-600`}>
            Zarezerwowano <strong>{reservedCount}</strong> z {namedGifts} dodanych prezentów.
          </p>
        </div>
        
        {isPro ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 shadow-sm shrink-0">
            <Zap size={16} /> Auto-Rezerwacje Aktywne
          </div>
        ) : (
          <button 
            disabled={upgrading}
            onClick={async () => {
              if (!hasSite) {
                setShowPromoModal(true);
              } else {
                setUpgrading(true);
                try {
                  const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId })
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else alert('Błąd: ' + data.error);
                } catch (e) {
                  alert('Wystąpił błąd z połączeniem.');
                }
                setUpgrading(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-xs sm:text-sm font-bold text-amber-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 shrink-0 text-left"
          >
            {upgrading ? (
              <span className="animate-pulse">Przekierowywanie do płatności...</span>
            ) : (
              <>
                <Lock size={16} className="text-amber-500 shrink-0" /> 
                <span>
                  <span className="hidden sm:inline">Auto-rezerwacja aktywna w PRO. </span>
                  <span className="underline decoration-amber-400 underline-offset-2">Przejdź na PRO</span>
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* CELE / KOPERTY */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Heart size={20} className={theme.textTheme} /> Nasze cele — konto do kopert
          </h3>
          {canExportToWeb && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full shadow-sm flex items-center gap-1"><Globe size={12}/> Zsynchronizowano ze stroną</span>}
        </div>
        <p className="text-sm text-slate-500 mb-4">Wypełnij cele, aby goście zamiast bramki płatności zobaczyli elegancki przycisk z numerem konta.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* SLOTY 7 i 8 NA CELE */}
          {[7, 8].map((slot, index) => {
            const key = `dream_${slot}`
            const dream = gifts[key]
            const isEdit = editingKey === key
            return (
              <div key={slot} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative group">
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  {dream?.photo_url
                    ? <img src={dream.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className={`w-full h-full flex items-center justify-center ${theme.bgLight}`}>
                        <Heart size={40} className={`${theme.textTheme} opacity-20`} />
                      </div>
                  }
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md backdrop-blur-md">
                    Cel {index + 1}
                  </div>
                </div>
                <div className="p-5">
                  {isEdit ? (
                    <div className="space-y-2 animate-in fade-in">
                      <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nazwa celu (np. Podróż poślubna)" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none font-bold ${theme.ring}`} />
                      <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Opis... (np. Zbieramy na wyjazd marzeń do Włoch)" rows={2} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none resize-none ${theme.ring}`} />
                      <input value={editForm.photo_url || ''} onChange={e => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="URL zdjęcia ilustrującego" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none ${theme.ring}`} />
                      <div className="flex gap-2">
                        <input value={editForm.account_holder || ''} onChange={e => setEditForm({ ...editForm, account_holder: e.target.value })} placeholder="Odbiorca (Opcjonalnie)" className={`w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none ${theme.ring}`} />
                        <input value={editForm.iban || ''} onChange={e => setEditForm({ ...editForm, iban: e.target.value })} placeholder="Nr konta IBAN" className={`w-1/2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-emerald-400`} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={saveEdit} className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-sm ${theme.btn}`}>Zapisz Cel</button>
                        <button onClick={() => setEditingKey(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Anuluj</button>
                      </div>
                    </div>
                  ) : dream?.name ? (
                    <>
                      <h4 className="font-black text-slate-800 mb-1 text-lg leading-tight">{dream.name}</h4>
                      {dream.description && <p className="text-sm text-slate-500 italic mb-4 line-clamp-2">{dream.description}</p>}
                      {dream.iban && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Numer konta do wpłat</div>
                          <div className="font-mono text-sm font-bold text-slate-800 break-all">{dream.iban}</div>
                          {dream.account_holder && <div className="text-xs text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200">Odbiorca: <strong>{dream.account_holder}</strong></div>}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {dream.iban && (
                          <button onClick={() => setIbanModal({ name: dream.name, iban: dream.iban, account_holder: dream.account_holder })}
                            className={`flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent ${theme.bgLight} ${theme.textTheme} hover:border-current`}>
                            <Copy size={14} /> Kopiuj IBAN
                          </button>
                        )}
                        <button onClick={() => startEdit('dream', slot)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors">
                          <Edit3 size={14} /> Edytuj
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart size={20} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wolne Miejsce</p>
                      <button onClick={() => startEdit('dream', slot)} className={`flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-current ${theme.bgLight} ${theme.textTheme}`}>
                        <Plus size={14} /> Stwórz cel dla gości
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SIATKA PREZENTÓW Z INTELIGENTNĄ ODZNAKĄ PLANU */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Gift size={20} className={theme.textTheme} /> Konkretne Prezenty (Siatka 6)
          </h3>
          {PlanBadge}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(slot => {
            const key = `gift_${slot}`
            const gift = gifts[key]
            const isEdit = editingKey === key
            const isReserved = !!gift?.reserved
            
            return (
              <div key={slot} className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${isReserved ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>
                <div className="relative h-32 bg-slate-50 overflow-hidden group">
                  {gift?.photo_url
                    ? <img src={gift.photo_url} alt="" className={`w-full h-full object-cover transition-transform duration-700 ${isReserved ? 'grayscale-[50%] opacity-80' : 'group-hover:scale-110'}`} />
                    : <div className={`w-full h-full flex items-center justify-center ${theme.bgLight}`}>
                        <Gift size={32} className={`${theme.textTheme} opacity-20`} />
                      </div>
                  }
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md ${theme.bgCard}`}>{slot}</div>
                  
                  {isReserved && (
                    <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Check size={12}/> Zarezerwowany
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {isEdit ? (
                    <div className="space-y-2 animate-in fade-in">
                      <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nazwa prezentu" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-slate-300" />
                      <input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Sklep / Link" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-300" />
                      <input value={editForm.photo_url || ''} onChange={e => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="URL zdjęcia" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-300" />
                      <div className="flex gap-2 pt-2">
                        <button onClick={saveEdit} className={`flex-1 py-2 rounded-lg text-[10px] font-bold shadow-sm ${theme.btn}`}>Zapisz</button>
                        <button onClick={() => setEditingKey(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors">Anuluj</button>
                      </div>
                    </div>
                  ) : gift?.name ? (
                    <>
                      <h4 className="text-sm font-black text-slate-800 mb-1 truncate">{gift.name}</h4>
                      {gift.description && <p className="text-[10px] text-slate-500 italic mb-3 truncate">{gift.description}</p>}
                      
                      {isReserved && gift.reserved_by && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 mb-3">
                          <p className="text-[9px] text-emerald-600 uppercase tracking-wider font-bold mb-0.5">Darczyńca</p>
                          <p className="text-[11px] text-emerald-800 font-bold truncate">👤 {gift.reserved_by}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-auto">
                        {isReserved ? (
                          <button onClick={() => unblock(slot)} className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">Odblokuj</button>
                        ) : (
                          <button onClick={() => setReservingSlot(slot)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border border-transparent hover:border-current ${theme.bgLight} ${theme.textTheme}`}>Ręczna rezerwacja</button>
                        )}
                        <button onClick={() => startEdit('gift', slot)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"><Edit3 size={14} /></button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Slot {slot}</p>
                      <button onClick={() => startEdit('gift', slot)} className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[10px] font-bold transition-all border border-transparent hover:border-current ${theme.bgLight} ${theme.textTheme}`}>
                        <Plus size={12} /> Dodaj Prezent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL RĘCZNEJ REZERWACJI */}
      {reservingSlot !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Lock size={20} className="text-emerald-500"/> Ręczna rezerwacja</h3>
              <button onClick={() => setReservingSlot(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={16} /></button>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Blokujesz prezent</p>
              <p className="text-base font-black text-slate-800">{gifts[`gift_${reservingSlot}`]?.name || `Prezent nr ${reservingSlot}`}</p>
            </div>

            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Darczyńca (Opcjonalnie)</label>
            <input value={reservingName} onChange={e => setReservingName(e.target.value)} placeholder="Wpisz imię i nazwisko gościa"
              className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-bold mb-6 focus:border-emerald-400`} />
            
            <div className="flex gap-2">
              <button onClick={() => manualReserve(reservingSlot)} className={`flex-[2] py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${theme.btn}`}>Zablokuj slot</button>
              <button onClick={() => setReservingSlot(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors">Anuluj</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IBAN */}
      {ibanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-3xl ${theme.bgLight}`}></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Wallet size={20} className={theme.textTheme}/> Dane do przelewu</h3>
              <button onClick={() => setIbanModal(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={16} /></button>
            </div>
            
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wybrany cel</p>
              <p className="text-lg font-black text-slate-800 mb-6">{ibanModal.name}</p>
              
              <div className={`flex flex-col gap-3 bg-white border shadow-inner rounded-2xl p-5 mb-6 ${theme.border}`}>
                <span className="font-mono text-base font-bold text-slate-800 break-all">{ibanModal.iban}</span>
                <button onClick={() => copyToClipboard(ibanModal.iban)} className={`w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md ${theme.bgCard} hover:opacity-90 transition-opacity`}>
                  <Copy size={16} /> Skopiuj Numer Konta
                </button>
              </div>
              
              {ibanModal.account_holder && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Odbiorca Przelewu</span>
                  <span className="text-sm font-bold text-slate-700">{ibanModal.account_holder}</span>
                </div>
              )}
              
              <p className="text-xs text-slate-400 italic">Goście również mogą wygodnie kopiować numer na stronie!</p>
            </div>
          </div>
        </div>
      )}

      {/* NOWY MODAL: KUP STRONĘ WWW Z KODEM EVENTU */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
// ============================================================================
// ZAKŁADKA: VIP (NAJBLIŻSI & EKIPA RATUNKOWA)
// ============================================================================

function VipTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [vips, setVips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [showPromoModal, setShowPromoModal] = useState(false)
  const hasSite = !!event?.invitation_url
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'
  
  const [form, setForm] = useState({
    name: '', role: 'Świadek', email: '', phone: '', description: '', photo_url: '', thank_you_note: ''
  })

  useEffect(() => { loadVips() }, [eventId])

  async function loadVips() {
    setLoading(true)
    const { data } = await supabase.from('vips').select('*').eq('event_id', eventId).order('created_at')
    if (data) setVips(data)
    setLoading(false)
  }

  function resetForm() {
    setForm({ name: '', role: 'Świadek', email: '', phone: '', description: '', photo_url: '', thank_you_note: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function openEdit(vip: any) {
    setForm({ ...vip })
    setEditingId(vip.id)
    setShowForm(true)
  }

  async function saveVip() {
    if (!form.name) return
    
    const payload = { 
      event_id: eventId, 
      name: form.name, 
      role: form.role, 
      email: form.email, 
      phone: form.phone, 
      description: form.description, 
      photo_url: form.photo_url, 
      thank_you_note: form.thank_you_note 
    }
    
    if (editingId) {
      const { data } = await supabase.from('vips').update(payload).eq('id', editingId).select().single()
      if (data) setVips(vips.map(v => v.id === editingId ? data : v))
    } else {
      const { data } = await supabase.from('vips').insert([payload]).select().single()
      if (data) setVips([...vips, data])
    }
    resetForm()
  }

  async function deleteVip(id: string) {
    if (!confirm('Usunąć tę osobę ze składu?')) return
    await supabase.from('vips').delete().eq('id', id)
    setVips(vips.filter(v => v.id !== id))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  function printThankYou(name: string, note: string) {
    const w = window.open('', '_blank')
    if (!w) { alert("Zezwól na pop-upy, aby wydrukować podziękowanie."); return }
    w.document.write(`
      <html><head><title>Podziękowanie - ${name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Playfair+Display&display=swap');
        body { display:flex; justify-content:center; align-items:center; height:100vh; background:#fcfbf9; font-family:'Playfair Display',serif; margin:0; }
        .card { width:600px; padding:60px; border:2px solid #e2e8f0; border-radius:12px; background:white; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        h1 { font-family:'Cormorant Garamond',serif; font-size:3rem; color:#1e293b; margin:0 0 10px 0; }
        .divider { width:50px; height:2px; background:#cbd5e1; margin:20px auto; }
        p { font-size:1.4rem; line-height:1.8; color:#475569; font-style:italic; white-space:pre-wrap; }
        .footer { margin-top:40px; font-size:0.9rem; text-transform:uppercase; letter-spacing:3px; color:#94a3b8; }
      </style></head>
      <body><div class="card">
        <h1>Dla ${name}</h1><div class="divider"></div>
        <p>${note || 'Dziękujemy, że jesteś z nami w tym wyjątkowym dniu!'}</p>
        <div class="footer">Dziękujemy z całego serca</div>
      </div></body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  const handlePublishToWeb = () => {
    if (!hasSite) {
      setShowPromoModal(true);
    } else {
      alert('Zaktualizowano sekcję na stronie WWW! ✨');
    }
  };

  const roleColors: Record<string, string> = {
    'Partner': 'bg-rose-50 text-rose-600',
    'Partnerka': 'bg-pink-50 text-pink-600',
    'Mąż': 'bg-blue-50 text-blue-600',
    'Żona': 'bg-rose-50 text-rose-600',
    'Wnuczek': 'bg-sky-50 text-sky-600',
    'Wnuczka': 'bg-pink-50 text-pink-600',
    'Mama': 'bg-rose-100 text-rose-700',
    'Tata': 'bg-blue-100 text-blue-700',
    'Teściowa': 'bg-rose-100 text-rose-700',
    'Teść': 'bg-blue-100 text-blue-700',
    'Ojczym': 'bg-sky-100 text-sky-700',
    'Macocha': 'bg-pink-100 text-pink-700',
    'Rodzic': 'bg-fuchsia-100 text-fuchsia-700',
    'Babcia': 'bg-amber-100 text-amber-700',
    'Dziadek': 'bg-gray-100 text-gray-700',
    'Ciocia': 'bg-teal-100 text-teal-700',
    'Wujek': 'bg-cyan-100 text-cyan-700',
    'Siostra': 'bg-pink-100 text-pink-700',
    'Brat': 'bg-sky-100 text-sky-700',
    'Córka': 'bg-rose-50 text-rose-600',
    'Syn': 'bg-blue-50 text-blue-600',
    'Dziecko': 'bg-emerald-50 text-emerald-600',
    'Rodzeństwo': 'bg-purple-100 text-purple-700',
    'Świadkowa': 'bg-rose-50 text-rose-600',
    'Świadek': 'bg-blue-50 text-blue-600',
    'Druhna': 'bg-pink-50 text-pink-600',
    'Drużba': 'bg-indigo-50 text-indigo-600',
    'Chrzestna': 'bg-emerald-100 text-emerald-700',
    'Chrzestny': 'bg-teal-100 text-teal-700',
    'Przyjaciółka': 'bg-orange-100 text-orange-700',
    'Przyjaciel': 'bg-orange-100 text-orange-700',
    'Ratownik': 'bg-red-100 text-red-700',
    'Pomocnik': 'bg-emerald-100 text-emerald-700',
    'Starościna': 'bg-amber-50 text-amber-600',
    'Starosta': 'bg-amber-50 text-amber-600',
    'VIP': 'bg-slate-800 text-white',
    'Inne': 'bg-slate-100 text-slate-600'
  }

  const familyRoles = [
    'Partner', 'Partnerka', 'Mąż', 'Żona', 'Mama', 'Tata', 'Teściowa', 'Teść', 
    'Ojczym', 'Macocha', 'Rodzic', 'Babcia', 'Dziadek', 'Wnuczek', 'Wnuczka', 
    'Ciocia', 'Wujek', 'Siostra', 'Brat', 'Rodzeństwo', 'Córka', 'Syn', 'Dziecko', 
    'Przyszła Mama', 'Przyszły Tata'
  ];
  
  const familyGroup = vips.filter(v => familyRoles.includes(v.role));
  const rescueGroup = vips.filter(v => !familyRoles.includes(v.role));

  const renderVipCard = (vip: any) => (
    <div key={vip.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md hover:border-slate-200 flex flex-col h-full">
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => openEdit(vip)} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-lg bg-white shadow-sm border border-slate-100"><Edit3 size={16} /></button>
        <button onClick={() => deleteVip(vip.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg bg-white shadow-sm border border-slate-100"><Trash2 size={16} /></button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        {vip.photo_url ? (
          <img src={vip.photo_url} alt={vip.name} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white shrink-0" />
        ) : (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm text-xl font-black shrink-0 ${theme.bgLight} ${theme.textTheme}`}>{vip.name.charAt(0)}</div>
        )}
        <div className="flex-1">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${roleColors[vip.role] || roleColors['Inne']}`}>{vip.role}</span>
          <h4 className="font-black text-slate-800 text-lg leading-tight mt-1 mb-1">{vip.name}</h4>
          {vip.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic break-words">{vip.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {vip.phone && <div className="text-xs text-slate-500 flex items-center gap-2"><Phone size={12}/> {vip.phone}</div>}
        {vip.email && <div className="text-xs text-slate-500 flex items-center gap-2"><Mail size={12}/> {vip.email}</div>}
      </div>

      <div className="flex-1"></div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <button onClick={() => printThankYou(vip.name, vip.thank_you_note)} className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${theme.bgLight} ${theme.textTheme} hover:opacity-80`}>
          <Printer size={14} /> Drukuj podziękowanie
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><HeartHandshake /> Zarządzanie Osobami</h3>
          <p className="text-sm text-slate-500 mt-1">Koordynuj Najbliższych oraz Ekipę Ratunkową na wydarzeniu.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => alert('Zmiany zapisują się na bieżąco w Twoim planerze! 🌿')} className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> Zapisz w planerze
          </button>
          <button onClick={handlePublishToWeb} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
            <ExternalLink size={16} /> Opublikuj na WWW
          </button>
        </div>
      </div>

      {/* BELKA Z DODAWANIEM OSOBY */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 mt-2">
        <h4 className="font-black text-slate-800 text-lg">Twoi Najbliżsi i Ekipa Ratunkowa</h4>
        <button onClick={() => { resetForm(); setShowForm(true) }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all whitespace-nowrap shrink-0 ${theme.btn}`}>
          <Plus size={16} /> Dodaj Osobę
        </button>
      </div>

      {/* FORMULARZ DODAWANIA / EDYCJI */}
      {showForm && (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-inner animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-slate-800 text-lg">{editingId ? 'Edytuj Osobę' : 'Nowa Osoba'}</h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dane podstawowe</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Imię i Nazwisko *" className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`} />
                  
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`}>
                    <optgroup label="Sekcja: Rodzina">
                      <option value="Partner">Partner</option>
                      <option value="Partnerka">Partnerka</option>
                      <option value="Mąż">Mąż</option>
                      <option value="Żona">Żona</option>
                      <option value="Wnuczek">Wnuczek</option>
                      <option value="Wnuczka">Wnuczka</option>
                      <option value="Mama">Mama</option>
                      <option value="Tata">Tata</option>
                      <option value="Przyszła Mama">Przyszła Mama</option>
                      <option value="Przyszły Tata">Przyszły Tata</option>
                      <option value="Teściowa">Teściowa</option>
                      <option value="Teść">Teść</option>
                      <option value="Ojczym">Ojczym</option>
                      <option value="Macocha">Macocha</option>
                      <option value="Rodzic">Rodzic</option>
                      <option value="Babcia">Babcia</option>
                      <option value="Dziadek">Dziadek</option>
                      <option value="Ciocia">Ciocia</option>
                      <option value="Wujek">Wujek</option>
                      <option value="Siostra">Siostra</option>
                      <option value="Brat">Brat</option>
                      <option value="Rodzeństwo">Rodzeństwo</option>
                      <option value="Córka">Córka</option>
                      <option value="Syn">Syn</option>
                      <option value="Dziecko">Dziecko</option>
                    </optgroup>
                    <optgroup label="Sekcja: Ekipa Ratunkowa">
                      <option value="Świadkowa">Świadkowa</option>
                      <option value="Świadek">Świadek</option>
                      <option value="Druhna">Druhna</option>
                      <option value="Drużba">Drużba</option>
                      <option value="Chrzestna">Chrzestna</option>
                      <option value="Chrzestny">Chrzestny</option>
                      <option value="Przyjaciółka">Przyjaciółka</option>
                      <option value="Przyjaciel">Przyjaciel</option>
                      <option value="Ratownik">Ratownik</option>
                      <option value="Pomocnik">Pomocnik</option>
                      <option value="Starościna">Starościna</option>
                      <option value="Starosta">Starosta</option>
                      <option value="VIP">VIP</option>
                    </optgroup>
                    <option value="Inne">Inne</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="E-mail (opcjonalnie)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Telefon" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Wizytówka (jeśli masz stronę WWW)</label>
                <input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} placeholder="Link do zdjęcia (URL) np. https://..." className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 mb-3 text-sm outline-none ${theme.ring}`} />
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Zadania dla ratownika / Krótki opis na stronę..." rows={2} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none ${theme.ring}`} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Podziękowania do druku</label>
                <textarea value={form.thank_you_note} onChange={e => setForm({...form, thank_you_note: e.target.value})} placeholder="Wpisz osobiste podziękowania... Wydrukujesz je jako piękną kartę." rows={3} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none ${theme.ring}`} />
              </div>
            </div>

          </div>

          <div className="mt-6 flex gap-3 pt-6 border-t border-slate-200">
            <button onClick={saveVip} className={`px-8 py-3 rounded-xl font-black text-sm shadow-lg transition-all transform hover:-translate-y-0.5 ${theme.btn}`}>Zapisz Osobę</button>
            <button onClick={resetForm} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all">Anuluj</button>
          </div>
        </div>
      )}

      {/* LISTA OSÓB */}
      {loading ? (
        <div className="text-center py-10 animate-pulse text-slate-400 font-bold">Ładowanie składu...</div>
      ) : vips.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <HeartHandshake size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-bold text-lg">Brak dodanych osób</p>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">Dodaj rodzinę lub ratowników, by lepiej zarządzać wydarzeniem.</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* WIDŻET: RODZINA (NAJBLIŻSI) */}
          {familyGroup.length > 0 && (
            <div>
              <h4 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 mt-4">
                <Users size={20} className={theme.textTheme} /> Widżet: Rodzina (Najbliżsi)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyGroup.map(vip => renderVipCard(vip))}
              </div>
            </div>
          )}

          {/* WIDŻET: EKIPA RATUNKOWA */}
          {rescueGroup.length > 0 && (
            <div>
              <h4 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 mt-4">
                <LifeBuoy size={20} className={theme.textTheme} /> Widżet: Ekipa Ratunkowa (Świadkowie, Pomocnicy, Przyjaciele)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rescueGroup.map(vip => renderVipCard(vip))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL KODU EVENTU (PROMO) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">{eventId}</code>
                <button onClick={() => copyToClipboard(eventId)} className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0" title="Kopiuj"><Copy size={18} /></button>
              </div>
            </div>
            <a href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowPromoModal(false)} className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}>
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
// ============================================================================
// NOWA ZAKŁADKA: WSPOMNIENIA (GALERIA)
// ============================================================================

 function GalleryTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<any | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)

  // Nasz Mózg do pakietów i stron
  const hasSite = !!event?.invitation_url
  
  // Zastąp to swoimi właściwymi hookami, jeśli używasz useEventPlan
  // const { canImportFromWeb, loading: planLoading } = useEventPlan(eventId)
  const canImportFromWeb = true; // Placeholder
  const planLoading = false; // Placeholder

  useEffect(() => { loadMemories() }, [eventId])

  async function loadMemories() {
    setLoading(true)
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (data) setMemories(data)
    setLoading(false)
  }

  async function addMemory() {
    if (!newUrl.trim()) return
    setAdding(true)
    const isVideo = newUrl.match(/\.(mp4|mov|avi|webm)/i) || newUrl.includes('video')
    await supabase.from('memories').insert([{
      event_id: eventId,
      added_by: newName || 'Para Młoda',
      file_url: newUrl,
      file_type: isVideo ? 'video/mp4' : 'image/jpeg'
    }])
    setNewUrl('')
    setNewName('')
    await loadMemories()
    setAdding(false)
  }

  async function deleteMemory(id: string) {
    if (!confirm('Usunąć to wspomnienie?')) return
    await supabase.from('memories').delete().eq('id', id)
    setMemories(memories.filter(m => m.id !== id))
  }

  const guestMemories = memories.filter(m => m.added_by !== 'Para Młoda')
  const myMemories = memories.filter(m => m.added_by === 'Para Młoda')
  const videos = memories.filter(m => m.file_type?.includes('video'))
  const photos = memories.filter(m => !m.file_type?.includes('video'))

  function getThumb(url: string, isVideo: boolean) {
    if (!url.includes('cloudinary')) return url
    if (isVideo) {
      return url
        .replace('/video/upload/', '/video/upload/w_400,h_400,c_fill,so_2/')
        .replace(/\.(mp4|mov|avi|webm)$/, '.jpg')
    }
    return url.replace('/upload/', '/upload/w_400,c_scale/')
  }

  // Funkcja wymuszająca pobieranie pliku bezpośrednio na dysk użytkownika
  const forceDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation(); 
    e.preventDefault();

    const downloadUrl = url.includes('cloudinary') 
      ? url.replace('/upload/', `/upload/fl_attachment:${filename.split('.')[0]}/`) 
      : url;

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Błąd pobierania, fallback to window.open', error);
      window.open(downloadUrl, '_blank');
    }
  }

  const getFilename = (memory: any, index: number) => {
    const isVideo = memory.file_type?.includes('video');
    const ext = isVideo ? 'mp4' : 'jpg';
    const safeName = (memory.added_by || 'Gosc').replace(/[^a-zA-Z0-9]/g, '_');
    return `wspomnienie_${safeName}_${index + 1}.${ext}`;
  }

  if (planLoading) return <div className="text-center py-10 animate-pulse text-slate-400 font-bold">Ładowanie galerii...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative print:space-y-4">

      {/* 1. NAGŁÓWEK ODPIĘTY (brak sticky) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Camera /> Wspomnienia i Multimedia</h3>
          <p className="text-sm text-slate-500 mt-1">Zdjęcia i filmy od gości oraz Wasze własne pamiątki.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={loadMemories} className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
            <Download size={16} /> Odśwież z bazy
          </button>
          
          {hasSite ? (
            <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Zobacz swoją stronę
            </a>
          ) : (
            <button onClick={() => setShowPromoModal(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <ExternalLink size={16} /> Opublikuj na WWW
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER (ZALEŻNY OD STRONY WWW) */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Tu pojawiają się wspomnienia z Twojej strony WWW!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Goście mogą przesyłać zdjęcia i filmy bezpośrednio ze swoich telefonów — wszystko trafia automatycznie tutaj. Jeśli nie masz jeszcze strony, zamów e-zaproszenie i odblokuj tę funkcję!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Strefa Uploadu na Twojej stronie WWW</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Znakomicie! Udostępnij gościom kod QR do swojej strony po evencie, a wszystkie wgrane przez nich zdjęcia i filmy od razu pojawią się na tej liście.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* STATYSTYKI */}
      {memories.length > 0 && (
        <div className={`flex items-center justify-between rounded-2xl px-6 py-4 shadow-sm ${theme.bgLight}`}>
          <div className="flex gap-6">
            <div className="text-center">
              <p className={`text-2xl font-black ${theme.textTheme}`}>{memories.length}</p>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${theme.textTheme}`}>Wszystkich</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black ${theme.textTheme}`}>{photos.length}</p>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${theme.textTheme}`}>Zdjęć</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black ${theme.textTheme}`}>{videos.length}</p>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${theme.textTheme}`}>Filmów</p>
            </div>
          </div>
        </div>
      )}

      {/* ŻARÓWECZKA - INFO O POBIERANIU */}
      {memories.length > 0 && (
        <div className={`p-5 rounded-3xl border flex gap-4 items-center shadow-sm animate-in fade-in slide-in-from-top-4 ${theme.bgLight} ${theme.border}`}>
          <div className="text-2xl opacity-70">💡</div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className={theme.textTheme}>Jak pobierać pliki?</strong> Kliknij w dowolne zdjęcie lub film, aby je powiększyć i odtworzyć – na dole znajdziesz przycisk <strong>Pobierz</strong>. Na komputerze możesz też po prostu najechać kursorem na miniaturkę i kliknąć ikonkę chmurki ze strzałką!
          </p>
        </div>
      )}

      {/* 3. WSPOMNIENIA OD GOŚCI Z BLOKADĄ PRO */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col min-h-[300px]">
        <h4 className={`font-black text-lg mb-4 flex items-center gap-2 ${theme.textTheme}`}>
          <Users size={20} /> Wspomnienia od gości ({guestMemories.length})
        </h4>

        {!canImportFromWeb && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm print:hidden">
            {/* ODKOMENTUJ JEŚLI UŻYWASZ PremiumLock
            <PremiumLock 
              feature="Galeria zdjęć i filmów od Gości" 
              description="Goście mogą sami wgrywać zdjęcia i filmy ze swoich telefonów bezpośrednio do Twojej galerii. Po evencie pobierzesz je wszystkie z tego miejsca! Aktywuj pakiet PRO." 
              eventId={eventId}
            /> 
            */}
          </div>
        )}

        <div className={`flex-1 ${!canImportFromWeb ? 'opacity-20 select-none pointer-events-none filter grayscale-[80%]' : ''}`}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : guestMemories.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Camera size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium text-sm">Brak wspomnień od gości</p>
              <p className="text-xs text-slate-400 mt-1">Pojawią się tutaj gdy goście prześlą zdjęcia przez stronę WWW</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {guestMemories.map((m, idx) => {
                const isVideo = m.file_type?.includes('video')
                const thumb = getThumb(m.file_url, isVideo)
                const filename = getFilename(m, idx)

                return (
                  <div key={m.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer" onClick={() => setLightbox({ ...m, filename })}>
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 relative">
                        {thumb && <img src={thumb} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />}
                        <div className="relative z-10 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-slate-800 ml-1" />
                        </div>
                      </div>
                    ) : (
                      <img src={thumb} className="w-full h-full object-cover" alt={m.added_by} />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold truncate">{m.added_by}</p>
                    </div>
                    {canImportFromWeb && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => forceDownload(e, m.file_url, filename)} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-colors shadow-sm">
                          <Download size={14} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteMemory(m.id) }} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MOJE WSPOMNIENIA */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${theme.textTheme}`}>
          <ImageIcon size={20} /> Nasze wspomnienia ({myMemories.length})
        </h4>
        <p className="text-sm text-slate-500 mb-5">Dodaj własne zdjęcia i filmy z wydarzenia — linki z Cloudinary, Google Photos lub innego serwisu.</p>

        {/* FORMULARZ DODAWANIA */}
        <div className={`flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl ${theme.bgLight}`}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Opis (opcjonalnie)"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="Wklej link do zdjęcia lub filmu (URL)"
            className="flex-[2] bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <button onClick={addMemory} disabled={adding || !newUrl.trim()} className={`px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${theme.btn} disabled:opacity-50`}>
            {adding ? 'Dodaję...' : 'Dodaj'}
          </button>
        </div>

        {myMemories.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium text-sm">Brak własnych wspomnień</p>
            <p className="text-xs text-slate-400 mt-1">Dodaj linki do swoich zdjęć i filmów z tego dnia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myMemories.map((m, idx) => {
              const isVideo = m.file_type?.includes('video')
              const thumb = getThumb(m.file_url, isVideo)
              const filename = getFilename(m, idx)

              return (
                <div key={m.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer" onClick={() => setLightbox({ ...m, filename })}>
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 relative">
                      {thumb && <img src={thumb} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />}
                      <div className="relative z-10 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-slate-800 ml-1" />
                      </div>
                    </div>
                  ) : (
                    <img src={thumb} className="w-full h-full object-cover" alt={m.added_by} />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => forceDownload(e, m.file_url, filename)} className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-colors shadow-sm">
                      <Download size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteMemory(m.id) }} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white shadow-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
            <X size={28} />
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            {lightbox.file_type?.includes('video') ? (
              <video src={lightbox.file_url} controls autoPlay playsInline className="w-full max-h-[80vh] rounded-2xl" />
            ) : (
              <img src={lightbox.file_url} className="w-full max-h-[80vh] object-contain rounded-2xl" alt="" />
            )}
            <div className="flex items-center justify-between mt-3">
              <p className="text-white font-bold">{lightbox.added_by}</p>
              
              <button 
                onClick={(e) => forceDownload(e, lightbox.file_url, lightbox.filename || 'wspomnienie.jpg')} 
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                <Download size={16} /> Pobierz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOWY MODAL: KUP STRONĘ WWW Z KODEM EVENTU */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(eventId);
                    alert('Skopiowano kod wydarzenia!');
                  }} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================================
// NOWA ZAKŁADKA: STOŁY (USADZENIE GOŚCI) — INTERAKTYWNY PLAN SALI
// ============================================================================

function TablesTab({ eventId, theme, supabase }: { eventId: string, theme: any, supabase: any }) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // --- DANE ---
  const [tables, setTables] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dbMode, setDbMode] = useState<'supabase' | 'local'>('supabase')

  // --- UI STATE ---
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showNames, setShowNames] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  // WYSUWANY PANEL (Drawer)
  const [activeDrawer, setActiveDrawer] = useState<'tables' | 'guests' | null>(null)

  // Panel gości
  const [guestSearch, setGuestSearch] = useState('')
  const [guestFilter, setGuestFilter] = useState<'all' | 'unseated' | 'seated'>('unseated')

  // "W ręce" — aktualnie trzymany gość (click-to-seat)
  const [pickedGuestId, setPickedGuestId] = useState<string | null>(null)

  // --- DRAG STATE (Tylko do przesuwania stołów po mapie) ---
  const dragRef = useRef<{ id: string, offsetX: number, offsetY: number, moved: boolean } | null>(null)
  const [isDraggingTable, setIsDraggingTable] = useState(false)

  // --- BIBLIOTEKA KSZTAŁTÓW ---
  const SHAPES = [
    { id: 'round-s',  name: 'Okrągły mały',     shape: 'round',     width: 110, height: 110, capacity: 4  },
    { id: 'round-m',  name: 'Okrągły średni',   shape: 'round',     width: 150, height: 150, capacity: 8  },
    { id: 'round-l',  name: 'Okrągły duży',     shape: 'round',     width: 190, height: 190, capacity: 12 },
    { id: 'square',   name: 'Kwadratowy',       shape: 'square',    width: 110, height: 110, capacity: 4  },
    { id: 'rect-s',   name: 'Prostokąt 6 os.',  shape: 'rectangle', width: 180, height: 90,  capacity: 6  },
    { id: 'rect-l',   name: 'Prostokąt 10 os.', shape: 'rectangle', width: 260, height: 90,  capacity: 10 },
    { id: 'head',     name: 'Stół prezydialny', shape: 'head',      width: 320, height: 75,  capacity: 8  },
  ]

  // ==========================================================================
  // WCZYTYWANIE
  // ==========================================================================
  useEffect(() => { loadAll() }, [eventId])

  async function loadAll() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('event_tables').select('*').eq('event_id', eventId).order('created_at')
      if (error) throw error
      setTables(data || [])
      setDbMode('supabase')
    } catch (e) { setDbMode('local') }

    try {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('name')
      if (data) setGuests(data)
    } catch (e) {}
    setLoading(false)
  }

  // ==========================================================================
  // POMOCNICZE
  // ==========================================================================
  function screenToCanvas(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left + canvas.scrollLeft) / zoom,
      y: (clientY - rect.top + canvas.scrollTop) / zoom
    }
  }

  function getInitials(name?: string) {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  function getShortName(name?: string, max = 14) {
    if (!name) return ''
    if (name.length <= max) return name
    const parts = name.trim().split(/\s+/)
    if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
    return name.slice(0, max - 1) + '…'
  }

  function getSeatPositions(table: any) {
    const positions: { number: number, cx: number, cy: number, side?: string }[] = []
    const cap = table.capacity || 0
    const gap = 18

    if (table.shape === 'round') {
      for (let i = 0; i < cap; i++) {
        const angle = (i / cap) * Math.PI * 2 - Math.PI / 2
        const radius = table.width / 2 + gap
        const cx = table.width / 2 + Math.cos(angle) * radius
        const cy = table.height / 2 + Math.sin(angle) * radius
        positions.push({ number: i + 1, cx, cy, side: cy > table.height / 2 ? 'bottom' : 'top' })
      }
    } else if (table.shape === 'square') {
      const perSide = Math.max(1, Math.floor(cap / 4))
      const remainder = cap - perSide * 4
      const counts = [perSide, perSide, perSide, perSide]
      for (let i = 0; i < remainder; i++) counts[i]++
      let num = 1
      for (let i = 0; i < counts[0]; i++) { const t = (i + 1) / (counts[0] + 1); positions.push({ number: num++, cx: t * table.width, cy: -gap, side: 'top' }) }
      for (let i = 0; i < counts[1]; i++) { const t = (i + 1) / (counts[1] + 1); positions.push({ number: num++, cx: table.width + gap, cy: t * table.height, side: 'right' }) }
      for (let i = 0; i < counts[2]; i++) { const t = (i + 1) / (counts[2] + 1); positions.push({ number: num++, cx: t * table.width, cy: table.height + gap, side: 'bottom' }) }
      for (let i = 0; i < counts[3]; i++) { const t = (i + 1) / (counts[3] + 1); positions.push({ number: num++, cx: -gap, cy: t * table.height, side: 'left' }) }
    } else {
      const topCount = Math.ceil(cap / 2)
      const bottomCount = cap - topCount
      let num = 1
      for (let i = 0; i < topCount; i++)    { const cx = ((i + 1) / (topCount + 1)) * table.width;    positions.push({ number: num++, cx, cy: -gap, side: 'top' }) }
      for (let i = 0; i < bottomCount; i++) { const cx = ((i + 1) / (bottomCount + 1)) * table.width; positions.push({ number: num++, cx, cy: table.height + gap, side: 'bottom' }) }
    }
    return positions
  }

  // ==========================================================================
  // CRUD STOŁÓW
  // ==========================================================================
  async function addTable(shape: any) {
    const canvas = canvasRef.current
    // Lekki losowy offset, by stoły nie dodawały się idealnie w tym samym pikselu
    const offsetX = Math.floor(Math.random() * 40) - 20
    const offsetY = Math.floor(Math.random() * 40) - 20
    
    // Dodajemy na środek aktualnego widoku
    const centerX = canvas ? (canvas.clientWidth / zoom) / 2 - shape.width / 2 + canvas.scrollLeft / zoom + offsetX : 200
    const centerY = canvas ? (canvas.clientHeight / zoom) / 2 - shape.height / 2 + canvas.scrollTop / zoom + offsetY : 200

    const newTable: any = {
      event_id: eventId,
      name: `Stół ${tables.length + 1}`,
      shape: shape.shape,
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      width: shape.width,
      height: shape.height,
      rotation: 0,
      capacity: shape.capacity,
      color: '#ffffff'
    }

    // Zamknij panel boczny!
    setActiveDrawer(null)

    if (dbMode === 'supabase') {
      try {
        const { data, error } = await supabase.from('event_tables').insert([newTable]).select().single()
        if (error) throw error
        setTables(t => [...t, data]); setSelectedId(data.id); return
      } catch (e) { setDbMode('local') }
    }
    const localT = { ...newTable, id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    setTables(t => [...t, localT]); setSelectedId(localT.id)
  }

  async function updateTable(id: string, updates: any) {
    setTables(curr => curr.map(t => t.id === id ? { ...t, ...updates } : t))
    if (dbMode === 'supabase' && !String(id).startsWith('local-')) {
      try { await supabase.from('event_tables').update(updates).eq('id', id) } catch (e) {}
    }
  }

  async function deleteTable(id: string) {
    if (!confirm('Usunąć ten stół? Przypisani goście zostaną odwołani z miejsc.')) return
    const seatedHere = guests.filter(g => g.table_id === id)
    for (const g of seatedHere) await unassignGuest(g.id, false)

    setTables(curr => curr.filter(t => t.id !== id))
    if (selectedId === id) setSelectedId(null)
    if (dbMode === 'supabase' && !String(id).startsWith('local-')) {
      try { await supabase.from('event_tables').delete().eq('id', id) } catch (e) {}
    }
  }

  function rotateTable(id: string) {
    const t = tables.find(x => x.id === id); if (!t) return
    updateTable(id, { rotation: ((t.rotation || 0) + 90) % 360 })
  }

  async function changeCapacity(id: string, delta: number) {
    const t = tables.find(x => x.id === id); if (!t) return
    const newCap = Math.max(2, Math.min(20, (t.capacity || 8) + delta))
    const overflow = guests.filter(g => g.table_id === id && g.seat_number && g.seat_number > newCap)
    for (const g of overflow) await unassignGuest(g.id, false)
    updateTable(id, { capacity: newCap })
  }

  // ==========================================================================
  // DRAG STOŁÓW PO PLANSZY
  // ==========================================================================
  function handleTablePointerDown(e: React.PointerEvent, table: any) {
    const target = e.target as HTMLElement
    if (target.closest('[data-seat]')) return 
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setSelectedId(table.id)
    const { x, y } = screenToCanvas(e.clientX, e.clientY)
    dragRef.current = { id: table.id, offsetX: x - table.x, offsetY: y - table.y, moved: false }
    setIsDraggingTable(true)
  }

  function handleTablePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const { id, offsetX, offsetY } = dragRef.current
    const { x, y } = screenToCanvas(e.clientX, e.clientY)
    let newX = x - offsetX, newY = y - offsetY
    if (showGrid) {
      newX = Math.round(newX / 20) * 20
      newY = Math.round(newY / 20) * 20
    }
    newX = Math.max(0, newX); newY = Math.max(0, newY)
    dragRef.current.moved = true
    setTables(curr => curr.map(t => t.id === id ? { ...t, x: newX, y: newY } : t))
  }

  async function handleTablePointerUp() {
    if (!dragRef.current) return
    const { id, moved } = dragRef.current
    dragRef.current = null; setIsDraggingTable(false)
    if (moved) {
      const t = tables.find(x => x.id === id)
      if (t && dbMode === 'supabase' && !String(id).startsWith('local-')) {
        try { await supabase.from('event_tables').update({ x: t.x, y: t.y }).eq('id', id) } catch (e) {}
      }
    }
  }

  // ==========================================================================
  // PRZYPISYWANIE GOŚCI DO MIEJSC
  // ==========================================================================
  async function assignGuestToSeat(guestId: string, tableId: string, seatNumber: number) {
    const occupying = guests.find(g => g.table_id === tableId && g.seat_number === seatNumber && g.id !== guestId)

    setGuests(curr => curr.map(g => {
      if (g.id === guestId) return { ...g, table_id: tableId, seat_number: seatNumber }
      if (occupying && g.id === occupying.id) return { ...g, table_id: null, seat_number: null }
      return g
    }))
    setPickedGuestId(null)

    try {
      if (occupying) await supabase.from('guests').update({ table_id: null, seat_number: null }).eq('id', occupying.id)
      await supabase.from('guests').update({ table_id: tableId, seat_number: seatNumber }).eq('id', guestId)
    } catch (e) { }
  }

  async function unassignGuest(guestId: string, ask = true) {
    if (ask && !confirm('Odwołać gościa z jego miejsca?')) return
    setGuests(curr => curr.map(g => g.id === guestId ? { ...g, table_id: null, seat_number: null } : g))
    if (pickedGuestId === guestId) setPickedGuestId(null)
    try { await supabase.from('guests').update({ table_id: null, seat_number: null }).eq('id', guestId) } catch (e) {}
  }

  function handleSeatClick(table: any, seatNumber: number, occupant: any | undefined) {
    if (pickedGuestId) {
      assignGuestToSeat(pickedGuestId, table.id, seatNumber)
    } else if (occupant) {
      setPickedGuestId(occupant.id)  // Podnosi gościa (żeby przenieść)
    }
  }

  function handleGuestClick(guestId: string) {
    setPickedGuestId(guestId)
    setActiveDrawer(null) // Schowaj panel i pokaż mapę!
  }

  // ==========================================================================
  // DANE POCHODNE
  // ==========================================================================
  const seatedCount = guests.filter(g => g.table_id && g.seat_number).length
  const totalSeats = tables.reduce((s, t) => s + (t.capacity || 0), 0)
  const selectedTable = tables.find(t => t.id === selectedId)
  const pickedGuest = guests.find(g => g.id === pickedGuestId)

  const filteredGuests = guests.filter(g => {
    if (guestSearch && !(g.name || '').toLowerCase().includes(guestSearch.toLowerCase())) return false
    const seated = !!(g.table_id && g.seat_number)
    if (guestFilter === 'unseated' && seated) return false
    if (guestFilter === 'seated' && !seated) return false
    return true
  })

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-[85vh] flex flex-col">

      {/* 1. GŁÓWNY NAGŁÓWEK (Na samej górze) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 print:hidden shrink-0">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}>
              <Utensils /> Interaktywny Plan Stołów
            </h3>
            <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors border border-indigo-100">
              <HelpCircle size={12} /> Instrukcja
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button onClick={() => setZoom(Math.max(0.5, +(zoom - 0.1).toFixed(2)))} className="p-2 hover:bg-white rounded-lg text-slate-600" title="Oddal"><Minus size={14} /></button>
            <span className="text-xs font-black text-slate-700 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, +(zoom + 0.1).toFixed(2)))} className="p-2 hover:bg-white rounded-lg text-slate-600" title="Przybliż"><Plus size={14} /></button>
          </div>
          <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 rounded-xl border transition-colors ${showGrid ? `${theme.bgLight} ${theme.border} ${theme.textTheme}` : 'bg-slate-50 border-slate-200 text-slate-500'}`}><Grid3X3 size={16} /></button>
          <button onClick={() => setShowNames(!showNames)} className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${showNames ? `${theme.bgLight} ${theme.border} ${theme.textTheme}` : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            {showNames ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">{showNames ? 'Imiona' : 'Numery'}</span>
          </button>
          <button onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
            <Printer size={14} /> Drukuj mapę
          </button>
        </div>
      </div>

      {/* 2. GŁÓWNY KONTENER NA PLANSZĘ I PANELE */}
      <div className="relative flex-1 bg-slate-100/50 rounded-3xl border border-slate-200 overflow-hidden print:border-0 print:bg-white">
        
        {/* BANER: TRZYMASZ GOŚCIA (absolutnie na planszy, na samej górze) */}
        {pickedGuest && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-full py-2 px-4 flex items-center gap-3 animate-in slide-in-from-top-4 shadow-xl print:hidden max-w-[90%]">
            <div className="w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-black shadow-inner shrink-0 text-xs">
              {getInitials(pickedGuest.name)}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-black text-slate-800 whitespace-nowrap truncate">
                <span className="font-bold text-amber-600 mr-2">Wskaż krzesło:</span> 
                {pickedGuest.name}
              </p>
            </div>
            <button onClick={() => setPickedGuestId(null)} className="p-1.5 bg-white/80 hover:bg-white text-slate-600 rounded-full border border-amber-200 shadow-sm transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* DOLNY PASEK NARZĘDZI (Floating Action Menu do wysuwania paneli) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-2xl border border-slate-200 flex gap-2 print:hidden w-[90%] sm:w-auto max-w-sm">
          <button 
            onClick={() => setActiveDrawer('tables')}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all ${activeDrawer === 'tables' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            <Shapes size={18} /> Stoły
          </button>
          <div className="w-px bg-slate-200 my-2" />
          <button 
            onClick={() => setActiveDrawer('guests')}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all ${activeDrawer === 'guests' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            <Users size={18} /> Goście
            <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1">{guests.length - seatedCount}</span>
          </button>
        </div>

        {/* WYSUWANY PANEL (DRAWER) */}
        {activeDrawer && (
          <>
            {/* Tło przyciemniające */}
            <div 
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in"
              onClick={() => setActiveDrawer(null)}
            />
            
            {/* Właściwy panel (z lewej strony) */}
            <div className={`absolute top-0 bottom-0 left-0 w-[85%] sm:w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-slate-200 animate-in slide-in-from-left-8 print:hidden`}>
              
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  {activeDrawer === 'tables' ? <><Shapes size={16} className="text-indigo-500" /> Kształty stołów</> : <><Users size={16} className="text-indigo-500" /> Lista gości</>}
                </h4>
                <button onClick={() => setActiveDrawer(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><X size={16}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                
                {/* ZAWARTOŚĆ: STOŁY */}
                {activeDrawer === 'tables' && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                      <strong>Wybierz kształt</strong>. Pojawi się na środku mapy.
                    </p>
                    {SHAPES.map(shape => (
                      <button
                        key={shape.id}
                        onClick={() => addTable(shape)}
                        className="w-full flex items-center gap-3 p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                          {shape.shape === 'round'
                            ? <div className="bg-white border-2 border-slate-400 rounded-full w-8 h-8" />
                            : shape.shape === 'square'
                            ? <div className="bg-white border-2 border-slate-400 rounded-md w-7 h-7" />
                            : shape.shape === 'head'
                            ? <div className="bg-amber-100 border-2 border-amber-400 rounded-md w-10 h-4" />
                            : <div className="bg-white border-2 border-slate-400 rounded-md w-10 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-black text-slate-800">{shape.name}</div>
                          <div className="text-[11px] text-slate-500 font-bold">{shape.capacity} miejsc</div>
                        </div>
                        <Plus size={16} className="text-indigo-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* ZAWARTOŚĆ: GOŚCIE */}
                {activeDrawer === 'guests' && (
                  <div className="flex flex-col h-full">
                    <p className="text-xs text-slate-500 mb-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                      <strong>Kliknij gościa</strong> aby go wziąć. Panel się schowa.
                    </p>
                    
                    <div className="relative mb-3 shrink-0">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={guestSearch}
                        onChange={e => setGuestSearch(e.target.value)}
                        placeholder="Szukaj gościa…"
                        className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold !text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                      />
                    </div>

                    <div className="flex gap-1 mb-3 bg-slate-100 p-1 rounded-lg shrink-0">
                      {(['unseated', 'seated', 'all'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setGuestFilter(f)}
                          className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${guestFilter === f ? `bg-white shadow-sm text-indigo-600` : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {f === 'unseated' ? 'Wolni' : f === 'seated' ? 'Usadzeni' : 'Wszyscy'}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                      {guests.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">Brak gości. Dodaj ich w zakładce Goście.</div>
                      ) : filteredGuests.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">Brak wyników.</div>
                      ) : (
                        filteredGuests.map(g => {
                          const isSeated = !!(g.table_id && g.seat_number)
                          const table = isSeated ? tables.find(t => t.id === g.table_id) : null
                          
                          return (
                            <div
                              key={g.id}
                              onClick={() => handleGuestClick(g.id)}
                              className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group select-none
                                ${isSeated ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}
                              `}
                            >
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm
                                ${isSeated ? 'bg-emerald-400 text-white' : `bg-slate-200 text-slate-600`}`}>
                                {getInitials(g.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-slate-800 truncate leading-tight">{g.name}</div>
                                {isSeated ? (
                                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5 truncate">
                                    <CheckCircle2 size={12} className="shrink-0" />
                                    <span className="truncate">{table?.name} · msce {g.seat_number}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">Czeka na miejsce</div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* WŁAŚCIWY OBSZAR MAPY (CANVAS) */}
        {/* ========================================================= */}
        <div
          ref={canvasRef}
          onPointerMove={handleTablePointerMove}
          onPointerUp={handleTablePointerUp}
          onPointerLeave={handleTablePointerUp}
          onClick={e => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset?.canvasBg === '1') {
              setSelectedId(null)
            }
          }}
          className="absolute inset-0 overflow-auto print:relative print:inset-auto print:overflow-visible"
          style={{
            backgroundColor: '#fafbfc',
            backgroundImage: showGrid ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)' : 'none',
            backgroundSize: showGrid ? `${20 * zoom}px ${20 * zoom}px` : 'auto',
            cursor: isDraggingTable ? 'grabbing' : (pickedGuestId ? 'crosshair' : 'default')
          }}
        >
          {/* Toolbar wybranego stołu (pływający z prawej strony) */}
          {selectedTable && (
            <div className="absolute top-4 right-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-200 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in print:hidden">
              <input
                value={selectedTable.name || ''}
                onChange={e => updateTable(selectedTable.id, { name: e.target.value })}
                className={`px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-black text-indigo-900 outline-none w-full sm:w-40`}
              />
              <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 justify-center">
                <button onClick={() => changeCapacity(selectedTable.id, -1)} className="p-2 hover:bg-white rounded-lg text-slate-600"><Minus size={14} /></button>
                <span className="text-xs font-black text-slate-700 w-12 text-center">{selectedTable.capacity} os.</span>
                <button onClick={() => changeCapacity(selectedTable.id, 1)} className="p-2 hover:bg-white rounded-lg text-slate-600"><Plus size={14} /></button>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => rotateTable(selectedTable.id)} className="p-2.5 flex-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 border border-slate-200 flex justify-center" title="Obróć">
                  <RotateCw size={16} />
                </button>
                <button onClick={() => deleteTable(selectedTable.id)} className="p-2.5 flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 flex justify-center" title="Usuń">
                  <Trash2 size={16} />
                </button>
                <div className="w-px bg-slate-200 mx-1 hidden sm:block" />
                <button onClick={() => setSelectedId(null)} className="p-2.5 flex-1 bg-white hover:bg-slate-100 rounded-xl text-slate-400 flex justify-center" title="Zamknij">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div
            data-canvas-bg="1"
            style={{
              position: 'relative',
              width: `${1600 * zoom}px`, // Większa mapa do pracy
              height: `${1200 * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Empty state */}
            {tables.length === 0 && !loading && (
              <div data-canvas-bg="1" className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none print:hidden opacity-50">
                <Shapes size={64} className="text-slate-300 mb-4" />
                <p className="text-slate-400 font-black text-xl">Mapa jest pusta</p>
                <p className="text-sm text-slate-400 mt-2">Rozpocznij od przycisku "Stoły" na dole.</p>
              </div>
            )}

            {/* RENDEROWANIE STOŁÓW */}
            {tables.map(table => {
              const isSelected = selectedId === table.id
              const isRound = table.shape === 'round'
              const isHead = table.shape === 'head'
              const rotation = table.rotation || 0
              const tableGuestsCount = guests.filter(g => g.table_id === table.id).length

              return (
                <div
                  key={table.id}
                  onPointerDown={e => handleTablePointerDown(e, table)}
                  style={{
                    position: 'absolute', left: table.x, top: table.y, width: table.width, height: table.height,
                    transform: `rotate(${rotation}deg)`, transformOrigin: 'center center',
                    zIndex: isSelected || (dragRef.current?.id === table.id) ? 20 : 10,
                    touchAction: 'none'
                  }}
                  className="group select-none"
                >
                  {/* SIEDZENIA */}
                  {getSeatPositions(table).map(seat => {
                    const occupant = guests.find(g => g.table_id === table.id && g.seat_number === seat.number)
                    const labelBelow = seat.side === 'bottom' || (seat.side === undefined && seat.cy > table.height / 2)
                    
                    // Highlight miejsca gdy trzymamy gościa (łatwy cel do upuszczenia)
                    const isDroppableTarget = pickedGuestId && !occupant

                    return (
                      <div
                        key={seat.number}
                        data-seat="1"
                        onClick={e => { e.stopPropagation(); handleSeatClick(table, seat.number, occupant) }}
                        style={{
                          position: 'absolute', left: seat.cx - 16, top: seat.cy - 16, // Lekko większy obszar kliknięcia
                          transform: `rotate(${-rotation}deg)`, transformOrigin: 'center center'
                        }}
                        className="w-8 h-8 cursor-pointer z-10"
                      >
                        <div className={`
                          w-full h-full rounded-full border-2 shadow-sm flex items-center justify-center font-black text-[10px] transition-all
                          ${occupant 
                            ? (pickedGuestId === occupant.id ? 'bg-amber-400 border-white text-white scale-110 ring-2 ring-amber-300' : 'bg-emerald-500 border-emerald-400 text-white hover:scale-110')
                            : (isDroppableTarget 
                                ? 'bg-amber-100 border-amber-400 text-amber-700 hover:scale-125 animate-pulse' 
                                : 'bg-white border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600')
                          }
                        `}>
                          {occupant ? getInitials(occupant.name) : seat.number}
                        </div>

                        {/* Etykieta imienia / numeru */}
                        {(showNames || occupant) && (
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none px-1.5 py-0.5 rounded text-[9px] font-black leading-tight
                              ${occupant ? 'bg-white/95 text-slate-800 border border-emerald-200 shadow-sm' : 'bg-slate-100/90 text-slate-500 border border-slate-200'}`}
                            style={{ top: labelBelow ? 34 : -24 }}
                          >
                            {occupant ? <><span className="text-emerald-600 mr-1">{seat.number}.</span>{getShortName(occupant.name)}</> : <span>{seat.number}</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* BLAT STOŁU */}
                  <div className={`
                    absolute inset-0 flex items-center justify-center transition-all
                    ${isDraggingTable ? '' : 'cursor-grab active:cursor-grabbing'}
                    ${isRound ? 'rounded-full' : 'rounded-xl'}
                    ${isSelected ? 'ring-4 ring-indigo-400 ring-offset-2 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                    ${isHead ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400' : 'bg-white border-2 border-slate-300'}
                  `}>
                    <div className="text-center pointer-events-none px-2" style={{ transform: `rotate(${-rotation}deg)` }}>
                      <div className={`text-sm font-black truncate max-w-full leading-tight ${isHead ? 'text-amber-900' : 'text-slate-800'}`}>{table.name}</div>
                      <div className={`text-[10px] font-black uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block ${tableGuestsCount === table.capacity ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {tableGuestsCount} / {table.capacity}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info wskaźnikowe dla druku */}
        <div className="hidden print:block mt-6 text-xs text-slate-600 w-full p-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4">
            <div><strong className="text-slate-800">Zaproszonych:</strong> {guests.length} os.</div>
            <div><strong className="text-slate-800">Usadzonych:</strong> {seatedCount} os.</div>
            <div><strong className="text-slate-800">Wolnych miejsc:</strong> {totalSeats - seatedCount}</div>
          </div>
        </div>

      </div>

      {/* MODAL POMOCY */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X size={16} /></button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><HelpCircle size={20} className="text-indigo-500" /></div>
              <h3 className="text-xl font-black text-slate-800">Jak usadzać gości?</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
                <p><strong className="text-slate-800">Dodaj stoły:</strong> Kliknij menu "Stoły" na dole, wybierz kształt, a pojawi się on na planszy.</p>
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
                <p><strong className="text-slate-800">Rozmieść stoły:</strong> Przesuwaj je palcem (lub myszką) po mapie. Po kliknięciu stołu, z prawej na górze masz opcje zmiany wielkości i obrotu.</p>
              </div>
              <div className="flex gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                <p><strong className="text-slate-800">Usadzaj gości:</strong> Kliknij na dole "Goście", wybierz osobę. Zobaczysz żółty komunikat "Wskaż krzesło". Wtedy po prostu kliknij wolne miejsce przy wybranym stole.</p>
              </div>
              <div className="flex gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
                <p><strong className="text-slate-800">Szybkie poprawki:</strong> Chcesz przenieść gościa, który już siedzi? Kliknij go na planszy. Podniesiesz go z krzesła. Teraz po prostu kliknij inne puste miejsce!</p>
              </div>
            </div>
            <button onClick={() => setShowHelpModal(false)} className={`w-full mt-6 py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}>Rozumiem, dzięki!</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ZAKŁADKA: ORGANIZACJA (HARMONOGRAM, INFO, MENU)
// ============================================================================
function OrganizationTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [info, setInfo] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  
  // Stany formularzy
  const [newSchedule, setNewSchedule] = useState({ time: '', title: '' });
  const [newInfo, setNewInfo] = useState({ title: '', description: '' });
  const [newMenu, setNewMenu] = useState({ category: 'Danie Główne', dish_name: '', description: '' });

  // Stany modali
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const hasSite = !!event?.invitation_url;
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  useEffect(() => { loadData(); }, [eventId]);

  async function loadData() {
    const [sReq, iReq, mReq] = await Promise.all([
      supabase.from('schedule_items').select('*').eq('event_id', eventId).order('time'),
      supabase.from('info_items').select('*').eq('event_id', eventId).order('created_at'),
      supabase.from('menu_items').select('*').eq('event_id', eventId).order('created_at')
    ]);
    if (sReq.data) setSchedule(sReq.data);
    if (iReq.data) setInfo(iReq.data);
    if (mReq.data) setMenu(mReq.data);
  }

  // --- DODAWANIE (Domyślnie trafia do szkiców) ---
  async function addSchedule() {
    if (!newSchedule.time || !newSchedule.title) return;
    const { data } = await supabase.from('schedule_items').insert([{ event_id: eventId, is_public: false, ...newSchedule }]).select().single();
    if (data) { setSchedule([...schedule, data].sort((a, b) => a.time.localeCompare(b.time))); setNewSchedule({ time: '', title: '' }); }
  }

  async function addInfo() {
    if (!newInfo.title || !newInfo.description) return;
    if (info.length >= 4) {
      alert('Możesz dodać maksymalnie 4 najważniejsze informacje dla gości!');
      return;
    }
    const { data } = await supabase.from('info_items').insert([{ event_id: eventId, is_public: false, ...newInfo }]).select().single();
    if (data) { setInfo([...info, data]); setNewInfo({ title: '', description: '' }); }
  }

  async function addMenu() {
    if (!newMenu.dish_name) return;
    const { data } = await supabase.from('menu_items').insert([{ event_id: eventId, is_public: false, ...newMenu }]).select().single();
    if (data) { setMenu([...menu, data]); setNewMenu({ ...newMenu, dish_name: '', description: '' }); }
  }

  // --- LOGIKA PUBLIKACJI POJEDYNCZYCH ELEMENTÓW ---
  async function handleItemPublishToggle(table: string, id: string, currentStatus: boolean, setter: any, list: any[]) {
    // Jeśli użytkownik nie ma strony, nie może opublikować elementu - pokazujemy mu modal zachęcający do zakupu
    if (!hasSite && !currentStatus) {
      setShowPromoModal(true);
      return;
    }
    const newStatus = !currentStatus;
    await supabase.from(table).update({ is_public: newStatus }).eq('id', id);
    setter(list.map(item => item.id === id ? { ...item, is_public: newStatus } : item));
  }

  // --- USUWANIE ---
  async function deleteItem(table: string, id: string, setter: any, list: any[]) {
    if (!confirm('Na pewno usunąć ten element?')) return;
    await supabase.from(table).delete().eq('id', id);
    setter(list.filter(item => item.id !== id));
  }

  // --- AKCJE PRZYCISKÓW GŁÓWNYCH ---
  const handlePublishToWeb = () => {
    if (!hasSite) {
      setShowPromoModal(true);
    } else {
      window.open(event.invitation_url, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. GŁÓWNY NAGŁÓWEK (Odpięty) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><CalendarDays /> Organizacja i Menu</h3>
            <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors border border-indigo-100">
              <HelpCircle size={12} /> Jak to działa?
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">Twórz różne warianty planu wydarzenia i wybierz, co chcesz opublikować.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button onClick={() => alert('Wszystkie zmiany i szkice zapisują się na bieżąco w Twoim planerze! 🌿')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all">
            <Save size={16} /> Zapisz w planerze
          </button>
          
          <button onClick={handlePublishToWeb} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
            <ExternalLink size={16} /> {hasSite ? 'Zobacz stronę' : 'Opublikuj na WWW'}
          </button>
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER (ŻARÓWKA) */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>To Twój prywatny szkicownik</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Układaj harmonogram, planuj potrawy i wpisuj notatki dla gości. Utworzysz tu bez limitu różne wersje. A jeśli w przyszłości stworzysz Stronę Wydarzenia, jednym przyciskiem przerzucisz wypracowany plan prosto do internetu!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Zarządzaj tym, co widzą goście</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Twoja strona jest połączona! Możesz tworzyć różne wersje planu (np. Wariant A, Wariant B na wypadek deszczu), a potem za pomocą przycisku 'Opublikuj' decydować, co dokładnie w danej chwili ma wyświetlać się na stronie gości.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* 3. GŁÓWNA ZAWARTOŚĆ */}
      <div className="space-y-8">
        
        {/* ================= HARMONOGRAM ================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className={`text-lg font-black flex items-center gap-2 ${theme.textTheme}`}><Clock size={20} /> Harmonogram Wydarzenia</h3>
              <p className="text-sm text-slate-500 mt-1">Stwórz różne warianty osi czasu i publikuj je jednym kliknięciem.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-wrap sm:flex-nowrap">
            <input type="time" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} className={`w-full sm:w-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold !text-slate-900 outline-none ${theme.ring}`} />
            <input type="text" placeholder="Nazwa punktu programu..." value={newSchedule.title} onChange={e => setNewSchedule({...newSchedule, title: e.target.value})} onKeyDown={e => e.key === 'Enter' && addSchedule()} className={`w-full sm:flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold !text-slate-900 outline-none ${theme.ring}`} />
            <button onClick={addSchedule} className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold shadow-sm ${theme.btn}`}>Dodaj szkic</button>
          </div>

          {schedule.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">Brak wpisów. Zbuduj pierwszy scenariusz wydarzenia.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {schedule.map(item => (
                <div key={item.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border-2 transition-all group ${item.is_public ? 'border-emerald-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <span className={`font-black text-xl px-3 py-1.5 rounded-xl ${item.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {item.time}
                    </span>
                    <div>
                      <span className={`font-bold block ${item.is_public ? 'text-slate-800' : 'text-slate-500'}`}>{item.title}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-black ${item.is_public ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {item.is_public ? 'Opublikowano na WWW' : 'Tylko dla Ciebie (Szkic)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0">
                    <button 
                      onClick={() => handleItemPublishToggle('schedule_items', item.id, item.is_public, setSchedule, schedule)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.is_public ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                    >
                      {item.is_public ? 'Cofnij publikację' : 'Opublikuj na WWW'}
                    </button>
                    <button onClick={() => deleteItem('schedule_items', item.id, setSchedule, schedule)} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= INFORMACJE (FAQ) ================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className={`text-lg font-black flex items-center gap-2 ${theme.textTheme}`}><Info size={20} /> Ważne Informacje dla Uczestników</h3>
              <p className="text-sm text-slate-500 mt-1">Dojazd, nocleg, prezenty. <strong className="text-rose-500">Uwaga: Na stronie WWW zmieszczą się maksymalnie 4 najważniejsze kafelki.</strong></p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input type="text" placeholder="Tytuł (np. Dojazd i Parking)" value={newInfo.title} onChange={e => setNewInfo({...newInfo, title: e.target.value})} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold !text-slate-900 outline-none ${theme.ring}`} />
            <textarea placeholder="Szczegółowy opis dla gości..." value={newInfo.description} onChange={e => setNewInfo({...newInfo, description: e.target.value})} rows={2} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm !text-slate-900 outline-none resize-none ${theme.ring}`} />
            <button onClick={addInfo} disabled={info.length >= 4} className={`self-end px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${theme.btn} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {info.length >= 4 ? 'Wyczerpano limit (4/4)' : 'Zapisz jako szkic'}
            </button>
          </div>

          {info.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">Brak dodanych informacji organizacyjnych.</div>
          ) : (
            <div className="space-y-4">
              {info.map(item => (
                <div key={item.id} className={`flex flex-col sm:flex-row justify-between items-start bg-white p-5 rounded-2xl border-2 transition-all group ${item.is_public ? 'border-indigo-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  
                  <div className="mb-3 sm:mb-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-black text-base ${item.is_public ? 'text-slate-800' : 'text-slate-500'}`}>{item.title}</h4>
                      <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${item.is_public ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                        {item.is_public ? 'Widoczne na stronie' : 'Szkic w planerze'}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${item.is_public ? 'text-slate-600' : 'text-slate-400'}`}>{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-100 sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                    {hasSite && (
                      <button 
                        onClick={() => handleItemPublishToggle('info_items', item.id, item.is_public, setInfo, info)} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.is_public ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'}`}
                      >
                        {item.is_public ? 'Schowaj' : 'Opublikuj na WWW'}
                      </button>
                    )}
                    <button onClick={() => deleteItem('info_items', item.id, setInfo, info)} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16}/>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= MENU / CATERING ================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className={`text-lg font-black flex items-center gap-2 ${theme.textTheme}`}><Utensils size={20} /> Menu i Catering</h3>
              <p className="text-sm text-slate-500 mt-1">Rozpal apetyt gości dodając potrawy z podziałem na kategorie.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={newMenu.category} onChange={e => setNewMenu({...newMenu, category: e.target.value})} className={`w-full sm:w-1/3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold !text-slate-900 outline-none ${theme.ring}`}>
                <option value="Przystawka">Przystawka</option>
                <option value="Danie Główne">Danie Główne</option>
                <option value="Deser">Deser</option>
                <option value="Kolacja / Ciepły Posiłek">Kolacja / Ciepły Posiłek</option>
                <option value="Bufet">Bufet</option>
                <option value="Napoje i Drink Bar">Napoje i Drink Bar</option>
              </select>
              <input type="text" placeholder="Nazwa dania (np. Krem z białych warzyw)" value={newMenu.dish_name} onChange={e => setNewMenu({...newMenu, dish_name: e.target.value})} className={`w-full sm:w-2/3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold !text-slate-900 outline-none ${theme.ring}`} />
            </div>
            <input type="text" placeholder="Składniki / krótki opis (opcjonalnie)" value={newMenu.description} onChange={e => setNewMenu({...newMenu, description: e.target.value})} onKeyDown={e => e.key === 'Enter' && addMenu()} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm !text-slate-900 outline-none ${theme.ring}`} />
            <button onClick={addMenu} className={`self-end px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm ${theme.btn}`}>Zapisz danie (Szkic)</button>
          </div>

          {menu.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">Twoje Menu jest jeszcze puste.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Przystawka', 'Danie Główne', 'Deser', 'Kolacja / Ciepły Posiłek', 'Bufet', 'Napoje i Drink Bar'].map(cat => {
                const categoryItems = menu.filter(m => m.category === cat);
                if (categoryItems.length === 0) return null;
                return (
                  <div key={cat} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm break-inside-avoid">
                    <div className={`${theme.bgLight} ${theme.textTheme} px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b border-slate-200`}>
                      {cat}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {categoryItems.map(item => (
                        <div key={item.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white transition-colors group ${item.is_public ? 'border-l-4 border-amber-400' : 'border-l-4 border-slate-200'}`}>
                          <div className="mb-3 sm:mb-0 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`font-bold text-sm ${item.is_public ? 'text-slate-800' : 'text-slate-500'}`}>{item.dish_name}</div>
                              <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm ${item.is_public ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                                {item.is_public ? 'Publiczne' : 'Szkic'}
                              </span>
                            </div>
                            {item.description && <div className="text-xs text-slate-500 italic">{item.description}</div>}
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end border-t border-slate-100 sm:border-t-0 pt-2 sm:pt-0">
                            <button 
                              onClick={() => handleItemPublishToggle('menu_items', item.id, item.is_public, setMenu, menu)} 
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.is_public ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'}`}
                            >
                              {item.is_public ? 'Ukryj' : 'Opublikuj'}
                            </button>
                            <button onClick={() => deleteItem('menu_items', item.id, setMenu, menu)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL POMOCY (FAQ JAK DZIAŁAJĄ SZKICE I PUBLIKACJE) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 relative">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X size={16} /></button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><HelpCircle size={20} className="text-indigo-500" /></div>
              <h3 className="text-xl font-black text-slate-800">Jak działają Szkice?</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <p>Tworząc wydarzenie, plany często się zmieniają. Dlatego wprowadziliśmy system tworzenia <strong>Wersji Roboczych</strong>.</p>
              
              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="bg-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-full shrink-0 h-fit mt-0.5">Szkic</span>
                <p>Każdy nowo dodany element (punkt w harmonogramie, danie, notatka) trafia tu domyślnie. Jest widoczny <strong>tylko dla Ciebie</strong> w tym planerze.</p>
              </div>

              <div className="flex gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-full shrink-0 h-fit mt-0.5">Opublikowano</span>
                <p>Gdy klikniesz przycisk <strong>Opublikuj na WWW</strong> przy danym elemencie, natychmiast pojawi się on na Waszej stronie dla uczestników.</p>
              </div>

              <p className="pt-2"><strong className="text-slate-800">Praktyczny przykład:</strong> Możesz ułożyć dwa różne harmonogramy. Jeśli w dniu imprezy (np. plenerowej) będzie padać deszcz, po prostu jednym kliknięciem ukrywasz "Plan A" i publikujesz "Plan B" dla gości!</p>
            </div>
            <button onClick={() => setShowHelpModal(false)} className={`w-full mt-6 py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}>Rozumiem!</button>
          </div>
        </div>
      )}

      {/* MODAL: NIE MASZ STRONY WWW (PROMOCJA) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Zrób to ze Stroną!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Nie masz jeszcze aktywnej Strony Wydarzenia. Stwórz ją z nami, aby w prosty sposób udostępnić gościom ten wspaniały harmonogram, FAQ i przepyszne menu, wprost z Twojego planera!
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// ZAKŁADKA: OŚ WYDARZEŃ I QUIZ (UNIWERSALNA)
// ============================================================================
function StoryTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  // Nasz mądry mózg dla planów (bez słowa "plan")
  const { isPro, loading: planLoading } = useEventPlan(eventId)
  
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Modale
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  const hasSite = !!event?.invitation_url
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  const [form, setForm] = useState({
    year: '', title: '', description: '', photo_url: '', 
    has_quiz: false, quiz_question: '', quiz_answer: '',
    opt1: '', opt2: '', opt3: '', opt4: ''
  })

  useEffect(() => { loadStory() }, [eventId])

  async function loadStory() {
    setLoading(true)
    const { data } = await supabase.from('story_nodes').select('*').eq('event_id', eventId).order('created_at')
    if (data) setNodes(data)
    setLoading(false)
  }

  function resetForm() {
    setForm({ year: '', title: '', description: '', photo_url: '', has_quiz: false, quiz_question: '', quiz_answer: '', opt1: '', opt2: '', opt3: '', opt4: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function openEdit(node: any) {
    const opts = node.quiz_options || ['', '', '', '']
    setForm({ ...node, opt1: opts[0] || '', opt2: opts[1] || '', opt3: opts[2] || '', opt4: opts[3] || '' })
    setEditingId(node.id)
    setShowForm(true)
  }

  async function saveNode() {
    if (!form.year || !form.title) return
    const payload = {
      event_id: eventId, year: form.year, title: form.title, description: form.description, photo_url: form.photo_url,
      has_quiz: form.has_quiz, quiz_question: form.quiz_question, quiz_answer: form.quiz_answer,
      quiz_options: [form.opt1, form.opt2, form.opt3, form.opt4],
      is_public: editingId ? undefined : false // Domyślnie nowe to szkic
    }
    if (editingId) {
      const { data } = await supabase.from('story_nodes').update(payload).eq('id', editingId).select().single()
      if (data) setNodes(nodes.map(n => n.id === editingId ? data : n))
    } else {
      const { data } = await supabase.from('story_nodes').insert([payload]).select().single()
      if (data) setNodes([...nodes, data])
    }
    resetForm()
  }

  // --- ZMIANA STATUSU (PUBLIKACJA / SZKIC) ---
  async function toggleVisibility(id: string, currentStatus: boolean) {
    if (!hasSite && !currentStatus) {
      setShowPromoModal(true);
      return;
    }
    const newStatus = !currentStatus;
    await supabase.from('story_nodes').update({ is_public: newStatus }).eq('id', id);
    setNodes(nodes.map(n => n.id === id ? { ...n, is_public: newStatus } : n));
  }

  async function deleteNode(id: string) {
    if (!confirm('Usunąć ten etap?')) return
    await supabase.from('story_nodes').delete().eq('id', id)
    setNodes(nodes.filter(n => n.id !== id))
  }

  const handlePublishToWeb = () => {
    if (!hasSite) {
      setShowPromoModal(true)
    } else {
      window.open(event.invitation_url, '_blank')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  if (planLoading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Ładowanie zawartości...</div>

  // Deklaracja odpowiedniej plakietki (dla całej sekcji Historii)
  let PlanBadge = null
  if (!hasSite) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><User size={12}/> Wersja Darmowa (Brak Strony)</span>
  } else if (hasSite && !isPro) {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><Globe size={12}/> Pakiet WWW (Standard)</span>
  } else {
    PlanBadge = <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><Crown size={12}/> Pakiet PRO (Premium)</span>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. GŁÓWNY NAGŁÓWEK I PRZYCISKI AKCJI (Odpięte) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><BookOpen /> Oś Wydarzeń i Quiz</h3>
            <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors border border-indigo-100">
              <HelpCircle size={12} /> Jak to działa?
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">Zbuduj oś czasu ze zdjęciami, ważnymi datami i quizem dla uczestników imprezy.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button onClick={() => alert('Zmiany na osi czasu zapisują się w tle! 🌿')} className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> Zapisz w planerze
          </button>
          
          <button onClick={handlePublishToWeb} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
            <ExternalLink size={16} /> {hasSite ? 'Zobacz swoją stronę' : 'Opublikuj na WWW'}
          </button>
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER (ŻARÓWKA) */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Zbieraj tutaj wspomnienia i układaj historię</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Od pierwszego dnia aż do dziś! Dodawaj anegdoty, zdjęcia i twórz pytania quizowe. Gdy połączysz planer ze Stroną Wydarzenia, te etapy staną się piękną, interaktywną osią czasu, z którą goście będą mogli się bawić przed imprezą!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Oś Czasu na żywo na Twojej Stronie WWW</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Świetnie! Możesz teraz utworzyć dowolną ilość kroków, układać quizy tematyczne i samemu wybierać, klikając 'Opublikuj', które etapy uczestnicy zobaczą na stronie wydarzenia.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. BELKA Z DODAWANIEM WYDARZENIA I ODZNAKĄ PLANU */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <h4 className="font-black text-slate-800 text-lg">Zarządzaj Etapami</h4>
          {PlanBadge}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className={`flex items-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all justify-center ${theme.btn}`}>
          <Plus size={16} /> Dodaj nowy etap
        </button>
      </div>

      {/* FORMULARZ DODAWANIA ETAPU */}
      {showForm && (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-inner animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-slate-800 text-lg">{editingId ? 'Edytuj etap' : 'Nowy etap na Osi Czasu'}</h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-lg border border-slate-200"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Szczegóły Etapu</label>
              <div className="grid grid-cols-3 gap-3">
                <input value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="Rok / Data" className={`col-span-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none ${theme.ring}`} />
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Tytuł (np. Start, Wielki dzień)" className={`col-span-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none ${theme.ring}`} />
              </div>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Krótki opis tego wydarzenia lub anegdota..." rows={3} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none ${theme.ring}`} />
              <input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} placeholder="URL zdjęcia z tego okresu (opcjonalnie)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 mb-4">
                <input type="checkbox" checked={form.has_quiz} onChange={e => setForm({...form, has_quiz: e.target.checked})} className="w-5 h-5 rounded text-emerald-500 border-slate-300" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Dodaj pytanie Quizowe do tego etapu</span>
                  <span className="text-xs text-slate-500">Zaskocz uczestników ciekawostką i sprawdź ich wiedzę!</span>
                </div>
              </label>

              {form.has_quiz && (
                <div className="space-y-3 animate-in fade-in">
                  <input value={form.quiz_question} onChange={e => setForm({...form, quiz_question: e.target.value})} placeholder="Pytanie (np. Co wydarzyło się tego dnia?)" className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ${theme.ring}`} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={form.opt1} onChange={e => setForm({...form, opt1: e.target.value})} placeholder="Opcja A" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none" />
                    <input value={form.opt2} onChange={e => setForm({...form, opt2: e.target.value})} placeholder="Opcja B" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none" />
                    <input value={form.opt3} onChange={e => setForm({...form, opt3: e.target.value})} placeholder="Opcja C" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none" />
                    <input value={form.opt4} onChange={e => setForm({...form, opt4: e.target.value})} placeholder="Opcja D" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none" />
                  </div>
                  <select value={form.quiz_answer} onChange={e => setForm({...form, quiz_answer: e.target.value})} className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 text-xs font-bold outline-none">
                    <option value="">-- Wybierz poprawną odpowiedź --</option>
                    {form.opt1 && <option value={form.opt1}>{form.opt1}</option>}
                    {form.opt2 && <option value={form.opt2}>{form.opt2}</option>}
                    {form.opt3 && <option value={form.opt3}>{form.opt3}</option>}
                    {form.opt4 && <option value={form.opt4}>{form.opt4}</option>}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
            <button onClick={saveNode} className={`px-8 py-3 rounded-xl font-black text-sm shadow-lg transition-all ${theme.btn}`}>{editingId ? 'Zapisz zmiany' : 'Zapisz jako szkic'}</button>
            <button onClick={resetForm} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm">Anuluj</button>
          </div>
        </div>
      )}

      {/* LISTA ETAPÓW HISTORII */}
      {loading ? (
        <div className="text-center py-10 animate-pulse text-slate-400 font-bold">Ładowanie osi czasu...</div>
      ) : nodes.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-bold text-lg">Oś czasu jest pusta</p>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">Dodaj pierwszy etap i poprowadź uczestników przez najważniejsze momenty i ciekawostki z historii.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nodes.map((node, index) => (
            <div key={node.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 group transition-colors ${node.is_public ? 'border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
              
              <div className="flex w-full md:w-auto items-center gap-4">
                <div className="w-14 text-center shrink-0">
                  <div className={`text-xs font-black uppercase tracking-wider ${theme.textTheme}`}>Krok</div>
                  <div className="text-2xl font-black text-slate-800">{index + 1}</div>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 relative">
                  {node.photo_url ? (
                    <img src={node.photo_url} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt=""/>
                  ) : (
                    <Camera size={24} className="w-full h-full p-6 sm:p-8 text-slate-300" />
                  )}
                  {node.has_quiz && (
                    <div className="absolute bottom-0 right-0 bg-amber-400 text-white p-1 rounded-tl-lg shadow-sm" title="Zawiera Quiz"><HelpCircle size={12} strokeWidth={3}/></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-50 px-2 py-0.5 rounded-full">{node.year}</div>
                  <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm ${node.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {node.is_public ? 'Na Stronie WWW' : 'Szkic'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-800 leading-tight mb-1">{node.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{node.description}</p>
                {node.has_quiz && <p className="text-xs text-amber-600 font-bold mt-2 truncate">? {node.quiz_question}</p>}
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0 justify-end">
                {hasSite && (
                  <button 
                    onClick={() => toggleVisibility(node.id, node.is_public)} 
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors w-full md:w-auto text-center ${node.is_public ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                  >
                    {node.is_public ? 'Schowaj' : 'Opublikuj'}
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(node)} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex justify-center"><Edit3 size={16}/></button>
                  <button onClick={() => deleteNode(node.id)} className="flex-1 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex justify-center"><Trash2 size={16}/></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL POMOCY */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 relative">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X size={16} /></button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><HelpCircle size={20} className="text-indigo-500" /></div>
              <h3 className="text-xl font-black text-slate-800">Czym jest Oś Wydarzeń?</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <p>Ta sekcja pozwala zbudować interaktywną, przewijaną listę kroków chronologicznych. Do czego możesz jej użyć?</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                <li><strong>Dla Ślubów:</strong> Nasza historia (od pierwszego spotkania do zaręczyn).</li>
                <li><strong>Dla Firm:</strong> Historia powstania firmy lub plan rozwoju.</li>
                <li><strong>Dla Urodzin:</strong> Ważne kroki z dorastania i życia solenizanta.</li>
              </ul>
              
              <div className="flex gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100 mt-4">
                <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-full shrink-0 h-fit mt-0.5">Opcja Quizu</span>
                <p>Każdy krok może mieć "ukryte pytanie". Gość musi odgadnąć poprawną odpowiedź z 4 opcji (A, B, C, D), aby czytać dalej. To świetna gra dla uczestników!</p>
              </div>
            </div>
            <button onClick={() => setShowHelpModal(false)} className={`w-full mt-6 py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}>Wszystko jasne!</button>
          </div>
        </div>
      )}

      {/* MODAL: NIE MASZ STRONY WWW (PROMOCJA) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Zbuduj e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Nie masz jeszcze aktywnej Strony Zaproszeniowej. Skonfiguruj ją z nami, a cała Wasza historia i quiz zostaną tam wygenerowane jako piękny, wciągający moduł!
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${eventId}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 relative z-10 uppercase tracking-wider ${theme.btn}`}
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================================
// BAZA KOLORÓW PRZEWODNICH WYDARZENIA (PONAD 30 ODCIENI!)
// ============================================================================
const EVENT_COLORS = [
  { name: 'Szałwia (Sage Green)', hex: '#9CA986' },
  { name: 'Eukaliptus (Eucalyptus)', hex: '#7D9D9C' },
  { name: 'Butelkowa Zieleń (Emerald)', hex: '#2A3B32' },
  { name: 'Oliwka (Olive)', hex: '#708238' },
  { name: 'Mięta (Mint)', hex: '#98FF98' },
  { name: 'Brudny Róż (Dusty Rose)', hex: '#C08A8A' },
  { name: 'Pudrowy Róż (Blush Pink)', hex: '#FFD1DC' },
  { name: 'Fuksja (Fuchsia)', hex: '#FF00FF' },
  { name: 'Malina (Raspberry)', hex: '#D21F3C' },
  { name: 'Bordo (Burgundy)', hex: '#800020' },
  { name: 'Szampańskie Złoto (Champagne)', hex: '#F7E7CE' },
  { name: 'Klasyczne Złoto (Gold)', hex: '#D4AF37' },
  { name: 'Różowe Złoto (Rose Gold)', hex: '#B76E79' },
  { name: 'Miedź (Copper)', hex: '#B87333' },
  { name: 'Terakota (Terracotta)', hex: '#E2725B' },
  { name: 'Rdza (Rust)', hex: '#B7410E' },
  { name: 'Brzoskwinia (Peach)', hex: '#FFCBA4' },
  { name: 'Musztarda (Mustard)', hex: '#FFDB58' },
  { name: 'Błękit Paryski (Dusty Blue)', hex: '#7A93AC' },
  { name: 'Granat (Navy Blue)', hex: '#000080' },
  { name: 'Chaber (Cornflower)', hex: '#6495ED' },
  { name: 'Lila (Lilac)', hex: '#C8A2C8' },
  { name: 'Śliwka (Plum)', hex: '#8E4585' },
  { name: 'Klasyczna Biel (Pure White)', hex: '#FFFFFF' },
  { name: 'Złamana Biel (Ivory)', hex: '#FFFFF0' },
  { name: 'Ecru', hex: '#C2B280' },
  { name: 'Beż (Beige)', hex: '#F5F5DC' },
  { name: 'Taupe (Szaro-beżowy)', hex: '#483C32' },
  { name: 'Jasny Szary (Light Grey)', hex: '#D3D3D3' },
  { name: 'Antracyt (Charcoal)', hex: '#36454F' },
  { name: 'Czekolada (Chocolate)', hex: '#7B3F00' },
  { name: 'Głęboka Czerń (Black)', hex: '#000000' }
];

function useInspirations(eventId: string, supabase: any) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dbId, setDbId] = useState<string | null>(null)

  const [title, setTitle] = useState('Klimat i Motyw Przewodni')
  const [description, setDescription] = useState('Chcemy, żeby nasze wydarzenie miało wyjątkowy, niezapomniany klimat. Zobaczcie naszą paletę barw!')
  const [colors, setColors] = useState<{ hex: string, name: string }[]>([])
  const [rulesLadies, setRulesLadies] = useState('')
  const [rulesGents, setRulesGents] = useState('')
  const [rulesAvoid, setRulesAvoid] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => { 
    loadInspirations() 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function loadInspirations() {
    setLoading(true)
    const { data } = await supabase.from('inspirations').select('*').eq('event_id', eventId).single()
    if (data) {
      setDbId(data.id)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setColors(data.colors || [])
      setRulesLadies(data.rules_ladies || '')
      setRulesGents(data.rules_gentlemen || '')
      setRulesAvoid(data.rules_avoid || '')
      setImages(data.images || [])
      setIsPublic(data.is_public || false)
    }
    setLoading(false)
  }

  async function saveToDb(publishStatus?: boolean) {
    setSaving(true)
    const finalIsPublic = publishStatus !== undefined ? publishStatus : isPublic;
    
    const payload = {
      event_id: eventId,
      title, description, colors,
      rules_ladies: rulesLadies,
      rules_gentlemen: rulesGents,
      rules_avoid: rulesAvoid,
      images,
      is_public: finalIsPublic
    }

    if (dbId) {
      await supabase.from('inspirations').update(payload).eq('id', dbId)
    } else {
      const { data } = await supabase.from('inspirations').insert([payload]).select().single()
      if (data) setDbId(data.id)
    }
    
    setIsPublic(finalIsPublic)
    setSaving(false)
  }

  const addColor = (hex: string, name: string) => {
    if (!name.trim()) return
    setColors([...colors, { hex, name }])
  }
  const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index))
  
  const addImage = (url: string) => {
    if (!url.trim()) return
    setImages([...images, url])
  }
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index))

  return {
    loading, saving, title, setTitle, description, setDescription,
    colors, addColor, removeColor, rulesLadies, setRulesLadies,
    rulesGents, setRulesGents, rulesAvoid, setRulesAvoid,
    images, addImage, removeImage, saveToDb, isPublic
  }
}

function InspirationsTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  const {
    loading, saving, title, setTitle, description, setDescription,
    colors, addColor, removeColor, rulesLadies, setRulesLadies,
    rulesGents, setRulesGents, rulesAvoid, setRulesAvoid,
    images, addImage, removeImage, saveToDb, isPublic
  } = useInspirations(eventId, supabase)

  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const hasSite = !!event?.invitation_url
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  const handleSaveDraft = async () => {
    await saveToDb(false)
    alert('Zapisano jako szkic w planerze! 🌿')
  }

  const handlePublishToWeb = async () => {
    if (!hasSite) {
      setShowPromoModal(true)
      return
    }
    await saveToDb(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  if (loading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Ładowanie danych...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. NAGŁÓWEK ZAKŁADKI (Odpięty od góry) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Shirt /> Dress Code i Motyw</h3>
            <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors border border-indigo-100">
              <HelpCircle size={12} /> Jak to działa?
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">Ustal zasady ubioru, kolorystykę imprezy i zbieraj inspiracje.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button onClick={handleSaveDraft} disabled={saving} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all`}>
            <Save size={16} /> {saving ? 'Zapisuję...' : 'Zapisz jako szkic'}
          </button>
          
          <button 
            onClick={handlePublishToWeb} 
            disabled={saving} 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${isPublic && hasSite ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : theme.btn}`}
          >
            {isPublic && hasSite ? <Check size={16}/> : <ExternalLink size={16} />} 
            {isPublic && hasSite ? 'Opublikowano na WWW' : 'Opublikuj na WWW'}
          </button>
        </div>
      </div>

      {/* 2. DYNAMICZNY BANER (ŻARÓWECZKA) */}
      <div className="print:hidden">
        {!hasSite ? (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Odblokuj sekcję Dress Code na swojej stronie!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Wszystkie kolory i zasady ubioru, które tu wpiszesz, to na razie Twój prywatny szkic. Jeśli zbudujesz z nami Stronę Wydarzenia, po kliknięciu 'Opublikuj' uczestnicy zobaczą te wytyczne w pięknej, wizualnej formie!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://anmcollective.fun/demo-dworski/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                Zobacz Demo Strony
              </a>
              <button onClick={() => setShowPromoModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Kup e-Zaproszenie
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center animate-in fade-in ${theme.bgLight} ${theme.border}`}>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-2xl">💡</div>
            <div className="flex-1">
              <h4 className={`text-base font-black ${theme.textTheme} mb-2`}>Zarządzasz właśnie swoją stroną WWW</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Świetnie! Twoja strona jest połączona z panelem. Możesz tu testować różne palety kolorów i zmieniać wytyczne. Dopiero gdy klikniesz przycisk 'Opublikuj na WWW', zmiany zaktualizują się na stronie dla gości.
              </p>
            </div>
            <div className="shrink-0">
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap ${theme.btn}`}>
                Otwórz swoją stronę
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. GŁÓWNA SIATKA EDYCJI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEWA KOLUMNA: TEKSTY I ZASADY */}
        <div className="space-y-6">
          <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all ${isPublic ? 'border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Type size={18} className={theme.textTheme}/> Przekaz na stronę WWW</h4>
              <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {isPublic ? 'Opublikowano' : 'Szkic'}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tytuł Sekcji (np. na nagłówku)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Dress Code i Styl" className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Krótki Wstęp / Zachęta</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Napisz kilka słów do gości o klimacie imprezy..." rows={2} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none ${theme.ring}`} />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all ${isPublic ? 'border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Shirt size={18} className={theme.textTheme}/> Konkretne Wskazówki Ubioru</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dla Kobiet</label>
                  <textarea value={rulesLadies} onChange={e => setRulesLadies(e.target.value)} placeholder="np. Zwiewne sukienki, elegancki styl..." rows={3} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none ${theme.ring}`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dla Mężczyzn</label>
                  <textarea value={rulesGents} onChange={e => setRulesGents(e.target.value)} placeholder="np. Jasne garnitury, brak krawata mile widziany..." rows={3} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none ${theme.ring}`} />
                </div>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <label className="text-xs font-black text-rose-700 uppercase tracking-wider mb-1 block">Czego uczestnicy powinni unikać?</label>
                <textarea value={rulesAvoid} onChange={e => setRulesAvoid(e.target.value)} placeholder="np. Jaskrawe neony, sportowe obuwie..." rows={2} className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-rose-400" />
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: KOLORY I PODPOWIEDZI */}
        <div className="space-y-6">
          <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all ${isPublic ? 'border-emerald-200' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Palette size={18} className={theme.textTheme}/> Twoja Paleta Barw</h4>
            </div>
            
            <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-center">
              <div className="text-xl">✨</div>
              <p className="text-[11px] text-blue-700 leading-tight">Wybierz od 4 do 6 kolorów, aby Twoja strona (i stroje gości) wyglądały spójnie.</p>
            </div>

            <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Wybierz kolor przewodni</label>
              <div className="flex gap-3 items-center">
                <select 
                  value={selectedColorIdx} 
                  onChange={e => setSelectedColorIdx(Number(e.target.value))} 
                  className={`flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`}
                >
                  {EVENT_COLORS.map((c, i) => (
                    <option key={i} value={i}>{c.name}</option>
                  ))}
                </select>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shadow-inner border border-slate-200" style={{ backgroundColor: EVENT_COLORS[selectedColorIdx].hex }}></div>
                  <button onClick={() => addColor(EVENT_COLORS[selectedColorIdx].hex, EVENT_COLORS[selectedColorIdx].name)} className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm h-11 ${theme.btn}`}>
                    Dodaj
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
              {colors.length === 0 ? (
                <div className="w-full text-center py-6 text-slate-400 text-sm">
                   Twoja paleta jest jeszcze pusta.
                </div>
              ) : (
                colors.map((color, idx) => (
                  <div key={idx} className="group relative flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full shadow-md border-4 border-white flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-110" style={{ backgroundColor: color.hex }}>
                      <button onClick={() => removeColor(idx)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 size={20}/></button>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-center max-w-[80px] truncate">{color.name.split(' (')[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`${theme.bgLight} p-5 rounded-3xl border ${theme.border} flex gap-4 items-center`}>
            <div className="text-2xl opacity-50">👠</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Pamiętaj, aby dodać informację o podłożu (np. trawa), jeśli planujesz imprezę w plenerze – goście będą wdzięczni za sugestię dotyczącą wygodnego obuwia!"
            </p>
          </div>
        </div>
      </div>

      {/* 4. PRYWATNY MOODBOARD (CAŁA SZEROKOŚĆ) */}
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-6 md:p-10 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">
          Tylko dla Ciebie (Zawsze Prywatne)
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h4 className="text-xl font-black text-slate-800 flex items-center gap-2"><ImageIcon size={22} className="text-slate-400"/> Twoja Tablica Inspiracji (Moodboard)</h4>
            <p className="text-sm text-slate-500 mt-1">Zbieraj linki do zdjęć z Pinteresta, Instagrama lub sklepów. Ta sekcja <strong>nigdy</strong> nie publikuje się na stronie WWW.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex-1 sm:max-w-md">
            <Link size={18} className="text-slate-400 ml-2 shrink-0"/>
            <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addImage(newImageUrl); setNewImageUrl(''); saveToDb(isPublic); } }} placeholder="Wklej adres obrazka (URL)..." className={`flex-1 bg-transparent border-none text-sm outline-none px-2`} />
            <button onClick={() => { addImage(newImageUrl); setNewImageUrl(''); saveToDb(isPublic); }} className={`px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-900 shrink-0`}>Zapisz</button>
          </div>
        </div>

        <div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {images.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white/40 rounded-3xl border border-slate-200 border-dashed">
              <ImageIcon size={48} className="mx-auto text-slate-200 mb-3" />
              <span className="text-base font-bold text-slate-400">Pusta tablica inspiracji</span>
              <p className="text-xs text-slate-400 mt-1">Zacznij zbierać wizualizacje dekoracji i dodatków w jednym miejscu.</p>
            </div>
          ) : (
            images.map((imgUrl, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-sm border border-slate-100 break-inside-avoid bg-white">
                <img src={imgUrl} alt={`Inspiracja ${idx+1}`} className="w-full h-auto object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x400?text=B%C5%82%C4%85d+Linku')} />
                <button onClick={async () => { removeImage(idx); await saveToDb(isPublic); }} className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL POMOCY (FAQ) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 relative">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"><X size={16} /></button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><HelpCircle size={20} className="text-indigo-500" /></div>
              <h3 className="text-xl font-black text-slate-800">Szkice i Prywatność</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <p>Zakładka podzielona jest na dwie wyraźne części:</p>
              
              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xl shrink-0 mt-0.5">🎨</span>
                <p><strong>Zasady i Kolory:</strong> To moduł, który możesz opublikować na stronie dla gości. Jeśli klikniesz "Zapisz jako szkic", zmiany zostaną w planerze, ale strona WWW pozostanie nienaruszona. Dopiero przycisk "Opublikuj na WWW" wysyła te dane w eter!</p>
              </div>

              <div className="flex gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                <span className="text-xl shrink-0 mt-0.5">🔒</span>
                <p><strong>Twoja Tablica Inspiracji (Moodboard):</strong> Miejsce na dole, do wklejania linków ze zdjęciami sukienek, tortów czy dekoracji. <strong>Ta sekcja jest w 100% ukryta przed gośćmi</strong>. Nigdy nie pojawia się na stronie WWW. Służy wyłącznie Tobie.</p>
              </div>
            </div>
            <button onClick={() => setShowHelpModal(false)} className={`w-full mt-6 py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}>Wszystko jasne!</button>
          </div>
        </div>
      )}

      {/* MODAL: NIE MASZ STRONY WWW (PROMOCJA) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-20 rounded-full blur-3xl pointer-events-none ${theme.bgLight}`}></div>
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 relative z-10">
              <Globe size={32} className={theme.textTheme} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Zbuduj e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Nie masz jeszcze aktywnej Strony Zaproszeniowej. To tam Twoi goście zobaczą te wszystkie inspiracje i paletę barw! Zbuduj ją z nami i zachwyć wszystkich już na starcie.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {eventId}
                </code>
                <button 
                  onClick={() => copyToClipboard(eventId)} 
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <a href={INVITATION_SHOP_URL} target="_blank" rel="noopener noreferrer" className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all text-white bg-gradient-to-r from-rose-500 to-pink-600 flex items-center justify-center gap-2`}>
                Kreator Stron WWW <ExternalLink size={16}/>
              </a>
              <button onClick={() => setShowPromoModal(false)} className="w-full py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">
                Wrócę do tego później
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
// ============================================================================
// ZAKŁADKA: ANKIETA (WYNIKI I WPROWADZANIE DANYCH PO PORODZIE) - WERSJA PRO
// ============================================================================




function SurveyTab({ eventId, event, theme, supabase }: { eventId: string, event: any, theme: any, supabase: any }) {
  // POBIERAMY DANE Z TWOJEGO HOOKA!
  const { responses, loading: hookLoading, error, stats } = useGetBabyShowerResponses(eventId);
  
  const [loading, setLoading] = useState(true)
  
  // Stan "prawdziwych danych" po porodzie (wypełnia Mama w panelu)
  const [realData, setRealData] = useState<any>(null)
  const [isEditingReal, setIsEditingReal] = useState(false)
  
  // Opcje w formularzu muszą odpowiadać "value" z Elementora (żeby punktacja działała idealnie)
  const [form, setForm] = useState({
    birth_date: '', height: '', weight: '', hair_color: 'blond', eye_color: 'blue'
  })

  // ------------------------------------------------------------------------
  // 👑 SPRAWDZENIE PAKIETU PRO
  // ------------------------------------------------------------------------
  const isPro = event?.tier?.toLowerCase() === 'pro' || event?.tier?.toLowerCase() === 'premium';

  useEffect(() => { 
    if (isPro) loadRealData() 
  }, [eventId, isPro])

  async function loadRealData() {
    setLoading(true)
    // Pobieramy zapisane "prawdziwe" dane z tabeli events (pole 'survey_real_data' typu JSONB)
    try {
      const { data: evData } = await supabase.from('events').select('survey_real_data').eq('id', eventId).single()
      if (evData && evData.survey_real_data) {
        setRealData(evData.survey_real_data)
        setForm(evData.survey_real_data)
      }
    } catch (e) { 
      console.log("Możesz dodać kolumnę survey_real_data (JSONB) do tabeli events, by zapisywać wynik na zawsze.") 
    }
    setLoading(false)
  }

  async function saveRealData() {
    setRealData({ ...form })
    setIsEditingReal(false)
    try {
      await supabase.from('events').update({ survey_real_data: form }).eq('id', eventId)
    } catch (e) {
      console.log("Stan działa lokalnie.")
    }
  }

  // --- ALGORYTM LICZENIA PUNKTÓW ---
  const calculateScore = (guess: any) => {
    if (!realData) return 0
    let points = 0
    
    if (guess.guessed_birth_date === realData.birth_date) points += 10
    
    if (guess.guessed_weight) {
      const diff = Math.abs(Number(guess.guessed_weight) - Number(realData.weight))
      if (diff <= 0.05) points += 10
      else if (diff <= 0.2) points += 5
    }
    
    if (guess.guessed_height) {
      const diff = Math.abs(Number(guess.guessed_height) - Number(realData.height))
      if (diff === 0) points += 10
      else if (diff <= 2) points += 5
    }
    
    if (String(guess.guessed_hair_color).toLowerCase() === String(realData.hair_color).toLowerCase()) points += 10
    if (String(guess.guessed_eye_color).toLowerCase() === String(realData.eye_color).toLowerCase()) points += 10
    
    return points
  }

  const rankedResponses = responses.map(r => ({ ...r, score: calculateScore(r) })).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })
  
  const topScore = rankedResponses.length > 0 ? rankedResponses[0].score : 0

  // ------------------------------------------------------------------------
  // EKRAN BLOKADY PRO (WYŚWIETLA SIĘ ZAMIAST ZAKŁADKI)
  // ------------------------------------------------------------------------
  if (!isPro) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h3 className={`text-xl font-black flex items-center gap-2 text-slate-300`}><Trophy /> Quizy i Zgadywanki</h3>
            <p className="text-sm text-slate-400 mt-1">Interaktywne ankiety i tabele wyników gości.</p>
          </div>
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center gap-1.5">
            <Crown size={12} /> Funkcja PRO
          </span>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-24 relative overflow-hidden flex flex-col items-center justify-center group">
          <div className={`absolute -top-20 -right-20 w-64 h-64 opacity-10 rounded-full blur-3xl pointer-events-none ${theme.bgLight} transition-all duration-1000 group-hover:scale-150`}></div>
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <Lock size={40} className="text-slate-300" />
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-3 relative z-10">Gry i Ankiety dla Gości!</h3>
          <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed relative z-10">
            Odblokuj interaktywne moduły na Twojej stronie WWW! Pozwól gościom zgadywać wagę i wzrost maluszka, obstawiać kto pierwszy ucieknie z parkietu na weselu lub udostępniać śmieszne anegdoty o solenizancie! <br/><br/><b>Ta funkcja wymaga aktywnego pakietu PRO.</b>
          </p>
          <button onClick={() => alert('Przejdź do zakładki "Twój Pakiet" lub skontaktuj się z obsługą, aby odblokować funkcje premium!')} className="px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-1 relative z-10 flex items-center gap-2">
            <Crown size={18} className="text-amber-400" /> Odblokuj wersję PRO
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // WŁAŚCIWY WIDOK (TYLKO DLA PRO)
  // ------------------------------------------------------------------------
  if (loading || hookLoading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Wczytywanie wyników ankiety...</div>
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-bold">Wystąpił błąd pobierania bazy: {error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-2 ${theme.textTheme}`}><Trophy /> Ankieta i Wyniki</h3>
          <p className="text-sm text-slate-500 mt-1">Gdy maluch pojawi się na świecie, wprowadź tu prawdziwe dane, by wyłonić zwycięzcę zakładów!</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!isEditingReal && (
            <button onClick={() => setIsEditingReal(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btn}`}>
              <Edit3 size={16} /> Wpisz dane po porodzie
            </button>
          )}
        </div>
      </div>

      {/* 2. FORMULARZ PRAWDZIWYCH DANYCH */}
      {isEditingReal && (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-inner animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-slate-800 text-lg flex items-center gap-2"><Baby /> Rozwiązanie! Prawdziwe dane maluszka</h4>
            <button onClick={() => setIsEditingReal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data porodu</label>
              <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Waga (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="np. 3.5" className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Wzrost (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} placeholder="np. 53" className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Włosy</label>
              <select value={form.hair_color} onChange={e => setForm({...form, hair_color: e.target.value})} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`}>
                <option value="blond">Blond</option><option value="brunette">Szatyn/ka</option><option value="red">Rude</option><option value="black">Czarne</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Oczy</label>
              <select value={form.eye_color} onChange={e => setForm({...form, eye_color: e.target.value})} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`}>
                <option value="blue">Niebieskie</option><option value="brown">Brązowe</option><option value="green">Zielone</option><option value="gray">Szare</option>
              </select>
            </div>
          </div>
          <button onClick={saveRealData} className={`w-full py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}>Zapisz i Przelicz Punkty Gości!</button>
        </div>
      )}

      {/* 3. WIDOK PODSUMOWANIA */}
      {realData && !isEditingReal && (
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm animate-in fade-in ${theme.bgLight} ${theme.border}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-sm bg-white ${theme.textTheme}`}>👶</div>
            <div>
              <h4 className="font-black text-slate-800 text-lg mb-1">Mamy już komplet danych!</h4>
              <p className="text-sm text-slate-600">Poród: <strong>{realData.birth_date}</strong> • Waga: <strong>{realData.weight}kg</strong> • Wzrost: <strong>{realData.height}cm</strong></p>
            </div>
          </div>
          <button onClick={() => setIsEditingReal(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm">Popraw dane</button>
        </div>
      )}

      {/* 4. RANKING I LISTA GOŚCI */}
      {responses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.bgLight} ${theme.textTheme}`}><PieChart size={32} /></div>
          <p className="text-slate-800 font-black text-xl">Brak odpowiedzi</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Goście nie wypełnili jeszcze ankiety na Twojej Stronie Zaproszeniowej. Jak tylko zaczną wysyłać odpowiedzi, spłyną one tutaj na żywo!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h4 className="font-black text-slate-800 text-lg">Typowania Gości ({stats.total})</h4>
            
            <div className="flex flex-wrap gap-2">
               {stats.averageWeight && <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm">⚖️ Średnia: {stats.averageWeight} kg</span>}
               {stats.mostCommonHairColor && <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm">💇 Lider: {stats.mostCommonHairColor}</span>}
            </div>

            {realData && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Trophy size={12}/> Tabela wyników aktywna</span>}
          </div>
          
          <div className="divide-y divide-slate-50">
            {rankedResponses.map((resp, index) => {
              const isWinner = realData && resp.score > 0 && resp.score === topScore;
              
              return (
                <div key={resp.id} className={`p-5 transition-colors flex flex-col lg:flex-row justify-between gap-4 group ${isWinner ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm border ${isWinner ? 'bg-amber-400 text-white border-amber-500 shadow-amber-200' : `${theme.bgLight} ${theme.textTheme} border-transparent`}`}>
                      {isWinner ? <Trophy size={20} /> : index + 1}
                    </div>
                    <div>
                      <h5 className="font-black text-slate-800 text-base flex items-center gap-2">
                        {resp.guest_name || 'Gość'} 
                        {isWinner && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">Lider!</span>}
                      </h5>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resp.guessed_birth_date && <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">📅 {resp.guessed_birth_date}</span>}
                        {resp.guessed_weight && <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">⚖️ {resp.guessed_weight}kg</span>}
                        {resp.guessed_height && <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">📏 {resp.guessed_height}cm</span>}
                        {resp.guessed_hair_color && <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">💇 {resp.guessed_hair_color}</span>}
                        {resp.guessed_eye_color && <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">👀 {resp.guessed_eye_color}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-end shrink-0 border-t border-slate-100 lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0 w-full lg:w-auto">
                    {!realData ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Czeka na rozwiązanie</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span className={`text-3xl font-black ${isWinner ? 'text-amber-500' : theme.textTheme}`}>{resp.score}</span>
                          <span className="text-xs font-bold text-slate-400 mb-1">pkt</span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Skuteczność</div>
                      </div>
                    )}
                  </div>
                  
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}



// ============================================================================
// FOOTER REKLAMOWY / ZARZĄDZANIE MEDIAMI STRONY
// ============================================================================
function PromoFooter({ event }: { event: any }) {
  const hasInvitationSite = !!event?.invitation_url
  const invitationUrl = event?.invitation_url || null
  const [currentImage, setCurrentImage] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [showPromoModal, setShowPromoModal] = useState(false)
  
  // Stany dla Menedżera Zdjęć
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{url: string, name: string}[]>([])

  // KONFIGURACJA CLOUDINARY (Uzupełnij swoimi danymi!)
  const CLOUD_NAME = 'dp0knuhda'
  const UPLOAD_PRESET = 'zaproszenia'

  // Zdjęcia do Karuzeli
  const CAROUSEL_IMAGES = [
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/palma.webp',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/03/gipsowka-r.jpg',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/03/czarny.jpg',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/gram-mokup.png',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/grab.webp',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/04/ptaki.jpg',
    'https://sklep.anmcollective.pl/wp-content/uploads/2026/03/mokuup-e1775213877125.png'
  ]

  useEffect(() => {
    if (hasInvitationSite) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 4000) // Zmiana zdjęcia co 4 sekundy
    return () => clearInterval(interval)
  }, [hasInvitationSite])

  // Obsługa wysyłania zdjęcia na serwer i generowania linku
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.secure_url) {
        setUploadedImages(prev => [{ url: data.secure_url, name: file.name }, ...prev])
      } else {
        alert('Błąd podczas przesyłania zdjęcia.')
      }
    } catch (err) {
      alert('Wystąpił problem z połączeniem.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✓ Skopiowano!')
  }

  // Zabezpieczenie dla INVITATION_PRICING jeśli nie jest zdefiniowane wyżej
  const INVITATION_PRICING = { promoActive: true, promoPrice: 399, normalPrice: 599 }
  const INVITATION_SHOP_URL = 'https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/'

  return (
    <div className="mt-12 space-y-8 animate-in fade-in duration-500 relative">
      
      {/* SEKCJA ZARZĄDZANIA STRONĄ I MEDIAMI (Tylko dla posiadaczy strony) */}
      {hasInvitationSite && (
        <div className="space-y-6">
          
          {/* Status Strony */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-emerald-200" />
                  <span className="text-xs font-black tracking-widest uppercase text-emerald-100">Status Usługi</span>
                </div>
                <h3 className="text-2xl font-black mb-1">Strona jest aktywna! 🚀</h3>
                <p className="text-emerald-100 text-sm font-medium mb-4">Adres Twojego e-zaproszenia:</p>
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 font-mono font-bold text-lg inline-block">
                  {invitationUrl.replace(/^https?:\/\//, '')}
                </div>
              </div>
              <a href={invitationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg w-full md:w-auto shrink-0 hover:-translate-y-0.5">
                <ExternalLink size={18} /> Otwórz stronę
              </a>
            </div>
          </div>

          {/* Menedżer Medialny */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ImageIcon size={24} className="text-indigo-500"/> Repozytorium Zdjęć
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Dodaj tutaj zdjęcia, które chcesz umieścić na swojej Stronie Wydarzenia (np. zdjęcie w tle, tło sekcji, avatar). Po dodaniu wygenerujemy bezpieczny link (URL), który możesz skopiować i wkleić w edytorze strony.
                </p>
                <p className="text-[11px] font-bold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded mt-2">
                  ⚠️ Ważne: To nie jest prywatny moodboard. Przesyłaj tu tylko pliki przeznaczone do publikacji na stronie WWW.
                </p>
              </div>
              
              <div className="shrink-0 w-full md:w-auto">
                <input 
                  type="file" 
                  id="site-media-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
                <button 
                  onClick={() => document.getElementById('site-media-upload')?.click()} 
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud size={18} /> {uploading ? 'Przesyłanie...' : 'Wgraj zdjęcie'}
                </button>
              </div>
            </div>

            {uploadedImages.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 font-bold text-sm">Brak wgranych plików</p>
                <p className="text-xs text-slate-400 mt-1">Wgraj pierwsze zdjęcie, aby wygenerować link.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group">
                    <div className="aspect-square bg-slate-200 relative">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => copyToClipboard(img.url)} className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg">
                          <Copy size={12} /> Kopiuj Link
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-slate-500 truncate" title={img.name}>{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKCJA REKLAMOWA (Widoczna i aktywna niezależnie od posiadania strony) */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        
        {/* Nagłówek reklamowy */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pokaż się z najlepszej strony</h2>
          <p className="text-sm text-slate-500">Zrób niesamowite wrażenie na swoich gościach. Zobacz nasze flagowe projekty i odkryj, jak może wyglądać Twoje e-Zaproszenie.</p>
        </div>

        {/* Dynamiczny baner sklepu zaproszeń z Karuzelą Zdjęć */}
        {!hasInvitationSite && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-[32px] p-1.5 shadow-xl mt-10">
            <div className="bg-white rounded-[26px] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-60"></div>
              
              {/* Lewa strona - Tekst i Przyciski */}
              <div className="flex-1 relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 shadow-sm border border-rose-100">
                  <Sparkles size={12}/> Promocja
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">Zbuduj z nami swoją stronę!</h3>
                <p className="text-base text-slate-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Zaskocz gości profesjonalną stroną z formularzem RSVP, która w pełni łączy się z tym planerem. Wybierz swój wymarzony motyw, a wszystkie dane od gości zaczną spływać automatycznie!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  {INVITATION_PRICING.promoActive && (
                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 line-through text-sm font-bold">{INVITATION_PRICING.normalPrice} zł</span>
                      <span className="text-2xl font-black text-rose-600">{INVITATION_PRICING.promoPrice} zł</span>
                    </div>
                  )}
                  <button onClick={() => setShowPromoModal(true)} className="w-full sm:w-auto text-center bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                    Sprawdź pakiety w sklepie <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* Prawa strona - Karuzela Zdjęć */}
              <div className="w-full lg:w-5/12 aspect-[4/3] relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white shrink-0 bg-slate-100">
                {CAROUSEL_IMAGES.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Projekt e-zaproszenia ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`} 
                  />
                ))}
                
                {/* Wskaźniki kropkowe */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                  {CAROUSEL_IMAGES.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImage ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>

      {/* MODAL: KUP STRONĘ WWW Z KODEM EVENTU */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors z-20"><X size={16} /></button>
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 relative z-10 text-rose-500">
              <Globe size={32} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Stwórz e-Zaproszenie!</h3>
            <p className="text-sm text-slate-600 mb-6 relative z-10 leading-relaxed">
              Abyśmy mogli połączyć nową Stronę Wydarzenia bezpośrednio z Twoim planerem dla <strong>{event?.title || 'tego wydarzenia'}</strong>, przygotowaliśmy dla Ciebie unikalny Kod Eventu.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Twój Kod Eventu</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm md:text-base font-bold text-slate-800 break-all bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 truncate select-all">
                  {event?.id}
                </code>
                <button 
                  onClick={() => copyToClipboard(event?.id)} 
                  className="p-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  title="Kopiuj"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-3">
                Skopiuj ten kod. Przekierujemy Cię do sklepu. Wybierz swój motyw, a kod wklej w polu <strong>"Uwagi do zamówienia"</strong> w koszyku!
              </p>
            </div>

            <a 
              href={`${INVITATION_SHOP_URL}?event_ref=${event?.id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setShowPromoModal(false)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white relative z-10 uppercase tracking-wider"
            >
              Wybieram szablon <ExternalLink size={16}/>
            </a>
          </div>
        </div>
      )}

    </div>
  )
}