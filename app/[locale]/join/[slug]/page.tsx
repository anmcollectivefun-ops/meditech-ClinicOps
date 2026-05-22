'use client'

// ==========================================
// 1. IMPORTY I KONFIGURACJA
// ==========================================
import { useEffect, useState, use, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '../../../lib/supabase'
import { getGoogleFontsStylesheetHref } from '../../../lib/googleFonts'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import {
  Calendar, MapPin, CheckCircle2, X, Clock, Route, Phone,
  Info, Users, Car, Bus, Bed, Gift, Sparkles, Utensils,
  Leaf, Recycle, TrendingDown, Award, Globe, Truck,
  Coffee, Zap, Share2, Heart, Star, AlertTriangle,
  Wine, Cookie, Candy, GlassWater, Egg, Fish, Wheat, Milk, Apple,
  ChevronRight, ChevronDown, ChevronUp, Plus, Minus, ArrowRight, UtensilsCrossed,
  ImageIcon, Linkedin, Twitter, Link as LinkIcon, Download, Instagram, Facebook, Youtube, Mail, Video,
  Ticket, CreditCard, ExternalLink, MessageCircle
} from 'lucide-react'

// ==========================================
// 2. FUNKCJE POMOCNICZE I SUBKOMPONENTY
// ==========================================

const isEnabled = (value: any) => value === true || value === 'true'

const getPreviewUrl = (file: File | null, currentUrl: string | null) => {
  if (file) return URL.createObjectURL(file)
  return currentUrl || null
}
const AnimatedCounter = ({ value, suffix = '' }: { value: number | string, suffix?: string }) => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  
  // Jeśli to nie jest liczba, renderujemy zwykły tekst
  if (isNaN(numericValue)) return <>{value}{suffix}</>;

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ "--num": 0 } as any}
        whileInView={{ "--num": numericValue } as any}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        style={{
          // Zmienna CSS jest interpolowana przez framer-motion, więc wygląda to bardzo płynnie
          counterReset: 'num var(--num)',
        }}
        className="after:content-[counter(num)]"
      />
      {/* Dodajemy ułamek, jeśli wartość oryginalna miała przecinek */}
      {String(value).includes('.') && <span className="after:content-['.'_counter(dec)]" style={{ counterReset: `dec ${String(value).split('.')[1]}` }} />}
      {suffix}
    </motion.span>
  )
}
const BentoMetric = ({ icon: Icon, value, label, secColor, txtColor }: any) => (
  <motion.div
    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center text-center"
  >
    <div
      className="p-3 rounded-2xl mb-3"
      style={{ backgroundColor: `${secColor}15`, color: secColor }}
    >
      <Icon size={20} />
    </div>

    <h4 className="text-2xl font-black tabular-nums" style={{ color: txtColor }}>
      {value}
    </h4>

    <p
      className="text-[10px] font-bold uppercase tracking-widest opacity-50"
      style={{ color: txtColor }}
    >
      {label}
    </p>
  </motion.div>
)

const ThemeCard = ({
  title,
  text,
  event,
  delay = 0,
  className = ''
}: {
  title: string
  text: string
  event: any
  delay?: number
  className?: string
}) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -8, scale: 1.015 }}
      className={`rounded-3xl p-6 border shadow-sm backdrop-blur-xl transition-shadow hover:shadow-2xl ${className}`}
      style={{
        backgroundColor: `${event.theme_card_color || '#ffffff'}E6`,
        borderColor: `${event.theme_accent_color || '#253a2a'}22`
      }}
    >
      <h3
        className="font-black text-xl mb-3"
        style={{ color: event.theme_heading_color || '#0f172a' }}
      >
        {title}
      </h3>

      <p
        className="text-sm leading-relaxed whitespace-pre-line"
        style={{ color: event.theme_text_color || '#475569' }}
      >
        {text}
      </p>
    </motion.div>
  )
}

const PublicEventSection = ({
  id,
  eyebrow,
  title,
  description,
  imageUrl,
  ctaLabel,
  onCtaClick,
  children,
  shape = 'rounded-[40px]',
  reverse = false
}: {
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  imageUrl?: string
  ctaLabel?: string
  onCtaClick?: () => void
  children?: ReactNode
  shape?: string
  reverse?: boolean
}) => (
  <section id={id} className="relative z-10 px-6 py-20 md:py-28 overflow-hidden">
    <div
      className="absolute inset-0 pointer-events-none opacity-70"
      style={{
        background:
          'radial-gradient(circle at 14% 12%, var(--event-primary-soft), transparent 30%), radial-gradient(circle at 86% 10%, var(--event-accent-soft), transparent 28%)'
      }}
    />

    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 28 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65 }}
      className={`relative max-w-7xl mx-auto grid grid-cols-1 ${
        imageUrl ? 'lg:grid-cols-12' : ''
      } gap-8 md:gap-12 items-stretch`}
    >
      <div className={`${imageUrl ? 'lg:col-span-7' : ''} ${reverse ? 'lg:order-2' : ''}`}>
        <div className={`h-full glass-card border border-white/10 p-7 md:p-10 ${shape}`}>
          {eyebrow && (
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.22em] mb-5"
              style={{
                backgroundColor: 'var(--event-primary-soft)',
                color: 'var(--event-primary)'
              }}
            >
              <Sparkles size={12} />
              {eyebrow}
            </span>
          )}

          {title && (
            <h2
              className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.92] mb-5"
              style={{
                fontFamily: 'var(--event-heading-font)',
                color: 'var(--event-heading)'
              }}
            >
              {title}
            </h2>
          )}

          {description && (
            <p className="text-sm md:text-base leading-relaxed opacity-70 whitespace-pre-line max-w-3xl">
              {description}
            </p>
          )}

          {ctaLabel && onCtaClick && (
            <button
              type="button"
              onClick={onCtaClick}
              className="mt-8 inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-black shadow-xl hover:scale-[1.02] active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--event-primary)' }}
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </button>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {imageUrl && (
        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.96 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className={`lg:col-span-5 min-h-[320px] overflow-hidden border border-white/10 shadow-2xl ${shape} ${
            reverse ? 'lg:order-1' : ''
          }`}
        >
          <img
            src={imageUrl}
            alt={title || ''}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          />
        </motion.div>
      )}
    </motion.div>
  </section>
)

type AdditionalGuest = {
  local_id: string
  unit_type: 'companion' | 'child'
  display_name: string
  first_name?: string
  age_group: 'adult' | 'child'
  same_as_main: boolean
  diet: string
  allergies: string
  transport: string
  transport_address: string
  selectedMealIds: string[]
  selectedGadgetIds: string[]
  selectedSessionIds: string[]
  notes: string
}

// ==========================================
// 3. GŁÓWNY KOMPONENT STRONY
// ==========================================
export default function PublicJoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
 const supabase = useMemo(() => createClient(), [])

  // --- STANY: DANE WYDARZENIA ---
  const [event, setEvent] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [approvedList, setApprovedList] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [gadgets, setGadgets] = useState<any[]>([])
  const [attendeeGadgetChoices, setAttendeeGadgetChoices] = useState<any[]>([])
  const [meals, setMeals] = useState<any[]>([])
  const [ticketTiers, setTicketTiers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [eventVideos, setEventVideos] = useState<any[]>([])
  const [activeParticipantsCount, setActiveParticipantsCount] = useState(0)

  // --- STANY: DANE PUBLICZNE / DODATKOWE ---
  const [speakers, setSpeakers] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [fleet, setFleet] = useState<any[]>([])
  const [carpoolingAds, setCarpoolingAds] = useState<any[]>([])
  const [organizedRoutes, setOrganizedRoutes] = useState<any[]>([])
  const [transportStops, setTransportStops] = useState<any[]>([])

  // --- STANY: UI / UX ---
  const [loading, setLoading] = useState(true)
  const [submitted, setSent] = useState(false)
  const [rsvpSent, setRsvpSent] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCarpoolModalOpen, setIsCarpoolModalOpen] = useState(false)
  const [activeRSVPStep, setActiveRSVPStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [declinedGadget, setDeclinedGadget] = useState(false)
  const [activeActionModal, setActiveActionModal] = useState<null | 'menu' | 'gadgets' | 'workshops' | 'transport'>(null)
  const [activeInlinePanel, setActiveInlinePanel] = useState<null | 'menu' | 'gadgets' | 'workshops' | 'transport'>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [visibleAgendaCount, setVisibleAgendaCount] = useState(3)
  const agendaLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const lastAgendaRevealScrollRef = useRef(0)
  const galleryTrackRef = useRef<HTMLDivElement | null>(null)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [carpoolMessage, setCarpoolMessage] = useState<string | null>(null)
  const [carpoolSavingId, setCarpoolSavingId] = useState<string | null>(null)
  const [isCarpoolReserveModalOpen, setIsCarpoolReserveModalOpen] = useState(false)
const [selectedCarpoolAd, setSelectedCarpoolAd] = useState<any | null>(null)
const [carpoolPassengerPhone, setCarpoolPassengerPhone] = useState('')
  const [attendeeUnits, setAttendeeUnits] = useState<any[]>([])
  const [attendeeMealChoices, setAttendeeMealChoices] = useState<any[]>([])
  const [attendeeSessionSignups, setAttendeeSessionSignups] = useState<any[]>([])
  const [attendeeTransportChoices, setAttendeeTransportChoices] = useState<any[]>([])
  const [pendingMenuChoices, setPendingMenuChoices] = useState<Record<string, string>>({})
  const [pendingGadgetChoices, setPendingGadgetChoices] = useState<Record<string, { gadget_id?: string; selected_size?: string | null; declined?: boolean }>>({})
  const [pendingSessionChoices, setPendingSessionChoices] = useState<Record<string, string[]>>({})
  const [pendingTransportChoices, setPendingTransportChoices] = useState<Record<string, { transport: string; transport_address: string }>>({})

  // --- STANY: FORMULARZE I WYBORY UŻYTKOWNIKA ---
  const [isAttending, setIsAttending] = useState<boolean>(true)
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [selectedGadgets, setSelectedGadgets] = useState<Array<{ gadget_id: string; selected_size?: string }>>([])
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([])
  const [selectedTicketTierId, setSelectedTicketTierId] = useState('')
  const [newAd, setNewAd] = useState({ route_from: '', seats_avail: 1, contact_sh: '' })

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: ''
  })

  const [logistics, setLogistics] = useState({
    diet: [] as string[],
    allergies: [] as string[],
    allergies_other: '',
    companion: '0',
    kids: '0',
    transport: 'Własny dojazd',
    transport_address: '',
    extra_notes: '',
    alcohol: [] as string[],
    sweets: [] as string[],
    selectedMeals: [] as { mealId: string; portionSize: string; willAttend: boolean }[]
  })

  const [carbonData, setCarbonData] = useState({
    paperSaved: 0,
    co2Total: 0,
    treesEquivalent: 0,
    foodWastePrevented: 0,
    plasticEliminated: 0,
    transportOptimized: 0,
    totalParticipants: 0
  })
// --- STANY: POWIADOMIENIA (TOAST) ---
  const [showWorkshopPopup, setShowWorkshopPopup] = useState(false)

  // --- LOGIKA: WYZWALACZ POP-UPA WARSZTATOWEGO ---
  useEffect(() => {
    // Sprawdzamy, czy organizator włączył zapisy i czy faktycznie są jakieś sesje
    if (sessions.length > 0 && isEnabled(event?.workshops_signup_enabled)) {
      const timer = setTimeout(() => {
        // Sprawdzamy, czy gość nie zamknął już tego powiadomienia w trakcie tej sesji przeglądarki
        if (!sessionStorage.getItem('workshop_popup_dismissed')) {
          setShowWorkshopPopup(true)
        }
      }, 3500) // Pop-up wyjedzie z opóźnieniem 3.5 sekundy po załadowaniu strony
      return () => clearTimeout(timer)
    }
  }, [sessions.length, event?.workshops_signup_enabled])

  const handleWorkshopPopupClick = () => {
    setShowWorkshopPopup(false)
    sessionStorage.setItem('workshop_popup_dismissed', 'true')

    // Gładkie przewinięcie do agendy i natychmiastowe otwarcie panelu zapisów
    document.getElementById('public-agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      openParticipantAction('workshops')
    }, 400)
  }

  const dismissWorkshopPopup = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowWorkshopPopup(false)
    sessionStorage.setItem('workshop_popup_dismissed', 'true')
  }
  // ==========================================
  // 4. LOGIKA BIZNESOWA I POBIERANIE DANYCH
  // ==========================================

  const calculateEcoMetrics = (guests: any[]) => {
    const confirmed = guests.filter((g: any) => g.rsvp_status === 'potwierdzone')
    const carUsers = guests.filter(
      (g: any) => g.transport === 'car' || g.transport === 'Własny dojazd'
    ).length

    const totalCO2 =
      (guests.length * 0.15) +
      (carUsers * 0.9) +
      ((guests.length - confirmed.length) * 1.7)

    setCarbonData({
      paperSaved: guests.length,
      co2Total: Math.round(totalCO2 * 10) / 10,
      treesEquivalent: Math.round(totalCO2 * 0.06),
      foodWastePrevented: Math.round((guests.length - confirmed.length) * 0.8 * 10) / 10,
      plasticEliminated: guests.length * 0.05,
      transportOptimized: Math.round((1 - carUsers / Math.max(guests.length, 1)) * 100),
      totalParticipants: guests.length
    })
  }

  const loadCarpoolingAdsForEvent = useCallback(async (eventId: string) => {
    const relationSelect = `
      *,
      b2b_applications:application_id (
        id,
        first_name,
        last_name,
        company_name,
        email,
        phone
      )
    `

    const { data: relationData, error: relationError } = await supabase
      .from('carpooling_ads')
      .select(relationSelect)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (!relationError) {
      setCarpoolingAds(relationData || [])
      return relationData || []
    }

    console.warn('carpooling_ads relation load unavailable:', relationError.message)

    const { data: adsOnlyData, error: adsOnlyError } = await supabase
      .from('carpooling_ads')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (adsOnlyError) {
      console.warn('carpooling_ads unavailable:', adsOnlyError.message)
      setCarpoolingAds([])
      return []
    }

    const applicationIds = [...new Set((adsOnlyData || []).map((ad: any) => ad.application_id).filter(Boolean))]
    const { data: ownersData, error: ownersError } = applicationIds.length > 0
      ? await supabase
          .from('b2b_applications')
          .select('id, first_name, last_name, company_name, email, phone')
          .in('id', applicationIds)
      : { data: [], error: null }

    if (ownersError) {
      console.warn('carpooling owner applications unavailable:', ownersError.message)
    }

    const ownersById = new Map((ownersData || []).map((owner: any) => [owner.id, owner]))
    const mergedAds = (adsOnlyData || []).map((ad: any) => ({
      ...ad,
      b2b_applications: ownersById.get(ad.application_id) || null
    }))

    setCarpoolingAds(mergedAds)
    return mergedAds
  }, [supabase])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('b2b_events')
          .select('*')
          .eq('slug', slug)
          .single()

        if (eventError) {
          console.warn('Nie udało się pobrać wydarzenia:', eventError.message)
          return
        }

        if (!eventData) return

        setEvent(eventData)

        const [
          appsRes,
          activeAppsRes,
          sessRes,
          gadgRes,
          attendeeGadgetsRes,
          mealRes,
          tiersRes,
          partnersRes,
          fleetRes,
          routeRes,
          stopRes,
          materialsRes,
          videosRes
        ] = await Promise.all([
          supabase
            .from('b2b_applications')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('status', 'approved'),

          supabase
            .from('b2b_applications')
            .select('id, access_status, is_active_participant')
            .eq('event_id', eventData.id),

          supabase
            .from('event_sessions')
            .select('*')
            .eq('event_id', eventData.id)
            .order('start_time', { ascending: true }),

          supabase
            .from('event_gadgets')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),

          supabase
            .from('event_attendee_gadget_choices')
            .select('*')
            .eq('event_id', eventData.id),

          supabase
            .from('event_meals')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_active', true)
            .order('meal_type', { ascending: true }),

          supabase
            .from('ticket_tiers')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }),

          supabase
            .from('event_partners')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_visible', true)
            .order('display_order', { ascending: true }),

          supabase
            .from('transport_fleet')
            .select('*')
            .eq('event_id', eventData.id),

          supabase
            .from('organized_transport_routes')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('show_on_invitation', true)
            .eq('is_public', true)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false }),

          supabase
            .from('organized_transport_stops')
            .select('*')
            .eq('event_id', eventData.id)
            .order('stop_order', { ascending: true }),

          supabase
            .from('event_materials')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_visible', true)
            .order('display_order', { ascending: true }),

          supabase
            .from('event_videos')
            .select('*')
            .eq('event_id', eventData.id)
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
        ])

        if (appsRes.error) {
          console.warn('b2b_applications approved unavailable:', appsRes.error.message)
          setApprovedList([])
          calculateEcoMetrics([])
        } else {
          setApprovedList(appsRes.data || [])
          calculateEcoMetrics(appsRes.data || [])
        }

        if (activeAppsRes.error) {
          console.warn('b2b_applications active count unavailable:', activeAppsRes.error.message)
          setActiveParticipantsCount(0)
        } else {
          setActiveParticipantsCount(
            (activeAppsRes.data || []).filter(
              (app: any) => app.access_status === 'active' || app.is_active_participant === true
            ).length
          )
        }

        if (sessRes.error) {
          console.warn('event_sessions unavailable:', sessRes.error.message)
          setSessions([])
        } else {
          setSessions(sessRes.data || [])
        }

        if (gadgRes.error) {
          console.warn('event_gadgets unavailable:', gadgRes.error.message)
          setGadgets([])
        } else {
          setGadgets(gadgRes.data || [])
        }

        if (attendeeGadgetsRes.error) {
          console.warn('event_attendee_gadget_choices unavailable:', attendeeGadgetsRes.error.message)
          setAttendeeGadgetChoices([])
        } else {
          setAttendeeGadgetChoices(attendeeGadgetsRes.data || [])
        }

        if (mealRes.error) {
          console.warn('event_meals unavailable:', mealRes.error.message)
          setMeals([])
        } else {
          setMeals(mealRes.data || [])
        }

        if (tiersRes.error) {
          console.warn('ticket_tiers unavailable:', tiersRes.error.message)
          setTicketTiers([])
        } else {
          const activeTiers = (tiersRes.data || []).filter((tier: any) => tier.is_active !== false)
          setTicketTiers(activeTiers)
          if (activeTiers.length > 0) setSelectedTicketTierId(activeTiers[0].id)
        }

        if (partnersRes.error) {
          console.warn('event_partners unavailable:', partnersRes.error.message)
          setSpeakers([])
          setSponsors([])
        } else {
          const partners = partnersRes.data || []
          setSpeakers(partners.filter((partner: any) => partner.type === 'speaker'))
          setSponsors(partners.filter((partner: any) => partner.type === 'sponsor'))
        }

        if (fleetRes.error) {
          console.warn('transport_fleet unavailable:', fleetRes.error.message)
          setFleet([])
        } else {
          setFleet(fleetRes.data || [])
        }

        if (routeRes.error) {
          console.warn('organized_transport_routes unavailable:', routeRes.error.message)
          setOrganizedRoutes([])
        } else {
          setOrganizedRoutes(routeRes.data || [])
        }

        if (stopRes.error) {
          console.warn('organized_transport_stops unavailable:', stopRes.error.message)
          setTransportStops([])
        } else {
          setTransportStops(stopRes.data || [])
        }

        if (materialsRes.error) {
          console.warn('event_materials unavailable:', materialsRes.error.message)
          setMaterials([])
        } else {
          setMaterials(materialsRes.data || [])
        }

        if (videosRes.error) {
          console.warn('event_videos unavailable:', videosRes.error.message)
          setEventVideos([])
        } else {
          setEventVideos(videosRes.data || [])
        }

        await loadCarpoolingAdsForEvent(eventData.id)

        const savedAppId = localStorage.getItem(`app_id_${eventData.id}`)

        if (savedAppId) {
          const { data: appData, error: appError } = await supabase
            .from('b2b_applications')
            .select('*')
            .eq('id', savedAppId)
            .single()

          if (appError) {
            console.warn('Saved application unavailable:', appError.message)
            return
          }

          if (appData) {
            setApplication(appData)
            if (appData.ticket_tier_id) setSelectedTicketTierId(appData.ticket_tier_id)
            setSent(true)
            if (appData.rsvp_status === 'potwierdzone') setRsvpSent(true)
          }
        }
      } catch (err) {
        console.error('Public page load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, supabase, loadCarpoolingAdsForEvent])

  const loadParticipantOperationalData = useCallback(async () => {
    if (!event?.id || !application?.id) return

    const safeLoad = async (
      tableName: string,
      setter: (items: any[]) => void,
      orderColumn = 'created_at'
    ) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('event_id', event.id)
        .eq('application_id', application.id)
        .order(orderColumn, { ascending: true })

      if (error) {
        console.warn(`${tableName} unavailable on public page:`, error.message)
        setter([])
        return
      }

      setter(data || [])
    }

    await Promise.all([
      safeLoad('event_attendee_units', setAttendeeUnits),
      safeLoad('event_attendee_meal_choices', setAttendeeMealChoices),
      safeLoad('event_attendee_session_signups', setAttendeeSessionSignups),
      safeLoad('event_attendee_transport_choices', setAttendeeTransportChoices)
    ])
  }, [event?.id, application?.id, supabase])

  useEffect(() => {
    loadParticipantOperationalData()
  }, [loadParticipantOperationalData])

  const selectedTicketTier = useMemo(
    () => ticketTiers.find((tier: any) => tier.id === selectedTicketTierId) || null,
    [ticketTiers, selectedTicketTierId]
  )

  const applicationTicketTier = useMemo(
    () => ticketTiers.find((tier: any) => tier.id === application?.ticket_tier_id) || null,
    [ticketTiers, application]
  )

  const getPaymentLink = (tier?: any) => (
    tier?.payment_url ||
    event?.payment_default_url ||
    ''
  )

  const registrationMode = event?.registration_mode || 'free'
  const showTicketSelector = registrationMode === 'paid' || registrationMode === 'mixed'
  const selectedTicketPrice = Number(selectedTicketTier?.price || 0)
  const selectedTicketRequiresPayment =
    registrationMode === 'paid' ||
    (
      registrationMode === 'mixed' &&
      selectedTicketTier?.requires_payment === true &&
      selectedTicketPrice > 0
    )

  const selectedPaymentLink = getPaymentLink(applicationTicketTier || selectedTicketTier)
  const registrationLimit = Number(event?.registration_limit || 0)
  const isCapacityFull = registrationLimit > 0 && activeParticipantsCount >= registrationLimit
  const statusCheckUrl = typeof window !== 'undefined' ? window.location.href : ''
  const selectedApplication = application

  const parseCompanionCount = (value: any) => {
    const raw = String(value || '0').trim().toLowerCase()
    if (!raw || raw === '0' || raw === 'nie' || raw === 'false') return 0
    if (!Number.isNaN(Number(raw))) return Number(raw) > 0 ? 1 : 0
    return 1
  }

  const parseKidsCount = (value: any) => {
    const raw = String(value || '0').trim()
    if (raw.endsWith('+')) return Number(raw.replace('+', '')) || 0
    return Math.min(Math.max(Number.parseInt(raw || '0', 10) || 0, 0), 7)
  }

  const participantUnits = useMemo(() => {
    if (!selectedApplication) return []
    if (attendeeUnits.length > 0) return attendeeUnits

    const fallbackUnits: any[] = [{
      id: 'fallback-main',
      event_id: event?.id,
      application_id: selectedApplication.id,
      unit_type: 'main',
      display_name: `${selectedApplication.first_name || ''} ${selectedApplication.last_name || ''}`.trim() || selectedApplication.email || 'Gość',
      first_name: selectedApplication.first_name,
      last_name: selectedApplication.last_name,
      age_group: 'adult',
      diet: selectedApplication.diet,
      allergies: selectedApplication.allergies,
      ticket_type: selectedApplication.ticket_type,
      access_status: selectedApplication.access_status || selectedApplication.status,
      qr_token: selectedApplication.qr_token || null
    }]

    const companionCount = parseCompanionCount(selectedApplication.companion)
    const companionRaw = String(selectedApplication.companion || '').trim()
    const companionName =
      companionRaw &&
      !['1', 'tak', 'true', 'yes'].includes(companionRaw.toLowerCase())
        ? companionRaw
        : 'Osoba towarzysząca'

    if (companionCount > 0) {
      fallbackUnits.push({
        id: 'fallback-companion-1',
        event_id: event?.id,
        application_id: selectedApplication.id,
        unit_type: 'companion',
        display_name: companionName,
        age_group: 'adult',
        diet: selectedApplication.diet,
        allergies: selectedApplication.allergies,
        ticket_type: selectedApplication.ticket_type,
        access_status: selectedApplication.access_status || selectedApplication.status
      })
    }

    Array.from({ length: parseKidsCount(selectedApplication.kids) }).forEach((_, index) => {
      fallbackUnits.push({
        id: `fallback-child-${index + 1}`,
        event_id: event?.id,
        application_id: selectedApplication.id,
        unit_type: 'child',
        display_name: `Dziecko ${index + 1}`,
        age_group: 'child',
        diet: 'dziecięce',
        allergies: selectedApplication.allergies,
        ticket_type: selectedApplication.ticket_type,
        access_status: selectedApplication.access_status || selectedApplication.status
      })
    })

    return fallbackUnits
  }, [attendeeUnits, selectedApplication, event?.id])
  // --- HANDLERY ---
 const parseSizes = (value: any) => {
  if (Array.isArray(value)) return value

  return String(value || '')
    .split(',')
    .map(size => size.trim())
    .filter(Boolean)
}

const getGadgetSizeOptions = (gadget: any) => {
  const sizes = parseSizes(gadget?.available_sizes)
  return sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL']
}

const getGadgetReservedQuantity = (
  gadgetId: string,
  options: { excludeApplicationId?: string; excludeAttendeeUnitId?: string } = {}
) => {
  const perUnitReserved = attendeeGadgetChoices
    .filter((choice: any) => {
      if (choice.gadget_id !== gadgetId) return false
      if (choice.status === 'cancelled') return false
      if (choice.declined_gadget === true) return false
      if (options.excludeApplicationId && choice.application_id === options.excludeApplicationId) return false
      if (options.excludeAttendeeUnitId && choice.attendee_unit_id === options.excludeAttendeeUnitId) return false
      return true
    })
    .reduce((sum: number, choice: any) => sum + Number(choice.quantity || 1), 0)

  return perUnitReserved
}

const getGadgetAvailableQuantity = (
  gadget: any,
  options: { excludeApplicationId?: string; excludeAttendeeUnitId?: string } = {}
) => {
  if (gadget?.track_stock === false) return Infinity
  return Math.max(Number(gadget?.stock_quantity || 0) - getGadgetReservedQuantity(gadget.id, options), 0)
}

const getGadgetStockStatus = (
  gadget: any,
  options: { excludeApplicationId?: string; excludeAttendeeUnitId?: string } = {}
) => {
  if (gadget?.track_stock === false) return 'unlimited'

  const available = getGadgetAvailableQuantity(gadget, options)

  if (available <= 0) return 'sold_out'
  if (available <= Number(gadget?.low_stock_threshold || 5)) return 'low_stock'

  return 'available'
}

const canDeclineGadget =
  event?.gadget_allow_decline !== false ||
  gadgets.some((gadget: any) => gadget.allow_decline !== false) ||
  gadgets.length === 0

useEffect(() => {
  setSelectedGadgets(prev => {
    const filtered = prev.filter(choice => {
      const gadget = gadgets.find((item: any) => item.id === choice.gadget_id)
      return gadget && getGadgetStockStatus(gadget) !== 'sold_out'
    })

    if (filtered.length < prev.length) {
      setSubmitError('Wybrany gadżet nie jest już dostępny. Wybierz inny.')
    }

    return filtered
  })
}, [gadgets, attendeeGadgetChoices])

const reloadAttendeeGadgetChoices = async () => {
  if (!event?.id) return

  const { data, error } = await supabase
    .from('event_attendee_gadget_choices')
    .select('*')
    .eq('event_id', event.id)

  if (error) {
    console.warn('event_attendee_gadget_choices reload skipped:', error.message)
    return
  }

  setAttendeeGadgetChoices(data || [])
}

const reloadAttendeeSessionSignups = async () => {
  if (!event?.id) return

  const { data, error } = await supabase
    .from('event_attendee_session_signups')
    .select('*')
    .eq('event_id', event.id)

  if (error) {
    console.warn('event_attendee_session_signups reload skipped:', error.message)
    return
  }

  setAttendeeSessionSignups(data || [])
}

const handleJoin = async (e: React.FormEvent) => {
  e.preventDefault()

  if (event?.registration_is_open === false) {
    alert('Rejestracja jest obecnie zamknięta.')
    return
  }

  if (showTicketSelector && ticketTiers.length > 0 && !selectedTicketTier) {
    alert('Wybierz typ biletu przed wysłaniem zgłoszenia.')
    return
  }

  const shouldWaitForApproval = registrationMode === 'approval'
  const shouldWaitForPayment = selectedTicketRequiresPayment
  const shouldWaitlist = isCapacityFull

  let paymentStatus = shouldWaitForPayment ? 'unpaid' : 'not_required'
  let ticketStatus = shouldWaitForPayment ? 'waiting_payment' : 'free'
  let accessStatus = shouldWaitForPayment || shouldWaitForApproval ? 'pending' : 'active'
  let nextStatus = shouldWaitForPayment || shouldWaitForApproval ? 'pending' : 'approved'
  let isActiveParticipant = !(shouldWaitForPayment || shouldWaitForApproval)

  if (shouldWaitlist) {
    paymentStatus = shouldWaitForPayment ? 'unpaid' : 'not_required'
    ticketStatus = 'waitlist'
    accessStatus = 'waitlist'
    nextStatus = 'pending'
    isActiveParticipant = false
  }

  const { data, error } = await supabase
    .from('b2b_applications')
    .insert([{
      event_id: event.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      company_name: form.company,
      position: form.position,
      status: nextStatus,
      rsvp_status: 'oczekuje',
      ticket_tier_id: selectedTicketTier?.id || null,
      ticket_type:
        selectedTicketTier?.ticket_type ||
        selectedTicketTier?.name ||
        (registrationMode === 'free' ? 'free' : null),
      ticket_expected_amount: selectedTicketRequiresPayment ? selectedTicketPrice : 0,
      ticket_paid_amount: 0,
      payment_status: paymentStatus,
      ticket_status: ticketStatus,
      access_status: accessStatus,
      is_active_participant: isActiveParticipant
    }])
    .select()
    .single()

  if (error) {
    console.error(error)
    alert('Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę.')
    return
  }

  localStorage.setItem(`app_id_${event.id}`, data.id)
  setApplication(data)
  setSent(true)
}

const toggleSelectedGadget = (gadgetId: string) => {
  setSubmitError(null)
  setDeclinedGadget(false)

  const gadget = gadgets.find((item: any) => item.id === gadgetId)

  if (!gadget || getGadgetStockStatus(gadget) === 'sold_out') {
    setSubmitError('Wybrany gadżet nie jest już dostępny. Wybierz inny.')
    return
  }

  setSelectedGadgets(prev => {
    const exists = prev.some(item => item.gadget_id === gadgetId)

    if (exists) {
      return prev.filter(item => item.gadget_id !== gadgetId)
    }

    const limit = Math.max(Number(event?.gadget_limit_per_person || 1), 1)

    if (limit === 1) {
      return [{ gadget_id: gadgetId }]
    }

    if (prev.length >= limit) {
      setSubmitError(`Limit wyboru gadżetów na osobę: ${limit}`)
      return prev
    }

    return [...prev, { gadget_id: gadgetId }]
  })
}

const setSelectedGadgetSize = (gadgetId: string, selectedSize: string) => {
  setSubmitError(null)

  setSelectedGadgets(prev =>
    prev.map(item =>
      item.gadget_id === gadgetId
        ? { ...item, selected_size: selectedSize }
        : item
    )
  )
}

const declineGadgetChoice = () => {
  setDeclinedGadget(true)
  setSelectedGadgets([])
  setSubmitError(null)
}

const validateGadgetChoices = () => {
  if (declinedGadget || selectedGadgets.length === 0) return true

  const limit = Math.max(Number(event?.gadget_limit_per_person || 1), 1)

  if (selectedGadgets.length > limit) {
    setSubmitError(`Limit wyboru gadżetów na osobę: ${limit}`)
    return false
  }

  const unavailable = selectedGadgets.find(choice => {
    const gadget = gadgets.find((item: any) => item.id === choice.gadget_id)
    return !gadget || getGadgetStockStatus(gadget) === 'sold_out'
  })

  if (unavailable) {
    setSubmitError('Wybrany gadżet nie jest już dostępny. Wybierz inny.')
    return false
  }

  const selectedNeedingSize = selectedGadgets.find(choice => {
    const gadget = gadgets.find((item: any) => item.id === choice.gadget_id)
    return gadget?.size_required === true && !choice.selected_size
  })

  if (selectedNeedingSize) {
    const gadget = gadgets.find((item: any) => item.id === selectedNeedingSize.gadget_id)
    setSubmitError(`Wybierz rozmiar dla gadżetu: ${gadget?.public_label || gadget?.name || 'gadżet'}`)
    return false
  }

  return true
}
const openParticipantAction = (type: 'menu' | 'gadgets' | 'workshops' | 'transport') => {
  setActionMessage(null)

  if (!application) {
    setIsModalOpen(true)
    setActionMessage('Najpierw wyślij zgłoszenie, a potem wróć tutaj, żeby uzupełnić wybory uczestników.')
    return
  }

  const menuState: Record<string, string> = {}
  const gadgetState: Record<string, { gadget_id?: string; selected_size?: string | null; declined?: boolean }> = {}
  const sessionState: Record<string, string[]> = {}
  const transportState: Record<string, { transport: string; transport_address: string }> = {}

  participantUnits.forEach((unit) => {
    const unitMeal = attendeeMealChoices.find((choice: any) => choice.attendee_unit_id === unit.id)

    if (unitMeal?.meal_id) {
      menuState[unit.id] = unitMeal.meal_id
    }

    const unitGadget = attendeeGadgetChoices.find(
      (choice: any) =>
        choice.attendee_unit_id === unit.id &&
        choice.application_id === application.id
    )

    if (unitGadget) {
      gadgetState[unit.id] = {
        gadget_id: unitGadget.gadget_id || undefined,
        selected_size: unitGadget.selected_size || null,
        declined: unitGadget.declined_gadget === true
      }
    }

    sessionState[unit.id] = attendeeSessionSignups
      .filter((choice: any) => choice.attendee_unit_id === unit.id)
      .map((choice: any) => choice.session_id)
      .filter(Boolean)

    const unitTransport = attendeeTransportChoices.find(
      (choice: any) => choice.attendee_unit_id === unit.id
    )

    transportState[unit.id] = {
      transport: unitTransport?.transport || application.transport || 'Własny dojazd',
      transport_address: unitTransport?.transport_address || application.transport_address || ''
    }
  })

  setPendingMenuChoices(menuState)
  setPendingGadgetChoices(gadgetState)
  setPendingSessionChoices(sessionState)
  setPendingTransportChoices(transportState)

  setActiveActionModal(null)
  setActiveInlinePanel(type)

  setTimeout(() => {
    document.getElementById(`public-${type}-form`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 100)
}

const ensureRealAttendeeUnits = () => {
  const hasFallbackOnly = participantUnits.some(unit => String(unit.id).startsWith('fallback-'))

  if (!application || hasFallbackOnly) {
    setActionMessage(
      'Organizator musi najpierw wygenerować jednostki Event Pass/QR albo potwierdź RSVP, aby zapisać wybory osobno dla każdej osoby.'
    )
    return false
  }

  return true
}

const saveParticipantAction = async () => {
  const currentAction = activeActionModal || activeInlinePanel

  if (!application || !event?.id || !currentAction || !ensureRealAttendeeUnits()) return

  setActionSaving(true)
  setActionMessage(null)

  try {
    if (currentAction === 'menu') {
      await supabase
        .from('event_attendee_meal_choices')
        .delete()
        .eq('event_id', event.id)
        .eq('application_id', application.id)

      const payload = participantUnits
        .map((unit) => ({
          event_id: event.id,
          application_id: application.id,
          attendee_unit_id: unit.id,
          meal_id: pendingMenuChoices[unit.id],
          quantity: 1,
          status: 'selected'
        }))
        .filter((item) => item.meal_id)

      if (payload.length > 0) {
        const { error } = await supabase
          .from('event_attendee_meal_choices')
          .insert(payload)

        if (error) throw error
      }
    }

    if (currentAction === 'gadgets') {
      await supabase
        .from('event_attendee_gadget_choices')
        .delete()
        .eq('event_id', event.id)
        .eq('application_id', application.id)

      const payload = participantUnits
        .map((unit) => {
          const choice = pendingGadgetChoices[unit.id]

          if (!choice || choice.declined) {
            return {
              event_id: event.id,
              application_id: application.id,
              attendee_unit_id: unit.id,
              declined_gadget: true,
              quantity: 0,
              status: 'declined'
            }
          }

          const gadget = gadgets.find((item: any) => item.id === choice.gadget_id)

          if (!gadget || getGadgetStockStatus(gadget, { excludeApplicationId: application.id }) === 'sold_out') return null

          return {
            event_id: event.id,
            application_id: application.id,
            attendee_unit_id: unit.id,
            gadget_id: choice.gadget_id,
            selected_size: gadget.size_required === true ? (choice.selected_size || null) : null,
            quantity: 1,
            status: 'selected',
            declined_gadget: false
          }
        })
        .filter(Boolean)

      if (payload.length > 0) {
        const { error } = await supabase
          .from('event_attendee_gadget_choices')
          .insert(payload as any[])

        if (error) throw error
      }

      await reloadAttendeeGadgetChoices()
    }

    if (currentAction === 'workshops') {
      await supabase
        .from('event_attendee_session_signups')
        .delete()
        .eq('event_id', event.id)
        .eq('application_id', application.id)

      const payload = participantUnits.flatMap((unit) =>
        (pendingSessionChoices[unit.id] || []).map((sessionId) => ({
          event_id: event.id,
          application_id: application.id,
          attendee_unit_id: unit.id,
          session_id: sessionId,
          status: 'signed_up'
        }))
      )

      if (payload.length > 0) {
        const { error } = await supabase
          .from('event_attendee_session_signups')
          .insert(payload)

        if (error) throw error
      }

      await reloadAttendeeSessionSignups()
    }

    if (currentAction === 'transport') {
      await supabase
        .from('event_attendee_transport_choices')
        .delete()
        .eq('event_id', event.id)
        .eq('application_id', application.id)

      const payload = participantUnits.map((unit) => ({
        event_id: event.id,
        application_id: application.id,
        attendee_unit_id: unit.id,
        transport: pendingTransportChoices[unit.id]?.transport || 'Własny dojazd',
        transport_address: pendingTransportChoices[unit.id]?.transport_address || null,
        status: 'selected'
      }))

      const { error } = await supabase
        .from('event_attendee_transport_choices')
        .insert(payload)

      if (error) throw error

      const mainTransport = pendingTransportChoices[participantUnits[0]?.id]

      if (mainTransport) {
        await supabase
          .from('b2b_applications')
          .update({
            transport: mainTransport.transport,
            transport_address: mainTransport.transport_address
          })
          .eq('id', application.id)
      }
    }

    await loadParticipantOperationalData()
    setActionMessage('Zapisano wybory uczestników.')

    if (activeInlinePanel === currentAction) {
      setActiveInlinePanel(null)
    }

    if (activeActionModal === currentAction) {
      setActiveActionModal(null)
    }
  } catch (err: any) {
    console.error('Participant action save error:', {
      action: currentAction,
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code
    })

    setActionMessage(`Nie udało się zapisać: ${err?.message || 'nieznany błąd'}`)
  } finally {
    setActionSaving(false)
  }
}

const createAdditionalGuest = (unitType: 'companion' | 'child', index = 0): AdditionalGuest => ({
  local_id: `${unitType}-${Date.now()}-${index}`,
  unit_type: unitType,
  display_name: unitType === 'companion' ? 'Osoba towarzysząca' : `Dziecko ${index + 1}`,
  first_name: '',
  age_group: unitType === 'child' ? 'child' : 'adult',
  same_as_main: true,
  diet: unitType === 'child' ? 'dziecięce' : '',
  allergies: '',
  transport: '',
  transport_address: '',
  selectedMealIds: [],
  selectedGadgetIds: [],
  selectedSessionIds: [],
  notes: ''
})

const updateAdditionalGuest = (localId: string, patch: Partial<AdditionalGuest>) => {
  setAdditionalGuests(prev =>
    prev.map(guest =>
      guest.local_id === localId ? { ...guest, ...patch } : guest
    )
  )
}

const setCompanionStatus = (enabled: boolean) => {
  setLogistics(prev => ({ ...prev, companion: enabled ? '1' : '0' }))

  setAdditionalGuests(prev => {
    const withoutCompanion = prev.filter(guest => guest.unit_type !== 'companion')

    return enabled
      ? [prev.find(guest => guest.unit_type === 'companion') || createAdditionalGuest('companion'), ...withoutCompanion]
      : withoutCompanion
  })
}

const setCompanionName = (name: string) => {
  const cleanName = name.trim()

  setLogistics(prev => ({ ...prev, companion: cleanName || '1' }))

  setAdditionalGuests(prev => {
    const existing =
      prev.find(guest => guest.unit_type === 'companion') ||
      createAdditionalGuest('companion')

    return [
      {
        ...existing,
        first_name: cleanName,
        display_name: cleanName || 'Osoba towarzysząca'
      },
      ...prev.filter(guest => guest.unit_type !== 'companion')
    ]
  })
}

const setKidsCount = (countValue: string) => {
  const count = Math.min(Math.max(Number(countValue || 0), 0), 7)

  setLogistics(prev => ({ ...prev, kids: String(count) }))

  setAdditionalGuests(prev => {
    const companionGuests = prev.filter(guest => guest.unit_type === 'companion')
    const currentKids = prev.filter(guest => guest.unit_type === 'child')

    const nextKids = Array.from({ length: count }, (_, index) => (
      currentKids[index] || createAdditionalGuest('child', index)
    )).map((guest, index) => ({
      ...guest,
      display_name: guest.display_name || `Dziecko ${index + 1}`,
      age_group: 'child' as const,
      diet: guest.diet || 'dziecięce'
    }))

    return [...companionGuests, ...nextKids]
  })
}

const saveAttendeeUnitsForApplication = async (app: any, finalData: any) => {
  const mainDiet = finalData.diet.join(', ')
  const mainAllergies = finalData.allergies.join(', ')
  const mainName = `${form.firstName || app.first_name || ''} ${form.lastName || app.last_name || ''}`.trim()
  const mainMealIds = finalData.selectedMeals.map((meal: any) => meal.mealId)
  const mainGadgetIds = selectedGadgets.map(choice => choice.gadget_id)
  const mainSessionIds = selectedSessions

  const buildUnit = (guest: AdditionalGuest | null) => {
    if (!guest) {
      return {
        event_id: event.id,
        application_id: app.id,
        unit_type: 'main',
        display_name: mainName || app.email || 'Gość',
        first_name: form.firstName || app.first_name || null,
        last_name: form.lastName || app.last_name || null,
        email: form.email || app.email || null,
        phone: form.phone || app.phone || null,
        age_group: 'adult',
        diet: mainDiet || null,
        allergies: mainAllergies || null,
        ticket_type: app.ticket_type || null,
        access_status: app.access_status || app.status || 'pending',
        qr_token: crypto.randomUUID(),
        qr_status: 'active',
        same_as_main: false,
        notes: finalData.extra_notes || null,
        source_data: {
          transport: finalData.transport,
          transport_address: finalData.transport_address,
          selectedMealIds: mainMealIds,
          selectedGadgetIds: mainGadgetIds,
          selectedSessionIds: mainSessionIds
        },
        updated_at: new Date().toISOString()
      }
    }

    const inherited = guest.same_as_main

    return {
      event_id: event.id,
      application_id: app.id,
      unit_type: guest.unit_type,
      display_name: guest.first_name || guest.display_name,
      first_name: guest.first_name || null,
      last_name: null,
      email: null,
      phone: null,
      age_group: guest.age_group,
      diet: inherited ? (mainDiet || null) : (guest.diet || null),
      allergies: inherited ? (mainAllergies || null) : (guest.allergies || null),
      ticket_type: app.ticket_type || null,
      access_status: app.access_status || app.status || 'pending',
      qr_token: crypto.randomUUID(),
      qr_status: 'active',
      same_as_main: inherited,
      notes: guest.notes || null,
      source_data: {
        transport: inherited ? finalData.transport : guest.transport,
        transport_address: inherited ? finalData.transport_address : guest.transport_address,
        selectedMealIds: inherited ? mainMealIds : guest.selectedMealIds,
        selectedGadgetIds: inherited ? mainGadgetIds : guest.selectedGadgetIds,
        selectedSessionIds: inherited ? mainSessionIds : guest.selectedSessionIds
      },
      updated_at: new Date().toISOString()
    }
  }

  const saveUnitChoices = async (unit: any, unitId: string, guest: AdditionalGuest | null) => {
    const inherited = !guest || guest.same_as_main
    const mealIds = inherited ? mainMealIds : guest.selectedMealIds
    const gadgetIds = inherited ? mainGadgetIds : guest.selectedGadgetIds
    const sessionIds = inherited ? mainSessionIds : guest.selectedSessionIds
    const transport = inherited ? finalData.transport : guest.transport
    const transportAddress = inherited ? finalData.transport_address : guest.transport_address

    const deleteFrom = async (tableName: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('event_id', event.id)
        .eq('attendee_unit_id', unitId)

      if (error) console.warn(`${tableName} delete skipped:`, error.message)
    }

    await deleteFrom('event_attendee_meal_choices')

    if (mealIds.length > 0) {
      const { error } = await supabase
        .from('event_attendee_meal_choices')
        .insert(mealIds.map((mealId: string) => ({
          event_id: event.id,
          application_id: app.id,
          attendee_unit_id: unitId,
          meal_id: mealId,
          portion_size: 'standard',
          will_attend: true
        })))

      if (error) console.warn('event_attendee_meal_choices insert skipped:', error.message)
    }

    await deleteFrom('event_attendee_gadget_choices')

    if (gadgetIds.length > 0) {
      const payload = gadgetIds
        .filter(Boolean)
        .filter((gadgetId: string) => {
          const gadget = gadgets.find((item: any) => item.id === gadgetId)
          return gadget && getGadgetStockStatus(gadget, { excludeApplicationId: app.id }) !== 'sold_out'
        })
        .map((gadgetId: string) => {
          const selected = selectedGadgets.find(choice => choice.gadget_id === gadgetId)
          const gadget = gadgets.find((item: any) => item.id === gadgetId)

          return {
            event_id: event.id,
            application_id: app.id,
            attendee_unit_id: unitId,
            gadget_id: gadgetId,
            quantity: 1,
            selected_size: inherited && gadget?.size_required === true ? (selected?.selected_size || null) : null,
            status: 'selected',
            declined_gadget: false,
            notes: null
          }
        })

      if (payload.length > 0) {
        const { error } = await supabase
          .from('event_attendee_gadget_choices')
          .insert(payload)

        if (error) {
          console.error('RSVP gadget save error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            payload
          })
          console.warn('event_attendee_gadget_choices insert skipped:', error.message)
        }
      }
    }

    await deleteFrom('event_attendee_session_signups')

    if (sessionIds.length > 0) {
      const { error } = await supabase
        .from('event_attendee_session_signups')
        .insert(sessionIds.map((sessionId: string) => ({
          event_id: event.id,
          application_id: app.id,
          attendee_unit_id: unitId,
          session_id: sessionId,
          status: 'signed_up'
        })))

      if (error) console.warn('event_attendee_session_signups insert skipped:', error.message)
    }

    await deleteFrom('event_attendee_transport_choices')

    if (transport || transportAddress) {
      const { error } = await supabase
        .from('event_attendee_transport_choices')
        .insert([{
          event_id: event.id,
          application_id: app.id,
          attendee_unit_id: unitId,
          transport,
          transport_address: transportAddress,
          notes: unit.notes || null
        }])

      if (error) console.warn('event_attendee_transport_choices insert skipped:', error.message)
    }
  }

  try {
    const { data: existingUnits, error: loadError } = await supabase
      .from('event_attendee_units')
      .select('*')
      .eq('event_id', event.id)
      .eq('application_id', app.id)
      .order('created_at', { ascending: true })

    if (loadError) {
      console.warn('Event attendee units unavailable:', loadError.message)
      return
    }

    const sourceGuests = [null, ...additionalGuests]
    const unitsToSave = sourceGuests.map(guest => buildUnit(guest))

    for (const [unitIndex, unit] of unitsToSave.entries()) {
      const existingOfType = (existingUnits || []).filter((existing: any) => existing.unit_type === unit.unit_type)
      const typeIndex = unitsToSave.filter(item => item.unit_type === unit.unit_type).indexOf(unit)
      const existing = existingOfType[typeIndex]
      const data = existing?.qr_token ? { ...unit, qr_token: existing.qr_token } : unit
      let savedUnitId = existing?.id

      if (existing?.id) {
        const { error } = await supabase
          .from('event_attendee_units')
          .update(data)
          .eq('id', existing.id)

        if (error) console.warn('Event attendee unit update failed:', error.message)
      } else {
        const { data: inserted, error } = await supabase
          .from('event_attendee_units')
          .insert([data])
          .select('id')
          .single()

        if (error) console.warn('Event attendee unit insert failed:', error.message)
        savedUnitId = inserted?.id
      }

      if (savedUnitId) {
        await saveUnitChoices(data, savedUnitId, sourceGuests[unitIndex])
      }
    }

    const { data: refreshedUnits, error: refreshedUnitsError } = await supabase
      .from('event_attendee_units')
      .select('*')
      .eq('event_id', event.id)
      .eq('application_id', app.id)
      .order('created_at', { ascending: true })

    if (refreshedUnitsError) {
      console.warn('event_attendee_units reload skipped:', refreshedUnitsError.message)
    } else {
      setAttendeeUnits(refreshedUnits || [])
    }

    await reloadAttendeeGadgetChoices()
    await reloadAttendeeSessionSignups()
  } catch (err) {
    console.warn('Event attendee units save skipped:', err)
  }
}

const handleUpdateLogistics = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitError(null)

  if (!validateGadgetChoices()) return

  try {
    const finalData = isAttending
      ? logistics
      : { ...logistics, extra_notes: 'REZYGNACJA', transport: '-', diet: [] }

    const { error } = await supabase
      .from('b2b_applications')
      .update({
        rsvp_status: isAttending ? 'potwierdzone' : 'odrzucone',
        diet: finalData.diet.join(', '),
        allergies: finalData.allergies.join(', '),
        companion: finalData.companion || '0',
        kids: String(finalData.kids || 0),
        transport: finalData.transport,
        transport_address: finalData.transport_address,
        extra_notes: finalData.extra_notes,
        alcohol_preference: finalData.alcohol.join(', '),
        sweets_preference: finalData.sweets.join(', ')
      })
      .eq('id', application.id)

    if (error) throw error

    if (isAttending) {
      const { error: selectionsError } = await supabase
        .from('guest_selections')
        .upsert({
          application_id: application.id,
          event_id: event.id,
          selected_sessions: selectedSessions,
          selected_gadgets: selectedGadgets.map(choice => choice.gadget_id),
          gadget_size: selectedGadgets.map(choice => choice.selected_size).filter(Boolean).join(', ') || null
        })

      if (selectionsError) throw selectionsError

      await saveAttendeeUnitsForApplication(application, finalData)
    }

    setRsvpSent(true)
    setIsModalOpen(false)
  } catch (err: any) {
    console.error('RSVP submit error:', err)
    setSubmitError(`Nie udało się zapisać RSVP: ${err?.message || 'Nieznany błąd'}`)
  }
}

const handleAddCarpoolAd = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!application) return

  const { error } = await supabase
    .from('carpooling_ads')
    .insert({
      event_id: event.id,
      application_id: application.id,
      route_from: newAd.route_from,
      seats_avail: newAd.seats_avail,
      contact_sh: newAd.contact_sh
    })

  if (!error) {
    await loadCarpoolingAdsForEvent(event.id)
    setIsCarpoolModalOpen(false)
    setNewAd({ route_from: '', seats_avail: 1, contact_sh: '' })
  }
}

const openCarpoolReserveModal = (ad: any) => {
  if (!application) {
    setCarpoolMessage('Najpierw wyślij formularz zgłoszeniowy, żeby zarezerwować miejsce w carpoolingu.')
    setIsModalOpen(true)
    return
  }

  setSelectedCarpoolAd(ad)
  setCarpoolPassengerPhone(application?.phone || '')
  setCarpoolMessage(null)
  setIsCarpoolReserveModalOpen(true)
}

const handleReserveCarpoolSeat = async (ad: any, passengerPhoneFromModal?: string) => {
  if (!application) {
    setCarpoolMessage('Najpierw wyślij formularz zgłoszeniowy, żeby zarezerwować miejsce w carpoolingu.')
    setIsModalOpen(true)
    return
  }

  if (!event?.id || !ad?.id) return

  const passengerPhone = String(
    passengerPhoneFromModal || carpoolPassengerPhone || application?.phone || ''
  ).trim()

  if (!passengerPhone) {
    setCarpoolMessage('Podaj numer telefonu, żeby kierowca mógł się z Tobą skontaktować.')
    return
  }

  const routeLabel = `Carpooling: ${ad.route_from || 'trasa uczestnika'}`

  setCarpoolSavingId(ad.id)
  setCarpoolMessage(null)

  try {
    const { data: currentAd, error: adLoadError } = await supabase
      .from('carpooling_ads')
      .select('id, event_id, application_id, route_from, seats_avail, used, contact_sh')
      .eq('id', ad.id)
      .single()

    if (adLoadError || !currentAd) {
      throw adLoadError || new Error('Nie znaleziono ogłoszenia carpooling.')
    }

    const seatsAvail = Number(currentAd.seats_avail || 0)
    const used = Number(currentAd.used || 0)

    if (seatsAvail <= 0) {
      setCarpoolMessage('To ogłoszenie nie ma ustawionej liczby miejsc.')
      return
    }

    const { data: existingReservation, error: existingReservationError } = await supabase
      .from('carpooling_reservations')
      .select('id, status')
      .eq('carpooling_ad_id', currentAd.id)
      .eq('passenger_application_id', application.id)
      .maybeSingle()

    if (existingReservationError) {
      throw existingReservationError
    }

    if (existingReservation?.id && existingReservation.status === 'reserved') {
      const { data: activeReservations } = await supabase
        .from('carpooling_reservations')
        .select('id')
        .eq('carpooling_ad_id', currentAd.id)
        .eq('status', 'reserved')

      const recalculatedUsed = activeReservations?.length || used

      await supabase
        .from('carpooling_ads')
        .update({
          used: Math.min(recalculatedUsed, seatsAvail),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAd.id)

      await loadCarpoolingAdsForEvent(event.id)

      setCarpoolMessage('Masz już zarezerwowane miejsce w tym przejeździe.')
      setIsCarpoolReserveModalOpen(false)
      setSelectedCarpoolAd(null)
      return
    }

    const { data: activeReservationsBefore, error: reservationsBeforeError } = await supabase
      .from('carpooling_reservations')
      .select('id')
      .eq('carpooling_ad_id', currentAd.id)
      .eq('status', 'reserved')

    if (reservationsBeforeError) {
      throw reservationsBeforeError
    }

    const reservedCountBefore = activeReservationsBefore?.length || 0

    if (reservedCountBefore >= seatsAvail) {
      await supabase
        .from('carpooling_ads')
        .update({
          used: seatsAvail,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAd.id)

      setCarpoolMessage('Brak wolnych miejsc w tym przejeździe.')
      return
    }

    const { error: reservationInsertError } = await supabase
      .from('carpooling_reservations')
      .insert({
        event_id: event.id,
        carpooling_ad_id: currentAd.id,
        driver_application_id: currentAd.application_id || null,
        passenger_application_id: application.id,
        driver_phone: currentAd.contact_sh || ad?.b2b_applications?.phone || null,
        passenger_phone: passengerPhone,
        route_from: currentAd.route_from || ad.route_from || null,
        status: 'reserved',
        updated_at: new Date().toISOString()
      })

    if (reservationInsertError) {
      throw reservationInsertError
    }

    const { error: appError } = await supabase
      .from('b2b_applications')
      .update({
        phone: application.phone || passengerPhone,
        transport: 'Carpooling',
        transport_address: routeLabel
      })
      .eq('id', application.id)

    if (appError) throw appError

    const realUnits = participantUnits.filter(
      (unit: any) => !String(unit.id || '').startsWith('fallback-')
    )

    if (realUnits.length > 0) {
      const { error: deleteError } = await supabase
        .from('event_attendee_transport_choices')
        .delete()
        .eq('event_id', event.id)
        .eq('application_id', application.id)

      if (deleteError) {
        console.warn('event_attendee_transport_choices delete unavailable:', deleteError.message)
      }

      const payload = realUnits.map((unit: any) => ({
        event_id: event.id,
        application_id: application.id,
        attendee_unit_id: unit.id,
        transport: 'Carpooling',
        transport_address: routeLabel,
        status: 'selected'
      }))

      const { error: insertError } = await supabase
        .from('event_attendee_transport_choices')
        .insert(payload)

      if (insertError) {
        console.warn('event_attendee_transport_choices insert unavailable:', insertError.message)
      }
    }

    const { data: activeReservationsAfter, error: reservationsAfterError } = await supabase
      .from('carpooling_reservations')
      .select('id')
      .eq('carpooling_ad_id', currentAd.id)
      .eq('status', 'reserved')

    if (reservationsAfterError) {
      throw reservationsAfterError
    }

    const recalculatedUsed = activeReservationsAfter?.length || reservedCountBefore + 1

    const { error: usedUpdateError } = await supabase
      .from('carpooling_ads')
      .update({
        used: Math.min(recalculatedUsed, seatsAvail),
        updated_at: new Date().toISOString()
      })
      .eq('id', currentAd.id)

    if (usedUpdateError) throw usedUpdateError

    await loadCarpoolingAdsForEvent(event.id)

    setApplication((prev: any) => prev ? ({
      ...prev,
      phone: prev.phone || passengerPhone,
      transport: 'Carpooling',
      transport_address: routeLabel
    }) : prev)

    await loadParticipantOperationalData()

    setCarpoolMessage('Zarezerwowano miejsce w carpoolingu. Organizator zobaczy dane w plannerze transportu.')
    setIsCarpoolReserveModalOpen(false)
    setSelectedCarpoolAd(null)
    setCarpoolPassengerPhone('')
  } catch (error: any) {
    console.error('Carpool reservation error:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      adId: ad?.id
    })

    setCarpoolMessage(`Nie udało się zarezerwować miejsca: ${error?.message || 'nieznany błąd'}`)
  } finally {
    setCarpoolSavingId(null)
  }
}

const openRsvpModal = (attending: boolean) => {
  setIsAttending(attending)
  setIsModalOpen(true)
}

const isApproved = useMemo(() => application?.status === 'approved', [application])

const getStopsForRoute = useCallback((routeId: string) => {
  return transportStops
    .filter((stop: any) => stop.route_id === routeId)
    .sort((a: any, b: any) => Number(a.stop_order || 0) - Number(b.stop_order || 0))
}, [transportStops])

const formatTransportTime = (value?: string | null) => {
  if (!value) return ''
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?!.*(?:Z|[+-]\d{2}:?\d{2}))/.test(value)) {
    return value.slice(11, 16)
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

const formatEventDateTime = (value?: string | null) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?!.*(?:Z|[+-]\d{2}:?\d{2}))/.test(value)) {
    const [datePart, timePart] = value.split('T')
    return `${datePart} ${timePart.slice(0, 5)}`
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
}

const toggleArrayItem = (arr: string[], item: string, setter: (val: string[]) => void) => {
  arr.includes(item)
    ? setter(arr.filter(i => i !== item))
    : setter([...arr, item])
}

// --- ZMIENNE STYLISTYCZNE (DYNAMICZNE) ---
const safeBodyFont = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const eventTheme = {
  primaryColor: event?.primary_color || event?.theme_primary_color || '#253a2a',
  accentColor: event?.accent_color || event?.secondary_color || event?.theme_accent_color || '#e8ce7a',
  backgroundColor: event?.page_bg_color || event?.bg_color || '#0a0a0a',
  backgroundImage: event?.page_bg_image_url || event?.cover_image_url || event?.hero_image_url || '',
  fontFamily: event?.font_family || event?.body_font || safeBodyFont,
  headingFont: event?.heading_font || safeBodyFont
}

const primColor = eventTheme.primaryColor
const secColor = eventTheme.accentColor
const bgColor = eventTheme.backgroundColor
const txtColor = event?.text_color || '#ffffff'
const headColor = event?.heading_color || eventTheme.accentColor
const cardBg = event?.card_bg_color || '#111111'
const headFont = eventTheme.headingFont
const bodyFont = eventTheme.fontFamily

const googleFontsHref = useMemo(
  () => getGoogleFontsStylesheetHref([headFont, bodyFont]),
  [headFont, bodyFont]
)

const shape = event?.element_shape || 'rounded-[40px]'
const heroGradientColor = event?.hero_gradient_color || '#ffffff'
const themeSectionBg = event?.theme_bg_color || '#ffffff'
const speakersSectionBg = event?.speakers_section_bg_color || '#ffffff'
const sponsorsSectionBg = event?.sponsors_section_bg_color || '#ffffff'
const agendaSectionBg = event?.agenda_section_bg_color || '#ffffff'
const speakerSectionTitle = event?.speakers_section_title || 'Prelegenci'
const speakerSectionDescription = event?.speakers_section_description || ''
const agendaSectionTitle = event?.agenda_section_title || 'Agenda'
const agendaSectionDescription = event?.agenda_section_description || ''
const sponsorsSectionTitle = event?.sponsors_section_title || 'Partnerzy i sponsorzy'
const sponsorsSectionDescription = event?.sponsors_section_description || ''
const sponsorLogoStyle = event?.sponsor_logo_style || 'original'
const sponsorLogoTintColor = event?.sponsor_logo_tint_color || event?.primary_color || '#253a2a'

const effectiveSponsorLogoTintColor =
  sponsorLogoTintColor.toLowerCase() === sponsorsSectionBg.toLowerCase()
    ? headColor
    : sponsorLogoTintColor

const footerMaterialsTitle = event?.materials_footer_title || 'Materiały do pobrania'

const isSectionVisible = (key: string) => {
  const value = event?.[`${key}_section_visible`]
  return value === true || value === 'true'
}

useEffect(() => {
  setVisibleAgendaCount(3)
  lastAgendaRevealScrollRef.current = 0
}, [sessions.length])

useEffect(() => {
  if (!isSectionVisible('agenda')) return
  if (visibleAgendaCount >= sessions.length) return

  const target = agendaLoadMoreRef.current
  if (!target) return

  let frameId = 0
  const revealNextBatch = () => {
    if (frameId) return
    frameId = window.requestAnimationFrame(() => {
      frameId = 0
      const rect = target.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const hasScrolledEnough = scrollY - lastAgendaRevealScrollRef.current > 220

      if (rect.top <= window.innerHeight + 120 && hasScrolledEnough) {
        lastAgendaRevealScrollRef.current = scrollY
        setVisibleAgendaCount(current => Math.min(current + 3, sessions.length))
      }
    })
  }

  window.addEventListener('scroll', revealNextBatch, { passive: true })

  return () => {
    if (frameId) window.cancelAnimationFrame(frameId)
    window.removeEventListener('scroll', revealNextBatch)
  }
}, [event?.agenda_section_visible, sessions.length, visibleAgendaCount])

const visibleAgendaSessions = sessions.slice(0, visibleAgendaCount)

const sponsorMarqueeItems = useMemo(() => {
  if (sponsors.length === 0) return []
  const repeatCount = Math.max(4, Math.ceil(8 / sponsors.length))
  const base = Array.from({ length: repeatCount }, () => sponsors).flat()
  return [...base, ...base]
}, [sponsors])

const gadgetMarqueeItems = useMemo(() => {
  if (gadgets.length === 0) return []
  const repeatCount = Math.max(4, Math.ceil(10 / gadgets.length))
  const base = Array.from({ length: repeatCount }, () => gadgets).flat()
  return [...base, ...base]
}, [gadgets])

const galleryImages = useMemo(
  () => [event?.image_1_url, event?.image_2_url, event?.image_3_url].filter(Boolean) as string[],
  [event?.image_1_url, event?.image_2_url, event?.image_3_url]
)

const scrollGalleryToIndex = useCallback((index: number) => {
  if (galleryImages.length === 0) return
  const safeIndex = (index + galleryImages.length) % galleryImages.length
  setActiveGalleryIndex(safeIndex)
  const track = galleryTrackRef.current
  const item = track?.children[safeIndex] as HTMLElement | undefined
  if (!track || !item) return

  const targetLeft = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2
  track.scrollTo({
    left: Math.max(targetLeft, 0),
    behavior: 'smooth'
  })
}, [galleryImages.length])

useEffect(() => {
  if (galleryImages.length <= 1) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const timer = window.setInterval(() => {
    setActiveGalleryIndex(current => {
      const nextIndex = (current + 1) % galleryImages.length
      const track = galleryTrackRef.current
      const item = track?.children[nextIndex] as HTMLElement | undefined
      if (track && item) {
        const targetLeft = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2
        track.scrollTo({
          left: Math.max(targetLeft, 0),
          behavior: 'smooth'
        })
      }
      return nextIndex
    })
  }, 4500)

  return () => window.clearInterval(timer)
}, [galleryImages.length])

const sectionTitle = (key: string, fallback: string) =>
  event?.[`${key}_section_title`] || fallback

const sectionDescription = (key: string, fallback = '') =>
  event?.[`${key}_section_description`] || fallback

const sectionImage = (key: string) =>
  event?.[`${key}_section_image_url`] || ''

const sectionCta = (key: string, fallback = '') =>
  event?.[`${key}_section_cta_label`] || fallback

const socialLinks = [
  { key: 'website', label: 'WWW', href: event?.social_website_url, icon: Globe },
  { key: 'instagram', label: 'Instagram', href: event?.social_instagram_url, icon: Instagram },
  { key: 'facebook', label: 'Facebook', href: event?.social_facebook_url, icon: Facebook },
  { key: 'linkedin', label: 'LinkedIn', href: event?.social_linkedin_url, icon: Linkedin },
  { key: 'youtube', label: 'YouTube', href: event?.social_youtube_url, icon: Youtube },
  { key: 'tiktok', label: 'TikTok', href: event?.social_tiktok_url, icon: LinkIcon },
  { key: 'email', label: 'Email', href: event?.social_contact_email ? `mailto:${event.social_contact_email}` : null, icon: Mail }
].filter(item => item.href)

const themeImages = [
  event?.theme_main_image_url,
  event?.theme_image_1_url,
  event?.theme_image_2_url,
  event?.theme_image_3_url,
  event?.theme_image_4_url
].filter(Boolean)

const customThemeBlocks = [1, 2, 3]
  .map(num => ({
    title: event?.[`theme_custom_title_${num}`],
    text: event?.[`theme_custom_text_${num}`]
  }))
  .filter(block => block.title || block.text)

const showThemeSection = isSectionVisible('theme')

const scrollToFirstAvailableSection = () => {
  const ids = [
    'public-menu',
    'public-gadgets',
    'public-workshops',
    'public-transport',
    'public-transport-routes',
    'public-carpooling',
    'public-eventpass',
    'public-materials',
    'public-documents',
    'public-live',
    'public-agenda',
    'public-speakers',
    'public-sponsors'
  ]

  const target = ids
    .map((sectionId) => document.getElementById(sectionId))
    .find(Boolean)

  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

  // ==========================================
  // 5. RENDEROWANIE WIDOKU (JSX)
  // ==========================================
  return (
    <div
      className="rsvp-copy min-h-screen overflow-x-hidden relative selection:bg-emerald-500 selection:text-white"
      style={{
        backgroundColor: bgColor,
        color: txtColor,
        fontFamily: bodyFont,
        '--event-primary': primColor,
        '--event-accent': secColor,
        '--event-bg': bgColor,
        '--event-heading': headColor,
        '--event-font': bodyFont,
        '--event-heading-font': headFont,
        '--event-primary-soft': `${primColor}22`,
        '--event-accent-soft': `${secColor}22`
      } as any}
    >
      {googleFontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsHref} />
        </>
      )}

      {/* GLOBALNE STYLE I TŁO */}
      <style dangerouslySetInnerHTML={{__html: `
        .text-reveal { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
        .glass-card { background: ${cardBg}CC; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${secColor}40; border-radius: 10px; }

        /* Klasy pomocnicze dla galerii prelegentów i partnerów */
        .partner-logo { filter: grayscale(100%) opacity(0.5) brightness(200%); transition: all 0.5s ease; }
        .partner-logo:hover { filter: grayscale(0%) opacity(1) brightness(100%); }
        .speaker-card-overlay { background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); }
        input, select, textarea, button { font-family: ${safeBodyFont}; }
        .rsvp-copy { font-family: ${safeBodyFont}; }
      `}} />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${secColor}08 0%, transparent 70%)` }}
        />
      </div>

 {/* ==========================================
 NOWE HERO - OTWARTA KOMPOZYCJA I TAŃCZĄCE ELEMENTY
 ========================================== */}
      <section className="relative z-10 min-h-screen overflow-hidden flex items-center px-6 py-24">

        {/* 1. KINOWE TŁO: Zdjęcie wyłania się z rozmycia i powoli przybliża (Ken Burns effect) */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0, filter: 'blur(20px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          {event?.cover_image_url ? (
            <motion.img
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              src={event.cover_image_url}
              className="w-full h-full object-cover"
              alt={event?.title || 'Tło wydarzenia'}
            />
          ) : (
            <div className="w-full h-full" style={{ background: `radial-gradient(circle at 50% 35%, ${primColor}35, transparent 35%), linear-gradient(135deg, ${bgColor}, #050505)` }} />
          )}

          {/* Otwarta maska tła - płynne przejście z obrazu do koloru strony */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 0%, ${bgColor} 95%)` }} />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* 2. TAŃCZĄCE ŚWIATŁA W TLE */}
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] z-[1] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-40 mix-blend-screen pointer-events-none"
          style={{ backgroundColor: primColor }}
        />

        {/* 3. GŁÓWNA TREŚĆ - ASYMETRYCZNA */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 mt-16">

          {/* Lewa strona - Typografia wyłaniająca się od dołu */}
          <div className="lg:w-3/5 relative">
            {event?.logo_url && (
              <motion.img
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.2, type: 'spring' }}
                src={event.logo_url}
                className="h-20 md:h-32 object-contain mb-12 drop-shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                alt="Logo"
              />
            )}

            <div className="overflow-hidden pb-4">
              <motion.h1
                initial={{ y: "110%", opacity: 0, rotateZ: 3 }}
                animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.85] tracking-tighter"
                style={{ fontFamily: headFont, color: headColor }}
              >
                {event?.title}
              </motion.h1>
            </div>

            {event?.description && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 0.8, x: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="max-w-xl mt-6 text-lg md:text-xl leading-relaxed font-medium"
              >
                {event.description}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <button
                type="button"
                onClick={scrollToFirstAvailableSection}
                className="px-8 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] text-black shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
                style={{ backgroundColor: primColor }}
              >
                Odkryj wydarzenie <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>

          {/* Prawa strona - Tańczące, swobodne bańki z danymi (Zamiast kafelka) */}
          <div className="lg:w-2/5 h-[400px] w-full relative hidden md:block">

            {/* Bańka 1: Data */}
            <motion.div
              animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 backdrop-blur-3xl bg-white/[0.03] border border-white/10 p-7 rounded-[40px] shadow-2xl flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${primColor}20` }}>
                <Calendar size={24} style={{ color: primColor }} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Kiedy?</p>
              <p className="font-black text-xl whitespace-nowrap text-white">
                {event?.event_date ? new Date(event.event_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data wkrótce'}
              </p>
            </motion.div>

            {/* Bańka 2: Lokalizacja */}
            <motion.div
              animate={{ y: [15, -15, 15], rotate: [2, -2, 2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-0 backdrop-blur-3xl bg-black/40 border border-white/5 p-7 rounded-[40px] shadow-2xl flex flex-col items-start max-w-[280px]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${secColor}20` }}>
                <MapPin size={20} style={{ color: secColor }} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Gdzie?</p>
              <p className="font-black text-lg text-white leading-tight">
                {event?.location || 'Lokalizacja wkrótce'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>



  {/* ==========================================
          METRYKI EKO - ANIMOWANE LICZNIKI Z WYPUKŁYM HOVEREM I ZDJĘCIE Z POŚWIATĄ
          ========================================== */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden border-t border-white/5" style={{ backgroundColor: bgColor }}>
        {/* Delikatny, organiczny blask w tle */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none opacity-50"
          style={{ backgroundColor: `${primColor}15` }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 items-center">
            
            {/* --- LEWA KOLUMNA: TYPOGRAFIA I LICZNIKI --- */}
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -40 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-1/2"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10"
                style={{ color: primColor, backgroundColor: `${primColor}10` }}
              >
                <Leaf size={14} /> Live Eco Tracking
              </span>

              <h2
                className="text-5xl md:text-7xl font-black mb-16 tracking-tighter leading-[0.9]"
                style={{ fontFamily: headFont, color: headColor }}
              >
                Tworzymy to wydarzenie w sposób zrównoważony
              </h2>

              {/* Asymetryczna siatka metryk z efektem wypukłości (Scale & Shadow) */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
                
                {/* Metryka 1 */}
                <motion.div 
                  initial="rest"
                  whileHover="hover"
                  className="flex flex-col cursor-default"
                >
                  <motion.p 
                    variants={{
                      rest: { scale: 1, textShadow: `0 6px 12px ${primColor}50` },
                      hover: { scale: 1.15, textShadow: `0 25px 40px ${primColor}90` }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter origin-left w-fit" 
                    style={{ color: primColor }}
                  >
                    <AnimatedCounter value={carbonData.co2Total} />
                    <span className="text-3xl md:text-5xl opacity-50 ml-1">kg</span>
                  </motion.p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50 transition-colors" style={{ color: txtColor }}>
                    CO₂ Oszczędzone
                  </p>
                </motion.div>

                {/* Metryka 2 (Przesunięta w dół) */}
                <motion.div 
                  initial="rest"
                  whileHover="hover"
                  className="flex flex-col md:mt-16 cursor-default"
                >
                  <motion.p 
                    variants={{
                      rest: { scale: 1, textShadow: `0 6px 12px ${secColor}50` },
                      hover: { scale: 1.15, textShadow: `0 25px 40px ${secColor}90` }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter origin-left w-fit" 
                    style={{ color: secColor }}
                  >
                    <AnimatedCounter value={carbonData.foodWastePrevented} />
                    <span className="text-3xl md:text-5xl opacity-50 ml-1">kg</span>
                  </motion.p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50 transition-colors" style={{ color: txtColor }}>
                    Jedzenia Uratowane
                  </p>
                </motion.div>

                {/* Metryka 3 */}
                <motion.div 
                  initial="rest"
                  whileHover="hover"
                  className="flex flex-col cursor-default"
                >
                  <motion.p 
                    variants={{
                      rest: { scale: 1, textShadow: `0 6px 12px ${primColor}50` },
                      hover: { scale: 1.15, textShadow: `0 25px 40px ${primColor}90` }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter origin-left w-fit" 
                    style={{ color: primColor }}
                  >
                    <AnimatedCounter value={carbonData.transportOptimized} />
                    <span className="text-4xl md:text-6xl opacity-50 ml-1">%</span>
                  </motion.p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50 transition-colors" style={{ color: txtColor }}>
                    Optymalizacja Tras
                  </p>
                </motion.div>

                {/* Metryka 4 (Przesunięta w dół) */}
                <motion.div 
                  initial="rest"
                  whileHover="hover"
                  className="flex flex-col md:mt-16 cursor-default"
                >
                  <motion.p 
                    variants={{
                      rest: { scale: 1, textShadow: `0 6px 12px ${secColor}50` },
                      hover: { scale: 1.15, textShadow: `0 25px 40px ${secColor}90` }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter origin-left w-fit" 
                    style={{ color: secColor }}
                  >
                    <AnimatedCounter value={approvedList.length} />
                  </motion.p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50 transition-colors" style={{ color: txtColor }}>
                    Gości Zaufało
                  </p>
                </motion.div>

              </div>
            </motion.div>

            {/* --- PRAWA KOLUMNA: POWIĘKSZONE ZDJĘCIE Z POŚWIATĄ (TINT) --- */}
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 40 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:w-1/2 relative group cursor-crosshair"
            >
              {/* Poszerzone i podwyższone zdjęcie */}
              <div className="relative overflow-hidden w-full aspect-[3/4] md:aspect-[4/5] md:w-[110%] md:-mr-[10%] rounded-[48px] bg-white/5 border border-white/5 shadow-2xl ml-auto">
                {event?.image_1_url || event?.image_2_url || event?.image_3_url || event?.cover_image_url ? (
                  <img
                    src={event?.image_1_url || event?.image_2_url || event?.image_3_url || event?.cover_image_url}
                    alt={event?.title || 'Klimat wydarzenia'}
                    // Dodano bazowy lekki filtr grayscale, żeby tło zdominowało kolor, a hover przywraca pełnię barw
                    className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                    <Leaf size={64} className="opacity-10 text-white" />
                  </div>
                )}
                
                {/* 1. Poświata (Overlay) w kolorze tła. Zmniejszona do 40-50% i w pełni oparta na klasach Tailwinda! */}
                <div
                  className="absolute inset-0 opacity-50 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
                  style={{ backgroundColor: bgColor }}
                />

                {/* 2. Stałe wtapianie u dołu i z lewej krawędzi (żeby zawsze płynnie łączyło się ze stroną) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    background: `linear-gradient(to top, ${bgColor} 5%, transparent 40%), linear-gradient(to right, ${bgColor} -10%, transparent 20%)` 
                  }}
                />
              </div>

              {/* Szklana karta z tekstem nałożona na zdjęcie z głębszym wejściem na obraz */}
              <div 
                className="relative z-20 -mt-32 md:-mt-48 md:-ml-24 p-8 md:p-12 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] w-[95%] md:w-full transition-transform duration-700 group-hover:translate-x-2 group-hover:-translate-y-2"
                style={{ backgroundColor: `${cardBg}E6` }} // Tło z CMS z nałożonym prześwitem
              >
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-5 border border-white/10 shadow-inner"
                  style={{ color: primColor, backgroundColor: `${primColor}15` }}
                >
                  <Recycle size={12} /> Paperless
                </span>

                <h3
                  className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-5"
                  style={{ color: headColor }}
                >
                  Jeden aktualny link zamiast papierowych wydruków
                </h3>

                <p className="text-sm md:text-base opacity-60 leading-relaxed font-medium" style={{ color: txtColor }}>
                  Organizator może aktualizować informacje logistyczne na bieżąco, całkowicie eliminując potrzebę drukowania setek stron agend i biletów.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

   {/* ==========================================
          MOTYW EVENTU / DRESS CODE - ROZSTRZELONY KOLAŻ I KAFELKI Z POŚWIATĄ
          ========================================== */}
      {showThemeSection && (
        <section
          id="public-theme"
          className="relative z-10 py-24 md:py-32 px-6 overflow-hidden border-t border-white/5"
          style={{
            backgroundColor: event?.theme_bg_color || themeSectionBg || bgColor,
          }}
        >
          {/* Kinowy blask w tle */}
          <div
            className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none"
            style={{ backgroundColor: `${event?.theme_accent_color || primColor}10` }}
          />

          <div className="relative max-w-7xl mx-auto">
            
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
              
              {/* --- LEWA KOLUMNA: TREŚCI (KAFELKI) --- */}
              <div className="w-full lg:w-1/2 flex flex-col z-20">
                
                {/* Nagłówek sekcji */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="mb-12"
                >
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 shadow-lg backdrop-blur-md"
                    style={{
                      backgroundColor: `${event?.theme_accent_color || primColor}15`,
                      color: event?.theme_accent_color || primColor,
                      border: `1px solid ${event?.theme_accent_color || primColor}30`
                    }}
                  >
                    <Sparkles size={14} />
                    {event?.theme_name || event?.theme_nav_label || 'Motyw Eventu'}
                  </span>

                  <h2
                    className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6"
                    style={{ fontFamily: headFont, color: event?.theme_heading_color || headColor || '#ffffff' }}
                  >
                    {event?.theme_header || 'Klimat wydarzenia'}
                  </h2>

                  {event?.theme_subheader && (
                    <p 
                      className="text-xl md:text-2xl font-black opacity-80 leading-tight mb-4"
                      style={{ color: event?.theme_text_color || txtColor }}
                    >
                      {event.theme_subheader}
                    </p>
                  )}

                  {event?.theme_intro && (
                    <p 
                      className="text-sm opacity-60 leading-relaxed font-medium mb-6"
                      style={{ color: event?.theme_text_color || txtColor }}
                    >
                      {event.theme_intro}
                    </p>
                  )}

                  {/* Tagi / Formalność */}
                  {(event?.theme_keywords || event?.theme_formality) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {event.theme_formality && (
                        <span 
                          className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm"
                          style={{ color: event?.theme_text_color || txtColor, backgroundColor: `${cardBg}80` }}
                        >
                          Dress code: {event.theme_formality}
                        </span>
                      )}
                      {String(event.theme_keywords || '').split(',').map((keyword: string) => keyword.trim()).filter(Boolean).map((keyword: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 opacity-70 backdrop-blur-sm"
                          style={{ color: event?.theme_text_color || txtColor, backgroundColor: `${cardBg}40` }}
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Kafelki z treścią (Eleganckie Glassmorphism) */}
                <div className="flex flex-col gap-6">
                  {([
                    { condition: !!event?.theme_description, title: 'Klimat wydarzenia', text: event?.theme_description },
                    { condition: event?.theme_show_dress_code !== false && !!event?.theme_dress_code, title: 'Jak się ubrać?', text: event?.theme_dress_code },
                    { condition: event?.theme_show_colors !== false && !!event?.theme_colors_note, title: 'Kolory motywu', text: event?.theme_colors_note },
                    { condition: !!event?.theme_recommended, title: 'Rekomendowane', text: event?.theme_recommended },
                    { condition: !!event?.theme_avoid, title: 'Czego unikać?', text: event?.theme_avoid, isAlert: true },
                    { condition: event?.theme_show_decorations !== false && !!event?.theme_decorations, title: 'Dekoracje', text: event?.theme_decorations },
                    { condition: event?.theme_show_attractions !== false && !!event?.theme_attractions, title: 'Atrakcje', text: event?.theme_attractions },
                    { condition: !!event?.theme_photo_zone, title: 'Photo zone', text: event?.theme_photo_zone },
                    { condition: event?.theme_show_eco !== false && !!event?.theme_eco_note, title: 'Eco note', text: event?.theme_eco_note, isEco: true },
                    ...customThemeBlocks.map((b, i) => ({ condition: true, title: b.title || `Informacja ${i+1}`, text: b.text }))
                  ] as Array<{ condition: boolean; title: string; text: any; isAlert?: boolean; isEco?: boolean }>)
                  .filter(block => block.condition && block.text)
                  .map((block, idx) => (
                    <motion.div
                      key={idx}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 30 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="p-8 rounded-[36px] border border-white/10 shadow-lg backdrop-blur-xl group hover:bg-white/[0.04] transition-colors duration-500"
                      style={{ backgroundColor: `${cardBg}99` }}
                    >
                      <h3 
                        className="text-2xl font-black leading-tight mb-4 group-hover:translate-x-1 transition-transform duration-300"
                        style={{ color: block.isAlert ? '#ef4444' : block.isEco ? '#10b981' : (event?.theme_heading_color || headColor) }}
                      >
                        {block.title}
                      </h3>
                      
                      <p 
                        className="text-sm leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300 whitespace-pre-line"
                        style={{ color: event?.theme_text_color || txtColor }}
                      >
                        {block.text}
                      </p>
                    </motion.div>
                  ))}
                </div>

              </div>

              {/* --- PRAWA KOLUMNA: ROZSTRZELONE ZDJĘCIA (HOVER POP-OUT & TINT) --- */}
              <div className="w-full lg:w-1/2 relative hidden lg:flex flex-col pt-12 pb-32">
                {event?.theme_show_images !== false && themeImages.length > 0 ? (
                  themeImages.map((imgUrl, idx) => {
                    // Zmieniona siatka: Zdjęcia są nieco mniejsze, a przerwy miedzy nimi większe.
                    const isEven = idx % 2 === 0;
                    const isFirst = idx === 0;
                    
                    return (
                      <motion.div
                        key={idx}
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 60 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                        // Bazowo index z ustaloną logiką. Ważne jest 'hover:z-50', aby wyrwać zdjęcie na wierzch!
                        className={`relative group transition-all duration-500 hover:z-50 cursor-crosshair
                          ${isEven ? 'ml-auto' : 'mr-auto'} 
                          ${isFirst ? 'w-[75%]' : 'w-[65%] -mt-24 xl:-mt-32'}
                        `}
                        style={{ zIndex: 10 + idx }}
                      >
                        <div className="relative overflow-hidden rounded-[36px] md:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 bg-white/5 transition-shadow duration-700">
                          
                          <img 
                            src={imgUrl as string} 
                            alt={`Inspiracja ${idx+1}`}
                            className="w-full h-auto object-cover aspect-[4/5] filter grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                          />

                          {/* Poświata (Tint) w kolorze tła - Znika na hover! */}
                          <div
                            className="absolute inset-0 opacity-60 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
                            style={{ backgroundColor: event?.theme_bg_color || themeSectionBg || bgColor }}
                          />

                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="w-full aspect-square rounded-[48px] border border-white/5 bg-white/[0.02] flex items-center justify-center flex-col gap-4">
                    <ImageIcon size={48} className="opacity-20" style={{ color: txtColor }} />
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest" style={{ color: txtColor }}>Brak moodboardu</p>
                  </div>
                )}
              </div>
              
              {/* Fallback dla urządzeń mobilnych */}
              <div className="w-full lg:hidden flex flex-col gap-6 mt-8">
                {event?.theme_show_images !== false && themeImages.map((img, idx) => (
                  <div key={idx} className="w-full aspect-[4/5] relative group overflow-hidden rounded-[32px] border border-white/10 shadow-xl">
                    <img 
                      src={img as string} 
                      alt={`Inspiracja ${idx+1}`}
                      className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    {/* Poświata na mobile */}
                    <div
                      className="absolute inset-0 opacity-60 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
                      style={{ backgroundColor: event?.theme_bg_color || themeSectionBg || bgColor }}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}
{/* ==========================================
 AGENDA - WEWNĘTRZNY SCROLL I ZDJĘCIA Z POŚWIATĄ
 ========================================== */}
      {isSectionVisible('agenda') && (
        <section
          id="public-agenda"
          className="relative z-10 py-24 md:py-32 overflow-hidden border-t border-white/5 flex flex-col"
          style={{ backgroundColor: agendaSectionBg || bgColor }}
        >
          {/* Tło i blury */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 w-full flex-1 flex flex-col">

            {/* --- NAGŁÓWEK --- */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 24 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-10 text-center md:text-left"
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10"
                style={{ color: secColor, backgroundColor: `${secColor}10` }}
              >
                Plan wydarzenia
              </span>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter"
                style={{ fontFamily: headFont, color: headColor }}
              >
                {agendaSectionTitle}
              </h2>
              {agendaSectionDescription && (
                <p className="max-w-2xl text-sm md:text-base opacity-60 mt-4 leading-relaxed mx-auto md:mx-0">
                  {agendaSectionDescription}
                </p>
              )}
            </motion.div>

            {/* --- WEWNĘTRZNA, PRZEWIJANA LISTA (SCROLL CONTAINER) --- */}
            {sessions.length > 0 ? (
              <div
                className="relative mt-8"
                style={{
                  // Kinowe zanikanie dłuższego kontenera u dołu
                  WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                }}
              >
                {/* Linia osi czasu */}
                <div className="absolute top-4 bottom-10 left-[19px] md:left-[120px] w-px bg-white/10 z-0" />

                {/* TU JEST ROZWIĄZANIE NA SCROLL: max-h-[600px] i overflow-y-auto */}
                <div className="overflow-y-auto custom-scrollbar max-h-[600px] pr-2 md:pr-4 pb-24 relative z-10 space-y-12">
                  {/* Używamy pełnej tablicy `sessions`, wewnętrzny scroll załatwia sprawę wydajności i UX */}
                  {sessions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="relative flex flex-col md:flex-row gap-6 md:gap-10 group cursor-crosshair"
                    >
                      {/* Lewa kolumna: Godzina i Kropka */}
                      <div className="flex items-start md:w-[120px] shrink-0 relative pt-1">
                        <div
                          className="absolute left-[15px] md:left-auto md:right-[-5px] top-[10px] w-2.5 h-2.5 rounded-full border-[2px] z-10 transition-all duration-300 group-hover:scale-150"
                          style={{ borderColor: primColor, backgroundColor: agendaSectionBg || bgColor }}
                        />

                        <div className="pl-12 md:pl-0 md:pr-10 w-full md:text-right">
                          {s.start_time ? (
                            <p
                              className="text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300 group-hover:translate-x-1 md:group-hover:-translate-x-1"
                              style={{ color: primColor }}
                            >
                              {new Date(s.start_time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          ) : (
                            <p className="text-xl font-black opacity-30">—</p>
                          )}
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                            {s.session_type || 'Agenda'}
                          </p>
                        </div>
                      </div>

                      {/* Prawa kolumna: Zdjęcie z POŚWIATĄ i Tekst */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-5 md:gap-6 pl-12 md:pl-0 pb-2">
                        {s.image_url && (
                          <div className="relative w-full sm:w-40 md:w-48 h-32 md:h-36 rounded-2xl overflow-hidden shrink-0 border border-white/5 bg-white/5 shadow-lg">
                            <img
                              src={s.image_url}
                              alt={s.title}
                              className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                            />
                            {/* Poświata (Tint) w kolorze sekcji - Znika na hover! */}
                            <div
                              className="absolute inset-0 opacity-50 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none"
                              style={{ backgroundColor: agendaSectionBg || bgColor }}
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-black text-white leading-tight mb-2 group-hover:translate-x-1 transition-transform duration-300">
                            {s.title}
                          </h3>

                          {s.description && (
                            <p className="text-xs md:text-sm text-white/50 leading-relaxed mb-4 group-hover:text-white/70 transition-colors">
                              {s.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4">
                            {s.location && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                                <MapPin size={12} style={{ color: primColor }} />
                                <span>{s.location}</span>
                              </div>
                            )}
                            {s.speaker_name && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                                <Users size={12} style={{ color: secColor }} />
                                <span>{s.speaker_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl border border-white/5 bg-white/[0.02]">
                <Clock size={32} className="mx-auto mb-4 opacity-20 text-white" />
                <p className="font-black text-lg" style={{ color: headColor }}>Agenda pojawi się wkrótce</p>
              </div>
            )}

            {/* --- STICKY CTA (Główny Przycisk Zapisów na dole) --- */}
            {isEnabled(event?.workshops_signup_enabled) && sessions.length > 0 && activeInlinePanel !== 'workshops' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center relative z-20"
              >
                <button
                  type="button"
                  onClick={() => openParticipantAction('workshops')}
                  className="px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest text-black shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center gap-3 border border-white/10"
                  style={{ backgroundColor: primColor }}
                >
                  Otwórz panel zapisów <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* --- FORMULARZ ZAPISÓW — ANIMOWANY INLINE PANEL --- */}
            <AnimatePresence mode="wait">
              {activeInlinePanel === 'workshops' && (
                <motion.div
                  id="public-workshops-form"
                  initial={{ opacity: 0, y: 36, scale: 0.96, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 rounded-[36px] border border-white/10 bg-[#0f1210]/95 p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl relative z-30 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: `radial-gradient(circle at 10% 0%, ${primColor}30, transparent 40%), radial-gradient(circle at 90% 100%, ${secColor}20, transparent 40%)`
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
                          style={{ color: primColor }}
                        >
                          Zapisy uczestników
                        </p>

                        <h3
                          className="text-2xl md:text-3xl font-black text-white"
                        >
                          Wybierz warsztaty dla każdej osoby
                        </h3>

                        <p className="text-sm opacity-55 mt-2 text-white">
                          Możesz zapisać osobno uczestnika głównego, osobę towarzyszącą i dzieci.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="w-10 h-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {actionMessage && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-bold mb-5 text-white">
                        {actionMessage}
                      </div>
                    )}

                    {participantUnits.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
                        <Users className="mx-auto mb-4 opacity-30 text-white" size={40} />

                        <p className="font-black text-lg text-white">
                          Najpierw wyślij zgłoszenie RSVP.
                        </p>

                        <p className="text-sm opacity-55 mt-2 text-white">
                          Po zapisaniu zgłoszenia na dole strony, wróć tutaj i uzupełnij wybory uczestników.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {participantUnits.map((unit: any) => (
                          <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                          >
                            <div className="mb-5">
                              <span
                                className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10"
                                style={{ backgroundColor: `${primColor}15`, color: primColor }}
                              >
                                {unit.unit_type === 'child'
                                  ? 'Dziecko'
                                  : unit.unit_type === 'companion'
                                    ? 'Osoba towarzysząca'
                                    : 'Uczestnik główny'}
                              </span>

                              <h4 className="text-2xl font-black text-white">
                                {unit.display_name || 'Uczestnik'}
                              </h4>
                            </div>

                            {sessions.length === 0 ? (
                              <p className="text-sm opacity-55 text-white">
                                Organizator nie udostępnił jeszcze warsztatów.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessions.map((session: any) => {
                                  const selected = (pendingSessionChoices[unit.id] || []).includes(session.id)

                                  return (
                                    <button
                                      key={session.id}
                                      type="button"
                                      onClick={() =>
                                        setPendingSessionChoices((prev) => {
                                          const current = prev[unit.id] || []
                                          return {
                                            ...prev,
                                            [unit.id]: selected
                                              ? current.filter((id) => id !== session.id)
                                              : [...current, session.id]
                                          }
                                        })
                                      }
                                      className="text-left rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] active:scale-[0.99]"
                                      style={{
                                        borderColor: selected ? primColor : 'rgba(255,255,255,0.08)',
                                        backgroundColor: selected ? `${primColor}10` : 'rgba(255,255,255,0.02)'
                                      }}
                                    >
                                      <div className="relative z-10 pr-6">
                                        <p className="font-black text-lg text-white">
                                          {session.title}
                                        </p>

                                        <p className="text-xs opacity-50 mt-2 flex items-center gap-1.5 text-white">
                                          <MapPin size={12}/> {session.location || session.session_type || 'warsztat'}
                                        </p>

                                        {session.start_time && (
                                          <p className="text-[10px] font-bold opacity-40 mt-3 flex items-center gap-1 text-white">
                                            <Clock size={12}/> {new Date(session.start_time).toLocaleString('pl-PL')}
                                          </p>
                                        )}
                                      </div>

                                      {/* Subtelny znacznik wyboru */}
                                      <div
                                        className={`absolute top-5 right-4 w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 ${selected ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-30'}`}
                                        style={{ borderColor: primColor, backgroundColor: selected ? primColor : 'transparent' }}
                                      >
                                        {selected && <CheckCircle2 size={12} className="text-black" />}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="px-6 py-4 rounded-full border border-white/10 bg-white/[0.03] font-black text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                      >
                        Zamknij panel
                      </button>

                      <button
                        type="button"
                        disabled={actionSaving || participantUnits.length === 0}
                        onClick={saveParticipantAction}
                        className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-black disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: primColor }}
                      >
                        {actionSaving ? 'Zapisywanie...' : 'Zapisz wybory'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>
      )}

{/* ==========================================
  WYSKAKUJĄCY POP-UP (TOAST) - WARSZTATY
 ========================================== */}
 <AnimatePresence>
        {showWorkshopPopup && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9, rotate: 3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-32 right-6 md:right-10 z-[60] cursor-pointer group"
            onClick={handleWorkshopPopupClick}
          >
            <div
              className="relative overflow-hidden rounded-3xl border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              style={{ backgroundColor: `${primColor}E6` }}
            >
              {/* Wewnętrzny blask */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

              {/* Przycisk zamknięcia */}
              <button
                onClick={dismissWorkshopPopup}
                className="absolute top-3 right-3 p-1.5 bg-black/10 hover:bg-black/20 rounded-full text-black/60 hover:text-black transition-colors z-10"
                aria-label="Zamknij powiadomienie"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-4 pr-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">
                    Nowość!
                  </p>
                  <p className="text-sm font-black text-black leading-tight">
                    Pojawiła się lista warsztatów.<br/>Zapisz się już teraz.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



{/* ==========================================
          PRELEGENCI - ZAAWANSOWANY UKŁAD ASYMETRYCZNY Z POŚWIATĄ
          ========================================== */}
      {isSectionVisible('speakers') && (
        <section
          id="public-speakers"
          className="relative z-10 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: speakersSectionBg || bgColor }}
        >
          {/* Tło i blury */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 18% 12%, ${primColor}15, transparent 32%), radial-gradient(circle at 82% 22%, ${secColor}10, transparent 28%)`
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-32"
            >
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10"
                  style={{ color: primColor, backgroundColor: `${primColor}10` }}
                >
                  Poznaj ekspertów
                </span>
                <h2
                  className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  {speakerSectionTitle}
                </h2>
              </div>
              {speakerSectionDescription && (
                <p 
                  className="max-w-md text-sm md:text-base opacity-60 font-medium leading-relaxed pb-2"
                  style={{ color: txtColor }}
                >
                  {speakerSectionDescription}
                </p>
              )}
            </motion.div>

            {speakers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20 pb-20">
                {speakers.map((speaker, i) => (
                  <motion.div
                    key={speaker.id}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: "-50px" }}
                    className={`group relative 
                      /* Na tabletach (2 kolumny): co drugi element idzie w dół */
                      sm:[&:nth-child(2n)]:translate-y-12 
                      /* Na desktopach (3 kolumny): resetujemy regułę z tabletu... */
                      lg:[&:nth-child(2n)]:translate-y-0 
                      /* ...i przesuwamy w dół tylko środkową kolumnę (2, 5, 8 itd.) */
                      lg:[&:nth-child(3n+2)]:translate-y-20
                    `}
                  >
                    {/* Zdjęcie wyrwane z pudełka, wzbogacone o głęboki cień */}
                    <div className={`relative overflow-hidden aspect-[4/5] ${shape} bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] transition-shadow duration-700`}>
                      <img
                        src={speaker.photo_url || '/placeholder.jpg'}
                        alt={`${speaker.first_name || ''} ${speaker.last_name || ''}`}
                        className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                      />
                      
                      {/* 1. Poświata (Tint) w kolorze tła - Znika na hover! */}
                      <div
                        className="absolute inset-0 opacity-60 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none z-10"
                        style={{ backgroundColor: speakersSectionBg || bgColor }}
                      />

                      {/* 2. Dolny cień, który idealnie wtapia krawędź zdjęcia w tło strony na stałe */}
                      <div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{ background: `linear-gradient(to top, ${speakersSectionBg || bgColor} 5%, transparent 50%)` }}
                      />
                    </div>

                    {/* Tekst nachodzący na zdjęcie z ujemnym marginesem - to daje głębię */}
                    <div className="relative z-20 -mt-16 px-6 pointer-events-none">
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 drop-shadow-md"
                        style={{ color: primColor }}
                      >
                        {speaker.company}
                      </p>
                      <h3 className="text-3xl font-black text-white leading-[1.1] mb-2 drop-shadow-lg">
                        {speaker.first_name} <br /> {speaker.last_name}
                      </h3>
                      {speaker.title && (
                        <p className="text-sm font-bold text-white/60 drop-shadow-md">
                          {speaker.title}
                        </p>
                      )}
                    </div>

                    {/* Zwijane informacje rozwijające się przy najechaniu (Hover Reveal) */}
                    <div className="px-6 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 overflow-hidden">
                      {speaker.bio && (
                        <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-3">
                          {speaker.bio}
                        </p>
                      )}
                      <div className="flex gap-3 pointer-events-auto">
                        {speaker.linkedin_url && (
                          <a href={speaker.linkedin_url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                            <Linkedin size={18} />
                          </a>
                        )}
                        {speaker.twitter_url && (
                          <a href={speaker.twitter_url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                            <Twitter size={18} />
                          </a>
                        )}
                        {speaker.website_url && (
                          <a href={speaker.website_url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                            <LinkIcon size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02]">
                <Users size={34} className="mx-auto mb-4 opacity-20" style={{ color: txtColor }} />
                <p className="font-black text-2xl" style={{ color: headColor }}>Prelegenci pojawią się wkrótce</p>
              </div>
            )}
          </div>
        </section>
      )}

{/* ==========================================
          MENU - ELEGANCKA KARTA MENU Z PODZIAŁEM NA DIETY I MINIATURKAMI
          ========================================== */}
      {isSectionVisible('menu') && (
        <section
          id="public-menu"
          className="relative z-10 py-24 md:py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: bgColor }}
        >
          {/* Subtelne podświetlenie tła reagujące na to, gdzie jesteśmy na stronie */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none"
          />

          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24"
            >
              <div>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10 shadow-lg backdrop-blur-md"
                  style={{ color: primColor, backgroundColor: `${primColor}15` }}
                >
                  <UtensilsCrossed size={14} /> Doznania Kulinarne
                </span>
                <h2
                  className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  {sectionTitle('menu', 'Karta Menu')}
                </h2>
              </div>
              {sectionDescription('menu') && (
                <p className="max-w-md text-sm md:text-base opacity-60 font-medium leading-relaxed pb-2" style={{ color: txtColor }}>
                  {sectionDescription(
                    'menu',
                    'Sprawdź dostępne opcje menu i uzupełnij wybór dla każdej osoby z Twojego zgłoszenia.'
                  )}
                </p>
              )}
            </motion.div>

            {meals.length > 0 ? (
              // Używamy IIFE (Immediately Invoked Function Expression) by zgrabnie pogrupować posiłki po diecie
              (() => {
                const groupedMeals = meals.reduce((acc: any, meal: any) => {
                  const cat = meal.dietary_category || 'Standard';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(meal);
                  return acc;
                }, {});

                return (
                  <div className="max-w-5xl mx-auto bg-white/[0.01] border border-white/5 rounded-[40px] md:rounded-[64px] p-6 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-3xl">
                    {Object.entries(groupedMeals).map(([category, categoryMeals]: [string, any], index: number) => (
                      <motion.div 
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className="mb-16 last:mb-0"
                      >
                        {/* Nagłówek kategorii diety (np. Vege, Standard) */}
                        <div className="flex items-center gap-4 mb-8">
                          <h3 
                            className="text-2xl md:text-3xl font-black uppercase tracking-widest"
                            style={{ color: headColor }}
                          >
                            Dieta: {category}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {/* Lista dań w tej kategorii */}
                        <div className="flex flex-col">
                          {categoryMeals.map((meal: any) => (
                            <div 
                              key={meal.id} 
                              className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-8 py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 rounded-3xl transition-colors duration-500 cursor-crosshair"
                            >
                              {/* Miniaturka z poświatą */}
                              <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl md:rounded-[28px] overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                                {meal.image_url ? (
                                  <img
                                    src={meal.image_url}
                                    alt={meal.name}
                                    className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out mix-blend-luminosity group-hover:mix-blend-normal"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                                    <UtensilsCrossed size={32} className="opacity-20 text-white" />
                                  </div>
                                )}
                                
                                {/* Poświata z tła - Znika na hover */}
                                <div
                                  className="absolute inset-0 opacity-60 transition-opacity duration-700 ease-in-out group-hover:opacity-0 pointer-events-none z-10"
                                  style={{ backgroundColor: bgColor }}
                                />
                              </div>

                              {/* Szczegóły dania */}
                              <div className="flex-1 min-w-0 w-full">
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                                  <h4 
                                    className="text-xl md:text-2xl font-black leading-tight group-hover:translate-x-2 transition-transform duration-300"
                                    style={{ color: headColor }}
                                  >
                                    {meal.name}
                                  </h4>
                                  
                                  {/* Typ posiłku i Ślad węglowy po prawej stronie wiersza */}
                                  <div className="flex items-center gap-2">
                                    {Number(meal.co2_per_portion_kg || 0) > 0 && (
                                      <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {meal.co2_per_portion_kg} kg CO₂
                                      </span>
                                    )}
                                    <span 
                                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm whitespace-nowrap"
                                      style={{ backgroundColor: `${primColor}15`, color: primColor, borderColor: `${primColor}30` }}
                                    >
                                      {meal.meal_type === 'main' ? 'Danie Główne' : meal.meal_type === 'starter' ? 'Przystawka' : meal.meal_type === 'dessert' ? 'Deser' : meal.meal_type || 'Danie'}
                                    </span>
                                  </div>
                                </div>

                                {meal.description && (
                                  <p 
                                    className="text-sm font-medium leading-relaxed opacity-60 group-hover:opacity-90 group-hover:translate-x-2 transition-all duration-300 line-clamp-3" 
                                    style={{ color: txtColor }}
                                  >
                                    {meal.description}
                                  </p>
                                )}

                                {meal.allergens && meal.allergens.length > 0 && (
                                  <p className="text-[10px] font-black uppercase text-red-400/80 mt-3 group-hover:translate-x-2 transition-transform duration-300">
                                    Alergeny: {Array.isArray(meal.allergens) ? meal.allergens.join(', ') : meal.allergens}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02]">
                <UtensilsCrossed size={34} className="mx-auto mb-4 opacity-20 text-white" />
                <p className="font-black text-2xl" style={{ color: headColor }}>Menu pojawi się wkrótce</p>
              </div>
            )}

            {/* --- STICKY CTA DO WYBORU MENU --- */}
            {isEnabled(event?.menu_selection_enabled) && meals.length > 0 && activeInlinePanel !== 'menu' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 flex justify-center relative z-20"
              >
                <button
                  type="button"
                  onClick={() => openParticipantAction('menu')}
                  className="px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest text-black shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center gap-3 border border-white/10"
                  style={{ backgroundColor: primColor }}
                >
                  Wybierz swoje menu <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* --- FORMULARZ WYBORU MENU — ANIMOWANY INLINE PANEL --- */}
            <AnimatePresence mode="wait">
              {activeInlinePanel === 'menu' && (
                <motion.div
                  id="public-menu-form"
                  initial={{ opacity: 0, y: 36, scale: 0.96, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-16 rounded-[36px] border border-white/10 bg-[#0f1210]/95 backdrop-blur-3xl p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative z-30 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: `radial-gradient(circle at 10% 0%, ${primColor}30, transparent 40%), radial-gradient(circle at 90% 100%, ${secColor}20, transparent 40%)`
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
                          style={{ color: primColor }}
                        >
                          Wybór Menu
                        </p>

                        <h3 className="text-2xl md:text-3xl font-black text-white">
                          Wybierz danie dla każdej osoby
                        </h3>

                        <p className="text-sm opacity-55 mt-2" style={{ color: txtColor }}>
                          Uzupełnij wybór osobno dla uczestnika głównego, osoby towarzyszącej i dzieci.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="w-10 h-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
                        style={{ color: txtColor }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {actionMessage && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-bold mb-5 text-white">
                        {actionMessage}
                      </div>
                    )}

                    {participantUnits.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
                        <Users className="mx-auto mb-4 opacity-40 text-white" size={40} />

                        <p className="font-black text-lg text-white">
                          Najpierw wyślij zgłoszenie RSVP.
                        </p>

                        <p className="text-sm opacity-55 mt-2 text-white">
                          Po zapisaniu zgłoszenia na dole strony, wróć tutaj i wybierz menu dla uczestników.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {participantUnits.map((unit: any) => (
                          <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                          >
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <span
                                  className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10"
                                  style={{ backgroundColor: `${primColor}15`, color: primColor }}
                                >
                                  {unit.unit_type === 'child'
                                    ? 'Dziecko'
                                    : unit.unit_type === 'companion'
                                      ? 'Osoba towarzysząca'
                                      : 'Uczestnik główny'}
                                </span>

                                <h4 className="text-2xl font-black text-white">
                                  {unit.display_name || 'Uczestnik'}
                                </h4>
                              </div>

                              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Wskazania z RSVP</p>
                                <p className="text-xs font-bold text-white/80">
                                  Dieta: <span className="text-white">{unit.diet || application?.diet || 'brak'}</span>
                                </p>
                                <p className="text-xs font-bold text-white/80">
                                  Alergie: <span className="text-red-400">{unit.allergies || application?.allergies || 'brak'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {meals.map((meal: any) => {
                                const selected = pendingMenuChoices[unit.id] === meal.id

                                return (
                                  <button
                                    key={meal.id}
                                    type="button"
                                    onClick={() =>
                                      setPendingMenuChoices((prev) => ({
                                        ...prev,
                                        [unit.id]: meal.id
                                      }))
                                    }
                                    className="text-left rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4"
                                    style={{
                                      borderColor: selected ? primColor : 'rgba(255,255,255,0.08)',
                                      backgroundColor: selected ? `${primColor}10` : 'rgba(255,255,255,0.02)'
                                    }}
                                  >
                                    {/* Miniaturka w formularzu - dużo lepszy UX! */}
                                    {meal.image_url ? (
                                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                                        <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500 mix-blend-luminosity group-hover:mix-blend-normal" />
                                        <div className="absolute inset-0 opacity-60 transition-opacity duration-500 ease-in-out group-hover:opacity-0 pointer-events-none" style={{ backgroundColor: bgColor }} />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <UtensilsCrossed size={20} className="text-white/30" />
                                      </div>
                                    )}

                                    <div className="relative z-10 pr-6 flex-1">
                                      <p className="font-black text-lg text-white leading-tight">
                                        {meal.name}
                                      </p>

                                      <p className="text-[10px] font-black tracking-widest uppercase opacity-55 mt-1.5 text-white">
                                        {[meal.meal_type, meal.dietary_category].filter(Boolean).join(' • ') || 'Menu'}
                                      </p>

                                      {meal.allergens && meal.allergens.length > 0 && (
                                        <p className="text-[9px] font-black uppercase text-red-400 mt-1">
                                          Alergeny: {Array.isArray(meal.allergens) ? meal.allergens.join(', ') : meal.allergens}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Znacznik zaznaczenia */}
                                    <div 
                                      className={`absolute top-4 right-4 w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 ${selected ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-30'}`}
                                      style={{ borderColor: primColor, backgroundColor: selected ? primColor : 'transparent' }}
                                    >
                                      {selected && <CheckCircle2 size={12} className="text-black" />}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="px-6 py-4 rounded-full border border-white/10 bg-white/[0.03] font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                      >
                        Zamknij panel
                      </button>

                      <button
                        type="button"
                        disabled={actionSaving || participantUnits.length === 0 || meals.length === 0}
                        onClick={saveParticipantAction}
                        className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-black disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: primColor }}
                      >
                        {actionSaving ? 'Zapisywanie...' : 'Zapisz menu'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

{/* ==========================================
          GADŻETY - NIESKOŃCZONA KARUZELA (MARQUEE) Z EKO-METRYKAMI
          ========================================== */}
      {isSectionVisible('gadgets') && (
        <section
          id="public-gadgets"
          className="relative z-10 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: bgColor }}
        >
          {/* Style dla nieskończonego przewijania Gadżetów */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes infinite-scroll-gadgets {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-infinite-scroll-gadgets {
              animation: infinite-scroll-gadgets ${Math.max(gadgetMarqueeItems.length * 2.4, 34)}s linear infinite;
              width: max-content;
              will-change: transform;
            }
            .hover-pause:hover .animate-infinite-scroll-gadgets {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-infinite-scroll-gadgets {
                animation: none;
              }
            }
          `}} />

          {/* Subtelne podświetlenie tła (eko-blask) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] rounded-full blur-[160px] pointer-events-none opacity-20"
            style={{ backgroundColor: primColor }}
          />

          <div className="relative max-w-7xl mx-auto px-6 mb-16">
            {/* --- NAGŁÓWEK --- */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
              <div>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10"
                  style={{ color: primColor, backgroundColor: `${primColor}10` }}
                >
                  <Leaf size={14} /> Świadomy wybór
                </span>
                <h2
                  className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  {sectionTitle('gadgets', 'Gadżety pro eco')}
                </h2>
              </div>
              {sectionDescription('gadgets') && (
                <p className="max-w-md text-sm md:text-base opacity-60 font-medium leading-relaxed pb-2" style={{ color: txtColor }}>
                  {sectionDescription(
                    'gadgets',
                    'Wybierz gadżet tylko wtedy, gdy naprawdę go potrzebujesz. Dzięki temu organizator zamawia mniej nadwyżek.'
                  )}
                </p>
              )}
            </motion.div>
          </div>

          {/* --- PŁYNĄCA KARUZELA GADŻETÓW --- */}
          {gadgets.length > 0 ? (
            <div className="relative w-full overflow-hidden hover-pause group">
              {/* Gradienty maskujące po bokach (zanikanie brzegów) */}
              <div
                className="absolute top-0 bottom-0 left-0 w-16 md:w-32 z-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                style={{ background: `linear-gradient(to right, ${bgColor} 10%, transparent)` }}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-16 md:w-32 z-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                style={{ background: `linear-gradient(to left, ${bgColor} 10%, transparent)` }}
              />

              {/* Kontener przewijający się (podwojona lista dla płynnej pętli) */}
              <div className="animate-infinite-scroll-gadgets flex items-start gap-8 md:gap-12 px-6 md:px-12 pb-16">
                {gadgetMarqueeItems.map((gadget: any, index: number) => {
                  const available = getGadgetAvailableQuantity(gadget)
                  const stockStatus = getGadgetStockStatus(gadget)
                  const isSoldOut = stockStatus === 'sold_out'

                  return (
                    <div
                      key={`${gadget.id}-${index}`}
                      className={`relative flex flex-col shrink-0 w-[220px] md:w-[280px] group/item cursor-crosshair ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
                    >
                      {/* Obszar Zdjęcia z Poświatą */}
                      <div className="relative overflow-hidden aspect-[4/5] rounded-[32px] md:rounded-[40px] bg-white/5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover/item:shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-shadow duration-700 mb-6">
                        {gadget.image_url ? (
                          <img
                            src={gadget.image_url}
                            alt={gadget.public_label || gadget.name}
                            className="w-full h-full object-cover filter grayscale-[40%] group-hover/item:grayscale-0 group-hover/item:scale-105 transition-all duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                            <Gift size={48} className="opacity-20 text-white" />
                          </div>
                        )}

                        {/* Poświata w kolorze tła - Znika przy najechaniu */}
                        <div
                          className="absolute inset-0 opacity-60 transition-opacity duration-700 ease-in-out group-hover/item:opacity-0 pointer-events-none z-10"
                          style={{ backgroundColor: bgColor }}
                        />

                        {/* Odznaka Eko lub Sold Out umieszczona na zdjęciu */}
                        <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                          {isSoldOut ? (
                            <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md bg-red-500/80 text-white border border-red-400/30">
                              Niedostępny
                            </span>
                          ) : (
                            stockStatus === 'low_stock' && (
                              <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md bg-amber-500/80 text-white border border-amber-400/30">
                                Ostatnie {available} szt.
                              </span>
                            )
                          )}
                          
                          {Number(gadget.co2_cost_kg || 0) > 0 && (
                            <span 
                              className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border"
                              style={{ backgroundColor: `${bgColor}E6`, color: '#10b981', borderColor: '#10b98140' }}
                            >
                              Ślad: {gadget.co2_cost_kg} kg CO₂
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tekst pod gadżetem */}
                      <div className="px-2 transition-transform duration-500 group-hover/item:translate-x-2">
                        <p 
                          className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 drop-shadow-md"
                          style={{ color: primColor }}
                        >
                          {gadget.category === 'premium' ? 'Wydanie Premium' : gadget.category === 'eco' ? 'Eco Choice' : 'Standard'}
                        </p>
                        
                        <h3 className="text-xl md:text-2xl font-black leading-tight mb-2" style={{ color: headColor }}>
                          {gadget.public_label || gadget.name}
                        </h3>

                        {gadget.description && (
                          <p className="text-xs opacity-50 leading-relaxed font-medium line-clamp-2" style={{ color: txtColor }}>
                            {gadget.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="relative max-w-7xl mx-auto px-6">
              <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02]">
                <Gift size={34} className="mx-auto mb-4 opacity-20 text-white" />
                <p className="font-black text-2xl" style={{ color: headColor }}>Gadżety pojawią się wkrótce</p>
              </div>
            </div>
          )}

          <div className="relative max-w-7xl mx-auto px-6">
            {/* --- STICKY CTA DO WYBORU GADŻETU --- */}
            {isEnabled(event?.gadgets_selection_enabled) && gadgets.length > 0 && activeInlinePanel !== 'gadgets' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex justify-center relative z-20"
              >
                <button
                  type="button"
                  onClick={() => openParticipantAction('gadgets')}
                  className="px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest text-black shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center gap-3 border border-white/10"
                  style={{ backgroundColor: primColor }}
                >
                  Odbierz swój gadżet <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* --- FORMULARZ WYBORU GADŻETU — ANIMOWANY INLINE PANEL --- */}
            <AnimatePresence mode="wait">
              {activeInlinePanel === 'gadgets' && (
                <motion.div
                  id="public-gadgets-form"
                  initial={{ opacity: 0, y: 36, scale: 0.96, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-16 rounded-[36px] border border-white/10 bg-[#0f1210]/95 backdrop-blur-3xl p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative z-30 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: `radial-gradient(circle at 10% 0%, ${primColor}30, transparent 40%), radial-gradient(circle at 90% 100%, ${secColor}20, transparent 40%)`
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
                          style={{ color: primColor }}
                        >
                          Wybór Gadżetów
                        </p>

                        <h3 className="text-2xl md:text-3xl font-black text-white">
                          Wybierz gadżet dla każdej osoby
                        </h3>

                        <p className="text-sm opacity-55 mt-2" style={{ color: txtColor }}>
                          Zdecyduj, czy potrzebujesz upominku, czy wolisz z niego zrezygnować na rzecz planety.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="w-10 h-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
                        style={{ color: txtColor }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {actionMessage && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-bold mb-5" style={{ color: txtColor }}>
                        {actionMessage}
                      </div>
                    )}

                    {participantUnits.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
                        <Users className="mx-auto mb-4 opacity-40 text-white" size={40} />
                        <p className="font-black text-lg text-white">
                          Najpierw wyślij zgłoszenie RSVP.
                        </p>
                        <p className="text-sm opacity-55 mt-2 text-white">
                          Po zapisaniu zgłoszenia na dole strony, wróć tutaj i wybierz gadżety.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {participantUnits.map((unit: any) => (
                          <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                          >
                            <div className="mb-6">
                              <span
                                className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10"
                                style={{ backgroundColor: `${primColor}15`, color: primColor }}
                              >
                                {unit.unit_type === 'child'
                                  ? 'Dziecko'
                                  : unit.unit_type === 'companion'
                                    ? 'Osoba towarzysząca'
                                    : 'Uczestnik główny'}
                              </span>

                              <h4 className="text-2xl font-black" style={{ color: headColor }}>
                                {unit.display_name || 'Uczestnik'}
                              </h4>
                            </div>

                            <div className="mb-6">
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingGadgetChoices((prev) => ({
                                    ...prev,
                                    [unit.id]: { declined: true }
                                  }))
                                }
                                className="w-full rounded-2xl border p-5 text-left transition-all duration-300 flex items-center justify-between"
                                style={{
                                  borderColor: pendingGadgetChoices[unit.id]?.declined ? primColor : 'rgba(255,255,255,0.1)',
                                  backgroundColor: pendingGadgetChoices[unit.id]?.declined ? `${primColor}18` : 'rgba(255,255,255,0.03)'
                                }}
                              >
                                <div>
                                  <p className="font-black text-lg text-white">Nie chcę gadżetu 🌍</p>
                                  <p className="text-xs opacity-50 mt-1 font-medium text-white">
                                    Dziękujemy za świadomą decyzję! Pomagasz nam redukować ślad węglowy wydarzenia.
                                  </p>
                                </div>
                                
                                <div 
                                  className={`w-6 h-6 shrink-0 rounded-full border-[2px] flex items-center justify-center transition-all ${pendingGadgetChoices[unit.id]?.declined ? 'scale-100 opacity-100' : 'scale-75 opacity-20'}`}
                                  style={{ borderColor: primColor, backgroundColor: pendingGadgetChoices[unit.id]?.declined ? primColor : 'transparent' }}
                                >
                                  {pendingGadgetChoices[unit.id]?.declined && <CheckCircle2 size={14} className="text-black" />}
                                </div>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {gadgets.map((gadget: any) => {
                                const status = getGadgetStockStatus(gadget)
                                const disabled = status === 'sold_out'
                                const selected = pendingGadgetChoices[unit.id]?.gadget_id === gadget.id

                                return (
                                  <div
                                    key={gadget.id}
                                    className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99] cursor-pointer'}`}
                                    onClick={() => {
                                      if (disabled) return;
                                      setPendingGadgetChoices((prev) => ({
                                        ...prev,
                                        [unit.id]: {
                                          gadget_id: gadget.id,
                                          selected_size: null,
                                          declined: false
                                        }
                                      }))
                                    }}
                                    style={{
                                      borderColor: selected ? primColor : 'rgba(255,255,255,0.08)',
                                      backgroundColor: selected ? `${primColor}10` : 'rgba(255,255,255,0.02)'
                                    }}
                                  >
                                    <div className="relative z-10 pr-6">
                                      <p className="font-black text-lg text-white">
                                        {gadget.public_label || gadget.name}
                                      </p>
                                      {disabled && (
                                        <p className="text-[10px] font-black uppercase text-red-400 mt-2 tracking-widest">
                                          Niedostępny
                                        </p>
                                      )}
                                    </div>
                                    
                                    {selected && gadget.size_required === true && (
                                      <div className="mt-4 pt-4 border-t border-white/10 relative z-20" onClick={(e) => e.stopPropagation()}>
                                        <select
                                          className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold outline-none text-white focus:border-white/50 transition-colors"
                                          value={pendingGadgetChoices[unit.id]?.selected_size || ''}
                                          onChange={(e) =>
                                            setPendingGadgetChoices((prev) => ({
                                              ...prev,
                                              [unit.id]: {
                                                ...prev[unit.id],
                                                selected_size: e.target.value
                                              }
                                            }))
                                          }
                                        >
                                          <option value="">Wybierz rozmiar</option>
                                          {getGadgetSizeOptions(gadget).map((size) => (
                                            <option key={size} value={size}>
                                              Rozmiar: {size}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}

                                    {/* Znacznik zaznaczenia */}
                                    <div 
                                      className={`absolute top-5 right-4 w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 ${selected ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-30'}`}
                                      style={{ borderColor: primColor, backgroundColor: selected ? primColor : 'transparent' }}
                                    >
                                      {selected && <CheckCircle2 size={12} className="text-black" />}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="px-6 py-4 rounded-full border border-white/10 bg-white/[0.03] font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                      >
                        Zamknij panel
                      </button>

                      <button
                        type="button"
                        disabled={actionSaving || participantUnits.length === 0 || gadgets.length === 0}
                        onClick={saveParticipantAction}
                        className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-black disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: primColor }}
                      >
                        {actionSaving ? 'Zapisywanie...' : 'Zapisz wybory'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

{/* ==========================================
  TRANSPORT I TRASY - POŁĄCZONA SEKCJA PREMIUM
 ========================================== */}
  {isSectionVisible('transport') && (
        <section
          id="public-transport"
          className="relative z-10 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: bgColor }}
        >
          {/* Subtelne podświetlenie tła (światło na bazie koloru przewodniego) */}
          <div
            className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none"
          />

          <div className="relative max-w-5xl mx-auto px-6">
            {/* --- NAGŁÓWEK I CTA --- */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
            >
              <div className="max-w-2xl">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10"
                  style={{ color: primColor, backgroundColor: `${primColor}10` }}
                >
                  <Route size={14} /> Logistyka i Dojazd
                </span>

                <h2
                  className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  {event?.transport_section_title || event?.transport_title || 'Transport i dojazd'}
                </h2>

                <p
                  className="text-sm md:text-base opacity-60 mt-6 leading-relaxed font-medium"
                  style={{ color: txtColor }}
                >
                  {event?.transport_section_description ||
                    event?.transport_desc ||
                    event?.transport_routes_description ||
                    'Sprawdź przygotowane przez nas trasy przejazdów i potwierdź, jak dotrzesz na miejsce.'}
                </p>
              </div>

              {/* Główny przycisk do potwierdzenia logistyki */}
              {isEnabled(event?.transport_selection_enabled) && activeInlinePanel !== 'transport' && (
                <button
                  type="button"
                  onClick={() => openParticipantAction('transport')}
                  className="px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest text-black shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center gap-3 shrink-0"
                  style={{ backgroundColor: primColor }}
                >
                  Potwierdź transport <ArrowRight size={18} />
                </button>
              )}
            </motion.div>

            {/* --- FORMULARZ ZAPISÓW — ANIMOWANY INLINE PANEL --- */}
            <AnimatePresence mode="wait">
              {activeInlinePanel === 'transport' && (
                <motion.div
                  id="public-transport-form"
                  initial={{ opacity: 0, y: 36, scale: 0.96, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-20 rounded-[36px] border border-white/10 backdrop-blur-3xl p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative z-30 overflow-hidden"
                  style={{ backgroundColor: `${cardBg}F2` }} // Dynamiczne tło karty organizatora z lekkim prześwitem
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: `radial-gradient(circle at 10% 0%, ${primColor}30, transparent 40%), radial-gradient(circle at 90% 100%, ${secColor}20, transparent 40%)`
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
                          style={{ color: primColor }}
                        >
                          Transport uczestników
                        </p>

                        <h3 className="text-2xl md:text-3xl font-black" style={{ color: headColor }}>
                          Potwierdź transport dla każdej osoby
                        </h3>

                        <p className="text-sm opacity-60 mt-2" style={{ color: txtColor }}>
                          Określ, w jaki sposób Ty i Twoi goście dotrzecie na wydarzenie.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="w-10 h-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
                        style={{ color: txtColor }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {actionMessage && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-bold mb-5" style={{ color: txtColor }}>
                        {actionMessage}
                      </div>
                    )}

                    {participantUnits.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
                        <Users className="mx-auto mb-4 opacity-40" size={40} style={{ color: txtColor }} />
                        <p className="font-black text-lg" style={{ color: headColor }}>
                          Najpierw wyślij zgłoszenie RSVP.
                        </p>
                        <p className="text-sm opacity-60 mt-2" style={{ color: txtColor }}>
                          Po zapisaniu zgłoszenia na dole strony, wróć tutaj i uzupełnij transport.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {participantUnits.map((unit: any) => (
                          <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 shadow-sm"
                          >
                            <div className="mb-6">
                              <span
                                className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10"
                                style={{ backgroundColor: `${primColor}15`, color: primColor }}
                              >
                                {unit.unit_type === 'child'
                                  ? 'Dziecko'
                                  : unit.unit_type === 'companion'
                                    ? 'Osoba towarzysząca'
                                    : 'Uczestnik główny'}
                              </span>

                              <h4 className="text-2xl font-black" style={{ color: headColor }}>
                                {unit.display_name || 'Uczestnik'}
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-white/30 transition-colors"
                                style={{ color: txtColor }}
                                value={pendingTransportChoices[unit.id]?.transport || 'Własny dojazd'}
                                onChange={(e) =>
                                  setPendingTransportChoices((prev) => ({
                                    ...prev,
                                    [unit.id]: {
                                      ...(prev[unit.id] || { transport_address: '' }),
                                      transport: e.target.value
                                    }
                                  }))
                                }
                              >
                                {/* Opcje selecta muszą mieć tło, inaczej będą przezroczyste na białym tle u organizatora */}
                                <option style={{ backgroundColor: cardBg }} value="Własny dojazd">Własny dojazd</option>
                                <option style={{ backgroundColor: cardBg }} value="Carpooling">Carpooling (Wspólne auto)</option>
                                <option style={{ backgroundColor: cardBg }} value="Transfer">Transfer / Zorganizowany autokar</option>
                                <option style={{ backgroundColor: cardBg }} value="Nie wiem">Jeszcze nie wiem</option>
                              </select>

                              <input
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-white/30 transition-colors"
                                style={{ color: txtColor }}
                                placeholder="Miasto wyjazdu / uwagi (opcjonalnie)"
                                value={pendingTransportChoices[unit.id]?.transport_address || ''}
                                onChange={(e) =>
                                  setPendingTransportChoices((prev) => ({
                                    ...prev,
                                    [unit.id]: {
                                      ...(prev[unit.id] || { transport: 'Własny dojazd' }),
                                      transport_address: e.target.value
                                    }
                                  }))
                                }
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveInlinePanel(null)}
                        className="px-6 py-4 rounded-full border border-white/10 bg-white/[0.03] font-black text-xs uppercase tracking-widest transition-colors hover:bg-white/10"
                        style={{ color: txtColor }}
                      >
                        Zamknij panel
                      </button>

                      <button
                        type="button"
                        disabled={actionSaving || participantUnits.length === 0}
                        onClick={saveParticipantAction}
                        className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-black disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: primColor }}
                      >
                        {actionSaving ? 'Zapisywanie...' : 'Zapisz transport'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- ZORGANIZOWANE TRASY (AUTOKARY) --- */}
            {organizedRoutes.length > 0 ? (
              <div className="space-y-12">
                {organizedRoutes.map((route: any, index: number) => {
                  const stops = getStopsForRoute(route.id)
                  const meetingText = route.meeting_instructions || 'Prosimy o punktualne przybycie. Autokar nie czeka.'

                  return (
                    <motion.article
                      key={route.id}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 30 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="border border-white/5 rounded-[40px] overflow-hidden shadow-sm"
                      style={{ backgroundColor: `${cardBg}90` }} // Dynamiczne tło karty
                    >
                      {/* Nagłówek Trasy */}
                      <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                        <div>
                          <h3 className="text-3xl md:text-4xl font-black mb-2" style={{ color: headColor }}>
                            {route.public_title || route.route_name || 'Trasa specjalna'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold opacity-60" style={{ color: txtColor }}>
                            <span className="flex items-center gap-1.5"><Bus size={14} style={{ color: primColor }} /> {route.vehicle_name || route.vehicle_type || 'Autokar'}</span>
                            {route.show_driver_contact && route.driver_phone && (
                              <span className="flex items-center gap-1.5"><Phone size={14} style={{ color: primColor }} /> {route.driver_phone}</span>
                            )}
                          </div>
                        </div>

                        {route.departure_time && (
                          <div className="shrink-0 text-center px-6 py-4 rounded-3xl border border-white/10" style={{ backgroundColor: `${primColor}15` }}>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: primColor }}>Start trasy</p>
                            <p className="text-2xl font-black" style={{ color: headColor }}>{formatTransportTime(route.departure_time)}</p>
                          </div>
                        )}
                      </div>

                      {/* Opis Trasy */}
                      {(route.public_description || route.public_notes) && (
                        <div className="px-8 md:px-12 py-6 border-b border-white/5 text-sm leading-relaxed opacity-70" style={{ color: txtColor }}>
                          {route.public_description && <p className="mb-2">{route.public_description}</p>}
                          {route.public_notes && <p className="opacity-70">{route.public_notes}</p>}
                        </div>
                      )}

                      {/* Rozkład Jazdy (Timeline przystanków) */}
                      <div className="p-8 md:p-12">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8" style={{ color: txtColor }}>Rozkład jazdy</p>

                        {stops.length === 0 ? (
                          <p className="text-sm opacity-50" style={{ color: txtColor }}>Przystanki zostaną wkrótce zaktualizowane.</p>
                        ) : (
                          <div className="relative pl-6 md:pl-10 space-y-10">
                            {/* Pionowa linia */}
                            <div className="absolute top-2 bottom-2 left-[7px] md:left-[11px] w-px bg-white/10" />

                            {stops.map((stop: any, idx: number) => (
                              <div key={stop.id} className="relative group">
                                {/* Kropka przystanku - dynamiczny kolor karty zamiast czarnego */}
                                <div
                                  className="absolute -left-[22px] md:-left-[35px] top-1.5 w-3 h-3 rounded-full border-2 transition-all duration-300 group-hover:scale-150"
                                  style={{ backgroundColor: cardBg, borderColor: primColor }}
                                />

                                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                                  <p className="text-2xl font-black group-hover:translate-x-1 transition-transform duration-300" style={{ color: headColor }}>
                                    {formatTransportTime(stop.stop_time) || '—'}
                                  </p>
                                  <p className="text-lg font-bold opacity-80 group-hover:translate-x-1 transition-transform duration-300 delay-75" style={{ color: txtColor }}>
                                    {stop.stop_name}
                                  </p>
                                </div>

                                {stop.stop_address && (
                                  <p className="text-sm opacity-50 mt-1 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300 delay-100" style={{ color: txtColor }}>
                                    <MapPin size={12} /> {stop.stop_address}
                                  </p>
                                )}

                                {stop.notes && (
                                  <p className="text-xs opacity-40 mt-2 italic group-hover:translate-x-1 transition-transform duration-300 delay-150" style={{ color: txtColor }}>
                                    {stop.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notka o spotkaniu na dole karty */}
                      <div className="px-8 md:px-12 py-5 flex items-center gap-3 border-t border-white/5" style={{ backgroundColor: `${cardBg}99` }}>
                        <Info size={14} style={{ color: primColor }} className="shrink-0" />
                        <p className="text-xs font-bold opacity-60" style={{ color: txtColor }}>{meetingText}</p>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            ) : fleet.length > 0 ? (
              /* Flota jeśli nie ma tras (np. same busy bez ustalonego rozkładu) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleet.map((vehicle: any) => (
                  <div key={vehicle.id} className="p-6 rounded-3xl border border-white/5 flex items-center gap-4" style={{ backgroundColor: `${cardBg}E6` }}>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: `${primColor}15`, color: primColor }}>
                      {vehicle.type === 'bus' ? <Bus size={24} /> : <Car size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-lg" style={{ color: headColor }}>{vehicle.name}</h4>
                      {vehicle.route && <p className="text-xs opacity-50 mt-1" style={{ color: txtColor }}>Trasa: {vehicle.route}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

          </div>
        </section>
      )}
{/* ==========================================
 CARPOOLING - TABLICA SPOŁECZNOŚCI (EDITORIAL CARDS)
========================================== */}
{isSectionVisible('transport') && (
  <section
    id="public-carpooling"
    className="relative z-10 py-24 md:py-32 overflow-hidden border-t border-white/5"
    style={{ backgroundColor: bgColor }}
  >
    <div
      className="absolute top-0 right-1/4 w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none opacity-40"
      style={{ backgroundColor: `${secColor}15` }}
    />

    <div className="relative max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10 shadow-lg backdrop-blur-md"
            style={{ color: primColor, backgroundColor: `${primColor}10` }}
          >
            <Users size={14} /> ANM Community
          </span>

          <h2
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
            style={{ fontFamily: headFont, color: headColor }}
          >
            Tablica Przejazdów
          </h2>

          <p
            className="max-w-md text-sm md:text-base font-medium opacity-60 leading-relaxed mt-6"
            style={{ color: txtColor }}
          >
            Dołącz do wspólnego przejazdu, oszczędzaj CO₂ i poznaj innych uczestników jeszcze przed wydarzeniem.
          </p>
        </motion.div>

        {isApproved && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCarpoolModalOpen(true)}
            className="px-8 py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-[0_15px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 shrink-0 border border-white/10 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: primColor, color: '#000' }}
          >
            <Plus size={18} /> Dodaj ogłoszenie
          </motion.button>
        )}
      </div>

      {carpoolMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-6 py-4 text-sm font-bold shadow-xl"
          style={{ color: headColor }}
        >
          {carpoolMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20 pb-16">
        {carpoolingAds.length === 0 ? (
          <div className="col-span-full py-24 text-center rounded-[48px] border border-white/5 bg-white/[0.02]">
            <Car size={48} className="mx-auto mb-6 opacity-20" style={{ color: txtColor }} />

            <p className="font-black text-2xl" style={{ color: headColor }}>
              Brak aktywnych ogłoszeń
            </p>

            <p className="text-sm opacity-50 mt-2 font-medium" style={{ color: txtColor }}>
              Bądź pierwszą osobą, która zaoferuje przejazd!
            </p>
          </div>
        ) : (
          carpoolingAds.map((ad, i) => {
                  const owner = ad.b2b_applications || null
            const ownerName = owner
              ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
              : 'Uczestnik'

            const ownerInitial = ownerName !== 'Uczestnik'
              ? ownerName.charAt(0)
              : 'U'

            const seatsAvail = Number(ad.seats_avail || 0)
            const used = Number(ad.used || 0)
            const freeSeats = Math.max(seatsAvail - used, 0)
            const isFull = seatsAvail > 0 && used >= seatsAvail

            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-50px' }}
                className={`group relative 
                  sm:[&:nth-child(2n)]:translate-y-10 
                  lg:[&:nth-child(2n)]:translate-y-0 
                  lg:[&:nth-child(3n+2)]:translate-y-16
                `}
              >
                <div
                  className={`relative rounded-[40px] border border-white/10 overflow-hidden flex flex-col h-full transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] ${
                    isFull ? 'opacity-55 grayscale' : 'hover:-translate-y-2'
                  }`}
                  style={{ backgroundColor: `${cardBg}E6` }}
                >
                  <div
                    className="h-28 w-full relative opacity-40 group-hover:opacity-80 transition-opacity duration-700"
                    style={{ background: `linear-gradient(135deg, ${primColor}80, ${secColor}40)` }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }}
                    />
                  </div>

                  <div className="absolute top-16 left-8 flex items-end gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl border-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: primColor, color: '#000', borderColor: cardBg }}
                    >
                      {ownerInitial}
                    </div>
                  </div>

                  <div className="absolute top-20 right-8 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                      {isFull ? 'Brak miejsc' : `${freeSeats} wolne`}
                    </span>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.max(seatsAvail, 0) }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
                          style={{
                            backgroundColor: idx < used ? '#ef4444' : primColor,
                            color: idx < used ? '#ef4444' : primColor
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-14 px-8 pb-8 flex-1 flex flex-col">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1"
                      style={{ color: txtColor }}
                    >
                      Kierowca
                    </p>

                    <h4 className="text-xl font-black mb-8 line-clamp-1" style={{ color: headColor }}>
                      {ownerName}
                    </h4>

                    <div className="mb-10">
                      <p
                        className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2"
                        style={{ color: primColor }}
                      >
                        Start trasy
                      </p>

                      <p
                        className="text-3xl md:text-4xl font-black tracking-tighter leading-none break-words"
                        style={{ color: headColor }}
                      >
                        {ad.route_from || 'Nie podano'}
                      </p>
                    </div>

                    <div className="mt-auto space-y-3 pt-4">
                      <button
                        type="button"
                        disabled={Boolean(carpoolSavingId) || isFull}
                        onClick={() => openCarpoolReserveModal(ad)}
                        className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest text-center transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                        style={{ backgroundColor: primColor, color: '#000' }}
                      >
                        {carpoolSavingId === ad.id ? (
                          'Rezerwuję...'
                        ) : isFull ? (
                          'Brak wolnych miejsc'
                        ) : (
                          <>Chcę dołączyć <ArrowRight size={14} /></>
                        )}
                      </button>

                      {ad.contact_sh && (
                        <a
                          href={`https://wa.me/${ad.contact_sh.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest text-center group-hover:bg-white group-hover:text-black transition-all"
                          style={{ color: txtColor }}
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  </section>
)}

{/* MODAL: REZERWACJA MIEJSCA W CARPOOLINGU */}
<AnimatePresence>
  {isCarpoolReserveModalOpen && selectedCarpoolAd && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsCarpoolReserveModalOpen(false)
          setSelectedCarpoolAd(null)
        }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-md border border-white/10 p-7 md:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.7)] ${shape}`}
        style={{ backgroundColor: `${cardBg}F5` }}
      >
        <button
          type="button"
          onClick={() => {
            setIsCarpoolReserveModalOpen(false)
            setSelectedCarpoolAd(null)
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          style={{ color: txtColor }}
        >
          <X size={16} />
        </button>

        <div className="mb-6 pr-8">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10"
            style={{ color: primColor, backgroundColor: `${primColor}15` }}
          >
            <Car size={13} />
            Rezerwacja przejazdu
          </span>

          <h3
            className="text-2xl md:text-3xl font-black tracking-tighter leading-tight"
            style={{ color: headColor }}
          >
            Dołącz do przejazdu
          </h3>

          <p className="text-sm opacity-60 mt-3 leading-relaxed" style={{ color: txtColor }}>
            Zostaw numer telefonu, żeby kierowca lub organizator mogli potwierdzić szczegóły przejazdu.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 mb-5">
          <p
            className="text-[10px] font-black uppercase tracking-widest opacity-45 mb-1"
            style={{ color: txtColor }}
          >
            Start trasy
          </p>

          <p className="text-xl font-black" style={{ color: headColor }}>
            {selectedCarpoolAd.route_from || 'Trasa uczestnika'}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
              <p
                className="text-[9px] font-black uppercase opacity-40 mb-1"
                style={{ color: txtColor }}
              >
                Miejsca
              </p>

              <p className="text-lg font-black" style={{ color: headColor }}>
                {Number(selectedCarpoolAd.used || 0)} / {Number(selectedCarpoolAd.seats_avail || 0)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
              <p
                className="text-[9px] font-black uppercase opacity-40 mb-1"
                style={{ color: txtColor }}
              >
                Kontakt kierowcy
              </p>

              <p className="text-sm font-black truncate" style={{ color: headColor }}>
                {selectedCarpoolAd.contact_sh || 'brak'}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleReserveCarpoolSeat(selectedCarpoolAd, carpoolPassengerPhone)
          }}
          className="space-y-4"
        >
          <div>
            <label
              className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block"
              style={{ color: txtColor }}
            >
              Twój numer telefonu
            </label>

            <input
              type="tel"
              required
              placeholder="+48..."
              value={carpoolPassengerPhone}
              onChange={(e) => setCarpoolPassengerPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-white/30 text-sm font-bold"
              style={{ color: txtColor }}
            />
          </div>

          <p className="text-[11px] leading-relaxed opacity-45" style={{ color: txtColor }}>
            Numer zostanie zapisany tylko dla organizatora i obsługi przejazdu. Nie będzie publicznie wyświetlany na stronie.
          </p>

          <button
            type="submit"
            disabled={carpoolSavingId === selectedCarpoolAd.id}
            className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ backgroundColor: primColor, color: '#000' }}
          >
            {carpoolSavingId === selectedCarpoolAd.id ? 'Rezerwuję...' : 'Potwierdź rezerwację'}
          </button>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>

{/* ==========================================
 SPONSORZY - NIESKOŃCZONA KARUZELA (MARQUEE) Z HOVER REVEAL
 ========================================== */}
      {isSectionVisible('sponsors') && (
        <section
          id="public-sponsors"
          className="relative z-10 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: sponsorsSectionBg }}
        >
          {/* Style dla nieskończonego przewijania (Marquee) */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes infinite-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-infinite-scroll {
              animation: infinite-scroll ${Math.max(sponsors.length * 6, 24)}s linear infinite;
              width: max-content;
            }
            .hover-pause:hover .animate-infinite-scroll {
              animation-play-state: paused;
            }
          `}} />

          {/* Subtelne tło z gradientem */}
          <div
            className="absolute inset-0 pointer-events-none opacity-80"
            style={{
              background: `linear-gradient(135deg, ${primColor}10, transparent 40%, ${secColor}10)`
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 text-center mb-20 md:mb-28">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span
                className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10"
                style={{ backgroundColor: `${primColor}15`, color: primColor }}
              >
                Wspierają wydarzenie
              </span>

              <h2
                className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                style={{ fontFamily: headFont, color: headColor }}
              >
                {sponsorsSectionTitle}
              </h2>

              {sponsorsSectionDescription && (
                <p className="max-w-2xl mx-auto text-sm md:text-base font-medium opacity-60 mt-6 leading-relaxed">
                  {sponsorsSectionDescription}
                </p>
              )}
            </motion.div>
          </div>

          {sponsors.length > 0 ? (
            <div className="relative w-full overflow-hidden hover-pause group">
              {/* Gradienty maskujące po bokach, żeby pasek gładko wyłaniał się i zanikał */}
              <div
                className="absolute top-0 bottom-0 left-0 w-16 md:w-48 z-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                style={{ background: `linear-gradient(to right, ${sponsorsSectionBg} 10%, transparent)` }}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-16 md:w-48 z-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                style={{ background: `linear-gradient(to left, ${sponsorsSectionBg} 10%, transparent)` }}
              />

              {/* Kontener przewijający się (podwójna lista dla płynnej pętli) */}
              <div className="animate-infinite-scroll flex items-center gap-16 md:gap-32 px-8 md:px-16 pt-8 pb-16">
                {sponsorMarqueeItems.map((sponsor, index) => (
                  <a
                    key={`${sponsor.id}-${index}`}
                    href={sponsor.sponsor_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex flex-col items-center justify-center shrink-0 min-w-[200px] md:min-w-[280px] group/item"
                  >
                    {sponsor.logo_url ? (
                      <div className="h-32 md:h-48 w-full flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 group-hover/item:-translate-y-2">
                        {sponsorLogoStyle === 'tint' ? (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: effectiveSponsorLogoTintColor,
                              filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3))',
                              maskImage: `url(${sponsor.logo_url})`,
                              WebkitMaskImage: `url(${sponsor.logo_url})`,
                              maskRepeat: 'no-repeat',
                              WebkitMaskRepeat: 'no-repeat',
                              maskPosition: 'center',
                              WebkitMaskPosition: 'center',
                              maskSize: 'contain',
                              WebkitMaskSize: 'contain',
                              transition: 'background-color 0.5s ease',
                            }}
                          />
                        ) : (
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.sponsor_name}
                            className={`max-h-full max-w-full object-contain transition-all duration-700 ${
                              sponsorLogoStyle === 'mono'
                                ? 'grayscale contrast-125 opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100'
                                : 'drop-shadow-2xl'
                            }`}
                          />
                        )}
                      </div>
                    ) : (
                      <h4
                        className="text-4xl md:text-5xl font-black uppercase tracking-tighter opacity-40 group-hover/item:opacity-100 transition-all duration-500 group-hover/item:scale-110 group-hover/item:-translate-y-2"
                        style={{ color: headColor }}
                      >
                        {sponsor.sponsor_name}
                      </h4>
                    )}

                    {/* Pływający Tooltip z detalami (Magnetic Reveal) */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 group-hover/item:-bottom-2 transition-all duration-300 pointer-events-none whitespace-nowrap z-30">
                      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-5 py-3 rounded-2xl text-center shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        <p className="text-sm font-black text-white">{sponsor.sponsor_name}</p>
                        {sponsor.sponsor_category && (
                          <p
                            className="text-[10px] font-black uppercase tracking-widest mt-1"
                            style={{ color: primColor }}
                          >
                            {sponsor.sponsor_category}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-16 text-center max-w-3xl mx-auto">
              <Award size={48} className="mx-auto mb-6 opacity-20 text-white" />
              <p className="font-black text-3xl" style={{ color: headColor }}>
                Partnerzy pojawią się wkrótce
              </p>
              <p className="text-base opacity-50 mt-3 font-medium text-white">
                Organizator opublikuje logotypy i informacje o partnerach, gdy będą gotowe.
              </p>
            </div>
          )}
        </section>
      )}


{/* ==========================================
          STUDIO LIVE & VOD - KINOWE DOŚWIADCZENIE
          ========================================== */}
      {isSectionVisible('live') && (
        <section
          id="public-live"
          className="relative z-10 px-6 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: event?.streaming_section_bg_color || bgColor }}
        >
          {/* Kinowe tło - bardzo delikatny gradient */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${primColor}15, transparent 70%)`
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto">

            {/* --- NAGŁÓWEK --- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-lg border border-white/5 backdrop-blur-md"
                style={{ backgroundColor: `${primColor}15`, color: primColor }}
              >
                <Video size={14} /> Studio Live
              </span>

              <h2
                className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9]"
                style={{
                  fontFamily: headFont,
                  color: event?.streaming_section_heading_color || headColor
                }}
              >
                {sectionTitle('live', event?.streaming_section_title || 'Studio Live')}
              </h2>

              <p
                className="max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed opacity-60"
                style={{ color: event?.streaming_section_text_color || txtColor }}
              >
                {sectionDescription(
                  'live',
                  event?.streaming_section_desc ||
                    'Oglądaj transmisję, zapowiedzi i materiały wideo związane z wydarzeniem.'
                )}
              </p>
            </motion.div>

            {/* --- GŁÓWNY ODTWARZACZ LIVE (CINEMATIC MODE) --- */}
            {event?.streaming_live_is_active && (event?.streaming_live_embed_url || event?.streaming_live_url) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-24 max-w-5xl mx-auto"
              >
                {/* Ambilight Glow pod odtwarzaczem */}
                <div
                  className="absolute inset-0 rounded-[40px] blur-[80px] opacity-40 pointer-events-none animate-pulse"
                  style={{ backgroundColor: primColor, animationDuration: '4s' }}
                />

                <div className="relative rounded-[40px] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 group">

                  {/* Floating Info Overlay (Chowa się przy hover, żeby nie zasłaniać wideo) */}
                  <div className="absolute top-0 left-0 w-full p-6 md:p-8 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none flex flex-col md:flex-row md:items-start justify-between gap-4 transition-opacity duration-500 group-hover:opacity-0">
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Na żywo
                      </span>
                      <h3 className="text-2xl md:text-4xl font-black mt-3 text-white drop-shadow-lg">
                        {event?.streaming_live_title || 'Oglądaj transmisję'}
                      </h3>
                      {event?.streaming_live_start_at && (
                        <p className="text-sm font-bold text-white/70 mt-2">
                          Start: {formatEventDateTime(event.streaming_live_start_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Player */}
                  <div className="aspect-video relative z-0">
                    <iframe
                      src={event.streaming_live_embed_url || event.streaming_live_url}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Awaryjny przycisk pod playerem */}
                {event?.streaming_live_url && (
                  <div className="flex justify-center mt-6">
                    <a
                      href={event.streaming_live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      style={{ color: txtColor }}
                    >
                      Nie działa? Otwórz w nowym oknie <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* --- BIBLIOTEKA VOD (ASYMETRYCZNY GRID) --- */}
            {eventVideos.length > 0 ? (
              <div>
                {/* Mały separator/tytuł nad galerią VOD */}
                <div className="flex items-center gap-4 mb-10 opacity-40">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: txtColor }}>Biblioteka wideo</p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {eventVideos.map((video, index) => {
                    // Lekki asymetryczny zigzag
                    const isStaggered = index % 2 !== 0;

                    return (
                      <motion.article
                        key={video.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className={`group relative ${isStaggered ? 'md:mt-12' : ''}`}
                      >
                        <a
                          href={video.video_url || video.embed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          {/* Miniatura z Play Buttonem na hover */}
                          <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5 mb-6">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video size={40} className="opacity-20" style={{ color: primColor }} />
                              </div>
                            )}

                            {/* Overlay przy najechaniu */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                              {/* Szklany przycisk PLAY */}
                              <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 delay-100">
                                {/* Trójkąt play w CSS */}
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                              </div>
                            </div>
                          </div>

                          {/* Teksty pod filmem (uwolnione z kafelka) */}
                          <div className="px-2">
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 block"
                              style={{ color: primColor }}
                            >
                              {video.video_type === 'promo' ? 'Promo' :
                               video.video_type === 'trailer' ? 'Zapowiedź' :
                               video.video_type === 'aftermovie' ? 'Aftermovie' : video.video_type}
                            </span>

                            <h3
                              className="text-xl md:text-2xl font-black leading-tight mb-2 group-hover:text-white transition-colors"
                              style={{ color: headColor }}
                            >
                              {video.title}
                            </h3>

                            {video.description && (
                              <p
                                className="text-xs opacity-50 leading-relaxed line-clamp-2"
                                style={{ color: txtColor }}
                              >
                                {video.description}
                              </p>
                            )}
                          </div>
                        </a>
                      </motion.article>
                    )
                  })}
                </div>
              </div>
            ) : (
              // Brak VOD, a nie ma Live
              !event?.streaming_live_is_active && (
                <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02] max-w-3xl mx-auto">
                  <Video size={40} className="mx-auto mb-6 opacity-20" style={{ color: txtColor }} />
                  <p className="font-black text-2xl" style={{ color: headColor }}>
                    Materiały wideo pojawią się wkrótce
                  </p>
                  <p className="text-sm opacity-50 mt-3" style={{ color: txtColor }}>
                    Organizator opublikuje tutaj linki do transmisji i relacji, gdy będą gotowe.
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      )}


{/* ==========================================
          GALERIA - KINOWA KARUZELA (HORIZONTAL SCROLL)
          ========================================== */}
      {(() => {
        if (galleryImages.length === 0) return null;

        return (
          <section className="relative z-10 py-24 md:py-32 overflow-hidden border-t border-white/5" style={{ backgroundColor: bgColor }}>
            {/* Tło i blury */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 mb-12 md:mb-16">
              <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 24 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10"
                  style={{ color: primColor, backgroundColor: `${primColor}10` }}
                >
                  <ImageIcon size={14} /> Klimat wydarzenia
                </span>

                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  Galeria
                </h2>
              </motion.div>
            </div>

            {/* --- KARUZELA SCROLL --- */}
            {/* Ukrywamy domyślny pasek przewijania dla czystości designu, zachowując płynny scroll */}
            <div className="relative w-full">
              <style dangerouslySetInnerHTML={{__html: `
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
              `}} />

              <div
                ref={galleryTrackRef}
                className="flex gap-6 md:gap-10 overflow-x-auto snap-x snap-mandatory px-6 md:px-[calc((100vw-80rem)/2+1.5rem)] pb-16 hide-scroll"
              >
                {galleryImages.map((imgUrl, index) => (
                  <motion.div
                    key={index}
                    whileInView={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative shrink-0 snap-center w-[85vw] sm:w-[70vw] md:w-[60vw] max-w-[900px] aspect-[4/3] md:aspect-[16/9] rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/5 bg-white/[0.02] group shadow-2xl"
                  >
                    <img
                      src={imgUrl}
                      alt={`Galeria ${index + 1}`}
                      className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />

                    {/* Delikatny gradient i efekt nakładki podczas hovera */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>
                ))}
              </div>

              {galleryImages.length > 1 && (
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-2">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => scrollGalleryToIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          activeGalleryIndex === index ? 'w-9' : 'w-2.5 opacity-40 hover:opacity-80'
                        }`}
                        style={{ backgroundColor: activeGalleryIndex === index ? primColor : headColor }}
                        aria-label={`Pokaż zdjęcie ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollGalleryToIndex(activeGalleryIndex - 1)}
                      className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      aria-label="Poprzednie zdjęcie"
                    >
                      <ChevronRight size={18} className="rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollGalleryToIndex(activeGalleryIndex + 1)}
                      className="w-11 h-11 rounded-full border border-white/10 text-black transition-all flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: primColor }}
                      aria-label="Następne zdjęcie"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}


{/* ==========================================
          MATERIAŁY - INTERAKTYWNA, OTWARTA LISTA POBIERANIA
          ========================================== */}
      {isSectionVisible('materials') && (
        <section
          id="public-materials"
          className="relative z-10 py-32 overflow-hidden border-t border-white/5"
          style={{ backgroundColor: bgColor }}
        >
          {/* Subtelne podświetlenie tła */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 w-[50vw] h-[50vw] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none"
          />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

              {/* Lewa kolumna: Tytuł i opcjonalne zdjęcie z CMS */}
              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -40 }}
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-5 flex flex-col justify-center"
              >
                <span
                  className="inline-flex items-center w-fit gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10"
                  style={{ color: primColor, backgroundColor: `${primColor}10` }}
                >
                  <Download size={14} /> Baza Wiedzy
                </span>

                <h2
                  className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6"
                  style={{ fontFamily: headFont, color: headColor }}
                >
                  {sectionTitle('materials', 'Materiały do pobrania')}
                </h2>

                {sectionDescription('materials') && (
                  <p className="text-sm md:text-base opacity-60 font-medium leading-relaxed mb-10" style={{ color: txtColor }}>
                    {sectionDescription('materials', 'Ważne pliki i linki od organizatora.')}
                  </p>
                )}

                {/* Jeśli organizator dodał zdjęcie w CMS, pokażemy je jako artystyczny dodatek */}
                {sectionImage('materials') && (
                  <div className="relative aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden border border-white/5 bg-white/5 mt-auto hidden lg:block shadow-2xl">
                    <img
                      src={sectionImage('materials')}
                      alt="Materiały"
                      className="w-full h-full object-cover filter grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${bgColor}, transparent 60%)` }} />
                  </div>
                )}
              </motion.div>

              {/* Prawa kolumna: Kinowa, uwolniona lista materiałów */}
              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 40 }}
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-7 flex flex-col justify-center"
              >
                {materials.length > 0 ? (
                  <div className="flex flex-col">
                    {/* Górna linia zamykająca blok wizualnie */}
                    <div className="w-full h-px bg-white/10" />

                    {materials.map((material: any, index: number) => {
                      const href = material.file_url || material.external_url;
                      if (!href) return null;

                      return (
                        <a
                          key={material.id}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block py-8 md:py-10 border-b border-white/10 transition-colors"
                        >
                          {/* Rozmyte tło pojawiające się przy najechaniu (Hover Reveal) */}
                          <div
                            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: `linear-gradient(90deg, ${primColor}0A 0%, transparent 100%)` }}
                          />

                          <div className="relative z-10 flex items-center justify-between gap-6">
                            <div className="flex-1 pr-4">
                              <p
                                className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 transition-all duration-300 group-hover:opacity-80"
                                style={{ color: primColor }}
                              >
                                {material.material_type || 'Dokument'}
                              </p>
                              <h3
                                className="text-2xl md:text-3xl font-black leading-tight group-hover:translate-x-3 transition-transform duration-500"
                                style={{ color: headColor }}
                              >
                                {material.title || 'Materiał do pobrania'}
                              </h3>
                              {material.description && (
                                <p
                                  className="text-sm opacity-50 mt-3 line-clamp-2 transition-all duration-500 group-hover:opacity-70 group-hover:translate-x-3"
                                  style={{ color: txtColor }}
                                >
                                  {material.description}
                                </p>
                              )}
                            </div>

                            {/* Przycisk pobierania z efektem "wyskoku" */}
                            <div className="shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/10 bg-white/[0.02] group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:scale-110 shadow-lg">
                              <Download
                                size={24}
                                className="opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-1"
                                style={{ color: primColor }}
                              />
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-16 text-center shadow-inner">
                    <Download size={48} className="mx-auto mb-6 opacity-20 text-white" />
                    <p className="font-black text-2xl" style={{ color: headColor }}>
                      Brak materiałów
                    </p>
                    <p className="text-sm opacity-50 mt-3 font-medium text-white">
                      Organizator udostępni pliki do pobrania wkrótce.
                    </p>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </section>
      )}
{/* ==========================================
 STOPKA (GRAND FOOTER) - MATERIAŁY, SOCIALE I WIELKI FINAŁ
  ========================================== */}
 <footer
        className="relative z-10 pt-32 pb-12 overflow-hidden border-t border-white/5"
        style={{ backgroundColor: bgColor }}
      >
        {/* Potężny, kinowy blask z dołu ekranu */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[100vw] h-[50vw] rounded-full blur-[150px] pointer-events-none opacity-30"
          style={{ backgroundColor: primColor }}
        />

        {/* Gigantyczna, wtopiona w tło nazwa wydarzenia (Zabieg z topowych agencji) */}
        <div className="absolute top-10 left-0 w-full overflow-hidden flex justify-center pointer-events-none opacity-[0.03] select-none">
          <h2
            className="text-[15vw] font-black tracking-tighter whitespace-nowrap"
            style={{ color: headColor }}
          >
            {event?.title || 'Wydarzenie'}
          </h2>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start mb-24">

            {/* KOLUMNA 1: Logo i Informacje */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-4 flex flex-col items-start"
            >
              {event?.logo_url && (
                <img
                  src={event.logo_url}
                  alt={event?.title || 'Logo wydarzenia'}
                  className="h-20 md:h-28 max-w-[280px] object-contain mb-8 filter drop-shadow-2xl"
                />
              )}

              <h3
                className="text-3xl md:text-4xl font-black tracking-tighter mb-4"
                style={{ fontFamily: headFont, color: headColor }}
              >
                {event?.title || 'Wydarzenie'}
              </h3>

              {event?.location && (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <MapPin size={16} style={{ color: primColor }} />
                  <span className="text-sm font-bold" style={{ color: txtColor }}>{event.location}</span>
                </div>
              )}
            </motion.div>

            {/* KOLUMNA 2: Materiały do pobrania (Otwarta lista, bez kafelków) */}
            {(isSectionVisible('materials') || isSectionVisible('documents')) && materials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-5"
              >
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-50"
                  style={{ color: txtColor }}
                >
                  {footerMaterialsTitle || 'Baza wiedzy'}
                </h4>

                <div className="flex flex-col border-t border-white/10">
                  {materials.map((material: any) => {
                    const href = material.file_url || material.external_url;
                    if (!href) return null;

                    return (
                      <a
                        key={material.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-6 py-6 border-b border-white/10 transition-all hover:bg-white/[0.02] px-4 -mx-4 rounded-2xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-lg md:text-xl font-black truncate group-hover:translate-x-2 transition-transform duration-300"
                            style={{ color: headColor }}
                          >
                            {material.title || 'Materiał do pobrania'}
                          </p>

                          {material.description && (
                            <p
                              className="text-xs opacity-50 mt-2 line-clamp-1 group-hover:translate-x-2 transition-transform duration-300 delay-75"
                              style={{ color: txtColor }}
                            >
                              {material.description}
                            </p>
                          )}
                        </div>

                        {/* Przycisk pobierania z efektem rośnięcia */}
                        <div
                          className="shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          style={{ borderColor: `${primColor}40`, backgroundColor: `${primColor}10` }}
                        >
                          <Download
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-y-0.5"
                            style={{ color: primColor }}
                          />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* KOLUMNA 3: Social Media (Pływające bańki) */}
            {socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3 flex flex-col lg:items-end"
              >
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-50"
                  style={{ color: txtColor }}
                >
                  Bądź na bieżąco
                </h4>

                <div className="flex flex-wrap lg:justify-end gap-3">
                  {socialLinks.map(({ key, label, href, icon: Icon }) => (
                    <a
                      key={key}
                      href={href as string}
                      target={key === 'email' ? undefined : '_blank'}
                      rel={key === 'email' ? undefined : 'noopener noreferrer'}
                      aria-label={label}
                      title={label}
                      className="w-14 h-14 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-white hover:text-black shadow-lg"
                      style={{ color: txtColor }}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Dolny pasek z Prawami Autorskimi i brandingiem ANM */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs font-bold opacity-40" style={{ color: txtColor }}>
              {event?.title || 'Event'} © {new Date().getFullYear()}. Wszelkie prawa zastrzeżone.
            </p>

            <p className="text-xs font-bold opacity-60" style={{ color: txtColor }}>
              Platforma operacyjna od{' '}
              <a
                href="https://anmcollective.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black transition-all hover:opacity-100 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase tracking-wider ml-1"
                style={{ color: primColor }}
              >
                ANM Collective
              </a>
            </p>
          </motion.div>
        </div>
      </footer>




      {/* FORMY REJESTRACJI I RSVP */}
<div id="rsvp-target" className="max-w-4xl mx-auto px-6 pb-40 pt-12">
  <AnimatePresence mode="wait">
    {!submitted ? (
      <motion.div
        key="form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`glass-card p-10 md:p-16 border-white/10 ${shape}`}
        style={{ backgroundColor: cardBg + 'CC' }}
      >
        <h3
          className="text-3xl font-black mb-8 text-center"
          style={{ fontFamily: headFont, color: headColor }}
        >
          Zarejestruj się
        </h3>

        {event?.registration_is_open === false && (
          <div
            className="mb-8 rounded-[32px] border p-5 text-center"
            style={{
              borderColor: `${primColor}35`,
              backgroundColor: `${primColor}10`
            }}
          >
            <Clock size={34} className="mx-auto mb-3" style={{ color: primColor }} />
            <p className="font-black text-lg" style={{ color: headColor }}>
              Rejestracja jest zamknięta
            </p>
            <p className="text-sm opacity-60 mt-2">
              Organizator wyłączył aktualnie przyjmowanie nowych zgłoszeń.
            </p>
          </div>
        )}

        <form onSubmit={handleJoin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            required
            placeholder="Imię"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <input
            required
            placeholder="Nazwisko"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <input
            required
            type="email"
            placeholder="Email"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="tel"
            placeholder="Telefon"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            required
            placeholder="Firma"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />

          <input
            placeholder="Stanowisko"
            className="bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all"
            style={{ borderColor: `${primColor}30` }}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />

          {showTicketSelector && ticketTiers.length > 0 && (
            <div
              className="md:col-span-2 rounded-[32px] border p-4 md:p-5 space-y-4"
              style={{
                borderColor: `${primColor}35`,
                backgroundColor: `${primColor}08`
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-2xl"
                  style={{ backgroundColor: `${primColor}20`, color: primColor }}
                >
                  <Ticket size={18} />
                </div>

                <div>
                  <p
                    className="text-sm font-black uppercase tracking-widest"
                    style={{ color: headColor }}
                  >
                    Wybierz typ biletu
                  </p>

                  <p className="text-xs opacity-60 mt-1">
                    {registrationMode === 'paid' || selectedTicketRequiresPayment
                      ? 'Po wysłaniu zgłoszenia pokażemy link do zewnętrznej płatności.'
                      : 'Ten typ biletu nie wymaga płatności. Po wysłaniu zgłoszenia aktywujemy miejsce, jeśli limit nie jest przekroczony.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ticketTiers.map((tier: any) => {
                  const selected = selectedTicketTierId === tier.id
                  const price = Number(tier.price || 0)

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTicketTierId(tier.id)}
                      className="text-left rounded-3xl border p-4 transition-all"
                      style={{
                        borderColor: selected ? primColor : `${primColor}25`,
                        backgroundColor: selected ? `${primColor}18` : 'rgba(255,255,255,0.04)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className="font-black text-base"
                            style={{ color: selected ? headColor : txtColor }}
                          >
                            {tier.name}
                          </p>

                          {tier.description && (
                            <p className="text-xs opacity-60 mt-1 leading-relaxed">
                              {tier.description}
                            </p>
                          )}
                        </div>

                        <span
                          className="shrink-0 text-xs font-black rounded-full px-3 py-1"
                          style={{
                            backgroundColor: selected ? primColor : `${primColor}20`,
                            color: selected ? '#000000' : primColor
                          }}
                        >
                          {price > 0 ? `${price.toLocaleString('pl-PL')} PLN` : 'Free'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={event?.registration_is_open === false}
            className="md:col-span-2 py-5 text-black font-black uppercase tracking-widest rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: primColor }}
          >
            Prześlij zgłoszenie
          </button>
        </form>
      </motion.div>
    ) : submitted && application?.ticket_status === 'waitlist' ? (
      <motion.div
        key="waitlist"
        className="text-center p-10 md:p-20 glass-card rounded-[40px]"
        style={{ backgroundColor: cardBg + 'CC' }}
      >
        <Clock size={60} className="mx-auto mb-6" style={{ color: primColor }} />

        <h2 className="text-3xl font-black mb-4" style={{ color: headColor }}>
          Lista rezerwowa
        </h2>

        <p className="opacity-60 font-light max-w-2xl mx-auto mb-6">
          Limit miejsc został osiągnięty. Twoje zgłoszenie zostało zapisane i trafiło na listę rezerwową.
        </p>

        <p className="text-sm opacity-50 max-w-2xl mx-auto">
          Wróć pod ten adres i sprawdzaj status zgłoszenia oraz aktualne informacje:
          {' '}
          <span className="font-bold">{statusCheckUrl}</span>
        </p>
      </motion.div>
    ) : submitted && application?.payment_status === 'unpaid' ? (
      <motion.div
        key="payment"
        className="text-center p-10 md:p-20 glass-card rounded-[40px]"
        style={{ backgroundColor: cardBg + 'CC' }}
      >
        <CreditCard size={60} className="mx-auto mb-6" style={{ color: primColor }} />

        <h2 className="text-3xl font-black mb-4" style={{ color: headColor }}>
          Zgłoszenie przyjęte
        </h2>

        <p className="opacity-60 font-light max-w-2xl mx-auto mb-8">
          {event?.payment_pending_message ||
            'Wybrany bilet wymaga płatności. Dokończ ją przez zewnętrzny link, a organizator potwierdzi Twoje miejsce po zaksięgowaniu.'}
        </p>

        <p className="text-sm opacity-50 max-w-2xl mx-auto mb-8">
          Wróć pod ten adres i sprawdzaj status płatności, potwierdzenie udziału oraz aktualne informacje:
          {' '}
          <span className="font-bold">{statusCheckUrl}</span>
        </p>

        {selectedPaymentLink ? (
          <a
            href={selectedPaymentLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-black"
            style={{ backgroundColor: primColor }}
          >
            Przejdź do płatności <ArrowRight size={18} />
          </a>
        ) : (
          <p className="text-sm opacity-50">
            Organizator nie dodał jeszcze linku płatności. Skontaktujemy się mailowo.
          </p>
        )}
      </motion.div>
    ) : submitted && !isApproved ? (
      <motion.div
        key="pending"
        className="text-center p-10 md:p-20 glass-card rounded-[40px]"
        style={{ backgroundColor: cardBg + 'CC' }}
      >
        <Clock size={60} className="mx-auto mb-6" style={{ color: primColor }} />

        <h2 className="text-3xl font-black mb-4" style={{ color: headColor }}>
          Czekamy na weryfikację
        </h2>

        <p className="opacity-50 font-light max-w-2xl mx-auto">
          Twoje zgłoszenie zostało przyjęte i czeka na potwierdzenie przez organizatora.
        </p>

        <p className="text-sm opacity-50 max-w-2xl mx-auto mt-6">
          Wróć pod ten adres i sprawdzaj status potwierdzenia oraz aktualne informacje:
          {' '}
          <span className="font-bold">{statusCheckUrl}</span>
        </p>
      </motion.div>
    ) : isApproved && !rsvpSent ? (
      <div className="text-center py-20">
        <Sparkles className="mx-auto mb-6" style={{ color: primColor }} size={48} />

        <h2 className="text-4xl font-black mb-6" style={{ color: headColor }}>
          Zostałeś zaproszony!
        </h2>

        <p className="opacity-50 mb-4">
          {event?.payment_success_message || 'Twoje zgłoszenie jest aktywne.'}
        </p>

        <p className="opacity-50 mb-10 max-w-2xl mx-auto">
          Wróć pod ten adres i sprawdzaj aktualne informacje. Kliknij przycisk na dole, aby potwierdzić obecność i uzupełnić szczegóły logistyczne.
        </p>
      </div>
    ) : rsvpSent && (
      <motion.div
        key="done"
        className="text-center p-10 md:p-16 glass-card rounded-[40px] border-emerald-500/20"
        style={{
          backgroundColor: `${primColor}10`,
          borderColor: `${primColor}40`
        }}
      >
        <CheckCircle2 size={60} className="mx-auto mb-6" style={{ color: primColor }} />

        <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: headColor }}>
          Zgłoszenie potwierdzone
        </h2>

        <p className="opacity-60 max-w-2xl mx-auto">
          To jest Twoje cyfrowe centrum wydarzenia. Wracaj tutaj, aby sprawdzać aktualne informacje i uzupełniać wybory, gdy organizator je udostępni.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 max-w-2xl mx-auto">
          <Leaf className="mx-auto mb-3" style={{ color: primColor }} />
          <p className="font-black">
            Jeden aktualny link zamiast papierowych wydruków
          </p>
          <p className="text-sm opacity-55 mt-2">
            Organizator może aktualizować tę stronę na bieżąco, bez drukowania dodatkowych materiałów.
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToFirstAvailableSection}
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-black"
          style={{ backgroundColor: primColor }}
        >
          Sprawdź dostępne opcje <ArrowRight size={16} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>

{/* MODAL: PANEL WYBORÓW UCZESTNIKA */}

 <AnimatePresence>
  {activeActionModal && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveActionModal(null)}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-3xl max-h-[86vh] overflow-hidden border shadow-[0_30px_120px_rgba(0,0,0,0.55)] ${shape}`}
        style={{
          backgroundColor: `${cardBg}F2`,
          borderColor: `${primColor}24`
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background: `radial-gradient(circle at 10% 0%, ${primColor}20, transparent 34%), radial-gradient(circle at 90% 10%, ${secColor}16, transparent 30%)`
          }}
        />

        {/* Header */}
        <div
          className="relative z-10 px-5 md:px-6 py-5 border-b flex items-start justify-between gap-4"
          style={{ borderColor: `${primColor}22` }}
        >
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.28em] mb-2"
              style={{ color: primColor }}
            >
              Centrum uczestnika
            </p>

            <h2
              className="text-2xl md:text-3xl font-black tracking-tighter"
              style={{ color: headColor, fontFamily: headFont }}
            >
              {activeActionModal === 'menu' && 'Wybór menu'}
              {activeActionModal === 'gadgets' && 'Wybór gadżetów'}
              {activeActionModal === 'workshops' && 'Zapisy na warsztaty'}
              {activeActionModal === 'transport' && 'Transport i dojazd'}
            </h2>

            <p className="text-xs md:text-sm opacity-60 mt-1 max-w-xl">
              Uzupełnij wybory osobno dla każdej osoby z Twojego zgłoszenia.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveActionModal(null)}
            className="w-10 h-10 shrink-0 rounded-full border bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            style={{ borderColor: `${primColor}24` }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="relative z-10 px-5 md:px-6 py-5 overflow-y-auto max-h-[calc(86vh-160px)] custom-scrollbar">
          {actionMessage && (
            <div
              className="rounded-2xl border p-3 text-xs md:text-sm font-bold mb-4"
              style={{
                borderColor: `${primColor}24`,
                backgroundColor: `${primColor}10`
              }}
            >
              {actionMessage}
            </div>
          )}

          {participantUnits.length === 0 ? (
            <div
              className="rounded-3xl border p-8 text-center"
              style={{
                borderColor: `${primColor}24`,
                backgroundColor: `${cardBg}CC`
              }}
            >
              <Users className="mx-auto mb-4 opacity-40" size={34} />

              <p className="font-black" style={{ color: headColor }}>
                Najpierw wyślij zgłoszenie RSVP.
              </p>

              <p className="text-sm opacity-55 mt-2">
                Po zapisaniu zgłoszenia wróć tutaj i uzupełnij wybory uczestników.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {participantUnits.map((unit: any) => (
                <div
                  key={unit.id}
                  className="rounded-3xl border p-4 md:p-5"
                  style={{
                    borderColor: `${primColor}20`,
                    backgroundColor: `${cardBg}DD`
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2"
                        style={{ backgroundColor: `${primColor}20`, color: primColor }}
                      >
                        {unit.unit_type === 'child'
                          ? 'Dziecko'
                          : unit.unit_type === 'companion'
                            ? 'Osoba towarzysząca'
                            : 'Uczestnik główny'}
                      </span>

                      <h3 className="text-lg md:text-xl font-black" style={{ color: headColor }}>
                        {unit.display_name || 'Uczestnik'}
                      </h3>

                      {(activeActionModal === 'menu' || activeActionModal === 'gadgets') && (
                        <p className="text-[11px] opacity-45 mt-1">
                          Dieta: {unit.diet || application?.diet || 'brak'} · Alergie: {unit.allergies || application?.allergies || 'brak'}
                        </p>
                      )}
                    </div>
                  </div>

                  {activeActionModal === 'menu' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {meals.length === 0 ? (
                        <p className="text-sm opacity-55">
                          Organizator nie udostępnił jeszcze dań do wyboru.
                        </p>
                      ) : (
                        meals.map((meal: any) => {
                          const selected = pendingMenuChoices[unit.id] === meal.id

                          return (
                            <button
                              key={meal.id}
                              type="button"
                              onClick={() =>
                                setPendingMenuChoices((prev) => ({
                                  ...prev,
                                  [unit.id]: meal.id
                                }))
                              }
                              className="text-left rounded-2xl border p-3.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                              style={{
                                borderColor: selected ? primColor : `${primColor}22`,
                                backgroundColor: selected ? `${primColor}18` : `${cardBg}CC`
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-sm" style={{ color: headColor }}>
                                    {meal.name}
                                  </p>

                                  <p className="text-[11px] opacity-55 mt-1">
                                    {[meal.dietary_category, meal.meal_type].filter(Boolean).join(' / ') || 'menu'}
                                  </p>

                                  {meal.description && (
                                    <p className="text-[11px] opacity-45 mt-2 line-clamp-2">
                                      {meal.description}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className="w-5 h-5 rounded-full border shrink-0 flex items-center justify-center text-[10px] font-black"
                                  style={{
                                    borderColor: selected ? primColor : `${primColor}30`,
                                    backgroundColor: selected ? primColor : 'transparent',
                                    color: selected ? '#000' : 'transparent'
                                  }}
                                >
                                  ✓
                                </span>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}

                  {activeActionModal === 'workshops' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {sessions.length === 0 ? (
                        <p className="text-sm opacity-55">
                          Organizator nie udostępnił jeszcze warsztatów.
                        </p>
                      ) : (
                        sessions.map((session: any) => {
                          const selected = (pendingSessionChoices[unit.id] || []).includes(session.id)

                          return (
                            <button
                              key={session.id}
                              type="button"
                              onClick={() =>
                                setPendingSessionChoices((prev) => {
                                  const current = prev[unit.id] || []

                                  return {
                                    ...prev,
                                    [unit.id]: selected
                                      ? current.filter((id) => id !== session.id)
                                      : [...current, session.id]
                                  }
                                })
                              }
                              className="text-left rounded-2xl border p-3.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                              style={{
                                borderColor: selected ? primColor : `${primColor}22`,
                                backgroundColor: selected ? `${primColor}18` : `${cardBg}CC`
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-sm leading-tight" style={{ color: headColor }}>
                                    {session.title}
                                  </p>

                                  <p className="text-[11px] opacity-55 mt-1">
                                    {session.location || session.session_type || 'warsztat'}
                                  </p>

                                  {session.start_time && (
                                    <p className="text-[10px] opacity-40 mt-1">
                                      {formatEventDateTime(session.start_time)}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className="w-5 h-5 rounded-full border shrink-0 flex items-center justify-center text-[10px] font-black"
                                  style={{
                                    borderColor: selected ? primColor : `${primColor}30`,
                                    backgroundColor: selected ? primColor : 'transparent',
                                    color: selected ? '#000' : 'transparent'
                                  }}
                                >
                                  ✓
                                </span>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}

                  {activeActionModal === 'gadgets' && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPendingGadgetChoices((prev) => ({
                            ...prev,
                            [unit.id]: { declined: true }
                          }))
                        }
                        className="w-full rounded-2xl border p-3.5 text-left font-black transition-all"
                        style={{
                          borderColor: pendingGadgetChoices[unit.id]?.declined ? primColor : `${primColor}22`,
                          backgroundColor: pendingGadgetChoices[unit.id]?.declined ? `${primColor}18` : `${cardBg}CC`
                        }}
                      >
                        <p className="text-sm" style={{ color: headColor }}>
                          Nie chcę gadżetu
                        </p>

                        <p className="text-[11px] opacity-50 mt-1 font-medium">
                          Wybierz tę opcję, jeśli ta osoba nie potrzebuje gadżetu.
                        </p>
                      </button>

                      {gadgets.length === 0 ? (
                        <p className="text-sm opacity-55">
                          Organizator nie udostępnił jeszcze gadżetów do wyboru.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {gadgets.map((gadget: any) => {
                            const status = getGadgetStockStatus(gadget)
                            const selected = pendingGadgetChoices[unit.id]?.gadget_id === gadget.id
                            const disabled = status === 'sold_out'
                            const available = getGadgetAvailableQuantity(gadget)

                            return (
                              <div
                                key={gadget.id}
                                className={`rounded-2xl border p-3 transition-all ${disabled ? 'opacity-40' : ''}`}
                                style={{
                                  borderColor: selected ? primColor : `${primColor}22`,
                                  backgroundColor: selected ? `${primColor}18` : `${cardBg}CC`
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() =>
                                    setPendingGadgetChoices((prev) => ({
                                      ...prev,
                                      [unit.id]: {
                                        gadget_id: gadget.id,
                                        selected_size: null,
                                        declined: false
                                      }
                                    }))
                                  }
                                  className="w-full text-left disabled:cursor-not-allowed"
                                >
                                  {gadget.image_url && (
                                    <img
                                      src={gadget.image_url}
                                      alt={gadget.public_label || gadget.name || 'Gadżet'}
                                      className="h-20 w-full object-cover rounded-xl mb-2"
                                    />
                                  )}

                                  <p className="font-black text-xs" style={{ color: headColor }}>
                                    {gadget.public_label || gadget.name}
                                  </p>

                                  <p className="text-[10px] font-bold opacity-50 mt-1">
                                    {disabled
                                      ? 'Niedostępny'
                                      : status === 'unlimited'
                                        ? 'Bez limitu'
                                        : `Dostępne: ${available}`}
                                  </p>
                                </button>

                                {selected && gadget.size_required === true && (
                                  <select
                                    className="mt-2 w-full border rounded-xl px-3 py-2 text-xs outline-none"
                                    style={{
                                      backgroundColor: `${cardBg}F2`,
                                      borderColor: `${primColor}24`,
                                      color: txtColor
                                    }}
                                    value={pendingGadgetChoices[unit.id]?.selected_size || ''}
                                    onChange={(e) =>
                                      setPendingGadgetChoices((prev) => ({
                                        ...prev,
                                        [unit.id]: {
                                          ...prev[unit.id],
                                          selected_size: e.target.value
                                        }
                                      }))
                                    }
                                  >
                                    <option value="">Rozmiar</option>
                                    {getGadgetSizeOptions(gadget).map((size) => (
                                      <option key={size} value={size}>
                                        {size}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {activeActionModal === 'transport' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <select
                        className="border rounded-2xl px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${cardBg}F2`,
                          borderColor: `${primColor}24`,
                          color: txtColor
                        }}
                        value={pendingTransportChoices[unit.id]?.transport || 'Własny dojazd'}
                        onChange={(e) =>
                          setPendingTransportChoices((prev) => ({
                            ...prev,
                            [unit.id]: {
                              ...(prev[unit.id] || { transport_address: '' }),
                              transport: e.target.value
                            }
                          }))
                        }
                      >
                        <option value="Własny dojazd">Własny dojazd</option>
                        <option value="Carpooling">Carpooling</option>
                        <option value="Transfer">Transfer organizatora</option>
                        <option value="Nie wiem">Nie wiem jeszcze</option>
                      </select>

                      <input
                        className="border rounded-2xl px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${cardBg}F2`,
                          borderColor: `${primColor}24`,
                          color: txtColor
                        }}
                        placeholder="Miasto / adres / uwagi"
                        value={pendingTransportChoices[unit.id]?.transport_address || ''}
                        onChange={(e) =>
                          setPendingTransportChoices((prev) => ({
                            ...prev,
                            [unit.id]: {
                              ...(prev[unit.id] || { transport: 'Własny dojazd' }),
                              transport_address: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="relative z-10 px-5 md:px-6 py-4 border-t flex flex-col md:flex-row justify-end gap-3"
          style={{
            borderColor: `${primColor}22`,
            backgroundColor: `${cardBg}E6`
          }}
        >
          <button
            type="button"
            onClick={() => setActiveActionModal(null)}
            className="px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            style={{ borderColor: `${primColor}24` }}
          >
            Zamknij
          </button>

          <button
            type="button"
            disabled={actionSaving || participantUnits.length === 0}
            onClick={saveParticipantAction}
            className="px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-black disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-transform"
            style={{ backgroundColor: primColor }}
          >
            {actionSaving
              ? 'Zapisywanie...'
              : activeActionModal === 'workshops'
                ? 'Zapisz warsztaty'
                : activeActionModal === 'menu'
                  ? 'Zapisz menu'
                  : activeActionModal === 'gadgets'
                    ? 'Zapisz gadżety'
                    : 'Zapisz transport'}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

     {/* MODAL: DODAJ OGŁOSZENIE CARPOOLING */}
<AnimatePresence>
  {isCarpoolModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCarpoolModalOpen(false)}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className={`relative z-10 w-full max-w-md bg-[#0f0f0f] border border-white/10 p-8 shadow-2xl ${shape}`}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
              style={{ color: primColor }}
            >
              Carpooling
            </p>

            <h3
              className="text-2xl font-black tracking-tighter"
              style={{ color: headColor }}
            >
              Dodaj przejazd
            </h3>

            <p className="text-xs opacity-55 mt-2 leading-relaxed">
              Opublikuj ogłoszenie, jeśli masz wolne miejsca albo chcesz skoordynować wspólny dojazd z innymi uczestnikami.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCarpoolModalOpen(false)}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAddCarpoolAd} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
              Z jakiego miasta jedziesz?
            </label>

            <input
              required
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none transition-colors"
              style={{ borderColor: `${primColor}30` }}
              placeholder="np. Łódź"
              value={newAd.route_from}
              onChange={(e) => setNewAd({ ...newAd, route_from: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
              Liczba wolnych miejsc
            </label>

            <input
              required
              type="number"
              min="1"
              max="8"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none transition-colors"
              style={{ borderColor: `${primColor}30` }}
              value={newAd.seats_avail}
              onChange={(e) =>
                setNewAd({
                  ...newAd,
                  seats_avail: Math.min(Math.max(Number.parseInt(e.target.value || '1', 10) || 1, 1), 8)
                })
              }
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
              Numer telefonu do kontaktu
            </label>

            <input
              required
              type="tel"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none transition-colors"
              style={{ borderColor: `${primColor}30` }}
              placeholder="+48..."
              value={newAd.contact_sh}
              onChange={(e) => setNewAd({ ...newAd, contact_sh: e.target.value })}
            />

            <p className="text-[10px] opacity-40 mt-2">
              Numer będzie użyty do kontaktu przez WhatsApp.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-black font-black uppercase tracking-widest rounded-xl mt-4 transition-transform hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: primColor }}
          >
            Opublikuj ogłoszenie
          </button>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* MODAL: KROKOWY FORMULARZ RSVP */}
<AnimatePresence>
  {isModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsModalOpen(false)}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className={`relative z-10 w-full max-w-2xl bg-[#0f0f0f] border border-white/10 p-8 md:p-12 overflow-y-auto max-h-[85vh] custom-scrollbar ${shape}`}
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="w-10 h-1 rounded-full"
                style={{
                  backgroundColor: step <= activeRSVPStep ? primColor : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitError(null)

            if (activeRSVPStep < 5) {
              setActiveRSVPStep(activeRSVPStep + 1)
            } else {
              handleUpdateLogistics(e)
            }
          }}
        >
          {/* KROK 1: Logistyka */}
          {activeRSVPStep === 1 && (
            <div className="space-y-6">
              <h3
                className="text-3xl font-black tracking-tighter"
                style={{ color: headColor }}
              >
                Osoby i transport
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                      Czy przychodzisz z osobą towarzyszącą?
                    </label>

                    <select
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                      style={{ borderColor: `${primColor}30` }}
                      value={logistics.companion === '0' ? '0' : '1'}
                      onChange={(e) => setCompanionStatus(e.target.value === '1')}
                    >
                      <option className="bg-black" value="0">Nie</option>
                      <option className="bg-black" value="1">Tak</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                      Liczba dzieci
                    </label>

                    <select
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                      style={{ borderColor: `${primColor}30` }}
                      value={logistics.kids || '0'}
                      onChange={(e) => setKidsCount(e.target.value)}
                    >
                      {['0', '1', '2', '3', '4', '5', '6', '7'].map((value) => (
                        <option key={value} className="bg-black" value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {logistics.companion !== '0' && (
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                      Imię osoby towarzyszącej
                    </label>

                    <input
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                      style={{ borderColor: `${primColor}30` }}
                      placeholder="np. Katarzyna"
                      value={logistics.companion === '1' ? '' : logistics.companion}
                      onChange={(e) => setCompanionName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                    Transport
                  </label>

                  <select
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                    style={{ borderColor: `${primColor}30` }}
                    value={logistics.transport}
                    onChange={(e) => setLogistics({ ...logistics, transport: e.target.value })}
                  >
                    <option className="bg-black" value="Własny dojazd">Własny dojazd</option>
                    <option className="bg-black" value="Carpooling">Szukam miejsca / carpooling</option>
                    <option className="bg-black" value="Carpooling_driver">Oferuję miejsce / kierowca carpooling</option>
                    <option className="bg-black" value="Transfer">Chcę skorzystać z transportu organizatora</option>
                    <option className="bg-black" value="Nie wiem">Jeszcze nie wiem</option>
                  </select>
                </div>

                {logistics.transport !== 'Własny dojazd' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                        Skąd jedziesz?
                      </label>

                      <input
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                        style={{ borderColor: `${primColor}30` }}
                        placeholder="np. Warszawa, Dworzec Centralny"
                        value={logistics.transport_address}
                        onChange={(e) =>
                          setLogistics({ ...logistics, transport_address: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                        Uwagi transportowe
                      </label>

                      <input
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                        style={{ borderColor: `${primColor}30` }}
                        placeholder="np. jadę z dzieckiem, mam 2 miejsca"
                        value={logistics.extra_notes}
                        onChange={(e) =>
                          setLogistics({ ...logistics, extra_notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {additionalGuests.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <h4
                        className="text-sm font-black uppercase tracking-widest"
                        style={{ color: headColor }}
                      >
                        Osoby dodatkowe
                      </h4>

                      <p className="text-[11px] opacity-50 mt-1">
                        Domyślnie dziedziczą preferencje uczestnika głównego. Odznacz tę opcję tylko wtedy, gdy ktoś ma inne potrzeby.
                      </p>
                    </div>

                    {additionalGuests.map((guest, index) => (
                      <div
                        key={guest.local_id}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <span className="inline-flex px-2 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase mb-2">
                              {guest.unit_type === 'companion' ? 'Osoba towarzysząca' : `Dziecko ${index + 1}`}
                            </span>

                            <p className="font-black">
                              {guest.display_name}
                            </p>
                          </div>

                          <label className="flex items-center gap-2 text-[11px] font-black uppercase">
                            <input
                              type="checkbox"
                              checked={guest.same_as_main}
                              onChange={(e) =>
                                updateAdditionalGuest(guest.local_id, {
                                  same_as_main: e.target.checked
                                })
                              }
                            />
                            Te same preferencje co uczestnik główny
                          </label>
                        </div>

                        {guest.same_as_main ? (
                          <p className="text-xs opacity-50 leading-relaxed">
                            Ta osoba dziedziczy dietę, alergie, transport, gadżety i warsztaty głównego uczestnika.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                                placeholder={guest.unit_type === 'child' ? 'Imię dziecka' : 'Imię osoby towarzyszącej'}
                                value={guest.first_name || ''}
                                onChange={(e) =>
                                  updateAdditionalGuest(guest.local_id, {
                                    first_name: e.target.value,
                                    display_name: e.target.value || guest.display_name
                                  })
                                }
                              />

                              <input
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                                placeholder="Dieta, np. standard / wege / dziecięce"
                                value={guest.diet}
                                onChange={(e) =>
                                  updateAdditionalGuest(guest.local_id, { diet: e.target.value })
                                }
                              />
                            </div>

                            <textarea
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                              placeholder="Alergie / nietolerancje tej osoby"
                              value={guest.allergies}
                              onChange={(e) =>
                                updateAdditionalGuest(guest.local_id, { allergies: e.target.value })
                              }
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                                value={guest.transport}
                                onChange={(e) =>
                                  updateAdditionalGuest(guest.local_id, { transport: e.target.value })
                                }
                              >
                                <option className="bg-black" value="">Jak uczestnik główny</option>
                                <option className="bg-black" value="Własny dojazd">Własny dojazd</option>
                                <option className="bg-black" value="Carpooling">Szukam miejsca / carpooling</option>
                                <option className="bg-black" value="Carpooling_driver">Oferuję miejsce / kierowca carpooling</option>
                                <option className="bg-black" value="Transfer">Transport organizatora</option>
                                <option className="bg-black" value="Nie wiem">Jeszcze nie wiem</option>
                              </select>

                              <input
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                                placeholder="Skąd jedzie ta osoba?"
                                value={guest.transport_address}
                                onChange={(e) =>
                                  updateAdditionalGuest(guest.local_id, {
                                    transport_address: e.target.value
                                  })
                                }
                              />
                            </div>

                            <textarea
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-sm"
                              placeholder="Notatki do obsługi"
                              value={guest.notes}
                              onChange={(e) =>
                                updateAdditionalGuest(guest.local_id, { notes: e.target.value })
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KROK 2: Dieta */}
          {activeRSVPStep === 2 && (
            <div className="space-y-6 text-center">
              <h3
                className="text-3xl font-black tracking-tighter"
                style={{ color: headColor }}
              >
                Dieta i alergie
              </h3>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                {['Standard', 'Wege', 'Vegan', 'Keto', 'Bez glutenu', 'Bez laktozy'].map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(logistics.diet, diet, (value) =>
                        setLogistics({ ...logistics, diet: value })
                      )
                    }
                    className={`p-4 rounded-xl border transition-all ${
                      logistics.diet.includes(diet)
                        ? 'text-black font-black'
                        : 'bg-white/5 border-white/10 opacity-40'
                    }`}
                    style={{
                      backgroundColor: logistics.diet.includes(diet) ? primColor : 'transparent',
                      borderColor: logistics.diet.includes(diet) ? primColor : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {diet}
                  </button>
                ))}
              </div>

              <div className="text-left">
                <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">
                  Alergie / nietolerancje
                </label>

                <textarea
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-sm"
                  placeholder="np. orzechy, seler, skorupiaki"
                  value={logistics.allergies.join(', ')}
                  onChange={(e) =>
                    setLogistics({
                      ...logistics,
                      allergies: e.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* KROK 3: Menu */}
          {activeRSVPStep === 3 && (
            <div className="space-y-6">
              <h3
                className="text-3xl font-black tracking-tighter"
                style={{ color: headColor }}
              >
                Menu
              </h3>

              <div className="space-y-3">
                {meals.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm opacity-60">
                    Organizator nie udostępnił jeszcze dań do wyboru. Możesz przejść dalej.
                  </div>
                ) : (
                  meals.map((meal: any) => {
                    const selected = logistics.selectedMeals.some((item) => item.mealId === meal.id)

                    return (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => {
                          const selectedMeals = logistics.selectedMeals

                          setLogistics({
                            ...logistics,
                            selectedMeals: selected
                              ? selectedMeals.filter((item) => item.mealId !== meal.id)
                              : [
                                  ...selectedMeals,
                                  {
                                    mealId: meal.id,
                                    portionSize: 'standard',
                                    willAttend: true
                                  }
                                ]
                          })
                        }}
                        className="w-full p-4 glass-card rounded-2xl flex items-center gap-4 text-left border transition-all"
                        style={{
                          borderColor: selected ? primColor : 'rgba(255,255,255,0.1)',
                          backgroundColor: selected ? `${primColor}18` : 'rgba(255,255,255,0.03)'
                        }}
                      >
                        {meal.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10">
                            <img
                              src={meal.image_url}
                              className="w-full h-full object-cover"
                              alt={meal.name || 'Danie'}
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-bold">
                            {meal.name}
                          </p>

                          <p className="text-[10px] opacity-40 uppercase">
                            {[meal.meal_type, meal.dietary_category].filter(Boolean).join(' • ') || 'Menu'}
                          </p>
                        </div>

                        <span
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black"
                          style={{
                            borderColor: selected ? primColor : 'rgba(255,255,255,0.2)',
                            backgroundColor: selected ? primColor : 'transparent',
                            color: selected ? '#000' : 'rgba(255,255,255,0.5)'
                          }}
                        >
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* KROK 4: Warsztaty */}
          {activeRSVPStep === 4 && (
            <div className="space-y-6">
              <h3
                className="text-3xl font-black tracking-tighter"
                style={{ color: headColor }}
              >
                Warsztaty
              </h3>

              <p className="text-xs opacity-40">
                Wybierz sesje, w których chcesz uczestniczyć.
              </p>

              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm opacity-40">
                    Organizator nie udostępnił jeszcze warsztatów. Możesz przejść dalej.
                  </p>
                ) : (
                  sessions
                    .filter((session: any) =>
                      !session.session_type ||
                      ['workshop', 'activity', 'training', 'warsztat'].includes(String(session.session_type).toLowerCase()) ||
                      sessions.length <= 3
                    )
                    .map((session: any) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() =>
                          setSelectedSessions((prev) =>
                            prev.includes(session.id)
                              ? prev.filter((id) => id !== session.id)
                              : [...prev, session.id]
                          )
                        }
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedSessions.includes(session.id)
                            ? 'text-black font-black'
                            : 'bg-white/5 border-white/10'
                        }`}
                        style={{
                          backgroundColor: selectedSessions.includes(session.id) ? primColor : 'transparent',
                          borderColor: selectedSessions.includes(session.id) ? primColor : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <p className="text-sm">
                          {session.title}
                        </p>

                        {(session.location || session.session_type) && (
                          <p className="text-[10px] opacity-50 mt-1">
                            {session.location || session.session_type}
                          </p>
                        )}
                      </button>
                    ))
                )}
              </div>
            </div>
          )}

          {/* KROK 5: Gadżety */}
          {activeRSVPStep === 5 && (
            <div
              className="space-y-8 text-center rounded-[32px] p-4 md:p-6"
              style={{
                backgroundColor: event?.gadgets_section_bg_color || event?.gadget_section_bg_color || 'transparent',
                color: event?.gadget_section_text_color || 'inherit'
              }}
            >
              {(sectionImage('gadgets') || event?.gadget_section_image_url) && (
                <div className="h-40 rounded-3xl overflow-hidden bg-white/5">
                  <img
                    src={sectionImage('gadgets') || event.gadget_section_image_url}
                    alt="Gadżety"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3
                  className="text-3xl font-black tracking-tighter"
                  style={{ color: event?.gadget_section_heading_color || headColor }}
                >
                  {sectionTitle('gadgets', event?.gadget_section_title || 'Wybierz swój gadżet')}
                </h3>

                <p className="text-xs opacity-60 mt-2 max-w-xl mx-auto">
                  {sectionDescription(
                    'gadgets',
                    event?.gadget_section_desc ||
                      'Wybierz tylko te gadżety, które realnie chcesz odebrać. Pomagasz nam nie produkować nadwyżek.'
                  )}
                </p>

                <p className="text-[10px] font-black uppercase opacity-50 mt-3">
                  Możesz wybrać maksymalnie {Math.max(Number(event?.gadget_limit_per_person || 1), 1)} gadżet/gadżety.
                </p>
              </div>

              {canDeclineGadget && (
                <button
                  type="button"
                  onClick={declineGadgetChoice}
                  className={`w-full p-4 rounded-3xl border text-left transition-all ${
                    declinedGadget ? 'text-black font-black' : 'bg-white/5 border-white/10 opacity-80'
                  }`}
                  style={{
                    backgroundColor: declinedGadget
                      ? event?.gadget_section_accent_color || primColor
                      : 'rgba(255,255,255,0.03)',
                    borderColor: declinedGadget
                      ? event?.gadget_section_accent_color || primColor
                      : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <p className="text-xs font-black uppercase">
                    Nie chcę gadżetu
                  </p>

                  <p className="text-[10px] opacity-60 mt-1">
                    Pomijam wybór i przechodzę dalej bez zapisu pustego gadżetu.
                  </p>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gadgets.length === 0 ? (
                  <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm opacity-60">
                    Brak aktywnych gadżetów. Możesz przejść dalej.
                  </div>
                ) : (
                  gadgets.map((gadget: any) => {
                    const isSelected = selectedGadgets.some((choice) => choice.gadget_id === gadget.id)
                    const available = getGadgetAvailableQuantity(gadget)
                    const stockStatus = getGadgetStockStatus(gadget)
                    const isSoldOut = stockStatus === 'sold_out'

                    const stockLabel =
                      stockStatus === 'unlimited'
                        ? 'Bez limitu'
                        : stockStatus === 'sold_out'
                          ? 'Niedostępny'
                          : stockStatus === 'low_stock'
                            ? `Ostatnie sztuki: ${available}`
                            : `Dostępne: ${available} szt.`

                    const stockBadgeClass =
                      stockStatus === 'unlimited'
                        ? 'bg-blue-100 text-blue-900'
                        : stockStatus === 'sold_out'
                          ? 'bg-red-100 text-red-900'
                          : stockStatus === 'low_stock'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'

                    return (
                      <div
                        key={gadget.id}
                        onClick={() => !isSoldOut && toggleSelectedGadget(gadget.id)}
                        className={`p-4 rounded-3xl border transition-all ${
                          isSoldOut ? 'cursor-not-allowed opacity-45 grayscale' : 'cursor-pointer'
                        }`}
                        style={{
                          borderColor: isSelected
                            ? event?.gadget_section_accent_color || primColor
                            : 'rgba(255,255,255,0.05)',
                          backgroundColor: isSelected
                            ? `${event?.gadget_section_accent_color || primColor}20`
                            : event?.gadget_section_card_color || 'transparent'
                        }}
                      >
                        <div className="h-20 w-full mb-3 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                          {gadget.image_url ? (
                            <img
                              src={gadget.image_url}
                              className="w-full h-full object-cover"
                              alt={gadget.public_label || gadget.name || 'Gadżet'}
                            />
                          ) : (
                            <Gift size={20} />
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <p className="text-[10px] font-black uppercase">
                            {gadget.public_label || gadget.name}
                          </p>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              gadget.size_required === true
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {gadget.size_required === true ? 'Wymaga rozmiaru' : 'Bez rozmiaru'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${stockBadgeClass}`}>
                            {stockLabel}
                          </span>
                        </div>

                        {gadget.description && (
                          <p className="text-[10px] opacity-50 mt-1 leading-relaxed">
                            {gadget.description}
                          </p>
                        )}

                        {isSelected && gadget.size_required === true && (
                          <select
                            className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black outline-none"
                            value={selectedGadgets.find((choice) => choice.gadget_id === gadget.id)?.selected_size || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSelectedGadgetSize(gadget.id, e.target.value)}
                          >
                            <option value="">Wybierz rozmiar</option>
                            {getGadgetSizeOptions(gadget).map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mt-12 pt-6 border-t border-white/5">
            {submitError && (
              <div className="flex-1 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-left text-xs font-bold text-red-100">
                {submitError}
              </div>
            )}

            {activeRSVPStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveRSVPStep(activeRSVPStep - 1)}
                className="flex-1 py-4 font-black uppercase text-xs opacity-50 hover:opacity-100 transition-opacity"
              >
                Wstecz
              </button>
            )}

            <button
              type="submit"
              className="flex-[2] py-4 text-black font-black uppercase text-xs rounded-full shadow-lg"
              style={{ backgroundColor: primColor }}
            >
              {activeRSVPStep === 5 ? 'Zatwierdź wszystko' : 'Dalej'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  )
}
