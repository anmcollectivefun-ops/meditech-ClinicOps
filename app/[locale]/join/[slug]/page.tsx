'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
]

const MOCK_APPOINTMENTS = [
  {
    id: 101,
    date: '2026-05-25T14:30:00',
    doctor: 'Dr Karolina Wiśniewska',
    specialty: 'Medycyna estetyczna',
    status: 'upcoming',
    location: 'Gabinet 3, piętro 1',
  }
]

const MOCK_RECORDS = [
  { id: 201, date: '2026-04-10', title: 'Zalecenia po zabiegu', type: 'zalecenia', fileUrl: '#' }
]

const MOCK_DOCTORS = [
  {
    id: 'd1',
    name: 'Dr Karolina Wiśniewska',
    specialty: 'Medycyna estetyczna',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=400',
  }
]

const normalizePesel = (value: string) => value.replace(/\D/g, '')

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
  
  // NOWOŚĆ: Stan przechowujący odpowiedzi z interaktywnego formularza
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})

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

      const directData = await loadPatientDirectly(normalizedPesel)

      if (directData?.patient) {
        applyPortalData(directData)
        setIsLoggedIn(true)
      } else {
        setLoginError('Nie znaleziono pacjenta w bazie. Sprawdź PESEL.')
      }
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
    setPendingConsents([])
    setSignedConsents([])
  }

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Zgłoszenie rezerwacji zostało wysłane. Oczekuj na potwierdzenie z recepcji.')
    setIsBookingModalOpen(false)
  }

  // Otwieranie formularza z czyszczeniem odpowiedzi
  const openSignModal = (consent: any) => {
    setSelectedConsentToSign(consent)
    setFormAnswers({}) // Czyścimy odpowiedzi przed nowym dokumentem
    setIsSignModalOpen(true)
  }

  const handleSignConsent = async () => {
    if (!selectedConsentToSign) return
    setIsSigning(true)
    setLoginError('')

    try {
      const normalizedPesel = normalizePesel(loginPesel)

      if (selectedConsentToSign.id && !String(selectedConsentToSign.id).startsWith('demo-')) {
        
        // Zapisujemy bezpośrednio do bazy z nową kolumną answers!
        const { error: updateError } = await supabase
          .from('patient_consents')
          .update({ 
            status: 'signed', 
            signed_at: new Date().toISOString(),
            answers: formAnswers // Magia - tu lecą wyklikane checkboxy i wpisane teksty!
          })
          .eq('id', selectedConsentToSign.id)
          .eq('patient_id', patient.id)

        if (updateError) throw updateError

        const refreshed = await loadPatientDirectly(normalizedPesel)
        if (refreshed?.patient) applyPortalData(refreshed)
      }

      setIsSignModalOpen(false)
      setSelectedConsentToSign(null)
    } catch (err: any) {
      setLoginError('Nie udało się zapisać dokumentu: ' + (err?.message || 'błąd'))
    } finally {
      setIsSigning(false)
    }
  }

  // ============================================================================
  // MAGICZNY PARSER: Zamienia [ ] na checkboxy i ____ na inputy
  // ============================================================================
  const renderInteractiveContent = (text: string) => {
    if (!text) return null;
    
    // Dzielimy tekst na kawałki szukając: [ ] lub _ (minimum 3 podłogi)
    const parts = text.split(/(\[\s*\]|_{3,})/);
    let checkboxIndex = 0;
    let textIndex = 0;

    return parts.map((part, index) => {
      // Jeśli to jest [ ]
      if (part.match(/\[\s*\]/)) {
        const fieldId = `checkbox_${checkboxIndex++}`;
        return (
          <input
            key={index}
            type="checkbox"
            className="mx-2 w-5 h-5 translate-y-1 cursor-pointer accent-red-600 rounded border-white/20 bg-white/5"
            checked={!!formAnswers[fieldId]}
            onChange={(e) => setFormAnswers(prev => ({ ...prev, [fieldId]: e.target.checked }))}
          />
        );
      } 
      // Jeśli to jest ____
      else if (part.match(/_{3,}/)) {
        const fieldId = `textinput_${textIndex++}`;
        return (
          <input
            key={index}
            type="text"
            placeholder="wpisz..."
            className="mx-2 bg-transparent border-b border-white/30 text-cyan-200 placeholder-slate-600/50 outline-none focus:border-red-500 min-w-[120px] px-1 text-center"
            value={formAnswers[fieldId] || ''}
            onChange={(e) => setFormAnswers(prev => ({ ...prev, [fieldId]: e.target.value }))}
          />
        );
      }
      // W przeciwnym razie wyświetl zwykły tekst
      return <span key={index}>{part}</span>;
    });
  };

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
        </motion.div>
      </div>
    )
  }

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

          <button onClick={handleLogout} className="p-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">
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
                  isActive ? 'bg-cyan-200 text-[#071016] border-cyan-200' : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/[0.06]'
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
                    <p className="text-xs text-slate-400 font-medium mt-1">Dokumenty wysłane przez recepcję do uzupełnienia.</p>
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
                            <p className="text-xs text-slate-400 mt-2 font-medium">Do uzupełnienia przed wizytą</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openSignModal(consent)}
                          className="px-5 py-3 rounded-2xl bg-white text-[#071016] font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center gap-2"
                        >
                          <FileSignature size={14} /> Wypełnij
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#101a22]/70 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-black">Archiwum dokumentów</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {signedConsents.length === 0 ? (
                    <p className="p-6 text-sm text-slate-400 font-bold">Brak podpisanych dokumentów.</p>
                  ) : (
                    signedConsents.map(consent => (
                      <div key={consent.id} className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <p className="font-black text-sm">{getConsentTitle(consent)}</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase">{getConsentDate(consent)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL Z INTERAKTYWNYM FORMULARZEM */}
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
                  <h3 className="text-xl md:text-2xl font-black text-white">{getConsentTitle(selectedConsentToSign)}</h3>
                </div>
                <button onClick={() => setIsSignModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300 leading-loose space-y-4">
                
                {/* TUTAJ DZIAŁA MAGICZNY PARSER! */}
                {getConsentContent(selectedConsentToSign) ? (
                  <div className="whitespace-pre-wrap">
                    {renderInteractiveContent(getConsentContent(selectedConsentToSign))}
                  </div>
                ) : (
                  <p>Brak treści w szablonie.</p>
                )}

                <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Oświadczenie cyfrowe</p>
                  <p className="text-sm text-white font-medium">
                    Kliknięcie „Akceptuję i podpisuję” jest równoznaczne ze złożeniem podpisu elektronicznego.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-white/10 bg-[#0c131a] shrink-0">
                <button
                  onClick={handleSignConsent}
                  disabled={isSigning}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase text-white bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-500 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  {isSigning ? 'Zapisywanie...' : <><FileSignature size={18} /> Wyślij i Podpisz</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}