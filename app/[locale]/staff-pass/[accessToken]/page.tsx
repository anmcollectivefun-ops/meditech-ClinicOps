'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createClient } from '../../../lib/supabase'
import {
  BadgeCheck,
  BarChart3,
  Bus,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileSignature,
  Gift,
  KeyRound,
  MessageSquare,
  Shield,
  Search,
  ShieldCheck,
  Stethoscope,
  Ticket,
  UtensilsCrossed,
  Users,
  XCircle,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Copy,
  ExternalLink
} from 'lucide-react'

type StaffPassParams = Promise<{ locale: string; accessToken: string }>

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })
}

const shortToken = (value?: string | null) => {
  if (!value) return '-'
  return `${String(value).slice(0, 10)}...`
}

const hasPermission = (staffAccess: any, permission: string) => {
  if (!staffAccess) return false
  if (staffAccess.role === 'manager') return true
  return staffAccess[permission] === true
}

const roleLabel = (role?: string | null) => {
  const labels: Record<string, string> = {
    reception: 'Recepcja',
    doctor: 'Lekarz',
    coordinator: 'Opiekun pacjenta',
    manager: 'Manager kliniki',
    entry: 'Recepcja',
    kitchen: 'Punkt obsługi',
    gadgets: 'Punkt obsługi',
    transport: 'Opiekun pacjenta'
  }

  return labels[String(role || '')] || role || '-'
}

const canViewMedicalHistory = (staffAccess: any) =>
  ['doctor', 'manager'].includes(String(staffAccess?.role || ''))

const canViewAppointments = (staffAccess: any) =>
  ['reception', 'doctor', 'coordinator', 'manager', 'entry'].includes(String(staffAccess?.role || ''))

const roleModuleDefaults: Record<string, string[]> = {
  manager: ['overview', 'patients', 'appointments', 'documents', 'messages', 'qr', 'analytics'],
  reception: ['overview', 'patients', 'appointments', 'documents', 'messages', 'qr'],
  doctor: ['overview', 'patients', 'appointments', 'documents', 'messages'],
  coordinator: ['overview', 'patients', 'appointments', 'documents', 'messages', 'qr'],
  entry: ['overview', 'appointments', 'qr'],
}

const modulePermissionMap: Record<string, string> = {
  patients: 'can_view_patients',
  appointments: 'can_view_appointments',
  documents: 'can_view_documents',
  messages: 'can_view_messages',
  qr: 'can_view_qr',
  analytics: 'can_view_ai_analytics',
}

const canViewStaffModule = (staffAccess: any, moduleId: string) => {
  if (!staffAccess) return false
  if (moduleId === 'overview') return true
  if (staffAccess.role === 'manager') return true
  const permission = modulePermissionMap[moduleId]
  if (permission && typeof staffAccess[permission] === 'boolean') return staffAccess[permission]
  return (roleModuleDefaults[String(staffAccess.role || '')] || ['overview']).includes(moduleId)
}

const formatMoney = (value?: number | string | null) =>
  `${Number(value || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`

export default function StaffPassPage({ params }: { params: StaffPassParams }) {
  const { accessToken } = use(params)
  const supabase = createClient()

  const [isDarkMode, setIsDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [staffAccess, setStaffAccess] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [qrInput, setQrInput] = useState('')
  const [searchedToken, setSearchedToken] = useState('')
  const [attendeeUnit, setAttendeeUnit] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [mealChoices, setMealChoices] = useState<any[]>([])
  const [gadgetChoices, setGadgetChoices] = useState<any[]>([])
  const [sessionSignups, setSessionSignups] = useState<any[]>([])
  const [transportChoices, setTransportChoices] = useState<any[]>([])
  const [mealRedemptions, setMealRedemptions] = useState<any[]>([])
  const [gadgetRedemptions, setGadgetRedemptions] = useState<any[]>([])
  const [transportCheckins, setTransportCheckins] = useState<any[]>([])
  const [meals, setMeals] = useState<any[]>([])
  const [gadgets, setGadgets] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [activeStaffModule, setActiveStaffModule] = useState('overview')
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [patientConsents, setPatientConsents] = useState<any[]>([])
  const [portalRequests, setPortalRequests] = useState<any[]>([])
  const [portalMessages, setPortalMessages] = useState<any[]>([])
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [scannerStatus, setScannerStatus] = useState<string | null>(null)
  const [qrSearchLoading, setQrSearchLoading] = useState(false)
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual')
  const [scannerBackend, setScannerBackend] = useState<'native' | 'html5' | null>(null)
  const qrInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const html5QrCodeRef = useRef<any>(null)
  const html5QrRegionIdRef = useRef(`html5-qr-reader-${accessToken}`)
  const streamRef = useRef<MediaStream | null>(null)
  const scanFrameRef = useRef<number | null>(null)
  const lastScannedRef = useRef<{ token: string; time: number }>({ token: '', time: 0 })
  const qrSearchLoadingRef = useRef(false)

  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [openNavGroup, setOpenNavGroup] = useState('Dostęp Operacyjny')

  const canEntry = hasPermission(staffAccess, 'can_entry_checkin')
  const canGadget = hasPermission(staffAccess, 'can_gadget_redemption')
  const canBandIssue = hasPermission(staffAccess, 'can_wristband_issue')
  const canBandReturn = hasPermission(staffAccess, 'can_wristband_return')
  const canMedicalHistory = canViewMedicalHistory(staffAccess)
  const canAppointments = canViewAppointments(staffAccess)
  const canSessions = canAppointments || staffAccess?.role === 'manager' || [canEntry, canGadget, canBandIssue, canBandReturn].filter(Boolean).length > 1

  const mealById = useMemo(() => new Map(meals.map((meal: any) => [meal.id, meal])), [meals])
  const gadgetById = useMemo(() => new Map(gadgets.map((gadget: any) => [gadget.id, gadget])), [gadgets])
  const sessionById = useMemo(() => new Map(sessions.map((session: any) => [session.id, session])), [sessions])
  const routeById = useMemo(() => new Map(routes.map((route: any) => [route.id, route])), [routes])
  const patientById = useMemo(() => new Map(patients.map((patient: any) => [patient.id, patient])), [patients])
  const staffModules = useMemo(() => ([
    { id: 'overview', label: 'Pulpit', icon: BarChart3 },
    { id: 'patients', label: 'Pacjenci', icon: Users, count: patients.length },
    { id: 'appointments', label: 'Wizyty', icon: CalendarPlus, count: appointments.length },
    { id: 'documents', label: 'Dokumenty', icon: FileSignature, count: patientConsents.length },
    { id: 'messages', label: 'Wiadomości', icon: MessageSquare, count: portalRequests.filter((item: any) => ['new', 'in_progress'].includes(String(item.status || '').toLowerCase())).length },
    { id: 'qr', label: 'QR', icon: ShieldCheck },
    { id: 'analytics', label: 'AI analityka', icon: Stethoscope },
  ]).filter(module => canViewStaffModule(staffAccess, module.id)), [appointments.length, patientConsents.length, patients.length, portalRequests, staffAccess])
  
  const staffStats = useMemo(() => {
    const unpaidValue = appointments.reduce((sum: number, appointment: any) => {
      const price = Number(appointment.price_amount || 0)
      const paid = Number(appointment.paid_amount || 0)
      return sum + Math.max(price - paid, 0)
    }, 0)
    const pendingDocs = patientConsents.filter((consent: any) => String(consent.status || '').toLowerCase() !== 'signed').length
    const openMessages = portalRequests.filter((item: any) => ['new', 'in_progress'].includes(String(item.status || '').toLowerCase())).length
    const todayKey = new Date().toISOString().slice(0, 10)
    const todayAppointments = appointments.filter((appointment: any) => String(appointment.appointment_date || '').slice(0, 10) === todayKey).length
    return { unpaidValue, pendingDocs, openMessages, todayAppointments }
  }, [appointments, patientConsents, portalRequests])
  
  const currentDiet = attendeeUnit?.diet || application?.diet || ''
  const currentAllergies = attendeeUnit?.allergies || application?.allergies || ''
  const isChildUnit = attendeeUnit?.unit_type === 'child' || attendeeUnit?.age_group === 'child'
  const fallbackDiet = currentDiet || (isChildUnit ? 'dziecięce / standard' : 'Standard')
  const fallbackAllergies = currentAllergies || 'brak'

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('anm-staff-theme') : null
    if (storedTheme === 'light') setIsDarkMode(false)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev
      if (typeof window !== 'undefined') localStorage.setItem('anm-staff-theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    const loadStaffAccess = async () => {
      setLoading(true)
      setError(null)

      const { data, error: staffError } = await supabase
        .from('event_staff_access')
        .select('*')
        .eq('access_token', accessToken)
        .single()

      if (staffError || !data || data.is_active === false) {
        setError('Ten dostęp jest nieaktywny albo nie istnieje.')
        setLoading(false)
        return
      }

      setStaffAccess(data)

      const { data: eventData, error: eventError } = await supabase
        .from('b2b_events')
        .select('id,title,event_date,location')
        .eq('id', data.event_id)
        .single()

      if (eventError) {
        console.warn('Staff pass event load error:', eventError.message)
      }

      setEvent(eventData || null)
      setLoading(false)
    }

    loadStaffAccess()
  }, [accessToken, supabase])

  useEffect(() => {
    return () => { stopQrScanner() }
  }, [])

  useEffect(() => {
    if (!loading && staffAccess) {
      qrInputRef.current?.focus()
    }
  }, [loading, staffAccess])

  useEffect(() => {
    if (!staffAccess) return
    const firstModule = staffModules[0]?.id || 'overview'
    if (!staffModules.some(module => module.id === activeStaffModule)) {
      setActiveStaffModule(firstModule)
    }
  }, [activeStaffModule, staffAccess, staffModules])

  useEffect(() => {
    if (!staffAccess?.event_id) return

    const loadStaffWorkspace = async () => {
      setWorkspaceLoading(true)
      const [
        patientsRes,
        appointmentsRes,
        consentsRes,
        requestsRes,
        messagesRes
      ] = await Promise.all([
        canViewStaffModule(staffAccess, 'patients')
          ? supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(200)
          : Promise.resolve({ data: [], error: null } as any),
        canViewStaffModule(staffAccess, 'appointments')
          ? supabase.from('appointments').select('*').eq('event_id', staffAccess.event_id).order('appointment_date', { ascending: true }).limit(200)
          : Promise.resolve({ data: [], error: null } as any),
        canViewStaffModule(staffAccess, 'documents')
          ? supabase.from('patient_consents').select('*, medical_consent_templates(title, document_type)').eq('event_id', staffAccess.event_id).order('created_at', { ascending: false }).limit(200)
          : Promise.resolve({ data: [], error: null } as any),
        canViewStaffModule(staffAccess, 'messages')
          ? supabase.from('patient_portal_requests').select('*').eq('event_id', staffAccess.event_id).order('created_at', { ascending: false }).limit(100)
          : Promise.resolve({ data: [], error: null } as any),
        canViewStaffModule(staffAccess, 'messages')
          ? supabase.from('patient_portal_messages').select('*').order('created_at', { ascending: true }).limit(200)
          : Promise.resolve({ data: [], error: null } as any),
      ])

      if (patientsRes.error) console.warn('Staff patients load error:', patientsRes.error.message)
      if (appointmentsRes.error) console.warn('Staff appointments load error:', appointmentsRes.error.message)
      if (consentsRes.error) console.warn('Staff consents load error:', consentsRes.error.message)
      if (requestsRes.error) console.warn('Staff requests load error:', requestsRes.error.message)
      if (messagesRes.error) console.warn('Staff messages load error:', messagesRes.error.message)

      setPatients(patientsRes.data || [])
      setAppointments(appointmentsRes.data || [])
      setPatientConsents(consentsRes.data || [])
      setPortalRequests(requestsRes.data || [])
      setPortalMessages(messagesRes.data || [])
      setWorkspaceLoading(false)
    }

    loadStaffWorkspace()
  }, [staffAccess, supabase])

  const logActionError = (action: string, error: any, payload: any) => {
    console.error('Staff pass action error:', {
      action,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      payload
    })
    if (error?.code === '23505') {
      setError('To świadczenie zostało już wydane.')
      return
    }
    setError(`Nie udało się wykonać akcji: ${error?.message || 'Nieznany błąd'}`)
  }

  const insertScan = async (scanType: string, result = 'ok', notes: string | null = null) => {
    if (!staffAccess || !attendeeUnit) return
    const payload = {
      event_id: staffAccess.event_id,
      application_id: attendeeUnit.application_id,
      attendee_unit_id: attendeeUnit.id,
      scan_type: scanType,
      result,
      scanned_by: staffAccess.name,
      staff_role: staffAccess.role,
      notes
    }
    const { error: scanError } = await supabase.from('event_pass_scans').insert([payload])
    if (scanError) logActionError(scanType, scanError, payload)
  }

  const loadUnitDetails = async (unit: any) => {
    setAttendeeUnit(unit)
    setApplication(null)
    setMealChoices([])
    setGadgetChoices([])
    setSessionSignups([])
    setTransportChoices([])
    setMealRedemptions([])
    setGadgetRedemptions([])
    setTransportCheckins([])

    const [
      appRes,
      gadgetChoiceRes,
      sessionRes,
      gadgetRedemptionRes,
      gadgetsRes,
      sessionsRes
    ] = await Promise.all([
      supabase.from('b2b_applications').select('*').eq('id', unit.application_id).single(),
      supabase.from('event_attendee_gadget_choices').select('*').eq('event_id', unit.event_id).eq('attendee_unit_id', unit.id),
      supabase.from('event_attendee_session_signups').select('*').eq('event_id', unit.event_id).eq('attendee_unit_id', unit.id),
      supabase.from('event_gadget_redemptions').select('*').eq('event_id', unit.event_id).eq('attendee_unit_id', unit.id),
      supabase.from('event_gadgets').select('*').eq('event_id', unit.event_id),
      supabase.from('event_sessions').select('*').eq('event_id', unit.event_id)
    ])

    const sourceData = typeof unit.source_data === 'string'
      ? (() => { try { return JSON.parse(unit.source_data) } catch { return {} } })()
      : (unit.source_data || {})

    const fallbackGadgetChoices = Array.isArray(sourceData?.selectedGadgetIds)
      ? sourceData.selectedGadgetIds.filter(Boolean).map((gadgetId: string) => ({
          event_id: unit.event_id,
          application_id: unit.application_id,
          attendee_unit_id: unit.id,
          gadget_id: gadgetId,
          quantity: 1,
          status: 'selected',
          declined_gadget: false,
          source: 'attendee_unit_source_data'
        }))
      : []

    const resolvedGadgetChoices = (gadgetChoiceRes.data || []).length > 0
      ? (gadgetChoiceRes.data || [])
      : fallbackGadgetChoices

    const fallbackSessionSignups = Array.isArray(sourceData?.selectedSessionIds)
      ? sourceData.selectedSessionIds.filter(Boolean).map((sessionId: string) => ({
          event_id: unit.event_id,
          application_id: unit.application_id,
          attendee_unit_id: unit.id,
          session_id: sessionId,
          status: 'signed_up',
          source: 'attendee_unit_source_data'
        }))
      : []

    const resolvedSessionSignups = (sessionRes.data || []).length > 0
      ? (sessionRes.data || [])
      : fallbackSessionSignups

    setApplication(appRes.data || null)
    setMealChoices([])
    setGadgetChoices(resolvedGadgetChoices)
    setSessionSignups(resolvedSessionSignups)
    setTransportChoices([])
    setMealRedemptions([])
    setGadgetRedemptions(gadgetRedemptionRes.data || [])
    setTransportCheckins([])
    setMeals([])
    setGadgets(gadgetsRes.data || [])
    setSessions(sessionsRes.data || [])
    setRoutes([])
  }

  const searchAttendeeByQrToken = async (rawToken: string) => {
    if (!staffAccess) return
    const token = rawToken.trim()
    if (!token) return

    setQrSearchLoading(true)
    qrSearchLoadingRef.current = true
    setError(null)
    setMessage(null)
    setSearchedToken(token)
    setQrInput(token)

    const { data, error: unitError } = await supabase
      .from('event_attendee_units')
      .select('*')
      .eq('event_id', staffAccess.event_id)
      .eq('qr_token', token)
      .single()

    if (unitError || !data) {
      setAttendeeUnit(null)
      setError('Nie znaleziono uczestnika dla tego kodu QR.')
      setQrSearchLoading(false)
      qrSearchLoadingRef.current = false
      setTimeout(() => qrInputRef.current?.focus(), 0)
      return
    }

    await loadUnitDetails(data)
    setQrSearchLoading(false)
    qrSearchLoadingRef.current = false
    setTimeout(() => qrInputRef.current?.focus(), 0)
  }

  const handleSearchQr = async () => {
    await searchAttendeeByQrToken(qrInput)
    setTimeout(() => qrInputRef.current?.focus(), 0)
  }

  const showCopyMessage = (text: string) => {
    setCopyMessage(text)
    setTimeout(() => setCopyMessage(null), 2500)
  }

  const clearQrInput = () => {
    setQrInput('')
    setError(null)
    setMessage(null)
    setCopyMessage(null)
    setTimeout(() => qrInputRef.current?.focus(), 0)
  }

  const scanNext = () => {
    setQrInput('')
    setSearchedToken('')
    setAttendeeUnit(null)
    setApplication(null)
    setMealChoices([])
    setGadgetChoices([])
    setSessionSignups([])
    setTransportChoices([])
    setMealRedemptions([])
    setGadgetRedemptions([])
    setTransportCheckins([])
    setError(null)
    setMessage(null)
    setCopyMessage(null)
    setTimeout(() => qrInputRef.current?.focus(), 0)
  }

  const copyQrToken = async () => {
    if (!attendeeUnit?.qr_token) {
      setError('Brak tokena QR do skopiowania.')
      return
    }
    await navigator.clipboard.writeText(attendeeUnit.qr_token)
    showCopyMessage('QR token skopiowany.')
  }

  const pasteQrTokenFromClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      setError('Twoja przeglądarka nie pozwala odczytać schowka. Wklej kod ręcznie.')
      return
    }
    try {
      const text = await navigator.clipboard.readText()
      setQrInput(text.trim())
      showCopyMessage('Kod wklejony ze schowka.')
      setTimeout(() => qrInputRef.current?.focus(), 0)
    } catch {
      setError('Twoja przeglądarka nie pozwala odczytać schowka. Wklej kod ręcznie.')
    }
  }

  const handleScannedToken = async (rawToken: string) => {
    const token = String(rawToken || '').trim()
    if (!token || qrSearchLoadingRef.current) return

    const now = Date.now()
    const isCooldown = lastScannedRef.current.token === token && now - lastScannedRef.current.time < 2000
    if (isCooldown) return

    lastScannedRef.current = { token, time: now }
    setScannerStatus(`Kod zeskanowany. ${shortToken(token)}`)
    await searchAttendeeByQrToken(token)
  }

  const stopHtml5QrScanner = async () => {
    if (!html5QrCodeRef.current) return
    try { await html5QrCodeRef.current.stop() } catch (err) {}
    try { await html5QrCodeRef.current.clear() } catch (err) {}
    html5QrCodeRef.current = null
  }

  const stopQrScanner = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current)
      scanFrameRef.current = null
    }
    void stopHtml5QrScanner()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScannerActive(false)
    setScannerBackend(null)
    setScannerStatus(null)
  }

  const startHtml5QrScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      await stopHtml5QrScanner()

      const scanner = new Html5Qrcode(html5QrRegionIdRef.current)
      html5QrCodeRef.current = scanner
      setScannerActive(true)
      setScannerBackend('html5')
      setScannerStatus('Skaner aktywny. Skieruj kamerę na kod QR.')

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText: string) => { void handleScannedToken(decodedText) },
        () => {}
      )
    } catch (err: any) {
      console.warn('html5-qrcode fallback unavailable:', err?.message || err)
      await stopHtml5QrScanner()
      setScannerActive(false)
      setScannerBackend(null)
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
      setScannerError(denied ? 'Brak dostępu do kamery. Możesz wpisać kod QR ręcznie.' : 'Nie udało się uruchomić skanera QR na tym urządzeniu. Użyj skanera USB/Bluetooth albo wpisz kod ręcznie.')
    }
  }

  const startQrScanner = async () => {
    setScannerError(null)
    setScannerStatus(null)

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setScannerError('Ta przeglądarka nie obsługuje dostępu do kamery. Wpisz kod QR ręcznie.')
      return
    }

    const BarcodeDetectorCtor = (window as any).BarcodeDetector
    if (!BarcodeDetectorCtor) {
      setScannerStatus('Ta przeglądarka nie obsługuje natywnego skanowania QR. Uruchamiam tryb zgodny z iPhone/Safari...')
      await startHtml5QrScanner()
      return
    }

    try {
      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      })
      streamRef.current = stream
      setScannerActive(true)
      setScannerBackend('native')
      setScannerStatus('Skaner aktywny. Skieruj kamerę na kod QR.')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const scanLoop = async () => {
        const video = videoRef.current
        if (!video || !streamRef.current) return
        try {
          if (video.readyState >= 2 && !qrSearchLoadingRef.current) {
            const codes = await detector.detect(video)
            const token = codes?.[0]?.rawValue || codes?.[0]?.rawValue?.toString()
            if (token) await handleScannedToken(token)
          }
        } catch (scanError) {}
        scanFrameRef.current = requestAnimationFrame(scanLoop)
      }
      scanFrameRef.current = requestAnimationFrame(scanLoop)
    } catch (err: any) {
      console.warn('QR scanner unavailable:', err?.message || err)
      stopQrScanner()
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
      if (denied) {
        setScannerError('Brak dostępu do kamery. Możesz wpisać kod QR ręcznie.')
      } else {
        setScannerStatus('Natywny skaner nie wystartował. Próbuję trybu zgodnego z iPhone/Safari...')
        await startHtml5QrScanner()
      }
    }
  }

  const refreshCurrentUnit = async () => {
    if (!searchedToken || !staffAccess) return
    const { data } = await supabase
      .from('event_attendee_units')
      .select('*')
      .eq('event_id', staffAccess.event_id)
      .eq('qr_token', searchedToken)
      .single()

    if (data) await loadUnitDetails(data)
  }

  const handleEntryCheckIn = async () => {
    if (!attendeeUnit || !staffAccess || attendeeUnit.checked_in) return
    const action = 'entry_checkin'
    const payload = {
      checked_in: true,
      checked_in_at: new Date().toISOString()
    }
    setActionLoading(action)
    const { error: updateError } = await supabase.from('event_attendee_units').update(payload).eq('id', attendeeUnit.id)
    if (updateError) {
      logActionError(action, updateError, payload)
    } else {
      await insertScan(action)
      setMessage('Obecność / Wejście potwierdzone.')
      await refreshCurrentUnit()
    }
    setActionLoading(null)
  }

  const handleIssueWristband = async () => {
    if (!attendeeUnit || !staffAccess) return
    const action = 'wristband_issue'
    const wristbandCode = attendeeUnit.wristband_code || `BAND-${Date.now()}-${String(attendeeUnit.id).slice(0, 4)}`
    const payload = {
      wristband_code: wristbandCode,
      wristband_issued: true,
      wristband_issued_at: new Date().toISOString()
    }
    setActionLoading(action)
    const { error: updateError } = await supabase.from('event_attendee_units').update(payload).eq('id', attendeeUnit.id)
    if (updateError) {
      logActionError(action, updateError, payload)
    } else {
      await insertScan(action)
      setMessage('Opaska wydana.')
      await refreshCurrentUnit()
    }
    setActionLoading(null)
  }

  const handleReturnWristband = async () => {
    if (!attendeeUnit || !staffAccess) return
    const action = 'wristband_return'
    const payload = {
      wristband_returned: true,
      wristband_returned_at: new Date().toISOString()
    }
    setActionLoading(action)
    const { error: updateError } = await supabase.from('event_attendee_units').update(payload).eq('id', attendeeUnit.id)
    if (updateError) {
      logActionError(action, updateError, payload)
    } else {
      await insertScan(action)
      setMessage('Zwrot opaski zapisany.')
      await refreshCurrentUnit()
    }
    setActionLoading(null)
  }

  const handleRedeemGadget = async (choice: any) => {
    if (!attendeeUnit || !staffAccess) return
    const action = 'gadget_redemption'
    const payload = {
      event_id: staffAccess.event_id,
      application_id: attendeeUnit.application_id,
      attendee_unit_id: attendeeUnit.id,
      gadget_id: choice.gadget_id,
      redeemed_by: staffAccess.name,
      staff_role: staffAccess.role,
      notes: null
    }
    setActionLoading(`${action}-${choice.gadget_id}`)
    const { error: insertError } = await supabase.from('event_gadget_redemptions').insert([payload])
    if (insertError) {
      logActionError(action, insertError, payload)
    } else {
      setMessage('Gadżet wydany.')
      await refreshCurrentUnit()
    }
    setActionLoading(null)
  }

  const handleSessionCheckIn = async (choice: any) => {
    if (!attendeeUnit || !staffAccess || !choice.session_id) return

    const action = 'session_checkin'
    const loadingKey = `${action}-${choice.session_id}`
    const session = sessionById.get(choice.session_id)
    const nextStatus = 'checked_in'
    const payload = {
      status: nextStatus
    }

    setActionLoading(loadingKey)

    if (choice.id && !choice.source) {
      const { error: updateError } = await supabase
        .from('event_attendee_session_signups')
        .update(payload)
        .eq('id', choice.id)

      if (updateError) {
        logActionError(action, updateError, payload)
        setActionLoading(null)
        return
      }
    } else {
      const insertPayload = {
        event_id: staffAccess.event_id,
        application_id: attendeeUnit.application_id,
        attendee_unit_id: attendeeUnit.id,
        session_id: choice.session_id,
        status: nextStatus
      }

      const { error: insertError } = await supabase
        .from('event_attendee_session_signups')
        .insert([insertPayload])

      if (insertError) {
        logActionError(action, insertError, insertPayload)
        setActionLoading(null)
        return
      }
    }

    await insertScan(action, 'ok', `Session: ${session?.title || choice.session_id}`)
    setMessage('Obecność na warsztacie potwierdzona.')
    await refreshCurrentUnit()
    setActionLoading(null)
  }

  const logFallbackActionError = (action: string, error: any, payload: any) => {
    console.error('Staff pass fallback action error:', {
      action,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      payload
    })
    setError(`Nie udało się wykonać akcji: ${error?.message || 'Nieznany błąd'}`)
  }

  const navGroups = useMemo(() => {
    return [
      {
        title: 'Dostęp Operacyjny',
        items: [
          { tabId: 'overview', icon: BarChart3, label: 'Pulpit Startowy' },
          { tabId: 'qr', icon: QrCode, label: 'Skaner QR' }
        ].filter(item => canViewStaffModule(staffAccess, item.tabId))
      },
      {
        title: 'Bazy i Pacjenci',
        items: [
          { tabId: 'patients', icon: Users, label: 'Baza Pacjentów', count: patients.length },
          { tabId: 'appointments', icon: CalendarPlus, label: 'Harmonogram Wizyt', count: appointments.length },
          { tabId: 'documents', icon: FileSignature, label: 'Dokumenty (Zgody)', count: staffStats.pendingDocs, urgent: staffStats.pendingDocs > 0 },
          { tabId: 'messages', icon: MessageSquare, label: 'Wiadomości / Czat', count: staffStats.openMessages, urgent: staffStats.openMessages > 0 }
        ].filter(item => canViewStaffModule(staffAccess, item.tabId))
      },
      {
        title: 'Zarządzanie',
        items: [
          { tabId: 'analytics', icon: Stethoscope, label: 'Podgląd AI Analityki' }
        ].filter(item => canViewStaffModule(staffAccess, item.tabId))
      }
    ].filter(group => group.items.length > 0)
  }, [staffAccess, patients.length, appointments.length, staffStats])

  const TabButton = ({ tabId, icon: Icon, label, count, urgent }: any) => {
    const isActive = activeTab === tabId;
    return (
      <button
        onClick={() => setActiveTab(tabId)}
        className={`w-full min-w-0 ${isNavCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-3'} rounded-2xl text-left text-[11px] font-black transition-all flex items-center gap-3 border ${
          isActive
            ? (isDarkMode ? 'bg-cyan-200 text-[#071016] border-cyan-200 shadow-md scale-[1.02]' : 'bg-cyan-600 text-white border-cyan-600 shadow-md scale-[1.02]')
            : urgent && count && count > 0
              ? (isDarkMode ? 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/40' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100')
              : (isDarkMode ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900')
        }`}
      >
        <span className={`${isNavCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isActive
            ? (isDarkMode ? 'bg-[#071016]/10 text-[#071016]' : 'bg-white/20 text-white')
            : urgent && count && count > 0
              ? (isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600')
              : (isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500')
        }`}>
          <Icon size={16} />
        </span>
        <span className={`${isNavCollapsed ? 'hidden' : 'flex'} flex-1 min-w-0 truncate leading-tight`}>{label}</span>
        {!isNavCollapsed && count !== undefined && count > 0 && (
          <span className={`ml-auto shrink-0 px-2 py-1 rounded-full text-[10px] font-black tabular-nums text-center transition-colors ${
            isActive
              ? (isDarkMode ? 'bg-[#071016] text-cyan-200' : 'bg-white text-cyan-700')
              : urgent
                ? (isDarkMode ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-red-600 text-white animate-pulse')
                : (isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700')
          }`}>
            {count}
          </span>
        )}
      </button>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`rounded-[32px] border p-8 text-center shadow-sm ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
          <Clock size={48} className={`mx-auto mb-4 animate-spin ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`} />
          <p className="text-sm font-black uppercase tracking-widest">Ładowanie dostępu</p>
        </div>
      </div>
    )
  }

  if (error && !staffAccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`max-w-lg rounded-[32px] border p-8 text-center shadow-xl ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-white border-red-200'}`}>
          <XCircle className="mx-auto mb-4 text-red-500" size={42} />
          <h1 className="text-2xl font-black mb-2">Brak dostępu</h1>
          <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-slate-600'}`}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans pb-20 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style jsx global>{`
        input, button, select, textarea { font-family: inherit; }
      `}</style>

      {/* Tło globalne (motyw portalu) */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.12),transparent_28%)]`} />
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-0' : 'opacity-100'} bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.06),transparent_35%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.05),transparent_28%)]`} />

      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-500 ${isDarkMode ? 'border-white/10 bg-[#071016]/85' : 'border-slate-200 bg-white/80 shadow-sm'}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10' : 'border-cyan-200 bg-cyan-50'}`}>
              <ShieldCheck size={24} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-black leading-tight capitalize truncate max-w-[150px] sm:max-w-[300px] md:max-w-[500px]">
                {event?.title || 'ClinicOps'}
              </h1>
              <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 truncate transition-colors ${isDarkMode ? 'text-cyan-200/60' : 'text-cyan-700/60'}`}>
                Rola: {roleLabel(staffAccess?.role)} ({staffAccess?.name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={toggleDarkMode}
              className={`hidden sm:flex px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border transition-all hover:scale-105 shadow-sm ${
                isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {isDarkMode ? <Sun size={12}/> : <Moon size={12}/>}
              <span className="hidden lg:inline">{isDarkMode ? 'Jasny' : 'Ciemny'}</span>
            </button>
            <button
              onClick={() => { setStaffAccess(null); window.location.reload() }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border transition-all hover:scale-105 shadow-sm ${
                isDarkMode ? 'bg-red-900/20 border-red-800/50 text-red-400 hover:bg-red-900/40' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              <LogOut size={12}/> Wyjdź
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
          
          <aside className={`${isNavCollapsed ? 'lg:col-span-1 lg:w-[85px]' : 'lg:col-span-3'} lg:sticky lg:top-24 space-y-4 transition-all duration-300 z-20`}>
            <div className={`border rounded-[28px] backdrop-blur-xl transition-colors duration-300 ${isNavCollapsed ? 'p-2 shadow-sm' : 'p-4 shadow-sm'} ${isDarkMode ? 'bg-[#101a22]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
              <div className={`flex items-center justify-between ${isNavCollapsed ? 'mb-2' : 'mb-4'}`}>
                {!isNavCollapsed && (
                  <div className="min-w-0 pr-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Panel Obsługi</p>
                    <h2 className="text-lg font-black truncate mt-0.5">Personel</h2>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                  className={`${isNavCollapsed ? 'w-full' : 'ml-auto'} h-10 px-3 rounded-2xl transition-colors flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  {isNavCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </div>

              <div className={isNavCollapsed ? 'space-y-2' : 'space-y-3'}>
                {navGroups.map((group: any) => (
                  <section key={group.title}>
                    <button
                      type="button"
                      onClick={() => setOpenNavGroup(openNavGroup === group.title ? '' : group.title)}
                      className={`${isNavCollapsed ? 'hidden' : 'flex'} w-full items-center justify-between gap-3 mb-2 px-2 py-2 rounded-2xl transition-colors text-left ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      <div className="min-w-0">
                        <h3 className={`text-[9px] font-black uppercase tracking-widest truncate transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{group.title}</h3>
                      </div>
                      <ChevronDown size={14} className={`shrink-0 transition-transform ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} ${openNavGroup === group.title ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`${isNavCollapsed || openNavGroup === group.title ? 'grid' : 'hidden'} grid-cols-1 gap-2`}>
                      {group.items.map((item: any) => (
                        <TabButton key={item.tabId} {...item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </aside>

          <div className={`${isNavCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} transition-all duration-300`}>
            
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[24px] md:rounded-[32px] border shadow-sm p-5 md:p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-black flex items-center gap-3 text-lg md:text-xl">
                    <BarChart3 size={22} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} />
                    Przegląd Dnia (Dla roli: {roleLabel(staffAccess.role)})
                  </h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Dzisiejsze wizyty', value: staffStats.todayAppointments, icon: CalendarPlus, color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                    { label: 'Dokumenty (brak)', value: staffStats.pendingDocs, icon: FileSignature, color: isDarkMode ? 'text-amber-400' : 'text-amber-600' },
                    { label: 'Wiadomości', value: staffStats.openMessages, icon: MessageSquare, color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' },
                    { label: 'Nierozliczone', value: staffStats.unpaidValue, icon: Shield, color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600', isMoney: true },
                  ].map((item: any) => (
                    <div key={item.label} className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition-colors flex flex-col justify-between min-h-[110px] ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                      <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
                        <item.icon size={80} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <p className={`text-[9px] font-black uppercase tracking-widest leading-tight transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                          <item.icon size={14} className={item.color} />
                        </div>
                        <p className={`mt-3 text-2xl font-black tabular-nums tracking-tight truncate ${item.color}`}>
                          {item.isMoney ? formatMoney(item.value).split(' ')[0] : item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {workspaceLoading && (
                  <div className={`rounded-[28px] border p-6 text-sm font-bold transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10 text-white/55' : 'bg-white border-slate-200 text-slate-500'}`}>
                    Ładowanie danych panelu personelu...
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <StaffPanel isDarkMode={isDarkMode} title="Najbliższe wizyty" icon={<CalendarPlus size={18} />}>
                    {appointments.slice(0, 6).length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak zaplanowanych wizyt w widoku tej roli." /> : appointments.slice(0, 6).map((appointment: any) => {
                      const patient = patientById.get(appointment.patient_id)
                      return (
                        <ItemRow
                          isDarkMode={isDarkMode}
                          key={appointment.id}
                          title={appointment.treatment_name || appointment.title || 'Wizyta'}
                          subtitle={`${patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Pacjent'} | ${formatDateTime(appointment.appointment_date)}`}
                          status={appointment.payment_status === 'paid' ? 'Opłacona' : 'Do rozliczenia'}
                        />
                      )
                    })}
                  </StaffPanel>
                  <StaffPanel isDarkMode={isDarkMode} title="Sprawy od pacjentów" icon={<MessageSquare size={18} />}>
                    {portalRequests.slice(0, 6).length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak nowych wiadomości pacjentów." /> : portalRequests.slice(0, 6).map((request: any) => (
                      <ItemRow
                        isDarkMode={isDarkMode}
                        key={request.id}
                        title={request.subject || 'Wiadomość pacjenta'}
                        subtitle={request.message || request.request_type || 'Brak treści'}
                        status={request.status || 'new'}
                      />
                    ))}
                  </StaffPanel>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[32px] border p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-black flex items-center gap-2 text-lg mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Users size={20} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} /> Baza Pacjentów
                  </h4>
                  {patients.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak pacjentów dostępnych dla tej roli." /> : (
                    <div className="space-y-3">
                      {patients.slice(0, 30).map((patient: any) => (
                        <div key={patient.id} className={`rounded-2xl border p-4 flex justify-between items-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                          <div>
                            <p className="font-black text-sm">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className={`text-[10px] font-medium mt-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              PESEL: {patient.pesel || '-'} | Tel: {patient.phone || '-'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[32px] border p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-black flex items-center gap-2 text-lg mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <CalendarPlus size={20} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} /> Harmonogram Zabiegów
                  </h4>
                  {appointments.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak wizyt." /> : (
                    <div className="space-y-3">
                      {appointments.slice(0, 30).map((app: any) => {
                        const patient = patientById.get(app.patient_id);
                        return (
                          <div key={app.id} className={`rounded-2xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <div>
                              <p className="font-black text-sm">{app.treatment_name || 'Wizyta'}</p>
                              <p className={`text-[10px] font-bold mt-1 transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                {formatDateTime(app.appointment_date)} | {patient?.first_name} {patient?.last_name}
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-colors ${
                              app.payment_status === 'paid' 
                                ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                : (isDarkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')
                            }`}>
                              {app.payment_status === 'paid' ? 'Opłacona' : 'Brak płatności'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[32px] border p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-black flex items-center gap-2 text-lg mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <FileSignature size={20} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} /> Zgody Medyczne
                  </h4>
                  {patientConsents.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak dokumentów." /> : (
                    <div className="space-y-3">
                      {patientConsents.slice(0, 30).map((consent: any) => {
                        const patient = patientById.get(consent.patient_id);
                        const isSigned = String(consent.status || '').toLowerCase() === 'signed';
                        return (
                          <div key={consent.id} className={`rounded-2xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <div>
                              <p className="font-black text-sm">{consent.medical_consent_templates?.title || consent.title || 'Dokument'}</p>
                              <p className={`text-[10px] font-bold mt-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Pacjent: {patient?.first_name} {patient?.last_name}
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-colors ${
                              isSigned 
                                ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                : (isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200')
                            }`}>
                              {isSigned ? 'Podpisany' : 'Oczekuje na podpis'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[32px] border p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-black flex items-center gap-2 text-lg mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <MessageSquare size={20} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} /> Skrzynka Recepcji (Portal)
                  </h4>
                  {portalRequests.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak zgłoszeń pacjentów." /> : (
                    <div className="space-y-3">
                      {portalRequests.slice(0, 30).map((req: any) => {
                        const patient = patientById.get(req.patient_id);
                        return (
                          <div key={req.id} className={`rounded-2xl border p-4 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <p className={`text-[10px] font-black uppercase mb-1 transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{req.status}</p>
                            <p className="font-black text-sm">{req.subject || 'Brak tematu'}</p>
                            <p className={`text-xs mt-2 line-clamp-2 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{req.message}</p>
                            <p className={`text-[10px] font-bold mt-3 opacity-60 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Od: {patient?.first_name} {patient?.last_name}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <section className={`rounded-[32px] border p-5 md:p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-black flex items-center gap-2 text-lg mb-5 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <QrCode size={20} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} /> Identyfikacja Pacjenta (Check-in)
                  </h4>

                  <div className={`mb-5 flex flex-wrap gap-2 rounded-2xl border p-2 w-fit transition-colors ${isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                    {[
                      ['manual', 'Wpisz Ręcznie'],
                      ['camera', 'Skaner (Kamera)']
                    ].map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setScanMode(mode as 'manual' | 'camera')}
                        className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-colors ${
                          scanMode === mode 
                            ? (isDarkMode ? 'bg-cyan-200 text-[#071016]' : 'bg-cyan-600 text-white') 
                            : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white')
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                    Skanuj lub wpisz kod QR
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={qrInputRef}
                      value={qrInput}
                      onChange={event => setQrInput(event.target.value)}
                      onKeyDown={event => { if (event.key === 'Enter') handleSearchQr() }}
                      placeholder="Wklej qr_token"
                      className={`flex-1 rounded-2xl border px-4 py-4 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black/30 border-white/10 text-white focus:border-cyan-300' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'}`}
                    />
                    <button
                      type="button"
                      onClick={pasteQrTokenFromClipboard}
                      className={`rounded-2xl border px-4 py-4 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Wklej ze schowka
                    </button>
                    <button
                      type="button"
                      onClick={clearQrInput}
                      className={`rounded-2xl border px-4 py-4 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Wyczyść
                    </button>
                    <button
                      type="button"
                      onClick={handleSearchQr}
                      disabled={qrSearchLoading}
                      className={`rounded-2xl px-6 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#071016] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md'}`}
                    >
                      <Search size={18} /> {qrSearchLoading ? 'Szukam...' : 'Szukaj'}
                    </button>
                  </div>
                  <p className={`mt-3 text-xs transition-colors ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
                    Możesz zeskanować kod kamerą albo wkleić qr_token ręcznie.
                  </p>
                  <p className={`mt-2 text-xs transition-colors ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
                    Możesz użyć skanera USB/Bluetooth - działa jak klawiatura. Po zeskanowaniu kod zostanie automatycznie wyszukany.
                  </p>
                  <button
                    type="button"
                    onClick={clearQrInput}
                    className={`mt-3 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Wyczyść i skanuj następny
                  </button>

                  <div className={`mt-4 rounded-[28px] border p-4 transition-all ${scanMode === 'camera' ? (isDarkMode ? 'ring-1 ring-cyan-200/40' : 'ring-1 ring-cyan-600/40') : ''} ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>Kamera telefonu</p>
                        <p className={`text-[11px] mt-1 transition-colors ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>Otwórz ten link na telefonie obsługi i użyj kamery do skanowania QR. Jeśli kamera nie działa, wpisz kod ręcznie.</p>
                      </div>
                      <div className="flex gap-2">
                        {!scannerActive ? (
                          <button
                            type="button"
                            onClick={startQrScanner}
                            className={`rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase transition-colors sm:px-4 sm:py-2 ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            Włącz skaner
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopQrScanner}
                            className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20"
                          >
                            Zatrzymaj
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-black border-slate-800' : 'bg-black border-slate-200'} ${scannerActive && scannerBackend === 'native' ? 'block' : 'hidden'}`}>
                      <video ref={videoRef} className="aspect-square w-full object-cover sm:aspect-[4/3]" muted playsInline />
                    </div>
                    <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-black border-slate-800' : 'bg-black border-slate-200'} ${scannerActive && scannerBackend === 'html5' ? 'block' : 'hidden'}`}>
                      <div id={html5QrRegionIdRef.current} className="min-h-[280px] w-full text-white" />
                    </div>
                    
                    {scannerStatus && <p className={`mt-3 rounded-2xl border p-3 text-xs font-bold transition-colors ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{scannerStatus}</p>}
                    {scannerError && <p className={`mt-3 rounded-2xl border p-3 text-xs font-bold transition-colors ${isDarkMode ? 'bg-amber-900/20 border-amber-800/50 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>{scannerError}</p>}
                  </div>

                  {error && <p className={`mt-5 rounded-2xl border p-3 text-sm font-bold transition-colors ${isDarkMode ? 'bg-red-900/20 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>{error}</p>}
                  {message && <p className={`mt-5 rounded-2xl border p-3 text-sm font-bold transition-colors ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{message}</p>}
                  {copyMessage && <p className={`mt-5 rounded-2xl border p-3 text-sm font-bold transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>{copyMessage}</p>}
                </section>

                {attendeeUnit && (
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    <div className={`lg:col-span-1 rounded-[32px] border p-5 md:p-6 space-y-4 transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`flex items-start justify-between gap-3 border-b pb-4 mb-4 transition-colors ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest font-black transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Pacjent</p>
                          <h2 className="text-2xl font-black mt-1">{attendeeUnit.display_name}</h2>
                        </div>
                        <BadgeCheck className={`shrink-0 ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`} size={28} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>{attendeeUnit.unit_type}</span>
                        {attendeeUnit.unit_type === 'child' && <span className="rounded-full bg-blue-500/20 text-blue-100 px-3 py-1 text-[10px] font-black uppercase">Dziecko</span>}
                        {attendeeUnit.unit_type === 'companion' && <span className="rounded-full bg-purple-500/20 text-purple-100 px-3 py-1 text-[10px] font-black uppercase">Osoba towarzysząca</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <InfoBox isDarkMode={isDarkMode} label="Status" value={attendeeUnit.access_status || '-'} />
                        <InfoBox isDarkMode={isDarkMode} label="QR" value={shortToken(attendeeUnit.qr_token)} />
                        <InfoBox isDarkMode={isDarkMode} label="Wizyta" value={attendeeUnit.checked_in ? 'Potwierdzona' : 'Oczekuje'} />
                        <InfoBox isDarkMode={isDarkMode} label="Typ" value={attendeeUnit.ticket_type || attendeeUnit.unit_type || '-'} />
                      </div>

                      <div className={`rounded-2xl border p-4 transition-colors ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 transition-colors ${isDarkMode ? 'text-white/35' : 'text-slate-500'}`}>
                          QR token
                        </label>
                        <div className="flex flex-col gap-3">
                          <code className={`rounded-xl border px-3 py-3 text-[11px] break-all transition-colors ${isDarkMode ? 'bg-slate-950/70 border-white/10 text-white/80' : 'bg-white border-slate-200 text-slate-800'}`}>
                            {attendeeUnit.qr_token || 'Brak tokena'}
                          </code>
                          <button
                            type="button"
                            onClick={copyQrToken}
                            className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#071016] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                          >
                            Kopiuj token
                          </button>
                        </div>
                      </div>

                      <div className={`rounded-2xl border p-4 text-sm space-y-2 transition-colors ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        {canMedicalHistory ? (
                          <>
                            <p><span className={`transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Ryzyka / alergie:</span> {fallbackAllergies || 'brak'}</p>
                            <p><span className={`transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Uwagi medyczne:</span> {application?.extra_notes || attendeeUnit?.notes || 'brak'}</p>
                          </>
                        ) : (
                          <p className={`rounded-xl border p-3 text-xs font-bold transition-colors ${isDarkMode ? 'bg-cyan-300/10 border-cyan-300/20 text-cyan-50' : 'bg-cyan-50 border-cyan-200 text-cyan-800'}`}>
                            Historia medyczna ukryta dla tej roli.
                          </p>
                        )}
                        <p><span className={`transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Placówka/firma:</span> {application?.company_name || 'brak'}</p>
                        <p><span className={`transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Email:</span> {application?.email || 'brak'}</p>
                        <p><span className={`transition-colors ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Telefon:</span> {application?.phone || 'brak'}</p>
                      </div>

                      {(canEntry || canBandIssue || canBandReturn) && (
                        <div className="space-y-3">
                          {canEntry && (
                            <ActionButton
                              isDarkMode={isDarkMode}
                              disabled={attendeeUnit.checked_in || actionLoading === 'entry_checkin'}
                              onClick={handleEntryCheckIn}
                              label={attendeeUnit.checked_in ? 'Już zameldowany' : 'Zamelduj wejście'}
                              icon={<Ticket size={18} />}
                            />
                          )}
                          {canBandIssue && (
                            <ActionButton
                              isDarkMode={isDarkMode}
                              disabled={actionLoading === 'wristband_issue'}
                              onClick={handleIssueWristband}
                              label={attendeeUnit.wristband_issued ? 'Opaska wydana' : 'Wydaj opaskę'}
                              icon={<KeyRound size={18} />}
                            />
                          )}
                          {canBandReturn && (
                            <ActionButton
                              isDarkMode={isDarkMode}
                              disabled={attendeeUnit.wristband_returned || actionLoading === 'wristband_return'}
                              onClick={handleReturnWristband}
                              label={attendeeUnit.wristband_returned ? 'Opaska zwrócona' : 'Zwrot opaski'}
                              icon={<CheckCircle2 size={18} />}
                            />
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={scanNext}
                        className={`w-full rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-colors ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/15' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                      >
                        Skanuj następny
                      </button>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      {canGadget && (
                        <PassSection isDarkMode={isDarkMode} icon={<Gift size={18} />} title="Gadżety">
                          {gadgetChoices.length === 0 ? (
                            <EmptyState isDarkMode={isDarkMode} text="Brak wybranych gadżetów dla tej osoby." />
                          ) : gadgetChoices.map(choice => {
                            const gadget = gadgetById.get(choice.gadget_id)
                            const redeemed = gadgetRedemptions.find(item => item.gadget_id === choice.gadget_id)
                            return (
                              <ItemRow
                                isDarkMode={isDarkMode}
                                key={choice.id || choice.gadget_id}
                                title={choice.declined_gadget ? 'Uczestnik zrezygnował z gadżetu' : (gadget?.name || 'Gadżet')}
                                subtitle={`Rozmiar: ${choice.selected_size || '-'} | Ilość: ${choice.quantity || 1}`}
                                status={choice.declined_gadget ? 'Rezygnacja' : redeemed ? `Wydano ${formatDateTime(redeemed.redeemed_at)}` : 'Do wydania'}
                                action={!choice.declined_gadget && !redeemed ? (
                                  <SmallButton isDarkMode={isDarkMode} onClick={() => handleRedeemGadget(choice)} disabled={actionLoading === `gadget_redemption-${choice.gadget_id}`}>
                                    Wydaj gadżet
                                  </SmallButton>
                                ) : null}
                              />
                            )
                          })}
                        </PassSection>
                      )}

                      {canSessions && (
                        <PassSection isDarkMode={isDarkMode} icon={<Clock size={18} />} title="Wizyty / procedury">
                          {sessionSignups.length === 0 ? (
                            <EmptyState isDarkMode={isDarkMode} text="Brak zaplanowanych wizyt lub procedur." />
                          ) : sessionSignups.map(choice => {
                            const session = sessionById.get(choice.session_id)
                            const normalizedStatus = String(choice.status || '').toLowerCase()
                            const isSessionCheckedIn = ['checked_in', 'attended', 'obecny', 'potwierdzone'].includes(normalizedStatus)
                            return (
                              <ItemRow
                                isDarkMode={isDarkMode}
                                key={choice.id || choice.session_id}
                                title={session?.title || 'Wizyta / procedura'}
                                subtitle={[session?.location, session?.session_type, session?.start_time ? formatDateTime(session.start_time) : ''].filter(Boolean).join(' | ') || '-'}
                                status={isSessionCheckedIn ? 'Wizyta potwierdzona' : (choice.status || 'Zaplanowana')}
                                action={!isSessionCheckedIn ? (
                                  <SmallButton isDarkMode={isDarkMode} onClick={() => handleSessionCheckIn(choice)} disabled={actionLoading === `session_checkin-${choice.session_id}`}>
                                    Potwierdź wizytę
                                  </SmallButton>
                                ) : null}
                              />
                            )
                          })}
                        </PassSection>
                      )}

                      {canMedicalHistory && (
                        <PassSection isDarkMode={isDarkMode} icon={<ShieldCheck size={18} />} title="Historia medyczna i bezpieczeństwo">
                          <ItemRow
                            isDarkMode={isDarkMode}
                            title="Dane kliniczne widoczne dla lekarza"
                            subtitle={[
                              fallbackAllergies ? `Alergie/ryzyka: ${fallbackAllergies}` : '',
                              application?.extra_notes ? `Uwagi: ${application.extra_notes}` : '',
                              currentDiet ? `Preferencje/zalecenia: ${currentDiet}` : ''
                            ].filter(Boolean).join(' | ') || 'Brak dodatkowych danych w prototypie'}
                            status="Dostęp zgodny z rolą"
                          />
                        </PassSection>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* WIDOK: ANALITYKA AI */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-[32px] border p-8 shadow-sm text-center transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200'}`}>
                  <Stethoscope size={48} className={`mx-auto mb-4 transition-colors ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`} />
                  <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Analityka AI & Raporty</h3>
                  <p className={`text-sm max-w-lg mx-auto transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Moduł przeznaczony wyłącznie dla ról analitycznych i menedżerskich.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const InfoBox = ({ label, value, isDarkMode }: any) => (
  <div className={`rounded-2xl border p-3 transition-colors ${isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white/35' : 'text-slate-500'}`}>{label}</p>
    <p className={`mt-1 text-sm font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
  </div>
)

const StaffPanel = ({ icon, title, children, isDarkMode }: any) => (
  <section className={`rounded-[32px] border p-5 md:p-6 transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className={`flex min-w-0 items-center gap-2 text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <span className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}>{icon}</span>
        <span className="truncate">{title}</span>
      </h3>
      <span className={`rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'bg-white/[0.04] border-white/10 text-white/45' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        ClinicOps
      </span>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
)

const ActionButton = ({ label, icon, disabled, onClick, isDarkMode }: any) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full rounded-2xl px-4 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#071016] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
  >
    {icon}
    {label}
  </button>
)

const SmallButton = ({ children, disabled, onClick, isDarkMode }: any) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${isDarkMode ? 'bg-cyan-200 text-[#071016] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
  >
    {children}
  </button>
)

const PassSection = ({ icon, title, children, isDarkMode }: any) => (
  <section className={`rounded-[32px] border p-5 md:p-6 transition-colors ${isDarkMode ? 'bg-[#101a22]/75 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
    <h3 className={`flex items-center gap-2 text-lg font-black mb-4 transition-colors ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>
      {icon}
      {title}
    </h3>
    {children}
  </section>
)

const ItemRow = ({ title, subtitle, status, action, isDarkMode }: any) => {
  const normalizedStatus = String(status || '').toLowerCase()
  const statusClass = normalizedStatus.includes('wydano') || normalizedStatus.includes('odrzucony') || normalizedStatus.includes('do rozliczenia') || normalizedStatus.includes('do podpisu')
    ? (isDarkMode ? 'text-red-400' : 'text-red-600')
    : normalizedStatus.includes('potwierdzona') || normalizedStatus.includes('zameldowano') || normalizedStatus.includes('opłacona') || normalizedStatus.includes('podpisany')
      ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
      : (isDarkMode ? 'text-cyan-200' : 'text-cyan-600')

  return (
    <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 transition-colors ${isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      <div>
        <p className={`font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      {subtitle && <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>{subtitle}</p>}
        <p className={`text-[10px] font-black uppercase mt-2 ${statusClass}`}>{status}</p>
      </div>
      {action}
    </div>
  )
}

const EmptyState = ({ text, isDarkMode }: any) => (
  <div className={`rounded-2xl border p-5 text-sm text-center font-bold transition-colors ${isDarkMode ? 'bg-white/[0.04] border-white/10 text-white/45' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
    {text}
  </div>
)