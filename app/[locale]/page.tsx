import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, BarChart3, Leaf, QrCode, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

const PRODUCT_NAME = 'ANM Event Green Hub'
const PRODUCT_TAGLINE = 'platforma AI do cyrkularnego zarządzania wydarzeniami'

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | ${PRODUCT_TAGLINE}`,
  description: 'B2B platforma AI dla wydarzeń firmowych: RSVP, Event Pass, QR, catering, transport, gadżety, budżet i AI Eco / GOZ w jednym centrum pracy.',
  openGraph: {
    title: `${PRODUCT_NAME} | ${PRODUCT_TAGLINE}`,
    description: 'Firmowe centrum zarządzania wydarzeniami, RSVP, operacjami i wskaźnikami GOZ.',
    url: 'https://anmplanner-eco.vercel.app',
    type: 'website'
  }
}

const features = [
  {
    title: 'Planner B2B',
    description: 'Budżet, podwykonawcy, checklisty, harmonogram, catering, gadżety i transport w jednym panelu.',
    icon: BarChart3
  },
  {
    title: 'Publiczna strona uczestnika',
    description: 'Nowoczesna strona eventu z RSVP, wyborem menu, gadżetów, warsztatów i transportu.',
    icon: UsersRound
  },
  {
    title: 'Event Pass / QR',
    description: 'Osobne QR dla uczestnika głównego, osób towarzyszących i dzieci oraz widok obsługi eventu.',
    icon: QrCode
  },
  {
    title: 'AI Eco / GOZ',
    description: 'AI-ready wyliczenia CO₂, oszczędności papieru, food waste, ReSOLVE i rekomendacje operacyjne.',
    icon: Leaf
  }
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[#07110d] text-white overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,206,122,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.16),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e8ce7a]/30 bg-[#111c17] text-[#e8ce7a] shadow-sm">
                <Leaf size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#e8ce7a]">{PRODUCT_NAME}</p>
                <p className="text-xs font-medium text-slate-400">AI Circular Event Operations</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                href="/b2b/login"
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-[#e8ce7a]/50 hover:text-[#e8ce7a]"
              >
                Logowanie
              </Link>
              <Link
                href="/b2b/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#e8ce7a] px-4 py-2 text-xs font-black uppercase text-[#07110d] shadow-lg shadow-[#e8ce7a]/20 transition hover:bg-[#d8bd65]"
              >
                Otwórz hub <ArrowRight size={14} />
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8ce7a]/20 bg-[#e8ce7a]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8ce7a]">
                <Sparkles size={13} />
                {PRODUCT_TAGLINE}
              </div>

              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                {PRODUCT_NAME}
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-300 md:text-lg">
                Zarządzaj wydarzeniem od zgłoszenia po Event Pass: RSVP, catering, gadżety, warsztaty,
                transport, budżet, staff-pass oraz AI Eco / GOZ w jednej niezależnej platformie B2B.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/b2b/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e8ce7a] px-6 py-4 text-sm font-black uppercase tracking-wider text-[#07110d] shadow-xl shadow-[#e8ce7a]/20 transition hover:-translate-y-0.5 hover:bg-[#d8bd65]"
                >
                  Przejdź do B2B dashboardu <ArrowRight size={18} />
                </Link>
                <Link
                  href="/b2b/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#e8ce7a]/50 hover:text-[#e8ce7a]"
                >
                  Utwórz konto firmowe
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  'Publiczna strona eventu',
                  'Staff-pass / QR',
                  'Raporty AI Eco / GOZ'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-300">
                    <BadgeCheck size={15} className="text-[#e8ce7a]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#111c17]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="rounded-[24px] border border-[#e8ce7a]/15 bg-[#0b1210] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live workspace</p>
                    <h2 className="mt-1 text-2xl font-black">Centrum operacyjne</h2>
                  </div>
                  <div className="rounded-2xl bg-[#e8ce7a]/10 p-3 text-[#e8ce7a]">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {features.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8ce7a]/10 text-[#e8ce7a]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">{title}</h3>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
