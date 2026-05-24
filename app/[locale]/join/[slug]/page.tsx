'use client'

import { useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  HeartPulse,
  LogOut,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Info,
  Megaphone,
  User,
  X,
  Moon,
  Sun,
  Copy,
  Printer,
  ExternalLink
} from 'lucide-react'
import { createClient } from '../../../lib/supabase'

const normalizePesel = (value: string) => value.replace(/\D/g, '')

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Termin do ustalenia'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
}

const getCategoryBadge = (category: string) => {
  const cat = String(category).toLowerCase();
  if (cat.includes('promocja')) return { label: 'Promocja', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-300' };
  if (cat.includes('zalecenia')) return { label: 'Ważne zalecenia', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300' };
  if (cat.includes('faq') || cat.includes('ważne') || cat.includes('alert')) return { label: 'Ważna informacja', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300' };
  if (cat.includes('lekarze')) return { label: 'Nasz Zespół', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-300' };
  return { label: 'Aktualność', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-300' };
}

export default function PatientPortal() {
  const supabase = useMemo(() => createClient(), [])

  // STAN: Motyw
  const [isDarkMode, setIsDarkMode] = useState(true) // Domyślnie ciemny, jak w pierwowzorze

  // STAN: Dane
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginPesel, setLoginPesel] = useState('')
  const [loginError, setLoginError] = useState('')
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'start' | 'dokumenty' | 'wizyty' | 'kontakt'>('start')
  
  const [consents, setConsents] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [portalRequests, setPortalRequests] = useState<any[]>([])
  const [portalMessages, setPortalMessages] = useState<any[]>([])
  const [personalAnnouncements, setPersonalAnnouncements] = useState<any[]>([])
  const [globalAnnouncements, setGlobalAnnouncements] = useState<any[]>([])
  
  const [selectedConsentToSign, setSelectedConsentToSign] = useState<any>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})
  const [requestForm, setRequestForm] = useState({ type: 'post_treatment_question', subject: '', message: '' })
  const [requestSuccess, setRequestSuccess] = useState('')

  const pendingConsents = consents.filter((consent: any) => String(consent.status || '').toLowerCase() !== 'signed')
  const signedConsents = consents.filter((consent: any) => String(consent.status || '').toLowerCase() === 'signed')
  const upcomingAppointments = appointments
    .filter((appointment: any) => appointment.appointment_date && new Date(appointment.appointment_date).getTime() >= Date.now() - 12 * 60 * 60 * 1000)
    .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
  const nextAppointment = upcomingAppointments[0] || null

  const getConsentTitle = (consent: any) =>
    consent?.medical_consent_templates?.title || consent?.title || `Dokument #${String(consent?.id || '').slice(0, 5)}`

  const getConsentTypeLabel = (consent: any) => {
    const type = consent?.medical_consent_templates?.document_type || consent?.document_type || 'consent'
    if (type === 'questionnaire') return 'Wywiad medyczny'
    if (type === 'rodo') return 'RODO'
    if (type === 'info') return 'Zalecenia / informacja'
    return 'Zgoda zabiegowa'
  }

  const getConsentContent = (consent: any) =>
    consent?.medical_consent_templates?.content_template || consent?.content_template || ''

  // EFEKTY I POBIERANIE DANYCH
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('anm-patient-theme') : null
    if (storedTheme === 'light') setIsDarkMode(false)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev
      if (typeof window !== 'undefined') localStorage.setItem('anm-patient-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const loadConsentsForPatient = async (patientId: string) => {
    const joined = await supabase.from('patient_consents').select('*, medical_consent_templates(*)').eq('patient_id', patientId).order('created_at', { ascending: false })
    if (!joined.error) return joined.data || []
    const plain = await supabase.from('patient_consents').select('*').eq('patient_id', patientId).order('created_at', { ascending: false })
    if (plain.error) throw plain.error
    return plain.data || []
  }

  const loadAppointmentsForPatient = async (patientId: string) => {
    const result = await supabase.from('appointments').select('*').eq('patient_id', patientId).order('appointment_date', { ascending: true })
    return result.error ? [] : (result.data || [])
  }

  const loadRequestsForPatient = async (patientId: string) => {
    const result = await supabase.from('patient_portal_requests').select('*').eq('patient_id', patientId).order('created_at', { ascending: false })
    return result.error ? [] : (result.data || [])
  }

  const loadMessagesForPatient = async (patientId: string) => {
    const result = await supabase.from('patient_portal_messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: true })
    return result.error ? [] : (result.data || [])
  }

  const loadPatientDirectly = async (normalizedPesel: string) => {
    const exact = await supabase.from('patients').select('*').eq('pesel', normalizedPesel).limit(1)
    if (exact.error) throw exact.error

    let foundPatient = exact.data?.[0] || null

    if (!foundPatient) {
      const allPatients = await supabase.from('patients').select('*').limit(500)
      if (allPatients.error) throw allPatients.error
      foundPatient = (allPatients.data || []).find((row: any) => normalizePesel(String(row.pesel || '')) === normalizedPesel)
    }

    if (!foundPatient) return null

    const [patientConsents, patientAppointments, patientRequests, patientMessages, personalAnns, globalAnns] = await Promise.all([
      loadConsentsForPatient(foundPatient.id),
      loadAppointmentsForPatient(foundPatient.id),
      loadRequestsForPatient(foundPatient.id),
      loadMessagesForPatient(foundPatient.id),
      supabase.from('personal_announcements').select('*').eq('patient_id', foundPatient.id).order('created_at', { ascending: false }),
      supabase.from('global_announcements').select('*').order('created_at', { ascending: false })
    ])

    return { 
      patient: foundPatient, 
      consents: patientConsents, 
      appointments: patientAppointments, 
      requests: patientRequests, 
      messages: patientMessages,
      personalAnnouncements: personalAnns.data || [],
      globalAnnouncements: globalAnns.data || []
    }
  }

  const refreshPortal = async () => {
    const normalizedPesel = normalizePesel(loginPesel)
    if (!normalizedPesel || !patient?.id) return
    const refreshed = await loadPatientDirectly(normalizedPesel)
    if (!refreshed?.patient) return
    setPatient(refreshed.patient)
    setConsents(refreshed.consents)
    setAppointments(refreshed.appointments)
    setPortalRequests(refreshed.requests)
    setPortalMessages(refreshed.messages)
    setPersonalAnnouncements(refreshed.personalAnnouncements)
    setGlobalAnnouncements(refreshed.globalAnnouncements)
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setLoginError('')

    try {
      const normalizedPesel = normalizePesel(loginPesel)
      if (normalizedPesel.length !== 11) {
        setLoginError('PESEL powinien mieć 11 cyfr.')
        return
      }

      const portalData = await loadPatientDirectly(normalizedPesel)
      if (!portalData?.patient) {
        setLoginError('Nie znaleziono pacjenta w bazie. Sprawdź PESEL.')
        return
      }

      setPatient(portalData.patient)
      setConsents(portalData.consents)
      setAppointments(portalData.appointments)
      setPortalRequests(portalData.requests)
      setPortalMessages(portalData.messages)
      setPersonalAnnouncements(portalData.personalAnnouncements)
      setGlobalAnnouncements(portalData.globalAnnouncements)
      setIsLoggedIn(true)
    } catch (err: any) {
      setLoginError('Nie udało się połączyć z portalem: ' + (err?.message || 'błąd'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPatient(null)
    setLoginPesel('')
    setConsents([])
    setAppointments([])
    setPortalRequests([])
    setPortalMessages([])
    setPersonalAnnouncements([])
    setGlobalAnnouncements([])
    setRequestSuccess('')
  }

  const openSignModal = (consent: any) => {
    setSelectedConsentToSign(consent)
    setFormAnswers({})
  }

  const handleSignConsent = async () => {
    if (!selectedConsentToSign || !patient?.id) return
    setIsSigning(true)
    setLoginError('')

    const payload = {
      status: 'signed',
      signed_at: new Date().toISOString(),
      answers: formAnswers,
    }

    try {
      const update = await supabase.from('patient_consents').update(payload).eq('id', selectedConsentToSign.id).eq('patient_id', patient.id)
      if (update.error) {
        const fallback = await supabase.from('patient_consents').update({ status: 'signed', signed_at: payload.signed_at }).eq('id', selectedConsentToSign.id).eq('patient_id', patient.id)
        if (fallback.error) throw fallback.error
      }
      setSelectedConsentToSign(null)
      await refreshPortal()
    } catch (err: any) {
      setLoginError('Nie udało się zapisać dokumentu: ' + (err?.message || 'błąd'))
    } finally {
      setIsSigning(false)
    }
  }

  const handleSubmitRequest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!patient?.id || !requestForm.message.trim()) {
      setRequestSuccess('Uzupełnij treść wiadomości.')
      return
    }

    const insert = await supabase.from('patient_portal_requests').insert([{
      patient_id: patient.id,
      request_type: requestForm.type,
      subject: requestForm.subject || (requestForm.type === 'appointment_request' ? 'Prośba o wizytę' : 'Pytanie pacjenta'),
      message: requestForm.message,
      status: 'new',
    }]).select('id').single()

    if (insert.error) {
      setRequestSuccess('Nie udało się wysłać zgłoszenia: ' + insert.error.message)
      return
    }

    await supabase.from('patient_portal_messages').insert([{
      request_id: insert.data?.id,
      patient_id: patient.id,
      sender_type: 'patient',
      sender_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Pacjent',
      body: requestForm.message,
    }])

    setRequestForm({ type: 'post_treatment_question', subject: '', message: '' })
    setRequestSuccess('Wiadomość trafiła do recepcji. Odpowiemy możliwie szybko.')
    await refreshPortal()
  }

  const renderInteractiveContent = (text: string) => {
    if (!text) return <p>Ten dokument nie ma jeszcze treści. Możesz go potwierdzić po rozmowie z recepcją.</p>

    const parts = text.split(/(\[\s*\]|_{3,})/)
    let checkboxIndex = 0
    let textIndex = 0

    return parts.map((part, index) => {
      if (part.match(/\[\s*\]/)) {
        const fieldId = `checkbox_${checkboxIndex++}`
        return (
          <input
            key={index}
            type="checkbox"
            className={`mx-2 h-5 w-5 translate-y-1 rounded border-slate-300 accent-cyan-500 ${isDarkMode ? 'border-white/20 bg-white/5 accent-cyan-300' : 'bg-slate-50'}`}
            checked={!!formAnswers[fieldId]}
            onChange={(event) => setFormAnswers(prev => ({ ...prev, [fieldId]: event.target.checked }))}
          />
        )
      }

      if (part.match(/_{3,}/)) {
        const fieldId = `textinput_${textIndex++}`
        return (
          <input
            key={index}
            type="text"
            placeholder="wpisz..."
            className={`mx-2 min-w-[140px] border-b bg-transparent px-1 text-center outline-none ${isDarkMode ? 'border-white/30 text-cyan-100 focus:border-cyan-300' : 'border-slate-300 text-cyan-800 focus:border-cyan-600'}`}
            value={formAnswers[fieldId] || ''}
            onChange={(event) => setFormAnswers(prev => ({ ...prev, [fieldId]: event.target.value }))}
          />
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  // EKRAN LOGOWANIA
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.14),transparent_32%)]' : 'bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.06),transparent_32%)]'}`} />
        
        <button onClick={toggleTheme} className={`absolute top-6 right-6 z-20 p-3 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300'}`}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative w-full max-w-md rounded-[36px] border p-8 backdrop-blur-xl transition-colors duration-500 ${isDarkMode ? 'border-white/10 bg-[#101a22]/85 shadow-[0_28px_80px_rgba(0,0,0,0.45)]' : 'border-slate-200 bg-white/90 shadow-2xl'}`}
        >
          <div className="text-center mb-8">
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border ${isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10' : 'border-cyan-200 bg-cyan-50'}`}>
              <HeartPulse size={32} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Portal Pacjenta</h1>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dokumenty, wizyty i kontakt z kliniką w jednym miejscu.</p>
          </div>

          <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Weryfikacja PESEL
          </label>
          <input
            type="password"
            required
            inputMode="numeric"
            placeholder="Wpisz PESEL pacjenta"
            value={loginPesel}
            onChange={event => setLoginPesel(event.target.value)}
            className={`w-full rounded-2xl border px-5 py-4 font-bold outline-none transition ${isDarkMode ? 'border-white/10 bg-white/[0.04] text-white focus:border-cyan-300/60 focus:bg-white/[0.07]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500 focus:bg-white'}`}
          />

          {loginError && <p className="mt-4 text-center text-sm font-bold text-red-500">{loginError}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${isDarkMode ? 'bg-cyan-200 text-[#071016] shadow-[0_16px_36px_rgba(103,232,249,0.18)]' : 'bg-cyan-600 text-white shadow-xl hover:bg-cyan-700'}`}
          >
            {loading ? 'Weryfikacja...' : 'Wejdź do portalu'}
          </button>
        </motion.form>
      </div>
    )
  }

  const tabs = [
    { id: 'start', label: 'Start', icon: Sparkles },
    { id: 'dokumenty', label: 'Dokumenty', icon: FileSignature, count: pendingConsents.length },
    { id: 'wizyty', label: 'Wizyty', icon: Calendar },
    { id: 'kontakt', label: 'Zapytaj klinikę', icon: MessageSquare },
  ] as const

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#071016] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.12),transparent_28%)]' : 'bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.06),transparent_35%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.05),transparent_28%)]'}`} />

      {/* HEADER Z TRYBEM CIEMNYM */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-[#071016]/85' : 'border-slate-200 bg-white/80 shadow-sm'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10' : 'border-cyan-200 bg-cyan-50'}`}>
              <HeartPulse size={24} className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Portal Pacjenta</p>
              <h2 className="text-lg font-black leading-none">{patient?.first_name} {patient?.last_name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-2xl border p-3 transition ${isDarkMode ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className={`rounded-2xl border p-3 transition ${isDarkMode ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">

        {/* TABLICA OGŁOSZEŃ (WIDOCZNA TYLKO W ZAKŁADCE START) */}
        {(personalAnnouncements.length > 0 || globalAnnouncements.length > 0) && activeTab === 'start' && (
          <section className="mb-8 space-y-6">
            
            {personalAnnouncements.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  <User size={16} /> Ważne informacje dla Ciebie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalAnnouncements.map((ann: any) => {
                    const badge = getCategoryBadge(ann.category);
                    return (
                      <div key={ann.id} className={`relative overflow-hidden rounded-[24px] border flex flex-col ${isDarkMode ? 'border-cyan-500/30 bg-[#101a22]/90 shadow-[0_8px_30px_rgba(34,211,238,0.1)]' : 'border-cyan-200 bg-white shadow-lg'}`}>
                        {ann.image_url && (
                          <div className={`h-32 w-full shrink-0 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                            <img src={ann.image_url} alt="Ogłoszenie" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-3">
                            <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <h4 className={`text-base font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: ann.font_family || 'Inter, sans-serif' }}>
                            {ann.title}
                          </h4>
                          {ann.description && (
                            <p className={`text-xs font-medium leading-relaxed flex-1 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontFamily: ann.font_family || 'Inter, sans-serif' }}>
                              {ann.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {globalAnnouncements.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Megaphone size={16} /> Aktualności z naszej kliniki
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {globalAnnouncements.map((ann: any) => {
                    const badge = getCategoryBadge(ann.category);
                    return (
                      <div key={ann.id} className={`relative overflow-hidden rounded-[24px] border flex flex-col ${isDarkMode ? 'border-white/10 bg-[#101a22]/60' : 'border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow'}`}>
                        {ann.image_url && (
                          <div className={`h-32 w-full shrink-0 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                            <img src={ann.image_url} alt="Ogłoszenie" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <h4 className={`text-sm font-black mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: ann.font_family || 'Inter, sans-serif' }}>
                            {ann.title}
                          </h4>
                          {ann.description && (
                            <p className={`text-[11px] font-medium leading-relaxed flex-1 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: ann.font_family || 'Inter, sans-serif' }}>
                              {ann.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className={`lg:col-span-2 rounded-[34px] border p-6 md:p-8 ${isDarkMode ? 'border-white/10 bg-[#101a22]/75 shadow-[0_24px_70px_rgba(0,0,0,0.22)]' : 'border-slate-200 bg-white shadow-xl'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isDarkMode ? 'text-cyan-200' : 'text-cyan-700'}`}>Twoja ścieżka opieki</p>
            <h1 className={`mt-3 text-3xl font-black tracking-tight md:text-5xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dzień dobry, {patient?.first_name || 'Pacjencie'}.</h1>
            <p className={`mt-4 max-w-2xl text-sm font-medium leading-7 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Tutaj podpiszesz dokumenty przed wizytą, sprawdzisz najbliższy termin i wyślesz pytanie do zespołu kliniki.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Do podpisu', pendingConsents.length],
                ['Potwierdzone', signedConsents.length],
                ['Wizyty', appointments.length],
                ['PESEL', patient?.pesel ? 'OK' : 'brak'],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                  <p className={`mt-1 text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[34px] border p-6 md:p-7 ${isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10' : 'border-cyan-200 bg-cyan-50 shadow-md'}`}>
            <div className="flex items-center gap-3">
              <Clock className={isDarkMode ? 'text-cyan-200' : 'text-cyan-600'} size={22} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-100' : 'text-cyan-800'}`}>Najbliższa wizyta</p>
            </div>
            {nextAppointment ? (
              <div className="mt-5">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{nextAppointment.treatment_name || 'Wizyta w klinice'}</h3>
                <p className={`mt-2 text-sm font-bold ${isDarkMode ? 'text-cyan-100' : 'text-cyan-700'}`}>{formatDateTime(nextAppointment.appointment_date)}</p>
                <p className={`mt-4 text-xs leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Przyjdź kilka minut wcześniej. Dokumenty do podpisu zobaczysz w zakładce Dokumenty.</p>
              </div>
            ) : (
              <div className="mt-5">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Brak nadchodzącej wizyty</h3>
                <p className={`mt-3 text-xs leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Możesz poprosić recepcję o konsultację lub nowy termin w zakładce kontaktu.</p>
              </div>
            )}
          </div>
        </section>

        <nav className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {tabs.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
                  isActive 
                    ? (isDarkMode ? 'border-cyan-200 bg-cyan-200 text-[#071016]' : 'border-cyan-600 bg-cyan-600 text-white shadow-md')
                    : (isDarkMode ? 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white' : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm')
                }`}
              >
                <Icon size={15} />
                {item.label}
                {'count' in item && item.count > 0 && (
                  <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${isDarkMode ? 'bg-red-500' : 'bg-red-600 shadow-sm'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'start' && (
            <motion.section key="start" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <InfoCard isDarkMode={isDarkMode} icon={FileSignature} title="Dokumenty przed wizytą" text={pendingConsents.length ? `Masz ${pendingConsents.length} dokumentów do podpisu.` : 'Nie masz zaległych dokumentów.'} accent="red" />
              <InfoCard isDarkMode={isDarkMode} icon={Calendar} title="Wizyty i konsultacje" text={nextAppointment ? formatDateTime(nextAppointment.appointment_date) : 'Poproś o termin w panelu kontaktu.'} accent="cyan" />
              <InfoCard isDarkMode={isDarkMode} icon={MessageSquare} title="Kontakt po zabiegu" text="Wyślij pytanie kontrolne do recepcji bez dzwonienia." accent="emerald" />
            </motion.section>
          )}

          {activeTab === 'dokumenty' && (
            <motion.section key="dokumenty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              <Panel isDarkMode={isDarkMode} title="Do podpisu" subtitle="Dokumenty wymagające Twojej akceptacji przed wizytą." badge={`${pendingConsents.length} oczekuje`}>
                {pendingConsents.length === 0 ? (
                  <EmptyState isDarkMode={isDarkMode} icon={CheckCircle2} title="Wszystko podpisane" text="Na ten moment nie masz dokumentów oczekujących na akceptację." />
                ) : pendingConsents.map(consent => (
                  <DocumentRow isDarkMode={isDarkMode} key={consent.id} consent={consent} typeLabel={getConsentTypeLabel(consent)} title={getConsentTitle(consent)} pending onClick={() => openSignModal(consent)} />
                ))}
              </Panel>

              <Panel isDarkMode={isDarkMode} title="Potwierdzone dokumenty" subtitle="Archiwum zaakceptowanych dokumentów i skanów.">
                {signedConsents.length === 0 ? (
                  <EmptyState isDarkMode={isDarkMode} icon={FileText} title="Brak historii" text="Podpisane dokumenty pojawią się tutaj po akceptacji." />
                ) : signedConsents.map(consent => (
                  <DocumentRow isDarkMode={isDarkMode} key={consent.id} consent={consent} typeLabel={getConsentTypeLabel(consent)} title={getConsentTitle(consent)} pending={false} date={formatDateTime(consent.signed_at || consent.created_at)} />
                ))}
              </Panel>
            </motion.section>
          )}

          {activeTab === 'wizyty' && (
            <motion.section key="wizyty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              <Panel isDarkMode={isDarkMode} title="Twoje wizyty" subtitle="Najbliższe terminy, status płatności i historia zaplanowanych zabiegów.">
                {appointments.length === 0 ? (
                  <EmptyState isDarkMode={isDarkMode} icon={Calendar} title="Brak wizyt" text="Wyślij prośbę o konsultację lub nowy termin w zakładce kontaktu." />
                ) : appointments.map(appointment => (
                  <div key={appointment.id} className={`rounded-3xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white shadow-sm'}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>{appointment.status || 'zaplanowana'}</p>
                        <h3 className={`mt-1 text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{appointment.treatment_name || 'Wizyta w klinice'}</h3>
                        <p className={`mt-2 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{formatDateTime(appointment.appointment_date)}</p>
                      </div>
                      <div className={`rounded-2xl border px-4 py-3 text-sm font-black ${isDarkMode ? 'border-white/10 bg-[#071016]/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                        {appointment.price_amount ? `${Number(appointment.price_amount).toLocaleString('pl-PL')} ${appointment.currency || 'PLN'}` : 'Cena wg ustaleń'}
                      </div>
                    </div>
                  </div>
                ))}
              </Panel>
            </motion.section>
          )}

          {activeTab === 'kontakt' && (
            <motion.section key="kontakt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Panel isDarkMode={isDarkMode} title="Zapytaj klinikę" subtitle="Pytanie trafi do recepcji/opiekuna pacjenta w panelu kliniki.">
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Rodzaj zgłoszenia</label>
                      <select
                        value={requestForm.type}
                        onChange={event => setRequestForm({ ...requestForm, type: event.target.value })}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition-colors ${isDarkMode ? 'border-white/10 bg-[#071016] text-white focus:border-cyan-300' : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-600'}`}
                      >
                        <option value="post_treatment_question">Pytanie po zabiegu</option>
                        <option value="appointment_request">Chcę umówić wizytę</option>
                        <option value="followup_request">Prośba o konsultację kontrolną</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Temat</label>
                      <input
                        value={requestForm.subject}
                        onChange={event => setRequestForm({ ...requestForm, subject: event.target.value })}
                        placeholder="np. obrzęk po zabiegu, termin kontroli..."
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition-colors ${isDarkMode ? 'border-white/10 bg-[#071016] text-white focus:border-cyan-300 placeholder-slate-600' : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-600 placeholder-slate-400'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Wiadomość</label>
                    <textarea
                      rows={6}
                      value={requestForm.message}
                      onChange={event => setRequestForm({ ...requestForm, message: event.target.value })}
                      placeholder="Opisz, co się dzieje albo jaki termin wizyty Ci odpowiada..."
                      className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm font-medium leading-6 outline-none transition-colors ${isDarkMode ? 'border-white/10 bg-[#071016] text-white focus:border-cyan-300 placeholder-slate-600' : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-600 placeholder-slate-400'}`}
                    />
                  </div>
                  {requestSuccess && <p className={`rounded-2xl border p-4 text-sm font-bold ${isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10 text-cyan-100' : 'border-cyan-200 bg-cyan-50 text-cyan-700'}`}>{requestSuccess}</p>}
                  <button type="submit" className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition hover:scale-[1.02] ${isDarkMode ? 'bg-cyan-200 text-[#071016]' : 'bg-cyan-600 text-white shadow-md'}`}>
                    <Send size={15} /> Wyślij do recepcji
                  </button>
                </form>

                <div className={`mt-8 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="mb-4">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>Masz wiadomości</p>
                    <h3 className={`mt-1 text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Historia rozmowy z recepcją</h3>
                  </div>

                  {portalRequests.length === 0 ? (
                    <EmptyState isDarkMode={isDarkMode} icon={MessageSquare} title="Brak wiadomości" text="Kiedy wyślesz pytanie lub recepcja odpowie, rozmowa pojawi się tutaj." />
                  ) : (
                    <div className="space-y-4">
                      {portalRequests.map((request: any) => {
                        const requestMessages = portalMessages.filter((message: any) => message.request_id === request.id)
                        const statusLabel = request.status === 'answered' ? 'Odpowiedziano' : request.status === 'closed' ? 'Zamknięte' : request.status === 'in_progress' ? 'W trakcie' : 'Nowe'

                        return (
                          <div key={request.id} className={`rounded-3xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{statusLabel}</p>
                                <h4 className={`mt-1 font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{request.subject || 'Wiadomość do recepcji'}</h4>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500">{formatDateTime(request.created_at)}</p>
                            </div>

                            <div className="mt-4 space-y-3">
                              {(requestMessages.length > 0 ? requestMessages : [{
                                id: `${request.id}-fallback`,
                                sender_type: 'patient',
                                sender_name: 'Ty',
                                body: request.message,
                                created_at: request.created_at,
                              }]).map((message: any) => {
                                const isStaff = message.sender_type === 'staff'
                                return (
                                  <div key={message.id} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${isStaff ? (isDarkMode ? 'border-cyan-200/20 bg-cyan-200/10 text-cyan-50' : 'border-cyan-200 bg-cyan-50 text-cyan-900') : (isDarkMode ? 'border-white/10 bg-[#071016] text-slate-200' : 'border-slate-200 bg-white text-slate-700 shadow-sm')}`}>
                                      <p className="mb-1 text-[9px] font-black uppercase tracking-widest opacity-60">
                                        {isStaff ? (message.sender_name || 'Recepcja') : 'Ty'} · {formatDateTime(message.created_at)}
                                      </p>
                                      <p className="whitespace-pre-wrap">{message.body}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Panel>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL DO PODPISU */}
      <AnimatePresence>
        {selectedConsentToSign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedConsentToSign(null)} className={`absolute inset-0 backdrop-blur-xl ${isDarkMode ? 'bg-[#071016]/90' : 'bg-slate-900/60'}`} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className={`relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[36px] border shadow-[0_40px_100px_rgba(0,0,0,0.6)] ${isDarkMode ? 'border-white/10 bg-[#101a22]' : 'border-slate-200 bg-white'}`}
            >
              <div className={`flex shrink-0 items-center justify-between border-b p-6 md:p-8 ${isDarkMode ? 'border-white/10' : 'border-slate-100 bg-slate-50'}`}>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>{getConsentTypeLabel(selectedConsentToSign)}</p>
                  <h3 className={`mt-1 text-xl font-black md:text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{getConsentTitle(selectedConsentToSign)}</h3>
                </div>
                <button onClick={() => setSelectedConsentToSign(null)} className={`rounded-full p-3 transition-colors ${isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <X size={20} />
                </button>
              </div>

              <div className={`custom-scrollbar flex-1 overflow-y-auto p-6 text-sm leading-loose md:p-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="whitespace-pre-wrap">{renderInteractiveContent(getConsentContent(selectedConsentToSign))}</div>
                <div className={`mt-8 rounded-2xl border p-5 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Oświadczenie cyfrowe</p>
                  <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Kliknięcie „Akceptuję i podpisuję” jest równoznaczne z potwierdzeniem dokumentu w Portalu Pacjenta.
                  </p>
                </div>
              </div>

              <div className={`shrink-0 border-t p-6 md:p-8 ${isDarkMode ? 'border-white/10 bg-[#0c131a]' : 'border-slate-200 bg-slate-50'}`}>
                <button
                  onClick={handleSignConsent}
                  disabled={isSigning}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-wider transition hover:scale-[1.02] disabled:opacity-60 ${isDarkMode ? 'bg-cyan-200 text-[#071016]' : 'bg-cyan-600 text-white shadow-xl hover:bg-cyan-700'}`}
                >
                  {isSigning ? 'Zapisywanie...' : <><FileSignature size={18} /> Akceptuję i podpisuję</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Panel({ isDarkMode, title, subtitle, badge, children }: any) {
  return (
    <div className={`overflow-hidden rounded-[32px] border ${isDarkMode ? 'border-white/10 bg-[#101a22]/75' : 'border-slate-200 bg-white shadow-sm'}`}>
      <div className={`flex flex-col gap-3 border-b p-6 md:flex-row md:items-center md:justify-between ${isDarkMode ? 'border-white/10' : 'border-slate-100 bg-slate-50/50'}`}>
        <div>
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
          {subtitle && <p className={`mt-1 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
        </div>
        {badge && <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isDarkMode ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>{badge}</span>}
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </div>
  )
}

function InfoCard({ isDarkMode, icon: Icon, title, text, accent }: any) {
  const colors = {
    red: isDarkMode ? 'border-red-500/20 bg-red-500/[0.07] text-red-200' : 'border-red-200 bg-red-50 text-red-700',
    cyan: isDarkMode ? 'border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-100' : 'border-cyan-200 bg-cyan-50 text-cyan-800',
    emerald: isDarkMode ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }
  return (
    <div className={`rounded-[28px] border p-5 ${colors[accent]}`}>
      <Icon size={22} />
      <h3 className="mt-4 font-black">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
    </div>
  )
}

function EmptyState({ isDarkMode, icon: Icon, title, text }: any) {
  return (
    <div className={`rounded-3xl border p-8 text-center ${isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
      <Icon size={32} className={`mx-auto mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
      <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{title}</p>
      <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{text}</p>
    </div>
  )
}

function DocumentRow({ isDarkMode, title, typeLabel, pending, date, onClick }: any) {
  return (
    <div className={`rounded-3xl border p-5 ${pending ? (isDarkMode ? 'border-red-500/20 bg-red-500/[0.06]' : 'border-red-200 bg-red-50') : (isDarkMode ? 'border-emerald-500/20 bg-emerald-500/[0.05]' : 'border-emerald-200 bg-emerald-50')}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${pending ? (isDarkMode ? 'bg-red-500/10 text-red-300' : 'bg-red-100 text-red-600') : (isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-600')}`}>
            {pending ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{typeLabel}</p>
            <h3 className={`mt-1 font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            {date && <p className="mt-2 text-xs font-bold text-slate-500">{date}</p>}
          </div>
        </div>
        {pending && onClick && (
          <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-white text-[#071016]' : 'bg-slate-900 text-white hover:bg-black'}`}>
            <FileSignature size={15} /> Wypełnij
          </button>
        )}
      </div>
    </div>
  )
}