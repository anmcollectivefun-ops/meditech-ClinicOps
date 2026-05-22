'use client'

// ==========================================
// 1. IMPORTY I KONFIGURACJA
// ==========================================
import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, CheckCircle2, X, Clock, Phone,
  Info, User, Activity, Stethoscope, FileText, Bell,
  ChevronRight, Plus, ArrowRight, Download, LogOut,
  Syringe, ShieldCheck, HeartPulse, ChevronDown
} from 'lucide-react'

// Mockujemy Supabase na potrzeby widoku - w realnym środowisku odkomentuj importy
// import { createClient } from '../../../lib/supabase'

// ==========================================
// 2. MOCK DATA (Zastąpi zapytania do bazy)
// ==========================================
const MOCK_PATIENT = {
  id: 'p-12345',
  first_name: 'Anna',
  last_name: 'Kowalska',
  pesel: '85021212345',
  email: 'anna.kowalska@example.com',
}

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Dni Otwartych Laseroterapii', date: '2026-06-01', type: 'promo', content: 'Zapisz się na bezpłatną konsultację laserową w dniach 1-5 czerwca.' },
  { id: 2, title: 'Urlop dr. Nowaka', date: '2026-06-15', type: 'info', content: 'Dr Jan Nowak przebywa na urlopie od 15 do 30 czerwca. W nagłych przypadkach prosimy o kontakt z recepcją.' },
  { id: 3, title: 'Nowy sprzęt: HIFU', date: '2026-05-20', type: 'news', content: 'Wprowadziliśmy najnowszą technologię liftingu bez skalpela. Zapytaj swojego lekarza prowadzącego.' }
]

const MOCK_APPOINTMENTS = [
  { id: 101, date: '2026-05-25T14:30:00', doctor: 'Dr Karolina Wiśniewska', specialty: 'Medycyna Estetyczna', status: 'upcoming', location: 'Gabinet 3, Piętro 1' },
  { id: 102, date: '2026-04-10T11:00:00', doctor: 'Dr Jan Nowak', specialty: 'Chirurgia', status: 'completed', location: 'Gabinet 1, Parter' }
]

const MOCK_RECORDS = [
  { id: 201, date: '2026-04-10', title: 'Zalecenia po zabiegu laserowym', type: 'zalecenia', fileUrl: '#' },
  { id: 202, date: '2026-03-15', title: 'Wyniki badań krwi', type: 'badania', fileUrl: '#' },
  { id: 203, date: '2026-02-28', title: 'Zgoda na zabieg botuliny', type: 'zgoda', fileUrl: '#' }
]

const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr Karolina Wiśniewska', specialty: 'Medycyna Estetyczna', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=400' },
  { id: 'd2', name: 'Dr Jan Nowak', specialty: 'Chirurgia Plastyczna', photo: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=crop&q=80&w=300&h=400' }
]

// ==========================================
// 3. GŁÓWNY KOMPONENT PORTALU PACJENTA
// ==========================================
export default function PatientPortal() {
  // --- STANY AUTORYZACJI ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginPesel, setLoginPesel] = useState('')
  const [loginError, setLoginError] = useState('')

  // --- STANY DANYCH ---
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'wizyty' | 'historia' | 'lekarze'>('wizyty')
  
  // --- STANY UI ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ doctorId: '', date: '' })

  // --- STYLISTYKA GUNARYS (Wzorowana na Twoim kodzie) ---
  const primColor = '#253a2a' // Ciemna, butelkowa zieleń
  const secColor = '#e8ce7a'  // Złoto Premium
  const bgColor = '#0f172a'   // Ciemny grafit (Tło)
  const cardBg = '#1e293b'    // Karty
  const headColor = '#ffffff'
  const txtColor = '#94a3b8'

  // --- HANDLERY ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    
    // Symulacja logowania
    setTimeout(() => {
      if (loginPesel.length >= 4) {
        setPatient(MOCK_PATIENT)
        setIsLoggedIn(true)
      } else {
        setLoginError('Nieprawidłowe dane logowania. Wpisz poprawny PESEL.')
      }
      setLoading(false)
    }, 800)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPatient(null)
    setLoginPesel('')
  }

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault()
    // Tutaj normalnie wysyłamy do Supabase tabeli `appointments`
    alert('Zgłoszenie rezerwacji zostało wysłane. Oczekuj na potwierdzenie z recepcji.')
    setIsBookingModalOpen(false)
  }

  // ==========================================
  // WIDOK LOGOWANIA (Gdy pacjent nie jest zalogowany)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        {/* Tło i blury */}
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: primColor }} />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: secColor }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 rounded-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          style={{ backgroundColor: `${cardBg}E6` }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-white/5" style={{ backgroundColor: `${secColor}15` }}>
              <HeartPulse size={32} style={{ color: secColor }} />
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: headColor }}>Portal Pacjenta</h1>
            <p className="text-sm mt-2" style={{ color: txtColor }}>Centrum Medyczne Gunarys</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: txtColor }}>Weryfikacja tożsamości (PESEL)</label>
              <input 
                type="password" 
                required
                placeholder="Wpisz PESEL lub numer pacjenta"
                value={loginPesel}
                onChange={e => setLoginPesel(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl outline-none text-white font-bold transition-all border border-white/10 focus:border-white/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              />
            </div>
            
            {loginError && <p className="text-xs font-bold text-red-400 text-center">{loginError}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: secColor }}
            >
              {loading ? 'Weryfikacja...' : 'Zaloguj się do portalu'}
            </button>
          </form>
          
          <p className="text-center text-[10px] mt-8 opacity-40 font-medium" style={{ color: headColor }}>
            Bezpieczne logowanie szyfrowane SSL. Przetwarzanie danych zgodne z RODO i standardami medycznymi.
          </p>
        </motion.div>
      </div>
    )
  }

  // ==========================================
  // WIDOK GŁÓWNY (Zalogowany Pacjent)
  // ==========================================
  const upcomingAppointment = MOCK_APPOINTMENTS.find(a => a.status === 'upcoming')

  return (
    <div className="min-h-screen relative selection:bg-emerald-500 selection:text-white" style={{ backgroundColor: bgColor, color: txtColor }}>
      {/* Tła ambiwalentne */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#253a2a]/20 to-transparent pointer-events-none" />
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-20 pointer-events-none" style={{ backgroundColor: secColor }} />

      {/* HEADER NAWIGACYJNY */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: `${bgColor}E6` }}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner" style={{ backgroundColor: primColor }}>
              <HeartPulse size={20} style={{ color: secColor }} />
            </div>
            <div>
              <h2 className="font-black text-sm uppercase tracking-widest" style={{ color: headColor }}>Gunarys</h2>
              <p className="text-[9px] font-bold opacity-60">Portal Pacjenta</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase hover:bg-white/10 transition-colors"
          >
            <LogOut size={12} /> Wyloguj
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-12">
        
        {/* HERO - POWITANIE I NAJBLIŻSZA WIZYTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          <div className="flex-1 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10 w-fit" style={{ color: secColor, backgroundColor: `${secColor}10` }}>
              Twoja Strefa Zdrowia
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight" style={{ color: headColor }}>
              Dzień dobry, {patient.first_name}.
            </h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed max-w-xl">
              Witamy w zintegrowanym systemie Gunarys. Znajdziesz tu pełną historię swojego leczenia, wyniki badań oraz komunikaty z kliniki.
            </p>
          </div>

          <div className="lg:w-[400px] shrink-0 p-6 md:p-8 rounded-[32px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ backgroundColor: primColor }}>
            {/* Dekoracja na karcie */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <Calendar size={14} /> Najbliższa Wizyta
            </p>
            
            {upcomingAppointment ? (
              <>
                <h3 className="text-2xl font-black text-white mb-1">
                  {new Date(upcomingAppointment.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-3xl font-black mb-6" style={{ color: secColor }}>
                  {new Date(upcomingAppointment.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold text-white flex items-center gap-2"><User size={14} className="opacity-50"/> {upcomingAppointment.doctor}</p>
                  <p className="text-xs font-medium text-white/70 flex items-center gap-2"><MapPin size={14} className="opacity-50"/> {upcomingAppointment.location}</p>
                </div>
                <button className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/20 bg-white/10 hover:bg-white/20 transition-colors text-white">
                  Szczegóły przygotowania
                </button>
              </>
            ) : (
              <div className="py-6">
                <p className="text-white/60 text-sm font-medium mb-6">Brak zaplanowanych wizyt w najbliższym czasie.</p>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-black shadow-lg hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: secColor }}
                >
                  Umów nową wizytę
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* AKTUALNOŚCI - KINOWA KARUZELA (Zamiast Sponsorów) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2" style={{ color: headColor }}>
              <Bell size={20} style={{ color: secColor }} /> Komunikaty Kliniki
            </h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x">
            {MOCK_ANNOUNCEMENTS.map((announcement) => (
              <div 
                key={announcement.id} 
                className="shrink-0 snap-start w-[280px] md:w-[340px] p-6 rounded-[28px] border border-white/5 transition-all hover:bg-white/[0.04]"
                style={{ backgroundColor: `${cardBg}80` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    announcement.type === 'promo' ? 'bg-amber-500/20 text-amber-400' :
                    announcement.type === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {announcement.type === 'promo' ? 'Promocja' : announcement.type === 'info' ? 'Ważne' : 'Aktualność'}
                  </span>
                  <span className="text-[10px] opacity-40 font-bold">{announcement.date}</span>
                </div>
                <h4 className="text-base font-black mb-2 leading-tight" style={{ color: headColor }}>{announcement.title}</h4>
                <p className="text-xs leading-relaxed opacity-70 line-clamp-3">{announcement.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NAWIGACJA ZAKŁADEK (Zamiast modułów eventowych) */}
        <section>
          <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit mb-8">
            {[
              { id: 'wizyty', label: 'Historia Wizyt', icon: Clock },
              { id: 'historia', label: 'Wyniki & Zalecenia', icon: FileText },
              { id: 'lekarze', label: 'Mój Zespół', icon: Stethoscope }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ZAKŁADKA 1: WIZYTY (Na bazie Agendy) */}
            {activeTab === 'wizyty' && (
              <motion.div key="wizyty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black" style={{ color: headColor }}>Twoje wizyty</h3>
                  <button onClick={() => setIsBookingModalOpen(true)} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:scale-105" style={{ backgroundColor: secColor }}>
                    <Plus size={12} className="inline mr-1"/> Umów nową
                  </button>
                </div>
                
                <div className="space-y-4">
                  {MOCK_APPOINTMENTS.map((apt) => (
                    <div key={apt.id} className="p-5 md:p-6 rounded-[24px] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors hover:bg-white/[0.02]" style={{ backgroundColor: cardBg }}>
                      <div className="flex items-start gap-5">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${apt.status === 'upcoming' ? 'border-[#e8ce7a] text-[#e8ce7a]' : 'border-emerald-500/30 text-emerald-500'}`}>
                          {apt.status === 'upcoming' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                            {new Date(apt.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <h4 className="text-lg font-black text-white">{apt.specialty}</h4>
                          <p className="text-sm opacity-60 mt-1">{apt.doctor}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${apt.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {apt.status === 'upcoming' ? 'Zaplanowana' : 'Zrealizowana'}
                        </span>
                        {apt.status === 'upcoming' && (
                          <button className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/40 border border-white/10" title="Odwołaj">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ZAKŁADKA 2: DOKUMENTY (Na bazie Materiałów z pobieraniem) */}
            {activeTab === 'historia' && (
              <motion.div key="historia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-2xl font-black mb-6" style={{ color: headColor }}>Wyniki Badań i Zalecenia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_RECORDS.map((rec) => (
                    <div key={rec.id} className="p-5 rounded-[24px] border border-white/5 flex items-center justify-between gap-4 group transition-colors hover:bg-white/[0.04]" style={{ backgroundColor: cardBg }}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          {rec.type === 'zalecenia' ? <HeartPulse size={18} className="text-blue-400"/> : rec.type === 'badania' ? <Activity size={18} className="text-emerald-400"/> : <ShieldCheck size={18} className="text-amber-400"/>}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{rec.title}</h4>
                          <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mt-1">Data: {rec.date}</p>
                        </div>
                      </div>
                      <a href={rec.fileUrl} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#e8ce7a] group-hover:text-[#e8ce7a] transition-all bg-white/5">
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ZAKŁADKA 3: ZESPÓŁ MEDYCZNY (Na bazie Prelegentów ze zdjęciami) */}
            {activeTab === 'lekarze' && (
              <motion.div key="lekarze" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-2xl font-black mb-6" style={{ color: headColor }}>Lekarze prowadzący</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_DOCTORS.map((doc) => (
                    <div key={doc.id} className="rounded-[32px] overflow-hidden border border-white/10 group relative" style={{ backgroundColor: cardBg }}>
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 p-6">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: secColor }}>{doc.specialty}</p>
                          <h4 className="text-xl font-black text-white leading-tight">{doc.name}</h4>
                        </div>
                      </div>
                      <div className="p-4 flex gap-2 bg-white/5">
                        <button onClick={() => setIsBookingModalOpen(true)} className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-black bg-white hover:bg-slate-200 transition-colors">
                          Umów wizytę
                        </button>
                        <button className="w-10 h-10 shrink-0 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
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

      {/* MODAL REZERWACJI (Zastępuje modal RSVP) */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative z-10 w-full max-w-lg p-8 rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]" style={{ backgroundColor: `${cardBg}FA` }}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-white/10" style={{ color: secColor, backgroundColor: `${secColor}15` }}>
                    <Calendar size={12} /> e-Rezerwacja
                  </span>
                  <h3 className="text-2xl font-black text-white">Umów wizytę</h3>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleBookVisit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block">Specjalista</label>
                  <select required className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/30 text-white font-bold" value={bookingForm.doctorId} onChange={e => setBookingForm({...bookingForm, doctorId: e.target.value})}>
                    <option value="" className="bg-slate-900">Wybierz lekarza...</option>
                    {MOCK_DOCTORS.map(doc => <option key={doc.id} value={doc.id} className="bg-slate-900">{doc.name} - {doc.specialty}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block">Preferowany termin</label>
                  <input required type="datetime-local" className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/30 text-white font-bold" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs opacity-70 leading-relaxed mt-2">
                  To jest zgłoszenie preferencji. Ostateczny termin zostanie potwierdzony przez recepcję telefonicznie lub SMS-em.
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-black shadow-lg hover:scale-[1.02] transition-transform mt-4" style={{ backgroundColor: secColor }}>
                  Wyślij zgłoszenie
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}