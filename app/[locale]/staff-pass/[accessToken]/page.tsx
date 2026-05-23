'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createClient } from '../../../lib/supabase'
import {
  BadgeCheck,
  Bus,
  CheckCircle2,
  Clock,
  Gift,
  KeyRound,
  Search,
  ShieldCheck,
  Ticket,
  UtensilsCrossed,
  XCircle
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

export default function StaffPassPage({ params }: { params: StaffPassParams }) {
  const { accessToken } = use(params)
  const supabase = createClient()

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
  const currentDiet = attendeeUnit?.diet || application?.diet || ''
  const currentAllergies = attendeeUnit?.allergies || application?.allergies || ''
  const isChildUnit = attendeeUnit?.unit_type === 'child' || attendeeUnit?.age_group === 'child'
  const fallbackDiet = currentDiet || (isChildUnit ? 'dziecięce / standard' : 'Standard')
  const fallbackAllergies = currentAllergies || 'brak'

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
        setMessage('Wejście zameldowane.')
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
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center">
          <Clock className="mx-auto mb-4 text-[#e8ce7a]" />
          <p className="text-sm font-black uppercase tracking-widest">Ładowanie dostępu</p>
        </div>
      </main>
    )
  }

  if (error && !staffAccess) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-[32px] border border-red-400/30 bg-red-500/10 p-8 text-center">
          <XCircle className="mx-auto mb-4 text-red-300" size={42} />
          <h1 className="text-2xl font-black mb-2">Brak dostępu</h1>
          <p className="text-sm text-red-100">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style jsx global>{`
        input, button, select, textarea {
          font-family: inherit;
        }
      `}</style>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[#e8ce7a] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <ShieldCheck size={16} />
                Dostęp aktywny
              </div>
              <h1 className="text-2xl md:text-4xl font-black">{event?.title || 'QR Patient Access'}</h1>
              <p className="text-sm text-white/50 mt-2">{event?.location || ''}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 min-w-[220px]">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Rola skanująca</p>
              <p className="font-black text-lg">{staffAccess?.name}</p>
              <p className="text-xs text-[#e8ce7a] uppercase font-black">{roleLabel(staffAccess?.role)}</p>
              <p className="mt-2 text-[10px] font-bold text-white/45">
                {canMedicalHistory ? 'Dostęp do danych klinicznych' : 'Widok bez historii medycznej'}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5 md:p-6">
          <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
            {[
              ['manual', 'Skaner ręczny'],
              ['camera', 'Kamera telefonu']
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScanMode(mode as 'manual' | 'camera')}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-colors ${
                  scanMode === mode ? 'bg-[#e8ce7a] text-[#253a2a]' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
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
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold outline-none focus:border-[#e8ce7a]"
            />
            <button
              type="button"
              onClick={pasteQrTokenFromClipboard}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-[10px] font-black uppercase text-white"
            >
              Wklej ze schowka
            </button>
            <button
              type="button"
              onClick={clearQrInput}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-[10px] font-black uppercase text-white"
            >
              Wyczyść
            </button>
            <button
              type="button"
              onClick={handleSearchQr}
              disabled={qrSearchLoading}
              className="rounded-2xl bg-[#e8ce7a] px-6 py-4 text-sm font-black uppercase text-[#253a2a] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              {qrSearchLoading ? 'Szukam...' : 'Szukaj'}
            </button>
          </div>
          <p className="mt-3 text-xs text-white/45">
            Możesz zeskanować kod kamerą albo wkleić qr_token ręcznie.
          </p>
          <p className="mt-2 text-xs text-white/45">
            Możesz użyć skanera USB/Bluetooth - działa jak klawiatura. Po zeskanowaniu kod zostanie automatycznie wyszukany.
          </p>
          <button
            type="button"
            onClick={clearQrInput}
            className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase text-white"
          >
            Wyczyść i skanuj następny
          </button>

          <div className={`mt-4 rounded-[28px] border border-white/10 bg-black/20 p-4 ${scanMode === 'camera' ? 'ring-1 ring-[#e8ce7a]/40' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#e8ce7a]">Kamera telefonu</p>
                <p className="text-[11px] text-white/45 mt-1">Otwórz ten link na telefonie obsługi i użyj kamery do skanowania QR. Jeśli kamera nie działa, wpisz kod ręcznie.</p>
              </div>
              <div className="flex gap-2">
                {!scannerActive ? (
                  <button
                    type="button"
                    onClick={startQrScanner}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase text-white sm:px-4 sm:py-2"
                  >
                    Uruchom skaner QR
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopQrScanner}
                    className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase text-red-100"
                  >
                    Zatrzymaj skaner QR
                  </button>
                )}
              </div>
            </div>
            <div className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${scannerActive && scannerBackend === 'native' ? 'block' : 'hidden'}`}>
              <video ref={videoRef} className="aspect-square w-full object-cover sm:aspect-[4/3]" muted playsInline />
            </div>
            <div className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${scannerActive && scannerBackend === 'html5' ? 'block' : 'hidden'}`}>
              <div id={html5QrRegionIdRef.current} className="min-h-[280px] w-full text-white" />
            </div>
            {scannerStatus && <p className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">{scannerStatus}</p>}
            {scannerError && <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">{scannerError}</p>}
          </div>
          {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
          {message && <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</p>}
          {copyMessage && <p className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">{copyMessage}</p>}
        </section>

        {attendeeUnit && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-[32px] border border-white/10 bg-white/[0.06] p-5 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Pacjent</p>
                  <h2 className="text-2xl font-black mt-1">{attendeeUnit.display_name}</h2>
                </div>
                <BadgeCheck className="text-[#e8ce7a] shrink-0" />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase">{attendeeUnit.unit_type}</span>
                {attendeeUnit.unit_type === 'child' && <span className="rounded-full bg-blue-500/20 text-blue-100 px-3 py-1 text-[10px] font-black uppercase">Dziecko</span>}
                {attendeeUnit.unit_type === 'companion' && <span className="rounded-full bg-purple-500/20 text-purple-100 px-3 py-1 text-[10px] font-black uppercase">Osoba towarzysząca</span>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <InfoBox label="Status" value={attendeeUnit.access_status || '-'} />
                <InfoBox label="QR" value={shortToken(attendeeUnit.qr_token)} />
                <InfoBox label="Wizyta" value={attendeeUnit.checked_in ? 'Potwierdzona' : 'Oczekuje'} />
                <InfoBox label="Typ" value={attendeeUnit.ticket_type || attendeeUnit.unit_type || '-'} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/35 mb-2">
                  QR token
                </label>
                <div className="flex flex-col gap-3">
                  <code className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-[11px] text-white/80 break-all">
                    {attendeeUnit.qr_token || 'Brak tokena'}
                  </code>
                  <button
                    type="button"
                    onClick={copyQrToken}
                    className="rounded-xl bg-[#e8ce7a] px-4 py-3 text-[10px] font-black uppercase text-[#253a2a]"
                  >
                    Kopiuj token
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm space-y-2">
                {canMedicalHistory ? (
                  <>
                    <p><span className="text-white/40">Ryzyka / alergie:</span> {fallbackAllergies || 'brak'}</p>
                    <p><span className="text-white/40">Uwagi medyczne:</span> {application?.extra_notes || attendeeUnit?.notes || 'brak'}</p>
                  </>
                ) : (
                  <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs font-bold text-cyan-50">
                    Historia medyczna ukryta dla tej roli.
                  </p>
                )}
                <p><span className="text-white/40">Placówka/firma:</span> {application?.company_name || 'brak'}</p>
                <p><span className="text-white/40">Email:</span> {application?.email || 'brak'}</p>
                <p><span className="text-white/40">Telefon:</span> {application?.phone || 'brak'}</p>
              </div>

              {(canEntry || canBandIssue || canBandReturn) && (
                <div className="space-y-3">
                  {canEntry && (
                    <ActionButton
                      disabled={attendeeUnit.checked_in || actionLoading === 'entry_checkin'}
                      onClick={handleEntryCheckIn}
                      label={attendeeUnit.checked_in ? 'Już zameldowany' : 'Zamelduj wejście'}
                      icon={<Ticket size={18} />}
                    />
                  )}
                  {canBandIssue && (
                    <ActionButton
                      disabled={actionLoading === 'wristband_issue'}
                      onClick={handleIssueWristband}
                      label={attendeeUnit.wristband_issued ? 'Opaska wydana' : 'Wydaj opaskę'}
                      icon={<KeyRound size={18} />}
                    />
                  )}
                  {canBandReturn && (
                    <ActionButton
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
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-black uppercase text-white hover:bg-white/15"
              >
                Skanuj następny
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {canGadget && (
                <PassSection icon={<Gift size={18} />} title="Gadżety">
                  {gadgetChoices.length === 0 ? (
                    <EmptyState text="Brak wybranych gadżetów dla tej osoby." />
                  ) : gadgetChoices.map(choice => {
                    const gadget = gadgetById.get(choice.gadget_id)
                    const redeemed = gadgetRedemptions.find(item => item.gadget_id === choice.gadget_id)
                    return (
                      <ItemRow
                        key={choice.id || choice.gadget_id}
                        title={choice.declined_gadget ? 'Uczestnik zrezygnował z gadżetu' : (gadget?.name || 'Gadżet')}
                        subtitle={`Rozmiar: ${choice.selected_size || '-'} | Ilość: ${choice.quantity || 1}`}
                        status={choice.declined_gadget ? 'Rezygnacja' : redeemed ? `Wydano ${formatDateTime(redeemed.redeemed_at)}` : 'Do wydania'}
                        action={!choice.declined_gadget && !redeemed ? (
                          <SmallButton onClick={() => handleRedeemGadget(choice)} disabled={actionLoading === `gadget_redemption-${choice.gadget_id}`}>
                            Wydaj gadżet
                          </SmallButton>
                        ) : null}
                      />
                    )
                  })}
                </PassSection>
              )}

              {canSessions && (
                <PassSection icon={<Clock size={18} />} title="Wizyty / procedury">
                  {sessionSignups.length === 0 ? (
                    <EmptyState text="Brak zaplanowanych wizyt lub procedur." />
                  ) : sessionSignups.map(choice => {
                    const session = sessionById.get(choice.session_id)
                    const normalizedStatus = String(choice.status || '').toLowerCase()
                    const isSessionCheckedIn = ['checked_in', 'attended', 'obecny', 'potwierdzone'].includes(normalizedStatus)
                    return (
                      <ItemRow
                        key={choice.id || choice.session_id}
                        title={session?.title || 'Wizyta / procedura'}
                        subtitle={[session?.location, session?.session_type, session?.start_time ? formatDateTime(session.start_time) : ''].filter(Boolean).join(' | ') || '-'}
                        status={isSessionCheckedIn ? 'Wizyta potwierdzona' : (choice.status || 'Zaplanowana')}
                        action={!isSessionCheckedIn ? (
                          <SmallButton onClick={() => handleSessionCheckIn(choice)} disabled={actionLoading === `session_checkin-${choice.session_id}`}>
                            Potwierdź wizytę
                          </SmallButton>
                        ) : null}
                      />
                    )
                  })}
                </PassSection>
              )}

              {canMedicalHistory && (
                <PassSection icon={<ShieldCheck size={18} />} title="Historia medyczna i bezpieczeństwo">
                  <ItemRow
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

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
    <p className="text-[9px] font-black uppercase tracking-widest text-white/35">{label}</p>
    <p className="mt-1 text-sm font-black">{value}</p>
  </div>
)

const ActionButton = ({ label, icon, disabled, onClick }: { label: string; icon: ReactNode; disabled?: boolean; onClick: () => void }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="w-full rounded-2xl bg-[#e8ce7a] px-4 py-4 text-sm font-black uppercase text-[#253a2a] flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
  >
    {icon}
    {label}
  </button>
)

const SmallButton = ({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="rounded-xl bg-[#e8ce7a] px-4 py-2 text-[10px] font-black uppercase text-[#253a2a] disabled:opacity-45 disabled:cursor-not-allowed"
  >
    {children}
  </button>
)

const PassSection = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5 md:p-6">
    <h3 className="flex items-center gap-2 text-lg font-black mb-4 text-[#e8ce7a]">
      {icon}
      {title}
    </h3>
    {children}
  </section>
)

const ItemRow = ({ title, subtitle, status, action }: { title: string; subtitle?: string; status: string; action?: ReactNode }) => {
  const normalizedStatus = String(status || '').toLowerCase()
  const statusClass = normalizedStatus.includes('wydano')
    ? 'text-red-400'
    : normalizedStatus.includes('potwierdzona') || normalizedStatus.includes('zameldowano')
      ? 'text-emerald-300'
      : 'text-[#e8ce7a]'

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <div>
        <p className="font-black">{title}</p>
      {subtitle && <p className="text-xs text-white/45 mt-1">{subtitle}</p>}
        <p className={`text-[10px] font-black uppercase mt-2 ${statusClass}`}>{status}</p>
      </div>
      {action}
    </div>
  )
}

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/45">
    {text}
  </div>
)
