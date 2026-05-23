'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  FileText,
  HeartPulse,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react'
import { createClient } from '../../../lib/supabase'

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Dni Otwartych Technologii',
    date: '2026-06-01',
    type: 'promo',
    content: 'Zapisz się na bezpłatną konsultację technologiczną w dniach 1-5 czerwca.',
  },
  {
    id: 2,
    title: 'Aktualizacja harmonogramów',
    date: '2026-06-15',
    type: 'info',
    content: 'Część specjalistów przebywa na urlopach. Prosimy o wcześniejsze planowanie wizyt.',
  },
  {
    id: 3,
    title: 'Nowy sprzęt w naszej klinice',
    date: '2026-05-20',
    type: 'news',
    content: 'Wprowadziliśmy najnowszą technologię małoinwazyjną. Zapytaj lekarza o szczegóły.',
  },
]

const MOCK_APPOINTMENTS = [
  {
    id: 101,
    date: '2026-05-25T14:30:00',
    doctor: 'Dr Karolina Wiśniewska',
    specialty: 'Medycyna estetyczna',
    status: 'upcoming',
    location: 'Gabinet 3, piętro 1',
  },
  {
    id: 102,
    date: '2026-04-10T11:00:00',
    doctor: 'Dr Jan Kowalski',
    specialty: 'Chirurgia',
    status: 'completed',
    location: 'Gabinet 1, parter',
  },
]

const MOCK_RECORDS = [
  { id: 201, date: '2026-04-10', title: 'Zalecenia po zabiegu', type: 'zalecenia', fileUrl: '#' },
  { id: 202, date: '2026-03-15', title: 'Karta wyników laboratoryjnych', type: 'badania', fileUrl: '#' },
]

const MOCK_DOCTORS = [
  {
    id: 'd1',
    name: 'Dr Karolina Wiśniewska',
    specialty: 'Medycyna estetyczna',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=400',
  },
  {
    id: 'd2',
    name: 'Dr Jan Kowalski',
    specialty: 'Chirurgia plastyczna',
    photo: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=crop&q=80&w=300&h=400',
  },
]

const INITIAL_PENDING_CONSENTS = [
  { id: 'demo-1', title: 'Pełny wywiad medyczny', type: 'questionnaire', deadline: 'Przed dzisiejszą wizytą' },
  { id: 'demo-2', title: 'Zgoda na zabieg: laser frakcyjny CO2', type: 'consent', deadline: 'Przed dzisiejszą wizytą' },
]

const INITIAL_SIGNED_CONSENTS = [
  { id: 'demo-3', title: 'Zgoda RODO i marketing', type: 'rodo', date: '12.01.2025', fileUrl: '#' },
  { id: 'demo-4', title: 'Zgoda na zabieg: modelowanie ust', type: 'consent', date: '10.11.2024', fileUrl: '#' },
]

const normalizePesel = (value: string) => value.replace(/\D/g, '')

const isMissingRpcError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase()
  return message.includes('could not find the function') || message.includes('schema cache')
}

export default function PatientPortal() {
  const supabase = useMemo(() => createClient(), [])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginPesel, setLoginPesel] = useState('')
  const [loginError, setLoginError] = useState('')
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'zgody' | 'wizyty' | 'historia' | 'lekarze'>('zgody')
  const [pendingConsents, setPendingConsents] = useState<any[]>([])
  const [signedConsents, setSignedConsents] = useState<any[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ doctorId: '', date: '' })
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const [selectedConsentToSign, setSelectedConsentToSign] = useState<any>(null)
  const [isSigning, setIsSigning] = useState(false)

  const getConsentTitle = (consent: any) =>
    consent?.medical_consent_templates?.title || consent?.title || `Dokument #${String(consent?.id || '').slice(0, 5)}`

  const getConsentType = (consent: any) =>
    consent?.medical_consent_templates?.document_type || consent?.type || 'consent'

  const getConsentContent = (consent: any) =>
    consent?.medical_consent_templates?.content_template || consent?.content_template || ''

  const getConsentDate = (consent: any) => {
    const rawDate = consent?.signed_at || consent?.created_at || consent?.date
    return rawDate ? new Date(rawDate).toLocaleDateString('pl-PL') : '-'
  }

  const applyPortalData = (portalData: any) => {
    const consents = Array.isArray(portalData?.consents) ? portalData.consents : []
    setPatient(portalData.patient)
    setPendingConsents(consents.filter((consent: any) => String(consent.status || '').toLowerCase() === 'pending'))
    setSignedConsents(consents.filter((consent: any) => String(consent.status || '').toLowerCase() !== 'pending'))
  }

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

    const consents = plain.data || []
    const templateIds = Array.from(new Set(consents.map((consent: any) => consent.template_id).filter(Boolean)))

    if (templateIds.length === 0) return consents

    const templates = await supabase.from('medical_consent_templates').select('*').in('id', templateIds)
    if (templates.error) return consents

    const templatesById = new Map((templates.data || []).map((template: any) => [template.id, template]))
    return consents.map((consent: any) => ({
      ...consent,
      medical_consent_templates: templatesById.get(consent.template_id) || null,
    }))
  }

  const loadPatientDirectly = async (normalizedPesel: string) => {
    const exact = await supabase.from('patients').select('*').eq('pesel', normalizedPesel).limit(1)

    if (exact.error) throw exact.error

    let foundPatient = exact.data?.[0] || null

    if (!foundPatient) {
      const allPatients = await supabase.from('patients').select('*').limit(300)
      if (allPatients.error) throw allPatients.error

      foundPatient = (allPatients.data || []).find((row: any) => normalizePesel(String(row.pesel || '')) === normalizedPesel)
    }

    if (!foundPatient) return null

    const consents = await loadConsentsForPatient(foundPatient.id)
    return { patient: foundPatient, consents }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')

    try {
      const normalizedPesel = normalizePesel(loginPesel)

      if (normalizedPesel.length !== 11) {
        setLoginError('PESEL powinien mieć 11 cyfr.')
        return
      }

      const rpc = await supabase.rpc('patient_portal_by_pesel', { input_pesel: normalizedPesel })

      if (!rpc.error && rpc.data?.patient) {
        applyPortalData(rpc.data)
        setIsLoggedIn(true)
        return
      }

      if (rpc.error && !isMissingRpcError(rpc.error)) {
        throw rpc.error
      }

      const directData = await loadPatientDirectly(normalizedPesel)

      if (directData?.patient) {
        applyPortalData(directData)
        setIsLoggedIn(true)
        return
      }

      setLoginError('Nie znaleziono pacjenta w bazie. Sprawdź PESEL albo dodaj pacjenta w panelu recepcji.')
    } catch (err: any) {
      setLoginError('Nie udało się połączyć z portalem pacjenta: ' + (err?.message || 'nieznany błąd'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPatient(null)
    setLoginPesel('')
    setPendingConsents([])
    setSignedConsents([])
  }

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Zgłoszenie rezerwacji zostało wysłane. Oczekuj na potwierdzenie z recepcji.')
    setIsBookingModalOpen(false)
  }

  const handleSignConsent = async () => {
    if (!selectedConsentToSign) return
    setIsSigning(true)
    setLoginError('')

    try {
      const normalizedPesel = normalizePesel(loginPesel)

      if (selectedConsentToSign.id && !String(selectedConsentToSign.id).startsWith('demo-')) {
        const rpc = await supabase.rpc('patient_portal_sign_consent', {
          input_pesel: normalizedPesel,
          input_consent_id: selectedConsentToSign.id,
        })

        if (!rpc.error && rpc.data?.patient) {
          applyPortalData(rpc.data)
        } else {
          if (rpc.error && !isMissingRpcError(rpc.error)) throw rpc.error
          if (!patient?.id) throw new Error('Brak aktywnego pacjenta.')

          const update = await supabase
            .from('patient_consents')
            .update({ status: 'signed', signed_at: new Date().toISOString() })
            .eq('id', selectedConsentToSign.id)
            .eq('patient_id', patient.id)

          if (update.error) throw update.error

          const refreshed = await loadPatientDirectly(normalizedPesel)
          if (refreshed?.patient) applyPortalData(refreshed)
        }
      } else {
        setPendingConsents(prev => prev.filter(consent => consent.id !== selectedConsentToSign.id))
        setSignedConsents(prev => [
          {
            id: selectedConsentToSign.id,
            title: getConsentTitle(selectedConsentToSign),
            type: getConsentType(selectedConsentToSign),
            date: new Date().toLocaleDateString('pl-PL'),
            fileUrl: '#',
          },
          ...prev,
        ])
      }

      setIsSignModalOpen(false)
      setSelectedConsentToSign(null)
    } catch (err: any) {
      setLoginError('Nie udało się podpisać dokumentu: ' + (err?.message || 'nieznany błąd'))
    } finally {
      setIsSigning(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#071016] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.15),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.12),transparent_30%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 rounded-[40px] border border-white/10 bg-[#101a22]/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-cyan-300/20 bg-cyan-300/10">
              <HeartPulse size={32} className="text-cyan-200" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Portal Pacjenta</h1>
            <p className="text-sm mt-2 text-slate-400">Zintegrowany system medyczny</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-slate-400">
                Weryfikacja tożsamości
              </label>
              <input
                type="password"
                required
                inputMode="numeric"
                placeholder="Wpisz PESEL pacjenta"
                value={loginPesel}
                onChange={event => setLoginPesel(event.target.value)}
                className="w-full px-5 py-4 rounded-2xl outline-none text-white font-bold transition-all border border-white/10 bg-white/[0.03] focus:border-cyan-300/50 focus:bg-white/[0.06]"
              />
            </div>

            {loginError && <p className="text-red-400 text-sm font-bold text-center leading-relaxed">{loginError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 bg-cyan-200 text-[#071016] shadow-[0_12px_30px_rgba(103,232,249,0.18)]"
            >
              {loading ? 'Weryfikacja...' : 'Zaloguj się do portalu'}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500 mt-8 leading-relaxed">
            Bezpieczne logowanie szyfrowane SSL.
            <br />
            Przetwarzanie danych zgodne z RODO i standardami medycznymi.
          </p>
        </motion.div>
      </div>
    )
  }

  const currentPatientConsents = [...pendingConsents, ...signedConsents]

  return (
    <div className="min-h-screen bg-[#071016] text-white selection:bg-cyan-300 selection:text-[#071016]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.10),transparent_28%)] pointer-events-none" />

      <header className="relative z-20 border-b border-white/10 bg-[#071016]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-200/10 border border-cyan-200/20 flex items-center justify-center">
              <HeartPulse size={22} className="text-cyan-200" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Portal Pacjenta</p>
              <h2 className="font-black text-lg leading-none">{patient?.first_name} {patient?.last_name}</h2>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Wyloguj"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">
        {loginError && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm font-bold">
            {loginError}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 mb-8">
          <div className="rounded-[36px] p-7 md:p-9 border border-white/10 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-cyan-200 text-xs font-black uppercase tracking-[0.2em] mb-3">Karta pacjenta</p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Dzień dobry, {patient?.first_name}.
                </h1>
                <p className="text-slate-400 mt-4 max-w-2xl leading-relaxed">
                  Znajdziesz tu dokumenty do podpisu, historię zgód, wizyty oraz komunikaty z placówki.
                </p>
              </div>
              <div className="hidden md:flex w-16 h-16 rounded-3xl border border-white/10 bg-cyan-200/10 items-center justify-center">
                <ShieldCheck size={30} className="text-cyan-200" />
              </div>
            </div>
          </div>

          <div className="rounded-[36px] p-6 border border-white/10 bg-[#101a22]/80 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-black uppercase tracking-widest mb-5">
              <Calendar size={14} /> Najbliższa wizyta
            </div>
            {MOCK_APPOINTMENTS.filter(visit => visit.status === 'upcoming').slice(0, 1).map(visit => (
              <div key={visit.id}>
                <p className="text-2xl font-black">
                  {new Date(visit.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-slate-400 text-sm mt-1">{new Date(visit.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="mt-5 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-white"><User size={15} className="text-slate-500" /> {visit.doctor}</p>
                  <p className="flex items-center gap-2 text-slate-300"><MapPin size={15} className="text-slate-500" /> {visit.location}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="mt-6 w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-cyan-200 text-[#071016] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Umów wizytę
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_ANNOUNCEMENTS.map(announcement => (
            <div key={announcement.id} className="rounded-3xl p-5 border border-white/10 bg-white/[0.035]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-200">
                  {announcement.type === 'promo' ? 'Promocja' : announcement.type === 'info' ? 'Ważne' : 'Aktualność'}
                </span>
                <Bell size={14} className="text-slate-500" />
              </div>
              <h3 className="font-black text-sm">{announcement.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{announcement.content}</p>
            </div>
          ))}
        </section>

        <nav className="flex gap-2 overflow-x-auto pb-3 mb-7">
          {[
            { id: 'zgody', label: 'Zgody i wywiady', icon: FileSignature },
            { id: 'wizyty', label: 'Wizyty', icon: Calendar },
            { id: 'historia', label: 'Dokumenty', icon: FileText },
            { id: 'lekarze', label: 'Mój zespół', icon: Stethoscope },
          ].map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all border ${
                  isActive
                    ? 'bg-cyan-200 text-[#071016] border-cyan-200'
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={15} />
                {item.label}
                {item.id === 'zgody' && pendingConsents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {pendingConsents.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'zgody' && (
            <motion.section key="zgody" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">Wymagające Twojej akcji</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Dokumenty wysłane przez recepcję do uzupełnienia lub podpisu.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-500/10 text-red-300 border border-red-500/20">
                    {pendingConsents.length} oczekuje
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  {pendingConsents.length === 0 ? (
                    <div className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                      <CheckCircle2 size={32} className="text-emerald-300 mx-auto mb-3" />
                      <p className="font-bold">Wszystkie dokumenty są uzupełnione.</p>
                      <p className="text-xs text-slate-400 mt-1">Dziękujemy za współpracę. Jesteś gotowa na wizytę.</p>
                    </div>
                  ) : (
                    pendingConsents.map(consent => (
                      <div key={consent.id} className="p-5 rounded-3xl border border-red-500/20 bg-red-500/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <h4 className="font-black">{getConsentTitle(consent)}</h4>
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                              Termin: <span className="text-slate-300">{consent.deadline || 'Do uzupełnienia przed wizytą'}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedConsentToSign(consent)
                            setIsSignModalOpen(true)
                          }}
                          className="px-5 py-3 rounded-2xl bg-white text-[#071016] font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                          <FileSignature size={14} /> Wypełnij i podpisz
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-black">Archiwum dokumentów</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Twoje cyfrowe archiwum oświadczeń, zgód i skanów.</p>
                </div>
                <div className="divide-y divide-white/10">
                  {signedConsents.length === 0 ? (
                    <p className="p-6 text-sm text-slate-400 font-bold">Brak podpisanych dokumentów.</p>
                  ) : (
                    signedConsents.map(consent => (
                      <div key={consent.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.03]">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm truncate">{getConsentTitle(consent)}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                              {getConsentType(consent)} • {getConsentDate(consent)}
                            </p>
                          </div>
                        </div>
                        {consent.fileUrl || consent.file_url ? (
                          <a href={consent.fileUrl || consent.file_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                            <Download size={16} />
                          </a>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'wizyty' && (
            <motion.section key="wizyty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-2xl font-black">Moje wizyty</h3>
                <button onClick={() => setIsBookingModalOpen(true)} className="px-4 py-2 rounded-xl bg-cyan-200 text-[#071016] text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Plus size={12} /> Umów nową
                </button>
              </div>
              <div className="divide-y divide-white/10">
                {MOCK_APPOINTMENTS.map(visit => (
                  <div key={visit.id} className="p-5 flex items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${visit.status === 'upcoming' ? 'bg-cyan-200/10 text-cyan-200' : 'bg-white/5 text-slate-500'}`}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-black">{new Date(visit.date).toLocaleDateString('pl-PL')} • {new Date(visit.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-sm text-slate-400 mt-1">{visit.doctor} • {visit.specialty}</p>
                        <p className="text-xs text-slate-500 mt-1">{visit.location}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-600" />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'historia' && (
            <motion.section key="historia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-black">Wyniki badań i zalecenia</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_RECORDS.map(record => (
                  <div key={record.id} className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <FileText size={20} className="text-cyan-200" />
                      <div>
                        <p className="font-black text-sm">{record.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{record.date}</p>
                      </div>
                    </div>
                    <Download size={16} className="text-slate-500" />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'lekarze' && (
            <motion.section key="lekarze" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MOCK_DOCTORS.map(doctor => (
                <div key={doctor.id} className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden flex">
                  <img src={doctor.photo} alt={doctor.name} className="w-32 object-cover" />
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-lg">{doctor.name}</h3>
                      <p className="text-sm text-cyan-200 mt-1">{doctor.specialty}</p>
                    </div>
                    <button onClick={() => setIsBookingModalOpen(true)} className="mt-5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider hover:bg-white/10">
                      Umów wizytę
                    </button>
                  </div>
                </div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-[#071016]/90 backdrop-blur-xl" />
            <motion.form
              onSubmit={handleBookVisit}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-[36px] border border-white/10 bg-[#101a22] p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black">Umów wizytę</h3>
                  <p className="text-sm text-slate-400 mt-1">Recepcja potwierdzi termin po sprawdzeniu dostępności.</p>
                </div>
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <select
                  required
                  value={bookingForm.doctorId}
                  onChange={event => setBookingForm({ ...bookingForm, doctorId: event.target.value })}
                  className="w-full px-4 py-4 rounded-2xl bg-white/[0.04] border border-white/10 outline-none text-white font-bold"
                >
                  <option value="" className="bg-[#101a22]">Wybierz lekarza</option>
                  {MOCK_DOCTORS.map(doctor => <option key={doctor.id} value={doctor.id} className="bg-[#101a22]">{doctor.name} - {doctor.specialty}</option>)}
                </select>
                <input
                  required
                  type="datetime-local"
                  value={bookingForm.date}
                  onChange={event => setBookingForm({ ...bookingForm, date: event.target.value })}
                  className="w-full px-4 py-4 rounded-2xl bg-white/[0.04] border border-white/10 outline-none text-white font-bold"
                />
              </div>
              <p className="text-xs text-slate-500 mt-5 leading-relaxed">
                To jest zgłoszenie preferencji. Ostateczny termin zostanie potwierdzony przez recepcję.
              </p>
              <button type="submit" className="mt-6 w-full py-4 rounded-2xl bg-cyan-200 text-[#071016] font-black text-sm uppercase tracking-widest">
                Wyślij prośbę o wizytę
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSignModalOpen && selectedConsentToSign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSignModalOpen(false)} className="absolute inset-0 bg-[#071016]/90 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-[#101a22] overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-white/10 shrink-0 flex justify-between items-center bg-[#101a22] z-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2 border border-red-500/20 bg-red-500/10 text-red-400">
                    <AlertTriangle size={12} /> Dokument wymagany
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight pr-4">
                    {getConsentTitle(selectedConsentToSign)}
                  </h3>
                </div>
                <button onClick={() => setIsSignModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-slate-400 hover:text-white shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300 leading-relaxed space-y-4">
                {getConsentContent(selectedConsentToSign) ? (
                  <div className="whitespace-pre-wrap">{getConsentContent(selectedConsentToSign)}</div>
                ) : (
                  <>
                    <p>
                      Ja, niżej podpisany(a) <strong>{patient?.first_name} {patient?.last_name}</strong> (PESEL: {patient?.pesel}), wyrażam świadomą zgodę na przeprowadzenie procedury medycznej lub estetycznej w placówce Centrum Medyczne Gunarys.
                    </p>
                    <p>
                      Oświadczam, że zostałem(am) poinformowany(a) o celu, charakterze, potencjalnych korzyściach oraz ryzykach związanych z planowanym zabiegiem, w tym o możliwych powikłaniach i przeciwwskazaniach.
                    </p>
                    <p>
                      <strong>Zobowiązuję się do:</strong>
                      <br />
                      1. Przestrzegania zaleceń przed- i pozabiegowych przekazanych przez personel kliniki.
                      <br />
                      2. Natychmiastowego poinformowania kliniki o niepokojących objawach lub zmianach stanu zdrowia.
                    </p>
                    <p>
                      Oświadczam również, że wszystkie informacje podane w wywiadzie medycznym są zgodne z prawdą.
                    </p>
                  </>
                )}
                <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Oświadczenie cyfrowe</p>
                  <p className="text-sm text-white font-medium">
                    Kliknięcie przycisku „Akceptuję i podpisuję” jest równoznaczne ze złożeniem podpisu elektronicznego pod powyższym dokumentem i akceptacją jego warunków.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-white/10 bg-[#0c131a] shrink-0">
                <button
                  onClick={handleSignConsent}
                  disabled={isSigning}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-500 hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSigning ? 'Zapisywanie podpisu...' : (
                    <>
                      <FileSignature size={18} /> Akceptuję i podpisuję
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
                  Dokument zostanie zapisany w cyfrowym archiwum pacjenta
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
