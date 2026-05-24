'use client'

/* ==========================================================================
   1. IMPORTY I KONFIGURACJE
   ========================================================================== */

import React, { useState, useEffect, use, useCallback, useMemo } from 'react'
import { createClient } from '../../../../lib/supabase'
import { GOOGLE_FONT_OPTIONS, buildGoogleFontStack, getFontFamilyName } from '../../../../lib/googleFonts'
import {
  Users, User, CheckCircle2, XCircle, Leaf, ArrowLeft,
  Settings, Save, RefreshCw, Trash2, AlertTriangle,
  Plus, Edit3, Eye, EyeOff, X, Search, Filter, MoreHorizontal,
  ClipboardList, MapPin, Globe, BarChart3, LayoutGrid, Layers, ListChecks,
  Clock, Calendar, CalendarPlus, Wallet, FileText, FileSignature, Download, Printer,
  Truck, Car, Bus, Smartphone, Share2, TrendingDown, TrendingUp, Phone,
  UtensilsCrossed, Wine, Coffee, Shirt, Award,
  Send, MessageSquare, Mail, Video, Mic,
  Music4, Image as ImageIcon, Type, Palette,
  Zap, Activity, Bed, File as FileIcon, Users2, Stethoscope,
  Recycle, Ticket, Briefcase, Train,
  UserRoundPlus, Route, Calculator, Fuel,
  Euro, UsersRound, Percent, BadgeDollarSign, Receipt, CreditCard, ArrowRightLeft,
  ChevronDown, PanelLeftClose, PanelLeftOpen,
  QrCode, ScanLine, BadgeCheck, Copy, ShieldCheck, ExternalLink, Moon, Sun, HelpCircle, BookOpen, Sparkles, Link
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

// ==========================================================================
// 2. TYPY I INTERFEJSY
// ==========================================================================

type TabModule =
  | 'rekrutacja' | 'logistyka' | 'edycja'
  | 'harmonogram' | 'eko'
  | 'komunikacja' | 'checklista' | 'finanse'
  | 'dostawcy' | 'minutowka'
  | 'bilety' | 'prelegenci' | 'materialy'
  | 'eventpass' | 'strona_uczestnika';

interface Guest {
  id: string
  first_name: string
  last_name: string
  company_name: string
  position: string
  status: string
  rsvp_status: string
  diet: string
  allergies: string
  extra_notes: string
  companion: string
  kids: string
  transport: string
  accommodation: string
  transport_address: string
  email: string
  phone: string
  table_number?: number
  seat_number?: number
  alcohol_preference?: string
  sweets_preference?: string
  payment_reference?: string
  payment_status?: string
  ticket_expected_amount?: number | string
  meal_check_in?: boolean
}

interface MenuItem {
  id: string
  name: string
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'vegan' | 'vegetarian'
  ingredients: string[]
  allergens: string[]
  co2_footprint: number
  waste_potential: number
  portions_planned: number
  portions_actual: number
}

interface TransportRoute {
  id: string
  name: string
  vehicle_type: 'bus' | 'van' | 'car' | 'train' | 'eco'
  capacity: number
  occupied: number
  co2_per_person: number
  route: string[]
}

interface OrganizerTask {
  id: string
  title: string
  deadline: string
  status: 'pending' | 'done' | 'delayed'
  category: 'venue' | 'guests' | 'marketing' | 'legal'
  assignedTo: string
  ecoImpact: number
}

type FleetForm = {
  type: string
  name: string
  capacity: number
  occupied: number
  fuelConsumption: number
  co2PerKm: number
  baseCost: number
  route: string
}

const defaultFleetForm: FleetForm = {
  type: 'bus',
  name: '',
  capacity: 50,
  occupied: 0,
  fuelConsumption: 25,
  co2PerKm: 0.8,
  baseCost: 1500,
  route: ''
}

// ==========================================================================
// 3. DANE MOCKOWE I POMOCNICZE (POZA GŁÓWNYM KOMPONENTEM)
// ==========================================================================

const generateMockMenu = (): MenuItem[] => {
  return [
    { id: '1', name: 'Sałatka z lokalnych warzyw', category: 'starter', ingredients: ['sałata', 'pomidory', 'ogórek'], allergens: [], co2_footprint: 0.2, waste_potential: 5, portions_planned: 50, portions_actual: 45 },
    { id: '2', name: 'Polędwica z jelenia', category: 'main', ingredients: ['polędwica', 'ziemniaki', 'szparagi'], allergens: ['seler'], co2_footprint: 2.1, waste_potential: 15, portions_planned: 50, portions_actual: 38 },
    { id: '3', name: 'Risotto z grzybami', category: 'vegetarian', ingredients: ['ryż', 'grzyby', 'parmezan'], allergens: ['laktoza'], co2_footprint: 0.8, waste_potential: 10, portions_planned: 30, portions_actual: 28 },
    { id: '4', name: 'Tarta owocowa', category: 'dessert', ingredients: ['jabłka', 'mąka', 'masło'], allergens: ['gluten', 'laktoza'], co2_footprint: 0.4, waste_potential: 8, portions_planned: 60, portions_actual: 52 },
  ]
}
// Funkcja licząca ślad węglowy i koszty


const generateMockRoutes = (apps: Guest[]): TransportRoute[] => {
  return [
    { id: '1', name: 'Centrum -> Hotel', vehicle_type: 'bus', capacity: 50, occupied: 35, co2_per_person: 2.1, route: ['Dworzec Główny', 'Hotel Conference', 'Centrum'] },
    { id: '2', name: 'Lotnisko -> Miejsce', vehicle_type: 'van', capacity: 15, occupied: 12, co2_per_person: 3.5, route: ['Lotnisko', 'Hotel'] },
  ]
}

const getPreviewUrl = (file: File | null, currentUrl: string | null) => {
  if (file) return URL.createObjectURL(file);
  return currentUrl || null;
};

const isPreparationPartner = (partner: any) => {
  const type = String(partner?.type || '').toLowerCase()
  if (type === 'preparation' || type === 'sponsor') return true
  if (type === 'speaker' || type === 'doctor') return false
  return Boolean(partner?.sponsor_name || partner?.sponsor_category || partner?.logo_url) && !partner?.first_name && !partner?.last_name
}

const isDoctorPartner = (partner: any) => {
  const type = String(partner?.type || '').toLowerCase()
  if (type === 'speaker' || type === 'doctor') return true
  if (type === 'preparation' || type === 'sponsor') return false
  return Boolean(partner?.first_name || partner?.last_name || partner?.title) && !isPreparationPartner(partner)
}


const SortablePartnerItem = ({
  item,
  onEdit,
  onDelete,
  isDarkMode
}: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  isDarkMode?: boolean;
}) => {
  const doctorName = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.sponsor_name || 'Lekarz bez nazwy';
  const specialization = item.title || item.specialization || item.sponsor_category || 'Specjalizacja nieuzupełniona';

  return (
    <div className={`p-5 transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          {item.photo_url
            ? <img src={item.photo_url} className={`w-16 h-16 rounded-2xl object-cover border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} alt={doctorName} />
            : <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'}`}><Stethoscope size={24} /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${
              isDarkMode ? 'bg-cyan-900/30 text-cyan-300 border-cyan-800/50' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
            }`}>
              Lekarz
            </span>
            {!item.is_visible && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                Ukryty
              </span>
            )}
          </div>
          <h5 className={`font-black text-base mt-1.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {doctorName}
          </h5>
          <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{specialization}</p>
          <p className={`mt-1 text-[10px] font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>ID lekarza: {item.id}</p>
        </div>
        <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(item)
            }}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            title="Edytuj lekarza"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(item.id)
            }}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
            title="Usuń lekarza"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PreparationItem = ({
  item,
  onEdit,
  onDelete,
  isDarkMode
}: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  isDarkMode?: boolean;
}) => {
  const preparationName = item.sponsor_name || item.name || 'Preparat bez nazwy';
  const category = item.sponsor_category || item.category || 'Kategoria nieuzupełniona';
  const imageUrl = item.logo_url || item.photo_url;

  return (
    <div className={`p-5 transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          {imageUrl
            ? <img src={imageUrl} className={`w-16 h-16 rounded-2xl object-cover border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} alt={preparationName} />
            : <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'}`}><ImageIcon size={24} /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${
            isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Preparat
          </span>
          <h5 className={`font-black text-base mt-1.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {preparationName}
          </h5>
          <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{category}</p>
          <p className={`mt-1 text-[10px] font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>ID preparatu: {item.id}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(item) }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} title="Edytuj preparat">
            <Edit3 size={14} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(item.id) }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`} title="Usuń preparat">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================================================
// 4. GŁÓWNY KOMPONENT B2BEventDetail
// ==========================================================================

export default function B2BEventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  // ----- 4.1. STANY GŁÓWNE -----
  const [event, setEvent] = useState<any>(null)
  const [applications, setApplications] = useState<Guest[]>([])
  const [patientPortalRequests, setPatientPortalRequests] = useState<any[]>([])
  const [patientPortalMessages, setPatientPortalMessages] = useState<any[]>([])
  const [patientReplyDrafts, setPatientReplyDrafts] = useState<Record<string, string>>({})
  const [aiReplyLoadingId, setAiReplyLoadingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabModule>('rekrutacja')
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [openNavGroup, setOpenNavGroup] = useState('Pierwszy kontakt')

  const [editForm, setEditForm] = useState<any>(null)



  // ----- newFiles -----
  // ----- newFiles -----
  // ----- newFiles -----
const [newFiles, setNewFiles] = useState<{
  cover: File | null;
  logo: File | null;
  img1: File | null;
  img2: File | null;
  img3: File | null;
  pageBg: File | null;
  rsvpImg: File | null;
  sessionImg: File | null;
  mealImg: File | null;
  transportImg: File | null;
  partnerPhoto: File | null;
  contractorInvoice: File | null;
  menuSectionImg: File | null;
  transportSectionImg: File | null;
  workshopsSectionImg: File | null;
  liveSectionImg: File | null;
  themeMain: File | null;
  themeImg1: File | null;
  themeImg2: File | null;
  themeImg3: File | null;
  themeImg4: File | null;
}>({
  cover: null,
  logo: null,
  img1: null,
  img2: null,
  img3: null,
  pageBg: null,
  rsvpImg: null,
  sessionImg: null,
  mealImg: null,
  transportImg: null,
  partnerPhoto: null,
  contractorInvoice: null,
  menuSectionImg: null,
  transportSectionImg: null,
  workshopsSectionImg: null,
  liveSectionImg: null,
  themeMain: null,
  themeImg1: null,
  themeImg2: null,
  themeImg3: null,
  themeImg4: null,
})
  // ----- newFiles -----
  // ----- newFiles -----
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionForm, setSessionForm] = useState<any>({})
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [meals, setMeals] = useState<any[]>([])
  const [mealForm, setMealForm] = useState<any>({})
  const [isEditingMeal, setIsEditingMeal] = useState(false)
  const [cateringOffers, setCateringOffers] = useState<any[]>([])
  const [cateringOfferForm, setCateringOfferForm] = useState<any>({})
  const [isCateringOfferModalOpen, setIsCateringOfferModalOpen] = useState(false)
  const [isEditingCateringOffer, setIsEditingCateringOffer] = useState(false)
  const [manualCateringPeople, setManualCateringPeople] = useState<number | null>(null)

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)

  const [unitCosts, setUnitCosts] = useState({
    meal: 150,
    accommodation: 350,
    transport: 80
  })

  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [budgetCategories, setBudgetCategories] = useState<any[]>([])
  const [budgetTransfers, setBudgetTransfers] = useState<any[]>([])
  const [budgetPayments, setBudgetPayments] = useState<any[]>([])
  const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false)
  const [isEditingBudgetItem, setIsEditingBudgetItem] = useState(false)
  const [budgetItemForm, setBudgetItemForm] = useState<any>({})
  const [isBudgetCategoryModalOpen, setIsBudgetCategoryModalOpen] = useState(false)
  const [isEditingBudgetCategory, setIsEditingBudgetCategory] = useState(false)
  const [budgetCategoryForm, setBudgetCategoryForm] = useState<any>({})
  const [isBudgetTransferModalOpen, setIsBudgetTransferModalOpen] = useState(false)
  const [budgetTransferForm, setBudgetTransferForm] = useState<any>({})
  const [isBudgetPaymentModalOpen, setIsBudgetPaymentModalOpen] = useState(false)
  const [budgetPaymentForm, setBudgetPaymentForm] = useState<any>({})
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<any>(null)
  const [budgetSearch, setBudgetSearch] = useState('')
  const [budgetFilterCategory, setBudgetFilterCategory] = useState('all')
  const [budgetFilterType, setBudgetFilterType] = useState('all')
  const [budgetFilterPaymentStatus, setBudgetFilterPaymentStatus] = useState('all')
  const [budgetFilterSource, setBudgetFilterSource] = useState('all')

  const [vendors, setVendors] = useState([
    { id: '1', category: 'Obiekt/Hotel', name: 'Hotel Conference Center', contactPerson: 'Anna Kowalska', email: 'anna@hotel.pl', phone: '+48 500 600 700', status: 'Umowa podpisana' },
    { id: '2', category: 'Catering', name: 'EkoFood Solutions', contactPerson: 'Marek Nowak', email: 'kontakt@ekofood.pl', phone: '+48 600 700 800', status: 'Wycena' },
    { id: '3', category: 'Transport', name: 'Bus-Trans sp. z o.o.', contactPerson: 'Piotr Wiśniewski', email: 'biuro@bustrans.pl', phone: '+48 700 800 900', status: 'Brak kontaktu' }
  ])

  const [runOfShow, setRunOfShow] = useState<any[]>([
    { id: '1', time: '06:00', task: 'Wjazd ekipy technicznej (Scena i AV)', assignee: 'Firma AV', location: 'Sala Główna', status: 'done', isCritical: true },
    { id: '2', time: '08:00', task: 'Rozstawienie cateringu - przerwa kawowa', assignee: 'Catering', location: 'Foyer', status: 'pending', isCritical: false },
    { id: '3', time: '08:30', task: 'Odprawa recepcji, odpalenie skanerów', assignee: 'Koordynator', location: 'Recepcja', status: 'pending', isCritical: true },
    { id: '4', time: '09:45', task: 'Gotowość prowadzącego, włączenie muzyki', assignee: 'Reżyser', location: 'Backstage', status: 'pending', isCritical: true },
  ])
  const [newRosTask, setNewRosTask] = useState<any>({
  date: '',
  time: '',
  task: '',
  assignee: '',
  location: '',
  note: '',
  isCritical: false
})

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([])
  const [ecoMetrics, setEcoMetrics] = useState({
    totalCO2Saved: 0,
    foodWastePrevented: 0,
    transportOptimized: 0,
    localSuppliers: 0
  })

  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

  const [tiers, setTiers] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [isTicketTierModalOpen, setIsTicketTierModalOpen] = useState(false)
  const [isEditingTicketTier, setIsEditingTicketTier] = useState(false)
  const [ticketTierForm, setTicketTierForm] = useState<any>({})
  const [isTicketApplicationModalOpen, setIsTicketApplicationModalOpen] = useState(false)
  const [ticketApplicationForm, setTicketApplicationForm] = useState<any>({})
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketPaymentFilter, setTicketPaymentFilter] = useState('all')
  const [ticketAccessFilter, setTicketAccessFilter] = useState('all')
  const [ticketTierFilter, setTicketTierFilter] = useState('all')

  const [eventVideos, setEventVideos] = useState<any[]>([])
  const [videoForm, setVideoForm] = useState<any>({})
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isEditingVideo, setIsEditingVideo] = useState(false)
const [checklistGroups, setChecklistGroups] = useState<any[]>([])
const [checklistItems, setChecklistItems] = useState<any[]>([])
const [isChecklistGroupModalOpen, setIsChecklistGroupModalOpen] = useState(false)
const [isChecklistItemModalOpen, setIsChecklistItemModalOpen] = useState(false)
const [isEditingChecklistGroup, setIsEditingChecklistGroup] = useState(false)
const [isEditingChecklistItem, setIsEditingChecklistItem] = useState(false)
const [checklistGroupForm, setChecklistGroupForm] = useState<any>({})
const [checklistItemForm, setChecklistItemForm] = useState<any>({})
const [activeChecklistGroupId, setActiveChecklistGroupId] = useState<string | null>(null)

  const [contractors, setContractors] = useState<any[]>([])
const [isContractorModalOpen, setIsContractorModalOpen] = useState(false)
const [isEditingContractor, setIsEditingContractor] = useState(false)
const [contractorForm, setContractorForm] = useState<any>({})
const [filterTag, setFilterTag] = useState<string | null>(null)
const [searchContractor, setSearchContractor] = useState('')

const [expandedContractorId, setExpandedContractorId] = useState<string | null>(null);
// ==========================================
  // STANY DOTYCZĄCE TRANSPORTU
  // ==========================================
  const [fleet, setFleet] = useState<any[]>([])
  const [carpoolingAds, setCarpoolingAds] = useState<any[]>([])
  const [transportStats, setTransportStats] = useState({
    totalCost: 0,
    totalCO2: 0,
    savings: 0,
    efficiency: 0,
    co2ReductionPercent: 0
  })
  useEffect(() => {
  const fleetCost = fleet.reduce((acc, v) => acc + (v.baseCost || 0), 0);
  const fleetCO2 = fleet.reduce((acc, v) => acc + ((v.fuelConsumption || 0) * 2.68 * 0.5), 0);
  const savings = carpoolingAds.reduce((acc, c) => acc + (Number(c.seats_avail || c.seats_available || 0) * 80), 0);
  const totalOccupancy = fleet.reduce((acc, v) => acc + (v.occupied || 0), 0);
  const totalCapacity = fleet.reduce((acc, v) => acc + Number(v.capacity || 0), 0) + carpoolingAds.reduce((acc, c) => acc + Number(c.seats_avail || c.seats_available || 0), 0);
  setTransportStats({
    totalCost: fleetCost,
    totalCO2: parseFloat(fleetCO2.toFixed(1)),
    savings,
    efficiency: totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0,
    co2ReductionPercent: 0
  });
}, [fleet, carpoolingAds]);
// --- STANY DLA ZAKŁADKI DOKUMENTACJI ---
  const [templateSearch, setTemplateSearch] = useState('')
  const [isEditingConsentTemplate, setIsEditingConsentTemplate] = useState(false)

// ==========================================
  // STANY prelegenci
  // ==========================================
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false)
  const [editingFleetItem, setEditingFleetItem] = useState<any>(null)
  const [fleetForm, setFleetForm] = useState<FleetForm>(defaultFleetForm)
  const [transportFilterCity, setTransportFilterCity] = useState('all')
  const [organizedRoutes, setOrganizedRoutes] = useState<any[]>([])
  const [transportStops, setTransportStops] = useState<any[]>([])
  const [isOrganizedRouteModalOpen, setIsOrganizedRouteModalOpen] = useState(false)
  const [isEditingOrganizedRoute, setIsEditingOrganizedRoute] = useState(false)
  const [organizedRouteForm, setOrganizedRouteForm] = useState<any>({})
  const [isTransportStopModalOpen, setIsTransportStopModalOpen] = useState(false)
  const [isEditingTransportStop, setIsEditingTransportStop] = useState(false)
  const [transportStopForm, setTransportStopForm] = useState<any>({})
const [partners, setPartners] = useState<any[]>([])
const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false)
const [isEditingPartner, setIsEditingPartner] = useState(false)
const [partnerForm, setPartnerForm] = useState<any>({})
const [isPreparationModalOpen, setIsPreparationModalOpen] = useState(false)
const [isEditingPreparation, setIsEditingPreparation] = useState(false)
const [preparationForm, setPreparationForm] = useState<any>({})

const [attendeeUnits, setAttendeeUnits] = useState<any[]>([])
const [eventPassScans, setEventPassScans] = useState<any[]>([])
const [mealRedemptions, setMealRedemptions] = useState<any[]>([])
const [gadgetRedemptions, setGadgetRedemptions] = useState<any[]>([])
const [transportCheckins, setTransportCheckins] = useState<any[]>([])
const [staffAccessList, setStaffAccessList] = useState<any[]>([])
const [attendeeMealChoices, setAttendeeMealChoices] = useState<any[]>([])
const [attendeeGadgetChoices, setAttendeeGadgetChoices] = useState<any[]>([])
const [attendeeSessionSignups, setAttendeeSessionSignups] = useState<any[]>([])
const [attendeeTransportChoices, setAttendeeTransportChoices] = useState<any[]>([])
const [guestSelections, setGuestSelections] = useState<any[]>([])

const [eventPassSearch, setEventPassSearch] = useState('')
const [eventPassFilterStatus, setEventPassFilterStatus] = useState('all')
const [selectedApplicationForPass, setSelectedApplicationForPass] = useState<any>(null)
const [selectedAttendeeUnit, setSelectedAttendeeUnit] = useState<any>(null)
const [expandedApplicationIds, setExpandedApplicationIds] = useState<Record<string, boolean>>({})
const [helpDocuments, setHelpDocuments] = useState<any[]>([])
const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false)
const [ecoAiReport, setEcoAiReport] = useState<any>(null)
const [ecoAiLoading, setEcoAiLoading] = useState(false)
const [aiTextAssistConfig, setAiTextAssistConfig] = useState<any>(null)
const [aiTextTone, setAiTextTone] = useState('premium')
const [aiTextLength, setAiTextLength] = useState('średnia')
const [aiTextDocumentType, setAiTextDocumentType] = useState('consent')
const [aiTextInstruction, setAiTextInstruction] = useState('')
const [aiTextSuggestion, setAiTextSuggestion] = useState('')
const [aiTextReason, setAiTextReason] = useState('')
const [aiTextMissingContext, setAiTextMissingContext] = useState<string[]>([])
const [aiTextLoading, setAiTextLoading] = useState(false)
const [organizerCurrentMonth, setOrganizerCurrentMonth] = useState(() => new Date().getMonth())
const [organizerCurrentYear, setOrganizerCurrentYear] = useState(() => new Date().getFullYear())
const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(() => new Date().toISOString().slice(0, 10))

const [isStaffAccessModalOpen, setIsStaffAccessModalOpen] = useState(false)
const [staffAccessForm, setStaffAccessForm] = useState<any>({})
const [patients, setPatients] = useState<any[]>([])
const [patientConsents, setPatientConsents] = useState<any[]>([])
const [patientSearch, setPatientSearch] = useState('')
const [patientQrFilter, setPatientQrFilter] = useState('all')
const [expandedPatientIds, setExpandedPatientIds] = useState<Record<string, boolean>>({})
const [selectedPatientForPass, setSelectedPatientForPass] = useState<any>(null)

// --- STANY DLA ZGÓD I DOKUMENTACJI MEDYCZNEJ ---
  const [consentTemplates, setConsentTemplates] = useState<any[]>([])
  const [isConsentTemplateModalOpen, setIsConsentTemplateModalOpen] = useState(false)
  const [consentTemplateForm, setConsentTemplateForm] = useState<any>({})

  const [isScanUploadModalOpen, setIsScanUploadModalOpen] = useState(false)
  const [scanUploadForm, setScanUploadForm] = useState<any>({ patient_id: '', template_id: '', file: null, preview: null })

// --- STANY DLA BAZY PACJENTÓW I WYWIADÓW ---
  const [todayPatientSearch, setTodayPatientSearch] = useState('')
  const [allPatientSearch, setAllPatientSearch] = useState('')
  const [expandedPatientDocs, setExpandedPatientDocs] = useState<string | null>(null)
  const [expandedPatientSendId, setExpandedPatientSendId] = useState<string | null>(null)
  const [selectedTemplatesForPatientSend, setSelectedTemplatesForPatientSend] = useState<string[]>([])


  // --- STANY DLA NOWEJ REJESTRACJI PACJENTÓW ---
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [patientForm, setPatientForm] = useState<any>({})
  const [registrySearch, setRegistrySearch] = useState('')
// --- STANY DLA NOWEGO MODUŁU WIZYT I ZABIEGÓW ---
  const [treatments, setTreatments] = useState<any[]>([])
  const [treatmentMappings, setTreatmentMappings] = useState<any[]>([])
  const [appointmentsList, setAppointmentsList] = useState<any[]>([])
  const [appointmentForm, setAppointmentForm] = useState({ patient_id: '', treatment_id: '', appointment_date: '', price_amount: '', currency: 'PLN' })

  // --- PRAWDZIWE STANY KATALOGU ZABIEGÓW ---
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false)
  const [isEditingTreatment, setIsEditingTreatment] = useState(false)
  const [treatmentForm, setTreatmentForm] = useState<any>({})
  const [selectedTemplatesForTreatment, setSelectedTemplatesForTreatment] = useState<string[]>([])
  const [treatmentSearch, setTreatmentSearch] = useState('')

  // Listy słownikowe pobierane z event_partners
  const [doctorsList, setDoctorsList] = useState<any[]>([])
  const [preparationsList, setPreparationsList] = useState<any[]>([])

  const loadPartnersCatalog = async () => {
    // Pobieramy prawdziwe dane lekarzy i preparatów
    const { data, error } = await supabase.from('event_partners').select('*').eq('event_id', id).order('display_order', { ascending: true });
    if (error) {
      console.warn('event_partners catalog load error:', error.message)
      setDoctorsList([])
      setPreparationsList([])
      return
    }
    if (data) {
      setDoctorsList(data.filter(isDoctorPartner));
      setPreparationsList(data.filter(isPreparationPartner));
    }
  }
  // PAMIĘTAJ: dodaj loadPartnersCatalog() do swojego głównego useEffect() !

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      let currentTreatmentId = treatmentForm.id;
      const treatmentDoctorId = doctorsList.some((doctor: any) => doctor.id === treatmentForm.doctor_id)
        ? treatmentForm.doctor_id
        : null;
      const payload = {
        event_id: id,
        name: treatmentForm.name,
        type: treatmentForm.type || 'single',
        sessions_count: treatmentForm.sessions_count || 1,
        doctor_id: treatmentDoctorId,
        preparation_id: treatmentForm.preparation_id || null,
        price_amount: treatmentForm.price_amount === '' || treatmentForm.price_amount === undefined ? null : Number(treatmentForm.price_amount || 0),
        currency: treatmentForm.currency || 'PLN',
        room: treatmentForm.room || null,
        treatment_category: treatmentForm.treatment_category || 'standard',
        pre_recommendations: treatmentForm.pre_recommendations || null,
        post_recommendations: treatmentForm.post_recommendations || null,
        is_active: treatmentForm.is_active !== false
      };

      if (isEditingTreatment && currentTreatmentId) {
        await supabase.from('treatments').update(payload).eq('id', currentTreatmentId);
      } else {
        const { data } = await supabase.from('treatments').insert([payload]).select().single();
        currentTreatmentId = data?.id;
      }

      if (currentTreatmentId) {
        await supabase.from('treatment_consent_templates').delete().eq('treatment_id', currentTreatmentId);
        if (selectedTemplatesForTreatment.length > 0) {
          const mappings = selectedTemplatesForTreatment.map(tId => ({ treatment_id: currentTreatmentId, template_id: tId }));
          await supabase.from('treatment_consent_templates').insert(mappings);
        }
      }

      showNotification('Zabieg zapisany w katalogu', 'success');
      setIsTreatmentModalOpen(false);
      setTreatmentForm({});
      setSelectedTemplatesForTreatment([]);
      await loadTreatmentsCatalog(); 
    } catch (err: any) {
      showNotification('Błąd zapisu: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // POBIERANIE KATALOGU (Dodaj to tam, gdzie masz inne funkcje ładujące np. loadPatients)
  const loadTreatmentsCatalog = async () => {
    const { data: tData } = await supabase.from('treatments').select('*').eq('is_active', true);
    if (tData) setTreatments(tData);

    const { data: mData } = await supabase.from('treatment_consent_templates').select('*');
    if (mData) setTreatmentMappings(mData);
  }

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .order('appointment_date', { ascending: true })

    if (error) {
      console.warn('Appointments table unavailable:', error.message)
      setAppointmentsList([])
      return
    }

    setAppointmentsList(data || [])
  }

  // GŁÓWNA FUNKCJA: TWORZY WIZYTĘ I GENERUJE ZGODY
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.patient_id || !appointmentForm.treatment_id || !appointmentForm.appointment_date) {
      return showNotification('Wypełnij wszystkie pola', 'error');
    }
    
    setUpdating(true);
    try {
      // 1. Znajdź nazwę zabiegu w słowniku
      const selectedTreatment = treatments.find(t => t.id === appointmentForm.treatment_id);
      if (!selectedTreatment) {
        showNotification('Nie znaleziono wybranego zabiegu w katalogu', 'error');
        return;
      }
      const appointmentDoctorId = doctorsList.some((doctor: any) => doctor.id === selectedTreatment?.doctor_id)
        ? selectedTreatment.doctor_id
        : null;

      // 2. Utwórz nową wizytę w bazie
      const { data: newAppointment, error: appError } = await supabase
        .from('appointments')
        .insert([{
          patient_id: appointmentForm.patient_id,
          treatment_id: appointmentForm.treatment_id,
          treatment_name: selectedTreatment?.name || 'Zabieg medyczny',
          doctor_id: appointmentDoctorId,
          price_amount: appointmentForm.price_amount === '' || appointmentForm.price_amount === undefined
            ? (selectedTreatment?.price_amount ?? null)
            : Number(appointmentForm.price_amount || 0),
          currency: appointmentForm.currency || selectedTreatment?.currency || 'PLN',
          paid_amount: 0,
          payment_status: 'unpaid',
          appointment_date: appointmentForm.appointment_date,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (appError) throw appError;

      // 3. Sprawdź, jakich zgód wymaga ten zabieg w tabeli łącznikowej
      const requiredTemplates = treatmentMappings
        .filter(m => m.treatment_id === appointmentForm.treatment_id)
        .map(m => m.template_id);

      // 4. AUTOMATYZACJA: Wygeneruj wymagane zgody i przypnij je do wizyty!
      if (requiredTemplates.length > 0) {
        const consentsToInsert = requiredTemplates.map(templateId => ({
          event_id: id,
          patient_id: appointmentForm.patient_id,
          template_id: templateId,
          appointment_id: newAppointment.id, // Tu dzieje się magia spajająca!
          status: 'pending' // Gotowe dla pacjenta na Portal
        }));

        const { error: consentsError } = await supabase.from('patient_consents').insert(consentsToInsert);
        if (consentsError) throw consentsError;
      }

      showNotification(`Wizyta utworzona! Wygenerowano ${requiredTemplates.length} wymaganych zgód.`, 'success');
      setIsBookingModalOpen(false);
      setAppointmentForm({ patient_id: '', treatment_id: '', appointment_date: '', price_amount: '', currency: 'PLN' });
      await loadAppointments();
      await loadPatientConsents();
      
    } catch (err: any) {
      showNotification('Błąd zapisu: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };
 // --- STANY DLA NOWYCH FORMULARZY PORTALU PACJENTA ---
  const [personalForm, setPersonalForm] = useState<any>({ category: 'zalecenia', font_family: 'Inter, sans-serif', patient_id: '' })
  const [globalForm, setGlobalForm] = useState<any>({ category: 'standard', font_family: 'Inter, sans-serif' })
  const [personalImgFile, setPersonalImgFile] = useState<File | null>(null)
  const [globalImgFile, setGlobalImgFile] = useState<File | null>(null)
  
  const [personalAnnouncements, setPersonalAnnouncements] = useState<any[]>([])
  const [globalAnnouncements, setGlobalAnnouncements] = useState<any[]>([])
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingGlobal, setIsEditingGlobal] = useState(false)

  // POBIERANIE LIST (dodaj `loadAnnouncements()` do swojego `loadEventData`!)
  const loadAnnouncements = useCallback(async () => {
    const { data: pData } = await supabase.from('personal_announcements').select('*, patients(*)').eq('event_id', id).order('created_at', { ascending: false })
    if (pData) setPersonalAnnouncements(pData)

    const { data: gData } = await supabase.from('global_announcements').select('*').eq('event_id', id).order('created_at', { ascending: false })
    if (gData) setGlobalAnnouncements(gData)
  }, [id, supabase])

  // FUNKCJA ZAPISU: KOMUNIKAT PERSONALNY
  const handleSavePersonalAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalForm.patient_id || !personalForm.title) return showNotification('Wybierz pacjenta i podaj tytuł', 'error');
    setUpdating(true);
    try {
      let imageUrl = personalForm.image_url || null;
      if (personalImgFile) imageUrl = await uploadFile(personalImgFile, id, 'personal-ann');

      const payload = {
        event_id: id,
        patient_id: personalForm.patient_id,
        title: personalForm.title,
        description: personalForm.description || '',
        font_family: personalForm.font_family,
        category: personalForm.category,
        image_url: imageUrl
      };

      if (isEditingPersonal && personalForm.id) {
        await supabase.from('personal_announcements').update(payload).eq('id', personalForm.id);
      } else {
        await supabase.from('personal_announcements').insert([payload]);
      }

      showNotification('Zapisano komunikat dla pacjenta!', 'success');
      setPersonalForm({ category: 'zalecenia', font_family: 'Inter, sans-serif', patient_id: '' });
      setPersonalImgFile(null);
      setIsEditingPersonal(false);
      await loadAnnouncements();
    } catch (err: any) { showNotification('Błąd zapisu: ' + err.message, 'error'); } finally { setUpdating(false); }
  };

  // FUNKCJA ZAPISU: KOMUNIKAT GLOBALNY
  const handleSaveGlobalAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalForm.title) return showNotification('Podaj tytuł ogłoszenia', 'error');
    setUpdating(true);
    try {
      let imageUrl = globalForm.image_url || null;
      if (globalImgFile) imageUrl = await uploadFile(globalImgFile, id, 'global-ann');

      const payload = {
        event_id: id,
        title: globalForm.title,
        description: globalForm.description || '',
        font_family: globalForm.font_family,
        category: globalForm.category,
        image_url: imageUrl
      };

      if (isEditingGlobal && globalForm.id) {
        await supabase.from('global_announcements').update(payload).eq('id', globalForm.id);
      } else {
        await supabase.from('global_announcements').insert([payload]);
      }

      showNotification('Zapisano ogłoszenie globalne!', 'success');
      setGlobalForm({ category: 'standard', font_family: 'Inter, sans-serif' });
      setGlobalImgFile(null);
      setIsEditingGlobal(false);
      await loadAnnouncements();
    } catch (err: any) { showNotification('Błąd zapisu: ' + err.message, 'error'); } finally { setUpdating(false); }
  };

  const handleDeletePersonal = async (itemId: string) => {
    if (!confirm('Usunąć ten wpis z konta pacjenta?')) return;
    try { await supabase.from('personal_announcements').delete().eq('id', itemId); await loadAnnouncements(); showNotification('Usunięto', 'success'); } catch(e:any) { showNotification('Błąd', 'error'); }
  }

  const handleDeleteGlobal = async (itemId: string) => {
    if (!confirm('Usunąć to ogłoszenie? Zniknie ono u wszystkich pacjentów.')) return;
    try { await supabase.from('global_announcements').delete().eq('id', itemId); await loadAnnouncements(); showNotification('Usunięto', 'success'); } catch(e:any) { showNotification('Błąd', 'error'); }
  }
// ============================================================================
// ----- 4.2. FUNKCJE POMOCNICZE (wywoływane z wnętrza) -----
// ============================================================================

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const openNewConsentTemplateCreator = () => {
    setConsentTemplateForm({
      document_type: 'consent',
      version: 1,
      is_active: true,
      is_global_required: false,
      content_template: '',
      questions: []
    })
    setIsEditingConsentTemplate(false)
    setIsConsentTemplateModalOpen(true)
  }

  const getConsentTemplateTitle = (consent: any) => {
    const template = consentTemplates.find((item: any) => item.id === consent.template_id)
    return consent.medical_consent_templates?.title
      || template?.title
      || consent.title
      || `Dokument #${String(consent.id || '').slice(0, 5)}`
  }

  const getConsentDateLabel = (consent: any) => {
    const rawDate = consent.signed_at || consent.created_at
    return rawDate ? new Date(rawDate).toLocaleString('pl-PL') : 'brak daty'
  }

  const getConsentTemplate = (consent: any) =>
    consent.medical_consent_templates
    || consentTemplates.find((item: any) => item.id === consent.template_id)
    || null

  const isConsentConfirmed = (consent: any) => consent.status === 'signed'

  const getConsentStatusMeta = (consent: any) => {
    if (isConsentConfirmed(consent)) {
      return {
        label: 'Potwierdzone',
        icon: CheckCircle2,
        badgeClass: isDarkMode
          ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cardClass: isDarkMode
          ? 'bg-slate-950 border-emerald-900/40'
          : 'bg-white border-emerald-200 shadow-sm',
        iconClass: isDarkMode
          ? 'bg-emerald-900/30 text-emerald-400'
          : 'bg-emerald-100 text-emerald-700'
      }
    }

    if (consent.status === 'scanned_document') {
      return {
        label: 'Skan wgrany - do weryfikacji',
        icon: AlertTriangle,
        badgeClass: isDarkMode
          ? 'bg-amber-900/20 text-amber-400 border-amber-800/50'
          : 'bg-amber-50 text-amber-700 border-amber-200',
        cardClass: isDarkMode
          ? 'bg-slate-950 border-amber-900/40'
          : 'bg-white border-amber-200 shadow-sm',
        iconClass: isDarkMode
          ? 'bg-amber-900/30 text-amber-400'
          : 'bg-amber-100 text-amber-700'
      }
    }

    return {
      label: 'Do podpisu',
      icon: XCircle,
      badgeClass: isDarkMode
        ? 'bg-red-900/20 text-red-400 border-red-800/50'
        : 'bg-red-50 text-red-700 border-red-200',
      cardClass: isDarkMode
        ? 'bg-slate-950 border-red-900/40'
        : 'bg-white border-red-200 shadow-sm',
      iconClass: isDarkMode
        ? 'bg-red-900/30 text-red-400'
        : 'bg-red-100 text-red-700'
    }
  }

  const getPatientDocumentSummary = (consents: any[]) => {
    const pendingDocs = consents.filter((consent: any) => !isConsentConfirmed(consent))
    const questionnaires = consents.filter((consent: any) => getConsentTemplate(consent)?.document_type === 'questionnaire')
    const pendingQuestionnaires = questionnaires.filter((consent: any) => !isConsentConfirmed(consent))
    const signedDocs = consents.filter((consent: any) => isConsentConfirmed(consent))

    return {
      pendingDocs,
      questionnaires,
      pendingQuestionnaires,
      signedDocs,
      hasPendingDocs: pendingDocs.length > 0,
      hasMissingQuestionnaire: questionnaires.length === 0,
      hasPendingQuestionnaire: pendingQuestionnaires.length > 0
    }
  }

  const getTemplateTypeLabel = (template: any) => {
    if (template.document_type === 'questionnaire') return 'Wywiad'
    if (template.document_type === 'rodo') return 'RODO'
    if (template.document_type === 'info') return 'Zalecenia / info'
    return 'Zgoda'
  }

  const togglePatientTemplateSelection = (templateId: string) => {
    setSelectedTemplatesForPatientSend(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const openPatientTemplateSender = (patientId: string) => {
    setExpandedPatientSendId(prev => prev === patientId ? null : patientId)
    setSelectedTemplatesForPatientSend([])
  }

  const handleSendSelectedTemplatesToPatient = async (patientId: string) => {
    if (selectedTemplatesForPatientSend.length === 0) {
      return showNotification('Wybierz przynajmniej jeden dokument do wysłania.', 'error')
    }

    setUpdating(true)
    try {
      const rows = selectedTemplatesForPatientSend.map(templateId => ({
        event_id: id,
        patient_id: patientId,
        template_id: templateId,
        status: 'pending'
      }))

      const { error } = await supabase.from('patient_consents').insert(rows)
      if (error) throw error

      showNotification(`Wysłano ${rows.length} dokumentów do Portalu Pacjenta.`, 'success')
      setExpandedPatientSendId(null)
      setSelectedTemplatesForPatientSend([])
      await loadPatientConsents()
    } catch (err: any) {
      showNotification('Błąd wysyłki dokumentów: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkConsentSigned = async (consentId: string) => {
    const { error } = await supabase
      .from('patient_consents')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString()
      })
      .eq('id', consentId)

    if (error) return showNotification('Błąd ręcznego potwierdzenia: ' + error.message, 'error')
    await loadPatientConsents()
    showNotification('Dokument oznaczony jako potwierdzony.', 'success')
  }

  const loadHelpDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('help_documents')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.warn('Help documents load error:', error.message)
      setHelpDocuments([])
      return
    }

    setHelpDocuments(data || [])
  }, [supabase])



 const HelpButton = ({ sectionKey }: { sectionKey: string }) => {
  const doc = helpDocuments.find(
    (item: any) => item.section_key === sectionKey && item.is_active !== false
  )

  // Nowy, wyróżniający się styl (Indygo) z pełnym wsparciem Dark Mode
  const className =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-[10px] font-black uppercase transition-all shadow-sm shrink-0 hover:scale-105'

  if (!doc?.pdf_url) {
    return (
      <button
        type="button"
        onClick={() => showNotification('Instrukcja dla tej sekcji nie została jeszcze dodana.', 'info')}
        className={className}
        title="Pomoc"
      >
        <HelpCircle size={14} />
        Pomoc
      </button>
    )
  }

  return (
    <a
      href={doc.pdf_url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={doc.title || 'Instrukcja pomocy'}
    >
      <HelpCircle size={14} />
      Pomoc
    </a>
  )
}


  const openAiTextAssist = (config: any) => {
    setAiTextAssistConfig(config)
    setAiTextTone('premium')
    setAiTextLength('średnia')
    setAiTextDocumentType(config.documentType === 'info' ? 'aftercare' : (config.documentType || 'consent'))
    setAiTextInstruction('')
    setAiTextSuggestion(config.currentValue || '')
    setAiTextReason('')
    setAiTextMissingContext([])
  }

  const closeAiTextAssist = () => {
    setAiTextAssistConfig(null)
    setAiTextSuggestion('')
    setAiTextReason('')
    setAiTextMissingContext([])
    setAiTextInstruction('')
    setAiTextDocumentType('consent')
  }

  const buildLocalAiTextFallback = (config: any) => {
    const sectionKey = String(config?.sectionKey || '')
    const fieldKey = String(config?.fieldKey || '')
    const currentValue = String(config?.currentValue || '').trim()
    const placeholder = String(config?.placeholder || '').trim()
    const documentType = String(config?.documentType || aiTextDocumentType || 'consent')
    const treatmentName = String(config?.relatedEntityTitle || consentTemplateForm?.required_for_treatment || consentTemplateForm?.title || '').trim()
    const relatedEntityTitle = String(config?.relatedEntityTitle || '').trim()
    const additionalInstruction = String(config?.additionalInstruction || '').trim()
    const eventTitle = event?.title || 'wydarzenie'
    const eventLocation = event?.location ? ` w lokalizacji ${event.location}` : ''
    const short = String(aiTextLength || '').toLowerCase().includes('krót')
    const isMedicalDocument = sectionKey === 'medical_documents' || sectionKey === 'medical_docs' || sectionKey === 'patient_consents'

    if (isMedicalDocument) {
      const procedure = treatmentName || '[NAZWA ZABIEGU]'

      if (documentType === 'questionnaire') {
        return [
          `WYWIAD MEDYCZNY PRZED PROCEDURĄ: ${procedure}`,
          '',
          'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNEJ',
          'Pacjent: [IMIE_PACJENTA] [NAZWISKO_PACJENTA]',
          'Data wypełnienia: [DATA]',
          '',
          '1. Cel wywiadu',
          'Celem wywiadu jest zebranie informacji istotnych dla bezpiecznej kwalifikacji pacjenta do procedury.',
          '',
          '2. Pytania ogólne',
          '- Czy pacjent choruje przewlekle?',
          '- Czy pacjent przyjmuje stale leki?',
          '- Czy występują alergie lub nadwrażliwości?',
          '- Czy w ostatnim czasie wykonano podobne procedury?',
          '',
          '3. Przeciwwskazania i czynniki ryzyka',
          '- Ciąża lub karmienie piersią: [TAK/NIE]',
          '- Aktywne infekcje lub stany zapalne: [TAK/NIE]',
          '- Skłonność do bliznowców lub zaburzeń gojenia: [TAK/NIE]',
          '- Inne istotne informacje: [OPIS]',
          '',
          '4. Oświadczenie pacjenta',
          'Oświadczam, że przekazane informacje są zgodne z moją wiedzą.',
          '',
          'Podpis pacjenta: ____________________    Podpis personelu: ____________________',
          '',
          'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem.'
        ].join('\n')
      }

      if (documentType === 'aftercare' || documentType === 'precare') {
        const phase = documentType === 'precare' ? 'PRZED PROCEDURĄ' : 'PO PROCEDURZE'
        return [
          `ZALECENIA DLA PACJENTA ${phase}: ${procedure}`,
          '',
          'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNEJ',
          '',
          '1. Cel dokumentu',
          'Poniższe zalecenia mają pomóc pacjentowi w bezpiecznym postępowaniu po procedurze.',
          '',
          '2. Zalecenia ogólne',
          '- Stosować się do indywidualnych zaleceń osoby wykonującej procedurę.',
          '- Obserwować miejsce zabiegowe i zgłaszać niepokojące objawy.',
          '- Unikać działań wskazanych jako przeciwwskazane po procedurze.',
          '',
          '3. Kiedy skontaktować się z placówką',
          '- Nasilający się ból, obrzęk lub zaczerwienienie.',
          '- Objawy infekcji lub reakcja alergiczna.',
          '- Każdy objaw budzący niepokój pacjenta.',
          '',
          '4. Kontrola',
          'Termin kontroli / kontaktu follow-up: [TERMIN]',
          '',
          'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem.'
        ].join('\n')
      }

      if (documentType === 'followup') {
        return [
          `FOLLOW-UP DO PACJENTA PO WIZYCIE / PROCEDURZE: ${procedure}`,
          '',
          'Status treści: WERSJA ROBOCZA DO WERYFIKACJI',
          '',
          'Dzień dobry [IMIE_PACJENTA],',
          '',
          'kontaktujemy się po wizycie, aby upewnić się, że wszystko przebiega prawidłowo.',
          '',
          'Prosimy o kontakt z placówką, jeśli pojawiły się niepokojące objawy, nasilony ból, obrzęk, zaczerwienienie, objawy infekcji lub reakcja alergiczna.',
          '',
          'Termin kontroli / kolejnego kontaktu: [TERMIN]',
          '',
          'Pozdrawiamy,',
          '[NAZWA_PLACOWKI]',
          '',
          'Uwaga: treść wymaga zatwierdzenia przez osobę uprawnioną przed wysyłką.'
        ].join('\n')
      }

      if (documentType === 'rodo') {
        return [
          'INFORMACJA O PRZETWARZANIU DANYCH OSOBOWYCH I ZGODY PACJENTA',
          '',
          'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI PRAWNEJ',
          '',
          '1. Administrator danych',
          'Administratorem danych jest: [NAZWA_PLACOWKI], [ADRES], [KONTAKT].',
          '',
          '2. Zakres danych',
          'Dane mogą obejmować dane identyfikacyjne, kontaktowe, informacje o wizytach oraz dokumentację związaną z obsługą pacjenta.',
          '',
          '3. Cele przetwarzania',
          '- obsługa pacjenta i wizyt,',
          '- prowadzenie dokumentacji,',
          '- kontakt organizacyjny,',
          '- działania marketingowe wyłącznie po wyrażeniu odrębnej zgody.',
          '',
          '4. Zgody',
          '[ ] Wyrażam zgodę na kontakt SMS/e-mail w sprawach organizacyjnych.',
          '[ ] Wyrażam zgodę na kontakt marketingowy.',
          '[ ] Wyrażam zgodę na wykorzystanie wizerunku / zdjęć przed i po, jeżeli dotyczy.',
          '',
          'Podpis pacjenta: ____________________    Data: [DATA]',
          '',
          'Uwaga: dokument wymaga weryfikacji prawnej przed użyciem.'
        ].join('\n')
      }

      return [
        `ZGODA PACJENTA NA PROCEDURĘ: ${procedure}`,
        '',
        'Status dokumentu: WERSJA ROBOCZA DO WERYFIKACJI MEDYCZNO-PRAWNEJ',
        'Pacjent: [IMIE_PACJENTA] [NAZWISKO_PACJENTA]',
        'Data: [DATA]',
        'Placówka: [NAZWA_PLACOWKI]',
        '',
        '1. Opis procedury',
        'Pacjent został poinformowany o charakterze, celu i spodziewanym przebiegu procedury.',
        '',
        '2. Możliwe przeciwwskazania',
        '- aktywne infekcje lub stany zapalne,',
        '- ciąża lub karmienie piersią, jeżeli dotyczy procedury,',
        '- alergie lub nadwrażliwości na stosowane preparaty,',
        '- inne przeciwwskazania wskazane przez osobę kwalifikującą.',
        '',
        '3. Możliwe działania niepożądane / powikłania',
        '- ból, obrzęk, zaczerwienienie, siniaki,',
        '- reakcja alergiczna,',
        '- infekcja lub zaburzenia gojenia,',
        '- efekt estetyczny odbiegający od oczekiwań pacjenta.',
        '',
        '4. Alternatywy i możliwość odmowy',
        'Pacjent został poinformowany o możliwości rezygnacji z procedury oraz o dostępnych alternatywach, jeżeli występują.',
        '',
        '5. Oświadczenia pacjenta',
        '[ ] Oświadczam, że miałem/am możliwość zadania pytań.',
        '[ ] Oświadczam, że przekazałem/am prawdziwe informacje o stanie zdrowia.',
        '[ ] Wyrażam świadomą zgodę na wykonanie procedury.',
        '',
        '6. Zalecenia',
        'Pacjent otrzymał zalecenia przed i po procedurze oraz został poinformowany o konieczności kontaktu w razie niepokojących objawów.',
        '',
        'Podpis pacjenta: ____________________    Podpis osoby uprawnionej: ____________________',
        '',
        'Uwaga: dokument wymaga zatwierdzenia przez osobę uprawnioną przed użyciem z pacjentem.'
      ].join('\n')
    }

    if (!currentValue && sectionKey === 'doctors') {
      const doctorName = relatedEntityTitle || '[IMIE I NAZWISKO LEKARZA]'
      return [
        `${doctorName} - profil specjalisty`,
        '',
        additionalInstruction || 'Uzupełnij specjalizację, zakres pracy, doświadczenie i obszary zabiegowe lekarza.',
        '',
        'Opis powinien być krótki, profesjonalny i oparty wyłącznie na potwierdzonych danych. Nie dopisuj tytułów, certyfikatów ani lat doświadczenia, jeśli nie zostały podane.'
      ].join('\n')
    }

    if (!currentValue && sectionKey === 'preparations') {
      const preparationName = relatedEntityTitle || '[NAZWA PREPARATU]'
      return [
        `${preparationName} - opis preparatu`,
        '',
        additionalInstruction || 'Uzupełnij kategorię, zastosowanie i ważne uwagi dla zespołu.',
        '',
        'Opis powinien być neutralny i zgodny z dokumentacją producenta. Nie dopisuj wskazań, certyfikatów, składu ani efektów klinicznych, jeśli nie zostały podane.'
      ].join('\n')
    }

    if (currentValue) return currentValue
    if (placeholder) return placeholder

    if (fieldKey.includes('title')) {
      if (sectionKey === 'menu') return 'Menu wydarzenia'
      if (sectionKey === 'transport') return 'Transport i dojazd'
      if (sectionKey === 'workshops') return 'Warsztaty i aktywności'
      if (sectionKey === 'faq') return 'Najważniejsze informacje'
      return `Sekcja wydarzenia ${eventTitle}`
    }

    if (fieldKey.includes('cta')) {
      if (sectionKey === 'menu') return 'Wybierz menu'
      if (sectionKey === 'transport') return 'Potwierdź transport'
      if (sectionKey === 'workshops') return 'Zapisz się'
      return 'Sprawdź szczegóły'
    }

    if (aiTextTone === 'eco') {
      return short
        ? `Sprawdź aktualne informacje o ${eventTitle}${eventLocation}. Korzystamy z cyfrowej strony, aby ograniczać wydruki.`
        : `Tutaj znajdziesz aktualne informacje o ${eventTitle}${eventLocation}. To cyfrowe centrum uczestnika, które organizator może aktualizować na bieżąco bez dodatkowych wydruków.`
    }

    return short
      ? `Sprawdź aktualne informacje o ${eventTitle}${eventLocation}.`
      : `Tutaj znajdziesz aktualne informacje dotyczące wydarzenia ${eventTitle}${eventLocation}. Organizator może aktualizować tę sekcję na bieżąco, dlatego warto wracać do strony przed wydarzeniem.`
  }

  const generateAiTextSuggestion = async () => {
    if (!aiTextAssistConfig?.eventId) {
      showNotification('Brak wydarzenia dla podpowiedzi AI.', 'error')
      return
    }

    setAiTextLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-text-suggestion', {
        body: {
          eventId: aiTextAssistConfig.eventId,
          sectionKey: aiTextAssistConfig.sectionKey,
          fieldKey: aiTextAssistConfig.fieldKey,
          currentValue: aiTextAssistConfig.currentValue || '',
          relatedEntityId: aiTextAssistConfig.relatedEntityId || null,
          relatedEntityTitle: aiTextAssistConfig.relatedEntityTitle || '',
          additionalInstruction: aiTextAssistConfig.additionalInstruction || '',
          mode: aiTextAssistConfig.mode || (['medical_documents', 'medical_docs', 'patient_consents'].includes(aiTextAssistConfig.sectionKey) ? 'medical_document' : 'general'),
          documentType: aiTextDocumentType,
          tone: aiTextTone,
          length: aiTextLength,
          instruction: aiTextInstruction
        }
      })

      if (error) throw error

      const isMedicalDocumentRequest =
        aiTextAssistConfig?.mode === 'medical_document' ||
        ['medical_documents', 'medical_docs', 'patient_consents'].includes(aiTextAssistConfig?.sectionKey)
      const suggestion = String(data?.suggestion || '')
      const normalizedSuggestion = suggestion.toLowerCase()
      const looksLikeOldEventFallback =
        isMedicalDocumentRequest &&
        (
          normalizedSuggestion.includes('wydarzen') ||
          normalizedSuggestion.includes('organizator') ||
          normalizedSuggestion.includes('regulaminie') ||
          normalizedSuggestion.includes('gości')
        )

      if (looksLikeOldEventFallback || (isMedicalDocumentRequest && !suggestion.trim())) {
        setAiTextSuggestion(buildLocalAiTextFallback(aiTextAssistConfig))
        setAiTextReason('Odrzucono eventową odpowiedź starej funkcji AI i użyto bezpiecznego medycznego szkieletu dokumentu.')
        setAiTextMissingContext(['Wdróż zaktualizowaną Edge Function generate-text-suggestion, aby model generował dokumenty medyczne bez fallbacku.'])
      } else {
        setAiTextSuggestion(suggestion)
        setAiTextReason(data?.reason || '')
        setAiTextMissingContext(Array.isArray(data?.missing_context) ? data.missing_context : [])
      }
    } catch (error: any) {
      console.error('AI text suggestion error:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      setAiTextSuggestion(buildLocalAiTextFallback(aiTextAssistConfig))
      setAiTextReason('Edge Function nie odpowiedziała, więc pokazano bezpieczny lokalny szkic na podstawie danych pola. Po wdrożeniu funkcji Supabase sugestie będą generowane przez AI.')
      setAiTextMissingContext(['Sprawdź, czy Edge Function generate-text-suggestion jest wdrożona w Supabase i ma ustawiony sekret DEEPSEEK_API_KEY.'])
      showNotification('Edge Function AI nie odpowiedziała. Pokazałam lokalny szkic treści do ręcznej edycji.', 'info')
    } finally {
      setAiTextLoading(false)
    }
  }

  const applyAiTextSuggestion = () => {
    if (!aiTextAssistConfig?.onApply) return
    aiTextAssistConfig.onApply(aiTextSuggestion)
    showNotification(
      aiTextAssistConfig?.mode === 'medical_document'
        ? 'Szkic AI został wstawiony. Przed użyciem zatwierdź go medycznie i prawnie.'
        : 'Propozycja AI została wstawiona do pola. Zapisz formularz, aby utrwalić zmianę.',
      'success'
    )
    closeAiTextAssist()
  }

const AiTextAssistButton = ({
  eventId,
  sectionKey,
  fieldKey,
  currentValue,
  relatedEntityId,
  relatedEntityTitle,
  additionalInstruction,
  placeholder,
  mode,
  documentType,
  label = 'Magia AI',
  onApply
}: {
  eventId: string
  sectionKey: string
  fieldKey: string
  currentValue?: string
  relatedEntityId?: string
  relatedEntityTitle?: string
  additionalInstruction?: string
  placeholder?: string
  mode?: string
  documentType?: string
  label?: string
  onApply: (text: string) => void
}) => (
  <button
    type="button"
    onClick={() => openAiTextAssist({ eventId, sectionKey, fieldKey, currentValue, relatedEntityId, relatedEntityTitle, additionalInstruction, placeholder, mode, documentType, onApply })}
    className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border border-indigo-500/20 dark:border-indigo-400/30 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:from-indigo-500/20 hover:to-purple-500/20"
    title={mode === 'medical_document' ? 'Wygeneruj roboczy szkic dokumentu do zatwierdzenia' : 'Wygeneruj profesjonalną treść z AI'}
  >
    <Sparkles size={14} className="animate-pulse" />
    {label}
  </button>
)







  const loadEcoAiReport = useCallback(async () => {
    const { data, error } = await supabase
      .from('eco_ai_reports')
      .select('id, event_id, report, provider, model, confidence, updated_at, created_at')
      .eq('event_id', id)
      .maybeSingle()

    if (error) {
      console.warn('Eco AI report load error:', error.message)
      setEcoAiReport(null)
      return
    }

    setEcoAiReport(data || null)
  }, [id, supabase])

  const runEcoAiAnalysis = useCallback(async () => {
    if (!event?.id) {
      showNotification('Brak wydarzenia do analizy AI.', 'error')
      return
    }

    setEcoAiLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-eco-analysis', {
        body: { eventId: event.id }
      })

      if (error) throw error

      if (data?.report) {
        setEcoAiReport({
          event_id: event.id,
          report: data.report,
          confidence: data.report.confidence || 'ai',
          updated_at: new Date().toISOString()
        })
      } else {
        await loadEcoAiReport()
      }

      showNotification('Analiza AI Eco została odświeżona na podstawie aktualnych danych z planera.', 'success')
    } catch (error: any) {
      console.error('Eco AI analysis invoke error:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      showNotification(`Nie udało się odświeżyć analizy AI: ${error?.message || 'Nieznany błąd'}`, 'error')
    } finally {
      setEcoAiLoading(false)
    }
  }, [event?.id, loadEcoAiReport, supabase])

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined'
      ? (localStorage.getItem('clinicops-theme') || localStorage.getItem('anm-planner-theme'))
      : null
    setIsDarkMode(storedTheme === 'dark')
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.clinicTheme = storedTheme === 'dark' ? 'dark' : 'light'
    }
  }, [])

  useEffect(() => {
    loadHelpDocuments()
  }, [loadHelpDocuments])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('clinicops-theme', next ? 'dark' : 'light')
        localStorage.setItem('anm-planner-theme', next ? 'dark' : 'light')
      }
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.clinicTheme = next ? 'dark' : 'light'
      }
      return next
    })
  }

  const formatMoney = (value: number, currency = 'PLN') =>
    `${Number(value || 0).toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${currency}`

  const isLocalDateTimeValue = (value: string) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?!.*(?:Z|[+-]\d{2}:?\d{2}))/.test(value)

  const formatTimeValue = (value?: string | null) => {
    if (!value) return ''
    if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
    if (isLocalDateTimeValue(value)) return value.slice(11, 16)

    const date = new Date(value)

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const toDateTimeLocalInput = (value?: string | null) => {
    if (!value) return ''
    if (isLocalDateTimeValue(value)) return value.slice(0, 16)

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16)

    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const calculateVatValues = (netAmount: number, vatRate: number) => {
    const net = Number(netAmount || 0)
    const rate = Number(vatRate || 0)
    const vat = Number((net * rate / 100).toFixed(2))
    const gross = Number((net + vat).toFixed(2))
    return { net, vat, gross }
  }

  const parseKidsCount = (value: any) => {
    const normalized = String(value ?? '0').replace('+', '')
    const count = parseInt(normalized, 10)
    return Number.isFinite(count) ? Math.max(count, 0) : 0
  }

  const parseCompanionCount = (value: any) => {
    const normalized = String(value ?? '0').trim()
    if (!normalized || normalized === '0') return 0
    if (normalized === '1') return 1
    const numeric = parseInt(normalized.replace('+', ''), 10)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1
  }

  const getCompanionDisplayName = (value: any, fallbackName: string, index: number) => {
    const normalized = String(value ?? '').trim()
    const isName = normalized && normalized !== '0' && normalized !== '1' && Number.isNaN(Number(normalized.replace('+', '')))
    return isName && index === 0
      ? normalized
      : `Osoba towarzysząca ${index + 1} - ${fallbackName || 'gość'}`
  }

  const parseSizes = (value: any) => {
    if (Array.isArray(value)) return value
    return String(value || '')
      .split(',')
      .map(size => size.trim())
      .filter(Boolean)
  }

  const loadBudgetData = useCallback(async () => {
    try {
      const [itemsRes, categoriesRes, transfersRes, paymentsRes] = await Promise.all([
        supabase.from('event_budget_items').select('*').eq('event_id', id).order('created_at', { ascending: false }),
        supabase.from('event_budget_categories').select('*').eq('event_id', id).order('sort_order', { ascending: true }),
        supabase.from('event_budget_transfers').select('*').eq('event_id', id).order('created_at', { ascending: false }),
        supabase.from('event_budget_payments').select('*').eq('event_id', id).order('created_at', { ascending: false }),
      ])

      if (itemsRes.error) console.warn('event_budget_items load error', itemsRes.error)
      if (categoriesRes.error) console.warn('event_budget_categories load error', categoriesRes.error)
      if (transfersRes.error) console.warn('event_budget_transfers load error', transfersRes.error)
      if (paymentsRes.error) console.warn('event_budget_payments load error', paymentsRes.error)

      setBudgetItems(itemsRes.data || [])
      setBudgetCategories(categoriesRes.data || [])
      setBudgetTransfers(transfersRes.data || [])
      setBudgetPayments(paymentsRes.data || [])
    } catch (err) {
      console.warn('Budget data load failed', err)
      setBudgetItems([])
      setBudgetCategories([])
      setBudgetTransfers([])
      setBudgetPayments([])
    }
  }, [id, supabase])

  const loadEventPassData = useCallback(async () => {
    const warnAndReset = (tableName: string, error: any, setter: (rows: any[]) => void) => {
      if (error) {
        console.warn('Event pass table unavailable:', tableName, error.message || error)
        setter([])
        return true
      }
      return false
    }

    try {
      const [
        unitsRes,
        scansRes,
        gadgetsRes,
        staffRes,
        attendeeGadgetsRes,
        attendeeSessionsRes,
        guestSelectionsRes,
      ] = await Promise.all([
        supabase.from('event_attendee_units').select('*').eq('event_id', id).order('created_at', { ascending: true }),
        supabase.from('event_pass_scans').select('*').eq('event_id', id).order('scanned_at', { ascending: false }),
        supabase.from('event_gadget_redemptions').select('*').eq('event_id', id),
        supabase.from('event_staff_access').select('*').eq('event_id', id).order('created_at', { ascending: false }),
        supabase.from('event_attendee_gadget_choices').select('*').eq('event_id', id),
        supabase.from('event_attendee_session_signups').select('*').eq('event_id', id),
        supabase.from('guest_selections').select('*').eq('event_id', id),
      ])

      if (!warnAndReset('event_attendee_units', unitsRes.error, setAttendeeUnits)) setAttendeeUnits(unitsRes.data || [])
      if (!warnAndReset('event_pass_scans', scansRes.error, setEventPassScans)) setEventPassScans(scansRes.data || [])
      if (!warnAndReset('event_gadget_redemptions', gadgetsRes.error, setGadgetRedemptions)) setGadgetRedemptions(gadgetsRes.data || [])
      if (!warnAndReset('event_staff_access', staffRes.error, setStaffAccessList)) setStaffAccessList(staffRes.data || [])
      if (!warnAndReset('event_attendee_gadget_choices', attendeeGadgetsRes.error, setAttendeeGadgetChoices)) setAttendeeGadgetChoices(attendeeGadgetsRes.data || [])
      if (!warnAndReset('event_attendee_session_signups', attendeeSessionsRes.error, setAttendeeSessionSignups)) setAttendeeSessionSignups(attendeeSessionsRes.data || [])
      if (!warnAndReset('guest_selections', guestSelectionsRes.error, setGuestSelections)) setGuestSelections(guestSelectionsRes.data || [])
    } catch (err) {
      console.warn('Event pass table unavailable:', err)
      setAttendeeUnits([])
      setEventPassScans([])
      setMealRedemptions([])
      setGadgetRedemptions([])
      setTransportCheckins([])
      setStaffAccessList([])
      setAttendeeMealChoices([])
      setAttendeeGadgetChoices([])
      setAttendeeSessionSignups([])
      setAttendeeTransportChoices([])
      setGuestSelections([])
    }
  }, [id, supabase])


const loadPatients = useCallback(async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Patients load error:', error.message)
    setPatients([])
    return
  }

  setPatients(data || [])
}, [supabase])

const loadPatientPortalRequests = useCallback(async () => {
  const { data, error } = await supabase
    .from('patient_portal_requests')
    .select('*, patients(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Patient portal requests load error:', error.message)
    setPatientPortalRequests([])
    return
  }

  setPatientPortalRequests(data || [])
}, [supabase])

const loadPatientPortalMessages = useCallback(async () => {
  const { data, error } = await supabase
    .from('patient_portal_messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('Patient portal messages load error:', error.message)
    setPatientPortalMessages([])
    return
  }

  setPatientPortalMessages(data || [])
}, [supabase])

const loadPatientConsents = useCallback(async () => {
  const { data, error } = await supabase
    .from('patient_consents')
    .select('*')
    .eq('event_id', id)
    .order('signed_at', { ascending: false })

  if (error) {
    console.warn('Patient consents load error:', error.message)
    setPatientConsents([])
    return
  }

  setPatientConsents(data || [])
}, [id, supabase])

const loadConsentTemplates = useCallback(async () => {
  const { data, error } = await supabase
    .from('medical_consent_templates')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Błąd ładowania szablonów z bazy:', error.message);
    setConsentTemplates([]);
    return;
  }
  setConsentTemplates(data || []);
}, [id, supabase]);


  const buildAttendeeUnitRows = (app: any) => {
    const baseName = `${app.first_name || ''} ${app.last_name || ''}`.trim()
    const accessStatus = app.access_status || app.status || 'pending'
    const ticketType = app.ticket_type || null
    const rows: any[] = [{
      event_id: id,
      application_id: app.id,
      unit_type: 'main',
      display_name: baseName || app.email || 'Gość',
      first_name: app.first_name || null,
      last_name: app.last_name || null,
      email: app.email || null,
      phone: app.phone || null,
      age_group: 'adult',
      diet: app.diet || null,
      allergies: app.allergies || null,
      ticket_type: ticketType,
      access_status: accessStatus,
      qr_token: crypto.randomUUID(),
      qr_status: 'active',
      same_as_main: false,
      notes: app.extra_notes || null,
      source_data: {
        transport: app.transport || null,
        transport_address: app.transport_address || null
      },
    }]

    const companionCount = parseCompanionCount(app.companion)
    const kidsCount = parseKidsCount(app.kids)

    for (let index = 0; index < companionCount; index += 1) {
      rows.push({
        event_id: id,
        application_id: app.id,
        unit_type: 'companion',
        display_name: getCompanionDisplayName(app.companion, baseName || app.email || 'gość', index),
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        age_group: 'adult',
        diet: app.diet || null,
        allergies: null,
        ticket_type: ticketType,
        access_status: accessStatus,
        qr_token: crypto.randomUUID(),
        qr_status: 'active',
        same_as_main: true,
        notes: null,
        source_data: {
          transport: app.transport || null,
          transport_address: app.transport_address || null
        },
      })
    }

    for (let index = 0; index < kidsCount; index += 1) {
      rows.push({
        event_id: id,
        application_id: app.id,
        unit_type: 'child',
        display_name: `Dziecko ${index + 1} - ${baseName || app.email || 'gość'}`,
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        age_group: 'child',
        diet: 'dziecięce',
        allergies: app.allergies || null,
        ticket_type: ticketType,
        access_status: accessStatus,
        qr_token: crypto.randomUUID(),
        qr_status: 'active',
        same_as_main: true,
        notes: null,
        source_data: {
          transport: app.transport || null,
          transport_address: app.transport_address || null
        },
      })
    }

    return rows
  }

  const generateAttendeeUnitsForApplication = async (app: any) => {
    if (!app?.id) return
    const existing = attendeeUnits.some(unit => unit.application_id === app.id)
    if (existing) {
      showNotification('QR dla tego zgłoszenia już istnieją', 'info')
      return
    }

    const rows = buildAttendeeUnitRows(app)
    const { error } = await supabase.from('event_attendee_units').insert(rows)
    if (error) {
      console.warn('Event pass table unavailable:', error.message)
      showNotification('Nie udało się wygenerować QR. Sprawdź tabelę event_attendee_units.', 'error')
      return
    }

    await loadEventPassData()
    showNotification('Wygenerowano QR dla pakietu uczestnika', 'success')
  }

const createPatientQrUnit = async (patient: any) => {
  const existing = attendeeUnits.find((unit: any) => unit.patient_id === patient.id)

  if (existing) {
    showNotification('Ten pacjent ma już wygenerowany QR', 'info')
    return
  }

  const qrToken = patient.qr_token || crypto.randomUUID()

  if (!patient.qr_token) {
    const { error: patientUpdateError } = await supabase
      .from('patients')
      .update({ qr_token: qrToken })
      .eq('id', patient.id)

    if (patientUpdateError) {
      showNotification('Nie udało się zapisać tokenu pacjenta: ' + patientUpdateError.message, 'error')
      return
    }
  }

  const { error } = await supabase.from('event_attendee_units').insert([{
    event_id: id,
    patient_id: patient.id,
    application_id: null,
    unit_type: 'patient',
    display_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Pacjent',
    first_name: patient.first_name || null,
    last_name: patient.last_name || null,
    email: patient.email || null,
    phone: patient.phone || null,
    age_group: 'adult',
    qr_token: qrToken,
    qr_status: 'active',
    access_status: 'active',
    checked_in: false,
    same_as_main: false,
    source_data: {
      pesel: patient.pesel || null
    }
  }])

  if (error) {
    showNotification('Nie udało się wygenerować QR pacjenta: ' + error.message, 'error')
    return
  }

  await loadPatients()
  await loadPatientConsents()
  await loadEventPassData()
  showNotification('QR pacjenta wygenerowany', 'success')
}

  const handleGenerateUnitsForAllApplications = async () => {
    const existingApplicationIds = new Set(attendeeUnits.map(unit => unit.application_id))
    const activeApps = applications.filter((app: any) =>
      app.access_status === 'active' ||
      app.is_active_participant === true ||
      app.status === 'approved' ||
      app.rsvp_status === 'potwierdzone'
    )
    const rows = activeApps
      .filter((app: any) => !existingApplicationIds.has(app.id))
      .flatMap((app: any) => buildAttendeeUnitRows(app))

    if (rows.length === 0) {
      showNotification('Nie ma brakujących QR do wygenerowania', 'info')
      return
    }

    const { error } = await supabase.from('event_attendee_units').insert(rows)
    if (error) {
      console.warn('Event pass table unavailable:', error.message)
      showNotification('Nie udało się wygenerować QR. Sprawdź tabelę event_attendee_units.', 'error')
      return
    }

    await loadEventPassData()
    showNotification(`Wygenerowano ${rows.length} jednostek QR`, 'success')
  }

const insertEventPassScan = async (unit: any, scanType: string) => {
  const { error } = await supabase.from('event_pass_scans').insert([{
    event_id: id,
    application_id: unit.application_id || null,
    patient_id: unit.patient_id || null,
    attendee_unit_id: unit.id,
    scan_type: scanType,
    result: 'ok',
    scanned_by: 'planner',
    staff_role: 'admin',
    scanned_at: new Date().toISOString(),
  }])

  if (error) console.warn('Event pass scan error:', error.message)
}

  const handleCheckInAttendeeUnit = async (unit: any) => {
    const { error } = await supabase
      .from('event_attendee_units')
      .update({ checked_in: true, checked_in_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', unit.id)
    if (error) {
      showNotification('Nie udało się zapisać check-in', 'error')
      return
    }
    await insertEventPassScan(unit, 'entry_checkin')
    await loadEventPassData()
    showNotification('Check-in zapisany', 'success')
  }

  const handleIssueWristband = async (unit: any) => {
    const wristbandCode = unit.wristband_code || `BAND-${Date.now()}-${String(unit.id).slice(0, 4)}`
    const { error } = await supabase
      .from('event_attendee_units')
      .update({ wristband_code: wristbandCode, wristband_issued: true, wristband_issued_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', unit.id)
    if (error) {
      showNotification('Nie udało się wydać opaski', 'error')
      return
    }
    await insertEventPassScan(unit, 'wristband_issue')
    await loadEventPassData()
    showNotification('Opaska wydana', 'success')
  }

  const handleReturnWristband = async (unit: any) => {
    const { error } = await supabase
      .from('event_attendee_units')
      .update({ wristband_returned: true, wristband_returned_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', unit.id)
    if (error) {
      showNotification('Nie udało się zapisać zwrotu opaski', 'error')
      return
    }
    await insertEventPassScan(unit, 'wristband_return')
    await loadEventPassData()
    showNotification('Zwrot opaski zapisany', 'success')
  }

  const handleResetUnitStatus = async (unit: any) => {
    if (!confirm('Zresetować status check-in i opaski dla tej jednostki?')) return
    const { error } = await supabase
      .from('event_attendee_units')
      .update({
        checked_in: false,
        checked_in_at: null,
        wristband_issued: false,
        wristband_issued_at: null,
        wristband_returned: false,
        wristband_returned_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unit.id)
    if (error) {
      showNotification('Nie udało się zresetować statusu', 'error')
      return
    }
    await loadEventPassData()
    showNotification('Status jednostki zresetowany', 'success')
  }

  const handleSaveStaffAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      event_id: id,
      name: staffAccessForm.name,
      role: staffAccessForm.role || 'reception',
      access_token: crypto.randomUUID(),
      can_entry_checkin: !!staffAccessForm.can_entry_checkin,
      can_meal_redemption: !!staffAccessForm.can_meal_redemption,
      can_gadget_redemption: !!staffAccessForm.can_gadget_redemption,
      can_transport_checkin: !!staffAccessForm.can_transport_checkin,
      can_wristband_issue: !!staffAccessForm.can_wristband_issue,
      can_wristband_return: !!staffAccessForm.can_wristband_return,
      is_active: staffAccessForm.is_active !== false,
    }
    const { error } = await supabase.from('event_staff_access').insert([data])
    if (error) {
      console.warn('Event pass table unavailable:', error.message)
      showNotification('Nie udało się dodać dostępu obsługi', 'error')
      return
    }
    setStaffAccessForm({})
    setIsStaffAccessModalOpen(false)
    await loadEventPassData()
    showNotification('Dostęp obsługi przygotowany', 'success')
  }

  const getStaffPassUrl = (accessToken?: string) => {
    if (!accessToken) return ''
    if (typeof window === 'undefined') return `/staff-pass/${accessToken}`
    return `${window.location.origin}/staff-pass/${accessToken}`
  }

  const getClinicStaffRoleLabel = (role?: string) => ({
    reception: 'Recepcja',
    doctor: 'Lekarz',
    coordinator: 'Opiekun pacjenta',
    manager: 'Manager',
    entry: 'Recepcja',
    kitchen: 'Recepcja',
    transport: 'Opiekun pacjenta'
  } as Record<string, string>)[String(role || '')] || 'Personel'

  const toggleApplicationExpanded = (applicationId: string) => {
    setExpandedApplicationIds(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  const publicSectionConfigs = [
    { key: 'menu', label: 'Zalecenia po wizycie', icon: UtensilsCrossed, operational: true, actionField: 'menu_selection_enabled', actionLabel: 'Włącz zalecenia dla pacjenta', imageFileKey: 'menuSectionImg', placeholderTitle: 'Zalecenia medyczne', placeholderDescription: 'Opisz zalecenia przed lub po zabiegu, dietę, leki albo przygotowanie do wizyty.' },
    { key: 'workshops', label: 'Wizyty / konsultacje', icon: Clock, operational: true, actionField: 'workshops_signup_enabled', actionLabel: 'Włącz zapisy na wizyty', imageFileKey: 'workshopsSectionImg', placeholderTitle: 'Wizyty i konsultacje', placeholderDescription: 'Opisz dostępne wizyty, konsultacje i procedury.' },
    { key: 'eventpass', label: 'Check-in QR', icon: QrCode, operational: true, actionField: 'eventpass_qr_visible', actionLabel: 'Pokaż kod QR pacjenta', placeholderTitle: 'Identyfikacja pacjenta', placeholderDescription: 'Opisz użycie kodu QR do check-inu wizyty i dostępu personelu.' },
    { key: 'theme', label: 'Standard placówki', icon: Palette, placeholderTitle: 'Standard obsługi', placeholderDescription: 'Opisz standard wizyty, komfort i doświadczenie pacjenta.' },
    { key: 'agenda', label: 'Ścieżka wizyty', icon: ClipboardList, placeholderTitle: 'Ścieżka pacjenta', placeholderDescription: 'Opisz kolejne kroki od rejestracji po follow-up.' },
    { key: 'speakers', label: 'Lekarze / specjaliści', icon: Mic, placeholderTitle: 'Zespół medyczny', placeholderDescription: 'Przedstaw lekarzy, specjalistów i opiekunów pacjenta.' },
    { key: 'sponsors', label: 'Partnerzy medyczni', icon: Briefcase, placeholderTitle: 'Partnerzy kliniki', placeholderDescription: 'Opisz partnerów, laboratoria lub współpracujące podmioty.' },
    { key: 'materials', label: 'Zgody i dokumenty', icon: FileIcon, placeholderTitle: 'Dokumenty pacjenta', placeholderDescription: 'Dodaj zgody, ankiety medyczne, zalecenia lub ważne pliki.' },
    { key: 'announcements', label: 'Ogłoszenia / aktualności', icon: MessageSquare, placeholderTitle: 'Ogłoszenia', placeholderDescription: 'Dodaj ważne komunikaty dla uczestników.' },
    { key: 'promo', label: 'Strefa promocyjna', icon: BadgeDollarSign, placeholderTitle: 'Strefa promocyjna', placeholderDescription: 'Opisz reklamy, oferty lub dodatkowe działania promocyjne.' },
    { key: 'gallery', label: 'Galeria / klimat eventu', icon: ImageIcon, placeholderTitle: 'Galeria wydarzenia', placeholderDescription: 'Pokaż zdjęcia, klimat i wizualną zapowiedź wydarzenia.' },
    { key: 'faq', label: 'FAQ / ważne informacje', icon: AlertTriangle, placeholderTitle: 'Ważne informacje', placeholderDescription: 'Zbierz najważniejsze odpowiedzi i informacje organizacyjne.' },
    { key: 'documents', label: 'Regulamin / dokumenty', icon: FileText, placeholderTitle: 'Regulamin i dokumenty', placeholderDescription: 'Dodaj regulamin, polityki, dokumenty lub warunki uczestnictwa.' },
  ]

  const getPublicSectionFields = (sectionKey: string, actionField?: string) => ({
    visible: `${sectionKey}_section_visible`,
    title: `${sectionKey}_section_title`,
    description: `${sectionKey}_section_description`,
    image: `${sectionKey}_section_image_url`,
    cta: `${sectionKey}_section_cta_label`,
    action: actionField
  })

  const getPublicSectionStatus = (section: any) => {
    const fields = getPublicSectionFields(section.key, section.actionField)
    const visible = editForm?.[fields.visible] === true
    const active = fields.action ? editForm?.[fields.action] === true : false
    if (!visible) return { label: 'Sekcja ukryta', className: 'bg-slate-100 text-slate-600' }
    if (section.operational && active) return { label: 'Sekcja widoczna + aktywna', className: 'bg-emerald-100 text-emerald-700' }
    return { label: 'Sekcja widoczna informacyjnie', className: 'bg-blue-100 text-blue-700' }
  }

  const handleSaveParticipantPageSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const bId = event?.business_id || 'general'
      const existingEventKeys = new Set(Object.keys(event || {}))
      const updates: Record<string, any> = {}
      const missingFields = new Set<string>()

      for (const section of publicSectionConfigs) {
        const fields = getPublicSectionFields(section.key, section.actionField)
        const keys = [fields.visible, fields.title, fields.description, fields.image, fields.cta, fields.action].filter(Boolean) as string[]
        keys.forEach(field => {
          if (existingEventKeys.has(field)) {
            updates[field] = editForm?.[field] ?? null
          } else {
            missingFields.add(field)
          }
        })

        const fileKey = section.imageFileKey as keyof typeof newFiles | undefined
        if (fileKey && existingEventKeys.has(fields.image) && newFiles[fileKey]) {
          const uploadedUrl = await uploadFile(newFiles[fileKey] as File, bId, `${section.key}-section`)
          if (uploadedUrl) updates[fields.image] = `${uploadedUrl}?t=${Date.now()}`
        }
      }

      if (Object.keys(updates).length === 0) {
        showNotification('Najpierw dodaj kolumny ustawień strony uczestnika w b2b_events', 'info')
        console.warn('Missing public section columns:', Array.from(missingFields))
        return
      }

      const { error } = await supabase.from('b2b_events').update(updates).eq('id', id)
      if (error) throw error

      setEvent((prev: any) => ({ ...prev, ...updates }))
      setEditForm((prev: any) => ({ ...prev, ...updates }))
      setNewFiles(prev => ({
        ...prev,
        menuSectionImg: null,
        transportSectionImg: null,
        workshopsSectionImg: null,
        liveSectionImg: null
      }))
      if (missingFields.size > 0) console.warn('Missing public section columns:', Array.from(missingFields))
      showNotification('Ustawienia strony uczestnika zapisane', 'success')
    } catch (err: any) {
      console.error('Participant page settings save error:', err)
      showNotification('Błąd zapisu ustawień strony uczestnika: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

 const uploadFile = async (file: File | null, ownerId: string, prefix: string): Promise<string | null> => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      // Unikalna nazwa z timestampem gwarantuje, że przeglądarka nie pokaże starego cache'u
      const fileName = `${ownerId}/${prefix}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error(`Błąd przesyłania pliku (${prefix}):`, uploadError.message);
        showNotification(`Problem z obrazem ${prefix}: ${uploadError.message}`, 'error');
        return null;
      }

      // Pobranie publicznego adresu URL z nowo utworzonej ścieżki
      const { data } = supabase.storage
        .from('event-covers')
        .getPublicUrl(fileName);

      return data.publicUrl;

    } catch (err) {
      console.error("Nieoczekiwany błąd uploadu:", err);
      return null;
    }
  };

  const getStoragePathFromPublicUrl = (url?: string | null) => {
    if (!url) return null;
    const cleanUrl = url.split('?')[0];
    const marker = '/event-covers/';
    const index = cleanUrl.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(cleanUrl.slice(index + marker.length));
  };

  const deleteUploadedFile = async (url?: string | null) => {
    const path = getStoragePathFromPublicUrl(url);
    if (!path) return;

    const { error } = await supabase.storage
      .from('event-covers')
      .remove([path]);

    if (error) {
      console.warn('Nie udalo sie usunac pliku ze storage:', error.message);
    }
  };

  const handleDeleteEventImage = async (fieldKey: string) => {
    const currentUrl = editForm?.[fieldKey] || event?.[fieldKey];
    if (!currentUrl) return;
    if (!confirm('Usunac to zdjecie ze strony i z bazy plikow?')) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('b2b_events')
        .update({ [fieldKey]: null })
        .eq('id', id);

      if (error) throw error;

      await deleteUploadedFile(currentUrl);
      setEvent((prev: any) => ({ ...prev, [fieldKey]: null }));
      setEditForm((prev: any) => ({ ...prev, [fieldKey]: null }));
      showNotification('Zdjecie usuniete', 'success');
    } catch (err: any) {
      showNotification('Blad usuwania zdjecia: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };
  const calculateEcoMetrics = (apps: Guest[]) => {
    const approved = apps.filter(a => a.status === 'approved')
    setEcoMetrics({
      totalCO2Saved: Math.round(approved.length * 12.5),
      foodWastePrevented: Math.round(approved.length * 0.8),
      transportOptimized: Math.round(approved.length * 0.6 * 100) / 100,
      localSuppliers: Math.floor(approved.length / 10) + 1
    })
  }

  const updateAppStatus = async (appId: string, newStatus: string) => {
    try {
      await supabase.from('b2b_applications').update({ status: newStatus }).eq('id', appId)
      setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      showNotification(`Status gościa zaktualizowany`, 'success')
      calculateEcoMetrics(applications)
    } catch (error) {
      showNotification('Błąd aktualizacji statusu', 'error')
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    try {
      for (const guestId of selectedGuests) {
        await supabase.from('b2b_applications').update({ status }).eq('id', guestId)
      }
      setApplications(applications.map(a =>
        selectedGuests.includes(a.id) ? { ...a, status } : a
      ))
      setSelectedGuests([])
      showNotification(`Zaktualizowano ${selectedGuests.length} gości`, 'success')
      calculateEcoMetrics(applications)
    } catch (error) {
      showNotification('Błąd aktualizacji grupowej', 'error')
    }
  }

  const deleteApplication = async (appId: string) => {
    try {
      await supabase.from('b2b_applications').delete().eq('id', appId)
      setApplications(applications.filter(a => a.id !== appId))
      setShowDeleteConfirm(null)
      showNotification('Gość usunięty', 'success')
    } catch (error) {
      showNotification('Błąd usuwania gościa', 'error')
    }
  }

  const exportToCSV = () => {
    const headers = ['Imię', 'Nazwisko', 'Firma', 'Status', 'Dieta', 'Alkohol', 'Słodycze', 'Transport', 'Email']
    const rows = applications.map(app => [
      app.first_name, app.last_name, app.company_name, app.status,
      app.diet, app.alcohol_preference || '-', app.sweets_preference || '-', app.transport, app.email
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goscie-${event?.title || 'wydarzenie'}.csv`
    a.click()
    showNotification('Lista gości wyeksportowana', 'success')
  }

    const saveGuestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('b2b_applications').update(editingGuest).eq('id', editingGuest.id);
      if (error) throw error;
      setApplications(applications.map(a => a.id === editingGuest.id ? editingGuest : a));
      showNotification('Dane gościa zaktualizowane', 'success');
      setEditingGuest(null);
    } catch (err: any) {
      showNotification('Błąd zapisu: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const loadPartners = useCallback(async () => {
  const { data, error } = await supabase.from('event_partners').select('*').eq('event_id', id).order('display_order', { ascending: true })
  if (error) {
    console.warn('event_partners load error:', error.message)
    setPartners([])
    setDoctorsList([])
    setPreparationsList([])
    return
  }
  if (data) {
    setPartners(data)
    setDoctorsList(data.filter(isDoctorPartner))
    setPreparationsList(data.filter(isPreparationPartner))
  }
}, [id, supabase])

// ===== CONTRACTORS =====
const loadContractors = useCallback(async () => {
  const { data } = await supabase.from('contractors').select('*').eq('event_id', id).order('created_at', { ascending: false });
  if (data) setContractors(data);
}, [id, supabase]);

const handleSaveContractor = async (e: React.FormEvent) => {
  e.preventDefault();
  setUpdating(true);

  try {
    let invoiceUrl = contractorForm.invoice_url;

    if (newFiles.contractorInvoice) {
      invoiceUrl = await uploadFile(newFiles.contractorInvoice, id, 'invoice');
    }

    const netAmount = Number(contractorForm.net_amount || contractorForm.amount || 0);
    const vatRate = Number(contractorForm.vat_rate ?? 23);
    const grossAmount = contractorForm.gross_amount
      ? Number(contractorForm.gross_amount)
      : Number((netAmount * (1 + vatRate / 100)).toFixed(2));

    const data = {
      event_id: id,

      // Dane podstawowe
      name: contractorForm.name,
      tax_id: contractorForm.tax_id,
      regon: contractorForm.regon,
      krs: contractorForm.krs,
      address: contractorForm.address,
      email: contractorForm.email,
      phone: contractorForm.phone,
      contact_person: contractorForm.contact_person,
      website_url: contractorForm.website_url,

      // Typ usługi / budżet
      service_type: contractorForm.service_type,
      service_scope: contractorForm.service_scope,
      budget_category: contractorForm.budget_category || contractorForm.service_type,
      include_in_budget: contractorForm.include_in_budget !== false,

      // Kwoty i płatności
      amount: grossAmount,
      net_amount: netAmount,
      vat_rate: vatRate,
      gross_amount: grossAmount,
      advance_amount: Number(contractorForm.advance_amount || 0),
      currency: contractorForm.currency || 'PLN',
      payment_due_date: contractorForm.payment_due_date || null,
      payment_status: contractorForm.payment_status || 'unpaid',

      // Statusy
      status: contractorForm.status,
      operational_status: contractorForm.operational_status || 'new',

      // Umowy i dokumenty
      contract_status: contractorForm.contract_status || 'none',
      contract_number: contractorForm.contract_number,
      contract_signed_date: contractorForm.contract_signed_date || null,
      document_folder_url: contractorForm.document_folder_url,

      // Powiązania
      tags: contractorForm.tags || [],
      fleet_id: contractorForm.fleet_id || null,
      speaker_id: contractorForm.speaker_id || null,
      partner_id: contractorForm.partner_id || null,

      // Pliki i notatki
      invoice_url: invoiceUrl,
      notes: contractorForm.notes,

      // Ocena / eco
      eco_score: Number(contractorForm.eco_score || 0),
      rating: contractorForm.rating ? Number(contractorForm.rating) : null,
      is_preferred: contractorForm.is_preferred || false,
    };

    if (isEditingContractor && contractorForm.id) {
      const { error } = await supabase
        .from('contractors')
        .update(data)
        .eq('id', contractorForm.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('contractors')
        .insert([data]);

      if (error) throw error;
    }

    await loadContractors();
    setIsContractorModalOpen(false);
    setIsEditingContractor(false);
    setContractorForm({});
    showNotification('Podwykonawca zapisany', 'success');
  } catch (err: any) {
    showNotification('Błąd zapisu: ' + err.message, 'error');
  } finally {
    setUpdating(false);
  }
};
const handleDeleteContractor = async (id: string) => {
  if (!confirm('Usunąć podwykonawcę?')) return;
  try {
    await supabase.from('contractors').delete().eq('id', id);
    await loadContractors();
    showNotification('Usunięto', 'success');
  } catch (err) {
    showNotification('Błąd', 'error');
  }
};

const exportContractorsToCSV = () => {
  const headers = ['Nazwa', 'NIP', 'Email', 'Telefon', 'Kwota', 'Status', 'Tagi'];
  const rows = filteredContractors.map(c => [c.name, c.tax_id, c.email, c.phone, c.amount, c.status, c.tags?.join(', ')]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `podwykonawcy-${event?.title || 'event'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const filteredContractors = useMemo(() => {
  let filtered = contractors;
  if (filterTag) filtered = filtered.filter(c => c.tags?.includes(filterTag));
  if (searchContractor) {
    const s = searchContractor.toLowerCase();
    filtered = filtered.filter(c => c.name?.toLowerCase().includes(s) || c.tax_id?.includes(s) || c.email?.toLowerCase().includes(s));
  }
  return filtered;
}, [contractors, filterTag, searchContractor]);

const allTags = useMemo(() => {
  const tagsSet = new Set<string>();
  contractors.forEach(c => c.tags?.forEach((t: string) => tagsSet.add(t)));
  return Array.from(tagsSet).sort();
}, [contractors]);

const patientConsentsByPatientId = useMemo(() => {
  return patientConsents.reduce((acc: Record<string, any[]>, consent: any) => {
    if (!consent.patient_id) return acc
    if (!acc[consent.patient_id]) acc[consent.patient_id] = []
    acc[consent.patient_id].push(consent)
    return acc
  }, {})
}, [patientConsents])

const patientUnitsByPatientId = useMemo(() => {
  return attendeeUnits.reduce((acc: Record<string, any>, unit: any) => {
    if (!unit.patient_id) return acc
    acc[unit.patient_id] = unit
    return acc
  }, {})
}, [attendeeUnits])

const patientQrRows = useMemo(() => {
  return patients.map((patient: any) => ({
    patient,
    unit: patientUnitsByPatientId[patient.id] || null
  }))
}, [patients, patientUnitsByPatientId])

const filteredPatientRows = useMemo(() => {
  const search = patientSearch.toLowerCase()

  return patientQrRows.filter(({ patient, unit }: any) => {
    const matchesSearch =
      !search ||
      `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(search) ||
      String(patient.email || '').toLowerCase().includes(search) ||
      String(patient.phone || '').toLowerCase().includes(search) ||
      String(patient.pesel || '').toLowerCase().includes(search) ||
      String(patient.qr_token || '').toLowerCase().includes(search) ||
      String(unit?.qr_token || '').toLowerCase().includes(search)

    const matchesFilter =
      patientQrFilter === 'all' ||
      (patientQrFilter === 'no_qr' && !unit) ||
      (patientQrFilter === 'qr' && !!unit) ||
      (patientQrFilter === 'checked_in' && unit?.checked_in) ||
      (patientQrFilter === 'id_issued' && unit?.wristband_issued) ||
      (patientQrFilter === 'closed' && unit?.wristband_returned)

    return matchesSearch && matchesFilter
  })
}, [patientQrRows, patientSearch, patientQrFilter])

const patientQrMetrics = useMemo(() => ({
  totalPatients: patients.length,
  qrGenerated: patientQrRows.filter((row: any) => row.unit?.qr_token).length,
  checkedIn: patientQrRows.filter((row: any) => row.unit?.checked_in).length,
  idsIssued: patientQrRows.filter((row: any) => row.unit?.wristband_issued).length,
  visitsClosed: patientQrRows.filter((row: any) => row.unit?.wristband_returned).length,
}), [patients.length, patientQrRows])
// ============================================================================
// ----- 4.3. HANDLERY DLA STOŁÓW I DRAG & DROP -----
// ============================================================================

// --- FUNKCJA: IMPORT Z EXCEL ---
  const handleImportExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rows: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        for (const row of rows) {
          await supabase.from('b2b_applications').insert([{
            event_id: id,
            patient_id: crypto.randomUUID(),
            first_name: row['Imię'] || row['first_name'],
            last_name: row['Nazwisko'] || row['last_name'],
            email: row['Email'] || row['email'],
            company_name: row['Firma'] || row['company'],
            status: 'pending'
          }]);
        }
        showNotification(`Zaimportowano ${rows.length} gości`, 'success');
        loadEventData();
      } catch (err) {
        showNotification('Błąd importu pliku Excel', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- FUNKCJA: GENEROWANIE PLAKIETEK PDF ---
  const handlePrintBadges = () => {
    const doc = new jsPDF();
    const approved = applications.filter(a => a.status === 'approved');

    if (approved.length === 0) {
      showNotification('Brak zaakceptowanych gości do wydruku', 'info');
      return;
    }

    approved.forEach((guest, idx) => {
      if (idx > 0 && idx % 4 === 0) doc.addPage();
      const yPos = (idx % 4) * 60 + 30;

      doc.setFontSize(22);
      doc.text(`${guest.first_name} ${guest.last_name}`, 105, yPos, { align: 'center' });
      doc.setFontSize(12);
      doc.text(guest.company_name?.toUpperCase() || '', 105, yPos + 10, { align: 'center' });
      doc.setDrawColor(232, 206, 122); // Kolor złoty ANM
      doc.line(50, yPos + 15, 160, yPos + 15);
    });

    doc.save(`identyfikatory-${event?.title || 'event'}.pdf`);
    showNotification('Pobieranie pliku PDF...', 'success');
  };

  const handleCreateDefaultBudgetCategories = async () => {
    const defaults = [
      { name: 'Personel medyczny', slug: 'medical_team', planned_budget: 0, color: '#0f766e', sort_order: 1 },
      { name: 'Preparaty i materiały', slug: 'preparations', planned_budget: 0, color: '#7c3aed', sort_order: 2 },
      { name: 'Sprzęt i serwis', slug: 'equipment', planned_budget: 0, color: '#2563eb', sort_order: 3 },
      { name: 'Diagnostyka i laboratoria', slug: 'diagnostics', planned_budget: 0, color: '#0891b2', sort_order: 4 },
      { name: 'Marketing i pierwszy kontakt', slug: 'marketing', planned_budget: 0, color: '#db2777', sort_order: 5 },
      { name: 'Administracja i recepcja', slug: 'administration', planned_budget: 0, color: '#64748b', sort_order: 6 },
      { name: 'Czynsz i media', slug: 'facility', planned_budget: 0, color: '#ca8a04', sort_order: 7 },
      { name: 'IT i systemy', slug: 'it_systems', planned_budget: 0, color: '#475569', sort_order: 8 },
      { name: 'Inne koszty kliniki', slug: 'other', planned_budget: 0, color: '#94a3b8', sort_order: 9 },
      { name: 'Przychody z wizyt', slug: 'visit_income', planned_budget: 0, color: '#16a34a', sort_order: 10 }
    ].map(category => ({ ...category, event_id: id }))
    const { error } = await supabase.from('event_budget_categories').insert(defaults)
    if (error) return showNotification('Błąd tworzenia kategorii: ' + error.message, 'error')
    await loadBudgetData()
    showNotification('Kategorie budżetu utworzone', 'success')
  }

  const getBudgetItemPaymentStatus = (grossAmount: number, paidAmount: number, advanceAmount: number, fallback = 'planned') => {
    if (paidAmount >= grossAmount && grossAmount > 0) return 'paid'
    if (paidAmount > 0 && paidAmount < grossAmount) return 'partially_paid'
    if (advanceAmount > 0 && paidAmount === 0) return 'advance_paid'
    return fallback || 'planned'
  }

  const handleSaveBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const vatRate = Number(budgetItemForm.vat_rate || 0)
      const netAmount = Number(budgetItemForm.net_amount || 0)
      const vatValues = calculateVatValues(netAmount, vatRate)
      const grossAmount = budgetItemForm.gross_amount !== '' && budgetItemForm.gross_amount !== undefined
        ? Number(budgetItemForm.gross_amount || 0)
        : vatValues.gross
      const vatAmount = Number((grossAmount - netAmount).toFixed(2))
      const paidAmount = Number(budgetItemForm.paid_amount || 0)
      const advanceAmount = Number(budgetItemForm.advance_amount || 0)
      const paymentStatus = getBudgetItemPaymentStatus(grossAmount, paidAmount, advanceAmount, budgetItemForm.payment_status)
      const data = {
        event_id: id,
        source_type: budgetItemForm.source_type || 'manual',
        source_id: budgetItemForm.source_id || null,
        type: budgetItemForm.type || 'expense',
        category: budgetItemForm.category || 'other',
        title: budgetItemForm.title,
        description: budgetItemForm.description || null,
        planned_net_amount: Number(budgetItemForm.planned_net_amount || 0),
        planned_gross_amount: Number(budgetItemForm.planned_gross_amount || 0),
        net_amount: netAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        gross_amount: grossAmount,
        paid_amount: paidAmount,
        advance_amount: advanceAmount,
        advance_paid_at: budgetItemForm.advance_paid_at || null,
        due_date: budgetItemForm.due_date || null,
        payment_status: paymentStatus,
        currency: budgetItemForm.currency || 'PLN',
        contractor_id: budgetItemForm.contractor_id || null,
        invoice_url: budgetItemForm.invoice_url || null,
        document_url: budgetItemForm.document_url || null,
        is_locked: budgetItemForm.is_locked || false,
        is_active: budgetItemForm.is_active !== false,
        notes: budgetItemForm.notes || null,
        updated_at: new Date().toISOString()
      }
      const { error } = isEditingBudgetItem && budgetItemForm.id
        ? await supabase.from('event_budget_items').update(data).eq('id', budgetItemForm.id)
        : await supabase.from('event_budget_items').insert([data])
      if (error) throw error
      await loadBudgetData()
      setIsBudgetItemModalOpen(false)
      setBudgetItemForm({})
      showNotification('Pozycja budżetu zapisana', 'success')
    } catch (err: any) {
      showNotification('Błąd zapisu pozycji: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeactivateBudgetItem = async (itemId: string) => {
    const { error } = await supabase.from('event_budget_items').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', itemId)
    if (error) return showNotification('Błąd ukrywania pozycji: ' + error.message, 'error')
    await loadBudgetData()
    showNotification('Pozycja budżetu ukryta', 'success')
  }

  const handleSaveBudgetCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      event_id: id,
      name: budgetCategoryForm.name,
      slug: budgetCategoryForm.slug,
      planned_budget: Number(budgetCategoryForm.planned_budget || 0),
      color: budgetCategoryForm.color || '#94a3b8',
      sort_order: Number(budgetCategoryForm.sort_order || 0),
      notes: budgetCategoryForm.notes || null
    }
    const { error } = isEditingBudgetCategory && budgetCategoryForm.id
      ? await supabase.from('event_budget_categories').update(data).eq('id', budgetCategoryForm.id)
      : await supabase.from('event_budget_categories').insert([data])
    if (error) return showNotification('Błąd zapisu kategorii: ' + error.message, 'error')
    await loadBudgetData()
    setIsBudgetCategoryModalOpen(false)
    setBudgetCategoryForm({})
    showNotification('Kategoria zapisana', 'success')
  }

  const handleDeleteBudgetCategory = async (categoryId: string) => {
    if (!confirm('Usunąć kategorię budżetu?')) return
    const { error } = await supabase.from('event_budget_categories').delete().eq('id', categoryId)
    if (error) return showNotification('Błąd usuwania kategorii: ' + error.message, 'error')
    await loadBudgetData()
    showNotification('Kategoria usunięta', 'success')
  }

  const handleSaveBudgetTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(budgetTransferForm.amount || 0)
    if (!budgetTransferForm.from_category_id || !budgetTransferForm.to_category_id || budgetTransferForm.from_category_id === budgetTransferForm.to_category_id || amount <= 0) {
      return showNotification('Uzupełnij poprawnie przesunięcie środków', 'error')
    }
    const fromCategory = budgetCategories.find((c: any) => c.id === budgetTransferForm.from_category_id)
    const toCategory = budgetCategories.find((c: any) => c.id === budgetTransferForm.to_category_id)
    const { error } = await supabase.from('event_budget_transfers').insert([{
      event_id: id,
      from_category_id: budgetTransferForm.from_category_id,
      to_category_id: budgetTransferForm.to_category_id,
      amount,
      currency: budgetTransferForm.currency || 'PLN',
      reason: budgetTransferForm.reason || null
    }])
    if (error) return showNotification('Błąd przesunięcia: ' + error.message, 'error')
    await Promise.all([
      supabase.from('event_budget_categories').update({ planned_budget: Number(fromCategory?.planned_budget || 0) - amount }).eq('id', fromCategory.id),
      supabase.from('event_budget_categories').update({ planned_budget: Number(toCategory?.planned_budget || 0) + amount }).eq('id', toCategory.id)
    ])
    await loadBudgetData()
    setIsBudgetTransferModalOpen(false)
    setBudgetTransferForm({})
    showNotification(Number(fromCategory?.planned_budget || 0) < amount ? 'Przesunięto środki, ale źródłowa kategoria zeszła poniżej zera' : 'Środki przesunięte', Number(fromCategory?.planned_budget || 0) < amount ? 'info' : 'success')
  }

  const handleAddBudgetPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBudgetItem) return
    const amount = Number(budgetPaymentForm.amount || 0)
    const { error } = await supabase.from('event_budget_payments').insert([{
      event_id: id,
      budget_item_id: selectedBudgetItem.id,
      amount,
      currency: budgetPaymentForm.currency || selectedBudgetItem.currency || 'PLN',
      paid_at: budgetPaymentForm.paid_at || new Date().toISOString().slice(0, 10),
      payment_method: budgetPaymentForm.payment_method || null,
      payment_reference: budgetPaymentForm.payment_reference || null,
      notes: budgetPaymentForm.notes || null
    }])
    if (error) return showNotification('Błąd dodawania płatności: ' + error.message, 'error')
    const newPaidAmount = Number(selectedBudgetItem.paid_amount || 0) + amount
    const grossAmount = Number(selectedBudgetItem.gross_amount || 0)
    const paymentStatus = newPaidAmount >= grossAmount ? 'paid' : newPaidAmount > 0 ? 'partially_paid' : 'planned'
    await supabase.from('event_budget_items').update({ paid_amount: newPaidAmount, payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('id', selectedBudgetItem.id)
    await loadBudgetData()
    setIsBudgetPaymentModalOpen(false)
    setBudgetPaymentForm({})
    setSelectedBudgetItem(null)
    showNotification('Płatność dodana', 'success')
  }

  const handleMarkAppointmentPaid = async (appointment: any) => {
    const price = Number(appointment.price_amount || 0)
    if (!appointment?.id || price <= 0) {
      return showNotification('Ta wizyta nie ma ustawionej ceny do rozliczenia.', 'error')
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        paid_amount: price,
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment.id)

    if (error) return showNotification('Błąd oznaczania wizyty jako zapłaconej: ' + error.message, 'error')
    await loadAppointments()
    showNotification('Wizyta oznaczona jako opłacona', 'success')
  }

  const hasBudgetSource = (sourceType: string, sourceId: string) =>
    budgetItems.some((item: any) => item.source_type === sourceType && String(item.source_id || '') === String(sourceId || '') && item.is_active !== false)

  const insertBudgetRows = async (rows: any[]) => {
    if (rows.length === 0) return 0
    const { error } = await supabase.from('event_budget_items').insert(rows)
    if (error) throw error
    await loadBudgetData()
    return rows.length
  }

  const handleImportContractorsToBudget = async () => {
    try {
      const rows = contractors
        .filter((contractor: any) => contractor.include_in_budget !== false && !hasBudgetSource('contractor', contractor.id))
        .map((contractor: any) => {
          const net = Number(contractor.net_amount || contractor.amount || 0)
          const gross = Number(contractor.gross_amount || contractor.amount || net)
          return {
            event_id: id,
            source_type: 'contractor',
            source_id: contractor.id,
            type: 'expense',
            category: contractor.budget_category || contractor.service_type || 'contractors',
            title: contractor.name,
            description: contractor.service_scope || contractor.notes || null,
            net_amount: net,
            vat_rate: Number(contractor.vat_rate || 23),
            vat_amount: Number((gross - net).toFixed(2)),
            gross_amount: gross,
            paid_amount: Number(contractor.advance_amount || 0),
            advance_amount: Number(contractor.advance_amount || 0),
            due_date: contractor.payment_due_date || null,
            payment_status: contractor.payment_status || 'planned',
            currency: contractor.currency || 'PLN',
            contractor_id: contractor.id,
            invoice_url: contractor.invoice_url || null,
            document_url: contractor.document_folder_url || null,
            is_active: true,
            notes: contractor.notes || null
          }
        })
      const count = await insertBudgetRows(rows)
      showNotification(`Dodano ${count} podwykonawców do budżetu`, 'success')
    } catch (err: any) {
      showNotification('Błąd importu podwykonawców: ' + err.message, 'error')
    }
  }

  const handleImportChecklistToBudget = async () => {
    try {
      const rows = checklistItems
        .filter((item: any) => Number(item.estimated_cost || 0) > 0 && !hasBudgetSource('checklist', item.id))
        .map((item: any) => ({
          event_id: id, source_type: 'checklist', source_id: item.id, type: 'expense', category: item.category || 'other',
          title: item.title, description: item.notes || null, net_amount: Number(item.estimated_cost || 0),
          vat_rate: 23, vat_amount: 0, gross_amount: Number(item.estimated_cost || 0),
          paid_amount: 0, payment_status: 'planned', currency: 'PLN', is_active: true
        }))
      const count = await insertBudgetRows(rows)
      showNotification(`Dodano ${count} pozycji z checklisty`, 'success')
    } catch (err: any) {
      showNotification('Błąd importu checklisty: ' + err.message, 'error')
    }
  }

  const handleImportTicketsIncomeToBudget = async () => {
    const paidTicketRevenue = applications
      .filter((app: any) => app.payment_status === 'paid' || app.ticket_status === 'paid')
      .reduce((sum, app: any) => sum + Number(app.ticket_paid_amount || 0), 0)
    const expectedTicketRevenue = applications.reduce((sum, app: any) => sum + Number(app.ticket_expected_amount || 0), 0)
    const data = {
      event_id: id,
      source_type: 'tickets',
      source_id: null,
      type: 'income',
      category: 'income',
      title: 'Przychody z biletów',
      description: `Oczekiwany przychód: ${formatMoney(expectedTicketRevenue)}`,
      net_amount: paidTicketRevenue,
      vat_rate: 0,
      vat_amount: 0,
      gross_amount: paidTicketRevenue,
      paid_amount: paidTicketRevenue,
      payment_status: 'paid',
      currency: 'PLN',
      is_active: true,
      updated_at: new Date().toISOString()
    }
    const existing = budgetItems.find((item: any) => item.source_type === 'tickets')
    const { error } = existing
      ? await supabase.from('event_budget_items').update(data).eq('id', existing.id)
      : await supabase.from('event_budget_items').insert([data])
    if (error) return showNotification('Błąd importu biletów: ' + error.message, 'error')
    await loadBudgetData()
    showNotification('Przychody z biletów przeliczone', 'success')
  }

  const handleSaveRegistrationSettings = async () => {
    setUpdating(true)
    try {
      const updates = {
        registration_mode: editForm?.registration_mode || 'free',
        registration_limit: editForm?.registration_limit ? Number(editForm.registration_limit) : null,
        registration_is_open: editForm?.registration_is_open !== false,
        registration_auto_activate_free: editForm?.registration_auto_activate_free !== false,
        registration_close_when_full: editForm?.registration_close_when_full === true,
        registration_count_limit_mode: editForm?.registration_count_limit_mode || 'active_only',
        payment_default_url: editForm?.payment_default_url || null,
        payment_success_message: editForm?.payment_success_message || null,
        payment_pending_message: editForm?.payment_pending_message || null,
        waitlist_message: editForm?.waitlist_message || null,
        tickets_notes: editForm?.tickets_notes || null,
      }
      const { error } = await supabase.from('b2b_events').update(updates).eq('id', id)
      if (error) throw error
      setEvent((prev: any) => ({ ...prev, ...updates }))
      setEditForm((prev: any) => ({ ...prev, ...updates }))
      showNotification('Ustawienia rejestracji zapisane', 'success')
    } catch (err: any) {
      showNotification('Błąd zapisu ustawień: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveTicketTier = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const data = {
        event_id: id,
        name: ticketTierForm.name,
        description: ticketTierForm.description || null,
        price: Number(ticketTierForm.price || 0),
        currency: ticketTierForm.currency || 'PLN',
        limit: ticketTierForm.limit ? Number(ticketTierForm.limit) : null,
        min_match_amount: ticketTierForm.min_match_amount ? Number(ticketTierForm.min_match_amount) : null,
        max_match_amount: ticketTierForm.max_match_amount ? Number(ticketTierForm.max_match_amount) : null,
        is_active: ticketTierForm.is_active !== false,
        requires_payment: ticketTierForm.requires_payment === true,
        auto_activate_after_signup: ticketTierForm.auto_activate_after_signup === true,
        payment_url: ticketTierForm.payment_url || null,
        internal_notes: ticketTierForm.internal_notes || null,
        sort_order: Number(ticketTierForm.sort_order || 0),
        access_streaming: ticketTierForm.access_streaming === true,
        access_vip_zone: ticketTierForm.access_vip_zone === true,
        includes_catering: ticketTierForm.includes_catering !== false,
        includes_gadget: ticketTierForm.includes_gadget !== false,
      }
      const { error } = isEditingTicketTier && ticketTierForm.id
        ? await supabase.from('ticket_tiers').update(data).eq('id', ticketTierForm.id)
        : await supabase.from('ticket_tiers').insert([data])
      if (error) throw error
      await loadEventData()
      setIsTicketTierModalOpen(false)
      setTicketTierForm({})
      showNotification('Typ biletu zapisany', 'success')
    } catch (err: any) {
      showNotification('Błąd zapisu biletu: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTicketTier = async (tierId: string) => {
    if (!confirm('Usunąć ten typ biletu?')) return
    try {
      const { error } = await supabase.from('ticket_tiers').delete().eq('id', tierId)
      if (error) throw error
      await loadEventData()
      showNotification('Typ biletu usunięty', 'success')
    } catch (err: any) {
      showNotification('Błąd usuwania biletu: ' + err.message, 'error')
    }
  }

  const handleToggleTicketTier = async (tier: any) => {
    try {
      const { error } = await supabase.from('ticket_tiers').update({ is_active: tier.is_active === false }).eq('id', tier.id)
      if (error) throw error
      await loadEventData()
      showNotification(tier.is_active === false ? 'Typ biletu aktywny' : 'Typ biletu wyłączony', 'success')
    } catch (err: any) {
      showNotification('Błąd zmiany statusu biletu: ' + err.message, 'error')
    }
  }

  const updateTicketApplication = async (appId: string, updates: any, message: string) => {
    try {
      const { error } = await supabase.from('b2b_applications').update(updates).eq('id', appId)
      if (error) throw error
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, ...updates } : app))
      showNotification(message, 'success')
    } catch (err: any) {
      showNotification('Błąd aktualizacji zgłoszenia: ' + err.message, 'error')
    }
  }

  const markTicketPaid = (app: any) => updateTicketApplication(app.id, {
    payment_status: 'paid',
    ticket_status: 'paid',
    ticket_paid_amount: Number(app.ticket_expected_amount || 0),
    payment_matched_by: 'manual',
    payment_matched_at: new Date().toISOString()
  }, 'Oznaczono jako opłacone')


  // --- FUNKCJA: IMPORT I AUTO-MATCHING WYCIĄGÓW BANKOWYCH ---
  const handleImportBankStatement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUpdating(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

      let matchCount = 0

      // Przechodzimy przez każdy wiersz z pliku bankowego/Bramki
      for (const row of rows) {
        const rowString = JSON.stringify(row).toLowerCase()

        // Szukamy pasującej aplikacji po Emailu, Nazwisku lub Referencji
        const matchedApp = applications.find(app => {
          const refMatch = app.payment_reference && rowString.includes(app.payment_reference.toLowerCase())
          const emailMatch = app.email && rowString.includes(app.email.toLowerCase())
          const nameMatch = app.last_name && rowString.includes(app.last_name.toLowerCase())

          return refMatch || emailMatch || nameMatch
        })

        // Jeśli znaleziono uczestnika i nie jest jeszcze opłacony
        if (matchedApp && matchedApp.payment_status !== 'paid') {
          // Używamy Twojej już istniejącej funkcji updateTicketApplication
          await updateTicketApplication(matchedApp.id, {
            payment_status: 'paid',
            ticket_status: 'paid',
            ticket_paid_amount: Number(matchedApp.ticket_expected_amount || 0),
            payment_matched_by: 'auto_import',
            payment_matched_at: new Date().toISOString()
          }, `Zaimportowano wpłatę dla: ${matchedApp.first_name} ${matchedApp.last_name}`)
          matchCount++
        }
      }

      showNotification(`Zakończono analizę pliku. Dopasowano automatycznie ${matchCount} płatności.`, 'success')
      await loadEventData() // Odświeżamy dane po imporcie

    } catch (err: any) {
      showNotification('Błąd odczytu pliku z wyciągiem: ' + err.message, 'error')
    } finally {
      setUpdating(false)
      if (e.target) e.target.value = '' // Reset inputu pliku
    }
  }

  const activateTicketParticipant = (app: any) => updateTicketApplication(app.id, {
    access_status: 'active',
    is_active_participant: true,
    status: 'approved'
  }, 'Uczestnik aktywowany')

  const waitlistTicketParticipant = (app: any) => updateTicketApplication(app.id, {
    access_status: 'waitlist',
    ticket_status: 'waitlist',
    is_active_participant: false,
    status: 'pending'
  }, 'Przeniesiono na listę rezerwową')

  const cancelTicketParticipant = (app: any) => updateTicketApplication(app.id, {
    access_status: 'cancelled',
    ticket_status: 'cancelled',
    is_active_participant: false,
    status: 'rejected'
  }, 'Zgłoszenie anulowane')

  const resetTicketParticipant = (app: any) => updateTicketApplication(app.id, {
    access_status: 'pending',
    ticket_status: 'new',
    is_active_participant: false,
    status: 'pending'
  }, 'Cofnięto do oczekujących')

  const handleSaveApplicationTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const updates: any = {
        ticket_tier_id: ticketApplicationForm.ticket_tier_id || null,
        ticket_type: ticketApplicationForm.ticket_type || null,
        ticket_expected_amount: Number(ticketApplicationForm.ticket_expected_amount || 0),
        ticket_paid_amount: Number(ticketApplicationForm.ticket_paid_amount || 0),
        payment_status: ticketApplicationForm.payment_status || 'not_required',
        ticket_status: ticketApplicationForm.ticket_status || 'new',
        access_status: ticketApplicationForm.access_status || 'pending',
        payment_reference: ticketApplicationForm.payment_reference || null,
      }
      if ('notes' in ticketApplicationForm) updates.notes = ticketApplicationForm.notes || null
      const { error } = await supabase.from('b2b_applications').update(updates).eq('id', ticketApplicationForm.id)
      if (error) throw error
      setApplications(prev => prev.map(app => app.id === ticketApplicationForm.id ? { ...app, ...updates } : app))
      setIsTicketApplicationModalOpen(false)
      showNotification('Dane biletu zgłoszenia zapisane', 'success')
    } catch (err: any) {
      showNotification('Błąd zapisu zgłoszenia: ' + err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }
 const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        first_name: patientForm.first_name,
        last_name: patientForm.last_name,
        pesel: patientForm.pesel,
        email: patientForm.email || null,
        phone: patientForm.phone || null,
        status: patientForm.status || 'active'
      };

      if (isEditingPatient && patientForm.id) {
        const { error } = await supabase.from('patients').update(payload).eq('id', patientForm.id);
        if (error) throw error;
        showNotification('Dane pacjenta zaktualizowane', 'success');
      } else {
        const { error } = await supabase.from('patients').insert([payload]);
        if (error) throw error;
        showNotification('Nowy pacjent dodany do bazy', 'success');
      }

      await loadPatients(); // Odświeżamy główną bazę!
      setIsPatientModalOpen(false);
      setPatientForm({});
    } catch (err: any) {
      showNotification('Błąd zapisu pacjenta: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Usunąć tego pacjenta i całą jego dokumentację? Tej operacji nie można cofnąć.')) return;
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      await loadPatients();
      showNotification('Pacjent usunięty', 'success');
    } catch (err: any) {
      showNotification('Błąd usuwania pacjenta: ' + err.message, 'error');
    }
  };

  const handleUpdatePatientPortalRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('patient_portal_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (error) return showNotification('Błąd aktualizacji zgłoszenia: ' + error.message, 'error')
    await loadPatientPortalRequests()
    showNotification('Zgłoszenie pacjenta zaktualizowane', 'success')
  }

  const generateReceptionReplyDraft = (request: any) => {
    const patientName = `${request.patients?.first_name || ''} ${request.patients?.last_name || ''}`.trim()
    const greeting = patientName ? `Dzień dobry Panie/Pani ${patientName},` : 'Dzień dobry,'
    const context = request.request_type === 'appointment_request'
      ? 'dziękujemy za wiadomość w sprawie umówienia wizyty. Sprawdzimy najbliższe dostępne terminy i wrócimy z propozycją.'
      : request.request_type === 'followup_request'
        ? 'dziękujemy za wiadomość w sprawie konsultacji kontrolnej. Przekażemy informację do zespołu medycznego i pomożemy ustalić dalszy krok.'
        : 'dziękujemy za opisanie sytuacji po zabiegu. Przekażemy wiadomość do osoby prowadzącej i wrócimy z informacją, co zrobić dalej.'

    return `${greeting}\n\n${context}\n\nJeśli objawy są nagłe, nasilają się albo budzą niepokój, prosimy o pilny kontakt telefoniczny z kliniką lub najbliższą pomocą medyczną.\n\nPozdrawiamy serdecznie,\nRecepcja ClinicOps`
  }

  const handleGeneratePatientReplyDraft = async (request: any) => {
    setAiReplyLoadingId(request.id)
    try {
      setPatientReplyDrafts(prev => ({
        ...prev,
        [request.id]: generateReceptionReplyDraft(request),
      }))
      showNotification('AI przygotowało uprzejmy szkic odpowiedzi do edycji.', 'success')
    } finally {
      setAiReplyLoadingId(null)
    }
  }

  const handleSendPatientReply = async (request: any) => {
    const reply = (patientReplyDrafts[request.id] || '').trim()
    if (!reply) return showNotification('Wpisz odpowiedź dla pacjenta albo wygeneruj szkic AI.', 'error')

    setUpdating(true)
    try {
      const { error: messageError } = await supabase.from('patient_portal_messages').insert([{
        request_id: request.id,
        patient_id: request.patient_id,
        sender_type: 'staff',
        sender_name: 'Recepcja',
        body: reply,
      }])

      if (messageError) throw messageError

      const { error: requestError } = await supabase
        .from('patient_portal_requests')
        .update({ status: 'answered', response: reply, updated_at: new Date().toISOString() })
        .eq('id', request.id)

      if (requestError) {
        const fallback = await supabase
          .from('patient_portal_requests')
          .update({ status: 'answered', updated_at: new Date().toISOString() })
          .eq('id', request.id)
        if (fallback.error) throw fallback.error
      }

      setPatientReplyDrafts(prev => ({ ...prev, [request.id]: '' }))
      await Promise.all([loadPatientPortalRequests(), loadPatientPortalMessages()])
      showNotification('Odpowiedź zapisana i widoczna w Portalu Pacjenta.', 'success')
    } catch (err: any) {
      showNotification('Błąd wysyłania odpowiedzi: ' + (err?.message || 'nieznany błąd'), 'error')
    } finally {
      setUpdating(false)
    }
  }

  // --- FUNKCJA: ZAPIS JAKO SZABLON ---
  const handleSaveAsTemplate = async () => {
    const templateName = prompt('Podaj nazwę dla szablonu:', `${event?.title} - Szablon`);
    if (!templateName) return;

    setUpdating(true);
    try {
      const config = {
        sessions, meals, unitCosts,
        dressCode: { title: editForm.dc_title, ladies: editForm.dc_ladies, gents: editForm.dc_gents }
      };

      const { error } = await supabase.from('event_templates').insert([{
        event_id: id,
        name: templateName,
        config: config
      }]);

      if (error) throw error;
      showNotification('Szablon został zapisany pomyślnie!', 'success');
    } catch (err: any) {
      showNotification('Błąd zapisu: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };


 const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const bId = event?.business_id || 'general';
      const updates = { ...editForm };
      const oldFileUrlsToDelete: string[] = [];

      // KLUCZOWE: Prefixy w kluczach (np. image_1_url) muszą być IDENTYCZNE jak nazwy kolumn w Supabase
      const filesToUpload = [
  { key: 'cover_image_url', file: newFiles.cover, prefix: 'cover' },
  { key: 'logo_url', file: newFiles.logo, prefix: 'logo' },
  { key: 'image_1_url', file: newFiles.img1, prefix: 'img1' },
  { key: 'image_2_url', file: newFiles.img2, prefix: 'img2' },
  { key: 'image_3_url', file: newFiles.img3, prefix: 'img3' },
  { key: 'page_bg_image_url', file: newFiles.pageBg, prefix: 'pagebg' },
  { key: 'rsvp_image_url', file: newFiles.rsvpImg, prefix: 'rsvp' },
  { key: 'transport_image_url', file: newFiles.transportImg, prefix: 'transport' },

  { key: 'theme_main_image_url', file: newFiles.themeMain, prefix: 'theme-main' },
  { key: 'theme_image_1_url', file: newFiles.themeImg1, prefix: 'theme-1' },
  { key: 'theme_image_2_url', file: newFiles.themeImg2, prefix: 'theme-2' },
  { key: 'theme_image_3_url', file: newFiles.themeImg3, prefix: 'theme-3' },
  { key: 'theme_image_4_url', file: newFiles.themeImg4, prefix: 'theme-4' }
];

      // 1. Upload plików równolegle
      const results = await Promise.all(
        filesToUpload.map(async (item) => {
          if (item.file) {
            const url = await uploadFile(item.file, bId, item.prefix);
            return { key: item.key, url };
          }
          return null;
        })
      );

      // 2. Przypisanie URL z Cache-Bustingiem
      results.forEach(res => {
        if (res?.url) {
          // Używamy backticków, aby dodać unikalny znacznik czasu
          const oldUrl = event?.[res.key] || editForm?.[res.key];
          if (oldUrl) oldFileUrlsToDelete.push(oldUrl);
          updates[res.key] = `${res.url}?t=${Date.now()}`;
        }
      });


      const { id: _id, created_at, business_id, ...cleanData } = updates;

      // Opcjonalnie: usuwamy puste pola techniczne, jeśli React je dodał
      delete (cleanData as any).event_sessions;

      // 4. Zapis do bazy danych
      const { error } = await supabase
        .from('b2b_events')
        .update(cleanData)
        .eq('id', id);

      if (error) throw error;

      // 5. Aktualizacja lokalnego stanu
      setEvent((prev: any) => ({ ...prev, ...updates }));
      setEditForm((prev: any) => ({ ...prev, ...updates }));
      await Promise.all(oldFileUrlsToDelete.map(url => deleteUploadedFile(url)));

      showNotification('Zmiany i multimedia zapisane!', 'success');

      // 6. Resetowanie stanu plików lokalnych

setNewFiles({
  cover: null,
  logo: null,
  img1: null,
  img2: null,
  img3: null,
  pageBg: null,
  rsvpImg: null,
  sessionImg: null,
  mealImg: null,
  transportImg: null,
  partnerPhoto: null,
  contractorInvoice: null,
  menuSectionImg: null,
  transportSectionImg: null,
  workshopsSectionImg: null,
  liveSectionImg: null,

  themeMain: null,
  themeImg1: null,
  themeImg2: null,
  themeImg3: null,
  themeImg4: null
});


    } catch (err: any) {
      console.error("Critical Update Error:", err);
      showNotification("Błąd: " + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      let imageUrl = sessionForm.image_url || null;
      if (newFiles.sessionImg) {
        imageUrl = await uploadFile(newFiles.sessionImg, id, 'session');
      }

      const data = {
        event_id: id,
        title: sessionForm.title,
        description: sessionForm.description,
        session_type: sessionForm.session_type || 'lecture',
        speaker_name: sessionForm.speaker_name,
        start_time: sessionForm.start_time,
        end_time: sessionForm.end_time,
        location: sessionForm.location,
        is_mandatory: sessionForm.is_mandatory || false,
        image_url: imageUrl
      };

      const { error } = sessionForm.id
        ? await supabase.from('event_sessions').update(data).eq('id', sessionForm.id)
        : await supabase.from('event_sessions').insert([data]);

      if (error) throw error;

      const { data: fresh } = await supabase.from('event_sessions').select('*').eq('event_id', id).order('start_time', { ascending: true });
      setSessions(fresh || []);
      setIsEditingSession(false);
      showNotification('Harmonogram zaktualizowany!', 'success');
    } catch (err: any) {
      showNotification('Błąd: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Usunąć tę sesję z harmonogramu?')) return;
    try {
      await supabase.from('event_sessions').delete().eq('id', sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      showNotification('Sesja usunięta', 'success');
    } catch (err: any) {
      showNotification('Błąd usuwania: ' + err.message, 'error');
    }
  };

const handleSavePartner = async (e: React.FormEvent) => {
  e.preventDefault();
  setUpdating(true);
  try {
    let photoUrl = null;
    if (newFiles.partnerPhoto) {
      photoUrl = await uploadFile(newFiles.partnerPhoto, id, 'partner');
    }
    const doctorDisplayName = `${partnerForm.first_name || ''} ${partnerForm.last_name || ''}`.trim();
    const data = {
      event_id: id,
      type: 'speaker',
      display_order: partnerForm.display_order || 0,
      is_visible: partnerForm.is_visible !== false,
      first_name: partnerForm.first_name,
      last_name: partnerForm.last_name,
      title: partnerForm.title,
      company: partnerForm.company,
      bio: partnerForm.bio,
      photo_url: photoUrl || partnerForm.photo_url,
      website_url: partnerForm.website_url,
      sponsor_name: doctorDisplayName || partnerForm.sponsor_name || null,
      sponsor_category: partnerForm.title || partnerForm.sponsor_category || null,
      logo_url: photoUrl || partnerForm.logo_url || partnerForm.photo_url || null,
    };
    let result;
    if (isEditingPartner && partnerForm.id) {
      result = await supabase.from('event_partners').update(data).eq('id', partnerForm.id);
    } else {
      result = await supabase.from('event_partners').insert([data]);
    }
    if (result.error) throw result.error;
    await loadPartners();
    setIsPartnerModalOpen(false);
    setPartnerForm({});
    setNewFiles({ ...newFiles, partnerPhoto: null });
    setIsEditingPartner(false);
    showNotification('Lekarz zapisany', 'success');
  } catch (err: any) { showNotification('Błąd zapisu lekarza: ' + (err?.message || 'nieznany błąd'), 'error'); } finally { setUpdating(false); }
};

const handleSavePreparation = async (e: React.FormEvent) => {
  e.preventDefault();
  setUpdating(true);
  try {
    let imageUrl = preparationForm.logo_url || preparationForm.photo_url || null;
    if (newFiles.partnerPhoto) {
      imageUrl = await uploadFile(newFiles.partnerPhoto, id, 'preparation');
    }

    const data = {
      event_id: id,
      type: 'sponsor',
      display_order: preparationForm.display_order || 0,
      is_visible: preparationForm.is_visible !== false,
      first_name: preparationForm.sponsor_name || null,
      last_name: '',
      title: preparationForm.sponsor_category || null,
      company: preparationForm.sponsor_category || null,
      sponsor_name: preparationForm.sponsor_name,
      sponsor_category: preparationForm.sponsor_category,
      bio: preparationForm.bio,
      logo_url: imageUrl,
      photo_url: imageUrl,
    };

    let result;
    if (isEditingPreparation && preparationForm.id) {
      result = await supabase.from('event_partners').update(data).eq('id', preparationForm.id);
    } else {
      result = await supabase.from('event_partners').insert([data]);
    }
    if (result.error) throw result.error;

    await loadPartners();
    setIsPreparationModalOpen(false);
    setPreparationForm({});
    setIsEditingPreparation(false);
    setNewFiles({ ...newFiles, partnerPhoto: null });
    showNotification('Preparat zapisany', 'success');
  } catch (err: any) {
    showNotification('Błąd zapisu preparatu: ' + (err?.message || 'nieznany błąd'), 'error');
  } finally {
    setUpdating(false);
  }
};

const handleDeletePartner = async (id: string) => {
  if (!confirm('Usunąć?')) return;
  try {
    const { error } = await supabase.from('event_partners').delete().eq('id', id);
    if (error) throw error;
    await loadPartners();
    showNotification('Usunięto', 'success');
  } catch (err: any) { showNotification('Błąd usuwania: ' + (err?.message || 'nieznany błąd'), 'error'); }
};

const loadChecklist = useCallback(async () => {
  const { data: groups } = await supabase
    .from('event_checklist_groups')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true })

  const { data: items } = await supabase
    .from('event_checklist_items')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true })

  setChecklistGroups(groups || [])
  setChecklistItems(items || [])
}, [id, supabase])

const handleSaveChecklistGroup = async (e: React.FormEvent) => {
  e.preventDefault()
  setUpdating(true)

  try {
    const data = {
      event_id: id,
      title: checklistGroupForm.title,
      description: checklistGroupForm.description || null,
      category: checklistGroupForm.category || 'general',
      color: checklistGroupForm.color || '#253a2a',
      icon: checklistGroupForm.icon || 'checklist',
      is_open: checklistGroupForm.is_open !== false,
      display_order: checklistGroupForm.display_order || checklistGroups.length
    }

    if (isEditingChecklistGroup && checklistGroupForm.id) {
      const { error } = await supabase
        .from('event_checklist_groups')
        .update(data)
        .eq('id', checklistGroupForm.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('event_checklist_groups')
        .insert([data])

      if (error) throw error
    }

    await loadChecklist()
    setIsChecklistGroupModalOpen(false)
    setIsEditingChecklistGroup(false)
    setChecklistGroupForm({})
    showNotification('Lista zapisana', 'success')
  } catch (err: any) {
    showNotification('Błąd zapisu listy: ' + err.message, 'error')
  } finally {
    setUpdating(false)
  }
}

const handleDeleteChecklistGroup = async (groupId: string) => {
  if (!confirm('Usunąć tę listę razem ze wszystkimi zadaniami?')) return

  try {
    const { error: itemsError } = await supabase
      .from('event_checklist_items')
      .delete()
      .eq('group_id', groupId)

    if (itemsError) throw itemsError

    const { error } = await supabase
      .from('event_checklist_groups')
      .delete()
      .eq('id', groupId)

    if (error) throw error

    await loadChecklist()
    showNotification('Lista usunięta', 'success')
  } catch (err: any) {
    showNotification('Błąd usuwania listy: ' + err.message, 'error')
  }
}

const handleSaveChecklistItem = async (e: React.FormEvent) => {
  e.preventDefault()
  setUpdating(true)

  try {
    const groupId = checklistItemForm.group_id || activeChecklistGroupId

    if (!groupId) {
      showNotification('Najpierw wybierz listę', 'error')
      return
    }

    const data = {
      event_id: id,
      group_id: groupId,
      title: checklistItemForm.title,
      notes: checklistItemForm.notes || null,
      status: checklistItemForm.status || 'todo',
      priority: checklistItemForm.priority || 'normal',
      due_date: checklistItemForm.due_date || null,
      assigned_to: checklistItemForm.assigned_to || null,
      estimated_cost: checklistItemForm.estimated_cost || 0,
      is_done: checklistItemForm.is_done || false,
      display_order: checklistItemForm.display_order || 0
    }

    if (isEditingChecklistItem && checklistItemForm.id) {
      const { error } = await supabase
        .from('event_checklist_items')
        .update(data)
        .eq('id', checklistItemForm.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('event_checklist_items')
        .insert([data])

      if (error) throw error
    }

    await loadChecklist()
    setIsChecklistItemModalOpen(false)
    setIsEditingChecklistItem(false)
    setChecklistItemForm({})
    setActiveChecklistGroupId(null)
    showNotification('Zadanie zapisane', 'success')
  } catch (err: any) {
    showNotification('Błąd zapisu zadania: ' + err.message, 'error')
  } finally {
    setUpdating(false)
  }
}

const handleToggleChecklistItem = async (item: any) => {
  try {
    const nextDone = !item.is_done

    const { error } = await supabase
      .from('event_checklist_items')
      .update({
        is_done: nextDone,
        status: nextDone ? 'done' : 'todo'
      })
      .eq('id', item.id)

    if (error) throw error

    setChecklistItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, is_done: nextDone, status: nextDone ? 'done' : 'todo' }
          : i
      )
    )
  } catch (err: any) {
    showNotification('Błąd aktualizacji zadania', 'error')
  }
}

const handleDeleteChecklistItem = async (itemId: string) => {
  if (!confirm('Usunąć to zadanie?')) return

  try {
    const { error } = await supabase
      .from('event_checklist_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    setChecklistItems(prev => prev.filter(i => i.id !== itemId))
    showNotification('Zadanie usunięte', 'success')
  } catch (err: any) {
    showNotification('Błąd usuwania zadania', 'error')
  }
}

const toggleChecklistGroupOpen = async (group: any) => {
  const nextOpen = !group.is_open

  setChecklistGroups(prev =>
    prev.map(g => g.id === group.id ? { ...g, is_open: nextOpen } : g)
  )

  await supabase
    .from('event_checklist_groups')
    .update({ is_open: nextOpen })
    .eq('id', group.id)
}
// ============================================================================
// ----- 4.5. EFEKT GŁÓWNY (ładowanie danych) -----
// ============================================================================
const loadEventData = useCallback(async () => {
    try {
      const { data: ev } = await supabase.from('b2b_events').select('*').eq('id', id).single()
      const { data: apps } = await supabase.from('b2b_applications').select('*').eq('event_id', id).order('created_at', { ascending: false })
      const { data: sess } = await supabase.from('event_sessions').select('*').eq('event_id', id).order('start_time', { ascending: true })
      const { data: tierData } = await supabase.from('ticket_tiers').select('*').eq('event_id', id).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      const { data: promoData } = await supabase.from('promo_codes').select('*').eq('event_id', id).order('created_at', { ascending: false })
     // const { data: speakerData } = await supabase.from('event_speakers').select('*').eq('event_id', id).order('created_at', { ascending: true })//
const { data: checklistGroupData } = await supabase
  .from('event_checklist_groups')
  .select('*')
  .eq('event_id', id)
  .order('display_order', { ascending: true })

const { data: checklistItemData } = await supabase
  .from('event_checklist_items')
  .select('*')
  .eq('event_id', id)
  .order('display_order', { ascending: true })

      const { data: partnerData } = await supabase.from('event_partners').select('*').eq('event_id', id).order('display_order', { ascending: true })
      const { data: contractorData } = await supabase.from('contractors').select('*').eq('event_id', id).order('created_at', { ascending: false })

      setEvent(ev)
      setEditForm(ev)
      setApplications(apps || [])
      setSessions(sess || [])
      setCateringOffers([])
      setEventVideos([])
      setMeals([])
      setTiers(tierData || [])
      setPromoCodes(promoData || [])
      //setSpeakers(speakerData || [])//
      setPartners(partnerData || [])
      setContractors(contractorData || [])
      setOrganizedRoutes([])
      setTransportStops([])
      setFleet([])
      setChecklistGroups(checklistGroupData || [])
      setChecklistItems(checklistItemData || [])
      await loadBudgetData()
      await loadEventPassData()
      await loadPatients()
      await loadPatientPortalRequests()
      await loadPatientPortalMessages()
      await loadPatientConsents()
      await loadConsentTemplates() // <--- DODANO TUTAJ
      await loadTreatmentsCatalog()
      await loadPartnersCatalog()
      await loadAppointments()

      setMenuItems(generateMockMenu())
      calculateEcoMetrics(apps || [])

    } catch (error) {
      showNotification('Błąd ładowania danych', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, supabase, loadBudgetData, loadEventPassData, loadPatients, loadPatientPortalRequests, loadPatientPortalMessages, loadPatientConsents, loadConsentTemplates])

  useEffect(() => {
    loadEventData()
  }, [loadEventData])

  useEffect(() => {
    loadEcoAiReport()
  }, [loadEcoAiReport])


// ============================================================================
// ----- 4.6. DANE POCHODNE I FILTRACJA -----
// ============================================================================
const transportAnalytics = useMemo(() => {
  const groups: Record<string, { total: number; guests: number; companions: number; kids: number }> = {};

  applications
    .filter(a => a.status === 'approved' && a.transport !== 'Własny dojazd' && a.transport_address)
    .forEach(app => {
      // Bezpieczne wyciągnięcie miasta - ostatni człon po przecinku, jeśli brak przecinka - całość
      const raw = app.transport_address.trim();
      const parts = raw.split(',');
      let city = parts.length > 1 ? parts.pop()?.trim() : raw;
      if (!city) city = 'Nieokreślone';

      const compCount = parseCompanionCount(app.companion);
      const kidsCount = parseKidsCount(app.kids);
      const totalForEntry = 1 + compCount + kidsCount;

      if (!groups[city]) {
        groups[city] = { total: 0, guests: 0, companions: 0, kids: 0 };
      }
      groups[city].total += totalForEntry;
      groups[city].guests += 1;
      groups[city].companions += compCount;
      groups[city].kids += kidsCount;
    });

  return groups;
}, [applications]);

  const attendeeUnitsByApplication = useMemo(() => {
    return attendeeUnits.reduce((acc: Record<string, any[]>, unit: any) => {
      if (!unit.application_id) return acc
      if (!acc[unit.application_id]) acc[unit.application_id] = []
      acc[unit.application_id].push(unit)
      return acc
    }, {})
  }, [attendeeUnits])

  const activeEventPassApplications = useMemo(() => applications.filter((app: any) =>
    app.access_status === 'active' ||
    app.is_active_participant === true ||
    app.status === 'approved' ||
    app.rsvp_status === 'potwierdzone'
  ), [applications])

  const eventPassApplications = useMemo(() => {
    const search = eventPassSearch.toLowerCase()
    return applications.filter((app: any) => {
      const units = attendeeUnitsByApplication[app.id] || []
      const unitMatchesSearch = units.some((unit: any) =>
        (unit.display_name || '').toLowerCase().includes(search) ||
        (unit.first_name || '').toLowerCase().includes(search) ||
        (unit.last_name || '').toLowerCase().includes(search)
      )

      const matchesSearch = !search ||
        `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase().includes(search) ||
        (app.email || '').toLowerCase().includes(search) ||
        (app.phone || '').toLowerCase().includes(search) ||
        (app.company_name || '').toLowerCase().includes(search) ||
        unitMatchesSearch

      const isActive = app.access_status === 'active' || app.is_active_participant === true || app.status === 'approved'
      const matchesFilter =
        eventPassFilterStatus === 'all' ||
        (eventPassFilterStatus === 'active' && isActive) ||
        (eventPassFilterStatus === 'no_units' && units.length === 0) ||
        (eventPassFilterStatus === 'checked_in' && units.some((unit: any) => unit.checked_in)) ||
        (eventPassFilterStatus === 'wristband_issued' && units.some((unit: any) => unit.wristband_issued))

      return matchesSearch && matchesFilter
    })
  }, [applications, attendeeUnitsByApplication, eventPassSearch, eventPassFilterStatus])

  const eventPassMetrics = useMemo(() => ({
    activeApplications: activeEventPassApplications.length,
    units: attendeeUnits.length,
    qrGenerated: attendeeUnits.filter((unit: any) => unit.qr_token).length,
    checkedIn: attendeeUnits.filter((unit: any) => unit.checked_in).length,
    wristbandsIssued: attendeeUnits.filter((unit: any) => unit.wristband_issued).length,
    wristbandsReturned: attendeeUnits.filter((unit: any) => unit.wristband_returned).length,
    staffAccess: staffAccessList.length,
  }), [activeEventPassApplications.length, attendeeUnits, staffAccessList.length])

  const eventPassOperationalReport = useMemo(() => {
    const totalUnits = attendeeUnits.length
    const checkedIn = attendeeUnits.filter((unit: any) => unit.checked_in).length
    const wristbandsIssued = attendeeUnits.filter((unit: any) => unit.wristband_issued).length
    const wristbandsReturned = attendeeUnits.filter((unit: any) => unit.wristband_returned).length
    const gadgetChoicesCount = attendeeGadgetChoices.filter((choice: any) => choice.declined_gadget !== true).length

    return {
      totalUnits,
      checkedIn,
      wristbandsIssued,
      wristbandsReturned,
      mealChoices: attendeeMealChoices.length,
      mealsRedeemed: mealRedemptions.length,
      gadgetChoices: gadgetChoicesCount,
      gadgetsRedeemed: gadgetRedemptions.length,
      transportChoices: attendeeTransportChoices.length,
      transportCheckins: transportCheckins.length,
    }
  }, [attendeeUnits, attendeeMealChoices, mealRedemptions, attendeeGadgetChoices, gadgetRedemptions, attendeeTransportChoices, transportCheckins])

  const getEventPassUnitDetails = (unit: any, app: any) => {
    const unitMealChoices = attendeeMealChoices.filter((choice: any) => choice.attendee_unit_id === unit?.id)
    const unitGadgetChoices = attendeeGadgetChoices.filter((choice: any) => choice.attendee_unit_id === unit?.id)
    const unitSessionSignups = attendeeSessionSignups.filter((choice: any) => choice.attendee_unit_id === unit?.id)
    const unitTransportChoice = attendeeTransportChoices.find((choice: any) => choice.attendee_unit_id === unit?.id)

    const fallbackGuestSelection = guestSelections.find((choice: any) => choice.application_id === unit?.application_id)
    const fallbackSessionIds = Array.isArray(fallbackGuestSelection?.selected_sessions)
      ? fallbackGuestSelection.selected_sessions
      : []
    const sourceData = typeof unit?.source_data === 'string'
      ? (() => {
          try {
            return JSON.parse(unit.source_data)
          } catch {
            return {}
          }
        })()
      : (unit?.source_data || {})
    const sourceDataGadgetChoices = Array.isArray(sourceData?.selectedGadgetIds)
      ? sourceData.selectedGadgetIds
          .filter(Boolean)
          .map((gadgetId: string) => ({
            event_id: unit?.event_id,
            application_id: unit?.application_id,
            attendee_unit_id: unit?.id,
            gadget_id: gadgetId,
            quantity: 1,
            status: 'selected',
            declined_gadget: false,
            source: 'attendee_unit_source_data'
          }))
      : []
    const sourceDataSessionRows = Array.isArray(sourceData?.selectedSessionIds)
      ? sourceData.selectedSessionIds
          .filter(Boolean)
          .map((sessionId: string) => ({
            event_id: unit?.event_id,
            application_id: unit?.application_id,
            attendee_unit_id: unit?.id,
            session_id: sessionId,
            status: 'signed_up',
            source: 'attendee_unit_source_data'
          }))
      : []

    const mealChoices = unitMealChoices
    const gadgetChoiceRows = unitGadgetChoices.length > 0 ? unitGadgetChoices : sourceDataGadgetChoices
    const sessionRows = unitSessionSignups.length > 0
      ? unitSessionSignups
      : sourceDataSessionRows.length > 0
        ? sourceDataSessionRows
        : fallbackSessionIds.map((sessionId: string) => ({ session_id: sessionId }))

    return {
      meals: mealChoices.map((choice: any) => ({
        ...choice,
        label: meals.find((meal: any) => meal.id === choice.meal_id)?.name || choice.meal_id || 'Posiłek'
      })),
      gadgets: gadgetChoiceRows.map((choice: any) => ({
        ...choice,
        label: choice.gadget_id || 'Pakiet'
      })),
      sessions: sessionRows.map((choice: any) => ({
        ...choice,
        label: sessions.find((session: any) => session.id === choice.session_id)?.title || choice.session_id || 'Sesja'
      })),
      transport: unitTransportChoice || {
        transport: app?.transport,
        transport_address: app?.transport_address,
        notes: app?.extra_notes
      }
    }
  }

  const activeBudgetItems = useMemo(() => budgetItems.filter((item: any) => item.is_active !== false), [budgetItems])
  const activeParticipants = useMemo(() => applications.filter((app: any) =>
    app.access_status === 'active' || app.is_active_participant === true || app.status === 'approved'
  ), [applications])

  const transportCarpoolStats = {
    activeCarpoolAds: 0,
    availableCarpoolSeats: 0,
    realCarpoolingChoices: 0,
    unusedPotential: 0,
    attendeeCarpoolChoices: [],
    applicationCarpoolChoices: []
  }

  const budgetSummary = useMemo(() => {
    const plannedBudget = budgetCategories.reduce((sum, category: any) => sum + Number(category.planned_budget || 0), 0)
    const expenses = activeBudgetItems.filter((item: any) => item.type === 'expense')
    const income = activeBudgetItems.filter((item: any) => item.type === 'income')
    const totalExpenses = expenses.reduce((sum, item: any) => sum + Number(item.gross_amount || 0), 0)
    const totalIncome = income.reduce((sum, item: any) => sum + Number(item.gross_amount || 0), 0)
    const paidExpenses = expenses.reduce((sum, item: any) => sum + Number(item.paid_amount || 0), 0)
    const unpaidExpenses = expenses.reduce((sum, item: any) => sum + Math.max(Number(item.gross_amount || 0) - Number(item.paid_amount || 0), 0), 0)
    const receivedIncome = income.reduce((sum, item: any) => sum + Number(item.paid_amount || 0), 0)
    const totalVat = activeBudgetItems.reduce((sum, item: any) => sum + Number(item.vat_amount || 0), 0)
    const eventResult = totalIncome - totalExpenses
    const costPerParticipant = activeParticipants.length ? totalExpenses / activeParticipants.length : 0
    const savings = plannedBudget - totalExpenses
    return { plannedBudget, totalExpenses, totalIncome, paidExpenses, unpaidExpenses, receivedIncome, totalVat, eventResult, costPerParticipant, savings, isOverBudget: plannedBudget > 0 && totalExpenses > plannedBudget }
  }, [activeBudgetItems, budgetCategories, activeParticipants])

  const clinicAnalytics = useMemo(() => {
    const visits = appointmentsList || []
    const totalVisitValue = visits.reduce((sum: number, app: any) => sum + Number(app.price_amount || 0), 0)
    const paidVisitValue = visits.reduce((sum: number, app: any) => {
      const price = Number(app.price_amount || 0)
      return sum + Number(app.paid_amount ?? (app.payment_status === 'paid' ? price : 0))
    }, 0)
    const unpaidVisitValue = visits.reduce((sum: number, app: any) => {
      const price = Number(app.price_amount || 0)
      const paid = Number(app.paid_amount ?? (app.payment_status === 'paid' ? price : 0))
      return sum + Math.max(price - paid, 0)
    }, 0)
    const scheduledVisits = visits.filter((app: any) => app.status !== 'cancelled').length
    const avgVisitValue = scheduledVisits ? totalVisitValue / scheduledVisits : 0
    const expenses = activeBudgetItems.filter((item: any) => item.type === 'expense')
    const totalClinicCosts = expenses.reduce((sum: number, item: any) => sum + Number(item.gross_amount || 0), 0)
    const operatingResult = paidVisitValue - totalClinicCosts
    const appointmentCountsByPatient = visits.reduce((acc: Record<string, number>, app: any) => {
      if (app.patient_id) acc[app.patient_id] = (acc[app.patient_id] || 0) + 1
      return acc
    }, {})
    const returningPatientIds = new Set([
      ...patients.filter((p: any) => Number(p.total_visits || 0) > 1).map((p: any) => p.id),
      ...Object.entries(appointmentCountsByPatient).filter(([, count]) => Number(count) > 1).map(([patientId]) => patientId)
    ])
    const newPatients30d = patients.filter((p: any) => p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    const returningPatients = returningPatientIds.size
    const returnRate = patients.length ? Math.round((returningPatients / patients.length) * 100) : 0

    const treatmentRows = Object.values(visits.reduce((acc: Record<string, any>, app: any) => {
      const key = app.treatment_id || app.treatment_name || 'unknown'
      if (!acc[key]) {
        acc[key] = { id: key, name: app.treatment_name || treatments.find((t: any) => t.id === app.treatment_id)?.name || 'Zabieg bez nazwy', count: 0, value: 0, paid: 0 }
      }
      const price = Number(app.price_amount || 0)
      const paid = Number(app.paid_amount ?? (app.payment_status === 'paid' ? price : 0))
      acc[key].count += 1
      acc[key].value += price
      acc[key].paid += paid
      return acc
    }, {})).sort((a: any, b: any) => b.count - a.count || b.value - a.value)

    const doctorRows = Object.values(visits.reduce((acc: Record<string, any>, app: any) => {
      const key = app.doctor_id || 'unassigned'
      const doctor = doctorsList.find((d: any) => d.id === app.doctor_id)
      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: doctor ? `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() : 'Bez lekarza',
          count: 0,
          value: 0,
          paid: 0
        }
      }
      const price = Number(app.price_amount || 0)
      const paid = Number(app.paid_amount ?? (app.payment_status === 'paid' ? price : 0))
      acc[key].count += 1
      acc[key].value += price
      acc[key].paid += paid
      return acc
    }, {})).sort((a: any, b: any) => b.value - a.value)

    return {
      totalVisitValue,
      paidVisitValue,
      unpaidVisitValue,
      scheduledVisits,
      avgVisitValue,
      totalClinicCosts,
      operatingResult,
      newPatients30d,
      returningPatients,
      returnRate,
      treatmentRows,
      doctorRows
    }
  }, [appointmentsList, activeBudgetItems, patients, treatments, doctorsList])

  const categorySummaries = useMemo(() => budgetCategories.map((category: any) => {
    const items = activeBudgetItems.filter((item: any) => item.category === category.slug && item.type === 'expense')
    const plannedBudget = Number(category.planned_budget || 0)
    const usedBudget = items.reduce((sum, item: any) => sum + Number(item.gross_amount || 0), 0)
    const paidAmount = items.reduce((sum, item: any) => sum + Number(item.paid_amount || 0), 0)
    const unpaidAmount = items.reduce((sum, item: any) => sum + Math.max(Number(item.gross_amount || 0) - Number(item.paid_amount || 0), 0), 0)
    const remainingBudget = plannedBudget - usedBudget
    const usagePercent = plannedBudget ? Math.round((usedBudget / plannedBudget) * 100) : 0
    return {
      ...category,
      planned_budget: plannedBudget,
      used_budget: usedBudget,
      paid_amount: paidAmount,
      unpaid_amount: unpaidAmount,
      remaining_budget: remainingBudget,
      usage_percent: usagePercent,
      item_count: items.length,
      status: plannedBudget === 0 ? 'neutral' : remainingBudget < 0 ? 'over' : remainingBudget > 0 ? 'saving' : 'neutral'
    }
  }), [budgetCategories, activeBudgetItems])

  const filteredBudgetItems = useMemo(() => {
    const search = budgetSearch.toLowerCase()
    return activeBudgetItems.filter((item: any) => {
      const matchesSearch = !search ||
        (item.title || '').toLowerCase().includes(search) ||
        (item.description || '').toLowerCase().includes(search) ||
        (item.category || '').toLowerCase().includes(search) ||
        (item.source_type || '').toLowerCase().includes(search)
      const matchesCategory = budgetFilterCategory === 'all' || item.category === budgetFilterCategory
      const matchesType = budgetFilterType === 'all' || item.type === budgetFilterType
      const matchesPayment = budgetFilterPaymentStatus === 'all' || item.payment_status === budgetFilterPaymentStatus
      const matchesSource = budgetFilterSource === 'all' || item.source_type === budgetFilterSource
      return matchesSearch && matchesCategory && matchesType && matchesPayment && matchesSource
    })
  }, [activeBudgetItems, budgetSearch, budgetFilterCategory, budgetFilterType, budgetFilterPaymentStatus, budgetFilterSource])

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' ||
        (app.first_name || '').toLowerCase().includes(search) ||
        (app.last_name || '').toLowerCase().includes(search) ||
        (app.company_name || '').toLowerCase().includes(search)
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [applications, searchTerm, filterStatus])

  const getTicketTierForApplication = useCallback((app: any) => {
    return tiers.find(tier => tier.id === app.ticket_tier_id)
  }, [tiers])

  const isTicketActive = (app: any) => app.access_status === 'active' || app.is_active_participant === true

  const ticketMetrics = useMemo(() => {
    const active = applications.filter(isTicketActive).length
    const waitingPayment = applications.filter((app: any) => app.payment_status === 'unpaid' || app.ticket_status === 'waiting_payment').length
    const paid = applications.filter((app: any) => app.payment_status === 'paid' || app.ticket_status === 'paid').length
    const waitlist = applications.filter((app: any) => app.access_status === 'waitlist' || app.ticket_status === 'waitlist').length
    return { active, waitingPayment, paid, waitlist }
  }, [applications])

  const filteredTicketApplications = useMemo(() => {
    const search = ticketSearch.toLowerCase()
    return applications.filter((app: any) => {
      const tier = tiers.find(t => t.id === app.ticket_tier_id)
      const matchesSearch = !search ||
        (app.first_name || '').toLowerCase().includes(search) ||
        (app.last_name || '').toLowerCase().includes(search) ||
        (app.email || '').toLowerCase().includes(search) ||
        (app.phone || '').toLowerCase().includes(search) ||
        (app.company_name || '').toLowerCase().includes(search)
      const matchesPayment = ticketPaymentFilter === 'all' || app.payment_status === ticketPaymentFilter
      const matchesAccess = ticketAccessFilter === 'all' || app.access_status === ticketAccessFilter
      const matchesTier = ticketTierFilter === 'all' || app.ticket_tier_id === ticketTierFilter || app.ticket_type === ticketTierFilter || tier?.name === ticketTierFilter
      return matchesSearch && matchesPayment && matchesAccess && matchesTier
    })
  }, [applications, tiers, ticketSearch, ticketPaymentFilter, ticketAccessFilter, ticketTierFilter])

  const pendingApps = applications.filter(a => a.status === 'pending')
  const approvedApps = applications.filter(a => a.status === 'approved')
  const rejectedApps = applications.filter(a => a.status === 'rejected')

  const aiEcoAnalysis = useMemo(() => {
    const safeApplications = Array.isArray(applications) ? applications : []
    const safeApprovedApps = Array.isArray(approvedApps) ? approvedApps : []
    const safeMeals = Array.isArray(meals) ? meals : []
    const safeCarpoolingAds = Array.isArray(carpoolingAds) ? carpoolingAds : []
    const safeFleet = Array.isArray(fleet) ? fleet : []
    const safeContractors = Array.isArray(contractors) ? contractors : []
    const safeCateringOffers = Array.isArray(cateringOffers) ? cateringOffers : []
    const safeBudgetItems = Array.isArray(budgetItems) ? budgetItems : []

    const totalApplications = safeApplications.length
    const approvedCount = safeApprovedApps.length

    const isConfirmedRsvp = (value: any) =>
      ['confirmed', 'potwierdzone', 'accepted', 'yes', 'tak', 'true'].includes(
        String(value || '').toLowerCase()
      )

    const confirmedRsvp = safeApplications.filter((app: any) =>
      isConfirmedRsvp(app.rsvp_status || app.status || app.access_status)
    ).length

    const activeParticipantsCount =
      approvedCount ||
      safeApplications.filter((app: any) =>
        ['active', 'accepted', 'approved', 'zaakceptowane', 'zaakceptowany'].includes(
          String(app.access_status || app.status || '').toLowerCase()
        )
      ).length ||
      totalApplications

    const avoidedPrintsCount = Math.max(
      (totalApplications * 3) + activeParticipantsCount,
      0
    )
    const paperSavedKg = Number((avoidedPrintsCount * 0.005).toFixed(1))
    const digitalInvitesCo2Saved = Number((totalApplications * 0.16).toFixed(1))

    const realCarpoolingChoices = Number(transportCarpoolStats.realCarpoolingChoices || 0)
    const activeCarpoolAds = Number(transportCarpoolStats.activeCarpoolAds || 0)
    const carpoolSeats = realCarpoolingChoices

    const fleetCapacity = safeFleet.reduce(
      (sum: number, vehicle: any) =>
        sum + Number(vehicle.capacity || vehicle.seats || vehicle.max_passengers || 0),
      0
    )

    const transportEfficiency =
      fleetCapacity > 0
        ? Math.min(100, Math.round((activeParticipantsCount / fleetCapacity) * 100))
        : realCarpoolingChoices > 0
          ? Math.min(100, Math.round((realCarpoolingChoices / Math.max(activeParticipantsCount, 1)) * 100))
          : 0

    const transportCo2Saved = Number(((realCarpoolingChoices * 2.4) + (fleetCapacity > 0 ? 1.8 : 0)).toFixed(1))
    const plasticCo2Saved = Number((activeParticipantsCount * 0.1).toFixed(1))

    const vegeMeals = safeMeals.filter((meal: any) => {
      const text = `${meal.dietary_category || ''} ${meal.meal_type || ''} ${meal.name || ''}`.toLowerCase()

      return ['vege', 'vegetarian', 'wegetariań', 'vegan', 'wegan', 'plant'].some((word) =>
        text.includes(word)
      )
    }).length

    const menuCo2Saved = Number((vegeMeals * 1.2).toFixed(1))

    const gadgetOverstockCount = 0
    const gadgetWasteRisk = 0
    const gadgetsCo2Saved = 0

    const foodWastePortionsRisk = totalApplications > 0
      ? Math.max(totalApplications - confirmedRsvp, 0)
      : 0

    const foodWasteRisk =
      totalApplications > 0
        ? Math.round(((totalApplications - confirmedRsvp) / totalApplications) * 100)
        : 0

    const localSuppliersCount = safeContractors.filter((contractor: any) => {
      const localFlag =
        contractor.is_local === true ||
        contractor.local_supplier === true ||
        contractor.local === true

      const ecoScore = Number(contractor.eco_score || contractor.sustainability_score || 0)

      return localFlag || ecoScore >= 70
    }).length

    const localBudgetShare = safeContractors.length > 0
      ? Math.round((localSuppliersCount / safeContractors.length) * 100)
      : 0

    const proEcoDecisions = [
      totalApplications > 0,
      realCarpoolingChoices > 0,
      vegeMeals > 0,
      localSuppliersCount > 0,
      safeCateringOffers.length > 0,
      safeBudgetItems.length > 0,
      event?.eventpass_qr_visible === true || event?.eventpass_qr_visible === 'true'
    ].filter(Boolean).length

    const totalCo2Saved = Number((
      digitalInvitesCo2Saved +
      transportCo2Saved +
      plasticCo2Saved +
      menuCo2Saved +
      gadgetsCo2Saved
    ).toFixed(1))

    const estimatedCostSavings = Math.max(Math.round(
      (avoidedPrintsCount * 0.5) +
      (foodWastePortionsRisk * 45 * 0.35)
    ), 0)

    const circularityScore = Math.min(100, [
      avoidedPrintsCount > 0 ? 20 : 0,
      confirmedRsvp > 0 && foodWasteRisk < 25 ? 20 : 0,
      realCarpoolingChoices > 0 || transportEfficiency > 50 ? 20 : 0,
      vegeMeals > 0 ? 15 : 0,
      localSuppliersCount > 0 ? 15 : 0,
      avoidedPrintsCount > 0 ? 10 : 0
    ].reduce((sum, value) => sum + value, 0))

    const resolveScore = {
      virtualize: Math.min(100, avoidedPrintsCount > 0 ? 85 : 30),
      optimizeShare: Math.min(100, Math.round((transportEfficiency + (100 - foodWasteRisk)) / 2)),
      loop: Math.min(100, Math.max(0, 100 - gadgetWasteRisk)),
      exchange: Math.min(100, proEcoDecisions * 15),
      regenerate: Math.min(100, (localSuppliersCount * 20) + (vegeMeals * 8))
    }

    const treesEquivalent = Math.max(Math.round(totalCo2Saved / 21), 0)
    const kmEquivalent = Math.max(Math.round(totalCo2Saved / 0.2), 0)

    const recommendations: any[] = []

    if (foodWasteRisk > 25) {
      recommendations.push({
        title: 'Domknij RSVP przed zamówieniem cateringu',
        description: 'Część osób nie potwierdziła obecności, co zwiększa ryzyko nadwyżek jedzenia.',
        impact: 'wysoki',
        co2: 'średnia redukcja',
        actionLabel: 'Przejdź do zgłoszeń',
        area: 'RSVP'
      })
    }

    if (foodWastePortionsRisk > 0) {
      recommendations.push({
        title: 'Doprecyzuj liczbę porcji przed zamówieniem cateringu',
        description: `Szacunkowo ${foodWastePortionsRisk} porcji jest jeszcze obarczonych ryzykiem przez brak potwierdzenia RSVP.`,
        impact: 'wysoki',
        co2: 'redukcja food waste',
        actionLabel: 'Sprawdź RSVP',
        area: 'Catering'
      })
    }

    if (avoidedPrintsCount < totalApplications) {
      recommendations.push({
        title: 'Przenieś więcej materiałów do wersji cyfrowej',
        description: 'Im więcej informacji trafia na stronę uczestnika i Event Pass, tym mniej wydruków trzeba przygotować.',
        impact: 'średni',
        co2: 'papier i transport',
        actionLabel: 'Przejdź do strony uczestnika',
        area: 'Materiały'
      })
    }

    if (realCarpoolingChoices === 0 && activeParticipantsCount > 10) {
      recommendations.push({
        title: 'Uruchom carpooling lub transport zbiorowy',
        description: 'Przy większej liczbie uczestników transport zwykle ma największy wpływ na emisje.',
        impact: 'wysoki',
        co2: 'wysoka redukcja',
        actionLabel: 'Przejdź do transportu',
        area: 'Transport'
      })
    }

    if (realCarpoolingChoices === 0 && activeCarpoolAds > 0) {
      recommendations.push({
        title: 'Przypomnij gościom o wspólnych przejazdach',
        description: 'Masz aktywne ogłoszenia carpooling, ale brak potwierdzonych wyborów uczestników.',
        impact: 'średni',
        co2: 'transport współdzielony',
        actionLabel: 'Przejdź do transportu',
        area: 'Transport'
      })
    }

    if (localSuppliersCount === 0 && safeContractors.length > 0) {
      recommendations.push({
        title: 'Dodaj lokalnych podwykonawców',
        description: 'Lokalni dostawcy mogą ograniczyć transport, koszty logistyczne i emisje.',
        impact: 'średni',
        co2: 'średnia redukcja',
        actionLabel: 'Przejdź do podwykonawców',
        area: 'Podwykonawcy'
      })
    }

    if (localBudgetShare < 30 && safeContractors.length > 0) {
      recommendations.push({
        title: 'Zwiększ udział lokalnych dostawców w budżecie',
        description: 'Lokalni podwykonawcy mogą obniżyć logistykę, czas dostaw i emisje związane z transportem usług.',
        impact: 'średni',
        co2: 'logistyka lokalna',
        actionLabel: 'Przejdź do podwykonawców',
        area: 'Budżet'
      })
    }

    if (safeMeals.length > 0 && vegeMeals / safeMeals.length < 0.3) {
      recommendations.push({
        title: 'Zwiększ udział menu roślinnego',
        description: 'Większy udział opcji vege lub vegan może ograniczyć ślad środowiskowy cateringu.',
        impact: 'średni',
        co2: 'średnia redukcja',
        actionLabel: 'Przejdź do menu',
        area: 'Menu'
      })
    }

    if (circularityScore < 60) {
      recommendations.push({
        title: 'Podnieś wynik GOZ przez RSVP, carpooling i lokalnych dostawców',
        description: 'Największy efekt dadzą: domknięcie listy obecności, transport współdzielony oraz lokalny łańcuch dostaw.',
        impact: 'wysoki',
        co2: 'systemowa redukcja',
        actionLabel: 'Zobacz analizę obszarów',
        area: 'GOZ'
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Brak krytycznych ryzyk',
        description: 'Na podstawie aktualnych danych AI Eco Engine nie wykrył pilnych ryzyk środowiskowych.',
        impact: 'niski',
        co2: 'monitoring',
        actionLabel: 'Kontynuuj monitoring',
        area: 'AI Eco'
      })
    }

    const areas = [
      {
        name: 'Transport',
        status: transportEfficiency > 60 || realCarpoolingChoices > 0 ? 'dobrze' : 'wymaga uwagi',
        value: `${transportEfficiency}%`,
        description: realCarpoolingChoices > 0
          ? 'Wykryto realne wybory carpooling lub transport współdzielony.'
          : 'Warto zachęcić uczestników do wspólnych przejazdów.'
      },
      {
        name: 'RSVP / Catering',
        status: foodWasteRisk > 25 ? 'ryzyko' : 'dobrze',
        value: `${foodWasteRisk}%`,
        description: 'Ryzyko nadwyżek jedzenia zależne od niepotwierdzonych RSVP.'
      },
      {
        name: 'Menu',
        status: vegeMeals > 0 ? 'dobrze' : 'wymaga uwagi',
        value: `${vegeMeals}`,
        description: 'Liczba pozycji vege / vegan wykrytych w menu.'
      },
      {
        name: 'Materiały cyfrowe',
        status: avoidedPrintsCount > 0 ? 'dobrze' : 'monitoring',
        value: `${avoidedPrintsCount}`,
        description: 'Szacowana liczba unikniętych wydruków dzięki stronie uczestnika i cyfrowemu Event Pass.'
      },
      {
        name: 'Budżet',
        status: estimatedCostSavings > 0 ? 'potencjał oszczędności' : 'monitoring',
        value: `${estimatedCostSavings.toLocaleString('pl-PL')} PLN`,
        description: 'Potencjalne oszczędności z cyfryzacji, mniejszych nadwyżek i dokładniejszego cateringu.'
      },
      {
        name: 'Podwykonawcy',
        status: localSuppliersCount > 0 ? 'dobrze' : 'wymaga uwagi',
        value: `${localSuppliersCount}`,
        description: 'Liczba lokalnych lub wysoko ocenionych eco dostawców.'
      },
      {
        name: 'ReSOLVE',
        status: circularityScore >= 70 ? 'mocny wynik' : 'do wzmocnienia',
        value: `${circularityScore}%`,
        description: 'Łączny wynik obiegu zamkniętego na podstawie Virtualize, Optimize/Share, Loop, Exchange i Regenerate.'
      }
    ]

    const scenarios = {
      current: {
        label: 'Obecny plan',
        co2: totalCo2Saved,
        cost: `${estimatedCostSavings.toLocaleString('pl-PL')} PLN potencjału`,
        waste: `${Math.max(foodWasteRisk, gadgetWasteRisk)}%`
      },
      optimized: {
        label: 'Plan zoptymalizowany',
        co2: Number((totalCo2Saved * 1.25).toFixed(1)),
        cost: `-${estimatedCostSavings.toLocaleString('pl-PL')} PLN`,
        waste: `${Math.max(Math.round(foodWasteRisk * 0.65), Math.round(gadgetWasteRisk * 0.65))}%`
      }
    }

    const sources = [
      {
        label: 'Cyfrowe zaproszenia',
        value: `${digitalInvitesCo2Saved} kg`,
        detail: `${totalApplications} zgłoszeń / zaproszeń`
      },
      {
        label: 'Transport',
        value: `${transportCo2Saved} kg`,
        detail: `${realCarpoolingChoices} realnych wyborów carpooling, ${activeCarpoolAds} aktywnych ogłoszeń, flota: ${fleetCapacity} miejsc`
      },
      {
        label: 'Plastik i papier',
        value: `${plasticCo2Saved} kg`,
        detail: 'cyfrowe materiały, event pass i ograniczenie wydruków'
      },
      {
        label: 'Menu / catering',
        value: `${menuCo2Saved} kg`,
        detail: `${vegeMeals} pozycji vege / vegan`
      },
      {
        label: 'Uniknięte wydruki',
        value: `${avoidedPrintsCount} szt.`,
        detail: 'zaproszenia, identyfikatory, materiały i informacje przeniesione do kanałów cyfrowych'
      },
      {
        label: 'Papier',
        value: `${paperSavedKg} kg`,
        detail: 'szacunek masy papieru niewydrukowanego dzięki cyfrowemu flow'
      },
      {
        label: 'Food waste',
        value: `${foodWastePortionsRisk} porcji`,
        detail: 'porcje obarczone ryzykiem przez niepotwierdzone RSVP'
      },
      {
        label: 'Budżet / oszczędności',
        value: `${estimatedCostSavings.toLocaleString('pl-PL')} PLN`,
        detail: 'potencjał z wydruków, gadżetów i lepszego domknięcia cateringu'
      },
      {
        label: 'ReSOLVE',
        value: `${circularityScore}%`,
        detail: 'syntetyczny wynik GOZ z lokalnego AI Eco Engine'
      }
    ]

    return {
      totalCo2Saved,
      digitalInvitesCo2Saved,
      transportCo2Saved,
      plasticCo2Saved,
      menuCo2Saved,
      gadgetsCo2Saved,
      paperSavedKg,
      avoidedPrintsCount,
      foodWastePortionsRisk,
      gadgetOverstockCount,
      foodWasteRisk,
      gadgetWasteRisk,
      localBudgetShare,
      estimatedCostSavings,
      circularityScore,
      resolveScore,
      transportEfficiency,
      localSuppliersCount,
      proEcoDecisions,
      treesEquivalent,
      kmEquivalent,
      recommendations,
      areas,
      scenarios,
      sources
    }
  }, [
    applications,
    approvedApps,
    meals,
    fleet,
    carpoolingAds,
    transportCarpoolStats,
    contractors,
    cateringOffers,
    budgetItems,
    event,
  ])

  const displayedEcoAnalysis = useMemo(() => {
    const report = ecoAiReport?.report || ecoAiReport
    if (!report || typeof report !== 'object') return aiEcoAnalysis

    const toNumber = (value: any, fallback: number) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : fallback
    }

    const resolveScore = report.resolve_score || report.resolveScore || {}

    return {
      ...aiEcoAnalysis,
      totalCo2Saved: toNumber(report.total_co2_saved ?? report.totalCo2Saved, aiEcoAnalysis.totalCo2Saved),
      digitalInvitesCo2Saved: toNumber(report.digital_invites_co2 ?? report.digitalInvitesCo2Saved, aiEcoAnalysis.digitalInvitesCo2Saved),
      transportCo2Saved: toNumber(report.transport_co2 ?? report.transportCo2Saved, aiEcoAnalysis.transportCo2Saved),
      plasticCo2Saved: toNumber(report.plastic_co2 ?? report.plasticCo2Saved, aiEcoAnalysis.plasticCo2Saved),
      paperSavedKg: toNumber(report.paper_saved_kg ?? report.paperSavedKg, aiEcoAnalysis.paperSavedKg),
      menuCo2Saved: toNumber(report.menu_co2 ?? report.menuCo2Saved, aiEcoAnalysis.menuCo2Saved),
      gadgetsCo2Saved: toNumber(report.gadgets_co2 ?? report.gadgetsCo2Saved, aiEcoAnalysis.gadgetsCo2Saved),
      foodWasteRisk: toNumber(report.food_waste_risk ?? report.foodWasteRisk, aiEcoAnalysis.foodWasteRisk),
      transportEfficiency: toNumber(report.transport_efficiency ?? report.transportEfficiency, aiEcoAnalysis.transportEfficiency),
      circularityScore: toNumber(report.circularity_score ?? report.circularityScore, aiEcoAnalysis.circularityScore),
      localSuppliersCount: toNumber(report.local_suppliers_count ?? report.localSuppliersCount, aiEcoAnalysis.localSuppliersCount),
      treesEquivalent: toNumber(report.trees_equivalent ?? report.treesEquivalent, aiEcoAnalysis.treesEquivalent),
      kmEquivalent: toNumber(report.km_equivalent ?? report.kmEquivalent, aiEcoAnalysis.kmEquivalent),
      resolveScore: {
        virtualize: toNumber(resolveScore.virtualize, aiEcoAnalysis.resolveScore.virtualize),
        optimizeShare: toNumber(resolveScore.optimizeShare, aiEcoAnalysis.resolveScore.optimizeShare),
        loop: toNumber(resolveScore.loop, aiEcoAnalysis.resolveScore.loop),
        exchange: toNumber(resolveScore.exchange, aiEcoAnalysis.resolveScore.exchange),
        regenerate: toNumber(resolveScore.regenerate, aiEcoAnalysis.resolveScore.regenerate)
      },
      recommendations: Array.isArray(report.recommendations) ? report.recommendations : aiEcoAnalysis.recommendations,
      sources: Array.isArray(report.sources) ? report.sources : aiEcoAnalysis.sources,
      scenarios: report.scenarios && typeof report.scenarios === 'object' ? report.scenarios : aiEcoAnalysis.scenarios,
      areas: Array.isArray(report.areas) ? report.areas : aiEcoAnalysis.areas,
      aiSummary: report.ai_summary || report.aiSummary || '',
      confidence: report.confidence || ecoAiReport?.confidence || 'ai'
    }
  }, [aiEcoAnalysis, ecoAiReport])

  const ecoEngineMetrics = useMemo(() => ({
    totalCO2Saved: displayedEcoAnalysis.totalCo2Saved,
    foodWastePrevented: displayedEcoAnalysis.foodWastePortionsRisk,
    paperSavedKg: displayedEcoAnalysis.paperSavedKg,
    plasticSavedKg: displayedEcoAnalysis.plasticCo2Saved,
    treesEquivalent: displayedEcoAnalysis.treesEquivalent,
    kmEquivalent: displayedEcoAnalysis.kmEquivalent,
    circularityScore: displayedEcoAnalysis.circularityScore,
    resolveScore: displayedEcoAnalysis.resolveScore
  }), [displayedEcoAnalysis])

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://anmplanner.vercel.app'
  const publicLink = `${currentDomain}/join/${event?.slug || event?.id}`
  const quickStaffAccess = useMemo(() => {
    const activeStaff = staffAccessList.filter((staff: any) => staff.access_token && staff.is_active !== false)
    return activeStaff.find((staff: any) => staff.role === 'manager') || activeStaff[0] || null
  }, [staffAccessList])
  const quickStaffPassUrl = getStaffPassUrl(quickStaffAccess?.access_token)
  const quickStaffPassShortUrl = quickStaffAccess?.access_token ? `/staff-pass/${String(quickStaffAccess.access_token).slice(0, 8)}...` : ''


// ============================================================================
// ----- 4.7. RENDEROWANIE (JEŚLI ŁADOWANIE) -----
// ============================================================================

  const todayIso = new Date().toISOString().slice(0, 10)

const formatPlannerDate = (value?: string | null) => {
  if (!value) return 'Bez daty'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const organizerCalendarEvents = useMemo(() => {
  const allEvents: any[] = []

  ;(Array.isArray(runOfShow) ? runOfShow : []).forEach((task: any) => {
    if (task?.date) {
      allEvents.push({
        id: `ros-${task.id}`,
        date: task.date,
        time: task.time || '',
        title: task.task || 'Zadanie',
        source: 'Minutówka',
        isCritical: task.isCritical === true,
        color: task.isCritical ? 'bg-red-500' : 'bg-[#253a2a]'
      })
    }
  })

  ;(Array.isArray(sessions) ? sessions : []).forEach((session: any) => {
    if (session?.start_time) {
      const dateObj = new Date(session.start_time)
      if (!Number.isNaN(dateObj.getTime())) {
        allEvents.push({
          id: `session-${session.id}`,
          date: dateObj.toISOString().slice(0, 10),
          time: dateObj.toISOString().slice(11, 16),
          title: session.title || 'Punkt agendy',
          source: 'Agenda',
          isCritical: false,
          color: 'bg-indigo-500'
        })
      }
    }
  })

  ;(Array.isArray(contractors) ? contractors : []).forEach((contractor: any) => {
    if (contractor?.payment_due_date && contractor.payment_status !== 'paid') {
      allEvents.push({
        id: `payment-${contractor.id}`,
        date: contractor.payment_due_date,
        time: '12:00',
        title: `Płatność: ${contractor.name || 'podwykonawca'} (${contractor.gross_amount || contractor.amount || 0} PLN)`,
        source: 'Finanse',
        isCritical: true,
        color: 'bg-amber-500'
      })
    }
  })

  return allEvents.sort((a, b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`))
}, [runOfShow, sessions, contractors])

const organizerItems = useMemo(() => {
  const eventDate =
    event?.event_date
      ? String(event.event_date).slice(0, 10)
      : todayIso

  const rosItems = (runOfShow || []).map((task: any) => ({
    id: task.id,
    source: 'run_of_show',
    sourceLabel: 'Minutówka',
    date: task.date || eventDate,
    time: task.time || '',
    title: task.task || 'Zadanie',
    assignee: task.assignee || '',
    location: task.location || '',
    status: task.status || 'pending',
    isCritical: task.isCritical === true,
    note: task.note || ''
  }))

  const sessionItems = (sessions || [])
    .filter((session: any) => session.start_time)
    .map((session: any) => ({
      id: `session-${session.id}`,
      source: 'agenda',
      sourceLabel: 'Agenda',
      date: String(session.start_time).slice(0, 10),
      time: String(session.start_time).slice(11, 16),
      title: session.title || 'Punkt agendy',
      assignee: session.speaker_name || '',
      location: session.location || '',
      status: 'info',
      isCritical: false,
      note: session.description || ''
    }))

  return [...rosItems, ...sessionItems].sort((a, b) => {
    const left = `${a.date || ''} ${a.time || ''}`
    const right = `${b.date || ''} ${b.time || ''}`
    return left.localeCompare(right)
  })
}, [runOfShow, sessions, event?.event_date, todayIso])

const organizerDays = useMemo(() => {
  const map = new Map<string, any[]>()

  organizerItems.forEach((item: any) => {
    const key = item.date || 'no-date'
    if (!map.has(key)) map.set(key, [])
    map.get(key)?.push(item)
  })

  return Array.from(map.entries()).map(([date, items]) => ({
    date,
    items
  }))
}, [organizerItems])

const organizerStats = useMemo(() => {
  const runTasks = organizerItems.filter((item: any) => item.source === 'run_of_show')
  const done = runTasks.filter((item: any) => item.status === 'done').length
  const critical = runTasks.filter((item: any) => item.isCritical && item.status !== 'done').length
  const today = organizerItems.filter((item: any) => item.date === todayIso).length
  const pending = runTasks.filter((item: any) => item.status !== 'done').length

  return {
    total: runTasks.length,
    done,
    critical,
    today,
    pending
  }
}, [organizerItems, todayIso])

const upcomingOrganizerItems = useMemo(() => {
  return organizerItems
    .filter((item: any) => item.date && item.date >= todayIso && item.status !== 'done')
    .slice(0, 6)
}, [organizerItems, todayIso])


const aiOrganizerTips = useMemo(() => {
  const tips: string[] = []

  if (organizerStats.critical > 0) {
    tips.push('Masz aktywne punkty krytyczne. Zacznij odprawę ekipy właśnie od nich.')
  }

  if (organizerStats.pending > 8) {
    tips.push('Lista operacyjna jest długa. Podziel zadania na osoby odpowiedzialne, żeby uniknąć chaosu w dniu eventu.')
  }

  if ((sessions || []).length > 0 && runOfShow.length === 0) {
    tips.push('Masz agendę, ale nie masz minutówki technicznej. Warto przepisać najważniejsze punkty agendy na zadania operacyjne.')
  }

  if (upcomingOrganizerItems.length === 0) {
    tips.push('Brak najbliższych terminów. Dodaj pierwsze zadania operacyjne, np. odbiór dekoracji, kontakt z cateringiem lub próbę techniczną.')
  }

  return tips.slice(0, 3)
}, [organizerStats, sessions, runOfShow.length, upcomingOrganizerItems.length])
// ============================================================================
// ----- 4.7. RENDEROWANIE (JEŚLI ŁADOWANIE) -----
// ============================================================================

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center px-4">
        <RefreshCw size={48} className="animate-spin text-[#253a2a] mx-auto mb-4" />
        <p className="font-black text-slate-700 text-lg">Ładowanie panelu operacyjnego...</p>
        <p className="text-xs text-slate-500 mt-2">Przygotowujemy dane biznesowe</p>
      </div>
    </div>
  )
// ============================================================================
// ----- 4.8. KOMPONENT POMOCNICZY TabButton (wewnątrz) -----
// ============================================================================

// Podmień tę funkcję w swoim pliku!
const TabButton = ({ tabId, icon: Icon, label, count, urgent }: {
  tabId: TabModule, icon: any, label: string, count?: number, urgent?: boolean
}) => {
  const isActive = activeTab === tabId;
  return (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`w-full min-w-0 ${isNavCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-3'} rounded-2xl text-left text-[11px] font-black transition-all flex items-center gap-3 border ${
        isActive
          ? (isDarkMode ? 'bg-cyan-200 text-[#071016] border-cyan-200 shadow-md scale-[1.02]' : 'bg-[#071016] text-white border-[#071016] shadow-md scale-[1.02]')
          : urgent && count && count > 0
            ? (isDarkMode ? 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100')
            : (isDarkMode ? 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900')
      }`}
    >
      <span className={`${isNavCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        isActive
          ? (isDarkMode ? 'bg-[#071016]/10 text-[#071016]' : 'bg-white/20 text-cyan-200')
          : urgent && count && count > 0
            ? (isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600')
            : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
      }`}>
        <Icon size={16} />
      </span>
      <span className={`${isNavCollapsed ? 'hidden' : 'flex'} flex-1 min-w-0 truncate leading-tight`}>{label}</span>
      {!isNavCollapsed && count !== undefined && count > 0 && (
        <span className={`ml-auto shrink-0 px-2 py-1 rounded-full text-[10px] font-black tabular-nums text-center transition-colors ${
          isActive
            ? (isDarkMode ? 'bg-[#071016] text-cyan-200' : 'bg-white text-slate-900')
            : urgent
              ? (isDarkMode ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-red-600 text-white animate-pulse')
              : (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

  const doctorProfiles = partners.filter(isDoctorPartner)
  const preparationProfiles = partners.filter(isPreparationPartner)

  const navGroups = [
    {
      title: 'Pacjent i opieka',
      desc: 'Historia, wizyty, QR i dokumentacja',
      items: [
        { tabId: 'bilety' as TabModule, icon: Ticket, label: 'Rejestracja pacjenta', count: tiers.length },
        { tabId: 'materialy' as TabModule, icon: FileIcon, label: 'Zgody i dokumenty', count: patientConsents.length },
        { tabId: 'harmonogram' as TabModule, icon: Clock, label: 'Wizyty i zabiegi', count: sessions.length },
        { tabId: 'prelegenci' as TabModule, icon: Stethoscope, label: 'Lekarze', count: doctorProfiles.length },
        { tabId: 'eventpass' as TabModule, icon: QrCode, label: 'Identyfikacja QR', count: attendeeUnits.length },
        { tabId: 'logistyka' as TabModule, icon: ClipboardList, label: 'Ścieżka pacjenta', count: approvedApps.length }
      ]
    },
    {
      title: 'Pierwszy kontakt',
      desc: 'Leady, rejestracja i follow-up',
      items: [
        { tabId: 'rekrutacja' as TabModule, icon: Users, label: 'Leady pacjentów', count: pendingApps.length + patientPortalRequests.filter((item: any) => item.status === 'new').length, urgent: true },
        { tabId: 'strona_uczestnika' as TabModule, icon: Globe, label: 'Portal pacjenta' },
        { tabId: 'checklista' as TabModule, icon: ClipboardList, label: 'Zadania opieki' },
        { tabId: 'komunikacja' as TabModule, icon: Mail, label: 'SMS / e-mail / follow-up' },
        { tabId: 'minutowka' as TabModule, icon: ClipboardList, label: 'Plan dnia kliniki' }
      ]
    },
    {
      title: 'Efektywność kliniki',
      desc: 'KPI, finanse i zarządzanie placówką',
      items: [
        { tabId: 'eko' as TabModule, icon: Recycle, label: 'AI analityka' },
        { tabId: 'finanse' as TabModule, icon: Wallet, label: 'Płatności i koszty' },
        { tabId: 'dostawcy' as TabModule, icon: Briefcase, label: 'Partnerzy medyczni' }
      ]
    }
  ]

  const orderedNavGroups = [navGroups[1], navGroups[0], navGroups[2]]

  // ==========================================================================
  // 5. RENDER GŁÓWNY nie zamykaj zamniesz wszystko
  // ==========================================================================

 return (
    <div
      data-theme={isDarkMode ? 'dark' : 'light'}
      data-active-tab={activeTab}
      className={`planner-shell ${isDarkMode ? 'planner-dark' : ''} min-h-screen font-sans pb-20`}
    >
      <style jsx global>{`
        .planner-shell {
          --app-bg: var(--clinic-bg);
          --app-surface: var(--clinic-panel);
          --app-surface-muted: var(--clinic-panel-strong);
          --app-border: var(--clinic-border);
          --app-text: var(--clinic-text);
          --app-text-muted: var(--clinic-muted);
          --app-primary: var(--clinic-primary);
          --app-accent: var(--clinic-accent);
          --app-danger: #dc2626;
          --app-success: #047857;
          background:
            radial-gradient(circle at 16% 10%, rgba(103, 232, 249, 0.12), transparent 34rem),
            radial-gradient(circle at 84% 16%, rgba(16, 185, 129, 0.08), transparent 30rem),
            var(--app-bg);
          color: var(--app-text);
        }
        .planner-shell.planner-dark {
          --app-bg: #071016;
          --app-surface: #101a22;
          --app-surface-muted: #0b1218;
          --app-surface-soft: #132330;
          --app-border: rgba(255, 255, 255, 0.10);
          --app-text: #ffffff;
          --app-text-muted: #94a3b8;
          --app-primary: #071016;
          --app-accent: #67e8f9;
          --app-danger: #f87171;
          --app-success: #60a5fa;
          background:
            radial-gradient(circle at top right, rgba(103, 232, 249, 0.14), transparent 34rem),
            radial-gradient(circle at top left, rgba(16, 185, 129, 0.10), transparent 30rem),
            linear-gradient(180deg, #071016 0%, #0b151c 100%);
        }
        .planner-metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        .planner-metric-card {
          min-width: 0;
          min-height: 104px;
          padding: 1rem;
          border-radius: 1.25rem;
          border: 1px solid var(--app-border);
          background: var(--app-surface);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .planner-metric-label {
          min-width: 0;
          color: var(--app-text-muted);
          font-size: 10px;
          line-height: 1.25;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .planner-metric-value {
          min-width: 0;
          font-size: clamp(1.45rem, 2.2vw, 2rem);
          line-height: 1;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          overflow-wrap: anywhere;
        }
        .planner-shell .premium-card {
          background: var(--app-surface);
          border-color: var(--app-border);
          color: var(--app-text);
        }
        .planner-shell.planner-dark .bg-white,
        .planner-shell.planner-dark .bg-white\\/80,
        .planner-shell.planner-dark .bg-white\\/90,
        .planner-shell.planner-dark [class~="bg-white"],
        .planner-shell.planner-dark [class~="bg-white/80"],
        .planner-shell.planner-dark [class~="bg-white/90"],
        .planner-shell.planner-dark [class~="bg-white/95"] {
          background-color: var(--app-surface) !important;
        }
        .planner-shell.planner-dark .bg-slate-50,
        .planner-shell.planner-dark .bg-slate-100,
        .planner-shell.planner-dark .bg-slate-50\\/50,
        .planner-shell.planner-dark .bg-slate-50\\/70,
        .planner-shell.planner-dark [class~="bg-slate-50"],
        .planner-shell.planner-dark [class~="bg-slate-100"],
        .planner-shell.planner-dark [class~="bg-slate-50/50"],
        .planner-shell.planner-dark [class~="bg-slate-50/70"] {
          background-color: var(--app-surface-muted) !important;
        }
        .planner-shell.planner-dark [class~="bg-slate-200"],
        .planner-shell.planner-dark [class~="bg-slate-300"] {
          background-color: var(--app-surface-soft) !important;
        }
        .planner-shell.planner-dark .hover\\:bg-slate-50:hover,
        .planner-shell.planner-dark .hover\\:bg-slate-100:hover,
        .planner-shell.planner-dark .hover\\:bg-white:hover {
          background-color: var(--app-surface-soft) !important;
        }
        .planner-shell.planner-dark .bg-blue-50,
        .planner-shell.planner-dark .bg-blue-50\\/30,
        .planner-shell.planner-dark .bg-emerald-50,
        .planner-shell.planner-dark .bg-amber-50,
        .planner-shell.planner-dark .bg-red-50,
        .planner-shell.planner-dark .bg-purple-50 {
          background-color: rgba(17, 24, 39, 0.92) !important;
        }
        .planner-shell.planner-dark .border-slate-200,
        .planner-shell.planner-dark .border-slate-300,
        .planner-shell.planner-dark .border-slate-100,
        .planner-shell.planner-dark .border-blue-200,
        .planner-shell.planner-dark .border-emerald-200,
        .planner-shell.planner-dark .border-amber-200,
        .planner-shell.planner-dark .border-red-200 {
          border-color: var(--app-border) !important;
        }
        .planner-shell.planner-dark .text-slate-900,
        .planner-shell.planner-dark .text-slate-800,
        .planner-shell.planner-dark .text-slate-700 {
          color: var(--app-text) !important;
        }
        .planner-shell.planner-dark .text-slate-600,
        .planner-shell.planner-dark .text-slate-500,
        .planner-shell.planner-dark .text-slate-400 {
          color: var(--app-text-muted) !important;
        }
        .planner-shell.planner-dark table,
        .planner-shell.planner-dark tbody,
        .planner-shell.planner-dark thead,
        .planner-shell.planner-dark tr {
          background-color: transparent !important;
        }
        .planner-shell.planner-dark tbody tr,
        .planner-shell.planner-dark tbody td {
          background-color: var(--app-surface) !important;
        }
        .planner-shell.planner-dark tbody tr:hover td {
          background-color: var(--app-surface-soft) !important;
        }
        .planner-shell.planner-dark th {
          background-color: #0b1120 !important;
          color: var(--app-text-muted) !important;
          border-color: var(--app-border) !important;
        }
        .planner-shell.planner-dark td {
          color: var(--app-text) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .planner-shell.planner-dark .shadow-sm,
        .planner-shell.planner-dark .shadow,
        .planner-shell.planner-dark .shadow-lg,
        .planner-shell.planner-dark .shadow-xl,
        .planner-shell.planner-dark .shadow-2xl {
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.26) !important;
        }
        .planner-shell.planner-dark input,
        .planner-shell.planner-dark textarea,
        .planner-shell.planner-dark select {
          background-color: #020617 !important;
          color: var(--app-text) !important;
          border-color: var(--app-border) !important;
        }
        .planner-shell.planner-dark input[type="checkbox"],
        .planner-shell.planner-dark input[type="radio"] {
          background-color: #020617 !important;
          border-color: rgba(103, 232, 249, 0.42) !important;
        }
        .planner-shell.planner-dark .planner-metric-card {
          background: var(--app-surface) !important;
          border-color: var(--app-border) !important;
          color: var(--app-text) !important;
        }
        .planner-shell button[class*="bg-[#253a2a]"],
        .planner-shell a[class*="bg-[#253a2a]"],
        .planner-shell button[class*="bg-[#e8ce7a]"],
        .planner-shell a[class*="bg-[#e8ce7a]"] {
          background-color: var(--app-accent) !important;
          color: #071016 !important;
          border-color: rgba(103, 232, 249, 0.24) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="bg-[#253a2a]"],
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="bg-[#253a2a]"],
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="bg-[#e8ce7a]"],
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="bg-[#e8ce7a]"] {
          background-color: #67e8f9 !important;
          color: #071016 !important;
          border-color: rgba(255, 255, 255, 0.10) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="hover:bg-[#1a291e]"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="hover:bg-[#1a291e]"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="hover:bg-black"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="hover:bg-black"]:hover {
          background-color: #22d3ee !important;
        }
        .planner-shell .text-\\[\\#e8ce7a\\],
        .planner-shell [class~="text-[#e8ce7a]"] {
          color: var(--app-accent) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="bg-emerald-"],
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="bg-emerald-"] {
          background-color: #1e3a5f !important;
          color: #dbeafe !important;
          border-color: rgba(147, 197, 253, 0.22) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) .text-emerald-700,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) .text-emerald-800,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) .text-emerald-900 {
          color: #93c5fd !important;
        }
        .planner-shell input::placeholder,
        .planner-shell textarea::placeholder {
          color: #111827 !important;
          opacity: 0.82;
        }
        .planner-shell.planner-dark input::placeholder,
        .planner-shell.planner-dark textarea::placeholder {
          color: #f8f6ef !important;
          opacity: 0.72;
        }
      `}</style>

      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-2xl font-black text-xs md:text-sm animate-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-[#253a2a] text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-[#e8ce7a] text-[#253a2a]'
        }`} style={{ zIndex: 99999 }}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 size={16} />}
            {notification.type === 'error' && <AlertTriangle size={16} />}
            {notification.type === 'info' && <Zap size={16} />}
            {notification.message}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL GLOBALNY: ASYSTENT AI */}
      {/* ============================================================================ */}
      {aiTextAssistConfig && (
        (() => {
          const isMedicalDocumentAssistant = aiTextAssistConfig.mode === 'medical_document' || ['medical_documents', 'medical_docs', 'patient_consents'].includes(aiTextAssistConfig.sectionKey)

          return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] flex flex-col border transition-colors shadow-[0_0_80px_-15px_rgba(99,102,241,0.3)] ${
            isDarkMode ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-white/80 border-indigo-200'
          }`}>
            <div className="absolute top-0 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className={`p-6 md:p-8 flex justify-between items-start border-b ${isDarkMode ? 'border-white/10' : 'border-indigo-900/10'}`}>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-3">
                    <Sparkles size={12} className="text-indigo-500 animate-pulse" />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      {isMedicalDocumentAssistant ? 'Medical Document AI' : 'Asystent treści AI'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {isMedicalDocumentAssistant ? 'Szkic dokumentu medycznego' : 'Magia słów'}
                  </h3>
                  <p className={`text-xs mt-1 font-bold tracking-widest uppercase flex flex-wrap items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Edit3 size={12} /> Edytujesz:
                    <span className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}>
                      {aiTextAssistConfig.sectionKey} / {aiTextAssistConfig.fieldKey}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAiTextAssist}
                  className={`p-2 rounded-full transition-all hover:rotate-90 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-slate-600 hover:text-slate-900'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {isMedicalDocumentAssistant && (
                  <div className={`rounded-2xl border px-4 py-3 text-xs font-bold leading-relaxed ${isDarkMode ? 'bg-amber-500/10 border-amber-500/25 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    AI tworzy wyłącznie roboczy projekt dokumentu. Przed użyciem z pacjentem treść musi zostać sprawdzona i zatwierdzona przez osobę uprawnioną medycznie oraz, w razie potrzeby, prawnie.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {isMedicalDocumentAssistant ? (
                    <div className="space-y-2">
                      <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                        <ShieldCheck size={14} /> Typ dokumentu
                      </label>
                      <select
                        className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all border ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-indigo-400 focus:bg-black/40' : 'bg-white/60 border-indigo-100 text-slate-900 focus:border-indigo-400 focus:bg-white'}`}
                        value={aiTextDocumentType}
                        onChange={e => setAiTextDocumentType(e.target.value)}
                      >
                        <option value="consent">Zgoda medyczna / zabiegowa</option>
                        <option value="questionnaire">Wywiad medyczny</option>
                        <option value="aftercare">Zalecenia po zabiegu</option>
                        <option value="precare">Zalecenia przed zabiegiem</option>
                        <option value="rodo">RODO / zgody administracyjne</option>
                        <option value="followup">SMS / e-mail follow-up</option>
                      </select>
                    </div>
                  ) : (
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                      <Mic size={14} /> Ton wypowiedzi
                    </label>
                    <select
                      className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all border ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-indigo-400 focus:bg-black/40' : 'bg-white/60 border-indigo-100 text-slate-900 focus:border-indigo-400 focus:bg-white'}`}
                      value={aiTextTone}
                      onChange={e => setAiTextTone(e.target.value)}
                    >
                      <option value="premium">Premium / luksusowy</option>
                      <option value="prosty">Prosty / klarowny</option>
                      <option value="formalny">Formalny / biznesowy</option>
                      <option value="energiczny">Energiczny / angażujący</option>
                      <option value="eco">Eco / odpowiedzialny</option>
                    </select>
                  </div>
                  )}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                      <Type size={14} /> Długość tekstu
                    </label>
                    <select
                      className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all border ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-indigo-400 focus:bg-black/40' : 'bg-white/60 border-indigo-100 text-slate-900 focus:border-indigo-400 focus:bg-white'}`}
                      value={aiTextLength}
                      onChange={e => setAiTextLength(e.target.value)}
                    >
                      <option value="krótka">Zwięzła / krótka</option>
                      <option value="średnia">Średnia / optymalna</option>
                      <option value="rozbudowana">Rozbudowana / długa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    <MessageSquare size={14} /> Twoje wytyczne
                  </label>
                  <textarea
                    rows={2}
                    className={`w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all border ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-indigo-400 focus:bg-black/40 placeholder-slate-500' : 'bg-white/60 border-indigo-100 text-slate-900 focus:border-indigo-400 focus:bg-white placeholder-slate-400'}`}
                    placeholder={isMedicalDocumentAssistant ? 'Np. zabieg laserowy CO2, przeciwwskazania, zalecenia, ryzyka, ton formalny dla pacjenta...' : 'Np. podkreśl networking, ogranicz formalny ton, dodaj akcent eco...'}
                    value={aiTextInstruction}
                    onChange={e => setAiTextInstruction(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={generateAiTextSuggestion}
                  disabled={aiTextLoading}
                  className="group relative w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 overflow-hidden text-white border border-white/20 bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <span className="relative z-10 flex items-center gap-2.5">
                      {aiTextLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:animate-pulse" />}
                    {aiTextLoading ? 'Generuję szkic...' : (isMedicalDocumentAssistant ? 'Generuj szkic dokumentu' : 'Generuj treść')}
                    </span>
                  </button>

                <div className="space-y-2 pt-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between gap-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> {isMedicalDocumentAssistant ? 'Roboczy szkic dokumentu' : 'Wygenerowana treść'}</span>
                    {aiTextSuggestion && (
                      <span className={`text-[8px] px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-black/5 border-black/10 text-slate-500'}`}>
                        {isMedicalDocumentAssistant ? 'Wymaga zatwierdzenia' : 'Możesz edytować przed zapisem'}
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <textarea
                      rows={6}
                      className={`w-full rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none resize-y transition-all border shadow-inner ${isDarkMode ? 'bg-black/40 border-emerald-500/30 text-emerald-50 focus:border-emerald-400 placeholder-slate-500' : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500 placeholder-slate-400'}`}
                      placeholder={aiTextAssistConfig.placeholder || (isMedicalDocumentAssistant ? 'Tu pojawi się roboczy szkic dokumentu do weryfikacji...' : 'Tu pojawi się gotowy tekst stworzony przez sztuczną inteligencję...')}
                      value={aiTextSuggestion}
                      onChange={e => setAiTextSuggestion(e.target.value)}
                    />
                    {!aiTextSuggestion && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <Sparkles size={48} className={isDarkMode ? 'text-slate-600' : 'text-indigo-200'} />
                      </div>
                    )}
                  </div>
                </div>

                {aiTextReason && (
                  <p className={`rounded-2xl border px-4 py-3 text-xs font-medium ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/70 border-indigo-100 text-slate-600'}`}>
                    <span className={isDarkMode ? 'font-black text-indigo-300' : 'font-black text-indigo-700'}>{isMedicalDocumentAssistant ? 'Uzasadnienie szkicu:' : 'AI użyło:'}</span> {aiTextReason}
                  </p>
                )}

                {aiTextMissingContext.length > 0 && (
                  <div className={`rounded-2xl border px-4 py-3 text-xs font-medium ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <p className="font-black">Brakujące dane, które poprawią sugestię:</p>
                    <ul className="mt-1 list-disc pl-4">
                      {aiTextMissingContext.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={`p-6 border-t flex flex-col sm:flex-row gap-3 justify-end mt-auto ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-indigo-900/5 bg-slate-50'}`}>
                <button
                  type="button"
                  onClick={closeAiTextAssist}
                  className={`px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors border ${isDarkMode ? 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={applyAiTextSuggestion}
                  disabled={!aiTextSuggestion.trim() || aiTextLoading}
                  className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 border ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/40 hover:text-emerald-100' : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'}`}
                >
                  {isMedicalDocumentAssistant ? 'Wstaw szkic do dokumentu' : 'Zastosuj treść'}
                </button>
              </div>
            </div>
          </div>
        </div>
          )
        })()
      )}

      {false && aiTextAssistConfig && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#253a2a]">
                  AI podpowiedź treści
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {aiTextAssistConfig.sectionKey} / {aiTextAssistConfig.fieldKey}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  AI tylko proponuje tekst. Zapis nastąpi dopiero po zapisaniu formularza.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAiTextAssist}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Ton</label>
                  <select
                    value={aiTextTone}
                    onChange={e => setAiTextTone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#253a2a]"
                  >
                    <option value="premium">premium</option>
                    <option value="prosty">prosty</option>
                    <option value="formalny">formalny</option>
                    <option value="energiczny">energiczny</option>
                    <option value="eco">eco</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Długość</label>
                  <select
                    value={aiTextLength}
                    onChange={e => setAiTextLength(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#253a2a]"
                  >
                    <option value="krótka">krótka</option>
                    <option value="średnia">średnia</option>
                    <option value="rozbudowana">rozbudowana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Dodatkowa wskazówka dla AI</label>
                <textarea
                  rows={2}
                  value={aiTextInstruction}
                  onChange={e => setAiTextInstruction(e.target.value)}
                  placeholder="Np. podkreśl networking, ogranicz formalny ton, dodaj akcent eco..."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#253a2a]"
                />
              </div>

              <button
                type="button"
                onClick={generateAiTextSuggestion}
                disabled={aiTextLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#253a2a] px-5 py-4 text-xs font-black uppercase tracking-widest text-[#e8ce7a] shadow-sm transition hover:bg-[#1a291e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={15} className={aiTextLoading ? 'animate-pulse' : ''} />
                {aiTextLoading ? 'Generuję propozycję...' : 'Wygeneruj propozycję'}
              </button>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Propozycja</label>
                <textarea
                  rows={8}
                  value={aiTextSuggestion}
                  onChange={e => setAiTextSuggestion(e.target.value)}
                  placeholder={aiTextAssistConfig.placeholder || 'Tutaj pojawi się propozycja AI...'}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-900 outline-none focus:border-[#253a2a]"
                />
              </div>

              {aiTextReason && (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                  <span className="font-black text-slate-900">AI użyło:</span> {aiTextReason}
                </p>
              )}

              {aiTextMissingContext.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
                  <p className="font-black">Brakujące dane, które poprawią sugestię:</p>
                  <ul className="mt-1 list-disc pl-4">
                    {aiTextMissingContext.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAiTextAssist}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase text-slate-600 transition hover:bg-slate-100"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={applyAiTextSuggestion}
                disabled={!aiTextSuggestion.trim()}
                className="rounded-2xl bg-[#e8ce7a] px-5 py-3 text-xs font-black uppercase text-[#253a2a] transition hover:bg-[#d8bd65] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Zastosuj
              </button>
            </div>
          </div>
        </div>
      )}
{/* ============================================================================ */}
{/* HEADER */}
{/* ============================================================================ */}

     <header className={`border-b p-3 md:p-4 sticky top-0 z-30 shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
  <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 md:gap-4">
      <button
        onClick={() => router.push('/b2b/dashboard')}
        className={`p-1.5 md:p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-700'}`}
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0">
        <h1 className={`text-lg md:text-xl font-black leading-tight capitalize truncate max-w-[150px] sm:max-w-[300px] md:max-w-[500px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {event?.title || 'Wydarzenie'}
        </h1>
        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          {event?.location || 'Brak lokalizacji'}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 md:gap-3 shrink-0">

      {/* Przycisk: Identyfikatory PDF */}
      <button
        onClick={handlePrintBadges}
        className={`hidden md:flex px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border transition-all hover:scale-105 shadow-sm ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900'
        }`}
      >
        <Printer size={12}/> Identyfikatory
      </button>

      {/* Przycisk: Tryb Ciemny/Jasny */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`hidden sm:flex px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border transition-all hover:scale-105 shadow-sm ${
          isDarkMode
            ? 'bg-blue-900/20 border-blue-800/50 text-blue-400 hover:bg-blue-900/40'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900'
        }`}
      >
        {isDarkMode ? <Sun size={12}/> : <Moon size={12}/>}
        <span className="hidden lg:inline">{isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}</span>
      </button>

      {/* Przycisk: Pomoc (Akcent Indygo) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsHelpMenuOpen(prev => !prev)}
          className={`flex px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border transition-all hover:scale-105 shadow-sm ${
            isHelpMenuOpen
              ? (isDarkMode ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300' : 'bg-indigo-100 border-indigo-300 text-indigo-800')
              : (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100')
          }`}
        >
          <HelpCircle size={12} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
          Pomoc
        </button>

        {/* DROPDOWN POMOCY */}
        {isHelpMenuOpen && (
          <div className={`absolute right-0 mt-3 w-[320px] md:w-[380px] max-w-[calc(100vw-2rem)] rounded-[24px] md:rounded-[28px] border shadow-2xl z-[9999] overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-4 md:p-5 border-b flex items-start justify-between gap-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Centrum pomocy
                </p>
                <h3 className={`text-sm font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Instrukcje obsługi planera
                </h3>
                <p className={`text-[10px] font-medium mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Wybierz temat i otwórz PDF w nowej karcie.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpMenuOpen(false)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[350px] md:max-h-[420px] overflow-y-auto p-3 custom-scrollbar">
              {helpDocuments.filter((doc: any) => !!doc.pdf_url).length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <BookOpen size={24} className={isDarkMode ? 'text-slate-600' : 'text-slate-400'} />
                  </div>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Brak dodanych instrukcji.
                  </p>
                  <p className={`text-[10px] font-medium mt-1.5 max-w-[200px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dodaj dokumenty w tabeli help_documents w bazie Supabase.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {helpDocuments
                    .filter((doc: any) => !!doc.pdf_url)
                    .map((doc: any) => (
                      <a
                        key={doc.id || doc.section_key}
                        href={doc.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsHelpMenuOpen(false)}
                        className={`flex items-start justify-between gap-3 p-3 rounded-2xl transition-colors group border border-transparent ${
                          isDarkMode
                            ? 'hover:bg-slate-800/80 hover:border-slate-700/50'
                            : 'hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isDarkMode
                              ? 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                          }`}>
                            <BookOpen size={16} />
                          </span>

                          <div className="min-w-0 flex flex-col justify-center min-h-[40px]">
                            <span className={`block text-[11px] font-black leading-tight truncate ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900'}`}>
                              {doc.title || 'Instrukcja'}
                            </span>

                            {doc.description && (
                              <span className={`block text-[9px] font-medium mt-1 leading-snug line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                {doc.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-2 transition-colors ${
                          isDarkMode
                            ? 'bg-slate-800 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}>
                          <ExternalLink size={10} />
                        </div>
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Znaczek ECO EVENT - Zaktualizowany na spójne złoto+grafit zamiast zieleni */}
      <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors ${
        isDarkMode
          ? 'bg-[#e8ce7a] text-[#0f172a]'
          : 'bg-slate-900 text-[#e8ce7a]'
      }`}>
        <Leaf size={12} className={isDarkMode ? 'text-[#0f172a]' : 'text-[#e8ce7a]'} />
        Eco Event
      </span>
    </div>
  </div>
</header>

<main className="max-w-[1600px] w-full mx-auto px-3 md:px-4 py-4 md:py-8">

 {/* ============================================================================ */}
  {/* BANER LINKU / QR (Teraz z pełnym Dark Mode i bez starych kolorów)  nie zamykaj zamniesz wszystko*/}
 {/* ============================================================================ */}
        <div className={`rounded-[24px] md:rounded-[32px] p-5 md:p-8 relative overflow-hidden shadow-xl mb-6 md:mb-8 border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
          <div className={`absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-[#e8ce7a]/10' : 'bg-blue-500/20'}`}></div>
          <div className="relative z-10 flex flex-col xl:flex-row gap-5 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 flex-1">
              <div className="bg-white p-2.5 md:p-3 rounded-2xl shadow-inner shrink-0">
                <QRCode value={publicLink} size={90} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-black mb-2 flex items-center justify-center sm:justify-start gap-2 text-white">
                  <Globe size={20} className="text-[#e8ce7a]" /> Centrum Dowodzenia ANM
                </h3>
                <p className="text-slate-400 text-xs md:text-sm mb-4 font-medium">
                  Udostępnij link zaproszenia gościom. QR na tym pasku prowadzi tylko do publicznej strony wydarzenia.
                </p>
                <div className="bg-black/30 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Link zaproszenia</p>
                  <a href={publicLink} target="_blank" rel="noopener noreferrer" className="block text-[11px] md:text-xs font-mono font-bold text-[#e8ce7a] truncate hover:underline">
                    {publicLink}
                  </a>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                    <button onClick={() => { navigator.clipboard.writeText(publicLink); showNotification('Link zaproszenia skopiowany', 'success') }} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 text-white">
                      <Copy size={14} /> Kopiuj link
                    </button>
                    <a href={publicLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-[#e8ce7a] hover:bg-[#d4b963] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5">
                      <ExternalLink size={14} /> Otwórz zaproszenie
                    </a>
                    <button onClick={() => window.print()} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 text-white">
                      <Printer size={14} /> Drukuj QR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:w-[340px] bg-black/30 rounded-2xl p-5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Link dla obsługi na miejscu</p>
                {quickStaffPassUrl ? (
                  <>
                    <a href={quickStaffPassUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-[11px] font-bold text-[#e8ce7a] truncate hover:underline mb-1">
                      {quickStaffPassShortUrl}
                    </a>
                    <p className="text-[10px] font-medium text-slate-400">
                      Szybki dostęp: {quickStaffAccess?.name || quickStaffAccess?.role || 'obsługa'}
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-400">Brak dostępu obsługi</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {quickStaffPassUrl ? (
                  <>
                    <button onClick={() => { navigator.clipboard.writeText(quickStaffPassUrl); showNotification('Link obsługi skopiowany', 'success') }} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex justify-center items-center gap-1.5 text-white">
                      <Copy size={14} /> Kopiuj
                    </button>
                    <a href={quickStaffPassUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex justify-center items-center gap-1.5 text-white">
                      <ExternalLink size={14} /> Otwórz
                    </a>
                  </>
                ) : (
                  <button onClick={() => setActiveTab('eventpass')} className="w-full py-2.5 bg-[#e8ce7a] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider flex justify-center items-center gap-1.5">
                    <ShieldCheck size={14} /> Skonfiguruj dostęp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">

          {/* LEWY SIDEBAR (Używamy kolumn Grida zamiast pozycjonowania fixed!) */}
          <aside className={`${isNavCollapsed ? 'lg:col-span-1 lg:w-[85px]' : 'lg:col-span-3'} lg:sticky lg:top-24 space-y-4 transition-all duration-300 z-20`}>
            <div className={`border rounded-[28px] backdrop-blur-xl transition-colors duration-300 ${isNavCollapsed ? 'p-2 shadow-sm' : 'p-4 shadow-sm'} ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
              <div className={`flex items-center justify-between ${isNavCollapsed ? 'mb-2' : 'mb-4'}`}>
                {!isNavCollapsed && (
                  <div className="min-w-0 pr-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Obszary systemu</p>
                    <h2 className={`text-lg font-black truncate mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ClinicOps</h2>
                  </div>
                )}

                {!isNavCollapsed && pendingApps.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                    {pendingApps.length} nowe
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                  className={`${isNavCollapsed ? 'w-full' : 'ml-auto'} h-10 px-3 rounded-2xl transition-colors flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  title={isNavCollapsed ? 'Pokaż menu' : 'Ukryj menu'}
                >
                  {isNavCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </div>

              <div className={isNavCollapsed ? 'space-y-2' : 'space-y-3'}>
                {orderedNavGroups.map(group => (
                  <section key={group.title}>
                    <button
                      type="button"
                      onClick={() => setOpenNavGroup(openNavGroup === group.title ? '' : group.title)}
                      className={`${isNavCollapsed ? 'hidden' : 'flex'} w-full items-center justify-between gap-3 mb-2 px-2 py-2 rounded-2xl transition-colors text-left ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="min-w-0">
                        <h3 className={`text-[9px] font-black uppercase tracking-widest truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{group.title}</h3>
                        <p className={`text-[10px] font-medium truncate mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{group.desc}</p>
                      </div>
                      <ChevronDown size={14} className={`shrink-0 transition-transform ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} ${openNavGroup === group.title ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`${isNavCollapsed || openNavGroup === group.title ? 'grid' : 'hidden'} grid-cols-1 gap-2`}>
                      {group.items.map(item => (
                        <TabButton key={item.tabId} {...item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </aside>

          {/* Główna zawartość zajmuje całą dostępną szerokość po usunięciu prawego panelu raportów. */}
          <div className={`${isNavCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} transition-all duration-300`}>

{/* ============================================================================ */}
{/* NOWE CENTRUM PORTALU PACJENTA (Dedykowane i Globalne Komunikaty) */}
{/* ============================================================================ */}
{activeTab === 'strona_uczestnika' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">
    
    {/* NAGŁÓWEK */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <Globe size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
        Konfiguracja Portalu Pacjenta
      </h3>
      <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Zarządzaj tym, co pacjenci widzą po zalogowaniu. Wysyłaj indywidualne zalecenia lub publikuj globalne ogłoszenia.
      </p>
    </div>

    {/* SEKCJA 1: FORMULARZE */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
      
      {/* FORMULARZ 1: PERSONALNY (Tylko dla 1 pacjenta) */}
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-xl p-5 md:p-8 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <form onSubmit={handleSavePersonalAnnouncement} className="space-y-5">
          <div className="border-b dark:border-slate-800 pb-4 mb-2 flex justify-between items-start">
            <div>
              <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900'}`}>
                <User size={20} /> 1. Komunikat Personalny
              </h4>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isEditingPersonal ? 'Edycja komunikatu' : 'Trafi wyłącznie na konto wybranej osoby'}
              </p>
            </div>
            {isEditingPersonal && (
              <button type="button" onClick={() => { setIsEditingPersonal(false); setPersonalForm({ category: 'zalecenia', font_family: 'Inter, sans-serif', patient_id: '' }) }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"><X size={16}/></button>
            )}
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Wybierz Pacjenta odbiorcę *</label>
            <select
              required
              value={personalForm.patient_id || ''}
              onChange={e => setPersonalForm({ ...personalForm, patient_id: e.target.value })}
              className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            >
              <option value="">-- Wyszukaj pacjenta z bazy danych --</option>
              {patients.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.pesel})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rodzaj sekcji / modułu *</label>
              <select
                value={personalForm.category || 'zalecenia'}
                onChange={e => setPersonalForm({ ...personalForm, category: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="zalecenia">Zalecenia po wizycie</option>
                <option value="wizyty">Wizyty / Konsultacje</option>
                <option value="sciezka">Ścieżka wizyty</option>
                <option value="qr">Check-in QR</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Krój czcionki</label>
              <select
                value={personalForm.font_family || 'Inter, sans-serif'}
                onChange={e => setPersonalForm({ ...personalForm, font_family: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="Inter, sans-serif">Sans-Serif (Nowoczesna/Czysta)</option>
                <option value="Playfair Display, serif">Serif (Elegancka/Premium)</option>
                <option value="JetBrains Mono, monospace">Monospace (Techniczna)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tytuł nagłówka *</label>
            <input required value={personalForm.title || ''} onChange={e => setPersonalForm({ ...personalForm, title: e.target.value })} placeholder="np. Indywidualne zalecenia po zabiegu kwasu" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Opis / Treść wiadomości medycznej</label>
            <textarea rows={4} value={personalForm.description || ''} onChange={e => setPersonalForm({ ...personalForm, description: e.target.value })} placeholder="Wpisz pełną personalną treść dla tego pacjenta..." className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
          </div>

          <div className={`p-4 md:p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zdjęcie / Załącznik graficzny</label>
            <input type="file" accept="image/*" onChange={e => setPersonalImgFile(e.target.files ? e.target.files[0] : null)} className={`text-xs font-medium w-full ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300' : 'text-slate-700 file:bg-white'}`} />
          </div>

          <button type="submit" disabled={updating} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}>
            {updating ? 'Przetwarzanie...' : (isEditingPersonal ? 'Zapisz Zmiany' : 'Wyślij do Karty Pacjenta')}
          </button>
        </form>
      </div>

      {/* FORMULARZ 2: GLOBALNY (Wszyscy pacjenci) */}
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-xl p-5 md:p-8 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <form onSubmit={handleSaveGlobalAnnouncement} className="space-y-5">
          <div className="border-b dark:border-slate-800 pb-4 mb-2 flex justify-between items-start">
            <div>
              <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900'}`}>
                <Users size={20} /> 2. Ogłoszenie Globalne
              </h4>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isEditingGlobal ? 'Edycja ogłoszenia' : 'Wszyscy pacjenci zobaczą to w Portalu'}
              </p>
            </div>
            {isEditingGlobal && (
              <button type="button" onClick={() => { setIsEditingGlobal(false); setGlobalForm({ category: 'standard', font_family: 'Inter, sans-serif' }) }} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"><X size={16}/></button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rodzaj sekcji *</label>
              <select
                value={globalForm.category || 'standard'}
                onChange={e => setGlobalForm({ ...globalForm, category: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="standard">Standard placówki</option>
                <option value="lekarze">Lekarze / Specjaliści</option>
                <option value="promocja">Strefa promocyjna</option>
                <option value="faq">FAQ / Ważne informacje</option>
                <option value="regulamin">Regulamin / Dokumenty</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Krój czcionki</label>
              <select
                value={globalForm.font_family || 'Inter, sans-serif'}
                onChange={e => setGlobalForm({ ...globalForm, font_family: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="Inter, sans-serif">Standardowa (Czytelna)</option>
                <option value="Playfair Display, serif">Elegancka (Serif)</option>
                <option value="JetBrains Mono, monospace">Monospace (Techniczna)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tytuł ogłoszenia globalnego *</label>
            <input required value={globalForm.title || ''} onChange={e => setGlobalForm({ ...globalForm, title: e.target.value })} placeholder="np. Jesienna promocja na laseroterapię" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Opis / Treść ogłoszenia</label>
            <textarea rows={4} value={globalForm.description || ''} onChange={e => setGlobalForm({ ...globalForm, description: e.target.value })} placeholder="Wpisz treść komunikatu widoczną dla wszystkich..." className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
          </div>

          <div className={`p-4 md:p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Dodaj zdjęcie / baner</label>
            <input type="file" accept="image/*" onChange={e => setGlobalImgFile(e.target.files ? e.target.files[0] : null)} className={`text-xs font-medium w-full ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300' : 'text-slate-700 file:bg-white'}`} />
          </div>

          <button type="submit" disabled={updating} className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}>
            {updating ? 'Publikowanie...' : (isEditingGlobal ? 'Zapisz Zmiany' : 'Opublikuj Ogłoszenie')}
          </button>
        </form>
      </div>

    </div>

    {/* SEKCJA 2: LISTY PUBLIKACJI */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 mt-8">
      
      {/* WIDOK: Opublikowane Personalnie */}
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-5 md:p-6 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Treści Personalne ({personalAnnouncements.length})</h4>
          <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zarządzaj tym co wysłano do pacjentów</p>
        </div>
        <div className="p-5 md:p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {personalAnnouncements.length === 0 ? (
            <p className="text-center text-xs font-bold opacity-50 py-8">Brak aktywnych wpisów.</p>
          ) : personalAnnouncements.map((item) => (
            <div key={item.id} className={`p-4 rounded-[20px] border transition-colors ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-200 hover:bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>{item.category}</span>
                <span className={`text-[10px] font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Dla: {item.patients?.first_name} {item.patients?.last_name}</span>
              </div>
              <h5 className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h5>
              <p className={`text-[10px] leading-relaxed line-clamp-2 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
              
              <div className={`pt-3 border-t flex justify-end gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <button onClick={() => { setPersonalForm(item); setIsEditingPersonal(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-white border text-blue-600 hover:bg-slate-100'}`}><Edit3 size={14} /></button>
                <button onClick={() => handleDeletePersonal(item.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WIDOK: Opublikowane Globalnie */}
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-5 md:p-6 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Treści Globalne ({globalAnnouncements.length})</h4>
          <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zarządzaj tablicą informacyjną</p>
        </div>
        <div className="p-5 md:p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {globalAnnouncements.length === 0 ? (
            <p className="text-center text-xs font-bold opacity-50 py-8">Brak aktywnych wpisów.</p>
          ) : globalAnnouncements.map((item) => (
            <div key={item.id} className={`p-4 rounded-[20px] border transition-colors ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-200 hover:bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>{item.category}</span>
                <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Wszyscy pacjenci</span>
              </div>
              <h5 className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h5>
              <p className={`text-[10px] leading-relaxed line-clamp-2 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
              
              <div className={`pt-3 border-t flex justify-end gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <button onClick={() => { setGlobalForm(item); setIsEditingGlobal(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-white border text-blue-600 hover:bg-slate-100'}`}><Edit3 size={14} /></button>
                <button onClick={() => handleDeleteGlobal(item.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  </div>
)}


{/* ============================================================================ */}
{/* DOKUMENTACJA I WYWIAD MEDYCZNY (Dawne 'materialy') */}
{/* ============================================================================ */}
{activeTab === 'materialy' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* HEADER */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <ShieldCheck size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Zarządzanie Pacjentem i Dokumentacją
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Kontrola Karty 360, weryfikacja wywiadów medycznych, wysyłka zgód i zarządzanie historią leczenia.
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <HelpButton sectionKey="medical_docs" />
        <button
          type="button"
          onClick={openNewConsentTemplateCreator}
          className={`shrink-0 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Sparkles size={14} />
          Kreator Zgód AI
        </button>
      </div>
    </div>

    {/* SMART ALERT (Sygnalizacja bezpieczeństwa prawnego) */}
    <div className={`rounded-[24px] border p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors ${isDarkMode ? 'bg-gradient-to-r from-red-950/40 to-[#0f172a] border-red-900/50' : 'bg-gradient-to-r from-red-50 to-white border-red-100'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            Legal & Safety Guard
          </p>
          <h4 className={`text-sm md:text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Wykryto braki w dokumentacji na dzisiejsze wizyty
          </h4>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            System weryfikuje statusy na żywo. Część umówionych pacjentów nie uzupełniła wywiadu medycznego lub nie zaakceptowała zgody zabiegowej. Nie dopuszczaj ich do gabinetu przed uzupełnieniem dokumentacji cyfrowej.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* KOLUMNA 1: CENTRUM DOWODZENIA RECEPCJI (Wizyty i Baza Pacjentów) */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* SEKCJA A: PACJENCI WYMAGAJACY DOKUMENTACJI */}
        <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pacjenci wymagajacy dokumentacji</h4>
              <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Widok oparty tylko o patients, patient_consents i medical_consent_templates</p>
            </div>
            <div className="relative w-full md:w-64 shrink-0">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Szukaj pacjenta..."
                value={todayPatientSearch}
                onChange={e => setTodayPatientSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`}
              />
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {patients.length === 0 ? (
              <div className={`p-8 text-center text-xs font-bold border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                Brak pacjentow w nowej bazie patients.
              </div>
            ) : (
              patients
                .filter(patient => {
                  const query = todayPatientSearch.toLowerCase()
                  const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase()
                  const pesel = String(patient.pesel || '')
                  const phone = String(patient.phone || '')
                  return fullName.includes(query) || pesel.includes(todayPatientSearch) || phone.includes(todayPatientSearch)
                })
                .filter(patient => {
                  const consents = patientConsentsByPatientId[patient.id] || []
                  const summary = getPatientDocumentSummary(consents)
                  return consents.length === 0 || summary.hasPendingDocs || summary.hasMissingQuestionnaire
                })
                .map(patient => {
                  const rowKey = `docs-${patient.id}`
                  const isExpanded = expandedPatientDocs === rowKey
                  const consents = patientConsentsByPatientId[patient.id] || []
                  const docSummary = getPatientDocumentSummary(consents)
                  const isCritical = consents.length === 0 || docSummary.hasPendingDocs
                  const warningLabel = consents.length === 0
                    ? 'Brak dokumentacji pacjenta'
                    : `${docSummary.pendingDocs.length} dokumentów do podpisu`

                  return (
                    <div key={patient.id} className={`rounded-[24px] border shadow-sm transition-colors overflow-hidden ${
                      isCritical ? (isDarkMode ? 'bg-[#1e293b] border-red-900/50' : 'bg-white border-red-200') :
                      (isDarkMode ? 'bg-[#1e293b] border-amber-700/50' : 'bg-white border-amber-200')
                    }`}>
                      <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isCritical ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600') :
                            (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600')
                          }`}>
                            {isCritical ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                          </div>
                          <div className="min-w-0">
                            <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {patient.first_name} {patient.last_name}
                            </h5>
                            <p className={`text-xs font-bold mt-0.5 ${
                              isCritical ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
                              (isDarkMode ? 'text-amber-400' : 'text-amber-600')
                            }`}>
                              {warningLabel}
                            </p>
                            <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              PESEL: {patient.pesel || 'brak'} | Tel: {patient.phone || 'brak'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => openPatientTemplateSender(patient.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                          >
                            Wyślij dokumenty
                          </button>
                          <button
                            onClick={() => setExpandedPatientDocs(isExpanded ? null : rowKey)}
                            className={`p-2 rounded-xl border transition-all ${isExpanded ? (isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-900') : (isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}`}
                            title="Zobacz dokumenty pacjenta"
                          >
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {expandedPatientSendId === patient.id && (
                        <div className={`px-5 pb-5 animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
                          <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                              <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Wybierz dokumenty do wysłania
                                </p>
                                <p className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  Każdy wybrany dokument pojawi się u pacjenta jako do podpisu.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSendSelectedTemplatesToPatient(patient.id)}
                                disabled={updating || selectedTemplatesForPatientSend.length === 0}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                              >
                                {updating ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                                Wyślij wybrane ({selectedTemplatesForPatientSend.length})
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                              {consentTemplates.length === 0 ? (
                                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Brak szablonów dokumentów w bazie.
                                </p>
                              ) : consentTemplates.map((template: any) => {
                                const checked = selectedTemplatesForPatientSend.includes(template.id)
                                return (
                                  <label
                                    key={template.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                      checked
                                        ? (isDarkMode ? 'bg-blue-900/20 border-blue-700 text-white' : 'bg-blue-50 border-blue-300 text-slate-900')
                                        : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300')
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePatientTemplateSelection(template.id)}
                                      className="mt-0.5"
                                    />
                                    <span className="min-w-0">
                                      <span className="block text-[9px] font-black uppercase tracking-widest opacity-70">{getTemplateTypeLabel(template)}</span>
                                      <span className="block text-xs font-black truncate">{template.title}</span>
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div className={`p-5 border-t animate-in slide-in-from-top-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <h6 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Dokumentacja pacjenta: {patient.first_name} {patient.last_name}
                            </h6>
                            <button
                              onClick={() => {
                                setScanUploadForm({ patient_id: patient.id, template_id: '', file: null, preview: null })
                                setIsScanUploadModalOpen(true)
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                            >
                              <Plus size={12} className="inline mr-1" /> Wgraj skan
                            </button>
                          </div>

                          <div className="space-y-2">
                            {consents.length === 0 ? (
                              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak dokumentacji dla tego pacjenta.</p>
                            ) : consents.map((consent: any) => {
                              const statusMeta = getConsentStatusMeta(consent)
                              const StatusIcon = statusMeta.icon
                              return (
                              <div key={consent.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${statusMeta.cardClass}`}>
                                <div className="min-w-0 flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${statusMeta.iconClass}`}>
                                    <StatusIcon size={16} />
                                  </div>
                                  <div>
                                    <p className={`font-black text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {getConsentTemplateTitle(consent)}
                                      <span className={`ml-2 px-2 py-0.5 rounded-md border text-[9px] uppercase ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                                    </p>
                                    <p className={`text-[9px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {isConsentConfirmed(consent) ? 'Potwierdzono' : 'Wysłano'}: {getConsentDateLabel(consent)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  {!isConsentConfirmed(consent) && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkConsentSigned(consent.id)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                    >
                                      Potwierdź ręcznie
                                    </button>
                                  )}
                                  {consent.file_url && (
                                    <a href={consent.file_url} target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`} title="Pobierz PDF">
                                      <Download size={14}/>
                                    </a>
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
                })
            )}
          </div>
        </div>
        {/* SEKCJA B: PEŁNA BAZA PACJENTÓW (Mapowanie żywych danych z Supabase) */}
        <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors mt-8 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 md:p-6 border-b flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <h4 className={`font-black flex items-center gap-2 text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Users size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
                Baza Wszystkich Pacjentów ({patients.length})
              </h4>
              <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Archiwum zgód i wywiadów z poprzednich wizyt</p>
            </div>
            <div className="relative w-full xl:w-80 shrink-0">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Szukaj (Imię, Nazwisko, PESEL, Telefon)..."
                value={allPatientSearch}
                onChange={e => setAllPatientSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`}
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className={`text-[9px] font-black uppercase tracking-widest border-b sticky top-0 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-500' : 'bg-slate-50/90 border-slate-200 text-slate-400'} backdrop-blur-md z-10`}>
                <tr>
                  <th className="p-4 pl-6">Pacjent</th>
                  <th className="p-4">PESEL / Telefon</th>
                  <th className="p-4">Zgody Medyczne</th>
                  <th className="p-4 text-center">Status Wywiadu</th>
                  <th className="p-4 pr-6 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center font-bold text-sm text-slate-400">
                      Ładowanie bazy pacjentów lub brak danych...
                    </td>
                  </tr>
                ) : (
                  patients
                  .filter(p => {
                    const query = allPatientSearch.toLowerCase()
                    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
                    const pesel = String(p.pesel || '')
                    const phone = String(p.phone || '')
                    return fullName.includes(query) || pesel.includes(allPatientSearch) || phone.includes(allPatientSearch)
                  })
                  .map(patient => {
                    const isExpanded = expandedPatientDocs === patient.id;
                    const consents = patientConsentsByPatientId[patient.id] || [];
                    const docSummary = getPatientDocumentSummary(consents);
                    const questionnaireStatus = docSummary.hasMissingQuestionnaire
                      ? { label: 'Brak wywiadu', icon: XCircle, className: isDarkMode ? 'bg-red-900/20 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200' }
                      : docSummary.hasPendingQuestionnaire
                        ? { label: 'Wywiad do podpisu', icon: XCircle, className: isDarkMode ? 'bg-red-900/20 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200' }
                        : { label: 'Potwierdzony', icon: CheckCircle2, className: isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                    const QuestionnaireIcon = questionnaireStatus.icon;
                    
                    return (
                      <React.Fragment key={patient.id}>
                        <tr className={`transition-colors group ${isExpanded ? (isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50') : (isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50')}`}>
                          <td className="p-4 pl-6">
                            <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{patient.first_name} {patient.last_name}</p>
                            <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{patient.email || 'Brak email'}</p>
                          </td>
                          <td className="p-4">
                            <p className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{patient.pesel || '-'}</p>
                            <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{patient.phone || '-'}</p>
                          </td>
                          <td className={`p-4 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {consents.length} dokumentów
                            {docSummary.pendingDocs.length > 0 && (
                              <span className={isDarkMode ? 'block mt-1 text-red-400' : 'block mt-1 text-red-600'}>
                                {docSummary.pendingDocs.length} do podpisu
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${questionnaireStatus.className}`}>
                              <QuestionnaireIcon size={10}/> {questionnaireStatus.label}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => openPatientTemplateSender(patient.id)}
                              className={`mr-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${expandedPatientSendId === patient.id ? (isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]') : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}`}
                            >
                              Wyślij
                            </button>
                            <button 
                              onClick={() => setExpandedPatientDocs(isExpanded ? null : patient.id)}
                              className={`p-2 rounded-lg transition-all border ${isExpanded ? (isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-900') : (isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800')}`}
                            >
                              <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>

                        {expandedPatientSendId === patient.id && (
                          <tr className={isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/30'}>
                            <td colSpan={5} className="p-0">
                              <div className={`p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                    <div>
                                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Wyślij dokumenty do Portalu Pacjenta
                                      </p>
                                      <p className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                        Zaznacz wywiad, RODO, zalecenia lub zgodę. Wszystkie trafią jako do podpisu.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleSendSelectedTemplatesToPatient(patient.id)}
                                      disabled={updating || selectedTemplatesForPatientSend.length === 0}
                                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                                    >
                                      {updating ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                                      Wyślij wybrane ({selectedTemplatesForPatientSend.length})
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                    {consentTemplates.length === 0 ? (
                                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Brak szablonów dokumentów w bazie.
                                      </p>
                                    ) : consentTemplates.map((template: any) => {
                                      const checked = selectedTemplatesForPatientSend.includes(template.id)
                                      return (
                                        <label
                                          key={template.id}
                                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            checked
                                              ? (isDarkMode ? 'bg-blue-900/20 border-blue-700 text-white' : 'bg-blue-50 border-blue-300 text-slate-900')
                                              : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300')
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePatientTemplateSelection(template.id)}
                                            className="mt-0.5"
                                          />
                                          <span className="min-w-0">
                                            <span className="block text-[9px] font-black uppercase tracking-widest opacity-70">{getTemplateTypeLabel(template)}</span>
                                            <span className="block text-xs font-black truncate">{template.title}</span>
                                          </span>
                                        </label>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        
                        {/* Szufladka z pełną historią pacjenta */}
                        {isExpanded && (
                          <tr className={isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/30'}>
                            <td colSpan={5} className="p-0 border-t-0">
                              <div className={`p-5 md:p-6 shadow-inner animate-in slide-in-from-top-2 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-100/50'}`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h6 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Historia dokumentacji: {patient.first_name} {patient.last_name}
                                  </h6>
                                  <button 
                                    onClick={() => {
                                      setScanUploadForm({ patient_id: patient.id, template_id: '', file: null, preview: null });
                                      setIsScanUploadModalOpen(true);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                  >
                                    <Download size={12} /> Wgraj archiwalny skan
                                  </button>
                                </div>
                                
                                {/* Prawdziwa Lista historycznych zgód pacjenta */}
                                <div className="space-y-2">
                                  {consents.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-bold">Pacjent nie ma jeszcze wgranych żadnych zgód ani wywiadów.</p>
                                  ) : (
                                    consents.map((consent: any) => {
                                      const statusMeta = getConsentStatusMeta(consent)
                                      const StatusIcon = statusMeta.icon
                                      return (
                                      <div key={consent.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${statusMeta.cardClass}`}>
                                        <div className="min-w-0 flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${statusMeta.iconClass}`}>
                                            <StatusIcon size={16} />
                                          </div>
                                          <div>
                                            <p className={`font-black text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                              {getConsentTemplateTitle(consent)}
                                              <span className={`ml-2 px-2 py-0.5 rounded-md border text-[9px] uppercase ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                                            </p>
                                            <p className={`text-[9px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                              {isConsentConfirmed(consent) ? 'Potwierdzono' : 'Wysłano'}: {getConsentDateLabel(consent)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          {!isConsentConfirmed(consent) && (
                                            <button
                                              type="button"
                                              onClick={() => handleMarkConsentSigned(consent.id)}
                                              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            >
                                              Potwierdź ręcznie
                                            </button>
                                          )}
                                          {consent.file_url && (
                                            <a href={consent.file_url} target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`} title="Pobierz PDF"><Download size={14}/></a>
                                          )}
                                        </div>
                                      </div>
                                      )
                                    })
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KOLUMNA 2: BIBLIOTEKA SZABLONÓW (Pogrupowana Prawnie) */}
      <div className="xl:col-span-1 space-y-4">
        
        {/* NAGŁÓWEK I WYSZUKIWARKA */}
        <div className={`p-5 rounded-[24px] border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FileIcon size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-600'}/> Baza Szablonów
            </h4>
            <span className={`px-2 py-1 text-[10px] font-black rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {consentTemplates.length} dok.
            </span>
          </div>
          
          <div className="relative">
            <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Szukaj zgody / wywiadu..."
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
            />
          </div>
        </div>
        
        {/* LISTA SZABLONÓW POGRUPOWANA W KATEGORIE */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-2">
          {consentTemplates.length === 0 ? (
            <div className={`p-8 text-center border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <p className="text-xs font-bold">Brak szablonów w bazie.</p>
              <p className="text-[10px] mt-1">Utwórz pierwszy wywiad lub zgodę.</p>
            </div>
          ) : (
            [
              { title: '1. Dokumenty prawne (RODO / upoważnienia)', types: ['rodo', 'info'] },
              { title: '2. Wywiady medyczne (kwalifikacja)', types: ['questionnaire'] },
              { title: '3. Świadome zgody na zabieg', types: ['consent'] }
            ].map(group => {
              const groupTemplates = consentTemplates
                .filter((template: any) => group.types.includes(template.document_type || 'consent'))
                .filter((template: any) =>
                  (template.title || '').toLowerCase().includes(templateSearch.toLowerCase())
                  || (template.document_type || '').toLowerCase().includes(templateSearch.toLowerCase())
                )

              if (groupTemplates.length === 0) return null

              return (
                <div key={group.title} className="space-y-3">
                  <h6 className={`text-[10px] font-black uppercase tracking-widest pl-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {group.title}
                  </h6>

                  {groupTemplates.map((template: any) => {
                return (
                  <div key={template.id} className={`rounded-[20px] border shadow-sm transition-all overflow-hidden ${!template.is_active ? (isDarkMode ? 'opacity-60 bg-slate-900 border-slate-800' : 'opacity-70 bg-slate-50 border-slate-200') : (isDarkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300')}`}>
                    
                    {/* INFO O SZABLONIE */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                            template.document_type === 'questionnaire' 
                              ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200')
                                : template.document_type === 'rodo' || template.document_type === 'info'
                                ? (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200')
                                : (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                          }`}>
                            {template.document_type === 'questionnaire' ? 'Wywiad' : template.document_type === 'rodo' ? 'RODO' : template.document_type === 'info' ? 'Upoważnienie' : 'Zgoda'}
                          </span>
                          
                          {template.is_global_required && (
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-rose-900/30 text-rose-400 border-rose-800/50' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              Wymagane
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-1 shrink-0">
                          <button 
                            onClick={() => {
                              let parsedQuestions = [];
                              if (template.document_type === 'questionnaire') {
                                  try { parsedQuestions = JSON.parse(template.content_template); } catch(e) {}
                                  if(!Array.isArray(parsedQuestions)) parsedQuestions = [];
                              }
                              setConsentTemplateForm({ ...template, questions: parsedQuestions });
                              setIsEditingConsentTemplate(true);
                              setIsConsentTemplateModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Edytuj szablon"
                          >
                            <Edit3 size={14}/>
                          </button>
                        </div>
                      </div>
                      
                      <h5 className={`font-black text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{template.title}</h5>
                      {template.description && (
                        <p className={`text-[10px] mt-1 font-medium leading-relaxed line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {template.description}
                        </p>
                      )}
                    </div>
                    
                    {/* AKCJE */}
                    <div className={`border-t flex ${isDarkMode ? 'border-slate-800/60 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                      <button 
                        onClick={() => window.print()} 
                        className={`flex-1 p-2.5 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                        title="Wydrukuj czysty formularz (np. dla pacjenta w poczekalni)"
                      >
                        <Printer size={12}/> Drukuj Pusty
                      </button>
                    </div>

                  </div>
                )
                  })}
                </div>
              )
            })
          )}
        </div>
        
        <button 
          type="button"
          onClick={openNewConsentTemplateCreator}
          className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a] hover:bg-[#d8bd65]' : 'bg-slate-900 text-[#e8ce7a] hover:bg-black'}`}
        >
          <Sparkles size={16} /> Kreator Zgód AI
        </button>
      </div>
    </div>

    {/* ============================================================================ */}
    {/* MODAL 1: WGRYWANIE SKANU PAPIEROWEGO DO KARTY PACJENTA */}
    {/* ============================================================================ */}
    {isScanUploadModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Download size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
                Otaguj dokument
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Przypisz wgrany skan do konkretnego pacjenta i typu dokumentu.
              </p>
            </div>
            <button
              onClick={() => {
                setIsScanUploadModalOpen(false)
                setScanUploadForm({ patient_id: '', template_id: '', file: null, preview: null })
              }}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-2xl border flex items-center justify-center overflow-hidden bg-slate-100 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300'}`} style={{ minHeight: '250px' }}>
              {scanUploadForm.preview ? (
                <img src={scanUploadForm.preview} alt="Podgląd skanu" className="max-w-full max-h-[300px] object-contain" />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <FileIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-wider">Dokument PDF</p>
                </div>
              )}
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!scanUploadForm.patient_id || !scanUploadForm.template_id) {
                return showNotification('Wybierz pacjenta i szablon dokumentu.', 'error')
              }

              setUpdating(true)
              try {
                const uploadedFileUrl = await uploadFile(
                  scanUploadForm.file,
                  scanUploadForm.patient_id,
                  `patient-consent-${scanUploadForm.template_id}`
                )

                const { error } = await supabase.from('patient_consents').insert([{
                  event_id: id,
                  patient_id: scanUploadForm.patient_id,
                  template_id: scanUploadForm.template_id,
                  status: 'scanned_document',
                  file_url: uploadedFileUrl,
                  signed_at: new Date().toISOString()
                }])

                if (error) throw error

                showNotification('Dokument pomyślnie połączony z Kartą Pacjenta!', 'success')
                await loadPatientConsents()
                setScanUploadForm({ patient_id: '', template_id: '', file: null, preview: null })
                setIsScanUploadModalOpen(false)
              } catch (err: any) {
                showNotification('Błąd zapisu skanu: ' + err.message, 'error')
              } finally {
                setUpdating(false)
              }
            }} className="space-y-5">

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  1. Wybierz Pacjenta *
                </label>
                <select
                  required
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={scanUploadForm.patient_id}
                  onChange={e => setScanUploadForm({ ...scanUploadForm, patient_id: e.target.value })}
                >
                  <option value="">-- Wyszukaj pacjenta --</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} ({patient.pesel || patient.phone || 'brak identyfikatora'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  2. Czego dotyczy dokument? *
                </label>
                <select
                  required
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={scanUploadForm.template_id}
                  onChange={e => setScanUploadForm({ ...scanUploadForm, template_id: e.target.value })}
                >
                  <option value="">-- Wybierz szablon z bazy --</option>
                  {consentTemplates.map((template: any) => (
                    <option key={template.id} value={template.id}>{template.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  3. Plik / zdjęcie dokumentu
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setScanUploadForm({
                      ...scanUploadForm,
                      file,
                      preview: file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
                    })
                  }}
                />
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200/50'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  <ShieldCheck size={12}/> Audyt systemowy
                </p>
                <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-emerald-500/80' : 'text-emerald-800'}`}>
                  Ten plik zostanie wgrany z Twoim podpisem cyfrowym jako pracownika weryfikującego (Osoba z recepcji).
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}
              >
                {updating ? 'Zapisywanie...' : 'Zapisz w Karcie 360'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* ============================================================================ */}
    {/* MODAL 2: KREATOR SZABLONÓW ZGÓD (Baza Managera) */}
    {/* ============================================================================ */}
    {isConsentTemplateModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
                Kreator Szablonu Dokumentu
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Dodaj nowy wzór, który pacjenci będą akceptować w swoim panelu cyfrowym.
              </p>
            </div>
            <button
              onClick={() => setIsConsentTemplateModalOpen(false)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault()
            setUpdating(true)

            try {
              const payload: any = {
                event_id: id,
                title: consentTemplateForm.title,
                description: consentTemplateForm.description || null,
                document_type: consentTemplateForm.document_type || 'consent',
                required_for_treatment: consentTemplateForm.required_for_treatment || null,
                validity_months: consentTemplateForm.validity_months ? Number(consentTemplateForm.validity_months) : null,
                version: Number(consentTemplateForm.version || 1),
                is_global_required: !!consentTemplateForm.is_global_required,
                is_active: consentTemplateForm.is_active !== false,
                content_template: consentTemplateForm.content_template || ''
              }

              if (payload.document_type === 'questionnaire') {
                payload.content_template = JSON.stringify(consentTemplateForm.questions || [])
              }

              if (isEditingConsentTemplate && consentTemplateForm.id) {
                const { error } = await supabase
                  .from('medical_consent_templates')
                  .update(payload)
                  .eq('id', consentTemplateForm.id)

                if (error) throw error
                showNotification('Szablon dokumentu został zaktualizowany w bazie danych.', 'success')
              } else {
                const { error } = await supabase
                  .from('medical_consent_templates')
                  .insert([payload])

                if (error) throw error
                showNotification('Nowy szablon dokumentu został trwale zapisany w bazie.', 'success')
              }

              await loadConsentTemplates()
              setConsentTemplateForm({})
              setIsEditingConsentTemplate(false)
              setIsConsentTemplateModalOpen(false)
            } catch (err: any) {
              console.error('Błąd zapisu dokumentu:', err)
              showNotification('Krytyczny błąd bazy danych: ' + (err?.message || 'Nieznany błąd'), 'error')
            } finally {
              setUpdating(false)
            }
          }} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tytuł dokumentu *
                </label>
                <input
                  required
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={consentTemplateForm.title || ''}
                  onChange={e => setConsentTemplateForm({ ...consentTemplateForm, title: e.target.value })}
                  placeholder="np. Zgoda na modelowanie ust"
                />
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Typ dokumentu
                </label>
                <select
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={consentTemplateForm.document_type || 'consent'}
                  onChange={e => setConsentTemplateForm({ ...consentTemplateForm, document_type: e.target.value })}
                >
                  <option value="consent">Zgoda na zabieg (Oświadczenie)</option>
                  <option value="questionnaire">Wywiad Medyczny (Ankieta)</option>
                  <option value="rodo">Klauzula RODO / Regulamin</option>
                  <option value="info">Informacja / Zalecenia po</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Przypisz do zabiegu
                </label>
                <input
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={consentTemplateForm.required_for_treatment || ''}
                  onChange={e => setConsentTemplateForm({ ...consentTemplateForm, required_for_treatment: e.target.value })}
                  placeholder="np. Laseroterapia (opcjonalnie)"
                />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ważność dokumentu (Miesiące)
                </label>
                <input
                  type="number"
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={consentTemplateForm.validity_months || ''}
                  onChange={e => setConsentTemplateForm({ ...consentTemplateForm, validity_months: Number(e.target.value) })}
                  placeholder="np. 6 (Zostaw puste = Bezterminowo)"
                />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Numer wersji
                </label>
                <input
                  type="number"
                  readOnly
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  value={consentTemplateForm.version || 1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-5 border-slate-200 dark:border-slate-800">
              {[
                {
                  key: 'is_global_required',
                  title: 'Wymagane globalnie',
                  desc: 'Każdy pacjent musi to podpisać (np. RODO)'
                },
                {
                  key: 'is_active',
                  title: 'Szablon Aktywny',
                  desc: 'Dostępny do wyboru przez recepcję i pacjentów'
                }
              ].map(item => {
                const isChecked = consentTemplateForm[item.key] === true;
                return (
                  <label
                    key={item.key}
                    className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isChecked
                        ? (isDarkMode ? 'border-[#e8ce7a] bg-slate-900' : 'border-slate-900 bg-slate-50')
                        : (isDarkMode ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-white')
                    }`}
                  >
                    <div>
                      <p className={`font-black text-sm ${isChecked ? (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900') : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                        {item.title}
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => setConsentTemplateForm({ ...consentTemplateForm, [item.key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isChecked
                        ? (isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-white')
                        : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')
                    }`}>
                      {isChecked && <CheckCircle2 size={14} />}
                    </div>
                  </label>
                )
              })}
            </div>

            <div>
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between gap-3">
                  <label className={`text-[10px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Treść Szablonu / Pytania
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => openAiTextAssist({
                    eventId: id,
                    sectionKey: 'medical_documents',
                    fieldKey: 'content_template',
                    currentValue: consentTemplateForm.content_template || '',
                    relatedEntityTitle: consentTemplateForm.required_for_treatment || consentTemplateForm.title || '',
                    documentType: consentTemplateForm.document_type || 'consent',
                    mode: 'medical_document',
                    placeholder: 'Tu pojawi się roboczy szkic zgody, wywiadu lub zaleceń do zatwierdzenia.',
                    onApply: (text: string) => setConsentTemplateForm((prev: any) => ({ ...prev, content_template: text }))
                  })}
                  className={`w-full rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${isDarkMode ? 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-500/30' : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}
                >
                  <Sparkles size={16} /> Utwórz z pomocą AI
                </button>
                <p className={`text-[10px] font-medium leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  AI przygotuje roboczy szkic dokumentu medycznego. Przed użyciem z pacjentem zatwierdź treść medycznie i prawnie.
                </p>
              </div>
              <textarea
                rows={10}
                className={`w-full border rounded-xl px-4 py-4 text-sm font-medium outline-none resize-y transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={consentTemplateForm.content_template || ''}
                onChange={e => setConsentTemplateForm({ ...consentTemplateForm, content_template: e.target.value })}
                placeholder="Tutaj wpisz treść zgody (możesz używać znaczników takich jak [IMIE_PACJENTA] czy [DATA] - system podmieni je automatycznie podczas generowania PDF)."
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}
            >
              Zapisz Szablon w Bazie
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ============================================================================ */}
{/* ZABIEGI I WIZYTY (Zarządzanie Katalogiem i Rejestracja) - Wersja Ostateczna */}
{/* ============================================================================ */}
{activeTab === 'harmonogram' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Stethoscope size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Rejestracja Wizyt i Katalog
        </h3>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEWA KOLUMNA: ZAPLANOWANE WIZYTY */}
      <div className="xl:col-span-2 space-y-6">
        <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Umówione Wizyty</h4>
            </div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 shrink-0 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
            >
              <CalendarPlus size={14} /> Umów Pacjenta
            </button>
          </div>

          <div className="p-5 md:p-6 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {appointmentsList.length === 0 ? (
              <div className={`p-8 text-center text-xs font-bold border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                Brak zaplanowanych wizyt.
              </div>
            ) : appointmentsList.map(app => {
              // Szukamy lekarza z relacji
              const doctor = doctorsList.find(d => d.id === app.doctor_id);
              return (
                <div key={app.id} className={`p-5 rounded-[24px] border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h5 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {app.patients?.first_name} {app.patients?.last_name}
                      </h5>
                      <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {app.treatment_name}
                      </p>
                      <div className={`flex items-center gap-3 text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(app.appointment_date).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        {doctor && <span className="flex items-center gap-1"><Stethoscope size={12} /> {doctor.first_name} {doctor.last_name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 pt-3 md:pt-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${app.status === 'completed' ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : (isDarkMode ? 'bg-amber-900/20 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')}`}>
                      {app.status === 'scheduled' ? 'Zaplanowana' : 'Zakończona'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* PRAWA KOLUMNA: KATALOG ZABIEGÓW */}
      <div className="xl:col-span-1 space-y-4">
        <div className={`p-5 rounded-[24px] border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <ListChecks size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-600'}/> Katalog Zabiegów
            </h4>
          </div>
          
          <div className="relative mb-4">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Szukaj po nazwie zabiegu lub lekarzu..."
              value={treatmentSearch}
              onChange={e => setTreatmentSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
            />
          </div>

          <button
            onClick={() => {
              setTreatmentForm({ is_active: true, type: 'single', sessions_count: 1, treatment_category: 'standard' })
              setSelectedTemplatesForTreatment([])
              setIsEditingTreatment(false)
              setIsTreatmentModalOpen(true)
            }}
            className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'}`}
          >
            <Plus size={14} /> Stwórz Zabieg
          </button>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-2">
          {treatments
            .filter(t => {
              const query = treatmentSearch.toLowerCase();
              const doctor = doctorsList.find(d => d.id === t.doctor_id);
              const docName = doctor ? `${doctor.first_name} ${doctor.last_name}`.toLowerCase() : '';
              return String(t.name || '').toLowerCase().includes(query) || docName.includes(query);
            })
            .map(treatment => {
              const requiredConsentsCount = treatmentMappings.filter((m:any) => m.treatment_id === treatment.id).length;
              const doctor = doctorsList.find(d => d.id === treatment.doctor_id);
              
              return (
                <div key={treatment.id} className={`p-4 rounded-[20px] border transition-all ${!treatment.is_active ? 'opacity-50' : ''} ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${treatment.type === 'series' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200') : (isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200')}`}>
                      {treatment.type === 'series' ? 'Seria' : 'Pojedynczy'}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setTreatmentForm(treatment);
                          setSelectedTemplatesForTreatment(treatmentMappings.filter((m:any) => m.treatment_id === treatment.id).map((m:any) => m.template_id));
                          setIsEditingTreatment(true);
                          setIsTreatmentModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                  <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{treatment.name}</h5>
                  <div className={`mt-2 text-[10px] space-y-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {doctor && <p className="flex items-center gap-1.5"><Stethoscope size={12}/> {doctor.first_name} {doctor.last_name}</p>}
                    <p className="flex items-center gap-1.5">
                      <FileSignature size={12} className={requiredConsentsCount > 0 ? 'text-emerald-500' : 'opacity-50'}/> 
                      Wymaga {requiredConsentsCount} zgód
                    </p>
                  </div>
                </div>
              )
          })}
        </div>
      </div>
    </div>

    {/* ============================================================================ */}
    {/* MODAL: PROSTE UMAWIANIE WIZYTY (Tylko Pacjent, Zabieg i Data) */}
    {/* ============================================================================ */}
    {isBookingModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-slate-800 border-slate-100">
            <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <CalendarPlus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
              Umów Wizytę
            </h3>
            <button onClick={() => setIsBookingModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleBookAppointment} className="space-y-5">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>1. Wybierz pacjenta *</label>
              <select 
                required
                value={appointmentForm.patient_id}
                onChange={e => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="">-- Wyszukaj pacjenta --</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.pesel})</option>)}
              </select>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>2. Wybierz zabieg z katalogu *</label>
              <select 
                required
                value={appointmentForm.treatment_id}
                onChange={e => {
                  const selectedTreatment = treatments.find((t: any) => t.id === e.target.value)
                  setAppointmentForm({
                    ...appointmentForm,
                    treatment_id: e.target.value,
                    price_amount: selectedTreatment?.price_amount ?? '',
                    currency: selectedTreatment?.currency || appointmentForm.currency || 'PLN'
                  })
                }}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="">-- Wybierz usługę z bazy --</option>
                {treatments.filter(t => t.is_active).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.price_amount ? ` - ${Number(t.price_amount).toLocaleString('pl-PL')} ${t.currency || 'PLN'}` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[9px] mt-2 opacity-60 px-1">Lekarz i preparaty zostaną przypisane automatycznie na podstawie definicji zabiegu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>3. Data i godzina *</label>
              <input 
                required
                type="datetime-local"
                value={appointmentForm.appointment_date}
                onChange={e => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cena wizyty</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={appointmentForm.price_amount}
                    onChange={e => setAppointmentForm({ ...appointmentForm, price_amount: e.target.value })}
                    placeholder="0.00"
                    className={`min-w-0 flex-1 border rounded-xl px-4 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <select
                    value={appointmentForm.currency}
                    onChange={e => setAppointmentForm({ ...appointmentForm, currency: e.target.value })}
                    className={`w-24 border rounded-xl px-3 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  >
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" disabled={updating}
              className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
            >
              {updating ? 'Przetwarzanie...' : 'Zapisz Pacjenta i Generuj Dokumenty'}
            </button>
          </form>
        </div>
      </div>
    )}

    {/* ============================================================================ */}
    {/* MODAL: MEGA KREATOR ZABIEGU W KATALOGU (Pełne definiowanie) */}
    {/* ============================================================================ */}
    {isTreatmentModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-start mb-6 border-b pb-4 dark:border-slate-800 border-slate-100">
            <div>
              <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {isEditingTreatment ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Layers size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
                {isEditingTreatment ? 'Edytuj Definicję Zabiegu' : 'Stwórz Nowy Zabieg'}
              </h3>
            </div>
            <button onClick={() => setIsTreatmentModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSaveTreatment} className="space-y-6">
            
            {/* 1. DANE PODSTAWOWE */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900'}`}>1. Podstawowe dane</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nazwa zabiegu *</label>
                  <input required value={treatmentForm.name || ''} onChange={e => setTreatmentForm({ ...treatmentForm, name: e.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Typ usługi</label>
                  <select value={treatmentForm.type || 'single'} onChange={e => setTreatmentForm({ ...treatmentForm, type: e.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                    <option value="single">Pojedyncza wizyta</option>
                    <option value="series">Seria zabiegów</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                <div className="md:col-span-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cena katalogowa zabiegu</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treatmentForm.price_amount ?? ''}
                    onChange={e => setTreatmentForm({ ...treatmentForm, price_amount: e.target.value })}
                    placeholder="np. 450.00"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Waluta</label>
                  <select
                    value={treatmentForm.currency || 'PLN'}
                    onChange={e => setTreatmentForm({ ...treatmentForm, currency: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  >
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              {treatmentForm.type === 'series' && (
                <div className="mt-4">
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Liczba wizyt w serii</label>
                  <input type="number" min="2" value={treatmentForm.sessions_count || 2} onChange={e => setTreatmentForm({ ...treatmentForm, sessions_count: parseInt(e.target.value) })} className={`w-full md:w-1/3 border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
                </div>
              )}
            </div>

            {/* 2. SPECYFIKACJA MEDYCZNA */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900'}`}>2. Specyfikacja (Sprzęt i Personel)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Domyślny Lekarz *</label>
                  <select required value={treatmentForm.doctor_id || ''} onChange={e => setTreatmentForm({ ...treatmentForm, doctor_id: e.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                    <option value="">-- Wybierz z personelu --</option>
                    {doctorsList.map((d: any) => <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.title})</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Preparat / Sprzęt</label>
                  <select value={treatmentForm.preparation_id || ''} onChange={e => setTreatmentForm({ ...treatmentForm, preparation_id: e.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                    <option value="">-- Opcjonalnie --</option>
                    {preparationsList.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.sponsor_name || p.first_name || p.title || 'Preparat bez nazwy'}
                        {p.sponsor_category || p.company ? ` (${p.sponsor_category || p.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rodzaj inwazyjności *</label>
                  <select required value={treatmentForm.treatment_category || 'standard'} onChange={e => setTreatmentForm({ ...treatmentForm, treatment_category: e.target.value })} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                    <option value="standard">Bezinwazyjny</option>
                    <option value="needle">Iniekcja (Igła)</option>
                    <option value="scalpel">Chirurgia (Skalpel)</option>
                    <option value="laser">Laseroterapia</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Domyślna Sala (Opcjonalnie)</label>
                <input value={treatmentForm.room || ''} onChange={e => setTreatmentForm({ ...treatmentForm, room: e.target.value })} placeholder="np. Gabinet 3" className={`w-full md:w-1/3 border rounded-xl px-4 py-3 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              </div>
            </div>

            {/* 3. ZALECENIA (PRZED I PO) */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900'}`}><FileText size={16}/> 3. Szablony Zaleceń</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zalecenia PRZED zabiegiem</label>
                  <textarea rows={4} value={treatmentForm.pre_recommendations || ''} onChange={e => setTreatmentForm({ ...treatmentForm, pre_recommendations: e.target.value })} placeholder="Czego pacjent nie powinien robić przed..." className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zalecenia PO zabiegu</label>
                  <textarea rows={4} value={treatmentForm.post_recommendations || ''} onChange={e => setTreatmentForm({ ...treatmentForm, post_recommendations: e.target.value })} placeholder="Pielęgnacja domowa..." className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
                </div>
              </div>
            </div>

            {/* 4. ZGODY MEDYCZNE Z BAZY */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                4. Wymagane dokumenty dla tego zabiegu
              </label>
              <p className={`mb-3 text-[10px] font-medium leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Zaznaczone szablony zostaną automatycznie wygenerowane jako dokumenty pacjenta po zapisaniu go na ten zabieg.
              </p>
              <div className={`p-4 rounded-xl border space-y-5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {consentTemplates.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">Brak szablonów w systemie.</p>
                ) : [
                  { title: 'Dokumenty prawne', types: ['rodo', 'info'] },
                  { title: 'Wywiady medyczne', types: ['questionnaire'] },
                  { title: 'Świadome zgody na zabieg', types: ['consent'] }
                ].map(group => {
                  const groupTemplates = consentTemplates.filter((template: any) => group.types.includes(template.document_type || 'consent'))
                  if (groupTemplates.length === 0) return null

                  return (
                    <div key={group.title} className="space-y-2">
                      <h6 className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {group.title}
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupTemplates.map((template: any) => {
                          const isChecked = selectedTemplatesForTreatment.includes(template.id);
                          const prefix = template.document_type === 'rodo'
                            ? 'RODO'
                            : template.document_type === 'info'
                              ? 'PRAWNE'
                              : template.document_type === 'questionnaire'
                                ? 'WYWIAD'
                                : 'ZGODA'

                          return (
                            <label key={template.id} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : (isDarkMode ? 'border-slate-600 bg-slate-900 group-hover:border-emerald-500/50' : 'border-slate-300 bg-white group-hover:border-emerald-500/50')}`}>
                                {isChecked && <CheckCircle2 size={14} />}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedTemplatesForTreatment([...selectedTemplatesForTreatment, template.id]);
                                  else setSelectedTemplatesForTreatment(selectedTemplatesForTreatment.filter(id => id !== template.id));
                                }}
                              />
                              <span className={`text-sm font-bold line-clamp-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {prefix}: {template.title}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button type="submit" disabled={updating} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}>
              Zapisz Zabieg w Słowniku
            </button>
          </form>
        </div>
      </div>
    )}

  </div>
)}

{/* ============================================================================ */}
{/* lekarze */}
{/* ============================================================================ */}
{activeTab === 'prelegenci' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* HEADER Z PRZYCISKAMI */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
            <Users size={22} />
          </div>
          <div className="min-w-0">
            <h3 className={`font-black text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Lekarze
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Zarządzaj zespołem medycznym. ID lekarza wykorzystamy przy umawianiu wizyt i przypisywaniu zabiegów.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <HelpButton sectionKey="operations" />

          <button
            onClick={() => {
              setPartnerForm({ type: 'doctor', is_visible: true })
              setIsEditingPartner(false)
              setIsPartnerModalOpen(true)
            }}
            className={`px-4 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
          >
            <Plus size={14} /> Lekarz
          </button>

          <button
            onClick={() => {
              setPreparationForm({ type: 'preparation', is_visible: true })
              setIsEditingPreparation(false)
              setIsPreparationModalOpen(true)
            }}
            className={`px-4 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'}`}
          >
            <Plus size={14} /> Preparat
          </button>
        </div>
      </div>
    </div>

    {/* LISTA LEKARZY */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-5 md:p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Lekarze ({doctorProfiles.length})
        </h4>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Edycja i usuwanie profili
        </span>
      </div>

      {doctorProfiles.length === 0 ? (
        <div className={`p-16 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <Stethoscope size={40} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
          <p className="text-base mb-1">Brak lekarzy</p>
          <p className="text-xs font-medium">Dodaj lekarza, zdjęcie i specjalizację, aby można było przypisywać wizyty oraz zabiegi.</p>
        </div>
      ) : (
        <div className={`divide-y group ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
          {doctorProfiles.map((item) => (
            <SortablePartnerItem
              key={item.id}
              item={item}
              isDarkMode={isDarkMode}
              onEdit={(partner) => {
                const fallbackName = String(partner.sponsor_name || '').trim().split(/\s+/)
                setPartnerForm({
                  ...partner,
                  first_name: partner.first_name || fallbackName[0] || '',
                  last_name: partner.last_name || fallbackName.slice(1).join(' '),
                  title: partner.title || partner.sponsor_category || '',
                  photo_url: partner.photo_url || partner.logo_url || ''
                })
                setIsEditingPartner(true)
                setIsPartnerModalOpen(true)
              }}
              onDelete={handleDeletePartner}
            />
          ))}
        </div>
      )}
    </div>

    {/* LISTA PREPARATÓW */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-5 md:p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Preparaty ({preparationProfiles.length})
        </h4>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          ID i zdjęcie preparatu
        </span>
      </div>

      {preparationProfiles.length === 0 ? (
        <div className={`p-16 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <ImageIcon size={40} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
          <p className="text-base mb-1">Brak preparatów</p>
          <p className="text-xs font-medium">Dodaj preparat, zdjęcie i kategorię, aby później przypisywać go do zabiegów.</p>
        </div>
      ) : (
        <div className={`divide-y group ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
          {preparationProfiles.map((item) => (
            <PreparationItem
              key={item.id}
              item={item}
              isDarkMode={isDarkMode}
              onEdit={(preparation) => {
                setPreparationForm(preparation)
                setIsEditingPreparation(true)
                setIsPreparationModalOpen(true)
              }}
              onDelete={handleDeletePartner}
            />
          ))}
        </div>
      )}
    </div>

    {/* MODAL DODAWANIA / EDYCJI */}
    {isPartnerModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isEditingPartner ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
              {isEditingPartner ? 'Edytuj' : 'Dodaj'}{' '}
              lekarza
            </h3>

            <button
              onClick={() => setIsPartnerModalOpen(false)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSavePartner} className="space-y-6">

            {/* USTAWIENIA PROFILU LEKARZA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-4 md:p-3.5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  ID lekarza
                </p>
                <p className={`mt-1 truncate font-mono text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {partnerForm.id || 'Zostanie nadane po zapisie'}
                </p>
              </div>

              <div className={`p-4 md:p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aktywny profil</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Pokaż lekarza w systemie</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={partnerForm.is_visible !== false}
                    onChange={e => setPartnerForm({ ...partnerForm, is_visible: e.target.checked })}
                  />
                  <div className={`w-12 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDarkMode ? 'bg-slate-800 peer-checked:bg-[#e8ce7a] peer-checked:after:border-white' : 'bg-slate-200 peer-checked:bg-slate-900'}`} />
                </label>
              </div>
            </div>

            {/* FORMULARZ DLA LEKARZA */}
            <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Imię *
                    </label>
                    <input
                      required
                      className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.first_name || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, first_name: e.target.value })}
                      placeholder="np. Anna"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Nazwisko *
                    </label>
                    <input
                      required
                      className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.last_name || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, last_name: e.target.value })}
                      placeholder="np. Nowak"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Specjalizacja
                    </label>
                    <input
                      className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.title || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, title: e.target.value })}
                      placeholder="np. dermatologia, medycyna estetyczna"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Gabinet / zespół
                    </label>
                    <input
                      className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.company || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, company: e.target.value })}
                      placeholder="np. Klinika główna, zespół laseroterapii"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Bio / opis
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                    value={partnerForm.bio || ''}
                    onChange={e => setPartnerForm({ ...partnerForm, bio: e.target.value })}
                    placeholder="Opisz krótko doświadczenie lekarza, obszary zabiegowe i rolę w opiece nad pacjentem..."
                  />
                  {/* Nowy Przycisk AI do szybkiego pisania Bio */}
                  <AiTextAssistButton
                    eventId={id}
                    sectionKey="doctors"
                    fieldKey="bio"
                    currentValue={partnerForm.bio || ''}
                    relatedEntityId={partnerForm.id || undefined}
                    relatedEntityTitle={`${partnerForm.first_name || ''} ${partnerForm.last_name || ''}`.trim()}
                    additionalInstruction={[
                      `Imię i nazwisko: ${`${partnerForm.first_name || ''} ${partnerForm.last_name || ''}`.trim() || 'nie podano'}`,
                      `Specjalizacja / rola: ${partnerForm.title || 'nie podano'}`,
                      `Gabinet / zespół: ${partnerForm.company || 'nie podano'}`,
                      'Napisz opis wyłącznie na podstawie tych danych i aktualnego pola bio.',
                      'Nie wymyślaj certyfikatów, tytułów, lat doświadczenia, uczelni, nazw procedur ani efektów leczenia.'
                    ].join('\n')}
                    placeholder="Profesjonalny opis lekarza oparty o podane dane..."
                    onApply={(text) => setPartnerForm({ ...partnerForm, bio: text })}
                  />
                </div>
            </div>

            {/* SEKCJA ZDJĘCIA */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Zdjęcie lekarza
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {(newFiles.partnerPhoto || partnerForm.photo_url || partnerForm.logo_url) && (
                  <div className={`shrink-0 flex items-center justify-center overflow-hidden border w-20 h-20 rounded-2xl ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <img
                      src={getPreviewUrl(newFiles.partnerPhoto, partnerForm.photo_url)!}
                      alt="Podgląd"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className={`text-xs font-medium w-full ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 file:border-slate-700' : 'text-slate-700 file:bg-white file:border-slate-300'}`}
                  onChange={e => setNewFiles({ ...newFiles, partnerPhoto: e.target.files ? e.target.files[0] : null })}
                />
              </div>
            </div>

            {/* SOCIAL MEDIA / LINKI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Strona WWW
                </label>
                <input
                  className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={partnerForm.website_url || ''}
                  onChange={e => setPartnerForm({ ...partnerForm, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {partnerForm.type === 'speaker' && (
                <>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      LinkedIn
                    </label>
                    <input
                      className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.linkedin_url || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, linkedin_url: e.target.value })}
                      placeholder="URL profilu"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Twitter / X
                    </label>
                    <input
                      className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={partnerForm.twitter_url || ''}
                      onChange={e => setPartnerForm({ ...partnerForm, twitter_url: e.target.value })}
                      placeholder="@handle"
                    />
                  </div>
                </>
              )}
            </div>

            <div className={`flex items-center justify-between pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Kolejność wyświetlania
              </span>
              <input
                type="number"
                className={`w-24 border rounded-xl px-3 py-2 text-sm text-center font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                value={partnerForm.display_order || 0}
                onChange={e => setPartnerForm({ ...partnerForm, display_order: parseInt(e.target.value || '0') })}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}
            >
              {updating ? 'Zapisywanie...' : (isEditingPartner ? 'Zapisz lekarza' : 'Dodaj lekarza')}
            </button>
          </form>
        </div>
      </div>
    )}

    {isPreparationModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isEditingPreparation ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
              {isEditingPreparation ? 'Edytuj' : 'Dodaj'} preparat
            </h3>

            <button
              onClick={() => setIsPreparationModalOpen(false)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSavePreparation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-4 md:p-3.5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  ID preparatu
                </p>
                <p className={`mt-1 truncate font-mono text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {preparationForm.id || 'Zostanie nadane po zapisie'}
                </p>
              </div>

              <div className={`p-4 md:p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aktywny preparat</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Pokaż preparat w systemie</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preparationForm.is_visible !== false}
                    onChange={e => setPreparationForm({ ...preparationForm, is_visible: e.target.checked })}
                  />
                  <div className={`w-12 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDarkMode ? 'bg-slate-800 peer-checked:bg-[#e8ce7a] peer-checked:after:border-white' : 'bg-slate-200 peer-checked:bg-slate-900'}`} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Nazwa preparatu *
                </label>
                <input
                  required
                  className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={preparationForm.sponsor_name || ''}
                  onChange={e => setPreparationForm({ ...preparationForm, sponsor_name: e.target.value })}
                  placeholder="np. kwas hialuronowy"
                />
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kategoria / zastosowanie
                </label>
                <input
                  className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={preparationForm.sponsor_category || ''}
                  onChange={e => setPreparationForm({ ...preparationForm, sponsor_category: e.target.value })}
                  placeholder="np. wypełniacz, toksyna, peeling"
                />
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Opis
              </label>
              <textarea
                rows={3}
                className={`w-full border rounded-2xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={preparationForm.bio || ''}
                onChange={e => setPreparationForm({ ...preparationForm, bio: e.target.value })}
                placeholder="Krótki opis preparatu, wskazania lub uwagi dla zespołu."
              />
              <AiTextAssistButton
                eventId={id}
                sectionKey="preparations"
                fieldKey="bio"
                currentValue={preparationForm.bio || ''}
                relatedEntityId={preparationForm.id || undefined}
                relatedEntityTitle={preparationForm.sponsor_name || ''}
                additionalInstruction={[
                  `Nazwa preparatu: ${preparationForm.sponsor_name || 'nie podano'}`,
                  `Kategoria / zastosowanie: ${preparationForm.sponsor_category || 'nie podano'}`,
                  'Napisz opis wyłącznie na podstawie tych danych i aktualnego pola opisu.',
                  'Nie wymyślaj składu, wskazań rejestracyjnych, certyfikatów, producenta, przeciwwskazań ani obietnic efektu, jeśli nie zostały podane.',
                  'Jeżeli danych jest za mało, napisz neutralny opis roboczy i wskaż, co trzeba zweryfikować w dokumentacji producenta.'
                ].join('\n')}
                placeholder="Neutralny opis preparatu zgodny z podanymi danymi..."
                onApply={(text) => setPreparationForm({ ...preparationForm, bio: text })}
              />
            </div>

            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Zdjęcie preparatu
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {(newFiles.partnerPhoto || preparationForm.logo_url || preparationForm.photo_url) && (
                  <div className={`shrink-0 flex items-center justify-center overflow-hidden border w-20 h-20 rounded-2xl ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <img
                      src={getPreviewUrl(newFiles.partnerPhoto, preparationForm.logo_url || preparationForm.photo_url)!}
                      alt="Podgląd preparatu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className={`text-xs font-medium w-full ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 file:border-slate-700' : 'text-slate-700 file:bg-white file:border-slate-300'}`}
                  onChange={e => setNewFiles({ ...newFiles, partnerPhoto: e.target.files ? e.target.files[0] : null })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}
            >
              {updating ? 'Zapisywanie...' : (isEditingPreparation ? 'Zapisz preparat' : 'Dodaj preparat')}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ============================================================================ */}
{/* kasa */}
{/* ============================================================================ */}
{activeTab === 'finanse' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* HEADER SEKCJI */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Wallet size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Analityka finansowa kliniki
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Przychody z wizyt, płatności pacjentów, koszty operacyjne, powracalność i efektywność zespołu medycznego.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <HelpButton sectionKey="budget" />
        <button
          onClick={() => { setBudgetTransferForm({ currency: 'PLN' }); setIsBudgetTransferModalOpen(true) }}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
        >
          <ArrowRightLeft size={14} /> Przenieś
        </button>
        <button
          onClick={() => { setBudgetCategoryForm({ color: '#94a3b8', planned_budget: 0 }); setIsEditingBudgetCategory(false); setIsBudgetCategoryModalOpen(true) }}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
        >
          <Plus size={14} /> Kategoria
        </button>
        <button
          onClick={() => { setBudgetItemForm({ type: 'expense', category: 'other', currency: 'PLN', vat_rate: 23, payment_status: 'planned', is_active: true }); setIsEditingBudgetItem(false); setIsBudgetItemModalOpen(true) }}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Plus size={14} /> Koszt kliniki
        </button>
      </div>
    </div>

    <div className={`rounded-[24px] md:rounded-[32px] border p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors ${isDarkMode ? 'bg-gradient-to-r from-indigo-950/40 to-[#0f172a] border-indigo-900/50' : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Sparkles size={20} />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            AI Clinic Intelligence
          </p>
          <h4 className={`text-sm md:text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Dane gotowe pod analizę dotacyjną
          </h4>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Umówione wizyty dają potencjalny przychód <strong>{formatMoney(clinicAnalytics.totalVisitValue)}</strong>,
            z czego opłacono <strong>{formatMoney(clinicAnalytics.paidVisitValue)}</strong>.
            AI może później liczyć trendy pacjentów, rentowność procedur i efektywność lekarzy na podstawie tych samych danych.
          </p>
        </div>
      </div>
      {budgetSummary.isOverBudget && (
        <div className="shrink-0 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black flex items-center gap-2">
          <AlertTriangle size={16} /> Koszty przekroczyły plan o {formatMoney(Math.abs(budgetSummary.savings))}
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {[
        { label: 'Potencjał wizyt', value: clinicAnalytics.totalVisitValue, icon: TrendingUp, color: isDarkMode ? 'text-blue-400' : 'text-blue-600', money: true },
        { label: 'Opłacone wizyty', value: clinicAnalytics.paidVisitValue, icon: CheckCircle2, color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600', money: true },
        { label: 'Do pobrania', value: clinicAnalytics.unpaidVisitValue, icon: Clock, color: isDarkMode ? 'text-amber-400' : 'text-amber-600', money: true },
        { label: 'Śr. wartość wizyty', value: clinicAnalytics.avgVisitValue, icon: Calculator, color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600', money: true },
        { label: 'Nowi pacjenci 30 dni', value: clinicAnalytics.newPatients30d, icon: Users, color: isDarkMode ? 'text-cyan-400' : 'text-cyan-700' },
        { label: 'Powracający pacjenci', value: clinicAnalytics.returningPatients, icon: RefreshCw, color: isDarkMode ? 'text-violet-400' : 'text-violet-700' },
        { label: 'Powracalność', value: clinicAnalytics.returnRate, suffix: '%', icon: Activity, color: isDarkMode ? 'text-rose-400' : 'text-rose-600' },
        { label: 'Wynik operacyjny', value: clinicAnalytics.operatingResult, icon: Receipt, color: clinicAnalytics.operatingResult >= 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600'), money: true },
      ].map((kpi: any) => (
        <div key={kpi.label} className={`relative overflow-hidden rounded-[20px] md:rounded-[24px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
            <kpi.icon size={80} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {kpi.label}
              </p>
              <kpi.icon size={14} className={kpi.color} />
            </div>
            <p className={`mt-3 text-xl md:text-2xl font-black tabular-nums tracking-tight truncate ${kpi.color}`}>
              {kpi.money ? formatMoney(kpi.value) : `${Number(kpi.value || 0).toLocaleString('pl-PL')}${kpi.suffix || ''}`}
            </p>
          </div>
        </div>
      ))}
    </div>

    {budgetSummary.plannedBudget === 0 && (
      <div className={`rounded-2xl border p-4 text-xs font-black flex items-center gap-2 ${isDarkMode ? 'bg-amber-900/20 border-amber-800/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        <AlertTriangle size={16}/> Ustaw plan kosztów kategorii, aby widzieć przekroczenia i wynik operacyjny kliniki.
      </div>
    )}

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h4 className={`font-black text-sm md:text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <BadgeDollarSign size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'}/> Najpopularniejsze zabiegi
            </h4>
            <p className={`text-[10px] md:text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Ranking procedur według liczby zapisów i wartości wizyt.
            </p>
          </div>
          {budgetCategories.length === 0 && (
            <button onClick={handleCreateDefaultBudgetCategories} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}>
              Kategorie kliniki
            </button>
          )}
        </div>
        <div className="space-y-3">
          {clinicAnalytics.treatmentRows.slice(0, 6).map((row: any) => {
            const width = clinicAnalytics.totalVisitValue ? Math.round((row.value / clinicAnalytics.totalVisitValue) * 100) : 0
            return (
              <div key={row.id} className={`rounded-2xl border p-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className={`font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{row.name}</p>
                    <p className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>{row.count} wizyt</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black tabular-nums ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{formatMoney(row.value)}</p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>opłacone {formatMoney(row.paid)}</p>
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(width, 100)}%` }} />
                </div>
              </div>
            )
          })}
          {clinicAnalytics.treatmentRows.length === 0 && <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak wizyt z ceną. Umów pacjenta na zabieg, żeby zobaczyć ranking.</p>}
        </div>
      </div>

      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h4 className={`font-black text-sm md:text-base flex items-center gap-2 mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Stethoscope size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'}/> Efektywność lekarzy
        </h4>
        <div className="space-y-3">
          {clinicAnalytics.doctorRows.slice(0, 6).map((row: any) => (
            <div key={row.id} className={`flex items-center justify-between gap-4 rounded-2xl border p-3 text-xs ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="min-w-0">
                <p className={`font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{row.name}</p>
                <p className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>{row.count} wizyt</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-black tabular-nums ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{formatMoney(row.value)}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>opłacone {formatMoney(row.paid)}</p>
              </div>
            </div>
          ))}
          {clinicAnalytics.doctorRows.length === 0 && <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak danych lekarzy z wizyt.</p>}
        </div>
      </div>
    </div>

    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className={`p-5 md:p-6 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`font-black flex items-center gap-2 text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <CalendarPlus size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> Przychody z wizyt pacjentów
        </h4>
        <p className={`text-[10px] md:text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Każda umówiona wizyta pokazuje potencjalny przychód. Po płatności oznacz wizytę jako opłaconą.
        </p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className={`text-[9px] uppercase tracking-wider font-black border-b ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
            <tr>{['Pacjent','Zabieg','Data','Cena','Zapłacono','Status','Akcja'].map(h => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {appointmentsList.slice(0, 12).map((app: any) => {
              const price = Number(app.price_amount || 0)
              const paid = Number(app.paid_amount ?? (app.payment_status === 'paid' ? price : 0))
              const isPaid = app.payment_status === 'paid' || (price > 0 && paid >= price)
              return (
                <tr key={app.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 min-w-[180px]">
                    <p className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {app.patients?.first_name} {app.patients?.last_name}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{app.patients?.pesel || app.patients?.phone || '-'}</p>
                  </td>
                  <td className={`p-4 text-xs font-bold min-w-[180px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{app.treatment_name || '-'}</td>
                  <td className={`p-4 text-xs whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{app.appointment_date ? new Date(app.appointment_date).toLocaleString('pl-PL') : '-'}</td>
                  <td className={`p-4 text-xs font-black tabular-nums ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{formatMoney(price, app.currency || 'PLN')}</td>
                  <td className={`p-4 text-xs font-black tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatMoney(paid, app.currency || 'PLN')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isPaid ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : (isDarkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')}`}>
                      {isPaid ? 'opłacona' : 'do zapłaty'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleMarkAppointmentPaid(app)}
                      disabled={isPaid || price <= 0}
                      className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      Opłacone
                    </button>
                  </td>
                </tr>
              )
            })}
            {appointmentsList.length === 0 && <tr><td colSpan={7} className={`p-12 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak umówionych wizyt do analizy przychodów.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* KARTY KATEGORII BUDŻETOWYCH */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {categorySummaries.map((category: any) => (
        <div key={category.id} className={`rounded-[24px] border p-5 shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-4 h-4 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: category.color || '#94a3b8' }}/>
              <h5 className={`font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</h5>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => { setBudgetTransferForm({ currency: 'PLN', from_category_id: category.id }); setIsBudgetTransferModalOpen(true) }} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-900'}`} title="Przenieś z tej kategorii"><ArrowRightLeft size={14}/></button>
              <button onClick={() => { setBudgetCategoryForm(category); setIsEditingBudgetCategory(true); setIsBudgetCategoryModalOpen(true) }} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Edit3 size={14}/></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] md:text-xs">
            <div><span className={`block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Plan</span><span className={`font-black tabular-nums ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{formatMoney(category.planned_budget)}</span></div>
            <div><span className={`block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Wydano</span><span className={`font-black tabular-nums ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{formatMoney(category.used_budget)}</span></div>

            <div><span className={`block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Zapłacono</span><span className={`font-black tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatMoney(category.paid_amount)}</span></div>
            <div><span className={`block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Do zapłaty</span><span className={`font-black tabular-nums ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{formatMoney(category.unpaid_amount)}</span></div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${category.remaining_budget < 0 ? 'text-red-500' : (isDarkMode ? 'text-emerald-400' : 'text-emerald-700')}`}>
              {category.remaining_budget < 0 ? 'Przekroczono:' : 'Zostało:'} {formatMoney(Math.abs(category.remaining_budget))}
            </span>
            <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{category.item_count} poz.</span>
          </div>

          <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div className={`h-full transition-all duration-1000 ${category.status === 'over' ? 'bg-red-500' : (isDarkMode ? 'bg-blue-500' : 'bg-slate-800')}`} style={{ width: `${Math.min(category.usage_percent, 100)}%` }}/>
          </div>
        </div>
      ))}
    </div>

    {/* TABELA POZYCJI BUDŻETU */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className={`p-5 md:p-6 border-b space-y-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`font-black flex items-center gap-2 text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Filter size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'}/> Pozycje budżetu
        </h4>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}/>
            <input
              className={`w-48 md:w-64 pl-9 pr-3 py-2 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`}
              placeholder="Szukaj..." value={budgetSearch} onChange={e => setBudgetSearch(e.target.value)}
            />
          </div>
          <select className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} value={budgetFilterCategory} onChange={e => setBudgetFilterCategory(e.target.value)}>
            <option value="all">Kategorie</option>
            {budgetCategories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} value={budgetFilterType} onChange={e => setBudgetFilterType(e.target.value)}>
            <option value="all">Typy</option><option value="expense">Wydatki</option><option value="income">Przychody</option>
          </select>
          <select className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} value={budgetFilterPaymentStatus} onChange={e => setBudgetFilterPaymentStatus(e.target.value)}>
            <option value="all">Statusy płatności</option>
            {['planned','advance_paid','partially_paid','paid','overdue'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className={`text-[9px] uppercase tracking-wider font-black border-b ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
            <tr>{['Pozycja','Kategoria','Źródło','Typ','Netto','VAT','Brutto','Zapłacono','Do zapłaty','Termin','Status','Akcje'].map(h => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {filteredBudgetItems.map((item: any) => {
              const due = Math.max(Number(item.gross_amount || 0) - Number(item.paid_amount || 0), 0)
              const badge = item.payment_status === 'paid'
                ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                : item.payment_status === 'partially_paid'
                  ? (isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200')
                  : item.payment_status === 'advance_paid'
                    ? (isDarkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200')
                    : item.payment_status === 'overdue'
                      ? (isDarkMode ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200')
                      : (isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200')
              return (
                <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 min-w-[220px]">
                    <p className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.description || '-'}</p>
                  </td>
                  <td className={`p-4 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.category}</td>
                  <td className={`p-4 text-[10px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.source_type}</td>
                  <td className={`p-4 text-[10px] font-black uppercase tracking-wider ${item.type === 'income' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>{item.type}</td>
                  <td className={`p-4 text-xs tabular-nums ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatMoney(item.net_amount, item.currency)}</td>
                  <td className={`p-4 text-[10px] tabular-nums ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatMoney(item.vat_amount, item.currency)}<br/>({item.vat_rate}%)</td>
                  <td className={`p-4 text-xs font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatMoney(item.gross_amount, item.currency)}</td>
                  <td className={`p-4 text-xs font-black tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatMoney(item.paid_amount, item.currency)}</td>
                  <td className={`p-4 text-xs font-black tabular-nums ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{formatMoney(due, item.currency)}</td>
                  <td className={`p-4 text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.due_date || '-'}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${badge}`}>{item.payment_status || 'planned'}</span></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5 min-w-[100px]">
                      <button onClick={() => { setBudgetItemForm(item); setIsEditingBudgetItem(true); setIsBudgetItemModalOpen(true) }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-900/20 hover:bg-blue-900/40 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}><Edit3 size={14}/></button>
                      <button onClick={() => { setSelectedBudgetItem(item); setBudgetPaymentForm({ amount: due, currency: item.currency || 'PLN', paid_at: new Date().toISOString().slice(0,10) }); setIsBudgetPaymentModalOpen(true) }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}><CreditCard size={14}/></button>
                      <button onClick={() => handleDeactivateBudgetItem(item.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredBudgetItems.length === 0 && <tr><td colSpan={12} className={`p-12 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak pozycji budżetu.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
        <h4 className={`font-black text-base mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ostatnie płatności</h4>
        <div className="space-y-3">
          {budgetPayments.slice(0,8).map((p: any) => {
            const item = budgetItems.find((i: any) => i.id === p.budget_item_id);
            return (
              <div key={p.id} className={`flex items-center justify-between gap-3 border-b pb-3 text-xs ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="min-w-0">
                  <span className={`font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{p.paid_at}</span>
                  <span className={`ml-2 truncate block sm:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item?.title || 'Pozycja'}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`block font-black text-sm tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatMoney(p.amount, p.currency)}</span>
                  <span className={`text-[9px] uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{p.payment_method || '-'}</span>
                </div>
              </div>
            )
          })}
          {budgetPayments.length === 0 && <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak zarejestrowanych płatności.</p>}
        </div>
      </div>

      <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
        <h4 className={`font-black text-base mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Przesunięcia środków</h4>
        <div className="space-y-3">
          {budgetTransfers.slice(0,8).map((t: any) => {
            const from = budgetCategories.find((c: any) => c.id === t.from_category_id);
            const to = budgetCategories.find((c: any) => c.id === t.to_category_id);
            return (
              <div key={t.id} className={`flex items-center justify-between gap-3 border-b pb-3 text-xs ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="min-w-0">
                  <span className={`font-black flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="truncate max-w-[100px] sm:max-w-none">{from?.name || '-'}</span>
                    <ArrowRightLeft size={10} className="shrink-0 mx-1 opacity-50" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{to?.name || '-'}</span>
                  </span>
                  <span className={`text-[10px] mt-1 block truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.reason || 'Brak powoda'}</span>
                </div>
                <span className={`font-black text-sm tabular-nums shrink-0 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatMoney(t.amount, t.currency)}</span>
              </div>
            )
          })}
          {budgetTransfers.length === 0 && <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak przesunięć budżetowych.</p>}
        </div>
      </div>
    </div>
  </div>
)}

{/* MODAL POZYCJI BUDŻETU */}
{activeTab === 'finanse' && isBudgetItemModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
    <div className={`rounded-[32px] max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {isEditingBudgetItem ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
          {isEditingBudgetItem ? 'Edytuj pozycję budżetu' : 'Dodaj pozycję budżetu'}
        </h3>
        <button onClick={() => setIsBudgetItemModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSaveBudgetItem} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Typ</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.type || 'expense'} onChange={e => setBudgetItemForm({ ...budgetItemForm, type: e.target.value })}>
              <option value="expense">Wydatek</option>
              <option value="income">Przychód</option>
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kategoria</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.category || 'other'} onChange={e => setBudgetItemForm({ ...budgetItemForm, category: e.target.value })}>
              {budgetCategories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              <option value="other">Inne</option>
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Źródło</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="np. manual" value={budgetItemForm.source_type || 'manual'} onChange={e => setBudgetItemForm({ ...budgetItemForm, source_type: e.target.value })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Waluta</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="PLN" value={budgetItemForm.currency || 'PLN'} onChange={e => setBudgetItemForm({ ...budgetItemForm, currency: e.target.value })}/>
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tytuł *</label>
          <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Krótka nazwa" value={budgetItemForm.title || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, title: e.target.value })}/>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Opis szczegółowy</label>
          <textarea rows={2} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Notatki" value={budgetItemForm.description || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, description: e.target.value })}/>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Plan netto</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="0" value={budgetItemForm.planned_net_amount || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, planned_net_amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Plan brutto</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="0" value={budgetItemForm.planned_gross_amount || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, planned_gross_amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Fakt. Netto</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 focus:border-emerald-500 placeholder-slate-600' : 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500 placeholder-emerald-300'}`} placeholder="0" value={budgetItemForm.net_amount || ''} onChange={e => { const net = Number(e.target.value || 0); const vals = calculateVatValues(net, Number(budgetItemForm.vat_rate || 0)); setBudgetItemForm({ ...budgetItemForm, net_amount: net, vat_amount: vals.vat, gross_amount: vals.gross }) }}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>VAT %</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="23" value={budgetItemForm.vat_rate || 0} onChange={e => { const vatRate = Number(e.target.value || 0); const vals = calculateVatValues(Number(budgetItemForm.net_amount || 0), vatRate); setBudgetItemForm({ ...budgetItemForm, vat_rate: vatRate, vat_amount: vals.vat, gross_amount: vals.gross }) }}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>VAT Kwota</label>
            <input readOnly className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`} placeholder="0" value={budgetItemForm.vat_amount || 0}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Fakt. Brutto</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 focus:border-emerald-500 placeholder-slate-600' : 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500 placeholder-emerald-300'}`} placeholder="0" value={budgetItemForm.gross_amount || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, gross_amount: Number(e.target.value || 0) })}/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Już zapłacono</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-blue-400 focus:border-blue-500 placeholder-slate-600' : 'bg-blue-50 border-blue-200 text-blue-800 focus:border-blue-500 placeholder-blue-300'}`} placeholder="0" value={budgetItemForm.paid_amount || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, paid_amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota zaliczki</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-amber-400 focus:border-amber-500 placeholder-slate-600' : 'bg-amber-50 border-amber-200 text-amber-800 focus:border-amber-500 placeholder-amber-300'}`} placeholder="0" value={budgetItemForm.advance_amount || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, advance_amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Data zaliczki</label>
            <input type="date" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.advance_paid_at || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, advance_paid_at: e.target.value })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Termin płatności</label>
            <input type="date" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.due_date || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, due_date: e.target.value })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.payment_status || 'planned'} onChange={e => setBudgetItemForm({ ...budgetItemForm, payment_status: e.target.value })}>
              <option value="planned">Planowane</option>
              <option value="advance_paid">Zaliczka opłacona</option>
              <option value="partially_paid">Częściowo opłacone</option>
              <option value="paid">Opłacone całość</option>
              <option value="overdue">Po terminie</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Wiązanie z dostawcą</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetItemForm.contractor_id || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, contractor_id: e.target.value || null })}>
              <option value="">Wybierz Podwykonawcę (opcja)</option>
              {contractors.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>URL Faktury</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="https://..." value={budgetItemForm.invoice_url || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, invoice_url: e.target.value })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>URL Dokumentu</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="https://..." value={budgetItemForm.document_url || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, document_url: e.target.value })}/>
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Notatki wewnętrzne</label>
          <textarea rows={2} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Dodatkowe informacje..." value={budgetItemForm.notes || ''} onChange={e => setBudgetItemForm({ ...budgetItemForm, notes: e.target.value })}/>
        </div>

        <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all mt-2 ${
          budgetItemForm.is_active !== false
            ? (isDarkMode ? 'border-[#e8ce7a] bg-slate-900' : 'border-slate-900 bg-slate-50')
            : (isDarkMode ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-white')
        }`}>
          <div>
            <p className={`font-black text-sm ${budgetItemForm.is_active !== false ? (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
              Aktywna pozycja
            </p>
          </div>
          <input type="checkbox" checked={budgetItemForm.is_active !== false} onChange={e => setBudgetItemForm({ ...budgetItemForm, is_active: e.target.checked })} className="sr-only"/>
          <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${budgetItemForm.is_active !== false ? (isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-white') : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`}>
            {budgetItemForm.is_active !== false && <CheckCircle2 size={14} />}
          </div>
        </label>

        <button type="submit" disabled={updating} className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}>
          {updating ? 'Zapisywanie...' : 'Zapisz Pozycję Budżetu'}
        </button>
      </form>
    </div>
  </div>
)}

{/* MODAL KATEGORII */}
{activeTab === 'finanse' && isBudgetCategoryModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
    <div className={`rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          {isEditingBudgetCategory ? 'Edytuj Kategorię' : 'Dodaj Kategorię'}
        </h3>
        <button onClick={() => setIsBudgetCategoryModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSaveBudgetCategory} className="space-y-5">
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nazwa i Kod</label>
          <div className="grid grid-cols-2 gap-4">
            <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Nazwa" value={budgetCategoryForm.name || ''} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, name: e.target.value, slug: budgetCategoryForm.slug || e.target.value.toLowerCase().replace(/\s+/g, '_') })}/>
            <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`} placeholder="kod_systemowy" value={budgetCategoryForm.slug || ''} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, slug: e.target.value })}/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Budżet Planowany</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="0" value={budgetCategoryForm.planned_budget || ''} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, planned_budget: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kolejność / Sortowanie</label>
            <input type="number" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="0" value={budgetCategoryForm.sort_order || ''} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, sort_order: Number(e.target.value || 0) })}/>
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kolor Znacznika</label>
          <div className="flex gap-3">
            <input type="color" className={`w-14 h-12 rounded-xl cursor-pointer border-0 p-0 ${isDarkMode ? 'bg-transparent' : ''}`} value={budgetCategoryForm.color || '#94a3b8'} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, color: e.target.value })}/>
            <input type="text" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-mono font-bold uppercase outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetCategoryForm.color || '#94a3b8'} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, color: e.target.value })}/>
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Notatki (widoczne dla zespołu)</label>
          <textarea rows={2} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Informacje..." value={budgetCategoryForm.notes || ''} onChange={e => setBudgetCategoryForm({ ...budgetCategoryForm, notes: e.target.value })}/>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={updating} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-colors ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}>
            Zapisz Kategorię
          </button>
          {isEditingBudgetCategory && (
            <button type="button" onClick={() => handleDeleteBudgetCategory(budgetCategoryForm.id)} className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
              Usuń
            </button>
          )}
        </div>
      </form>
    </div>
  </div>
)}

{/* MODAL PŁATNOŚCI */}
{activeTab === 'finanse' && isBudgetPaymentModalOpen && selectedBudgetItem && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
    <div className={`rounded-[32px] max-w-xl w-full p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`flex justify-between items-start mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div>
          <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <CreditCard size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> Dodaj Płatność
          </h3>
          <p className={`text-xs font-bold mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Do zapłaty: <span className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>{formatMoney(Math.max(Number(selectedBudgetItem.gross_amount || 0) - Number(selectedBudgetItem.paid_amount || 0), 0), selectedBudgetItem.currency)}</span> w ramach "{selectedBudgetItem.title}"
          </p>
        </div>
        <button onClick={() => setIsBudgetPaymentModalOpen(false)} className={`p-2 rounded-full transition-colors shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleAddBudgetPayment} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Przekazana Kwota</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="0" value={budgetPaymentForm.amount || ''} onChange={e => setBudgetPaymentForm({ ...budgetPaymentForm, amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Waluta</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`} readOnly value={budgetPaymentForm.currency || selectedBudgetItem.currency || 'PLN'} />
          </div>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Data Płatności</label>
          <input type="date" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetPaymentForm.paid_at || ''} onChange={e => setBudgetPaymentForm({ ...budgetPaymentForm, paid_at: e.target.value })}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Metoda Płatności</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="np. Przelew, Karta, Gotówka" value={budgetPaymentForm.payment_method || ''} onChange={e => setBudgetPaymentForm({ ...budgetPaymentForm, payment_method: e.target.value })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Identyfikator (Referencja)</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="np. FV/2026/05/12" value={budgetPaymentForm.payment_reference || ''} onChange={e => setBudgetPaymentForm({ ...budgetPaymentForm, payment_reference: e.target.value })}/>
          </div>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Dodatkowe Notatki</label>
          <textarea rows={2} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="Uwagi dla księgowości..." value={budgetPaymentForm.notes || ''} onChange={e => setBudgetPaymentForm({ ...budgetPaymentForm, notes: e.target.value })}/>
        </div>
        <button type="submit" className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-colors ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}>
          Zatwierdź Płatność
        </button>
      </form>
    </div>
  </div>
)}

{/* MODAL TRANSFERU */}
{activeTab === 'finanse' && isBudgetTransferModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
    <div className={`rounded-[32px] max-w-xl w-full p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <ArrowRightLeft size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> Przenieś Środki
        </h3>
        <button onClick={() => setIsBudgetTransferModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSaveBudgetTransfer} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Z Kategorii</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetTransferForm.from_category_id || ''} onChange={e => setBudgetTransferForm({ ...budgetTransferForm, from_category_id: e.target.value })}>
              <option value="">Wybierz...</option>
              {budgetCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({formatMoney(c.planned_budget)})</option>)}
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Do Kategorii</label>
            <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} value={budgetTransferForm.to_category_id || ''} onChange={e => setBudgetTransferForm({ ...budgetTransferForm, to_category_id: e.target.value })}>
              <option value="">Wybierz...</option>
              {budgetCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota</label>
            <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="0" value={budgetTransferForm.amount || ''} onChange={e => setBudgetTransferForm({ ...budgetTransferForm, amount: Number(e.target.value || 0) })}/>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Waluta</label>
            <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`} readOnly value={budgetTransferForm.currency || 'PLN'} />
          </div>
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Powód / Cel relokacji</label>
          <textarea rows={2} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} placeholder="np. AI Eco-Budget zasugerowało inwestycję w roślinny catering..." value={budgetTransferForm.reason || ''} onChange={e => setBudgetTransferForm({ ...budgetTransferForm, reason: e.target.value })}/>
        </div>
        <button type="submit" className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-colors ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}>
          Zatwierdź Relokację
        </button>
      </form>
    </div>
  </div>
)}

{/* ============================================================================ */}
{/* podwykonawca */}
{/* ============================================================================ */}
{activeTab === 'dostawcy' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* NAGŁÓWEK SEKCJI */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Briefcase size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'}/>
          Baza Podwykonawców
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Zarządzaj firmami, umowami, przypisuj ich do modułów (transport, prelegenci) i wliczaj do budżetu.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <HelpButton sectionKey="operations" />
        <button
          onClick={() => {
            setContractorForm({});
            setIsEditingContractor(false);
            setIsContractorModalOpen(true);
          }}
          className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Plus size={14} /> Dodaj wykonawcę
        </button>
      </div>
    </div>

    {/* METRYKI BAZOWE */}
    {(() => {
      const budgetContractors = contractors.filter(c => c.include_in_budget !== false)
      const totalGross = budgetContractors.reduce((sum, c) => sum + Number(c.gross_amount || c.amount || 0), 0)
      const paid = budgetContractors
        .filter(c => c.payment_status === 'paid')
        .reduce((sum, c) => sum + Number(c.gross_amount || c.amount || 0), 0)
      const unpaid = totalGross - paid

      return (
        <div className="planner-metric-grid">
          <div className="planner-metric-card">
            <div className="flex items-start justify-between gap-3"><p className="planner-metric-label">Baza firm</p><Briefcase size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}/></div>
            <p className={`planner-metric-value mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{contractors.length}</p>
          </div>
          <div className="planner-metric-card">
            <div className="flex items-start justify-between gap-3"><p className="planner-metric-label">W budżecie (Brutto)</p><BadgeDollarSign size={16} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}/></div>
            <p className={`planner-metric-value mt-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{totalGross.toLocaleString('pl-PL')} zł</p>
          </div>
          <div className="planner-metric-card">
            <div className="flex items-start justify-between gap-3"><p className="planner-metric-label">Zapłacono</p><CheckCircle2 size={16} className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}/></div>
            <p className={`planner-metric-value mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{paid.toLocaleString('pl-PL')} zł</p>
          </div>
          <div className="planner-metric-card">
            <div className="flex items-start justify-between gap-3"><p className="planner-metric-label">Pozostało do spłaty</p><Clock size={16} className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}/></div>
            <p className={`planner-metric-value mt-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{unpaid.toLocaleString('pl-PL')} zł</p>
          </div>
        </div>
      )
    })()}

    {/* LISTA Z WYSZUKIWANIEM I DETALAMI */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>

      {/* Pasek narzędziowy / Filtry */}
      <div className={`p-5 md:p-6 border-b flex flex-col xl:flex-row justify-between xl:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              !filterTag
                ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white')
                : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')
            }`}
          >
            Wszystkie ({contractors.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filterTag === tag
                  ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white')
                  : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')
              }`}
            >
              {tag} ({contractors.filter(c => c.tags?.includes(tag)).length})
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full xl:w-auto shrink-0">
          <div className="relative flex-1 xl:w-64">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Szukaj po nazwie, NIP, e-mail..."
              value={searchContractor}
              onChange={e => setSearchContractor(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <button
            onClick={() => exportContractorsToCSV()}
            className={`p-2 border rounded-xl transition-colors shrink-0 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="Eksportuj CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className={`text-[10px] font-black uppercase tracking-wider border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <tr>
              <th className="p-4 pl-6">Nazwa / NIP</th>
              <th className="p-4">Kwota</th>
              <th className="p-4">Status / Umowa</th>
              <th className="p-4">Tagi</th>
              <th className="p-4 pr-6 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {filteredContractors.length === 0 ? (
              <tr><td colSpan={5} className={`p-12 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak wyników do wyświetlenia.</td></tr>
            ) : (
              filteredContractors.map(contractor => {
                const isExpanded = expandedContractorId === contractor.id;

                return (
                  <React.Fragment key={contractor.id}>
                    {/* Wiersz z podsumowaniem (Klikalny by rozwinąć szczegóły) */}
                    <tr
                      className={`transition-colors cursor-pointer group ${
                        isExpanded
                          ? (isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50')
                          : (isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50')
                      }`}
                      onClick={() => setExpandedContractorId(isExpanded ? null : contractor.id)}
                    >
                      <td className="p-4 pl-6 min-w-[200px]">
                        <p className={`font-black text-sm truncate max-w-xs md:max-w-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{contractor.name}</p>
                        <p className={`text-[10px] font-mono mt-0.5 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>NIP: {contractor.tax_id || '-'}</p>
                      </td>
                      <td className="p-4 min-w-[120px]">
                        <p className={`font-black tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          {contractor.gross_amount
                            ? `${Number(contractor.gross_amount).toLocaleString('pl-PL')} ${contractor.currency || 'PLN'}`
                            : contractor.amount
                              ? `${Number(contractor.amount).toLocaleString('pl-PL')} ${contractor.currency || 'PLN'}`
                              : '-'}
                        </p>
                        {contractor.include_in_budget === false && (
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            Poza budżetem
                          </span>
                        )}
                      </td>
                      <td className="p-4 min-w-[150px]">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-800 border-slate-200 shadow-sm'}`}>
                            {contractor.operational_status || contractor.status || 'NOWY'}
                          </span>
                          {contractor.payment_status === 'paid' && <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>Opłacone</span>}
                          {contractor.payment_status === 'overdue' && <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>Zaległe</span>}
                          {contractor.contract_status === 'signed' && <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>Umowa OK</span>}
                        </div>
                      </td>
                      <td className="p-4 min-w-[120px]">
                        <div className="flex flex-wrap gap-1">
                          {contractor.tags?.map((tag: string) => (
                            <span key={tag} className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400 border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            title={isExpanded ? 'Zwiń szczegóły' : 'Pokaż szczegóły'}
                            className={`p-2 rounded-lg transition-all ${isExpanded ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700')}`}
                          >
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* SZUFLADKA ZE SZCZEGÓŁAMI (Quick View) */}
                    {isExpanded && (
                      <tr className={isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/30'}>
                        <td colSpan={5} className="p-0 border-t-0">
                          <div className={`p-5 md:p-6 shadow-inner animate-in slide-in-from-top-2 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-100/50'}`}>

                            <div className="flex flex-col xl:flex-row gap-6">
                              {/* Kolumna 1: Info kontaktowe i Rejestrowe */}
                              <div className="flex-1 space-y-4">
                                <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Dane podstawowe</h4>
                                <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                  <div>
                                    <span className={`block text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Kontakt</span>
                                    <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{contractor.contact_person || '-'}</p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{contractor.phone || '-'}</p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{contractor.email || '-'}</p>
                                  </div>
                                  <div>
                                    <span className={`block text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Firma</span>
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>REGON: {contractor.regon || '-'}</p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>KRS: {contractor.krs || '-'}</p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Adres: {contractor.address || '-'}
                                    </p>
                                  </div>
                                </div>

                                {contractor.service_scope && (
                                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                    <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Zakres usługi</span>
                                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{contractor.service_scope}</p>
                                  </div>
                                )}
                              </div>

                              {/* Kolumna 2: Finanse, Dokumenty i Akcje */}
                              <div className="flex-1 space-y-4">
                                <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Finanse & Powiązania</h4>
                                <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                  <div>
                                    <span className={`block text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Koszty</span>
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Netto: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>{contractor.net_amount ? `${Number(contractor.net_amount).toLocaleString('pl-PL')} zł` : '-'}</strong></p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zaliczka: <strong className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>{contractor.advance_amount ? `${Number(contractor.advance_amount).toLocaleString('pl-PL')} zł` : '0 zł'}</strong></p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kategoria: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>{contractor.budget_category || '-'}</strong></p>
                                  </div>
                                  <div>
                                    <span className={`block text-[9px] font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Powiązania</span>
                                    {contractor.fleet_id && <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border mb-1 w-full ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Moduł Floty</span>}
                                    {contractor.speaker_id && <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border mb-1 w-full ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Prelegent</span>}
                                    {contractor.partner_id && <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border mb-1 w-full ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Sponsor/Partner</span>}
                                    {!contractor.fleet_id && !contractor.speaker_id && !contractor.partner_id && <p className={`text-xs italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Brak</p>}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {contractor.website_url && (
                                    <a href={contractor.website_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                                      <Globe size={14} /> WWW
                                    </a>
                                  )}
                                  {contractor.invoice_url && (
                                    <a href={contractor.invoice_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
                                      <FileText size={14} /> Dokument / FV
                                    </a>
                                  )}
                                  {contractor.document_folder_url && (
                                    <a href={contractor.document_folder_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                                      <ExternalLink size={14} /> Folder Drive
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {contractor.notes && (
                              <div className={`mt-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50/50 border-amber-200/50'}`}>
                                <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}>Notatka Wewnętrzna</span>
                                <p className={`text-xs font-medium ${isDarkMode ? 'text-amber-400/80' : 'text-amber-900/80'}`}>{contractor.notes}</p>
                              </div>
                            )}

                            <div className={`mt-5 pt-4 border-t flex justify-end gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                              <button
                                onClick={() => { setContractorForm(contractor); setIsEditingContractor(true); setIsContractorModalOpen(true); }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-white text-blue-700 border border-slate-200'}`}
                              >
                                <Edit3 size={14} /> Edytuj pełne dane
                              </button>
                              <button
                                onClick={() => handleDeleteContractor(contractor.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-900/30' : 'bg-red-50 text-red-600 border border-red-100'}`}
                              >
                                <Trash2 size={14} /> Usuń
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* MODAL EDYCJI / DODAWANIA - PEŁNY DARK MODE */}
    {isContractorModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isEditingContractor ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
              {isEditingContractor ? 'Edytuj podwykonawcę' : 'Dodaj podwykonawcę'}
            </h3>
            <button onClick={() => setIsContractorModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveContractor} className="space-y-6">

            {/* Dane podstawowe */}
            <div className={`p-5 md:p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Dane Firmowe</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nazwa firmy / imię i nazwisko *</label>
                  <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.name || ''} onChange={e => setContractorForm({...contractorForm, name: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>NIP</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.tax_id || ''} onChange={e => setContractorForm({...contractorForm, tax_id: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Adres</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.address || ''} onChange={e => setContractorForm({...contractorForm, address: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Osoba kontaktowa</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.contact_person || ''} onChange={e => setContractorForm({...contractorForm, contact_person: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>REGON</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.regon || ''} onChange={e => setContractorForm({...contractorForm, regon: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>KRS</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.krs || ''} onChange={e => setContractorForm({...contractorForm, krs: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Strona www</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.website_url || ''} onChange={e => setContractorForm({...contractorForm, website_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email</label>
                  <input type="email" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.email || ''} onChange={e => setContractorForm({...contractorForm, email: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Telefon</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.phone || ''} onChange={e => setContractorForm({...contractorForm, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Zakres Usługi */}
            <div className={`p-5 md:p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Zakres usługi i Budżet</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Typ usługodawcy</label>
                  <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.service_type || ''} onChange={e => setContractorForm({...contractorForm, service_type: e.target.value, budget_category: contractorForm.budget_category || e.target.value})}>
                    <option value="">Wybierz...</option>
                    <option value="catering">Catering</option>
                    <option value="transport">Transport</option>
                    <option value="decorations">Dekoracje</option>
                    <option value="av">Technika / AV</option>
                    <option value="stage">Scena</option>
                    <option value="photo_video">Foto / video</option>
                    <option value="security">Ochrona</option>
                    <option value="hostesses">Hostessy</option>
                    <option value="printing">Drukarnia</option>
                    <option value="venue_hotel">Hotel / obiekt</option>
                    <option value="marketing">Marketing</option>
                    <option value="cleaning">Sprzątanie</option>
                    <option value="insurance">Ubezpieczenie</option>
                    <option value="other">Inne</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kategoria budżetowa</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.budget_category || ''} onChange={e => setContractorForm({...contractorForm, budget_category: e.target.value})} placeholder="np. transport, scena, catering" />
                </div>

                <label className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  contractorForm.include_in_budget !== false
                    ? (isDarkMode ? 'border-[#e8ce7a] bg-slate-900' : 'border-slate-900 bg-white')
                    : (isDarkMode ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50')
                }`}>
                  <div>
                    <p className={`font-black text-sm ${contractorForm.include_in_budget !== false ? (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                      Wliczaj do budżetu
                    </p>
                  </div>
                  <input type="checkbox" checked={contractorForm.include_in_budget !== false} onChange={e => setContractorForm({...contractorForm, include_in_budget: e.target.checked})} className="sr-only"/>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${contractorForm.include_in_budget !== false ? (isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-white') : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`}>
                    {contractorForm.include_in_budget !== false && <CheckCircle2 size={12} />}
                  </div>
                </label>
              </div>

              <div className="mt-5">
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Dokładny opis usługi (Zakres)</label>
                <textarea rows={3} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.service_scope || ''} onChange={e => setContractorForm({...contractorForm, service_scope: e.target.value})} placeholder="Co dokładnie dostarcza/realizuje ten podwykonawca..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota ogólna (wynagrodzenie)</label>
                  <div className="flex gap-2">
                    <input type="number" step="0.01" className={`flex-1 border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.amount || ''} onChange={e => setContractorForm({...contractorForm, amount: parseFloat(e.target.value)})} />
                    <select className={`w-28 border rounded-xl px-3 py-3.5 text-sm font-bold outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} value={contractorForm.currency || 'PLN'} onChange={e => setContractorForm({...contractorForm, currency: e.target.value})}>
                      <option>PLN</option>
                      <option>EUR</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status (etykieta tekstowa)</label>
                  <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.status || ''} onChange={e => setContractorForm({...contractorForm, status: e.target.value})} placeholder="np. Umowa w trakcie negocjacji" />
                </div>
              </div>

              {/* Pola budżetowe ukryte w module "Finanse & Umowy" */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota Netto</label>
                  <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 focus:border-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500'}`} value={contractorForm.net_amount || ''} onChange={e => { const net = Number(e.target.value || 0); const vat = Number(contractorForm.vat_rate ?? 23); setContractorForm({...contractorForm, net_amount: net, gross_amount: Number((net * (1 + vat / 100)).toFixed(2)), amount: Number((net * (1 + vat / 100)).toFixed(2))}) }} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>VAT %</label>
                  <input type="number" step="1" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.vat_rate ?? 23} onChange={e => { const vat = Number(e.target.value || 0); const net = Number(contractorForm.net_amount || 0); setContractorForm({...contractorForm, vat_rate: vat, gross_amount: Number((net * (1 + vat / 100)).toFixed(2)), amount: Number((net * (1 + vat / 100)).toFixed(2))}) }} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota Brutto</label>
                  <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-black outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-900'}`} value={contractorForm.gross_amount || ''} onChange={e => setContractorForm({...contractorForm, gross_amount: Number(e.target.value || 0), amount: Number(e.target.value || 0)})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kwota Zaliczki</label>
                  <input type="number" step="0.01" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-amber-400 focus:border-amber-500' : 'bg-amber-50 border-amber-200 text-amber-800 focus:border-amber-500'}`} value={contractorForm.advance_amount || ''} onChange={e => setContractorForm({...contractorForm, advance_amount: Number(e.target.value || 0)})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Termin płatności</label>
                  <input type="date" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.payment_due_date || ''} onChange={e => setContractorForm({...contractorForm, payment_due_date: e.target.value})} />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status płatności</label>
                  <select className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.payment_status || 'unpaid'} onChange={e => setContractorForm({...contractorForm, payment_status: e.target.value})}>
                    <option value="unpaid">Nieopłacone</option>
                    <option value="advance_paid">Zaliczka zapłacona</option>
                    <option value="paid">Opłacone w całości</option>
                    <option value="overdue">Po terminie</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Powiązania, Umowy, Pliki */}
            <div className={`p-5 md:p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                <Link size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}/> Tagi, Powiązania i Pliki
              </h4>

              <div className="mb-5">
                <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tagi / Etykiety</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {contractorForm.tags?.map((tag: string) => (
                    <span key={tag} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400 border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                      {tag}
                      <button type="button" className="hover:text-red-500 transition-colors" onClick={() => setContractorForm({...contractorForm, tags: contractorForm.tags.filter((t: string) => t !== tag)})}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="newTagInput"
                    placeholder="Nowy tag (np. dostawcy, prelegenci)"
                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newTagInput') as HTMLInputElement;
                      const tag = input.value.trim();
                      if (tag && !contractorForm.tags?.includes(tag)) {
                        setContractorForm({...contractorForm, tags: [...(contractorForm.tags || []), tag]});
                        input.value = '';
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                  >
                    Dodaj
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Przypisany pojazd</label>
                  <select className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.fleet_id || ''} onChange={e => setContractorForm({...contractorForm, fleet_id: e.target.value || null})}>
                    <option value="">- brak -</option>
                    {fleet.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Przypisany prelegent</label>
                  <select className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.speaker_id || ''} onChange={e => setContractorForm({...contractorForm, speaker_id: e.target.value || null})}>
                    <option value="">- brak -</option>
                    {partners.filter(p => p.type === 'speaker').map(s => (
                      <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Przypisany sponsor</label>
                  <select className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.partner_id || ''} onChange={e => setContractorForm({...contractorForm, partner_id: e.target.value || null})}>
                    <option value="">- brak -</option>
                    {partners.filter(p => p.type === 'sponsor').map(p => (
                      <option key={p.id} value={p.id}>{p.sponsor_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status operacyjny</label>
                  <select className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.operational_status || contractorForm.status || 'new_contact'} onChange={e => setContractorForm({...contractorForm, operational_status: e.target.value, status: e.target.value})}>
                    <option value="new_contact">Nowy kontakt</option>
                    <option value="inquiry_sent">Zapytanie wysłane</option>
                    <option value="waiting_quote">Oczekuje na wycenę</option>
                    <option value="quote_received">Wycena otrzymana</option>
                    <option value="negotiation">Negocjacje</option>
                    <option value="accepted">Zaakceptowany</option>
                    <option value="contract_signed">Umowa podpisana</option>
                    <option value="in_progress">Realizacja</option>
                    <option value="settled">Rozliczony</option>
                    <option value="rejected">Odrzucony</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status umowy</label>
                  <select className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.contract_status || 'none'} onChange={e => setContractorForm({...contractorForm, contract_status: e.target.value})}>
                    <option value="none">Brak umowy</option>
                    <option value="draft">Projekt umowy</option>
                    <option value="sent">Wysłana do podpisu</option>
                    <option value="signed">Podpisana</option>
                    <option value="cancelled">Anulowana</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Data podpisania</label>
                  <input type="date" className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.contract_signed_date || ''} onChange={e => setContractorForm({...contractorForm, contract_signed_date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Numer umowy</label>
                  <input className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.contract_number || ''} onChange={e => setContractorForm({...contractorForm, contract_number: e.target.value})} placeholder="np. UM/2026/05/01" />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Link do folderu (np. Google Drive)</label>
                  <input className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.document_folder_url || ''} onChange={e => setContractorForm({...contractorForm, document_folder_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Wgraj plik (Faktura/Kosztorys)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className={`text-[10px] w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-colors ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700' : 'text-slate-600 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300'}`}
                    onChange={e => setNewFiles({...newFiles, contractorInvoice: e.target.files ? e.target.files[0] : null})}
                  />
                  {contractorForm.invoice_url && !newFiles.contractorInvoice && (
                    <div className="mt-3">
                      <a href={contractorForm.invoice_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-xs font-bold underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                        <ExternalLink size={12}/> Zobacz obecny dokument
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Notatki wewnętrzne</label>
                  <textarea rows={3} className={`w-full border rounded-xl px-4 py-2.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={contractorForm.notes || ''} onChange={e => setContractorForm({...contractorForm, notes: e.target.value})} placeholder="Uwagi i ustalenia..." />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a] disabled:opacity-70' : 'bg-slate-900 hover:bg-black text-[#e8ce7a] disabled:opacity-70'}`}
            >
              {updating ? 'Zapisywanie...' : (isEditingContractor ? 'Zapisz zmiany w profilu' : 'Dodaj podwykonawcę')}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ============================================================================ */}
{/* checklista */}
{/* ============================================================================ */}
{activeTab === 'checklista' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* HEADER */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <ClipboardList size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Zadania recepcji i opiekuna pacjenta
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Twórz zadania dla recepcji, lekarza, managera i opiekuna pacjenta, z priorytetami oraz terminami.
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <HelpButton sectionKey="operations" />
        <button
          onClick={() => {
            setChecklistGroupForm({
              title: '',
              description: '',
              category: 'general',
              color: '#475569', // Default neutralny kolor
              is_open: true,
              display_order: checklistGroups.length
            })
            setIsEditingChecklistGroup(false)
            setIsChecklistGroupModalOpen(true)
          }}
          className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Plus size={14} /> Dodaj zadania
        </button>
      </div>
    </div>

    {/* SMART HINT (Zamiast "Atrapy") */}
    <div className={`rounded-[24px] border p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors ${isDarkMode ? 'bg-gradient-to-r from-indigo-950/40 to-[#0f172a] border-indigo-900/50' : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Sparkles size={20} />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Asystent Organizacyjny
          </p>
          <h4 className={`text-sm md:text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Stan zadań operacyjnych
          </h4>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Obecnie masz <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{checklistItems.filter((item: any) => !item.is_done).length} zadań otwartych</strong>.
            W tym <strong className={isDarkMode ? 'text-rose-400' : 'text-rose-600'}>{checklistItems.filter((item: any) => String(item.priority || '').toLowerCase() === 'high' && !item.is_done).length}</strong> oznaczonych jako pilne (priorytet wysoki).
            System AI z czasem pomoże generować powtarzalne listy np. dla dostawców.
          </p>
        </div>
      </div>
    </div>

    {/* STATYSTYKI */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {(() => {
        const total = checklistItems.length
        const done = checklistItems.filter(i => i.is_done).length
        const percent = total ? Math.round((done / total) * 100) : 0
        const estimatedCost = checklistItems.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0)

        return (
          <>
            <div className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Aktywne Listy</p>
                <ClipboardList size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
              </div>
              <p className={`mt-3 text-2xl font-black tabular-nums tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{checklistGroups.length}</p>
            </div>

            <div className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Wszystkie Zadania</p>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{total - done} Otwarte</div>
              </div>
              <p className={`mt-3 text-2xl font-black tabular-nums tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{total}</p>
            </div>

            <div className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progres Zadań</p>
                <CheckCircle2 size={14} className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} />
              </div>
              <p className={`mt-2 text-2xl font-black tabular-nums tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{percent}%</p>
              <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-full transition-all duration-1000 ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Szacowany Koszt</p>
                <Wallet size={14} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              </div>
              <p className={`mt-3 text-xl md:text-2xl font-black tabular-nums tracking-tight ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {estimatedCost.toLocaleString('pl-PL')} <span className="text-sm">zł</span>
              </p>
            </div>
          </>
        )
      })()}
    </div>

    {/* LISTY / KAFELKI */}
    {checklistGroups.length === 0 ? (
      <div className={`rounded-[32px] border shadow-sm p-16 text-center ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
        <ClipboardList size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
        <p className={`font-black text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Brak list operacyjnych</p>
        <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Dodaj pierwszą listę, np. „Zakupy przed eventem” lub „Lista rzeczy do spakowania”.
        </p>
      </div>
    ) : (
      <div className="space-y-5">
        {checklistGroups.map(group => {
          const items = checklistItems.filter(item => item.group_id === group.id)
          const done = items.filter(item => item.is_done).length
          const percent = items.length ? Math.round((done / items.length) * 100) : 0

          return (
            <div
              key={group.id}
              className={`rounded-[24px] md:rounded-[28px] border shadow-sm overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-300'}`}
            >
              {/* NAGŁÓWEK KAFELKA */}
              <div
                className={`p-5 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-900/80 border-b border-slate-800' : 'hover:bg-slate-50 border-b border-slate-100'}`}
                onClick={() => toggleChecklistGroupOpen(group)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: group.color || '#475569' }}
                    >
                      <ClipboardList size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-black text-base truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {group.title}
                        </h4>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {items.length} zadań
                        </span>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${percent === 100 ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : (isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200')}`}>
                          {percent}%
                        </span>
                      </div>

                      {group.description && (
                        <p className={`text-xs font-medium mt-1 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {group.description}
                        </p>
                      )}

                      <div className={`w-full max-w-sm h-1.5 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: group.color || '#475569'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveChecklistGroupId(group.id)
                        setChecklistItemForm({
                          group_id: group.id,
                          title: '',
                          status: 'todo',
                          priority: 'normal',
                          is_done: false,
                          estimated_cost: 0,
                          display_order: items.length
                        })
                        setIsEditingChecklistItem(false)
                        setIsChecklistItemModalOpen(true)
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${isDarkMode ? 'bg-[#e8ce7a] text-slate-900 hover:bg-[#d8bd65]' : 'bg-slate-900 text-[#e8ce7a] hover:bg-black'}`}
                    >
                      <Plus size={12} /> Zadanie
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setChecklistGroupForm(group)
                        setIsEditingChecklistGroup(true)
                        setIsChecklistGroupModalOpen(true)
                      }}
                      className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChecklistGroup(group.id)
                      }}
                      className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className={`ml-2 p-2 rounded-full transition-transform duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} ${group.is_open ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ROZWIJANA ZAWARTOŚĆ LISTY */}
              {group.is_open && (
                <div className={`p-4 md:p-5 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  {items.length === 0 ? (
                    <div className={`p-8 text-center text-xs font-bold border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                      Brak zadań w tej liście. Dodaj pierwszy podpunkt.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            item.is_done
                              ? (isDarkMode ? 'bg-slate-900/20 border-emerald-900/30 opacity-70' : 'bg-white border-emerald-100 opacity-70')
                              : (isDarkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')
                          }`}
                        >
                          <div className="flex items-start gap-4 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleChecklistItem(item)}
                              className={`w-6 h-6 mt-0.5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                                item.is_done
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : (isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300')
                              }`}
                            >
                              {item.is_done && <CheckCircle2 size={16} />}
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`font-black text-sm transition-colors ${
                                  item.is_done
                                    ? (isDarkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through')
                                    : (isDarkMode ? 'text-white' : 'text-slate-900')
                                }`}
                              >
                                {item.title}
                              </p>

                              {item.notes && (
                                <p className={`text-xs mt-1.5 whitespace-pre-line ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {item.notes}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 mt-3">
                                {item.priority && (
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                      item.priority === 'high'
                                        ? (isDarkMode ? 'bg-rose-900/20 text-rose-400 border-rose-800/50' : 'bg-rose-50 text-rose-700 border-rose-200')
                                        : item.priority === 'low'
                                        ? (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                                        : (isDarkMode ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-200')
                                    }`}
                                  >
                                    {item.priority === 'high'
                                      ? 'Pilne'
                                      : item.priority === 'low'
                                      ? 'Niskie'
                                      : 'Normalne'}
                                  </span>
                                )}

                                {item.due_date && (
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    <Clock size={10} /> {item.due_date}
                                  </span>
                                )}

                                {item.assigned_to && (
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDarkMode ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                    <Users size={10} /> {item.assigned_to}
                                  </span>
                                )}

                                {Number(item.estimated_cost || 0) > 0 && (
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                    <Wallet size={10} /> {Number(item.estimated_cost).toLocaleString('pl-PL')} zł
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setChecklistItemForm(item)
                                setActiveChecklistGroupId(group.id)
                                setIsEditingChecklistItem(true)
                                setIsChecklistItemModalOpen(true)
                              }}
                              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )}

    {/* MODAL DODAWANIA GRUPY (LISTY) */}
    {isChecklistGroupModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-xl w-full p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <ClipboardList size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
                {isEditingChecklistGroup ? 'Edytuj listę' : 'Nowa lista'}
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Stwórz katalog, np. „Lista zakupów” albo „Do zdzwonienia”.
              </p>
            </div>

            <button
              onClick={() => setIsChecklistGroupModalOpen(false)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveChecklistGroup} className="space-y-5">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Tytuł listy *
              </label>
              <input
                required
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={checklistGroupForm.title || ''}
                onChange={e => setChecklistGroupForm({ ...checklistGroupForm, title: e.target.value })}
                placeholder="np. Oświetlenie sceny - braki"
              />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Krótki opis
              </label>
              <textarea
                rows={2}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={checklistGroupForm.description || ''}
                onChange={e => setChecklistGroupForm({ ...checklistGroupForm, description: e.target.value })}
                placeholder="Cel tej listy..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kategoria
                </label>
                <select
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={checklistGroupForm.category || 'general'}
                  onChange={e => setChecklistGroupForm({ ...checklistGroupForm, category: e.target.value })}
                >
                  <option value="general">Ogólne</option>
                  <option value="shopping">Zakupy</option>
                  <option value="calls">Do zdzwonienia</option>
                  <option value="suppliers">Dostawcy</option>
                  <option value="decor">Wystrój / dekoracje</option>
                  <option value="catering">Catering</option>
                  <option value="transport">Transport</option>
                  <option value="documents">Dokumenty</option>
                  <option value="event_day">Dzień eventu</option>
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kolor ikony
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={checklistGroupForm.color || '#475569'}
                    onChange={e => setChecklistGroupForm({ ...checklistGroupForm, color: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    className={`flex-1 border rounded-xl px-4 py-3 text-sm font-mono font-bold uppercase outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-300 focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-slate-900'}`}
                    value={checklistGroupForm.color || '#475569'}
                    onChange={e => setChecklistGroupForm({ ...checklistGroupForm, color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a] disabled:opacity-70' : 'bg-slate-900 hover:bg-black text-[#e8ce7a] disabled:opacity-70'}`}
            >
              {updating ? 'Zapisywanie...' : 'Zapisz listę'}
            </button>
          </form>
        </div>
      </div>
    )}

    {/* MODAL ZADANIA */}
    {isChecklistItemModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {isEditingChecklistItem ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <Plus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
                {isEditingChecklistItem ? 'Edytuj zadanie' : 'Nowe zadanie'}
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Podpunkt z możliwością przypisania osoby i oszacowania kosztu.
              </p>
            </div>

            <button
              onClick={() => setIsChecklistItemModalOpen(false)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveChecklistItem} className="space-y-5">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Zadanie *
              </label>
              <input
                required
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={checklistItemForm.title || ''}
                onChange={e => setChecklistItemForm({ ...checklistItemForm, title: e.target.value })}
                placeholder="np. Potwierdzić dostawę sceny"
              />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Szczegóły / Notatka
              </label>
              <textarea
                rows={2}
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={checklistItemForm.notes || ''}
                onChange={e => setChecklistItemForm({ ...checklistItemForm, notes: e.target.value })}
                placeholder="Dodatkowe informacje..."
              />
              <AiTextAssistButton
                eventId={id}
                sectionKey="checklist"
                fieldKey="task_note"
                currentValue={checklistItemForm.notes || ''}
                placeholder="Napisz instrukcję dla podwykonawcy..."
                onApply={(text) => setChecklistItemForm({ ...checklistItemForm, notes: text })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Katalog / Lista
                </label>
                <select
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={checklistItemForm.group_id || activeChecklistGroupId || ''}
                  onChange={e => setChecklistItemForm({ ...checklistItemForm, group_id: e.target.value })}
                >
                  <option value="">Wybierz listę</option>
                  {checklistGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Priorytet
                </label>
                <select
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={checklistItemForm.priority || 'normal'}
                  onChange={e => setChecklistItemForm({ ...checklistItemForm, priority: e.target.value })}
                >
                  <option value="low">Niski</option>
                  <option value="normal">Normalny</option>
                  <option value="high">Pilny</option>
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Deadline (Termin)
                </label>
                <input
                  type="date"
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                  value={checklistItemForm.due_date || ''}
                  onChange={e => setChecklistItemForm({ ...checklistItemForm, due_date: e.target.value })}
                />
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Odpowiedzialny (Kto)
                </label>
                <input
                  className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  value={checklistItemForm.assigned_to || ''}
                  onChange={e => setChecklistItemForm({ ...checklistItemForm, assigned_to: e.target.value })}
                  placeholder="np. Ania, Marek"
                />
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Szacowany koszt (dla ułatwienia budżetu)
              </label>
              <input
                type="number"
                step="0.01"
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                value={checklistItemForm.estimated_cost || ''}
                onChange={e => setChecklistItemForm({ ...checklistItemForm, estimated_cost: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all mt-2 ${
              checklistItemForm.is_done
                ? (isDarkMode ? 'border-emerald-500 bg-emerald-900/10' : 'border-emerald-500 bg-emerald-50')
                : (isDarkMode ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-white')
            }`}>
              <div>
                <p className={`font-black text-sm ${checklistItemForm.is_done ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-700') : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>
                  Zadanie Wykonane
                </p>
              </div>
              <input
                type="checkbox"
                checked={checklistItemForm.is_done || false}
                onChange={e =>
                  setChecklistItemForm({
                    ...checklistItemForm,
                    is_done: e.target.checked,
                    status: e.target.checked ? 'done' : 'todo'
                  })
                }
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                checklistItemForm.is_done
                  ? 'bg-emerald-500 text-white'
                  : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')
              }`}>
                {checklistItemForm.is_done && <CheckCircle2 size={14} />}
              </div>
            </label>

            <button
              type="submit"
              disabled={updating}
              className={`w-full mt-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a] disabled:opacity-70' : 'bg-slate-900 hover:bg-black text-[#e8ce7a] disabled:opacity-70'}`}
            >
              {updating ? 'Zapisywanie...' : 'Zapisz zadanie'}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ============================================================================ */}
{/* REJESTRACJA PACJENTÓW (Główna Baza) - Zastępuje stare 'bilety' */}
{/* ============================================================================ */}
{activeTab === 'bilety' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

    {/* NAGŁÓWEK SEKCJI */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <UserRoundPlus size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Rejestracja Pacjentów
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Główna baza Twojej kliniki. Dodaj pacjenta tutaj, aby system mógł założyć mu cyfrową teczkę, generować zgody i historię choroby.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          onClick={() => {
            setPatientForm({ status: 'active' })
            setIsEditingPatient(false)
            setIsPatientModalOpen(true)
          }}
          className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Plus size={14} /> Dodaj Pacjenta
        </button>
      </div>
    </div>

    {/* METRYKI BAZOWE */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {[
        { label: 'Wszyscy Pacjenci', value: patients.length, icon: Users, color: isDarkMode ? 'text-slate-300' : 'text-slate-700' },
        { label: 'Aktywni', value: patients.filter((p: any) => p.status === 'active').length, icon: CheckCircle2, color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' },
        { label: 'Dodani (7 dni)', value: patients.filter((p: any) => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: TrendingUp, color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
        { label: 'Brakuje PESEL', value: patients.filter((p: any) => !p.pesel || p.pesel.length < 11).length, icon: AlertTriangle, color: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
      ].map((kpi: any) => (
        <div key={kpi.label} className={`relative overflow-hidden rounded-[20px] md:rounded-[24px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
            <kpi.icon size={80} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {kpi.label}
              </p>
              <kpi.icon size={14} className={kpi.color} />
            </div>
            <p className={`mt-3 text-2xl font-black tabular-nums tracking-tight truncate ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* LISTA PACJENTÓW (Główny rejestr) */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      
      {/* Pasek wyszukiwania */}
      <div className={`px-5 py-4 border-b flex flex-col sm:flex-row gap-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="relative flex-1">
          <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
            placeholder="Szukaj po nazwisku, PESEL, e-mail lub telefonie..."
            value={registrySearch}
            onChange={e => setRegistrySearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className={`text-[9px] font-black uppercase tracking-widest border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
            <tr>
              <th className="p-4 pl-6">Pacjent</th>
              <th className="p-4">PESEL</th>
              <th className="p-4">Kontakt</th>
              <th className="p-4">Data dołączenia</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Zarządzaj</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className={`p-12 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Brak pacjentów w bazie. Dodaj pierwszą osobę!
                </td>
              </tr>
            ) : patients
              .filter((p: any) => {
                if (!registrySearch) return true;
                const query = registrySearch.toLowerCase();
                const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
                return fullName.includes(query) || (p.pesel || '').includes(query) || (p.email || '').toLowerCase().includes(query) || (p.phone || '').includes(query);
              })
              .map((patient: any) => (
              <tr key={patient.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <td className="p-4 pl-6">
                  <p className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{patient.first_name} {patient.last_name}</p>
                </td>
                <td className="p-4">
                  <p className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {patient.pesel || <span className="text-red-400">BRAK</span>}
                  </p>
                </td>
                <td className="p-4">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{patient.phone || 'brak tel.'}</p>
                  <p className={`text-[10px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{patient.email || 'brak e-mail'}</p>
                </td>
                <td className="p-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(patient.created_at).toLocaleDateString('pl-PL')}
                  </p>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                    patient.status === 'active' 
                      ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') 
                      : (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                  }`}>
                    {patient.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => { setPatientForm(patient); setIsEditingPatient(true); setIsPatientModalOpen(true) }}
                      title="Edytuj dane"
                      className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      title="Usuń pacjenta"
                      className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-800/50' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ========================================== */}
    {/* MODAL: DODAJ / EDYTUJ PACJENTA */}
    {/* ========================================== */}
    {isPatientModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-start mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {isEditingPatient ? <Edit3 size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> : <UserRoundPlus size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />}
                {isEditingPatient ? 'Edytuj Pacjenta' : 'Zarejestruj Nowego Pacjenta'}
              </h3>
              <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Upewnij się, że wpisujesz poprawny PESEL – pacjent będzie używał go do logowania się do swoich zgód.
              </p>
            </div>
            <button onClick={() => setIsPatientModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSavePatient} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Imię *</label>
                <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="np. Jan" value={patientForm.first_name || ''} onChange={e => setPatientForm({ ...patientForm, first_name: e.target.value })} />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nazwisko *</label>
                <input required className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="np. Kowalski" value={patientForm.last_name || ''} onChange={e => setPatientForm({ ...patientForm, last_name: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Numer PESEL *</label>
                <input required maxLength={11} className={`w-full border rounded-xl px-4 py-3.5 text-sm font-mono font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="11 cyfr" value={patientForm.pesel || ''} onChange={e => setPatientForm({ ...patientForm, pesel: e.target.value })} />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Telefon</label>
                <input className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="+48..." value={patientForm.phone || ''} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>E-mail</label>
              <input type="email" className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} placeholder="pacjent@email.pl" value={patientForm.email || ''} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} />
            </div>

            <div className={`pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status w klinice</label>
              <select className={`w-full md:w-1/2 border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'}`} value={patientForm.status || 'active'} onChange={e => setPatientForm({ ...patientForm, status: e.target.value })}>
                <option value="active">Aktywny (Standardowy)</option>
                <option value="inactive">Nieaktywny</option>
                <option value="blocked">Zablokowany</option>
              </select>
            </div>

            <button type="submit" disabled={updating} className={`w-full mt-6 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a] disabled:opacity-70' : 'bg-slate-900 hover:bg-black text-[#e8ce7a] disabled:opacity-70'}`}>
              {updating ? 'Zapisywanie...' : (isEditingPatient ? 'Zapisz Zmiany' : 'Utwórz Pacjenta')}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}

{/* ============================================================================ */}
{/* ORGANIZER / CENTRUM DOWODZENIA (Z WIZUALNYM KALENDARZEM) */}
{/* =========================================================================== */}
{activeTab === 'minutowka' && (() => {

  // 1. AGREGACJA WSZYSTKICH WYDARZEŃ Z CAŁEGO PLANNERA
  const aggregatedEvents = (() => {
    const allEvents: any[] = [];

    // Z Minutówki
    runOfShow.forEach((task: any) => {
      if (task.date) {
        allEvents.push({
          id: `ros-${task.id}`,
          date: task.date,
          time: task.time,
          title: task.task,
          source: 'Minutówka',
          isCritical: task.isCritical,
          color: task.isCritical ? 'bg-red-500' : 'bg-[#253a2a]'
        });
      }
    });

    // Z Harmonogramu (Agenda)
    sessions.forEach((session: any) => {
      if (session.start_time) {
        const dateObj = new Date(session.start_time);
        if (!isNaN(dateObj.getTime())) {
          allEvents.push({
            id: `session-${session.id}`,
            date: dateObj.toISOString().slice(0, 10),
            time: dateObj.toISOString().slice(11, 16),
            title: session.title,
            source: 'Agenda',
            isCritical: false,
            color: 'bg-indigo-500'
          });
        }
      }
    });

    // Z Finansów (Płatności dla podwykonawców)
    contractors.forEach((contractor: any) => {
      if (contractor.payment_due_date && contractor.payment_status !== 'paid') {
        allEvents.push({
          id: `payment-${contractor.id}`,
          date: contractor.payment_due_date,
          time: '12:00', // Domyślna godzina dla terminów płatności
          title: `Płatność: ${contractor.name} (${contractor.gross_amount || contractor.amount} PLN)`,
          source: 'Finanse',
          isCritical: true, // Płatności traktujemy jako ważne
          color: 'bg-amber-500'
        });
      }
    });

    return allEvents.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  })();

  // Pomocnicze funkcje do kalendarza
  const today = new Date();
  const currentMonth = organizerCurrentMonth;
  const currentYear = organizerCurrentYear;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Zabezpieczenie, aby poniedziałek był pierwszym dniem (0 to niedziela w JS)
  const offsetDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const nextMonth = () => {
    if (currentMonth === 11) { setOrganizerCurrentMonth(0); setOrganizerCurrentYear(currentYear + 1); }
    else setOrganizerCurrentMonth(currentMonth + 1);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setOrganizerCurrentMonth(11); setOrganizerCurrentYear(currentYear - 1); }
    else setOrganizerCurrentMonth(currentMonth - 1);
  };

  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

  // Wydarzenia dla klikniętego dnia w kalendarzu
  const selectedDateEvents = aggregatedEvents.filter(e => e.date === selectedCalendarDate);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">

      {/* 1. HERO */}
      <section className={`relative overflow-hidden rounded-[24px] md:rounded-[32px] border shadow-lg p-6 md:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-[#0f172a] border-slate-700' : 'bg-gradient-to-br from-slate-900 to-[#1e293b] border-slate-800'}`}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e8ce7a]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8ce7a]/30 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8ce7a] backdrop-blur-md">
            <ClipboardList size={14} />
            Organizer & Kalendarz
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Centrum Dowodzenia Eventu
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed font-medium">
            Oś czasu Twojego wydarzenia. Dodawaj zadania (minutówkę), a system automatycznie ściągnie tutaj również
            terminy płatności do podwykonawców oraz sesje z agendy. Pełna kontrola w jednym kalendarzu.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-colors border border-white/15"
          >
            <Printer size={14} /> Drukuj plan
          </button>
        </div>
      </section>

      {/* 2. STATYSTYKI GŁÓWNE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Wszystkie Zdarzenia', value: aggregatedEvents.length, icon: Calendar, color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
          { label: 'Oczekujące Płatności', value: aggregatedEvents.filter(e => e.source === 'Finanse').length, icon: Wallet, color: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
          { label: 'Zadania Minutówki', value: runOfShow.length, icon: ClipboardList, color: isDarkMode ? 'text-slate-300' : 'text-slate-700' },
          { label: 'Punkty Agendy', value: sessions.length, icon: Clock, color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600' }
        ].map((item: any) => (
          <div key={item.label} className={`relative overflow-hidden rounded-[20px] md:rounded-[24px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
              <item.icon size={80} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.label}
                </p>
                <item.icon size={14} className={item.color} />
              </div>
              <p className={`mt-3 text-2xl font-black tabular-nums tracking-tight ${item.color}`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* LEWA KOLUMNA: KALENDARZ I AI ASSIST */}
        <div className="xl:col-span-5 space-y-6">

          {/* AI ASSIST PANEL */}
          <div className={`rounded-[24px] border p-5 md:p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-900/50' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Sparkles size={20} />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  AI Time Management
                </p>
                <h4 className={`text-sm md:text-base font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Analiza harmonogramu
                </h4>

                <div className="mt-3 space-y-2">
                  {aggregatedEvents.filter(e => e.source === 'Finanse').length > 0 && (
                    <p className={`text-xs font-medium flex items-start gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-amber-500 mt-0.5">/</span>
                      Masz oczekujące terminy płatności do podwykonawców. Upewnij się, że budżet jest zabezpieczony na te daty.
                    </p>
                  )}
                  {aggregatedEvents.length === 0 && (
                    <p className={`text-xs font-medium flex items-start gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-indigo-500 mt-0.5">/</span>
                      Twój kalendarz jest pusty. Dodaj zadania organizacyjne, by AI mogło zacząć śledzić obłożenie pracą przed eventem.
                    </p>
                  )}
                  {aggregatedEvents.filter(e => e.isCritical).length > 0 && (
                    <p className={`text-xs font-medium flex items-start gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-red-500 mt-0.5">/</span>
                      W kalendarzu znajdują się punkty krytyczne. Przypisz im priorytet na dzisiejszej odprawie.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* WIZUALNY KALENDARZ */}
          <div className={`rounded-[28px] border shadow-sm p-5 md:p-6 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {monthNames[currentMonth]} {currentYear}
              </h4>
              <div className="flex gap-2">
                <button onClick={prevMonth} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}><ChevronDown size={16} className="rotate-90" /></button>
                <button onClick={nextMonth} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}><ChevronDown size={16} className="-rotate-90" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
                <div key={d} className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Puste dni na początku miesiąca */}
              {Array.from({ length: offsetDays }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl opacity-0"></div>
              ))}

              {/* Dni miesiąca */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedCalendarDate === formattedDate;
                const isToday = todayIso === formattedDate;

                // Szukamy zdarzeń na dany dzień (do oznaczenia kropek)
                const dayEvents = aggregatedEvents.filter(e => e.date === formattedDate);
                const hasCritical = dayEvents.some(e => e.isCritical);
                const hasFinance = dayEvents.some(e => e.source === 'Finanse');
                const hasAgenda = dayEvents.some(e => e.source === 'Agenda');

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedCalendarDate(formattedDate)}
                    className={`aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all border ${
                      isSelected
                        ? (isDarkMode ? 'bg-slate-800 border-[#e8ce7a] text-white shadow-md' : 'bg-slate-900 border-slate-900 text-white shadow-md')
                        : isToday
                          ? (isDarkMode ? 'bg-slate-800/50 border-slate-600 text-[#e8ce7a]' : 'bg-slate-100 border-slate-300 text-slate-900')
                          : (isDarkMode ? 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50')
                    }`}
                  >
                    <span className="text-xs md:text-sm font-black">{day}</span>

                    {/* Wskaźniki zdarzeń pod numerem dnia */}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {hasCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                        {hasFinance && !hasCritical && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                        {hasAgenda && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                        {!hasCritical && !hasFinance && !hasAgenda && <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className={`mt-6 pt-5 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h5 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Zdarzenia dla: {selectedCalendarDate}
              </h5>

              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {selectedDateEvents.length === 0 ? (
                  <p className={`text-xs font-medium italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Brak zaplanowanych zadań, płatności i agendy na ten dzień.
                  </p>
                ) : (
                  selectedDateEvents.map((ev: any) => (
                    <div key={ev.id} className={`p-3 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ev.color}`}></span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{ev.time}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>{ev.source}</span>
                        </div>
                        <p className={`text-xs font-black leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ev.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: DODAWANIE MINUTÓWKI I LISTA */}
        <div className="xl:col-span-7 space-y-6">

          <div className={`rounded-[28px] border shadow-sm p-5 md:p-6 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
                <Plus size={18} />
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Dodaj Zadanie Operacyjne (Minutówka)
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Data</label>
                  <input
                    type="date"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                    value={newRosTask.date || ''}
                    onChange={e => setNewRosTask({ ...newRosTask, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Godzina</label>
                  <input
                    type="time"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                    value={newRosTask.time}
                    onChange={e => setNewRosTask({ ...newRosTask, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zadanie / Akcja *</label>
                <textarea
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  placeholder="Np. odbiór dekoracji, briefing ekipy AV..."
                  value={newRosTask.task}
                  onChange={e => setNewRosTask({ ...newRosTask, task: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Osoba / Ekipa</label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                    placeholder="np. Ania / Technik"
                    value={newRosTask.assignee}
                    onChange={e => setNewRosTask({ ...newRosTask, assignee: e.target.value })}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Lokalizacja</label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                    placeholder="np. Foyer Główne"
                    value={newRosTask.location}
                    onChange={e => setNewRosTask({ ...newRosTask, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newRosTask.isCritical}
                    onChange={e => setNewRosTask({ ...newRosTask, isCritical: e.target.checked })}
                  />
                  <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${isDarkMode ? 'bg-slate-700 peer-checked:bg-red-500' : 'bg-slate-200 peer-checked:bg-red-500'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${newRosTask.isCritical ? 'text-red-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                    Zadanie Krytyczne
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (!newRosTask.time || !newRosTask.task) return
                    setRunOfShow([
                      ...runOfShow,
                      {
                        ...newRosTask,
                        id: Date.now().toString(),
                        status: 'pending',
                        date: newRosTask.date || (event?.event_date ? String(event.event_date).slice(0, 10) : todayIso)
                      }
                    ].sort((a, b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`)))

                    setNewRosTask({ date: '', time: '', task: '', assignee: '', location: '', note: '', isCritical: false })
                  }}
                  className={`px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>

          {/* LISTA ZADAŃ W MINUTÓWCE */}
          <div className={`rounded-[28px] border shadow-sm p-5 md:p-6 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h4 className={`font-black text-sm uppercase tracking-wider mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Lista Minutówki ({runOfShow.length})
            </h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {runOfShow.length === 0 ? (
                <div className={`p-8 text-center text-xs font-bold border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  Brak punktów w minutówce operacyjnej.
                </div>
              ) : (
                runOfShow
                  .sort((a: any, b: any) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`))
                  .map((task: any) => (
                    <div
                      key={task.id}
                      className={`relative border rounded-2xl p-4 transition-all group ${
                        task.status === 'done'
                          ? (isDarkMode ? 'bg-slate-900/30 border-emerald-900/30 opacity-60' : 'bg-slate-50 border-emerald-100 opacity-60')
                          : task.isCritical
                            ? (isDarkMode ? 'bg-red-900/10 border-red-900/40 shadow-sm' : 'bg-red-50/50 border-red-200 shadow-sm')
                            : (isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">

                          <button
                            type="button"
                            onClick={() => {
                              const newRos = runOfShow.map((t: any) =>
                                t.id === task.id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
                              )
                              setRunOfShow(newRos)
                            }}
                            className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                              task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : (isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300')
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 size={16} />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'done' ? (isDarkMode ? 'text-slate-500' : 'text-slate-400') : (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900')}`}>
                                {task.time || '-'}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                {formatPlannerDate(task.date || event?.event_date)}
                              </span>
                              {task.isCritical && task.status !== 'done' && (
                                <span className="px-2 py-0.5 bg-red-500 text-white border border-red-600 text-[8px] font-black uppercase tracking-wider rounded">
                                  Krytyczne
                                </span>
                              )}
                            </div>

                            <p className={`text-sm font-black leading-snug ${task.status === 'done' ? (isDarkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>
                              {task.task}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider">
                              {task.assignee && (
                                <span className={`px-2 py-1 rounded flex items-center gap-1 border ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                  <Users size={10} /> {task.assignee}
                                </span>
                              )}
                              {task.location && (
                                <span className={`px-2 py-1 rounded flex items-center gap-1 border ${isDarkMode ? 'bg-purple-900/20 border-purple-800/50 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                                  <MapPin size={10} /> {task.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRunOfShow(runOfShow.filter((t: any) => t.id !== task.id))}
                          className={`p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ${isDarkMode ? 'hover:bg-red-900/30 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
})()}


{/* pass QR */}
{/* ============================================================================ */}
{activeTab === 'eventpass' && (
  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">
    {/* NAGŁÓWEK */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <QrCode size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Identyfikacja pacjenta i check-in QR
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Zarządzaj kodami QR pacjentów, check-inem wizyty oraz uprawnieniami recepcji, lekarzy i opiekunów.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <HelpButton sectionKey="eventpass" />

        <button
          onClick={() => {
            loadPatients()
            loadEventPassData()
          }}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
        >
          <RefreshCw size={14} /> Odśwież
        </button>

        <button
          onClick={() => {
            setStaffAccessForm({
              role: 'reception',
              is_active: true,
              can_entry_checkin: true
            })
            setIsStaffAccessModalOpen(true)
          }}
          className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
        >
          <ShieldCheck size={14} /> Role personelu
        </button>
      </div>
    </div>

    {/* METRYKI */}
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
      {[
        ['Pacjenci w bazie', patientQrMetrics.totalPatients, Users],
        ['QR wygenerowane', patientQrMetrics.qrGenerated, QrCode],
        ['Check-in wizyt', patientQrMetrics.checkedIn, ScanLine],
        ['Identyfikatory wydane', patientQrMetrics.idsIssued, BadgeCheck],
        ['Wizyty zamknięte', patientQrMetrics.visitsClosed, CheckCircle2],
        ['Role personelu', staffAccessList.length, ShieldCheck],
      ].map(([label, value, Icon]: any) => (
        <div key={label} className={`relative overflow-hidden rounded-[20px] md:rounded-[24px] border p-4 shadow-sm transition-colors duration-200 flex flex-col justify-between min-h-[100px] ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
            <Icon size={70} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
              </p>
              <Icon size={14} className={`shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <p className={`mt-2 text-2xl font-black tabular-nums tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* RAPORT */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className="mb-6">
        <h4 className={`font-black flex items-center gap-2 text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <BarChart3 size={18} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
          Raport check-in LIVE
        </h4>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Statusy pacjentów na podstawie QR, check-inu i działań personelu.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'QR aktywne', value: patientQrMetrics.qrGenerated, total: patientQrMetrics.totalPatients, color: 'bg-blue-500' },
          { label: 'Check-in', value: patientQrMetrics.checkedIn, total: patientQrMetrics.qrGenerated, color: 'bg-emerald-500' },
          { label: 'ID wydane', value: patientQrMetrics.idsIssued, total: patientQrMetrics.qrGenerated, color: 'bg-indigo-500' },
          { label: 'Zamknięte wizyty', value: patientQrMetrics.visitsClosed, total: patientQrMetrics.idsIssued, color: 'bg-slate-500' },
        ].map(({ label, value, total, color }: any) => {
          const percent = Number(total || 0) > 0 ? Math.min(Math.round((Number(value || 0) / Number(total || 1)) * 100), 100) : 0
          return (
            <div key={label} className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest leading-tight mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
              </p>
              <p className={`text-xl font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {value} <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {total || 0}</span>
              </p>
              <div className={`h-1.5 w-full rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>

    {/* LISTA PACJENTÓW */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className={`p-5 border-b flex flex-col md:flex-row gap-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
            placeholder="Szukaj pacjenta po imieniu, nazwisku, PESEL, mailu, telefonie lub tokenie QR..."
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
          />
        </div>

        <select
          className={`border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-wider outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-300 focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-700 focus:border-slate-900'}`}
          value={patientQrFilter}
          onChange={e => setPatientQrFilter(e.target.value)}
        >
          <option value="all">Wszyscy pacjenci</option>
          <option value="no_qr">Bez QR</option>
          <option value="qr">Z QR</option>
          <option value="checked_in">Po check-in</option>
          <option value="id_issued">Z wydanym ID</option>
          <option value="closed">Zamknięte wizyty</option>
        </select>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        {filteredPatientRows.length === 0 ? (
          <div className={`p-12 text-center font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Brak pacjentów pasujących do filtrów.
          </div>
        ) : filteredPatientRows.map(({ patient, unit }: any) => {
          const isExpanded = expandedPatientIds[patient.id] === true

          return (
            <div key={patient.id} className={`rounded-2xl border transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="p-4 md:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className={`font-black text-base md:text-lg truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Pacjent'}
                    </h4>

                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                      unit
                        ? isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDarkMode ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {unit ? 'QR aktywny' : 'Brak QR'}
                    </span>

                    {unit?.checked_in && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        Check-in wykonany
                      </span>
                    )}

                    {unit?.wristband_returned && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        Wizyta zamknięta
                      </span>
                    )}
                  </div>

                  <p className={`text-xs font-medium truncate mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {patient.email || 'brak email'} <span className="opacity-50 mx-1">|</span>
                    {patient.phone || 'brak tel.'} <span className="opacity-50 mx-1">|</span>
                    PESEL: {patient.pesel || 'brak'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ['QR', unit?.qr_token ? 'TAK' : 'NIE'],
                    ['Check-in', unit?.checked_in ? 'TAK' : 'NIE'],
                    ['ID', unit?.wristband_issued ? 'TAK' : 'NIE'],
                  ].map(([label, value]: any) => (
                    <div key={label} className={`px-3 py-2 rounded-xl border text-center min-w-[76px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
                      <p className="font-black text-sm tabular-nums mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
                  {!unit ? (
                    <button
                      onClick={() => createPatientQrUnit(patient)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                    >
                      <QrCode size={14} /> Generuj QR
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPatientForPass(patient)
                          setSelectedAttendeeUnit(unit)
                        }}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Eye size={14} /> Podgląd QR
                      </button>

                      <button
                        onClick={() => setExpandedPatientIds(prev => ({ ...prev, [patient.id]: !prev[patient.id] }))}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        Akcje <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && unit && (
                <div className={`border-t p-4 md:p-5 ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-1.5 rounded-xl border shadow-sm bg-white ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <QRCode value={unit.qr_token} size={64} />
                      </div>

                      <div className="min-w-0">
                        <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {unit.display_name}
                        </p>
                        <p className={`text-[10px] font-mono mt-1 break-all ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {unit.qr_token}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(unit.qr_token)
                            showNotification('Token QR skopiowany', 'success')
                          }}
                          className={`mt-2 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <Copy size={12} /> Kopiuj token
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full xl:w-auto">
                      <button onClick={() => handleCheckInAttendeeUnit(unit)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                        <ScanLine size={12}/> Check-in
                      </button>

                      <button onClick={() => handleIssueWristband(unit)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
                        <BadgeCheck size={12}/> Wydaj ID
                      </button>

                      <button onClick={() => handleReturnWristband(unit)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <CheckCircle2 size={12}/> Zamknij wizytę
                      </button>

                      <button onClick={() => handleResetUnitStatus(unit)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${isDarkMode ? 'bg-red-900/20 border-red-800/50 text-red-400 hover:bg-red-900/40' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}>
                        <XCircle size={12}/> Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>

    {/* ROLE PERSONELU */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h4 className={`font-black flex items-center gap-2 text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <ShieldCheck size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
            Role personelu i dostęp QR
          </h4>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Twórz dedykowane, ograniczone linki dla recepcji, lekarza, managera i opiekuna pacjenta.
          </p>
        </div>

        <button
          onClick={() => {
            setStaffAccessForm({
              role: 'reception',
              is_active: true,
              can_entry_checkin: true
            })
            setIsStaffAccessModalOpen(true)
          }}
          className={`shrink-0 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
        >
          <Plus size={14}/> Dodaj rolę
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {staffAccessList.length === 0 ? (
          <div className={`col-span-full p-10 text-center font-bold text-sm border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            Brak zdefiniowanych ról personelu QR.
          </div>
        ) : staffAccessList.map((staff: any) => {
          const staffPassUrl = staff.access_token ? getStaffPassUrl(staff.access_token) : ''
          const shortLink = staff.access_token ? `/staff-pass/${String(staff.access_token).slice(0, 10)}...` : ''
          const permissions = [
            staff.can_entry_checkin && 'Check-in wizyty',
            staff.can_meal_redemption && 'Dokumenty',
            staff.can_gadget_redemption && 'Pakiet pacjenta',
            staff.can_transport_checkin && 'Ścieżka pacjenta',
            staff.can_wristband_issue && 'Wydanie identyfikatora',
            staff.can_wristband_return && 'Zamknięcie wizyty',
          ].filter(Boolean).join(' / ')

          return (
            <div key={staff.id} className={`rounded-2xl border p-5 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className={`font-black text-lg truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{staff.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{getClinicStaffRoleLabel(staff.role)}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${staff.is_active !== false ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')}`}>
                  {staff.is_active !== false ? 'Aktywny' : 'Wyłączony'}
                </span>
              </div>

              <div className="mt-3">
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Uprawnienia QR</p>
                <p className={`text-[10px] font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{permissions || 'Brak uprawnień'}</p>
              </div>

              <div className={`mt-5 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Prywatny link skanera</p>
                {staff.access_token ? (
                  <>
                    <a href={staffPassUrl} target="_blank" rel="noopener noreferrer" className={`block w-full px-4 py-3 rounded-xl border text-[11px] font-mono font-bold truncate transition-colors hover:underline ${isDarkMode ? 'bg-slate-950 border-slate-700 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'}`}>
                      {shortLink}
                    </a>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(staffPassUrl)
                          showNotification('Link dla obsługi skopiowany', 'success')
                        }}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        <Copy size={14}/> Kopiuj Link
                      </button>
                      <a href={staffPassUrl} target="_blank" rel="noopener noreferrer" className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border ${isDarkMode ? 'bg-[#e8ce7a]/10 border-[#e8ce7a]/30 text-[#e8ce7a] hover:bg-[#e8ce7a]/20' : 'bg-slate-900 border-slate-900 text-[#e8ce7a] hover:bg-black'}`}>
                        <ExternalLink size={14}/> Otwórz
                      </a>
                    </div>
                  </>
                ) : (
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Brak wygenerowanego tokenu.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>

    {/* MODAL QR */}
    {selectedAttendeeUnit && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-start mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {selectedAttendeeUnit.display_name}
              </h3>
              <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Karta i kod QR pacjenta do wydruku lub wysyłki ręcznej.
              </p>
            </div>
            <button onClick={() => setSelectedAttendeeUnit(null)} className={`p-2 rounded-full transition-colors shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <X size={20}/>
            </button>
          </div>

          <div className={`p-6 rounded-[24px] border flex flex-col md:flex-row items-center gap-6 mb-6 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            {selectedAttendeeUnit.qr_token ? (
              <div className={`p-3 rounded-2xl border shadow-sm bg-white shrink-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <QRCode value={selectedAttendeeUnit.qr_token} size={160} />
              </div>
            ) : (
              <div className={`w-[160px] h-[160px] rounded-2xl flex items-center justify-center border-2 border-dashed shrink-0 ${isDarkMode ? 'border-red-900/50 bg-red-900/10 text-red-500' : 'border-red-200 bg-red-50 text-red-500'}`}>
                Brak QR
              </div>
            )}

            <div className="w-full text-center md:text-left">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Token QR</p>
              <p className={`font-mono text-xs p-3 rounded-xl border break-all select-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-600'}`}>
                {selectedAttendeeUnit.qr_token || 'Brak'}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAttendeeUnit.qr_token)
                    showNotification('Token skopiowany', 'success')
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 hover:bg-black text-white'}`}
                >
                  <Copy size={14} /> Kopiuj kod
                </button>
                <button
                  onClick={() => window.print()}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 border ${isDarkMode ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Printer size={14} /> Drukuj
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Typ', selectedAttendeeUnit.unit_type],
              ['Pacjent ID', selectedAttendeeUnit.patient_id || 'Brak'],
              ['ID identyfikatora', selectedAttendeeUnit.wristband_code || 'Brak'],
              ['Status wizyty', selectedAttendeeUnit.checked_in ? 'Po check-in' : 'Oczekujący'],
            ].map(([label, value]) => (
              <div key={label} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                <p className={`font-black text-sm mt-1 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value || '-'}</p>
              </div>
            ))}
          </div>
{(() => {
  const consents = patientConsentsByPatientId[selectedAttendeeUnit.patient_id] || []

  return (
    <div className={`mt-6 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      <h4 className={`font-black flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <FileText size={16} />
        Podpisane zgody pacjenta
      </h4>

      {consents.length === 0 ? (
        <p className={`text-xs mt-3 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Brak podpisanych zgód dla tego pacjenta.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {consents.map((consent: any) => (
            <div key={consent.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="min-w-0">
                <p className={`font-black text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {consent.title}
                </p>
                <p className={`text-[10px] font-bold mt-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Podpisano: {consent.signed_at ? new Date(consent.signed_at).toLocaleString('pl-PL') : 'brak daty'}
                </p>
              </div>

              {consent.file_url && (
                <a
                  href={consent.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  Otwórz
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})()}


        </div>
      </div>
    )}

    {/* MODAL: DODAWANIE OBSŁUGI */}
    {isStaffAccessModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className={`rounded-[32px] max-w-xl w-full p-6 md:p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} />
                Nowa rola personelu
              </h3>
              <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Stwórz limitowany panel QR zależny od roli osoby skanującej.
              </p>
            </div>
            <button onClick={() => setIsStaffAccessModalOpen(false)} className={`p-2 rounded-full transition-colors shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveStaffAccess} className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Osoba / stanowisko *</label>
              <input
                required
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                placeholder="np. Recepcja główna"
                value={staffAccessForm.name || ''}
                onChange={e => setStaffAccessForm({ ...staffAccessForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rola systemowa</label>
              <select
                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
                value={staffAccessForm.role || 'reception'}
                onChange={e => setStaffAccessForm({ ...staffAccessForm, role: e.target.value })}
              >
                <option value="reception">Recepcja</option>
                <option value="doctor">Lekarz</option>
                <option value="coordinator">Opiekun pacjenta</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Uprawnienia akcji</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['can_entry_checkin', 'Check-in wizyty'],
                  ['can_meal_redemption', 'Dokumenty'],
                  ['can_gadget_redemption', 'Pakiet pacjenta'],
                  ['can_transport_checkin', 'Ścieżka pacjenta'],
                  ['can_wristband_issue', 'Wydanie ID'],
                  ['can_wristband_return', 'Zamknięcie wizyty'],
                ].map(([key, label]) => (
                  <label key={key} className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    !!staffAccessForm[key]
                      ? (isDarkMode ? 'border-[#e8ce7a] bg-slate-900' : 'border-slate-900 bg-white shadow-sm')
                      : (isDarkMode ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-white')
                  }`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${!!staffAccessForm[key] ? (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                      {label}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!staffAccessForm[key]}
                      onChange={e => setStaffAccessForm({ ...staffAccessForm, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${!!staffAccessForm[key] ? (isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-white') : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`}>
                      {!!staffAccessForm[key] && <CheckCircle2 size={12} />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#e8ce7a] hover:bg-[#d8bd65] text-[#0f172a]' : 'bg-slate-900 hover:bg-black text-[#e8ce7a]'}`}>
              Utwórz dostęp
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
)}
{/* pass QR */}
{/* ============================================================================ */}
{activeTab === 'rekrutacja' && (
  <div className="space-y-6 animate-in fade-in duration-300">
    <section className={`rounded-[28px] border p-6 shadow-sm ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-500'}`}>
            Pierwszy kontakt z portalu pacjenta
          </p>
          <h2 className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Pytania, prośby o wizytę i konsultacje kontrolne
          </h2>
          <p className={`mt-2 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Tu trafiają wiadomości wysłane przez pacjentów z Portalu Pacjenta.
          </p>
        </div>
        <span className={`w-fit rounded-2xl px-4 py-2 text-xs font-black uppercase ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          {patientPortalRequests.filter((item: any) => item.status === 'new').length} nowe
        </span>
      </div>

      {patientPortalRequests.length === 0 ? (
        <div className={`rounded-3xl border-2 border-dashed p-10 text-center ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <MessageSquare size={34} className="mx-auto mb-3 opacity-60" />
          <p className="text-sm font-black">Brak zgłoszeń z portalu pacjenta.</p>
          <p className="mt-2 text-xs font-medium">Nowe pytania i prośby o wizytę pojawią się tutaj automatycznie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patientPortalRequests.map((request: any) => {
            const patientName = `${request.patients?.first_name || ''} ${request.patients?.last_name || ''}`.trim() || 'Pacjent'
            const typeLabel = request.request_type === 'appointment_request'
              ? 'Prośba o wizytę'
              : request.request_type === 'followup_request'
                ? 'Konsultacja kontrolna'
                : 'Pytanie po zabiegu'
            const isNew = request.status === 'new'
            const requestMessages = patientPortalMessages.filter((message: any) => message.request_id === request.id)
            const visibleMessages = requestMessages.length > 0 ? requestMessages : [{
              id: `${request.id}-fallback`,
              sender_type: 'patient',
              sender_name: patientName,
              body: request.message,
              created_at: request.created_at,
            }]

            return (
              <div key={request.id} className={`rounded-3xl border p-5 ${isNew ? (isDarkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-200') : (isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200')}`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${isNew ? 'bg-red-500 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200')}`}>
                        {request.status || 'new'}
                      </span>
                      <span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <h3 className={`mt-3 text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {request.subject || typeLabel}
                    </h3>
                    <p className={`mt-1 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {patientName} · PESEL: {request.patients?.pesel || 'brak'} · {request.created_at ? new Date(request.created_at).toLocaleString('pl-PL') : ''}
                    </p>
                    <p className={`mt-4 text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {request.message}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdatePatientPortalRequestStatus(request.id, 'in_progress')}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      W trakcie
                    </button>
                    <button
                      onClick={() => handleUpdatePatientPortalRequestStatus(request.id, 'closed')}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                    >
                      Zamknij
                    </button>
                  </div>
                </div>

                <div className={`mt-5 rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Historia rozmowy
                  </p>
                  <div className="space-y-3">
                    {visibleMessages.map((message: any) => {
                      const isStaff = message.sender_type === 'staff'
                      return (
                        <div key={message.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${isStaff ? (isDarkMode ? 'bg-blue-900/30 border-blue-800/60 text-blue-100' : 'bg-blue-50 border-blue-200 text-blue-950') : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800')}`}>
                            <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              {isStaff ? (message.sender_name || 'Recepcja') : (message.sender_name || patientName)} · {message.created_at ? new Date(message.created_at).toLocaleString('pl-PL') : ''}
                            </p>
                            <p className="whitespace-pre-wrap">{message.body}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={`mt-4 rounded-2xl border p-4 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-600'}`}>
                      Odpowiedź recepcji
                    </p>
                    <button
                      type="button"
                      onClick={() => handleGeneratePatientReplyDraft(request)}
                      disabled={aiReplyLoadingId === request.id}
                      className={`w-fit inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-60 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'}`}
                    >
                      <Sparkles size={13} className={aiReplyLoadingId === request.id ? 'animate-pulse' : ''} />
                      {aiReplyLoadingId === request.id ? 'Piszę szkic...' : 'Szkic AI'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={patientReplyDrafts[request.id] || ''}
                    onChange={(event) => setPatientReplyDrafts(prev => ({ ...prev, [request.id]: event.target.value }))}
                    placeholder="Napisz odpowiedź, którą pacjent zobaczy w swoim Portalu Pacjenta..."
                    className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                  />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendPatientReply(request)}
                      disabled={updating || !(patientReplyDrafts[request.id] || '').trim()}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-60 ${isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'}`}
                    >
                      <Send size={13} /> Wyślij odpowiedź
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  </div>
)}

{/*============================================================================ */}
{/* logistyka  chyba ukryta*/}
{/* ============================================================================*/}

{activeTab === 'logistyka' && (
  <div className="space-y-6 animate-in fade-in duration-300">

    {/* === 1. KARTY OPERACYJNE (KPI) === */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: 'Zaopatrzenie barowe',
          value: `${approvedApps.filter(a => a.alcohol_preference && a.alcohol_preference !== 'none').length} osób`,
          sub: 'Wymaga zakupu alkoholu',
          icon: <Truck size={16} />,
          color: 'from-purple-600 to-purple-800'
        },
        {
          label: 'Diety specjalne',
          value: `${approvedApps.filter(a => a.diet && a.diet !== 'Standard').length} osób`,
          sub: 'Wymaga osobnych oznaczeń',
          icon: <UtensilsCrossed size={16} />,
          color: 'from-amber-500 to-amber-700'
        },
        {
          label: 'Rooming list',
          value: `${approvedApps.filter(a => a.accommodation && a.accommodation !== 'Brak').length} osób`,
          sub: 'Rezerwacje potwierdzone',
          icon: <Bed size={16} />,
          color: 'from-blue-600 to-blue-800'
        },
        {
          label: 'Zapotrzebowanie na shuttle',
          value: `${approvedApps.filter(a => a.transport === 'Transfer').length} osób`,
          sub: 'Flota do zamówienia',
          icon: <Bus size={16} />,
          color: 'from-emerald-600 to-emerald-800'
        },
      ].map((kpi, i) => (
        <div key={i} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-4 min-h-[112px] text-white shadow-lg overflow-hidden`}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 leading-tight line-clamp-2">{kpi.label}</p>
              <p className="text-2xl font-black mt-1 tabular-nums break-words">{kpi.value}</p>
              <p className="text-[9px] font-bold opacity-90 mt-1 leading-tight line-clamp-2">{kpi.sub}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0">
              {kpi.icon}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* === 2. ANALITYKA ZASOBÓW === */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Obłożenie noclegowe */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Bed size={18} className="text-[#253a2a]" />
          <h3 className="font-black text-slate-800">Live - Obłożenie noclegowe</h3>
        </div>
        <div className="space-y-5">
          {[
            { label: 'Pokoje 1-osobowe', current: approvedApps.filter(a => a.accommodation === 'Pokój 1-os').length, total: 30 },
            { label: 'Pokoje 2-osobowe', current: approvedApps.filter(a => a.accommodation === 'Pokój 2-os').length, total: 20 },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">{item.label}</span>
                <span className={item.current > item.total ? 'text-red-600' : 'text-slate-800'}>
                  {item.current} / {item.total}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.current > item.total ? 'bg-red-500' : 'bg-[#253a2a]'
                  }`}
                  style={{ width: `${Math.min((item.current / item.total) * 100, 100)}%` }}
                />
              </div>
              {item.current > item.total && (
                <p className="text-[10px] text-red-500 font-bold mt-1">Uwaga: Przekroczono limit</p>
              )}
            </div>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Wine size={18} className="text-[#253a2a]" />
          <h3 className="font-black text-slate-800">Preferencje alkoholowe</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Wino czerwone', key: 'wino_czerwone', color: 'bg-red-700' },
            { label: 'Wino białe', key: 'wino_biale', color: 'bg-amber-300' },
            { label: 'Piwo', key: 'piwo', color: 'bg-yellow-600' },
            { label: 'Bezalkoholowe', key: 'none', color: 'bg-slate-400' },
          ].map((item) => {
            const count = approvedApps.filter(a => (a.alcohol_preference || 'none') === item.key).length;
            const percent = approvedApps.length ? (count / approvedApps.length) * 100 : 0;
            return (
              <div key={item.key}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>{item.label}</span>
                  <span>{count} os. ({Math.round(percent)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>


    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-[#1e293b] px-5 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="font-black text-white flex items-center gap-2">
            <ClipboardList size={18} className="text-[#e8ce7a]" />
            Registry Operations Control
          </h3>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
            Zarządzanie detalami logistycznymi gości zaakceptowanych
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black text-white transition">
            FILTRUJ BRAKI
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-1.5 bg-[#e8ce7a] text-slate-900 rounded-lg text-[10px] font-black hover:bg-yellow-400 transition"
          >
            EKSPORT XLSX
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
              <th className="p-4">Gość / Firma</th>
              <th className="p-4 text-center">RSVP</th>
              <th className="p-4">Dieta / Alergie</th>
              <th className="p-4">Bar & Nocleg</th>
              <th className="p-4">Transport</th>
              <th className="p-4 text-center">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {approvedApps.map((app) => {
              const missingRSVP = !app.rsvp_status || app.rsvp_status === 'oczekuje';
              return (
                <tr
                  key={app.id}
                  className={`group transition-all hover:bg-slate-50 ${
                    missingRSVP ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="p-4">
                    <p className="text-sm font-black text-slate-900">{app.first_name} {app.last_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{app.company_name}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black border ${
                      !missingRSVP
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                    }`}>
                      {!missingRSVP ? 'CONFIRMED' : 'MISSING'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 items-center">
                      {app.diet && app.diet !== 'Standard' ? (
                        <span className="text-[9px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border">
                          {app.diet}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">Standard</span>
                      )}
                      {app.allergies && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-red-600 font-bold">
                          <AlertTriangle size={10} /> {app.allergies}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase w-8">Bar:</span>
                        <span className="text-xs font-bold text-slate-800">
                          {app.alcohol_preference === 'wino_czerwone' ? ' Red' :
                           app.alcohol_preference === 'wino_biale' ? ' White' :
                           app.alcohol_preference === 'piwo' ? ' Beer' : ' None'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase w-8">Room:</span>
                        <span className="text-xs font-bold text-slate-800">{app.accommodation || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className={`text-[10px] font-bold ${app.transport === 'Transfer' ? 'text-blue-600' : 'text-slate-700'}`}>
                        {app.transport || 'Nie wybrano'}
                      </span>
                      {app.transport_address && (
                        <p className="text-[9px] text-slate-400 truncate max-w-[180px] mt-0.5">
                           {app.transport_address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setEditingGuest(app)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-800 hover:bg-[#253a2a] text-white rounded-lg shadow-md"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
{/* ============================================================================ */}
{/* komunikacja  chyba ukryta*/}
{/* ============================================================================*/}
{activeTab === 'komunikacja' && (
  <div className="space-y-6 animate-in fade-in duration-300">

    {/* 1. STATUS KOMUNIKACJI - METRYKI */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dostarczalność</p>
        <p className="text-xl font-black text-emerald-600 uppercase">99.8%</p>
        <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-[99%]"></div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brak follow-upu</p>
        <p className="text-xl font-black text-amber-600">{applications.filter(a => a.status === 'approved' && (!a.rsvp_status || a.rsvp_status === 'oczekuje')).length} os.</p>
        <p className="text-[10px] text-slate-400 font-bold">Wymaga pilnego kontaktu</p>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wysłane powiadomienia</p>
        <p className="text-xl font-black text-slate-900">{approvedApps.length * 2} <span className="text-xs text-slate-400 font-bold">Logi systemowe</span></p>
      </div>
    </div>

    <div className="rounded-[28px] border border-[#e8ce7a]/50 bg-gradient-to-br from-[#253a2a] to-[#132033] p-5 text-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#e8ce7a]">AI-ready</p>
          <h3 className="mt-1 font-black text-lg flex items-center gap-2">
            <Sparkles size={18} /> AI asystent wiadomości
          </h3>
          <p className="mt-2 text-xs text-white/70 font-medium">
            W przyszłym kroku wygeneruje treści SMS, e-maili, zaleceń i follow-upów na podstawie statusów pacjentów, wizyt i segmentów opieki.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase text-[#e8ce7a]">
          lokalny hint
        </span>
      </div>
    </div>

    {/* 2. CENTRUM WYSYŁKI */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* KANAŁ: EMAIL MASOWY */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 bg-slate-900 text-white flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg"><Mail size={18} className="text-[#e8ce7a]"/></div>
          <div>
            <h3 className="font-black text-sm uppercase">Global Broadcast</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Wysyłka do wszystkich zatwierdzonych ({approvedApps.length})</p>
          </div>
        </div>
        <div className="p-6 space-y-4 bg-slate-50 flex-1">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">Temat wiadomości</label>
            <input className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#253a2a]" placeholder="np. Ważne informacje organizacyjne - Event ANM" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">Treść (Markdown/HTML)</label>
            <textarea className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:border-[#253a2a]" rows={6} placeholder="Szanowni Państwo..." />
          </div>
          <button className="w-full py-4 bg-[#253a2a] hover:bg-black text-white rounded-xl font-black text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2">
            <Send size={14} className="text-[#e8ce7a]"/> Wyślij komunikat zbiorczy
          </button>
        </div>
      </div>

      {/* KANAŁ: AUTOMATYKA FOLLOW-UP */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-slate-900">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700"><Zap size={18}/></div>
          <div>
            <h3 className="font-black text-sm uppercase">Smart Reminders</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Automatyczne dogonienie brakujących danych</p>
          </div>
        </div>
        <div className="p-6 flex flex-col justify-between flex-1">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <h4 className="text-xs font-black text-amber-900 mb-2 uppercase flex items-center gap-2">
              <AlertTriangle size={14}/> Segmentacja: brak follow-upu
            </h4>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              System wykrył <strong>{applications.filter(a => a.status === 'approved' && (!a.rsvp_status || a.rsvp_status === 'oczekuje')).length} pacjentów</strong>, którzy wymagają potwierdzenia danych, przypomnienia lub komunikacji kontrolnej.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-slate-400 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-slate-400 group-hover:text-[#253a2a]"/>
                <span className="text-[11px] font-black text-slate-700 uppercase">Przypomnienie SMS</span>
              </div>
              <span className="text-[9px] bg-slate-100 px-2 py-1 rounded font-bold">PREMIUM</span>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#253a2a] rounded-xl bg-[#253a2a]/5 group">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#253a2a]"/>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Email follow-up z linkiem pacjenta</span>
              </div>
              <button className="text-[10px] font-black text-white bg-[#253a2a] px-3 py-1 rounded-lg uppercase shadow-sm hover:scale-105 transition-all">
                Wyślij teraz
              </button>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 text-center mt-6 font-bold uppercase tracking-widest">
            Logi wysyłki: Ostatni reminder 2h temu
          </p>
        </div>
      </div>

    </div>
  </div>
)}

    {!['rekrutacja', 'logistyka', 'harmonogram', 'komunikacja', 'eko', 'checklista', 'finanse', 'dostawcy', 'minutowka', 'bilety', 'prelegenci', 'materialy', 'eventpass', 'strona_uczestnika'].includes(activeTab) && (
  <PlaceholderView icon={FileText} title="Moduł w przygotowaniu" desc="Pracujemy nad wdrożeniem tej funkcjonalności." />
)}
   </div>
        </div>
      </main>

      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div><h3 className="font-black text-lg md:text-xl text-slate-900 flex items-center gap-2"><Edit3 size={20} className="text-[#253a2a]"/> Edytuj Zgłoszenie</h3><p className="text-xs text-slate-500 font-medium">{editingGuest.first_name} {editingGuest.last_name}</p></div>
              <button onClick={() => setEditingGuest(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={saveGuestChanges} className="p-5 md:p-6 space-y-6 bg-slate-50">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h4 className="font-black text-slate-800 text-sm border-b pb-2 mb-3">Dane Osobowe</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Imię</label><input className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.first_name} onChange={e => setEditingGuest({...editingGuest, first_name: e.target.value})} required /></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nazwisko</label><input className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.last_name} onChange={e => setEditingGuest({...editingGuest, last_name: e.target.value})} required /></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Firma</label><input className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.company_name} onChange={e => setEditingGuest({...editingGuest, company_name: e.target.value})} /></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Stanowisko</label><input className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.position} onChange={e => setEditingGuest({...editingGuest, position: e.target.value})} /></div></div></div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h4 className="font-black text-slate-800 text-sm border-b pb-2 mb-3">Wybory i Preferencje (RSVP)</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Status RSVP</label><select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.rsvp_status || 'oczekuje'} onChange={e => setEditingGuest({...editingGuest, rsvp_status: e.target.value})}><option value="oczekuje">Oczekuje / Brak</option><option value="potwierdzone">Potwierdzone</option><option value="odrzucone">Zrezygnował</option></select></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Dieta</label><input className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.diet || ''} onChange={e => setEditingGuest({...editingGuest, diet: e.target.value})} placeholder="np. Wege, Bez glutenu" /></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Alkohol</label><select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.alcohol_preference || ''} onChange={e => setEditingGuest({...editingGuest, alcohol_preference: e.target.value})}><option value="">Wybierz...</option><option value="wino_czerwone">Wino Czerwone</option><option value="wino_biale">Wino Białe</option><option value="piwo">Piwo</option><option value="tylko_bezalkoholowe">Tylko Bezalkoholowe</option><option value="none">Brak alkoholu</option></select></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Słodycze</label><select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.sweets_preference || ''} onChange={e => setEditingGuest({...editingGuest, sweets_preference: e.target.value})}><option value="">Wybierz...</option><option value="czekolada">Czekolada</option><option value="owoce">Owoce</option><option value="ciasta">Ciasta</option><option value="wszystko">Wszystko</option></select></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Transport</label><select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.transport || ''} onChange={e => setEditingGuest({...editingGuest, transport: e.target.value})}><option value="">Wybierz...</option><option value="Własny dojazd">Własny dojazd</option><option value="Carpooling">Carpooling (Szukam miejsca)</option><option value="Carpooling_driver">Carpooling (Oferuję miejsce)</option><option value="Transfer">Transfer Organizatora</option></select></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nocleg</label><select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#253a2a]" value={editingGuest.accommodation || ''} onChange={e => setEditingGuest({...editingGuest, accommodation: e.target.value})}><option value="">Wybierz...</option><option value="Brak">Brak</option><option value="Pokój 1-os">Pokój 1-osobowy</option><option value="Pokój 2-os">Pokój 2-osobowy</option></select></div></div><div><label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Dodatkowe uwagi (Alergie itp.)</label><textarea rows={2} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none resize-none focus:border-[#253a2a]" value={editingGuest.extra_notes || ''} onChange={e => setEditingGuest({...editingGuest, extra_notes: e.target.value})} placeholder="np. uczulenie na orzechy..." /></div></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditingGuest(null)} className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-black text-sm transition-colors hover:bg-slate-50">Anuluj</button><button type="submit" disabled={updating} className="flex-1 py-3.5 bg-[#253a2a] hover:bg-[#1a291e] text-[#e8ce7a] rounded-xl font-black text-sm shadow-md transition-colors">{updating ? 'Zapisywanie...' : 'Zapisz Zmiany'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


const PlaceholderView = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm p-8 md:p-16 text-center">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
      <Icon size={28} className="text-slate-500" />
    </div>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm font-medium text-slate-600">{desc}</p>
  </div>
)

