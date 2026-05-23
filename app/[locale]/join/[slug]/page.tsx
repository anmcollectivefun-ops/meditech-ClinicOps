'use client'

import { useMemo, useState } from 'react'
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
  Stethoscope,
  X,
} from 'lucide-react'
import { createClient } from '../../../lib/supabase'

const normalizePesel = (value: string) => value.replace(/\D/g, '')

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Termin do ustalenia'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function PatientPortal() {
  const supabase = useMemo(() => createClient(), [])

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

  const loadConsentsForPatient = async (patientId: string) => {
    const joined = await supabase
      .from('patient_consents')
      .select('*, medical_consent_templates(*)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (!joined.error) return joined.data || []

    const plain = await supabase
      .from('patient_consents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (plain.error) throw plain.error
    return plain.data || []
  }

  const loadAppointmentsForPatient = async (patientId: string) => {
    const result = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (result.error) {
      console.warn('Patient appointments unavailable:', result.error.message)
      return []
    }

    return result.data || []
  }

  const loadRequestsForPatient = async (patientId: string) => {
    const result = await supabase
      .from('patient_portal_requests')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (result.error) {
      console.warn('Patient portal requests unavailable:', result.error.message)
      return []
    }

    return result.data || []
  }

  const loadMessagesForPatient = async (patientId: string) => {
    const result = await supabase
      .from('patient_portal_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })

    if (result.error) {
      console.warn('Patient portal messages unavailable:', result.error.message)
      return []
    }

    return result.data || []
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

    const [patientConsents, patientAppointments, patientRequests, patientMessages] = await Promise.all([
      loadConsentsForPatient(foundPatient.id),
      loadAppointmentsForPatient(foundPatient.id),
      loadRequestsForPatient(foundPatient.id),
      loadMessagesForPatient(foundPatient.id),
    ])

    return { patient: foundPatient, consents: patientConsents, appointments: patientAppointments, requests: patientRequests, messages: patientMessages }
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
      const update = await supabase
        .from('patient_consents')
        .update(payload)
        .eq('id', selectedConsentToSign.id)
        .eq('patient_id', patient.id)

      if (update.error) {
        const fallback = await supabase
          .from('patient_consents')
          .update({ status: 'signed', signed_at: payload.signed_at })
          .eq('id', selectedConsentToSign.id)
          .eq('patient_id', patient.id)
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

    const messageInsert = await supabase.from('patient_portal_messages').insert([{
      request_id: insert.data?.id,
      patient_id: patient.id,
      sender_type: 'patient',
      sender_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Pacjent',
      body: requestForm.message,
    }])

    if (messageInsert.error) {
      console.warn('Patient portal message insert error:', messageInsert.error.message)
    }

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
            className="mx-2 h-5 w-5 translate-y-1 rounded border-white/20 bg-white/5 accent-cyan-300"
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
            className="mx-2 min-w-[140px] border-b border-white/30 bg-transparent px-1 text-center text-cyan-100 outline-none focus:border-cyan-300"
            value={formAnswers[fieldId] || ''}
            onChange={(event) => setFormAnswers(prev => ({ ...prev, [fieldId]: event.target.value }))}
          />
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#071016] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.14),transparent_32%)]" />
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md rounded-[36px] border border-white/10 bg-[#101a22]/85 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-200/20 bg-cyan-200/10">
              <HeartPulse size={32} className="text-cyan-200" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Portal Pacjenta</h1>
            <p className="mt-2 text-sm text-slate-400">Dokumenty, wizyty i kontakt z kliniką w jednym miejscu.</p>
          </div>

          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Weryfikacja PESEL
          </label>
          <input
            type="password"
            required
            inputMode="numeric"
            placeholder="Wpisz PESEL pacjenta"
            value={loginPesel}
            onChange={event => setLoginPesel(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-bold text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/[0.07]"
          />

          {loginError && <p className="mt-4 text-center text-sm font-bold text-red-300">{loginError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-cyan-200 py-4 text-sm font-black uppercase tracking-widest text-[#071016] shadow-[0_16px_36px_rgba(103,232,249,0.18)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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
    <div className="min-h-screen bg-[#071016] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.12),transparent_28%)] pointer-events-none" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071016]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10">
              <HeartPulse size={24} className="text-cyan-200" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Portal Pacjenta</p>
              <h2 className="text-lg font-black leading-none">{patient?.first_name} {patient?.last_name}</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="rounded-2xl border border-white/10 p-3 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[34px] border border-white/10 bg-[#101a22]/75 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">Twoja ścieżka opieki</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Dzień dobry, {patient?.first_name || 'Pacjencie'}.</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              Tutaj podpiszesz dokumenty przed wizytą, sprawdzisz najbliższy termin i wyślesz pytanie do zespołu kliniki.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Do podpisu', pendingConsents.length],
                ['Potwierdzone', signedConsents.length],
                ['Wizyty', appointments.length],
                ['PESEL', patient?.pesel ? 'OK' : 'brak'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-cyan-200/20 bg-cyan-200/10 p-6 md:p-7">
            <div className="flex items-center gap-3">
              <Clock className="text-cyan-200" size={22} />
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-100">Najbliższa wizyta</p>
            </div>
            {nextAppointment ? (
              <div className="mt-5">
                <h3 className="text-xl font-black">{nextAppointment.treatment_name || 'Wizyta w klinice'}</h3>
                <p className="mt-2 text-sm font-bold text-cyan-100">{formatDateTime(nextAppointment.appointment_date)}</p>
                <p className="mt-4 text-xs leading-6 text-slate-300">Przyjdź kilka minut wcześniej. Dokumenty do podpisu zobaczysz w zakładce Dokumenty.</p>
              </div>
            ) : (
              <div className="mt-5">
                <h3 className="text-xl font-black">Brak nadchodzącej wizyty</h3>
                <p className="mt-3 text-xs leading-6 text-slate-300">Możesz poprosić recepcję o konsultację lub nowy termin w zakładce kontaktu.</p>
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
                  isActive ? 'border-cyan-200 bg-cyan-200 text-[#071016]' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon size={15} />
                {item.label}
                {'count' in item && item.count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
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
              <InfoCard icon={FileSignature} title="Dokumenty przed wizytą" text={pendingConsents.length ? `Masz ${pendingConsents.length} dokumentów do podpisu.` : 'Nie masz zaległych dokumentów.'} accent="red" />
              <InfoCard icon={Calendar} title="Wizyty i konsultacje" text={nextAppointment ? formatDateTime(nextAppointment.appointment_date) : 'Poproś o termin w panelu kontaktu.'} accent="cyan" />
              <InfoCard icon={MessageSquare} title="Kontakt po zabiegu" text="Wyślij pytanie kontrolne do recepcji bez dzwonienia." accent="emerald" />
            </motion.section>
          )}

          {activeTab === 'dokumenty' && (
            <motion.section key="dokumenty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              <Panel title="Do podpisu" subtitle="Dokumenty wymagające Twojej akceptacji przed wizytą." badge={`${pendingConsents.length} oczekuje`}>
                {pendingConsents.length === 0 ? (
                  <EmptyState icon={CheckCircle2} title="Wszystko podpisane" text="Na ten moment nie masz dokumentów oczekujących na akceptację." />
                ) : pendingConsents.map(consent => (
                  <DocumentRow key={consent.id} consent={consent} typeLabel={getConsentTypeLabel(consent)} title={getConsentTitle(consent)} pending onClick={() => openSignModal(consent)} />
                ))}
              </Panel>

              <Panel title="Potwierdzone dokumenty" subtitle="Archiwum zaakceptowanych dokumentów i skanów.">
                {signedConsents.length === 0 ? (
                  <EmptyState icon={FileText} title="Brak historii" text="Podpisane dokumenty pojawią się tutaj po akceptacji." />
                ) : signedConsents.map(consent => (
                  <DocumentRow key={consent.id} consent={consent} typeLabel={getConsentTypeLabel(consent)} title={getConsentTitle(consent)} pending={false} date={formatDateTime(consent.signed_at || consent.created_at)} />
                ))}
              </Panel>
            </motion.section>
          )}

          {activeTab === 'wizyty' && (
            <motion.section key="wizyty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              <Panel title="Twoje wizyty" subtitle="Najbliższe terminy, status płatności i historia zaplanowanych zabiegów.">
                {appointments.length === 0 ? (
                  <EmptyState icon={Calendar} title="Brak wizyt" text="Wyślij prośbę o konsultację lub nowy termin w zakładce kontaktu." />
                ) : appointments.map(appointment => (
                  <div key={appointment.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">{appointment.status || 'zaplanowana'}</p>
                        <h3 className="mt-1 text-lg font-black">{appointment.treatment_name || 'Wizyta w klinice'}</h3>
                        <p className="mt-2 text-sm font-bold text-slate-300">{formatDateTime(appointment.appointment_date)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#071016]/50 px-4 py-3 text-sm font-black">
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
              <Panel title="Zapytaj klinikę" subtitle="Pytanie trafi do recepcji/opiekuna pacjenta w panelu kliniki.">
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Rodzaj zgłoszenia</label>
                      <select
                        value={requestForm.type}
                        onChange={event => setRequestForm({ ...requestForm, type: event.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#071016] px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300"
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
                        className="w-full rounded-2xl border border-white/10 bg-[#071016] px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300"
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
                      className="w-full resize-none rounded-2xl border border-white/10 bg-[#071016] px-4 py-3 text-sm font-medium leading-6 outline-none focus:border-cyan-300"
                    />
                  </div>
                  {requestSuccess && <p className="rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-4 text-sm font-bold text-cyan-100">{requestSuccess}</p>}
                  <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#071016] transition hover:scale-[1.02]">
                    <Send size={15} /> Wyślij do recepcji
                  </button>
                </form>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Masz wiadomości</p>
                    <h3 className="mt-1 text-lg font-black">Historia rozmowy z recepcją</h3>
                  </div>

                  {portalRequests.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="Brak wiadomości" text="Kiedy wyślesz pytanie lub recepcja odpowie, rozmowa pojawi się tutaj." />
                  ) : (
                    <div className="space-y-4">
                      {portalRequests.map((request: any) => {
                        const requestMessages = portalMessages.filter((message: any) => message.request_id === request.id)
                        const statusLabel = request.status === 'answered'
                          ? 'Odpowiedziano'
                          : request.status === 'closed'
                            ? 'Zamknięte'
                            : request.status === 'in_progress'
                              ? 'W trakcie'
                              : 'Nowe'

                        return (
                          <div key={request.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{statusLabel}</p>
                                <h4 className="mt-1 font-black">{request.subject || 'Wiadomość do recepcji'}</h4>
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
                                    <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${isStaff ? 'border-cyan-200/20 bg-cyan-200/10 text-cyan-50' : 'border-white/10 bg-[#071016] text-slate-200'}`}>
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

      <AnimatePresence>
        {selectedConsentToSign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedConsentToSign(null)} className="absolute inset-0 bg-[#071016]/90 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[#101a22] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-6 md:p-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">{getConsentTypeLabel(selectedConsentToSign)}</p>
                  <h3 className="mt-1 text-xl font-black md:text-2xl">{getConsentTitle(selectedConsentToSign)}</h3>
                </div>
                <button onClick={() => setSelectedConsentToSign(null)} className="rounded-full bg-white/5 p-3 text-slate-400 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto p-6 text-sm leading-loose text-slate-300 md:p-8">
                <div className="whitespace-pre-wrap">{renderInteractiveContent(getConsentContent(selectedConsentToSign))}</div>
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Oświadczenie cyfrowe</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    Kliknięcie „Akceptuję i podpisuję” jest równoznaczne z potwierdzeniem dokumentu w Portalu Pacjenta.
                  </p>
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#0c131a] p-6 md:p-8">
                <button
                  onClick={handleSignConsent}
                  disabled={isSigning}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-200 py-4 text-sm font-black uppercase tracking-wider text-[#071016] transition hover:scale-[1.02] disabled:opacity-60"
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

function Panel({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#101a22]/75">
      <div className="flex flex-col gap-3 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}
        </div>
        {badge && <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase text-red-200">{badge}</span>}
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, text, accent }: { icon: any; title: string; text: string; accent: 'red' | 'cyan' | 'emerald' }) {
  const colors = {
    red: 'border-red-500/20 bg-red-500/[0.07] text-red-200',
    cyan: 'border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-100',
    emerald: 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-100',
  }
  return (
    <div className={`rounded-[28px] border p-5 ${colors[accent]}`}>
      <Icon size={22} />
      <h3 className="mt-4 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <Icon size={32} className="mx-auto mb-3 text-slate-400" />
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  )
}

function DocumentRow({ title, typeLabel, pending, date, onClick }: { consent: any; title: string; typeLabel: string; pending: boolean; date?: string; onClick?: () => void }) {
  return (
    <div className={`rounded-3xl border p-5 ${pending ? 'border-red-500/20 bg-red-500/[0.06]' : 'border-emerald-500/20 bg-emerald-500/[0.05]'}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${pending ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
            {pending ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{typeLabel}</p>
            <h3 className="mt-1 font-black">{title}</h3>
            {date && <p className="mt-2 text-xs font-bold text-slate-500">{date}</p>}
          </div>
        </div>
        {pending && onClick && (
          <button onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-[#071016] transition hover:scale-[1.02]">
            <FileSignature size={15} /> Wypełnij
          </button>
        )}
      </div>
    </div>
  )
}
