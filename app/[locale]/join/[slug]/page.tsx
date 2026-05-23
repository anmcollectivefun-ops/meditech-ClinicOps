'use client'

// ==========================================
// 1. IMPORTY I KONFIGURACJA
// ==========================================
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, CheckCircle2, X, Clock,
  User, Activity, Stethoscope, FileText, Bell,
  Plus, Download, LogOut, HeartPulse, ArrowRight,
  ShieldCheck, Info, AlertTriangle, FileSignature, CheckSquare
} from 'lucide-react'
import { createClient } from '../../../lib/supabase'

// ==========================================
// 2. MOCK DATA (Odzwierciedla strukturĂ„â„˘ bazy)
// ==========================================
const MOCK_PATIENT = {
  id: 'p-12345',
  first_name: 'Anna',
  last_name: 'Nowak',
  pesel: '85021212345',
  email: 'anna.nowak@example.com',
}

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Dni Otwartych Technologii', date: '2026-06-01', type: 'promo', content: 'Zapisz siĂ„â„˘ na bezpÄąâ€šatnĂ„â€¦ konsultacjĂ„â„˘ technologicznĂ„â€¦ w dniach 1-5 czerwca.' },
  { id: 2, title: 'Aktualizacja harmonogramÄ‚Ĺ‚w', date: '2026-06-15', type: 'info', content: 'CzĂ„â„˘Äąâ€şĂ„â€ˇ specjalistÄ‚Ĺ‚w przebywa na urlopach w drugiej poÄąâ€šowie miesiĂ„â€¦ca. Prosimy o wczeÄąâ€şniejsze planowanie wizyt.' },
  { id: 3, title: 'Nowy sprzĂ„â„˘t w naszej klinice', date: '2026-05-20', type: 'news', content: 'WprowadziliÄąâ€şmy najnowszĂ„â€¦ technologiĂ„â„˘ maÄąâ€šoinwazyjnĂ„â€¦. Zapytaj swojego lekarza prowadzĂ„â€¦cego o szczegÄ‚Ĺ‚Äąâ€šy.' }
]

const MOCK_APPOINTMENTS = [
  { id: 101, date: '2026-05-25T14:30:00', doctor: 'Dr Karolina WiÄąâ€şniewska', specialty: 'Medycyna Estetyczna', status: 'upcoming', location: 'Gabinet 3, PiĂ„â„˘tro 1' },
  { id: 102, date: '2026-04-10T11:00:00', doctor: 'Dr Jan Kowalski', specialty: 'Chirurgia', status: 'completed', location: 'Gabinet 1, Parter' }
]

const MOCK_RECORDS = [
  { id: 201, date: '2026-04-10', title: 'Zalecenia po zabiegu', type: 'zalecenia', fileUrl: '#' },
  { id: 202, date: '2026-03-15', title: 'Karta wynikÄ‚Ĺ‚w laboratoryjnych', type: 'badania', fileUrl: '#' }
]

const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr Karolina WiÄąâ€şniewska', specialty: 'Medycyna Estetyczna', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 'd2', name: 'Dr Jan Kowalski', specialty: 'Chirurgia Plastyczna', photo: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=crop&q=80&w=300&h=400' }
]

// Nowe mocki dla zgÄ‚Ĺ‚d
const INITIAL_PENDING_CONSENTS = [
  { id: 'c1', title: 'PeÄąâ€šny Wywiad Medyczny', type: 'questionnaire', deadline: 'Przed dzisiejszĂ„â€¦ wizytĂ„â€¦' },
  { id: 'c2', title: 'Zgoda na zabieg: Laser frakcyjny CO2', type: 'consent', deadline: 'Przed dzisiejszĂ„â€¦ wizytĂ„â€¦' }
]

const INITIAL_SIGNED_CONSENTS = [
  { id: 'c3', title: 'Zgoda RODO & Marketing', type: 'rodo', date: '12.01.2025', fileUrl: '#' },
  { id: 'c4', title: 'Zgoda na zabieg: Modelowanie Ust', type: 'consent', date: '10.11.2024', fileUrl: '#' }
]

// ==========================================
// 3. GÄąÂÄ‚â€śWNY KOMPONENT PORTALU
// ==========================================
export default function PatientPortal() {
  const supabase = useMemo(() => createClient(), [])

  // --- STANY AUTORYZACJI ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginPesel, setLoginPesel] = useState('')
  const [loginError, setLoginError] = useState('')

  // --- STANY DANYCH ---
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'wizyty' | 'zgody' | 'historia' | 'lekarze'>('zgody') // DomyÄąâ€şlnie otwieramy zgody, bo sĂ„â€¦ najwaÄąÄ˝niejsze

  // --- STANY DOKUMENTÄ‚â€śW (Interaktywne) ---
  const [pendingConsents, setPendingConsents] = useState<any[]>([])
  const [signedConsents, setSignedConsents] = useState<any[]>([])

  // --- STANY UI ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ doctorId: '', date: '' })

  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const [selectedConsentToSign, setSelectedConsentToSign] = useState<any>(null)
  const [isSigning, setIsSigning] = useState(false)

  // --- HANDLERY ---
  const getConsentTitle = (consent: any) => {
    return consent.medical_consent_templates?.title || consent.title || `Dokument #${String(consent.id || '').slice(0, 5)}`
  }

  const getConsentType = (consent: any) => {
    return consent.medical_consent_templates?.document_type || consent.type || 'consent'
  }

  const getConsentContent = (consent: any) => {
    return consent.medical_consent_templates?.content_template || consent.content_template || ''
  }

  const getConsentDate = (consent: any) => {
    const rawDate = consent.signed_at || consent.created_at || consent.date
    return rawDate ? new Date(rawDate).toLocaleDateString('pl-PL') : '-'
  }

  const applyPortalData = (portalData: any) => {
    const consents = Array.isArray(portalData?.consents) ? portalData.consents : []
    setPatient(portalData.patient)
    setPendingConsents(consents.filter((consent: any) => String(consent.status || '').toLowerCase() === 'pending'))
    setSignedConsents(consents.filter((consent: any) => String(consent.status || '').toLowerCase() !== 'pending'))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')

    try {
      const normalizedPesel = loginPesel.trim()
      const { data, error } = await supabase.rpc('patient_portal_by_pesel', {
        input_pesel: normalizedPesel
      })

      if (error) throw error

      if (data?.patient) {
        applyPortalData(data)
        setIsLoggedIn(true)
        return
      }

      if (normalizedPesel.length >= 4) {
        setPatient(MOCK_PATIENT)
        setPendingConsents(INITIAL_PENDING_CONSENTS)
        setSignedConsents(INITIAL_SIGNED_CONSENTS)
        setIsLoggedIn(true)
      } else {
        setLoginError('NieprawidĹ‚owe dane logowania. Wpisz poprawny numer identyfikacyjny.')
      }
    } catch (err: any) {
      setLoginError('Nie udaĹ‚o siÄ™ poĹ‚Ä…czyÄ‡ z portalem pacjenta: ' + err.message)
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
    alert('ZgĹ‚oszenie rezerwacji zostaĹ‚o wysĹ‚ane. Oczekuj na potwierdzenie z recepcji.')
    setIsBookingModalOpen(false)
  }

  const handleSignConsent = async () => {
    if (!selectedConsentToSign) return
    setIsSigning(true)

    try {
      if (selectedConsentToSign.id && !String(selectedConsentToSign.id).startsWith('c')) {
        const { data, error } = await supabase.rpc('patient_portal_sign_consent', {
          input_pesel: loginPesel.trim(),
          input_consent_id: selectedConsentToSign.id
        })

        if (error) throw error
        if (!data) throw new Error('Nie znaleziono dokumentu przypisanego do tego pacjenta.')

        applyPortalData(data)
      } else {
        setPendingConsents(prev => prev.filter(c => c.id !== selectedConsentToSign.id))
        setSignedConsents(prev => [{
          id: selectedConsentToSign.id,
          title: getConsentTitle(selectedConsentToSign),
          type: getConsentType(selectedConsentToSign),
          date: new Date().toLocaleDateString('pl-PL'),
          fileUrl: '#'
        }, ...prev])
      }

      setIsSigning(false)
      setIsSignModalOpen(false)
      setSelectedConsentToSign(null)
    } catch (err: any) {
      setLoginError('Nie udaĹ‚o siÄ™ podpisaÄ‡ dokumentu: ' + err.message)
      setIsSigning(false)
    }
  }
  // ==========================================
  // WIDOK LOGOWANIA (Brak autoryzacji)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#071016] text-white">
        {/* TÄąâ€šo i blury */}
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
            <p className="text-sm mt-2 text-slate-400">Zintegrowany System Medyczny</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-slate-400">Weryfikacja toÄąÄ˝samoÄąâ€şci</label>
              <input
                type="password"
                required
                placeholder="Wpisz PESEL lub ID Pacjenta"
                value={loginPesel}
                onChange={e => setLoginPesel(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl outline-none text-white font-bold transition-all border border-white/10 bg-white/[0.03] focus:border-cyan-300/50 focus:bg-white/[0.06]"
              />
            </div>

            {loginError && <p className="text-xs font-bold text-red-400 text-center">{loginError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#071016] bg-cyan-200 shadow-lg shadow-cyan-300/10 transition-all hover:bg-cyan-100 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Weryfikacja...' : 'Zaloguj siĂ„â„˘ do portalu'}
            </button>
          </form>

          <p className="text-center text-[10px] mt-8 text-slate-500 font-medium leading-relaxed">
            Bezpieczne logowanie szyfrowane SSL.<br/>Przetwarzanie danych zgodne z RODO i standardami medycznymi.
          </p>
        </motion.div>
      </div>
    )
  }

  // ==========================================
  // WIDOK GÄąÂÄ‚â€śWNY (Zalogowany Pacjent)
  // ==========================================
  const upcomingAppointment = MOCK_APPOINTMENTS.find(a => a.status === 'upcoming')

  return (
    <div className="min-h-screen relative selection:bg-cyan-500/30 selection:text-cyan-100 bg-[#071016] text-slate-300">
      {/* TÄąâ€ša ambiwalentne */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.06),transparent_30%)] pointer-events-none z-0" />

      {/* HEADER NAWIGACYJNY */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#071016]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-300/20 bg-cyan-300/10">
              <HeartPulse size={20} className="text-cyan-200" />
            </div>
            <div>
              <h2 className="font-black text-sm uppercase tracking-widest text-white">Premium Clinic</h2>
              <p className="text-[9px] font-bold text-slate-500">Portal Pacjenta</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={12} /> Wyloguj
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-12">

        {/* HERO - POWITANIE I NAJBLIÄąÂ»SZA WIZYTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-8 items-stretch">

          <div className="flex-1 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 w-fit">
              Twoja Strefa Zdrowia
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-white">
              DzieÄąâ€ž dobry, {patient.first_name}.
            </h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed max-w-xl text-slate-400">
              Witamy w zintegrowanym systemie medycznym. Znajdziesz tu peÄąâ€šnĂ„â€¦ historiĂ„â„˘ swojego leczenia, wyniki badaÄąâ€ž oraz najwaÄąÄ˝niejsze komunikaty.
            </p>
          </div>

          <div className="lg:w-[400px] shrink-0 p-6 md:p-8 rounded-[32px] border border-white/10 bg-[#101a22]/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Calendar size={14} /> NajbliÄąÄ˝sza Wizyta
            </p>

            {upcomingAppointment ? (
              <>
                <h3 className="text-2xl font-black text-white mb-1">
                  {new Date(upcomingAppointment.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-3xl font-black mb-6 text-cyan-300">
                  {new Date(upcomingAppointment.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold text-slate-300 flex items-center gap-2"><User size={14} className="text-slate-500"/> {upcomingAppointment.doctor}</p>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-2"><MapPin size={14} className="text-slate-500"/> {upcomingAppointment.location}</p>
                </div>
                <button className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white">
                  SzczegÄ‚Ĺ‚Äąâ€šy wizyty
                </button>
              </>
            ) : (
              <div className="py-6">
                <p className="text-slate-400 text-sm font-medium mb-6">Brak zaplanowanych wizyt w najbliÄąÄ˝szym czasie.</p>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#071016] bg-cyan-200 shadow-lg shadow-cyan-300/10 hover:bg-cyan-100 hover:scale-[1.02] transition-all"
                >
                  UmÄ‚Ĺ‚w nowĂ„â€¦ wizytĂ„â„˘
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* AKTUALNOÄąĹˇCI - KINOWA KARUZELA */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2 text-white">
              <Bell size={20} className="text-cyan-300" /> Komunikaty Kliniki
            </h3>
          </div>

          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x">
            {MOCK_ANNOUNCEMENTS.map((announcement) => (
              <div
                key={announcement.id}
                className="shrink-0 snap-start w-[280px] md:w-[340px] p-6 rounded-[28px] border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    announcement.type === 'promo' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                    announcement.type === 'info' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {announcement.type === 'promo' ? 'Promocja' : announcement.type === 'info' ? 'WaÄąÄ˝ne' : 'AktualnoÄąâ€şĂ„â€ˇ'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{announcement.date}</span>
                </div>
                <h4 className="text-base font-black mb-2 leading-tight text-white">{announcement.title}</h4>
                <p className="text-xs leading-relaxed text-slate-400 line-clamp-3">{announcement.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NAWIGACJA ZAKÄąÂADEK */}
        <section>
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit mb-8">
            {[
              { id: 'zgody', label: 'Zgody i Wywiady', icon: ShieldCheck, alert: pendingConsents.length > 0 },
              { id: 'wizyty', label: 'Historia Wizyt', icon: Clock },
              { id: 'historia', label: 'Wyniki & Zalecenia', icon: FileText },
              { id: 'lekarze', label: 'MÄ‚Ĺ‚j ZespÄ‚Ĺ‚Äąâ€š', icon: Stethoscope }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
                {/* WskaÄąĹźnik alertu (np. braki w dokumentacji) */}
                {tab.alert && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#071016] animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ZAKÄąÂADKA 0: ZGODY I WYWIADY (NOWOÄąĹˇĂ„â€ ) */}
            {activeTab === 'zgody' && (
              <motion.div key="zgody" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">

                {/* SEKCJA: WymagajĂ„â€¦ce akcji */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">WymagajĂ„â€¦ce Twojej akcji</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Dokumenty, ktÄ‚Ĺ‚re musisz uzupeÄąâ€šniĂ„â€ˇ przed wizytĂ„â€¦.</p>
                    </div>
                  </div>

                  {pendingConsents.length === 0 ? (
                     <div className="p-8 text-center rounded-[24px] border border-white/5 bg-white/[0.02]">
                       <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
                       <p className="font-bold text-white">Wszystkie dokumenty sĂ„â€¦ uzupeÄąâ€šnione.</p>
                       <p className="text-xs text-slate-400 mt-1">DziĂ„â„˘kujemy za wspÄ‚Ĺ‚Äąâ€špracĂ„â„˘. JesteÄąâ€ş gotowa na wizytĂ„â„˘.</p>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingConsents.map((consent) => (
                        <div key={consent.id} className="p-5 md:p-6 rounded-[24px] border border-red-500/20 bg-red-500/5 flex flex-col justify-between gap-5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                          <div>
                            <span className="inline-block px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 mb-3">
                              {getConsentType(consent) === 'questionnaire' ? 'Wywiad Medyczny' : 'Zgoda na zabieg'}
                            </span>
                            <h4 className="text-lg font-black text-white leading-tight">{getConsentTitle(consent)}</h4>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Termin: <span className="text-slate-300">{consent.deadline || 'Do uzupeĹ‚nienia przed wizytÄ…'}</span></p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedConsentToSign(consent)
                              setIsSignModalOpen(true)
                            }}
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                          >
                            <FileSignature size={14} /> WypeÄąâ€šnij i Podpisz
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEKCJA: Archiwum podpisanych */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckSquare size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Podpisane dokumenty</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Twoje cyfrowe archiwum oÄąâ€şwiadczeÄąâ€ž i zgÄ‚Ĺ‚d.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {signedConsents.map((consent) => (
                      <div key={consent.id} className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4 group transition-colors hover:bg-white/[0.04]">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <ShieldCheck size={18} className="text-emerald-400"/>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate">{getConsentTitle(consent)}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Podpisano: {getConsentDate(consent)}</p>
                          </div>
                        </div>
                        <a href={consent.file_url || consent.fileUrl || '#'} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-400/50 group-hover:text-emerald-400 transition-all bg-white/5 text-slate-400" title="Pobierz PDF">
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ZAKÄąÂADKA 1: WIZYTY */}
            {activeTab === 'wizyty' && (
              <motion.div key="wizyty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-white">Twoje wizyty</h3>
                  <button onClick={() => setIsBookingModalOpen(true)} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#071016] bg-cyan-200 transition-transform hover:scale-105 flex items-center gap-2">
                    <Plus size={12} /> UmÄ‚Ĺ‚w nowĂ„â€¦
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_APPOINTMENTS.map((apt) => (
                    <div key={apt.id} className="p-5 md:p-6 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors hover:bg-white/[0.04]">
                      <div className="flex items-start gap-5">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${apt.status === 'upcoming' ? 'border-cyan-300/30 text-cyan-300 bg-cyan-300/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                          {apt.status === 'upcoming' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                            {new Date(apt.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <h4 className="text-lg font-black text-white">{apt.specialty}</h4>
                          <p className="text-sm text-slate-400 mt-1">{apt.doctor}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${apt.status === 'upcoming' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {apt.status === 'upcoming' ? 'Zaplanowana' : 'Zrealizowana'}
                        </span>
                        {apt.status === 'upcoming' && (
                          <button className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors text-slate-500 border border-white/10" title="OdwoÄąâ€šaj">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ZAKÄąÂADKA 2: DOKUMENTY I WYNIKI (Medyczne) */}
            {activeTab === 'historia' && (
              <motion.div key="historia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-2xl font-black mb-6 text-white">Wyniki BadaÄąâ€ž i Zalecenia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_RECORDS.map((rec) => (
                    <div key={rec.id} className="p-5 rounded-[24px] border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4 group transition-colors hover:bg-white/[0.04]">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          {rec.type === 'zalecenia' ? <HeartPulse size={18} className="text-cyan-300"/> : <Activity size={18} className="text-emerald-400"/>}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{rec.title}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Data: {rec.date}</p>
                        </div>
                      </div>
                      <a href={rec.fileUrl} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan-300/50 group-hover:text-cyan-300 transition-all bg-white/5 text-slate-400">
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ZAKÄąÂADKA 3: ZESPÄ‚â€śÄąÂ MEDYCZNY */}
            {activeTab === 'lekarze' && (
              <motion.div key="lekarze" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-2xl font-black mb-6 text-white">Lekarze prowadzĂ„â€¦cy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_DOCTORS.map((doc) => (
                    <div key={doc.id} className="rounded-[32px] overflow-hidden border border-white/10 group relative bg-[#101a22]">
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071016] via-[#071016]/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-6 w-full">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-cyan-300">{doc.specialty}</p>
                          <h4 className="text-xl font-black text-white leading-tight">{doc.name}</h4>
                        </div>
                      </div>
                      <div className="p-4 flex gap-2 border-t border-white/5">
                        <button onClick={() => setIsBookingModalOpen(true)} className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#071016] bg-cyan-200 hover:bg-cyan-100 transition-colors">
                          UmÄ‚Ĺ‚w wizytĂ„â„˘
                        </button>
                        <button className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-300">
                          <Info size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* ========================================== */}
      {/* MODAL: REZERWACJA WIZYTY */}
      {/* ========================================== */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-[#071016]/90 backdrop-blur-xl" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg p-8 rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-[#101a22]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                    <Calendar size={12} /> e-Rezerwacja
                  </span>
                  <h3 className="text-2xl font-black text-white">UmÄ‚Ĺ‚w wizytĂ„â„˘</h3>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleBookVisit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Specjalista</label>
                  <select required className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-300/50 text-white font-bold transition-colors" value={bookingForm.doctorId} onChange={e => setBookingForm({...bookingForm, doctorId: e.target.value})}>
                    <option value="" className="bg-[#101a22] text-slate-400">Wybierz lekarza...</option>
                    {MOCK_DOCTORS.map(doc => <option key={doc.id} value={doc.id} className="bg-[#101a22] text-white">{doc.name} - {doc.specialty}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Preferowany termin</label>
                  <input required type="datetime-local" className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-300/50 text-white font-bold transition-colors" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 leading-relaxed mt-2 font-medium">
                  To jest zgÄąâ€šoszenie preferencji. Ostateczny termin zostanie potwierdzony przez recepcjĂ„â„˘ w systemie lub telefonicznie.
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#071016] bg-cyan-200 shadow-lg shadow-cyan-300/10 hover:bg-cyan-100 hover:scale-[1.02] transition-transform mt-4">
                  WyÄąâ€şlij proÄąâ€şbĂ„â„˘ o wizytĂ„â„˘
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: WYPEÄąÂNIANIE I PODPISYWANIE ZGÄ‚â€śD */}
      {/* ========================================== */}
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
              {/* Header Modal */}
              <div className="p-6 md:p-8 border-b border-white/10 shrink-0 flex justify-between items-center bg-[#101a22] z-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2 border border-red-500/20 bg-red-500/10 text-red-400">
                    <AlertTriangle size={12} /> Dokument Wymagany
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight pr-4">
                    {getConsentTitle(selectedConsentToSign)}
                  </h3>
                </div>
                <button onClick={() => setIsSignModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-slate-400 hover:text-white shrink-0"><X size={20} /></button>
              </div>

              {/* TreÄąâ€şĂ„â€ˇ dokumentu (scrollowana) */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300 leading-relaxed space-y-4">
                {getConsentContent(selectedConsentToSign) ? (
                  <div className="whitespace-pre-wrap">
                    {getConsentContent(selectedConsentToSign)}
                  </div>
                ) : (
                  <>
                    <p>
                      Ja, niĹĽej podpisany(a) <strong>{patient.first_name} {patient.last_name}</strong> (PESEL: {patient.pesel}), wyraĹĽam Ĺ›wiadomÄ… zgodÄ™ na przeprowadzenie procedury medycznej/estetycznej w placĂłwce Premium Clinic.
                    </p>
                    <p>
                      OĹ›wiadczam, ĹĽe zostaĹ‚em(am) poinformowany(a) o celach, charakterze, potencjalnych korzyĹ›ciach oraz ryzykach zwiÄ…zanych z planowanym zabiegiem, w tym o moĹĽliwych powikĹ‚aniach i przeciwwskazaniach.
                    </p>
                    <p>
                      <strong>ZobowiÄ…zujÄ™ siÄ™ do:</strong><br/>
                      1. Przestrzegania wszystkich zaleceĹ„ przed- i pozabiegowych przekazanych przez personel kliniki.<br/>
                      2. Natychmiastowego poinformowania kliniki o wszelkich niepokojÄ…cych objawach lub zmianach w moim stanie zdrowia.
                    </p>
                    <p>
                      OĹ›wiadczam rĂłwnieĹĽ, ĹĽe mĂłj stan zdrowia, wedĹ‚ug mojej najlepszej wiedzy, pozwala na bezpieczne przeprowadzenie zabiegu, a wszystkie informacje podane w wywiadzie medycznym sÄ… zgodne z prawdÄ….
                    </p>
                  </>
                )}
                <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">OÄąâ€şwiadczenie cyfrowe</p>
                  <p className="text-sm text-white font-medium">
                    KlikniĂ„â„˘cie przycisku "AkceptujĂ„â„˘ i PodpisujĂ„â„˘" jest rÄ‚Ĺ‚wnoznaczne ze zÄąâ€šoÄąÄ˝eniem podpisu elektronicznego pod powyÄąÄ˝szym dokumentem i akceptacjĂ„â€¦ jego warunkÄ‚Ĺ‚w prawnych.
                  </p>
                </div>
              </div>

              {/* Stopka Modal z akcjĂ„â€¦ */}
              <div className="p-6 md:p-8 border-t border-white/10 bg-[#0c131a] shrink-0">
                <button
                  onClick={handleSignConsent}
                  disabled={isSigning}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-500 hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSigning ? (
                    'Przetwarzanie certyfikatu...'
                  ) : (
                    <>
                      <FileSignature size={18} /> AkceptujĂ„â„˘ i PodpisujĂ„â„˘
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
                  Dokument zostanie wygenerowany w formacie PDF i zapisany w archiwum
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
