'use client'

/* ==========================================================================
   1. IMPORTY I KONFIGURACJE
   ========================================================================== */

import React, { useState, useEffect, use, useCallback, useMemo } from 'react'
import { createClient } from '../../../../lib/supabase'
import { GOOGLE_FONT_OPTIONS, buildGoogleFontStack, getFontFamilyName } from '../../../../lib/googleFonts'
import {
  Users, CheckCircle2, XCircle, Leaf, ArrowLeft,
  Settings, Save, RefreshCw, Trash2, AlertTriangle,
  Plus, Edit3, Eye, EyeOff, X, Search, Filter, MoreHorizontal,
  ClipboardList, MapPin, Globe, BarChart3, LayoutGrid,
  Clock, Calendar, Wallet, FileText, Download, Printer,
  Truck, Car, Bus, Smartphone, Share2, TrendingDown, TrendingUp, Phone,
  UtensilsCrossed, Wine, Coffee, Shirt, Gift, Award,
  Send, MessageSquare, Mail, Video, Mic,
  Music4, Image as ImageIcon, Type, Palette,
  Zap, Bed, File as FileIcon, Users2,
  Recycle, Ticket, Briefcase, Train,
  UserRoundPlus, Route, Calculator, Fuel,
  Euro, UsersRound, Percent, BadgeDollarSign, Receipt, CreditCard, ArrowRightLeft,
  ChevronDown, PanelLeftClose, PanelLeftOpen,
  QrCode, ScanLine, BadgeCheck, Copy, ShieldCheck, ExternalLink, Moon, Sun, HelpCircle, BookOpen, Sparkles, Link
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

// ==========================================================================
// 2. TYPY I INTERFEJSY
// ==========================================================================

type TabModule = 
  | 'rekrutacja' | 'logistyka' | 'edycja' | 'stoly'
  | 'harmonogram' | 'menu' | 'budzet' | 'inne' | 'eko'
  | 'komunikacja' | 'checklista' | 'finanse' | 'gadgets'
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
    { id: '1', name: 'Centrum → Hotel', vehicle_type: 'bus', capacity: 50, occupied: 35, co2_per_person: 2.1, route: ['Dworzec Główny', 'Hotel Conference', 'Centrum'] },
    { id: '2', name: 'Lotnisko → Miejsce', vehicle_type: 'van', capacity: 15, occupied: 12, co2_per_person: 3.5, route: ['Lotnisko', 'Hotel'] },
  ]
}

const getPreviewUrl = (file: File | null, currentUrl: string | null) => {
  if (file) return URL.createObjectURL(file);
  return currentUrl || null;
};


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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isSpeaker = item.type === 'speaker';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`p-5 transition-colors cursor-grab active:cursor-grabbing ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          {isSpeaker ? (
            item.photo_url 
              ? <img src={item.photo_url} className={`w-14 h-14 rounded-full object-cover border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} /> 
              : <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'}`}><Users size={24} /></div>
          ) : (
            item.logo_url 
              ? <div className={`h-14 w-24 rounded-lg flex items-center justify-center overflow-hidden border ${isDarkMode ? 'bg-white p-2 border-slate-700' : 'bg-white p-2 border-slate-200'}`}><img src={item.logo_url} className="h-full w-full object-contain" /></div>
              : <div className={`w-24 h-14 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}><ImageIcon size={20} /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase border ${
              isSpeaker 
                ? (isDarkMode ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200') 
                : (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
            }`}>
              {isSpeaker ? 'Prelegent' : 'Sponsor'}
            </span>
            {!item.is_visible && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                Ukryty
              </span>
            )}
          </div>
          <h5 className={`font-black text-base mt-1.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {isSpeaker ? `${item.first_name} ${item.last_name}` : item.sponsor_name}
          </h5>
          {isSpeaker && item.title && <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.title}</p>}
          {!isSpeaker && item.sponsor_category && <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-700'}`}>{item.sponsor_category}</p>}
        </div>
        <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(item.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
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
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabModule>('rekrutacja')
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [openNavGroup, setOpenNavGroup] = useState('Pacjent i opieka')
  
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
  gadgetImg: File | null;
  mealImg: File | null;
  transportImg: File | null;
  partnerPhoto: File | null;
  contractorInvoice: File | null;
  menuSectionImg: File | null;
  gadgetsSectionImg: File | null;
  transportSectionImg: File | null;
  workshopsSectionImg: File | null;
  liveSectionImg: File | null;
  themeMain: File | null;
  themeImg1: File | null;
  themeImg2: File | null;
  themeImg3: File | null;
  themeImg4: File | null;
  gadgetSectionImg: File | null;
}>({
  cover: null,
  logo: null,
  img1: null,
  img2: null,
  img3: null,
  pageBg: null,
  rsvpImg: null,
  sessionImg: null,
  gadgetImg: null,
  mealImg: null,
  transportImg: null,
  partnerPhoto: null,
  contractorInvoice: null,
  menuSectionImg: null,
  gadgetsSectionImg: null,
  transportSectionImg: null,
  workshopsSectionImg: null,
  liveSectionImg: null,
  themeMain: null,
  themeImg1: null,
  themeImg2: null,
  themeImg3: null,
  themeImg4: null,
  gadgetSectionImg: null,
})
  // ----- newFiles -----
  // ----- newFiles -----
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionForm, setSessionForm] = useState<any>({})
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [gadgets, setGadgets] = useState<any[]>([])
  const [gadgetForm, setGadgetForm] = useState<any>({})
  const [isEditingGadget, setIsEditingGadget] = useState(false)

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
    transport: 80,
    gadget: 45
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
  const [spaceLayout, setSpaceLayout] = useState<any | null>(null)
const [spaceObjects, setSpaceObjects] = useState<any[]>([])
const [selectedSpaceObjectId, setSelectedSpaceObjectId] = useState<string | null>(null)
const [spaceSaving, setSpaceSaving] = useState(false)

const [newSpaceObject, setNewSpaceObject] = useState({
  object_type: 'stage',
  category: 'zone',
  label: '',
  x: 40,
  y: 40,
  width: 160,
  height: 100,
  rotation: 0,
  shape: 'rectangle',
  color: '#253a2a',
  linked_type: '',
  linked_id: '',
  role_label: '',
  note: '',
  is_critical: false,
  is_visible_for_team: true
})
  const sensors = useSensors(useSensor(PointerSensor))
  
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
 
  const [materials, setMaterials] = useState<any[]>([])
  const [eventVideos, setEventVideos] = useState<any[]>([])
  const [videoForm, setVideoForm] = useState<any>({})
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isEditingVideo, setIsEditingVideo] = useState(false)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
const [isEditingMaterial, setIsEditingMaterial] = useState(false)
const [materialForm, setMaterialForm] = useState<any>({})
const [materialFile, setMaterialFile] = useState<File | null>(null)
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
// ============================================================================
// ----- 4.2. FUNKCJE POMOCNICZE (wywoływane z wnętrza) -----
// ============================================================================

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
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
  }

  const buildLocalAiTextFallback = (config: any) => {
    const sectionKey = String(config?.sectionKey || '')
    const fieldKey = String(config?.fieldKey || '')
    const currentValue = String(config?.currentValue || '').trim()
    const placeholder = String(config?.placeholder || '').trim()
    const eventTitle = event?.title || 'wydarzenie'
    const eventLocation = event?.location ? ` w lokalizacji ${event.location}` : ''
    const short = String(aiTextLength || '').toLowerCase().includes('krót')

    if (currentValue) return currentValue
    if (placeholder) return placeholder

    if (fieldKey.includes('title')) {
      if (sectionKey === 'menu') return 'Menu wydarzenia'
      if (sectionKey === 'transport') return 'Transport i dojazd'
      if (sectionKey === 'gadgets') return 'Gadżety dla uczestników'
      if (sectionKey === 'workshops') return 'Warsztaty i aktywności'
      if (sectionKey === 'faq') return 'Najważniejsze informacje'
      return `Sekcja wydarzenia ${eventTitle}`
    }

    if (fieldKey.includes('cta')) {
      if (sectionKey === 'menu') return 'Wybierz menu'
      if (sectionKey === 'transport') return 'Potwierdź transport'
      if (sectionKey === 'gadgets') return 'Wybierz gadżet'
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
          tone: aiTextTone,
          length: aiTextLength,
          instruction: aiTextInstruction
        }
      })

      if (error) throw error

      setAiTextSuggestion(data?.suggestion || '')
      setAiTextReason(data?.reason || '')
      setAiTextMissingContext(Array.isArray(data?.missing_context) ? data.missing_context : [])
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
    showNotification('Propozycja AI została wstawiona do pola. Zapisz formularz, aby utrwalić zmianę.', 'success')
    closeAiTextAssist()
  }

const AiTextAssistButton = ({
  eventId,
  sectionKey,
  fieldKey,
  currentValue,
  relatedEntityId,
  placeholder,
  onApply
}: {
  eventId: string
  sectionKey: string
  fieldKey: string
  currentValue?: string
  relatedEntityId?: string
  placeholder?: string
  onApply: (text: string) => void
}) => (
  <button
    type="button"
    onClick={() => openAiTextAssist({ eventId, sectionKey, fieldKey, currentValue, relatedEntityId, placeholder, onApply })}
    className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border border-indigo-500/20 dark:border-indigo-400/30 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:from-indigo-500/20 hover:to-purple-500/20"
    title="Wygeneruj profesjonalną treść z AI"
  >
    <Sparkles size={14} className="animate-pulse" /> 
    Magia AI
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
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('anm-planner-theme') : null
    setIsDarkMode(storedTheme === 'dark')
  }, [])

  useEffect(() => {
    loadHelpDocuments()
  }, [loadHelpDocuments])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('anm-planner-theme', next ? 'dark' : 'light')
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
    gadgets: 'Opiekun pacjenta',
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
    { key: 'gadgets', label: 'Pakiety pacjenta', icon: Gift, operational: true, actionField: 'gadgets_selection_enabled', actionLabel: 'Włącz wybór pakietu pacjenta', imageFileKey: 'gadgetsSectionImg', placeholderTitle: 'Pakiet pacjenta', placeholderDescription: 'Opisz pakiety, materiały lub dodatki przekazywane pacjentowi.' },
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
        gadgetsSectionImg: null,
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
  const { data } = await supabase.from('event_partners').select('*').eq('event_id', id).order('display_order', { ascending: true })
  if (data) setPartners(data)
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
      { name: 'Catering', slug: 'catering', planned_budget: 0, color: '#f59e0b', sort_order: 1 },
      { name: 'Transport', slug: 'transport', planned_budget: 0, color: '#3b82f6', sort_order: 2 },
      { name: 'Gadżety', slug: 'gadgets', planned_budget: 0, color: '#10b981', sort_order: 3 },
      { name: 'Podwykonawcy', slug: 'contractors', planned_budget: 0, color: '#6366f1', sort_order: 4 },
      { name: 'Obiekt / lokalizacja', slug: 'venue', planned_budget: 0, color: '#8b5cf6', sort_order: 5 },
      { name: 'Marketing', slug: 'marketing', planned_budget: 0, color: '#ec4899', sort_order: 6 },
      { name: 'Dekoracje', slug: 'decor', planned_budget: 0, color: '#eab308', sort_order: 7 },
      { name: 'Technika', slug: 'technical', planned_budget: 0, color: '#64748b', sort_order: 8 },
      { name: 'Inne', slug: 'other', planned_budget: 0, color: '#94a3b8', sort_order: 9 },
      { name: 'Przychody', slug: 'income', planned_budget: 0, color: '#22c55e', sort_order: 10 }
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

  const handleImportGadgetsToBudget = async () => {
    try {
      const rows = gadgetSummary
        .filter((summary: any) => summary.totalQuantity > 0 && Number(summary.gadget.unit_cost || 0) > 0 && !hasBudgetSource('gadget', summary.gadget.id))
        .map((summary: any) => {
          const gross = Number(summary.totalQuantity || 0) * Number(summary.gadget.unit_cost || 0)
          const net = Number((gross / 1.23).toFixed(2))
          return {
            event_id: id, source_type: 'gadget', source_id: summary.gadget.id, type: 'expense', category: 'gadgets',
            title: `Gadżety - ${summary.gadget.name}`, description: `Wybrane przez gości: ${summary.totalQuantity} szt.`,
            net_amount: net, vat_rate: 23, vat_amount: Number((gross - net).toFixed(2)), gross_amount: gross,
            paid_amount: 0, payment_status: 'planned', currency: 'PLN', is_active: true
          }
        })
      const count = await insertBudgetRows(rows)
      showNotification(`Dodano ${count} pozycji gadżetów do budżetu`, 'success')
    } catch (err: any) {
      showNotification('Błąd importu gadżetów: ' + err.message, 'error')
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

  // --- FUNKCJA: ZAPIS JAKO SZABLON ---
  const handleSaveAsTemplate = async () => {
    const templateName = prompt('Podaj nazwę dla szablonu:', `${event?.title} - Szablon`);
    if (!templateName) return;
    
    setUpdating(true);
    try {
      const config = {
        sessions, meals, gadgets, unitCosts,
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
  { key: 'gadget_section_image_url', file: newFiles.gadgetSectionImg, prefix: 'gadget-section' },

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
      delete (cleanData as any).event_gadgets;

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
  gadgetImg: null,
  mealImg: null,
  transportImg: null,
  partnerPhoto: null,
  contractorInvoice: null,
  menuSectionImg: null,
  gadgetsSectionImg: null,
  transportSectionImg: null,
  workshopsSectionImg: null,
  liveSectionImg: null,
  gadgetSectionImg: null,

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

  const handleSaveGadget = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      let imageUrl = gadgetForm.image_url || null;
      if (newFiles.gadgetImg) {
        imageUrl = await uploadFile(newFiles.gadgetImg, id, 'gadget');
      }
      const gadgetData = {
  event_id: id,
  name: gadgetForm.name,
  public_label: gadgetForm.public_label || gadgetForm.name,
  description: gadgetForm.description,
  category: gadgetForm.category || 'eco',
  eco_type: gadgetForm.eco_type || 'standard',
  co2_cost_kg: gadgetForm.co2_cost_kg || 0,
  unit_cost: gadgetForm.unit_cost || 0,
  max_quantity: gadgetForm.max_quantity || null,
  size_required: gadgetForm.size_required || false,
  stock_quantity: Number(gadgetForm.stock_quantity || 0),
  max_per_person: Math.max(Number(gadgetForm.max_per_person || 1), 1),
  track_stock: gadgetForm.track_stock !== false,
  is_required_choice: gadgetForm.is_required_choice === true,
  allow_decline: gadgetForm.allow_decline !== false,
  low_stock_threshold: Number(gadgetForm.low_stock_threshold || 5),
  available_sizes: gadgetForm.size_required === true ? parseSizes(gadgetForm.available_sizes) : [],
  requires_confirmation: gadgetForm.requires_confirmation || false,
  stock_note: gadgetForm.stock_note || null,
  sort_order: gadgetForm.sort_order || 0,
  is_active: gadgetForm.is_active !== false,
  image_url: imageUrl
};

      const { error } = gadgetForm.id
        ? await supabase.from('event_gadgets').update(gadgetData).eq('id', gadgetForm.id)
        : await supabase.from('event_gadgets').insert([gadgetData]);

      if (error) throw error;

      const { data: gadg } = await supabase.from('event_gadgets').select('*').eq('event_id', id).order('sort_order', { ascending: true });
      setGadgets(gadg || []);
      setIsEditingGadget(false);
      showNotification('Katalog gadżetów zaktualizowany', 'success');
    } catch (err: any) {
      console.error('Gadget save error:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        gadgetData: {
          event_id: id,
          name: gadgetForm.name,
          stock_quantity: Number(gadgetForm.stock_quantity || 0),
          max_per_person: Math.max(Number(gadgetForm.max_per_person || 1), 1),
          track_stock: gadgetForm.track_stock !== false,
          available_sizes: gadgetForm.size_required === true ? parseSizes(gadgetForm.available_sizes) : []
        }
      });
      showNotification('Błąd: ' + (err?.message || 'Nie udało się zapisać gadżetu'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGadget = async (gadgetId: string) => {
    if (!confirm('Usunąć ten gadżet z katalogu?')) return;
    try {
      await supabase.from('event_gadgets').delete().eq('id', gadgetId);
      setGadgets(gadgets.filter(g => g.id !== gadgetId));
      showNotification('Gadżet usunięty', 'success');
    } catch (err: any) {
      showNotification('Błąd: ' + err.message, 'error');
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
    const data = {
      event_id: id,
      type: partnerForm.type,
      display_order: partnerForm.display_order || 0,
      is_visible: partnerForm.is_visible !== false,
    };
    if (partnerForm.type === 'speaker') {
      Object.assign(data, {
        first_name: partnerForm.first_name,
        last_name: partnerForm.last_name,
        title: partnerForm.title,
        company: partnerForm.company,
        bio: partnerForm.bio,
        photo_url: photoUrl || partnerForm.photo_url,
        linkedin_url: partnerForm.linkedin_url,
        twitter_url: partnerForm.twitter_url,
        website_url: partnerForm.website_url,
      });
    } else {
      Object.assign(data, {
        sponsor_name: partnerForm.sponsor_name,
        logo_url: photoUrl || partnerForm.logo_url,
        sponsor_url: partnerForm.sponsor_url,
        sponsor_category: partnerForm.sponsor_category,
      });
    }
    if (isEditingPartner && partnerForm.id) {
      await supabase.from('event_partners').update(data).eq('id', partnerForm.id);
    } else {
      await supabase.from('event_partners').insert([data]);
    }
    await loadPartners();
    setIsPartnerModalOpen(false);
    setNewFiles({ ...newFiles, partnerPhoto: null });
    showNotification('Zapisano pomyślnie', 'success');
  } catch (err) { showNotification('Błąd zapisu', 'error'); } finally { setUpdating(false); }
};

const handleDeletePartner = async (id: string) => {
  if (!confirm('Usunąć?')) return;
  try {
    await supabase.from('event_partners').delete().eq('id', id);
    await loadPartners();
    showNotification('Usunięto', 'success');
  } catch (err) { showNotification('Błąd', 'error'); }
};

const handlePartnerDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = partners.findIndex(p => p.id === active.id);
  const newIndex = partners.findIndex(p => p.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const newOrder = [...partners];
  const [moved] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, moved);
  const updated = newOrder.map((item, idx) => ({ ...item, display_order: idx }));
  setPartners(updated);

  for (const item of updated) {
    await supabase.from('event_partners').update({ display_order: item.display_order }).eq('id', item.id);
  }
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
 const loadMaterials = useCallback(async () => {
  const { data } = await supabase
    .from('event_materials')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true })

  if (data) setMaterials(data)
}, [id, supabase])

const handleSaveMaterial = async (e: React.FormEvent) => {
  e.preventDefault()
  setUpdating(true)

  try {
    let fileUrl = materialForm.file_url || null
    let fileName = materialForm.file_name || null
    let fileType = materialForm.file_type || null
    let fileSize = materialForm.file_size || null
    const oldFileUrl = materialForm.file_url || null

    if (materialFile) {
      fileUrl = await uploadFile(materialFile, id, 'material')
      fileName = materialFile.name
      fileType = materialFile.type
      fileSize = materialFile.size
    }

    const data = {
      event_id: id,
      title: materialForm.title,
      description: materialForm.description,
      material_type: materialForm.material_type || 'document',
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      external_url: materialForm.external_url || null,
      is_visible: materialForm.is_visible !== false,
      show_in_footer: materialForm.show_in_footer !== false,
      display_order: materialForm.display_order || 0
    }

    if (isEditingMaterial && materialForm.id) {
      const { error } = await supabase
        .from('event_materials')
        .update(data)
        .eq('id', materialForm.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('event_materials')
        .insert([data])

      if (error) throw error
    }

    if (materialFile && oldFileUrl) {
      await deleteUploadedFile(oldFileUrl)
    }

    await loadMaterials()
    setIsMaterialModalOpen(false)
    setIsEditingMaterial(false)
    setMaterialForm({})
    setMaterialFile(null)
    showNotification('Materiał zapisany', 'success')
  } catch (err: any) {
    showNotification('Błąd zapisu materiału: ' + err.message, 'error')
  } finally {
    setUpdating(false)
  }
}

const handleDeleteMaterial = async (materialId: string) => {
  if (!confirm('Usunąć ten materiał?')) return

  try {
    const materialToDelete = materials.find(m => m.id === materialId)
    const { error } = await supabase
      .from('event_materials')
      .delete()
      .eq('id', materialId)

    if (error) throw error

    if (materialToDelete?.file_url) {
      await deleteUploadedFile(materialToDelete.file_url)
    }

    setMaterials(materials.filter(m => m.id !== materialId))
    showNotification('Materiał usunięty', 'success')
  } catch (err: any) {
    showNotification('Błąd usuwania: ' + err.message, 'error')
  }
}

const addSpaceObject = async () => {
  if (!id || !spaceLayout?.id || !newSpaceObject.label.trim()) {
    showNotification('Podaj nazwę elementu przestrzeni', 'info')
    return
  }

  setSpaceSaving(true)

  try {
    const { data, error } = await supabase
      .from('event_space_objects')
      .insert({
        event_id: id,
        layout_id: spaceLayout.id,
        ...newSpaceObject,
        label: newSpaceObject.label.trim()
      })
      .select('*')
      .single()

    if (error) throw error

    setSpaceObjects(prev => [...prev, data])
    setNewSpaceObject({
      object_type: 'stage',
      category: 'zone',
      label: '',
      x: 40,
      y: 40,
      width: 160,
      height: 100,
      rotation: 0,
      shape: 'rectangle',
      color: '#253a2a',
      linked_type: '',
      linked_id: '',
      role_label: '',
      note: '',
      is_critical: false,
      is_visible_for_team: true
    })

    showNotification('Dodano element do planu przestrzeni', 'success')
  } catch (err: any) {
    showNotification('Błąd dodawania elementu: ' + err.message, 'error')
  } finally {
    setSpaceSaving(false)
  }
}

const updateSpaceObject = async (objectId: string, patch: any) => {
  setSpaceObjects(prev =>
    prev.map(obj => obj.id === objectId ? { ...obj, ...patch } : obj)
  )

  const { error } = await supabase
    .from('event_space_objects')
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq('id', objectId)

  if (error) {
    showNotification('Błąd aktualizacji elementu: ' + error.message, 'error')
  }
}

const deleteSpaceObject = async (objectId: string) => {
  if (!confirm('Usunąć ten element z planu przestrzeni?')) return

  const { error } = await supabase
    .from('event_space_objects')
    .delete()
    .eq('id', objectId)

  if (error) {
    showNotification('Błąd usuwania elementu: ' + error.message, 'error')
    return
  }

  setSpaceObjects(prev => prev.filter(obj => obj.id !== objectId))
  if (selectedSpaceObjectId === objectId) setSelectedSpaceObjectId(null)
  showNotification('Usunięto element', 'success')
}


const updateSpaceLayout = async (patch: any) => {
  if (!spaceLayout?.id) return

  setSpaceLayout((prev: any) => prev ? { ...prev, ...patch } : prev)

  const { error } = await supabase
    .from('event_space_layouts')
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq('id', spaceLayout.id)

  if (error) {
    showNotification('Błąd aktualizacji planu przestrzeni: ' + error.message, 'error')
  }
}
const loadSpaceLayoutData = useCallback(async () => {
  if (!id) return

  const { data: layoutData, error: layoutError } = await supabase
    .from('event_space_layouts')
    .select('*')
    .eq('event_id', id)
    .maybeSingle()

  if (layoutError) {
    console.warn('event_space_layouts unavailable:', layoutError.message)
  }

  let currentLayout = layoutData

  if (!currentLayout) {
    const { data: createdLayout, error: createError } = await supabase
      .from('event_space_layouts')
      .insert({
        event_id: id,
        name: 'Główny plan przestrzeni',
        space_type: 'indoor',
        width_m: 20,
        height_m: 12,
        scale_px_per_m: 40,
        background_color: '#f8fafc',
        grid_enabled: true
      })
      .select('*')
      .single()

    if (createError) {
      console.warn('event_space_layouts create failed:', createError.message)
      return
    }

    currentLayout = createdLayout
  }

  setSpaceLayout(currentLayout)

  const { data: objectsData, error: objectsError } = await supabase
    .from('event_space_objects')
    .select('*')
    .eq('event_id', id)
    .eq('layout_id', currentLayout.id)
    .order('created_at', { ascending: true })

  if (objectsError) {
    console.warn('event_space_objects unavailable:', objectsError.message)
    setSpaceObjects([])
    return
  }

  setSpaceObjects(objectsData || [])
}, [id, supabase])

  const loadEventData = useCallback(async () => {
    try {
      const { data: ev } = await supabase.from('b2b_events').select('*').eq('id', id).single()
      const { data: apps } = await supabase.from('b2b_applications').select('*').eq('event_id', id).order('created_at', { ascending: false })
      const { data: sess } = await supabase.from('event_sessions').select('*').eq('event_id', id).order('start_time', { ascending: true })
      const { data: gadg } = await supabase.from('event_gadgets').select('*').eq('event_id', id).order('sort_order', { ascending: true })
      const { data: tierData } = await supabase.from('ticket_tiers').select('*').eq('event_id', id).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      const { data: promoData } = await supabase.from('promo_codes').select('*').eq('event_id', id).order('created_at', { ascending: false })
     // const { data: speakerData } = await supabase.from('event_speakers').select('*').eq('event_id', id).order('created_at', { ascending: true })//
     const { data: materialData } = await supabase
  .from('event_materials')
  .select('*')
  .eq('event_id', id)
  .order('display_order', { ascending: true })

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
      setGadgets(gadg || [])
      setCateringOffers([])
      setEventVideos([])
      setMeals([])
      setTiers(tierData || [])
      setPromoCodes(promoData || [])
      //setSpeakers(speakerData || [])//
      setMaterials(materialData || [])
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
await loadPatientConsents()
      setMenuItems(generateMockMenu())
      calculateEcoMetrics(apps || [])

    } catch (error) {
      showNotification('Błąd ładowania danych', 'error')
    } finally {
      setLoading(false)
    }
 }, [id, supabase, loadBudgetData, loadEventPassData, loadPatients, loadPatientConsents])

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
      // Bezpieczne wyciągnięcie miasta – ostatni człon po przecinku, jeśli brak przecinka – całość
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
        label: gadgets.find((gadget: any) => gadget.id === choice.gadget_id)?.public_label || gadgets.find((gadget: any) => gadget.id === choice.gadget_id)?.name || choice.gadget_id || 'Gadżet'
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
  
  const gadgetSummary = useMemo(() => {
  return gadgets.map(gadget => {
    const choices = attendeeGadgetChoices.filter((choice: any) =>
      choice.gadget_id === gadget.id &&
      choice.status !== 'cancelled' &&
      choice.declined_gadget !== true
    )
    const totalQuantity = choices.reduce((sum, choice) => sum + Number(choice.quantity || 1), 0)
    const maxQuantity = gadget.max_quantity || null
    const remaining = maxQuantity !== null ? Math.max(maxQuantity - totalQuantity, 0) : null
    const totalCO2 = totalQuantity * Number(gadget.co2_cost_kg || 0)

    const sizeBreakdown = choices.reduce((acc: Record<string, number>, choice: any) => {
      const size = choice.selected_size || 'Brak rozmiaru'
      acc[size] = (acc[size] || 0) + Number(choice.quantity || 1)
      return acc
    }, {})

    return {
      gadget,
      choices,
      totalQuantity,
      maxQuantity,
      remaining,
      totalCO2,
      sizeBreakdown
    }
  })
}, [gadgets, attendeeGadgetChoices])

  const getGadgetReservedQuantity = (gadgetId: string) => {
    const perUnitReserved = attendeeGadgetChoices
      .filter((choice: any) => choice.gadget_id === gadgetId && choice.status !== 'cancelled' && choice.declined_gadget !== true)
      .reduce((sum: number, choice: any) => sum + Number(choice.quantity || 1), 0)

    return perUnitReserved
  }

  const getGadgetRedeemedQuantity = (gadgetId: string) => {
    return gadgetRedemptions
      .filter((redemption: any) => redemption.gadget_id === gadgetId)
      .reduce((sum: number) => sum + 1, 0)
  }

  const getGadgetAvailableQuantity = (gadget: any) => {
    if (gadget.track_stock === false) return Infinity
    return Math.max(Number(gadget.stock_quantity || 0) - getGadgetReservedQuantity(gadget.id), 0)
  }

  const getGadgetStockStatus = (gadget: any) => {
    if (gadget.track_stock === false) return 'unlimited'
    const available = getGadgetAvailableQuantity(gadget)
    if (available <= 0) return 'sold_out'
    if (available <= Number(gadget.low_stock_threshold || 5)) return 'low_stock'
    return 'available'
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
    const safeGadgets = Array.isArray(gadgets) ? gadgets : []
    const safeGadgetChoices = Array.isArray(attendeeGadgetChoices) ? attendeeGadgetChoices : []
    const safeCarpoolingAds = Array.isArray(carpoolingAds) ? carpoolingAds : []
    const safeFleet = Array.isArray(fleet) ? fleet : []
    const safeContractors = Array.isArray(contractors) ? contractors : []
    const safeCateringOffers = Array.isArray(cateringOffers) ? cateringOffers : []
    const safeBudgetItems = Array.isArray(budgetItems) ? budgetItems : []
    const safeMaterials = Array.isArray(materials) ? materials : []

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
      (totalApplications * 3) + activeParticipantsCount + (safeMaterials.length * 2),
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

    const gadgetReserved = safeGadgetChoices.filter(
      (choice: any) => choice.declined_gadget !== true && choice.status !== 'declined' && choice.status !== 'cancelled'
    ).length

    const gadgetStock = safeGadgets.reduce(
      (sum: number, gadget: any) =>
        sum + Number(gadget.stock_quantity || gadget.quantity || gadget.total_quantity || 0),
      0
    )

    const gadgetOverstockCount = Math.max(gadgetStock - gadgetReserved, 0)
    const gadgetWasteRisk =
      gadgetStock > 0 ? Math.round((gadgetOverstockCount / gadgetStock) * 100) : 0

    const gadgetsCo2Saved = Number((Math.max(gadgetReserved, 0) * 0.25).toFixed(1))

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
      gadgetReserved > 0,
      localSuppliersCount > 0,
      safeCateringOffers.length > 0,
      safeBudgetItems.length > 0,
      safeMaterials.length > 0,
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
      (gadgetOverstockCount * 15) +
      (foodWastePortionsRisk * 45 * 0.35)
    ), 0)

    const circularityScore = Math.min(100, [
      avoidedPrintsCount > 0 ? 20 : 0,
      confirmedRsvp > 0 && foodWasteRisk < 25 ? 20 : 0,
      realCarpoolingChoices > 0 || transportEfficiency > 50 ? 20 : 0,
      vegeMeals > 0 ? 15 : 0,
      localSuppliersCount > 0 ? 15 : 0,
      gadgetReserved > 0 || gadgetWasteRisk < 30 ? 10 : 0
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

    if (gadgetWasteRisk > 30) {
      recommendations.push({
        title: 'Ogranicz zamówienie gadżetów',
        description: 'Zapas gadżetów jest większy niż aktualne wybory uczestników.',
        impact: 'średni',
        co2: 'średnia redukcja',
        actionLabel: 'Przejdź do gadżetów',
        area: 'Gadżety'
      })
    }

    if (gadgetOverstockCount > 0) {
      recommendations.push({
        title: 'Zamów gadżety według realnych wyborów uczestników',
        description: `AI Eco Engine widzi ${gadgetOverstockCount} szt. potencjalnej nadwyżki względem aktualnych wyborów.`,
        impact: 'średni',
        co2: 'mniej odpadów',
        actionLabel: 'Przejdź do gadżetów',
        area: 'Gadżety'
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
        name: 'Gadżety',
        status: gadgetWasteRisk > 30 ? 'ryzyko' : 'dobrze',
        value: `${gadgetOverstockCount} szt.`,
        description: 'Ryzyko nadwyżek gadżetów względem wyborów uczestników.'
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
        label: 'Gadżety',
        value: `${gadgetsCo2Saved} kg`,
        detail: `${gadgetReserved} świadomych wyborów gadżetów`
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
    gadgets,
    attendeeGadgetChoices,
    fleet,
    carpoolingAds,
    transportCarpoolStats,
    contractors,
    cateringOffers,
    budgetItems,
    event,
    materials
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
          ? (isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a] border-[#e8ce7a] shadow-md scale-[1.02]' : 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]')
          : urgent && count && count > 0
            ? (isDarkMode ? 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100')
            : (isDarkMode ? 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900')
      }`}
    >
      <span className={`${isNavCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        isActive 
          ? (isDarkMode ? 'bg-[#0f172a]/10 text-[#0f172a]' : 'bg-white/20 text-[#e8ce7a]') 
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
            ? (isDarkMode ? 'bg-[#0f172a] text-[#e8ce7a]' : 'bg-white text-slate-900') 
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

  const navGroups = [
    {
      title: 'Pacjent i opieka',
      desc: 'Historia, wizyty, QR i dokumentacja',
      items: [
        { tabId: 'strona_uczestnika' as TabModule, icon: Globe, label: 'Portal pacjenta' },
        { tabId: 'materialy' as TabModule, icon: FileIcon, label: 'Zgody i dokumenty', count: materials.length },
        { tabId: 'harmonogram' as TabModule, icon: Clock, label: 'Wizyty i zabiegi', count: sessions.length },
        { tabId: 'prelegenci' as TabModule, icon: Mic, label: 'Lekarze / specjaliści', count: partners.filter(p => p.type === 'speaker').length },
        { tabId: 'eventpass' as TabModule, icon: QrCode, label: 'Identyfikacja QR', count: attendeeUnits.length },
        { tabId: 'logistyka' as TabModule, icon: ClipboardList, label: 'Ścieżka pacjenta', count: approvedApps.length }
      ]
    },
    {
      title: 'Pierwszy kontakt',
      desc: 'Leady, rejestracja i follow-up',
      items: [
        { tabId: 'rekrutacja' as TabModule, icon: Users, label: 'Leady pacjentów', count: pendingApps.length, urgent: true },
        { tabId: 'bilety' as TabModule, icon: Ticket, label: 'Rejestracja wizyt', count: tiers.length },
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
        { tabId: 'dostawcy' as TabModule, icon: Briefcase, label: 'Partnerzy medyczni' },
        { tabId: 'stoly' as TabModule, icon: LayoutGrid, label: 'Układ gabinetów' },
        { tabId: 'gadgets' as TabModule, icon: Gift, label: 'Pakiety pacjenta', count: gadgets.length }
      ]
    }
  ]

  // ==========================================================================
  // 5. RENDER GŁÓWNY nie zamykaj zamniesz wszystko
  // ==========================================================================

 return (
    <div
      data-theme={isDarkMode ? 'dark' : 'light'}
      data-active-tab={activeTab}
      className={`planner-shell ${isDarkMode ? 'planner-dark' : ''} min-h-screen bg-slate-50 font-sans pb-20`}
    >
      <style jsx global>{`
        .planner-shell {
          --app-bg: #f8fafc;
          --app-surface: #ffffff;
          --app-surface-muted: #f8fafc;
          --app-border: #e2e8f0;
          --app-text: #0f172a;
          --app-text-muted: #64748b;
          --app-primary: #253a2a;
          --app-accent: #e8ce7a;
          --app-danger: #dc2626;
          --app-success: #047857;
          background: var(--app-bg);
          color: var(--app-text);
        }
        .planner-shell.planner-dark {
          --app-bg: #020617;
          --app-surface: #111827;
          --app-surface-muted: #0f172a;
          --app-surface-soft: #1f2937;
          --app-border: rgba(255, 255, 255, 0.10);
          --app-text: #ffffff;
          --app-text-muted: rgba(255, 255, 255, 0.58);
          --app-primary: #334155;
          --app-accent: #e8ce7a;
          --app-danger: #f87171;
          --app-success: #60a5fa;
          background:
            radial-gradient(circle at top right, rgba(30, 41, 59, 0.72), transparent 34rem),
            linear-gradient(180deg, #020617 0%, #030712 100%);
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
          border-color: rgba(232, 206, 122, 0.42) !important;
        }
        .planner-shell.planner-dark .planner-metric-card {
          background: var(--app-surface) !important;
          border-color: var(--app-border) !important;
          color: var(--app-text) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="bg-[#253a2a]"],
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="bg-[#253a2a]"] {
          background-color: #334155 !important;
          color: #e8ce7a !important;
          border-color: rgba(255, 255, 255, 0.10) !important;
        }
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="hover:bg-[#1a291e]"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="hover:bg-[#1a291e]"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) button[class*="hover:bg-black"]:hover,
        .planner-shell.planner-dark:not([data-active-tab="eko"]) a[class*="hover:bg-black"]:hover {
          background-color: #475569 !important;
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
                      Asystent treści AI
                    </span>
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Magia słów
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    placeholder="Np. podkreśl networking, ogranicz formalny ton, dodaj akcent eco..."
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
                    {aiTextLoading ? 'Magia działa...' : 'Generuj treść'}
                  </span>
                </button>

                <div className="space-y-2 pt-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between gap-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Wygenerowana treść</span>
                    {aiTextSuggestion && (
                      <span className={`text-[8px] px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-black/5 border-black/10 text-slate-500'}`}>
                        Możesz edytować przed zapisem
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <textarea
                      rows={6}
                      className={`w-full rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none resize-y transition-all border shadow-inner ${isDarkMode ? 'bg-black/40 border-emerald-500/30 text-emerald-50 focus:border-emerald-400 placeholder-slate-500' : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500 placeholder-slate-400'}`}
                      placeholder={aiTextAssistConfig.placeholder || 'Tu pojawi się gotowy tekst stworzony przez sztuczną inteligencję...'}
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
                    <span className={isDarkMode ? 'font-black text-indigo-300' : 'font-black text-indigo-700'}>AI użyło:</span> {aiTextReason}
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
                  Zastosuj treść
                </button>
              </div>
            </div>
          </div>
        </div>
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

        {/* ============================================================================ */}
        {/* GRID GŁÓWNY - ZMODYFIKOWANY ABY LEWE MENU ZAWSZE BYŁO W LINII, A NIE FIXED */}
        {/* ============================================================================ */}
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
                {navGroups.map(group => (
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

          {/* Zmieniamy col-span-9 na col-span-8 dla zwiniętego trybu, żeby zachować 12 kolumn (1+8+3=12) */}
          <div className={`${isNavCollapsed ? 'lg:col-span-8' : 'lg:col-span-6'} transition-all duration-300`}>



{/* ============================================================================ */}
{/* PORTAL PACJENTA / STRONA PUBLICZNA */}
{/* ============================================================================ */}
{activeTab === 'strona_uczestnika' && (
  <form onSubmit={handleSaveParticipantPageSettings} className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">
    
    {/* NAGŁÓWEK */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="min-w-0">
        <h3 className={`font-black flex items-center gap-3 text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Smartphone size={22} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-800'} /> 
          Portal Pacjenta i e-Rejestracja
        </h3>
        <p className={`text-xs mt-1 font-medium max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Skonfiguruj Cyfrową Ścieżkę Pacjenta (Patient Experience). Wybierz sekcje widoczne w portalu, gdzie pacjent rezerwuje wizyty, pobiera zgody medyczne i zapoznaje się z informacjami o zabiegach.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <HelpButton sectionKey="guest_page" />
        <button 
          type="submit" 
          disabled={updating} 
          className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 ${
            isDarkMode ? 'bg-[#e8ce7a] text-[#0f172a]' : 'bg-slate-900 text-[#e8ce7a]'
          }`}
        >
          {updating ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
          Zapisz zmiany w Portalu
        </button>
      </div>
    </div>

    {/* UWAGA TECHNICZNA */}
    <div className={`rounded-[24px] border p-5 flex items-start gap-4 shadow-sm ${isDarkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-200'}`}>
      <div className={`shrink-0 p-2 rounded-xl ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
        <AlertTriangle size={18} />
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>
          Uwaga dla administratora systemu medycznego
        </p>
        <p className={`text-xs font-medium mt-1 leading-relaxed ${isDarkMode ? 'text-amber-500/80' : 'text-amber-900'}`}>
          Ten edytor zarządza strukturą tabeli `b2b_events`. Jeśli integracja z systemem rezerwacji (np. ZnanyLekarz/Booksy) lub nowym systemem CRM wymaga nowych bloków (np. historii zabiegowej), upewnij się, że schemat SQL w Supabase został zaktualizowany.
        </p>
      </div>
    </div>

    {/* GŁÓWNA SIATKA SEKCJI PORTALU */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
      {publicSectionConfigs.map((section: any) => {
        const fields = getPublicSectionFields(section.key, section.actionField)
        const status = getPublicSectionStatus(section)
        const Icon = section.icon
        const fileKey = section.imageFileKey as keyof typeof newFiles | undefined
        const hasDbColumns = !!event && Object.prototype.hasOwnProperty.call(event, fields.visible)
        const isSectionVisible = editForm?.[fields.visible] === true

        return (
          <div 
            key={section.key} 
            className={`rounded-[24px] md:rounded-[32px] border shadow-sm overflow-hidden transition-all duration-300 ${
              isSectionVisible 
                ? (isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')
                : (isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/50 border-slate-200/60')
            }`}
          >
            {/* HEADER KAFELKA */}
            <div className={`p-5 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSectionVisible
                    ? (isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-800')
                    : (isDarkMode ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-100 text-slate-400')
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className={`font-black text-base ${isSectionVisible ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                    {section.label}
                  </h4>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Konfiguracja modułu pacjenta
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 shrink-0">
                {!hasDbColumns && (
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Wymaga SQL
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                  isSectionVisible 
                    ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                    : (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                }`}>
                  {isSectionVisible ? 'Aktywna' : 'Ukryta'}
                </span>
              </div>
            </div>

            {/* ZAWARTOŚĆ KAFELKA */}
            <div className={`p-5 md:p-6 space-y-5 transition-opacity ${!isSectionVisible && 'opacity-60 grayscale-[30%]'}`}>
              
              {/* TOGGLES (WIDOCZNOŚĆ I AKCJA) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSectionVisible 
                    ? (isDarkMode ? 'border-[#e8ce7a] bg-slate-900/80 shadow-md' : 'border-slate-900 bg-white shadow-sm')
                    : (isDarkMode ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-white')
                }`}>
                  <div className="pr-4">
                    <p className={`font-black text-sm ${isSectionVisible ? (isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                      Pokaż w Portalu Pacjenta
                    </p>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <input
                      type="checkbox"
                      checked={isSectionVisible}
                      onChange={e => setEditForm({ ...editForm, [fields.visible]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isSectionVisible 
                        ? (isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-white')
                        : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')
                    }`}>
                      {isSectionVisible && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                </label>

                {section.operational && fields.action && (
                  <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    editForm?.[fields.action] === true 
                      ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/10 shadow-md' : 'border-indigo-500 bg-indigo-50 shadow-sm')
                      : (isDarkMode ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-white')
                  }`}>
                    <div className="pr-4">
                      <p className={`font-black text-sm ${editForm?.[fields.action] === true ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-700') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                        Aktywna Akcja (Formularz)
                      </p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <input
                        type="checkbox"
                        checked={editForm?.[fields.action] === true}
                        onChange={e => setEditForm({ ...editForm, [fields.action!]: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        editForm?.[fields.action] === true 
                          ? (isDarkMode ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white')
                          : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')
                      }`}>
                        {editForm?.[fields.action] === true && <CheckCircle2 size={12} />}
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* POLA TEKSTOWE */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tytuł sekcji w Portalu</label>
                  <input
                    className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                    value={editForm?.[fields.title] || ''}
                    onChange={e => setEditForm({ ...editForm, [fields.title]: e.target.value })}
                    placeholder={section.placeholderTitle}
                  />
                  <AiTextAssistButton
                    eventId={id}
                    sectionKey={section.key}
                    fieldKey={fields.title}
                    currentValue={editForm?.[fields.title] || ''}
                    placeholder={section.placeholderTitle}
                    onApply={(text) => setEditForm({ ...editForm, [fields.title]: text })}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Opis dla pacjenta (Podtytuł)</label>
                  <textarea
                    rows={2}
                    className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium outline-none resize-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                    value={editForm?.[fields.description] || ''}
                    onChange={e => setEditForm({ ...editForm, [fields.description]: e.target.value })}
                    placeholder={section.placeholderDescription}
                  />
                  <AiTextAssistButton
                    eventId={id}
                    sectionKey={section.key}
                    fieldKey={fields.description}
                    currentValue={editForm?.[fields.description] || ''}
                    placeholder={section.placeholderDescription}
                    onApply={(text) => setEditForm({ ...editForm, [fields.description]: text })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Przycisk CTA */}
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tekst przycisku (CTA)</label>
                    <input
                      className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                      value={editForm?.[fields.cta] || ''}
                      onChange={e => setEditForm({ ...editForm, [fields.cta]: e.target.value })}
                      placeholder="np. Umów konsultację"
                    />
                  </div>

                  {/* Zdjęcie Tła */}
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zdjęcie sekcji (np. gabinet, sprzęt)</label>
                    {fileKey ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className={`w-full border rounded-xl px-3 py-2 text-xs transition-colors file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-400 file:bg-slate-800 file:text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-600 file:bg-white file:text-slate-700'}`}
                          onChange={e => setNewFiles({ ...newFiles, [fileKey]: e.target.files ? e.target.files[0] : null })}
                        />
                      </div>
                    ) : (
                      <input
                        className={`w-full border rounded-xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
                        value={editForm?.[fields.image] || ''}
                        onChange={e => setEditForm({ ...editForm, [fields.image]: e.target.value })}
                        placeholder="https://..."
                      />
                    )}
                    {editForm?.[fields.image] && (
                      <p className="text-[9px] font-mono mt-1.5 truncate text-blue-500 hover:underline cursor-help" title={editForm[fields.image]}>
                        Załączony plik (kliknij by sprawdzić)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>

    {/* ZAPIS STICKY BUTTON */}
    <div className="sticky bottom-6 z-30 flex justify-end mt-8">
      <button 
        type="submit" 
        disabled={updating} 
        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 ${
          isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-[#e8ce7a]'
        }`}
      >
        {updating ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
        {updating ? 'Zapisywanie struktury...' : 'Zapisz układ Portalu Pacjenta'}
      </button>
    </div>

  </form>
)}


{/* ============================================================================ */}
{/* edycja strony */}
{/* ============================================================================ */}
{activeTab === 'edycja' && editForm && (
  <form onSubmit={handleUpdateEvent} className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">
    
    {/* SEKCJA: TREŚCI TEKSTOWE */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
          <Globe size={22} />
        </div>
        <h3 className={`font-black text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Główne Treści Strony
        </h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tytuł wydarzenia</label>
          <input 
            className={`w-full border rounded-2xl px-4 py-3.5 font-bold outline-none text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} 
            value={editForm.title || ''} 
            onChange={e => setEditForm({...editForm, title: e.target.value})} 
          />
        </div>
        
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Lokalizacja</label>
          <input 
            className={`w-full border rounded-2xl px-4 py-3.5 font-bold outline-none text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} 
            value={editForm.location || ''} 
            onChange={e => setEditForm({...editForm, location: e.target.value})} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Data wydarzenia</label>
            <input 
              type="date" 
              className={`w-full border rounded-2xl px-4 py-3.5 font-bold outline-none text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} 
              value={editForm.event_date ? new Date(editForm.event_date).toISOString().split('T')[0] : ''} 
              onChange={e => setEditForm({...editForm, event_date: e.target.value})} 
            />
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Spodziewana liczba gości</label>
            <input 
              type="number" 
              className={`w-full border rounded-2xl px-4 py-3.5 font-bold outline-none text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} 
              value={editForm.expected_attendees || ''} 
              onChange={e => setEditForm({...editForm, expected_attendees: e.target.value})} 
            />
          </div>
        </div>
        
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pełny opis wydarzenia</label>
          <textarea 
            rows={4} 
            className={`w-full border rounded-2xl px-4 py-3.5 font-medium outline-none resize-none text-sm transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`} 
            value={editForm.description || ''} 
            onChange={e => setEditForm({...editForm, description: e.target.value})} 
            placeholder="Opisz krótko czym jest to wydarzenie, kogo zapraszasz i czego można się spodziewać."
          />
          {/* NOWY PRZYCISK AI */}
          <AiTextAssistButton
            eventId={id}
            sectionKey="general"
            fieldKey="description"
            currentValue={editForm.description || ''}
            placeholder="Skup się na powitaniu gości..."
            onApply={(text) => setEditForm({ ...editForm, description: text })}
          />
        </div>
      </div>
    </div>

    {/* SEKCJA: MULTIMEDIA */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
          <ImageIcon size={22} />
        </div>
        <h3 className={`font-black text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Multimedia (Zdjęcia i Logo)
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {/* LOGO */}
        <div className={`p-5 rounded-2xl border-2 border-dashed transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Logo Wydarzenia</label>
          <div className={`h-28 w-full rounded-xl mb-4 overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {getPreviewUrl(newFiles.logo, event?.logo_url) ? (
              <img src={getPreviewUrl(newFiles.logo, event?.logo_url)!} className="h-full object-contain p-2" alt="Logo preview" />
            ) : <ImageIcon className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} size={24} />}
          </div>
          <input type="file" accept="image/*" className={`text-[10px] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-colors ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700' : 'text-slate-600 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300'}`} onChange={e => setNewFiles({...newFiles, logo: e.target.files ? e.target.files[0] : null})} />
        </div>

        {/* COVER/HERO */}
        <div className={`p-5 rounded-2xl border-2 border-dashed transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zdjęcie Tła (Hero)</label>
          <div className={`h-28 w-full rounded-xl mb-4 overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {getPreviewUrl(newFiles.cover, event?.cover_image_url) ? (
              <img src={getPreviewUrl(newFiles.cover, event?.cover_image_url)!} className="w-full h-full object-cover" alt="Hero preview" />
            ) : <ImageIcon className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} size={24} />}
          </div>
          <input type="file" accept="image/*" className={`text-[10px] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-colors ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700' : 'text-slate-600 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300'}`} onChange={e => setNewFiles({...newFiles, cover: e.target.files ? e.target.files[0] : null})} />
        </div>

        {/* RSVP IMAGE */}
        <div className={`p-5 rounded-2xl border-2 border-dashed transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zdjęcie w RSVP</label>
          <div className={`h-28 w-full rounded-xl mb-4 overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {getPreviewUrl(newFiles.rsvpImg, event?.rsvp_image_url) ? (
              <img src={getPreviewUrl(newFiles.rsvpImg, event?.rsvp_image_url)!} className="w-full h-full object-cover" alt="RSVP preview" />
            ) : <ImageIcon className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} size={24} />}
          </div>
          <input type="file" accept="image/*" className={`text-[10px] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-colors ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700' : 'text-slate-600 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300'}`} onChange={e => setNewFiles({...newFiles, rsvpImg: e.target.files ? e.target.files[0] : null})} />
        </div>
      </div>

      <div className={`border-t pt-6 mt-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Galeria pod opisem</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(num => (
            <div key={num} className={`p-4 rounded-2xl border-2 border-dashed transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Zdjęcie {num}</label>
              <div className={`h-24 w-full rounded-xl mb-4 overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {getPreviewUrl(newFiles[`img${num}` as keyof typeof newFiles], event?.[`image_${num}_url`]) ? (
                  <img src={getPreviewUrl(newFiles[`img${num}` as keyof typeof newFiles], event?.[`image_${num}_url`])!} className="w-full h-full object-cover" alt="Preview" />
                ) : <ImageIcon className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} size={20} />}
              </div>
              <input type="file" accept="image/*" className={`text-[10px] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-colors ${isDarkMode ? 'text-slate-400 file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700' : 'text-slate-600 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300'}`} onChange={e => setNewFiles({...newFiles, [`img${num}`]: e.target.files ? e.target.files[0] : null})} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* SEKCJA: BRAND BOOK & KOLORY */}
    <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-slate-100 text-slate-700'}`}>
          <Palette size={22} />
        </div>
        <h3 className={`font-black text-lg md:text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Wygląd i Brand Book
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        {[
          { key: 'bg_color', label: 'Tło Strony' }, 
          { key: 'card_bg_color', label: 'Tło Kafelków' }, 
          { key: 'heading_color', label: 'Nagłówki' }, 
          { key: 'text_color', label: 'Tekst (Akapity)' }, 
          { key: 'primary_color', label: 'Akcent Główny' }, 
          { key: 'secondary_color', label: 'Akcent Dodatkowy' }
        ].map(field => (
          <div key={field.key} className={`p-3 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <label className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{field.label}</label>
            <div className="flex flex-col gap-2">
              <input type="color" value={editForm[field.key] || '#000000'} onChange={e => setEditForm({...editForm, [field.key]: e.target.value})} className={`w-full h-8 rounded cursor-pointer border-0 p-0 ${isDarkMode ? 'bg-transparent' : ''}`} />
              <input type="text" value={editForm[field.key] || ''} onChange={e => setEditForm({...editForm, [field.key]: e.target.value})} className={`w-full border rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold uppercase outline-none text-center ${isDarkMode ? 'bg-slate-950 border-slate-600 text-slate-300 focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-800 focus:border-slate-900'}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={`border-t pt-6 mb-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Kolory tła konkretnych sekcji
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'hero_gradient_color', label: 'Gradient hero' },
            { key: 'theme_bg_color', label: 'Motyw / Dress code' },
            { key: 'speakers_section_bg_color', label: 'Prelegenci' },
            { key: 'agenda_section_bg_color', label: 'Agenda' },
            { key: 'sponsors_section_bg_color', label: 'Sponsorzy' },
          ].map(field => (
            <div key={field.key} className={`p-3 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`text-[9px] font-black uppercase tracking-widest block mb-2 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {field.label}
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="color"
                  value={editForm[field.key] || '#ffffff'}
                  onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                  className={`w-full h-8 rounded cursor-pointer border-0 p-0 ${isDarkMode ? 'bg-transparent' : ''}`}
                />
                <input
                  type="text"
                  value={editForm[field.key] || '#ffffff'}
                  onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                  className={`w-full border rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold uppercase outline-none text-center ${isDarkMode ? 'bg-slate-950 border-slate-600 text-slate-300 focus:border-[#e8ce7a]' : 'bg-white border-slate-300 text-slate-800 focus:border-slate-900'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 border-t pt-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Czcionka Nagłówków</label>
          <div className="space-y-2">
            <select
              className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
              value={GOOGLE_FONT_OPTIONS.some(font => font.family === getFontFamilyName(editForm.heading_font)) ? getFontFamilyName(editForm.heading_font) : ''}
              onChange={e => e.target.value && setEditForm({...editForm, heading_font: buildGoogleFontStack(e.target.value)})}
            >
              <option value="">Wybierz z listy Google Fonts</option>
              {GOOGLE_FONT_OPTIONS.map(font => (
                <option key={font.family} value={font.family}>{font.family} ({font.category})</option>
              ))}
            </select>
            <input
              className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
              value={getFontFamilyName(editForm.heading_font || 'Inter, sans-serif')}
              onChange={e => setEditForm({...editForm, heading_font: buildGoogleFontStack(e.target.value)})}
              placeholder="Albo wpisz własną nazwę"
            />
          </div>
        </div>
        
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Czcionka Tekstu</label>
          <div className="space-y-2">
            <select
              className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`}
              value={GOOGLE_FONT_OPTIONS.some(font => font.family === getFontFamilyName(editForm.body_font)) ? getFontFamilyName(editForm.body_font) : ''}
              onChange={e => e.target.value && setEditForm({...editForm, body_font: buildGoogleFontStack(e.target.value)})}
            >
              <option value="">Wybierz z listy Google Fonts</option>
              {GOOGLE_FONT_OPTIONS.map(font => (
                <option key={font.family} value={font.family}>{font.family} ({font.category})</option>
              ))}
            </select>
            <input
              className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a] placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900 placeholder-slate-400'}`}
              value={getFontFamilyName(editForm.body_font || 'Inter, sans-serif')}
              onChange={e => setEditForm({...editForm, body_font: buildGoogleFontStack(e.target.value)})}
              placeholder="Albo wpisz własną nazwę"
            />
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kształt Elementów (Border Radius)</label>
          <select 
            className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-[#e8ce7a]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'}`} 
            value={editForm.element_shape || 'rounded-none'} 
            onChange={e => setEditForm({...editForm, element_shape: e.target.value})}
          >
            <option value="rounded-none">Ostre krawędzie (Kwadrat)</option>
            <option value="rounded-xl">Zaokrąglone (Soft)</option>
            <option value="rounded-[40px]">Mocno zaokrąglone (Pill)</option>
          </select>
        </div>
      </div>
    </div>

    {/* PRZYCISK ZAPISU - ZHARMONIZOWANY I WIDOCZNY */}
    <div className="sticky bottom-6 z-30 flex justify-end">
      <button 
        type="submit" 
        disabled={updating} 
        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 ${
          isDarkMode ? 'bg-[#e8ce7a] text-slate-900' : 'bg-slate-900 text-[#e8ce7a]'
        }`}
      >
        {updating ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
        {updating ? 'Zapisywanie plików...' : 'Zapisz Ustawienia Strony'}
      </button>
    </div>

  </form>
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
          Dokumentacja i Wywiad Medyczny
        </h3>
        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Zarządzaj inteligentnymi szablonami zgód, weryfikuj wywiady zdrowotne i kontroluj status prawny pacjentów przed zabiegiem.
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <HelpButton sectionKey="medical_docs" />
        <button
          onClick={() => showNotification('Otwieram inteligentny kreator szablonów AI...', 'info')}
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
            2 pacjentów wymaga uwagi przed dzisiejszym zabiegiem
          </h4>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            System wykrył brak wypełnionego <strong>Kwestionariusza Zdrowotnego</strong> u 1 osoby oraz brak <strong>Zgody na zabieg laserowy</strong> u 1 osoby. Nie dopuszczaj ich do gabinetu przed uzupełnieniem dokumentacji cyfrowej lub wgraniem podpisanego skanu.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* KOLUMNA 1: STATUSY PACJENTÓW (DLA RECEPCJI) */}
      <div className="xl:col-span-2 space-y-6">
        <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dzisiejsze wizyty - Status Dokumentacji</h4>
        
        <div className="space-y-3">
          {/* Pacjent 1 - Brak wywiadu */}
          <div className={`p-4 md:p-5 rounded-[24px] border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-red-900/50' : 'bg-white border-red-200'}`}>
            <div className="flex items-start gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                <XCircle size={20} />
              </div>
              <div className="min-w-0">
                <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Anna Kowalska</h5>
                <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Brak wywiadu medycznego!</p>
                <p className={`text-[10px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zabieg: Mezoterapia igłowa • 14:30</p>
              </div>
            </div>
            <button 
              onClick={() => showNotification('Link do wywiadu został wysłany SMSem do pacjentki.', 'success')}
              className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
            >
              Wyślij SMS z ankietą
            </button>
          </div>

          {/* Pacjent 2 - Wywiad jest, brak zgody */}
          <div className={`p-4 md:p-5 rounded-[24px] border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-amber-700/50' : 'bg-white border-amber-200'}`}>
            <div className="flex items-start gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0">
                <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Michał Nowak</h5>
                <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Oczekuje na podpis zgody zabiegowej</p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black border ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>Wywiad OK</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Laser frakcyjny CO2</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => window.print()}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Drukuj dla pacjenta
              </button>
              <button 
                onClick={() => showNotification('Wysłano prośbę o podpis do aplikacji pacjenta.', 'success')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'}`}
              >
                Podpisz na tablecie
              </button>
            </div>
          </div>

          {/* Pacjent 3 - Komplet */}
          <div className={`p-4 md:p-5 rounded-[24px] border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-emerald-900/30' : 'bg-white border-emerald-100'}`}>
            <div className="flex items-start gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0">
                <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Katarzyna Wiśniewska</h5>
                <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Komplet dokumentów</p>
                <p className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Lekarz może rozpocząć zabieg (Wolumetria). Zgoda wgrana.
                </p>
              </div>
            </div>
            <button className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Zobacz Kartę 360
            </button>
          </div>
        </div>

        {/* MODUŁ SKANERA PAPIERU (Dla tradycjonalistów) */}
        <div className={`mt-8 p-6 md:p-8 rounded-[32px] border border-dashed flex flex-col items-center justify-center text-center transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800 text-[#e8ce7a]' : 'bg-white text-slate-400 shadow-sm border border-slate-200'}`}>
            <Download size={24} />
          </div>
          <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Wgraj odręcznie podpisaną zgodę</h4>
          <p className={`text-xs mt-2 max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Opcja awaryjna dla pacjentów preferujących papier. Zrób zdjęcie tabletem lub wgraj skan. Otaguj pacjenta, a plik zapisze się jako oficjalny log w jego cyfrowej Karcie 360.
          </p>
          <div className="mt-5 relative w-fit">
            <button className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              Skanuj dokument
            </button>
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
          </div>
        </div>
      </div>

      {/* KOLUMNA 2: BIBLIOTEKA SZABLONÓW */}
      <div className="xl:col-span-1 space-y-6">
        <h4 className={`font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <FileIcon size={20} className={isDarkMode ? 'text-[#e8ce7a]' : 'text-slate-600'}/> Baza Szablonów
        </h4>
        
        <div className="space-y-3">
          {/* Kwestionariusz */}
          <div className={`p-4 rounded-[20px] border shadow-sm ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>Systemowy</span>
              <button className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-500'}`}><Edit3 size={14}/></button>
            </div>
            <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pełny Wywiad Medyczny</h5>
            <p className={`text-[10px] mt-1.5 font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Inteligentna ankieta zdrowotna, wymagana automatycznie przed pierwszą wizytą każdego pacjenta.</p>
          </div>

          {/* Zgoda Laser */}
          <div className={`p-4 rounded-[20px] border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Edytowalny</span>
              <button className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-500'}`}><Edit3 size={14}/></button>
            </div>
            <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zgoda: Laser frakcyjny CO2</h5>
            <p className={`text-[10px] mt-1.5 font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zgoda zabiegowa obejmująca przeciwwskazania (izotretynoina, opalenizna) oraz zalecenia po.</p>
          </div>

          {/* Zgoda RODO */}
          <div className={`p-4 rounded-[20px] border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Edytowalny</span>
              <button className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-500'}`}><Edit3 size={14}/></button>
            </div>
            <h5 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zgoda RODO & Marketing</h5>
            <p className={`text-[10px] mt-1.5 font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zgoda na publikację wizerunku (zdjęcia przed/po), kontakt SMS oraz newsletter.</p>
          </div>
        </div>
        
        <button 
          onClick={() => showNotification('Otwieram pusty szablon. Możesz wkleić własną treść lub użyć asystenta AI.', 'info')}
          className={`w-full py-4 border-2 border-dashed rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${isDarkMode ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 bg-slate-900/50' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 bg-slate-50'}`}
        >
          <Plus size={16} /> Nowy Szablon Zgody
        </button>
      </div>
    </div>
  </div>
)}


// ==========================================================================
// 6. KOMPONENTY POMOCNICZE (useState)
// ==========================================================================

const PlaceholderView = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm p-8 md:p-16 text-center">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
      <Icon size={28} className="text-slate-500" />
    </div>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm font-medium text-slate-600">{desc}</p>
  </div>
)

const SavingsItem = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) => (
  <div className="flex items-start gap-2 md:gap-3 bg-white rounded-xl p-2 md:p-3 border border-emerald-200 shadow-sm">
    <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0"><p className="text-xs md:text-sm font-bold text-slate-900">{title}</p><p className="text-[9px] md:text-xs text-slate-600 font-medium">{description}</p></div>
    <p className="text-xs md:text-sm font-black text-emerald-700 shrink-0">{value}</p>
  </div>
)

const LiveCarbonFootprint = ({ event, applications }: { event: any, applications: any[] }) => {
  const approvedGuests = applications.filter(a => a.status === 'approved')
  const confirmedGuests = approvedGuests.filter(a => a.rsvp_status === 'potwierdzone')
  const EMISSIONS = { paperInvitation: 0.15, printedBanner: 8.0, carPerKm: 0.2, meal: 2.5, singleUsePlastic: 0.1 }
  const paperSaved = approvedGuests.length * EMISSIONS.paperInvitation
  const postersSaved = (event?.use_print_materials ? 4 : 0) * EMISSIONS.printedBanner
  const carTransportSaved = confirmedGuests.filter(g => g.transport === 'car').length * 15 * EMISSIONS.carPerKm * 0.3
  const mealWasteSaved = (approvedGuests.length - confirmedGuests.length) * EMISSIONS.meal * 0.7
  const plasticSaved = approvedGuests.length * EMISSIONS.singleUsePlastic
  const totalSaved = paperSaved + postersSaved + carTransportSaved + mealWasteSaved + plasticSaved
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-300 rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md"><Leaf size={20} className="text-white" /></div><div><h3 className="font-black text-emerald-950 text-sm md:text-lg">Ślad Węglowy LIVE</h3><p className="text-[10px] md:text-xs font-bold text-emerald-700">Kalkulator CO₂</p></div></div>
      <div className="bg-white rounded-2xl p-3 md:p-5 mb-3 border border-emerald-200 text-center shadow-sm"><p className="text-[10px] text-slate-600 font-black mb-1 uppercase tracking-widest">Oszczędność CO₂</p><p className="text-2xl md:text-3xl font-black text-emerald-700">{totalSaved.toFixed(1)} kg</p><div className="grid grid-cols-2 gap-2 mt-3"><div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100"><p className="text-lg font-black text-emerald-800">{Math.round(totalSaved * 0.06)}</p><p className="text-[9px] font-bold text-emerald-700 uppercase">drzew</p></div><div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100"><p className="text-lg font-black text-emerald-800">{Math.round(totalSaved / 0.2)} km</p><p className="text-[9px] font-bold text-emerald-700 uppercase">jazdy</p></div></div></div>
      <div className="space-y-2"><SavingsItem icon={<Globe size={12} />} title="Cyfrowe zaproszenia" value={`${paperSaved.toFixed(1)} kg`} description={`${approvedGuests.length} szt.`} /><SavingsItem icon={<Truck size={12} />} title="Transport" value={`${carTransportSaved.toFixed(1)} kg`} description="Carpooling" /><SavingsItem icon={<Recycle size={12} />} title="Plastik" value={`${plasticSaved.toFixed(1)} kg`} description="Eliminacja" /></div>
    </div>
  )
}

const EcoCertificate = ({ event, metrics }: { event: any, metrics: any }) => {
  const certificateId = `GOZ-${event?.id || 'event'}-${Date.now()}`
  const qrValue = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-cert/${certificateId}`
  return (
    <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4"><h3 className="font-black text-slate-900 flex items-center gap-2 text-sm md:text-base"><Award size={18} className="text-[#253a2a]"/> Certyfikat Eko ANM</h3><button className="px-3 py-1.5 bg-[#253a2a] text-[#e8ce7a] rounded-xl text-[10px] font-black uppercase transition-colors hover:bg-[#1a291e]">PDF</button></div>
      <div className="bg-gradient-to-br from-slate-100 to-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center shadow-inner"><Leaf size={28} className="text-[#253a2a] mx-auto mb-3" /><h4 className="font-black text-slate-900 mb-2 text-sm uppercase">Wydarzenie Przyjazne Środowisku</h4><div className="grid grid-cols-2 gap-2 mb-3"><div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm"><p className="text-base font-black text-emerald-700">{metrics.totalCO2Saved} kg</p><p className="text-[9px] font-bold text-slate-500 uppercase">CO₂</p></div><div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm"><p className="text-base font-black text-emerald-700">{metrics.foodWastePrevented} kg</p><p className="text-[9px] font-bold text-slate-500 uppercase">Jedzenie</p></div></div><div className="bg-white rounded-xl p-2 inline-block border border-slate-200 shadow-sm"><QRCode value={qrValue} size={60} level="M" /></div><p className="text-[9px] font-mono font-bold text-slate-500 mt-3 bg-slate-100 inline-block px-2 py-1 rounded">ID: {certificateId}</p></div>
    </div>
  )
}

const CircularSuppliersPanel = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Eko Catering Zielony", category: "Catering", score: 85, practices: ["Lokalne", "BIO", "Zero waste"], co2Reduction: 45, price: "średnia", selected: false },
    { id: 2, name: "Green Transport", category: "Transport", score: 92, practices: ["Elektryki", "Carpooling"], co2Reduction: 78, price: "wyższa", selected: false },
    { id: 3, name: "Bio Dekoracje", category: "Dekoracje", score: 78, practices: ["Recykling", "Sezonowe"], co2Reduction: 60, price: "niższa", selected: false }
  ])
  const toggleSupplier = (id: number) => setSuppliers(suppliers.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
  const selectedCount = suppliers.filter(s => s.selected).length
  return (
    <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-300 shadow-sm p-4 md:p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2"><Recycle size={18} className="text-[#253a2a]"/> Dostawcy Cyrkularni</h3>{selectedCount > 0 && <span className="text-[10px] bg-[#253a2a] text-[#e8ce7a] px-2 py-1 rounded-lg font-black shadow-sm">Wybrano {selectedCount}</span>}</div>
      <div className="space-y-3">{suppliers.map(s => (<div key={s.id} onClick={() => toggleSupplier(s.id)} className={`border-2 rounded-2xl p-3 cursor-pointer transition-all ${s.selected ? 'border-[#253a2a] bg-emerald-50/50' : 'border-slate-200 hover:border-[#253a2a]'}`}><div className="flex justify-between items-center"><div><h4 className="font-black text-slate-900 text-sm">{s.name}</h4><p className="text-[10px] font-bold text-slate-600 mt-0.5">{s.category} • {s.price}</p></div><div className="flex items-center gap-2"><span className="text-xs font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">GOZ {s.score}%</span><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${s.selected ? 'bg-[#253a2a] border-[#253a2a]' : 'border-slate-300 bg-white'}`}>{s.selected && <CheckCircle2 size={12} className="text-white" />}</div></div></div><div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100/50">{s.practices.map((p, i) => <span key={i} className="px-2 py-0.5 bg-white rounded-lg text-[9px] font-black text-slate-700 border border-slate-200 shadow-sm">{p}</span>)}</div></div>))}</div>
    </div>
  )
}



const TransportOptimizer = ({ applications }: { applications: Guest[] }) => {
  const confirmed = applications.filter(a => a.rsvp_status === 'potwierdzone')
  const needTransport = confirmed.filter(a => a.transport && a.transport !== 'Własny dojazd' && a.transport_address)
  const totalNeedTransport = needTransport.length
  return (
    <div className="bg-white rounded-[32px] border border-slate-300 shadow-sm p-6">
      <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2"><Car size={20} className="text-[#253a2a]"/> Optymalizator Logistyczny</h3>
      <div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-4 text-center"><p className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Wymaga transportu</p><p className="text-3xl font-black text-slate-900 mt-1">{totalNeedTransport}</p></div><div className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-2xl p-4 text-center"><p className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">Sugerowane Grupy</p><p className="text-3xl font-black text-emerald-700 mt-1">{Math.round(totalNeedTransport * 0.7)}</p></div></div>
    </div>
  )
}

