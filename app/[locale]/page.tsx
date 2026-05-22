import { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound
} from 'lucide-react'

const PRODUCT_NAME = 'ANM ClinicOps'
const PRODUCT_TAGLINE = 'system zarządzania pacjentem w klinice medycznej'

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | ${PRODUCT_TAGLINE}`,
  description:
    'Platforma CRM/ClinicOps dla placówek medycznych: historia pacjenta, pierwszy kontakt, zgody, follow-up, ścieżka pacjenta i analityka efektywności kliniki.',
  openGraph: {
    title: `${PRODUCT_NAME} | ${PRODUCT_TAGLINE}`,
    description:
      'Zintegrowane centrum pracy kliniki medycznej dla recepcji, koordynatorów, lekarzy i managerów.',
    url: 'https://anm-clinicops.vercel.app',
    type: 'website'
  }
}

const features = [
  {
    title: 'Pacjent 360',
    description:
      'Jedna karta pacjenta: dane kontaktowe, historia wizyt, plan procedur, statusy powrotów i notatki zespołu.',
    icon: UsersRound
  },
  {
    title: 'Pierwszy kontakt',
    description:
      'Rejestracja leadów, źródeł zapytań, jakości rozmów, konwersji na wizyty i zadań dla recepcji.',
    icon: PhoneCall
  },
  {
    title: 'Zgody i dokumentacja',
    description:
      'Checklisty zgód, dokumenty zabiegowe, status kompletności oraz uporządkowany obieg informacji.',
    icon: FileCheck2
  },
  {
    title: 'Analityka kliniki',
    description:
      'Dashboard nowych pacjentów, powracalności, wartości wizyt, popularności procedur i efektywności zespołu.',
    icon: BarChart3
  }
]

const pillars = [
  'CRM dopasowany do medycyny estetycznej i placówek wielospecjalistycznych',
  'Automatyczne follow-upy po wizytach, zabiegach i konsultacjach',
  'Cyfrowa ścieżka pacjenta od zapytania do kolejnej procedury'
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[#071016] text-white overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.16),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-sm">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">{PRODUCT_NAME}</p>
                <p className="text-xs font-medium text-slate-400">Medical CRM & Patient Operations</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                href="/b2b/login"
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
              >
                Logowanie
              </Link>
              <Link
                href="/b2b/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-4 py-2 text-xs font-black uppercase text-[#071016] shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-100"
              >
                Otwórz system <ArrowRight size={14} />
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles size={13} />
                {PRODUCT_TAGLINE}
              </div>

              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                {PRODUCT_NAME}
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-300 md:text-lg">
                Zintegrowane centrum pracy kliniki: pacjent 360, recepcja, ścieżka zabiegowa,
                zgody medyczne, follow-upy oraz analityka jakości obsługi i efektywności placówki.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/b2b/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-200 px-6 py-4 text-sm font-black uppercase tracking-wider text-[#071016] shadow-xl shadow-cyan-300/10 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                >
                  Przejdź do ClinicOps <ArrowRight size={18} />
                </Link>
                <Link
                  href="/b2b/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  Utwórz konto kliniki
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {pillars.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-300">
                    <BadgeCheck size={15} className="shrink-0 text-cyan-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#101a22]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="rounded-[24px] border border-cyan-300/15 bg-[#0b1218] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live workspace</p>
                    <h2 className="mt-1 text-2xl font-black">Centrum pacjenta</h2>
                  </div>
                  <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {features.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
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

                <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 p-4">
                  <div className="flex items-center gap-3 text-emerald-200">
                    <Activity size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Patient Experience Ready</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Projektujemy workflow pod realną pracę recepcji, koordynatora i zespołu medycznego.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}