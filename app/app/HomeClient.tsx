'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Sparkles, CalendarHeart, Users, Wallet, CheckSquare, 
  ArrowRight, Zap, HeartHandshake, Lightbulb, Smartphone, Download,
  MonitorPlay, Palette, Share, PlusSquare
} from 'lucide-react'

import { usePWAInstall } from './hooks/usePWAInstall'

const ASSETS = {
  hero: 'https://anmcollective.fun/wp-content/uploads/2026/04/kafelki.webp',
  woman: 'https://anmcollective.fun/wp-content/uploads/2026/04/Kobieta_trzyma_telefon_202604250757.webp',
  themes: 'https://anmcollective.fun/wp-content/uploads/2026/04/motywy.webp',
  summary: 'https://anmcollective.fun/wp-content/uploads/2026/04/zestawienie-apki.png',
  logo: 'https://anmcollective.fun/wp-content/uploads/2026/02/logo-bez-tla.png'
}

export default function HomeClient() {
  const [mounted, setMounted] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  // Inicjalizacja rozszerzonego hooka
  const { triggerInstall, isInstallable, isInstalled, isIOS, isStandalone } = usePWAInstall()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Centralna logika decydująca o wyświetleniu przycisku
  const showInstallButton = (!isInstalled && isInstallable) || (isIOS && !isStandalone)

  // Centralna funkcja wywoływana przy kliknięciu przycisku PWA
  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true)
    } else if (isInstallable) {
      triggerInstall()
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] overflow-hidden selection:bg-[#e8ce7a] selection:text-[#253a2a]" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
      
      {/* --- CZCIONKI, ANIMACJE I STYLE --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Life+Savers:wght@700;800&family=Montserrat+Alternates:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        
        .font-heading { font-family: 'Life Savers', cursive; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }

        /* ── ANIMACJE TŁA I KART ── */
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        @keyframes float-delayed { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        
        /* ── OŻYWIONY PRZYCISK POBIERANIA ── */
        @keyframes shake-and-pulse { 
          0%, 100% { transform: rotate(0deg) scale(1); } 
          10%, 30%, 50%, 70%, 90% { transform: rotate(-2deg) scale(1.05); } 
          20%, 40%, 60%, 80% { transform: rotate(2deg) scale(1.05); } 
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 2s; }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animate-shake-pulse { animation: shake-and-pulse 4s infinite; }
      `}} />

      {/* MODAL Z INSTRUKCJĄ DLA IOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-[90vw] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSInstructions(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors">
              ✕
            </button>
            <h3 className="text-xl font-extrabold text-[#253a2a] mb-2 font-heading">Instalacja na iOS</h3>
            <p className="text-sm text-[#6a716c] font-medium mb-6 leading-relaxed">System iOS wymaga ręcznego dodania aplikacji do ekranu. To tylko dwa proste kroki!</p>
            <ol className="text-sm text-gray-800 space-y-4 mb-8">
              <li className="flex items-center gap-4 bg-[#f0f5f3] p-3 rounded-xl">
                <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white shadow-sm border border-[#253a2a]/10"><Share size={18} className="text-[#3b82f6]" /></span>
                <span className="font-medium">1. Stuknij ikonę <strong className="text-[#253a2a]">Udostępnij</strong> w menu na dole ekranu.</span>
              </li>
              <li className="flex items-center gap-4 bg-[#f0f5f3] p-3 rounded-xl">
                <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white shadow-sm border border-[#253a2a]/10"><PlusSquare size={18} className="text-[#253a2a]" /></span>
                <span className="font-medium">2. Wybierz opcję <strong className="text-[#253a2a]">Do ekranu głównego.</strong></span>
              </li>
            </ol>
            <button onClick={() => setShowIOSInstructions(false)} className="w-full py-4 bg-[#253a2a] text-[#e8ce7a] rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#253a2a]/30 transition-all hover:-translate-y-1">
              Zrozumiałem
            </button>
          </div>
        </div>
      )}

      {/* --- TŁO (BLOBY W BARWACH MARKI) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[0%] left-[-10%] w-96 h-96 bg-[#e8ce7a] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[#8ab895] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] bg-[#8b3a4a] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      {/* --- TOP LOGO --- */}
      <div className="w-full flex justify-center pt-10 pb-4 relative z-20 animate-in fade-in slide-in-from-top-4 duration-700">
        <Link href="/" className="inline-block transition-transform hover:scale-105 hover:-translate-y-1">
          <Image 
            src={ASSETS.logo} 
            alt="ANM Collective Logo" 
            width={200} 
            height={100} 
            priority
            className="w-32 md:w-40 h-auto drop-shadow-xl" 
          />
        </Link>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f0f5f3] border border-[#253a2a]/20 text-[#253a2a] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cba052] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#cba052]"></span></span>
            Twój Wirtualny Organizer
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#253a2a] leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 font-heading">
            Zaplanuj z nami <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cba052] to-[#e8ce7a]">każdy detal.</span>
          </h1>
          <p className="text-xl text-[#000] font-serif font-bold italic mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Baw się, planuj i zapisuj — całkowicie za darmo.
          </p>
          <p className="text-base text-[#000] font-semibold mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Odhaczaj zadania, zarządzaj budżetem i zapanuj nad chaosem gości w jednym pięknym i darmowym miejscu.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            {/* PRZYCISK: WEB / KOMPUTER */}
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#253a2a] hover:bg-[#1a291e] text-[#e8ce7a] rounded-full font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#253a2a]/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              <MonitorPlay size={18} /> Używaj w przeglądarce
            </Link>

            {/* PRZYCISK: POBRANIE PWA (ŻYWY I KUSZĄCY) */}
            {showInstallButton && (
              <button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#cba052] to-[#e8ce7a] text-[#253a2a] rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#cba052]/40 transition-all hover:shadow-2xl animate-shake-pulse flex items-center justify-center gap-2"
              >
                <Smartphone size={18} /> Zainstaluj Aplikację
              </button>
            )}
          </div>
          <p className="text-[10px] font-bold text-[#6a716c] uppercase tracking-widest mt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">Dostępne na komputer i telefon</p>
        </div>

        {/* Hero Visuals - WYCIĄGNIĘTE KAFELKI Z APLIKACJI */}
        <div className="flex-1 relative w-full h-[400px] lg:h-[500px] animate-in fade-in zoom-in duration-1000 delay-300 flex items-center justify-center">
          <div className="relative z-10 w-[110%] md:w-[130%] -ml-4 md:-ml-12 h-auto animate-float">
            <Image 
              src={ASSETS.hero} 
              alt="Interfejs ANM Planner" 
              width={1200}
              height={900}
              priority
              className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 rounded-[32px]" 
            />
          </div>
        </div>
      </section>

      {/* --- DARMOWE FUNKCJE I KOBIETA Z TELEFONEM --- */}
      <section className="py-24 px-6 relative z-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-16 items-center mb-16">
            <div className="flex-1 w-full relative group">
              <div className="absolute inset-0 bg-[#cba052]/20 rounded-[40px] rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-700"></div>
              <Image 
                src={ASSETS.woman} 
                alt="Uśmiechnięta kobieta z telefonem" 
                width={800}
                height={800}
                className="relative z-10 w-full h-auto rounded-[32px] shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f0f5f3] text-[#253a2a] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <CalendarHeart size={14} /> Planer za 0 zł
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-[#253a2a] mb-6">
                Cała moc planera w Twojej kieszeni
              </h2>
              <p className="text-[#6a716c] font-medium mb-10 leading-relaxed text-lg">
                Zapomnij o grubych notesach i gubiących się kartkach. Wszystko masz pod ręką – w autobusie, na kanapie i u florystki. Poniżej tylko część z tego, co potrafi aplikacja.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Users />} title="Baza Gości" desc="Śledź potwierdzenia RSVP, diety, noclegi i transport." />
            <FeatureCard icon={<Wallet />} title="Budżet" desc="Miej finanse pod kontrolą. Zapisuj wydatki i raty." />
            <FeatureCard icon={<CheckSquare />} title="Inteligentne Zadania" desc="Grywalizacja i zdobywanie poziomów w organizacji." />
            <FeatureCard icon={<HeartHandshake />} title="Baza Usług" desc="Porównuj oferty i zarządzaj umowami." />
            <FeatureCard icon={<Lightbulb />} title="Tablica Inspiracji" desc="Twórz prywatne moodboardy, dobieraj palety kolorów i planuj motyw przewodni wesela." />
            <FeatureCard icon={<CalendarHeart />} title="Wiele Wydarzeń" desc="Ślub? Chrzciny? A może rocznica? W jednym koncie zaplanujesz każde ważne wydarzenie w życiu." />
          </div>

          {/* DODATKOWE BUTTONY PO ŚRODKU STRONY */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#253a2a] hover:bg-[#1a291e] text-[#e8ce7a] rounded-full font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#253a2a]/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              <MonitorPlay size={18} /> Używaj w przeglądarce
            </Link>

            {showInstallButton && (
              <button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#cba052] to-[#e8ce7a] text-[#253a2a] rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-[#cba052]/40 transition-all hover:shadow-2xl animate-shake-pulse flex items-center justify-center gap-2"
              >
                <Smartphone size={18} /> Zainstaluj Aplikację
              </button>
            )}
          </div>

        </div>
      </section>

      {/* --- SYSTEM MOTYWÓW --- */}
      <section className="py-24 px-6 relative z-20 bg-[#FCFBF9]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-16 items-center">
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              <Palette size={14} /> Personalizacja
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-[#253a2a] mb-6">
              Dopasuj planer pod swój gust
            </h2>
            <p className="text-[#6a716c] font-medium mb-8 leading-relaxed text-lg">
              Lubisz klasyczną czerń, szałwiową zieleń, a może pastelowy róż? Zmień motyw aplikacji jednym kliknięciem. Wybierz spośród 13 luksusowych kompozycji i planuj w otoczeniu barw, które Cię inspirują.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-bold text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2A3B32] shadow-md border-2 border-white"></div> Butelkowa Zieleń</li>
              <li className="flex items-center gap-3 font-bold text-slate-700"><div className="w-4 h-4 rounded-full bg-[#D4AF37] shadow-md border-2 border-white"></div> Złoty Luksus</li>
              <li className="flex items-center gap-3 font-bold text-slate-700"><div className="w-4 h-4 rounded-full bg-[#C59B99] shadow-md border-2 border-white"></div> Pudrowy Róż</li>
            </ul>
          </div>

          <div className="flex-1 w-full relative group">
            <Image 
              src={ASSETS.themes} 
              alt="Wybór motywów w ANM Planner" 
              width={1000}
              height={800}
              className="relative z-10 w-full h-auto drop-shadow-2xl rounded-[32px] group-hover:scale-[1.03] transition-transform duration-700 animate-float-delayed"
            />
          </div>

        </div>
      </section>

      {/* --- MAGIA E-ZAPROSZENIA (PREMIUM) --- */}
      <section className="py-28 px-6 relative overflow-hidden bg-[#253a2a] border-t border-[#cba052]/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[#cba052]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute right-[-5%] top-[10%] text-[30rem] leading-none opacity-5 text-[#e8ce7a] font-serif pointer-events-none select-none">✦</div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#e8ce7a]/30 text-[#e8ce7a] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-white/5">
                <Zap size={14} /> Chcesz więcej? Zamów stronę!
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-[#f5ebe0] mb-6 leading-tight">
                Zautomatyzuj komunikację z gośćmi
              </h2>
              <p className="text-lg text-white/80 font-light italic font-serif mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Podaj Kod swojego Eventu podczas zakupu e-Zaproszenia. Po 24-72h nasza ekipa zepnie Twoją stronę z planerem. <strong className="text-[#e8ce7a] font-bold font-sans not-italic">Wszystkie dane od gości zaczną spływać automatycznie!</strong>
              </p>

              <div className="space-y-4 text-left mb-12">
                <MagicFeature title="Zautomatyzowane RSVP" desc="Goście wypełniają ankietę na stronie, a Twój planer automatycznie odhacza ich obecność, dietę i osoby towarzyszące." />
                <MagicFeature title="Playlisty i Kapsuła Czasu" desc="Piosenki do DJ-a oraz życzenia w przyszłość od gości spływają bezpośrednio do Twojego panelu." />
                <MagicFeature title="Prezenty zablokowane" desc="Publikujesz listę marzeń. Gość klika 'Rezerwuję' na stronie – nikt nie kupi dwa razy tego samego!" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="https://sklep.anmcollective.pl/product-category/cyfrowe-zaproszenia-i-strony-eventowe-z-planerem-anm/" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-transparent border-2 border-[#e8ce7a] text-[#e8ce7a] rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#e8ce7a] hover:text-[#253a2a] transition-all flex items-center justify-center gap-2">
                  <Smartphone size={16} /> Zamów e-Zaproszenie
                </a>
              </div>
            </div>

            <div className="flex-1 w-full relative animate-float">
              {/* PODSUMOWANIE APKI */}
              <Image 
                src={ASSETS.summary} 
                alt="Automatyzacja aplikacji" 
                width={800}
                height={800}
                className="w-full h-auto drop-shadow-2xl rounded-[32px] hover:scale-105 transition-transform duration-700 relative z-20" 
              />
              <div className="absolute inset-0 bg-[#cba052] opacity-20 blur-3xl rounded-full z-10"></div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STOPKA / CTA --- */}
      <section className="py-24 px-6 text-center relative overflow-hidden bg-[#FCFBF9]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          
          {/* DOLNE LOGO */}
          <Link href="/" className="inline-block mb-10 transition-transform hover:scale-105 hover:-translate-y-1">
            <Image 
              src={ASSETS.logo} 
              alt="ANM Collective Logo" 
              width={160} 
              height={80} 
              className="w-28 h-auto drop-shadow-md opacity-90 hover:opacity-100 transition-opacity" 
            />
          </Link>

          <div className="text-xs font-bold text-[#cba052] uppercase tracking-[0.3em] mb-4">Gotowi na bezstresowe planowanie?</div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-[#253a2a] mb-6">Przejmij pełną kontrolę nad swoim wielkim dniem.</h2>
          <p className="text-[#6a716c] mb-10 text-lg leading-relaxed">Rozpocznij korzystanie z planera w przeglądarce lub zainstaluj aplikację na swoim telefonie.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#253a2a] hover:bg-[#1a2b1e] text-[#e8ce7a] rounded-full font-bold text-xs uppercase tracking-[0.15em] shadow-xl shadow-[#253a2a]/20 transition-all hover:-translate-y-1">
              <MonitorPlay size={18} /> Używaj na Komputerze
            </Link>

            {/* MIEJSCE 3: PRZYCISK POBIERANIA W STOPCE */}
            {showInstallButton && (
              <button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#cba052] hover:bg-[#e8ce7a] text-[#253a2a] rounded-full font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-[#cba052]/20 transition-all hover:-translate-y-1 animate-shake-pulse"
              >
                <Smartphone size={18} /> Zainstaluj na Telefon
              </button>
            )}
          </div>

        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[24px] border border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl hover:border-[#cba052]/30 transition-all group duration-300 relative overflow-hidden">
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[#f0f5f3] text-[#253a2a] transition-transform group-hover:scale-110 shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[#253a2a] mb-3 tracking-wide">{title}</h3>
        <p className="text-sm text-[#6a716c] leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  )
}

function MagicFeature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#e8ce7a]/20 text-[#e8ce7a] flex items-center justify-center shrink-0 mt-1">
        <CheckSquare size={16} />
      </div>
      <div>
        <h4 className="text-white font-bold text-base mb-1 tracking-wide">{title}</h4>
        <p className="text-white/50 text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  )
}