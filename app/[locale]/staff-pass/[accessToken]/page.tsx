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
  Moon,
  Sun,
  LogOut
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
  }, [accessToken])

  useEffect(() => {
    return () => {
      stopQrScanner()
    }
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
  }, [staffAccess])

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

    if (appRes.error) console.warn('Staff pass application load error:', appRes.error.message)
    if (gadgetChoiceRes.error) console.warn('Staff pass gadget choices load error:', gadgetChoiceRes.error.message)
    if (sessionRes.error) console.warn('Staff pass session signups load error:', sessionRes.error.message)
    if (gadgetRedemptionRes.error) console.warn('Staff pass gadget redemptions load error:', gadgetRedemptionRes.error.message)
    if (gadgetsRes.error) console.warn('Staff pass gadgets load error:', gadgetsRes.error.message)
    if (sessionsRes.error) console.warn('Staff pass sessions load error:', sessionsRes.error.message)

    const sourceData = typeof unit.source_data === 'string'
      ? (() => {
          try {
            return JSON.parse(unit.source_data)
          } catch {
            return {}
          }
        })()
      : (unit.source_data || {})
    const fallbackGadgetChoices = Array.isArray(sourceData?.selectedGadgetIds)
      ? sourceData.selectedGadgetIds
          .filter(Boolean)
          .map((gadgetId: string) => ({
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
      ? sourceData.selectedSessionIds
          .filter(Boolean)
          .map((sessionId: string) => ({
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
    try {
      await html5QrCodeRef.current.stop()
    } catch (err) {
      console.warn('html5-qrcode stop skipped:', err)
    }
    try {
      await html5QrCodeRef.current.clear()
    } catch (err) {
      console.warn('html5-qrcode clear skipped:', err)
    }
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
        (decodedText: string) => {
          void handleScannedToken(decodedText)
        },
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
        } catch (scanError) {
          console.warn('QR scan frame skipped:', scanError)
        }

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

  if (loading) {
    return (
      <main className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`rounded-[32px] border p-8 text-center ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm'}`}>
          <Clock className={`mx-auto mb-4 animate-spin ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`} size={48} />
          <p className="text-sm font-black uppercase tracking-widest">Ładowanie dostępu</p>
        </div>
      </main>
    )
  }

  if (error && !staffAccess) {
    return (
      <main className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`max-w-lg rounded-[32px] border p-8 text-center ${isDarkMode ? 'border-red-400/30 bg-red-500/10' : 'border-red-200 bg-red-50'}`}>
          <XCircle className="mx-auto mb-4 text-red-500" size={42} />
          <h1 className="text-2xl font-black mb-2">Brak dostępu</h1>
          <p className={`text-sm ${isDarkMode ? 'text-red-100' : 'text-red-800'}`}>{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style jsx global>{`
        input, button, select, textarea { font-family: inherit; }
      `}</style>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className={`rounded-[32px] border p-5 md:p-8 shadow-2xl transition-colors ${isDarkMode ? 'border-white/10 bg-[#101a22]/85' : 'border-slate-200 bg-white'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>
                <ShieldCheck size={16} />
                Dostęp aktywny
              </div>
              <h1 className="text-2xl md:text-4xl font-black">{event?.title || 'QR Patient Access'}</h1>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{event?.location || ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className={`p-3 rounded-2xl border transition-colors ${isDarkMode ? 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
              <div className={`rounded-2xl border p-4 min-w-[220px] transition-colors ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-[10px] uppercase tracking-widest font-black ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Rola skanująca</p>
                <p className="font-black text-lg">{staffAccess?.name}</p>
                <p className={`text-xs uppercase font-black ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>{roleLabel(staffAccess?.role)}</p>
                <p className={`mt-2 text-[10px] font-bold ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
                  {canMedicalHistory ? 'Dostęp do danych klinicznych' : 'Widok bez historii medycznej'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav className={`rounded-[28px] border p-2 shadow-xl transition-colors ${isDarkMode ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
            {staffModules.map((module: any) => (
              <button
                key={module.id}
                type="button"
                onClick={() => setActiveStaffModule(module.id)}
                className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-3 text-left transition-all ${
                  activeStaffModule === module.id
                    ? (isDarkMode ? 'bg-cyan-200 text-[#061216] shadow-lg' : 'bg-cyan-600 text-white shadow-lg')
                    : (isDarkMode ? 'bg-black/20 text-white hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <module.icon size={16} className="shrink-0" />
                  <span className="truncate text-[10px] font-black uppercase tracking-wider">{module.label}</span>
                </span>
                {typeof module.count === 'number' && (
                  <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-black ${activeStaffModule === module.id ? (isDarkMode ? 'bg-[#061216]/10' : 'bg-white/20') : (isDarkMode ? 'bg-white/10' : 'bg-slate-200')}`}>
                    {module.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {activeStaffModule !== 'qr' && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Dzisiejsze wizyty', value: staffStats.todayAppointments, icon: CalendarPlus },
                { label: 'Dokumenty do podpisu', value: staffStats.pendingDocs, icon: FileSignature },
                { label: 'Otwarte wiadomości', value: staffStats.openMessages, icon: MessageSquare },
                { label: 'Do pobrania', value: formatMoney(staffStats.unpaidValue), icon: Shield },
              ].map((item: any) => (
                <div key={item.label} className={`rounded-[24px] border p-4 transition-colors ${isDarkMode ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>{item.label}</p>
                    <item.icon size={16} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} />
                  </div>
                  <p className="mt-3 text-xl md:text-2xl font-black tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>

            {workspaceLoading && (
              <div className={`rounded-[28px] border p-6 text-sm font-bold transition-colors ${isDarkMode ? 'border-white/10 bg-white/[0.06] text-white/55' : 'border-slate-200 bg-white text-slate-500 shadow-sm'}`}>
                Ładowanie danych panelu personelu...
              </div>
            )}

            {activeStaffModule === 'overview' && (
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
            )}

            {activeStaffModule === 'patients' && (
              <StaffPanel isDarkMode={isDarkMode} title="Pacjenci" icon={<Users size={18} />}>
                {patients.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak pacjentów dostępnych dla tej roli." /> : patients.slice(0, 30).map((patient: any) => (
                  <ItemRow
                    isDarkMode={isDarkMode}
                    key={patient.id}
                    title={`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Pacjent'}
                    subtitle={[patient.pesel && `PESEL: ${patient.pesel}`, patient.phone && `Tel: ${patient.phone}`, patient.email].filter(Boolean).join(' | ')}
                    status={patient.status || 'aktywny'}
                  />
                ))}
              </StaffPanel>
            )}

            {activeStaffModule === 'appointments' && (
              <StaffPanel isDarkMode={isDarkMode} title="Wizyty i zabiegi" icon={<CalendarPlus size={18} />}>
                {appointments.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak wizyt w widoku tej roli." /> : appointments.slice(0, 40).map((appointment: any) => {
                  const patient = patientById.get(appointment.patient_id)
                  return (
                    <ItemRow
                      isDarkMode={isDarkMode}
                      key={appointment.id}
                      title={appointment.treatment_name || appointment.title || 'Wizyta'}
                      subtitle={`${patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Pacjent'} | ${formatDateTime(appointment.appointment_date)} | ${formatMoney(appointment.price_amount)}`}
                      status={appointment.status || appointment.payment_status || 'zaplanowana'}
                    />
                  )
                })}
              </StaffPanel>
            )}

            {activeStaffModule === 'documents' && (
              <StaffPanel isDarkMode={isDarkMode} title="Dokumenty pacjentów" icon={<FileSignature size={18} />}>
                {patientConsents.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak dokumentów w widoku tej roli." /> : patientConsents.slice(0, 40).map((consent: any) => {
                  const patient = patientById.get(consent.patient_id)
                  const template = consent.medical_consent_templates
                  return (
                    <ItemRow
                      isDarkMode={isDarkMode}
                      key={consent.id}
                      title={template?.title || consent.title || 'Dokument pacjenta'}
                      subtitle={`${patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Pacjent'} | ${template?.document_type || 'dokument'}`}
                      status={String(consent.status || '').toLowerCase() === 'signed' ? 'Podpisany' : 'Do podpisu'}
                    />
                  )
                })}
              </StaffPanel>
            )}

            {activeStaffModule === 'messages' && (
              <StaffPanel isDarkMode={isDarkMode} title="Wiadomości z portalu pacjenta" icon={<MessageSquare size={18} />}>
                {portalRequests.length === 0 ? <EmptyState isDarkMode={isDarkMode} text="Brak wiadomości pacjentów w tym widoku." /> : portalRequests.slice(0, 40).map((request: any) => {
                  const patient = patientById.get(request.patient_id)
                  const relatedMessages = portalMessages.filter((message: any) => message.request_id === request.id)
                  return (
                    <ItemRow
                      isDarkMode={isDarkMode}
                      key={request.id}
                      title={request.subject || 'Wiadomość pacjenta'}
                      subtitle={`${patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Pacjent'} | ${request.message || 'Brak treści'} | ${relatedMessages.length} odp.`}
                      status={request.status || 'new'}
                    />
                  )
                })}
              </StaffPanel>
            )}

            {activeStaffModule === 'analytics' && (
              <StaffPanel isDarkMode={isDarkMode} title="Podgląd zarządczy" icon={<BarChart3 size={18} />}>
                <ItemRow isDarkMode={isDarkMode} title="Pacjenci w bazie" subtitle="Widok dostępny tylko dla managera albo osoby z nadanym dostępem." status={`${patients.length}`} />
                <ItemRow isDarkMode={isDarkMode} title="Wartość do pobrania" subtitle="Suma nierozliczonych wizyt widocznych w panelu." status={formatMoney(staffStats.unpaidValue)} />
                <ItemRow isDarkMode={isDarkMode} title="Otwarte sprawy pacjentów" subtitle="Wiadomości i zgłoszenia wymagające reakcji." status={`${staffStats.openMessages}`} />
              </StaffPanel>
            )}
          </section>
        )}

        {activeStaffModule === 'qr' && (
        <section className={`rounded-[32px] border p-5 md:p-6 transition-colors ${isDarkMode ? 'border-white/10 bg-[#101a22]/75' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className={`mb-5 flex flex-wrap gap-2 rounded-2xl border p-2 transition-colors ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-100'}`}>
            {[
              ['manual', 'Skaner ręczny'],
              ['camera', 'Kamera telefonu']
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScanMode(mode as 'manual' | 'camera')}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-colors ${
                  scanMode === mode ? (isDarkMode ? 'bg-cyan-200 text-[#253a2a]' : 'bg-cyan-600 text-white') : (isDarkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white text-slate-600 hover:bg-slate-50')
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
            Skanuj lub wpisz kod QR
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={qrInputRef}
              value={qrInput}
              onChange={event => setQrInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') handleSearchQr()
              }}
              placeholder="Wklej qr_token"
              className={`flex-1 rounded-2xl border px-4 py-4 text-sm font-bold outline-none transition-all ${isDarkMode ? 'border-white/10 bg-black/30 text-white focus:border-cyan-200' : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-600'}`}
            />
            <button
              type="button"
              onClick={pasteQrTokenFromClipboard}
              className={`rounded-2xl border px-4 py-4 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Wklej ze schowka
            </button>
            <button
              type="button"
              onClick={clearQrInput}
              className={`rounded-2xl border px-4 py-4 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Wyczyść
            </button>
            <button
              type="button"
              onClick={handleSearchQr}
              disabled={qrSearchLoading}
              className={`rounded-2xl px-6 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#253a2a] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md'}`}
            >
              <Search size={18} />
              {qrSearchLoading ? 'Szukam...' : 'Szukaj'}
            </button>
          </div>
          <p className={`mt-3 text-xs ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
            Możesz zeskanować kod kamerą albo wkleić qr_token ręcznie.
          </p>
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
            Możesz użyć skanera USB/Bluetooth - działa jak klawiatura. Po zeskanowaniu kod zostanie automatycznie wyszukany.
          </p>
          <button
            type="button"
            onClick={clearQrInput}
            className={`mt-3 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Wyczyść i skanuj następny
          </button>

          <div className={`mt-4 rounded-[28px] border p-4 transition-all ${scanMode === 'camera' ? (isDarkMode ? 'ring-1 ring-cyan-200/40' : 'ring-1 ring-cyan-600/40') : ''} ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>Kamera telefonu</p>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>Otwórz ten link na telefonie obsługi i użyj kamery do skanowania QR. Jeśli kamera nie działa, wpisz kod ręcznie.</p>
              </div>
              <div className="flex gap-2">
                {!scannerActive ? (
                  <button
                    type="button"
                    onClick={startQrScanner}
                    className={`rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase transition-colors sm:px-4 sm:py-2 ${isDarkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                  >
                    Włącz skaner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopQrScanner}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20"
                  >
                    Zatrzymaj skaner QR
                  </button>
                )}
              </div>
            </div>
            <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-black' : 'border-slate-200 bg-black'} ${scannerActive && scannerBackend === 'native' ? 'block' : 'hidden'}`}>
              <video ref={videoRef} className="aspect-square w-full object-cover sm:aspect-[4/3]" muted playsInline />
            </div>
            <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-black' : 'border-slate-200 bg-black'} ${scannerActive && scannerBackend === 'html5' ? 'block' : 'hidden'}`}>
              <div id={html5QrRegionIdRef.current} className="min-h-[280px] w-full text-white" />
            </div>
            {scannerStatus && <p className={`mt-3 rounded-2xl border p-3 text-xs font-bold ${isDarkMode ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{scannerStatus}</p>}
            {scannerError && <p className={`mt-3 rounded-2xl border p-3 text-xs font-bold ${isDarkMode ? 'border-amber-400/30 bg-amber-500/10 text-amber-500' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{scannerError}</p>}
          </div>
          {error && <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${isDarkMode ? 'border-red-400/30 bg-red-500/10 text-red-400' : 'border-red-200 bg-red-50 text-red-700'}`}>{error}</p>}
          {message && <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${isDarkMode ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</p>}
          {copyMessage && <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${isDarkMode ? 'border-blue-400/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>{copyMessage}</p>}
        </section>
        )}

        {activeStaffModule === 'qr' && attendeeUnit && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-1 rounded-[32px] border p-5 md:p-6 space-y-4 transition-colors ${isDarkMode ? 'border-white/10 bg-[#101a22]/75' : 'border-slate-200 bg-white shadow-sm'}`}>
              <div className={`flex items-start justify-between gap-3 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest font-black ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Pacjent</p>
                  <h2 className="text-2xl font-black mt-1">{attendeeUnit.display_name}</h2>
                </div>
                <BadgeCheck className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} size={28} />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>{attendeeUnit.unit_type}</span>
                {attendeeUnit.unit_type === 'child' && <span className="rounded-full bg-blue-500/20 text-blue-100 px-3 py-1 text-[10px] font-black uppercase">Dziecko</span>}
                {attendeeUnit.unit_type === 'companion' && <span className="rounded-full bg-purple-500/20 text-purple-100 px-3 py-1 text-[10px] font-black uppercase">Osoba towarzysząca</span>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <InfoBox isDarkMode={isDarkMode} label="Status" value={attendeeUnit.access_status || '-'} />
                <InfoBox isDarkMode={isDarkMode} label="QR" value={shortToken(attendeeUnit.qr_token)} />
                <InfoBox isDarkMode={isDarkMode} label="Wizyta" value={attendeeUnit.checked_in ? 'Potwierdzona' : 'Oczekuje'} />
                <InfoBox isDarkMode={isDarkMode} label="Typ" value={attendeeUnit.ticket_type || attendeeUnit.unit_type || '-'} />
              </div>

              <div className={`rounded-2xl border p-4 transition-colors ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/35' : 'text-slate-500'}`}>
                  QR token
                </label>
                <div className="flex flex-col gap-3">
                  <code className={`rounded-xl border px-3 py-3 text-[11px] break-all transition-colors ${isDarkMode ? 'border-white/10 bg-slate-950/70 text-white/80' : 'border-slate-200 bg-white text-slate-800'}`}>
                    {attendeeUnit.qr_token || 'Brak tokena'}
                  </code>
                  <button
                    type="button"
                    onClick={copyQrToken}
                    className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#253a2a] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                  >
                    Kopiuj token
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 text-sm space-y-2 transition-colors ${isDarkMode ? 'border-white/10 bg-black/20 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                {canMedicalHistory ? (
                  <>
                    <p><span className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Ryzyka / alergie:</span> {fallbackAllergies || 'brak'}</p>
                    <p><span className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Uwagi medyczne:</span> {application?.extra_notes || attendeeUnit?.notes || 'brak'}</p>
                  </>
                ) : (
                  <p className={`rounded-xl border p-3 text-xs font-bold transition-colors ${isDarkMode ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-50' : 'border-cyan-200 bg-cyan-50 text-cyan-800'}`}>
                    Historia medyczna ukryta dla tej roli.
                  </p>
                )}
                <p><span className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Placówka/firma:</span> {application?.company_name || 'brak'}</p>
                <p><span className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Email:</span> {application?.email || 'brak'}</p>
                <p><span className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Telefon:</span> {application?.phone || 'brak'}</p>
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
                className={`w-full rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-colors ${isDarkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/15' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'}`}
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
    </main>
  )
}

// -----------------------------------------------------
// POMOCNICZE SUB-KOMPONENTY (Dostosowane do trybu)
// -----------------------------------------------------

const InfoBox = ({ label, value, isDarkMode }: any) => (
  <div className={`rounded-2xl border p-3 transition-colors ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/35' : 'text-slate-500'}`}>{label}</p>
    <p className={`mt-1 text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
  </div>
)

const StaffPanel = ({ icon, title, children, isDarkMode }: any) => (
  <section className={`rounded-[32px] border p-5 md:p-6 transition-colors ${isDarkMode ? 'border-white/10 bg-[#101a22]/75' : 'border-slate-200 bg-white shadow-sm'}`}>
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className={`flex min-w-0 items-center gap-2 text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <span className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}>{icon}</span>
        <span className="truncate">{title}</span>
      </h3>
      <span className={`rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'border-white/10 bg-black/20 text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
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
    className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-cyan-200 text-[#071016] hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
  >
    {children}
  </button>
)

const PassSection = ({ icon, title, children, isDarkMode }: any) => (
  <section className={`rounded-[32px] border p-5 md:p-6 transition-colors ${isDarkMode ? 'border-white/10 bg-[#101a22]/75' : 'border-slate-200 bg-white shadow-sm'}`}>
    <h3 className={`flex items-center gap-2 text-lg font-black mb-4 ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>
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
    <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 transition-colors ${isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
      <div>
        <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      {subtitle && <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>{subtitle}</p>}
        <p className={`text-[10px] font-black uppercase mt-2 ${statusClass}`}>{status}</p>
      </div>
      {action}
    </div>
  )
}

const EmptyState = ({ text, isDarkMode }: any) => (
  <div className={`rounded-2xl border p-5 text-sm text-center font-bold transition-colors ${isDarkMode ? 'border-white/10 bg-white/[0.04] text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
    {text}
  </div>
)