'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { getTasksForEventType } from '../../lib/taskLibrary'
import { 
  MapPin, Clock, Sparkles, Heart, Baby, Gift, 
  BookOpen, Crown, CalendarHeart, ChevronLeft, Lock, Globe,
  PartyPopper, Image as ImageIcon
} from 'lucide-react'

// Konfiguracja typów wydarzeń - skopiowana 1:1 z Twojego Dashboardu
const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; badge: string; badgeText: string; photo: string }> = {
  slub:          { label: 'Ślub i Wesele', icon: '💍', badge: 'bg-rose-100',   badgeText: 'text-rose-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/03/para-mloda.webp' },
  chrzciny:      { label: 'Chrzciny',      icon: '🕊️', badge: 'bg-sky-100',    badgeText: 'text-sky-700',     photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/chrzciny.webp' },
  komunia:       { label: 'Komunia',       icon: '✝️', badge: 'bg-indigo-100', badgeText: 'text-indigo-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/komunia.webp' },
  urodziny:      { label: 'Urodziny',      icon: '🎂', badge: 'bg-amber-100',  badgeText: 'text-amber-700',   photo: 'https://anmcollective.pl/wp-content/uploads/2026/03/prezentyy.webp' },
  urodziny18:    { label: '18-stka',       icon: '🎉', badge: 'bg-violet-100', badgeText: 'text-violet-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/18.webp' },
  baby_shower:   { label: 'Baby Shower',   icon: '🍼', badge: 'bg-pink-100',   badgeText: 'text-pink-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/babyshower.webp' },
  gender_reveal: { label: 'Gender Reveal', icon: '💙', badge: 'bg-blue-100',   badgeText: 'text-blue-700',    photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/genderrevue.webp' },
  jubileusz:     { label: 'Jubileusz',     icon: '🏆', badge: 'bg-yellow-100', badgeText: 'text-yellow-700',  photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/jubileusz.webp' },
  rocznica:      { label: 'Rocznica',      icon: '💑', badge: 'bg-red-100',    badgeText: 'text-red-700',     photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/roczmice.webp' },
  inne:          { label: 'Inne',          icon: '🗓️', badge: 'bg-slate-100',  badgeText: 'text-slate-600',   photo: 'https://anmcollective.pl/wp-content/uploads/2026/04/inne.webp' },
}

const EVENT_TYPES_KEYS = Object.keys(EVENT_TYPE_CONFIG)

// Logika formularza
const NEEDS_CEREMONY = ['slub', 'komunia', 'chrzciny']
const COMING_SOON_SITES: string[] = [] // Odblokowane!

export default function NewEventPage() {
  const [step, setStep] = useState(1)
  
  // Dane Krok 1 & 2
  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')

  // Dane Krok 3 (Szczegóły i strona WWW)
  const [heroNames, setHeroNames] = useState('')
  const [ceremonyInfo, setCeremonyInfo] = useState('')
  const [partyInfo, setPartyInfo] = useState('')
  const [mapIframe, setMapIframe] = useState('')
  const [heroImgLeft, setHeroImgLeft] = useState('')
  const [heroImgCenter, setHeroImgCenter] = useState('')
  const [heroImgRight, setHeroImgRight] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const totalSteps = COMING_SOON_SITES.includes(type) ? 2 : 3

  async function handleCreate() {
    if (!title || !type) { setError('Wpisz roboczą nazwę wydarzenia i wybierz typ.'); return }
    setLoading(true)
    setError('')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    
    const { data, error: err } = await supabase.from('events').insert({
      user_id: user.id,
      type,
      title,
      event_date: date || null,
      guest_count: guestCount ? parseInt(guestCount) : null,
      budget: budget ? parseFloat(budget) : null,
      notes,
      hero_names: heroNames,
      ceremony_info: NEEDS_CEREMONY.includes(type) ? ceremonyInfo : null,
      party_info: partyInfo,
      map_iframe: mapIframe,
      hero_img_left: heroImgLeft,
      hero_img_center: heroImgCenter,
      hero_img_right: heroImgRight
    }).select().single()
    
    if (err) { setLoading(false); setError(err.message); return }

    // Seedowanie zadań z biblioteki
    const initialTasks = getTasksForEventType(type).map(({ title, stage, category, points }) => ({
      title,
      stage,
      category,
      points,
      event_id: data.id,
      status: false,
    }))
    await supabase.from('tasks').insert(initialTasks)

    setLoading(false)
    router.push(`/dashboard/events/${data.id}`)
  }

  const goNextFromStep2 = () => {
    if (!title) { setError('Robocza nazwa wydarzenia jest wymagana.'); return }
    setError('')
    if (totalSteps === 2) {
      handleCreate()
    } else {
      if (!heroNames) setHeroNames(title)
      setStep(3)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F5] font-sans flex items-center justify-center py-12 px-4 sm:px-6 relative selection:bg-[#cba052] selection:text-white">
      
      {/* Dodanie identycznych fontów co w aplikacji */}
      <style dangerouslySetInnerHTML={{__html: `
        .font-heading { font-family: 'Life Savers', cursive; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .bg-texture { background-image: url('https://www.transparenttextures.com/patterns/handmade-paper.png'); }
        .input-elegant {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #253a2a;
          outline: none;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .input-elegant:focus {
          border-color: #cba052;
          box-shadow: 0 0 0 3px rgba(203, 160, 82, 0.15);
        }
        .input-elegant::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
      `}} />

      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 border border-[#e8ce7a]/20 bg-texture">
        
        {/* ========================================================= */}
        {/* NAGŁÓWEK FORMULARZA */}
        {/* ========================================================= */}
        <div className="bg-[#2A3B32] p-8 md:p-10 relative overflow-hidden shrink-0">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#cba052] opacity-15 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard')} 
            className="relative z-10 text-[#e8ce7a] hover:text-white text-sm mb-6 flex items-center gap-1.5 font-bold transition-colors w-fit"
          >
            <ChevronLeft size={16} /> {step > 1 ? 'Wróć do poprzedniego kroku' : 'Anuluj i wróć do planera'}
          </button>

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#cba052] mb-2">Konfigurator</p>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-white mb-2">Nowe Wydarzenie</h1>
            <p className="text-[#A3B8AD] text-sm font-medium">Uzupełnij dane, abyśmy mogli perfekcyjnie przygotować Twój planer.</p>
          </div>

          <div className="flex gap-2 mt-8 relative z-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#cba052] shadow-[0_0_15px_rgba(203,160,82,0.6)]' : 'bg-white/10'}`}/>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#cba052] shadow-[0_0_15px_rgba(203,160,82,0.6)]' : 'bg-white/10'}`}/>
            {totalSteps === 3 && (
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#cba052] shadow-[0_0_15px_rgba(203,160,82,0.6)]' : 'bg-white/10'}`}/>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10">
          
          {/* ========================================================= */}
          {/* KROK 1: TYP WYDARZENIA */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-1 text-[#2A3B32]">Jakie wydarzenie organizujesz?</h2>
              <p className="text-sm text-slate-500 mb-8">Wybierz główny motyw. Wygląd i listy zadań dostosują się automatycznie.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {EVENT_TYPES_KEYS.map(key => {
                  const ev = EVENT_TYPE_CONFIG[key]
                  const isSelected = type === key

                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`group relative rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-32 md:h-40 border-2 ${isSelected ? 'border-[#cba052] ring-4 ring-[#e8ce7a]/30 shadow-xl scale-[1.02]' : 'border-transparent shadow-sm hover:shadow-md'}`}
                    >
                      <div
                        className={`absolute inset-0 transition-transform duration-700 ease-out ${isSelected ? 'scale-110' : 'group-hover:scale-105'} opacity-60 mix-blend-luminosity`}
                        style={{ backgroundImage: `url(${ev.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2A3B32' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

                      <div className="absolute inset-0 p-4 flex flex-col justify-end z-20 text-left">
                        <div className="text-2xl mb-1">{ev.icon}</div>
                        <h3 className="font-serif text-lg font-extrabold text-white drop-shadow-md leading-tight">
                          {ev.label}
                        </h3>
                      </div>
                    </button>
                  )
                })}
              </div>

              {error && <p className="text-red-500 text-sm mt-6 text-center font-bold">{error}</p>}

              <button
                onClick={() => { if (!type) { setError('Wybierz typ eventu z listy.'); return } setError(''); setStep(2) }}
                className="mt-10 w-full bg-gradient-to-r from-[#e8ce7a] to-[#cba052] text-[#2A3B32] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Przejdź dalej
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* KROK 2: DANE PRYWATNE */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
              
              <div className="flex items-center justify-between mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-2xl">
                    {EVENT_TYPE_CONFIG[type]?.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Wybrany typ</p>
                    <h2 className="text-base font-black text-[#2A3B32]">{EVENT_TYPE_CONFIG[type]?.label}</h2>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[#cba052] font-bold hover:underline">Zmień</button>
              </div>

              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock size={18} className="text-[#cba052]" />
                <h3 className="font-bold text-[#2A3B32] text-lg">Prywatne ustawienia planera</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 italic">
                Wszystkie poniższe informacje są całkowicie prywatne i będą widoczne <strong>tylko dla Ciebie</strong> wewnątrz Twojego wirtualnego organizera. Nikt z gości nie ma do nich dostępu.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Robocza nazwa wydarzenia *</label>
                  <input
                    type="text"
                    placeholder={type === 'slub' ? 'np. Przygotowania - Mój Ślub' : 'Wpisz jak chcesz widzieć projekt w panelu'}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="input-elegant"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">Widoczna tylko dla Ciebie (nie dla gości).</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kiedy odbędzie się impreza?</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input-elegant uppercase text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">Na tej podstawie uruchomimy odliczanie.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ilu gości planujesz?</label>
                    <input
                      type="number"
                      placeholder="np. 80"
                      value={guestCount}
                      onChange={e => setGuestCount(e.target.value)}
                      className="input-elegant"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Twój budżet (zł)</label>
                    <input
                      type="number"
                      placeholder="np. 25000"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Prywatne notatki (Opcjonalnie)</label>
                  <textarea
                    placeholder="Wpisz tu pierwsze pomysły lub wstępne założenia..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="input-elegant resize-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-6 text-center font-bold">{error}</p>}

              <button
                onClick={goNextFromStep2}
                disabled={loading}
                className="mt-10 w-full bg-gradient-to-r from-[#e8ce7a] to-[#cba052] text-[#2A3B32] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? 'Konfigurowanie...' : (totalSteps === 2 ? 'Rozpocznij planowanie ✨' : 'Przejdź do strony e-Zaproszenia')}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* KROK 3: DANE PUBLICZNE (WWW) */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
              
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe size={18} className="text-emerald-500" />
                <h3 className="font-bold text-[#2A3B32] text-lg">Konfiguracja wizytówki (e-Zaproszenie)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">
                Dane w tej sekcji będą <strong>widoczne na Twojej publicznej stronie WWW</strong> (jeśli zdecydujesz się ją podpiąć do planera). Wypełnij je teraz lub zrób to w każdej chwili z wnętrza swojego panelu (Klikając ikonę Zębatki).
              </p>

              <div className="space-y-6">
                
                {/* POWITANIE NA STRONIE */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-[#cba052]"/>
                    <h4 className="font-black text-slate-800 text-sm">Główny baner powitalny (Hero)</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Główny napis widoczny dla gości</label>
                      <input 
                        value={heroNames} 
                        onChange={e => setHeroNames(e.target.value)} 
                        placeholder={type === 'slub' ? 'np. Kasia & Tomek' : 'np. Chrzest Święty Kubusia'} 
                        className="input-elegant font-serif text-lg" 
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <ImageIcon size={12}/> Linki do 3 zdjęć okładkowych (Opcjonalnie)
                      </label>
                      <p className="text-[10px] text-slate-500 mb-3">Wklej linki URL do swoich zdjęć (np. z Dysku Google lub Cloudinary).</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input value={heroImgLeft} onChange={e => setHeroImgLeft(e.target.value)} placeholder="URL Lewy" className="input-elegant text-xs !py-2.5" />
                        <input value={heroImgCenter} onChange={e => setHeroImgCenter(e.target.value)} placeholder="URL Środkowy" className="input-elegant text-xs !py-2.5" />
                        <input value={heroImgRight} onChange={e => setHeroImgRight(e.target.value)} placeholder="URL Prawy" className="input-elegant text-xs !py-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOGISTYKA NA STRONIE */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-[#cba052]"/>
                    <h4 className="font-black text-slate-800 text-sm">Logistyka dla zaproszonych</h4>
                  </div>
                  
                  {NEEDS_CEREMONY.includes(type) && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Adres Ceremonii (Kościół / Urząd)</label>
                      <textarea 
                        value={ceremonyInfo} 
                        onChange={e => setCeremonyInfo(e.target.value)} 
                        placeholder="np. 15 Sierpnia 2027, 16:00&#10;Kościół św. Anny, ul. Długa 1&#10;Miastowo" 
                        rows={3} 
                        className="input-elegant resize-none text-sm" 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Adres Przyjęcia / Imprezy</label>
                    <textarea 
                      value={partyInfo} 
                      onChange={e => setPartyInfo(e.target.value)} 
                      placeholder="np. Dworek pod Lipami&#10;Ul. Leśna 12&#10;Miastkowo" 
                      rows={3} 
                      className="input-elegant resize-none text-sm" 
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={12}/> Generowanie interaktywnej Mapy</label>
                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                      Zamiast zwykłego tekstu, możemy wyświetlić gościom klikalną mapę z nawigacją do Twojej sali. Znajdź salę na Google Maps, kliknij "Udostępnij" -&gt; "Umieść mapę" i wklej poniżej fragment tekstu z ramki `src="..."`.
                    </p>
                    <input 
                      value={mapIframe} 
                      onChange={e => setMapIframe(e.target.value)} 
                      placeholder="https://www.google.com/maps/embed?pb=..." 
                      className="input-elegant text-xs font-mono !py-3" 
                    />
                  </div>
                </div>

              </div>

              {error && <p className="text-red-500 text-sm mt-6 text-center font-bold">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="mt-10 w-full bg-[#2A3B32] hover:bg-black text-[#e8ce7a] py-4 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                {loading ? 'Konfigurowanie planera...' : 'Zapisz i Otwórz Planer ✨'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}