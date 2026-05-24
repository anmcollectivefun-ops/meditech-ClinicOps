import { Metadata } from 'next'
import Link from 'next/link'
import ClinicThemeToggle from '../components/ClinicThemeToggle'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
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
    <main className="clinic-shell min-h-screen overflow-hidden">
      <section className="relative">
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-sm">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{PRODUCT_NAME}</p>
                <p className="clinic-muted text-xs font-medium">Medical CRM & Patient Operations</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <ClinicThemeToggle />
              <Link
                href="/b2b/login"
                className="clinic-secondary-button rounded-full px-4 py-2 text-xs font-bold transition hover:border-cyan-300/50 hover:text-cyan-300"
              >
                Logowanie
              </Link>
              <Link
                href="/b2b/dashboard"
                className="clinic-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-100"
              >
                Otwórz system <ArrowRight size={14} />
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles size={13} />
                {PRODUCT_TAGLINE}
              </div>

              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                {PRODUCT_NAME}
              </h1>

              <p className="clinic-muted mt-6 max-w-2xl text-base font-medium leading-8 md:text-lg">
                Zintegrowane centrum pracy kliniki: pacjent 360, recepcja, ścieżka zabiegowa,
                zgody medyczne, follow-upy oraz analityka jakości obsługi i efektywności placówki.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/b2b/dashboard"
                  className="clinic-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-wider shadow-xl shadow-cyan-300/10 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                >
                  Przejdź do ClinicOps <ArrowRight size={18} />
                </Link>
                <Link
                  href="/b2b/register"
                  className="clinic-secondary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-wider transition hover:border-cyan-300/50 hover:text-cyan-300"
                >
                  Utwórz konto kliniki
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {pillars.map((item) => (
                  <div key={item} className="clinic-surface-soft flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold clinic-muted">
                    <BadgeCheck size={15} className="shrink-0 text-cyan-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="clinic-surface rounded-[32px] p-4 backdrop-blur">
              <div className="clinic-surface-soft rounded-[24px] p-5">
                <div className="flex items-center justify-between border-b border-[var(--clinic-border)] pb-5">
                  <div>
                    <p className="clinic-muted text-[10px] font-black uppercase tracking-[0.2em]">Live workspace</p>
                    <h2 className="mt-1 text-2xl font-black">Centrum pacjenta</h2>
                  </div>
                  <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-300">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {features.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="clinic-surface-soft rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black">{title}</h3>
                          <p className="clinic-muted mt-1 text-xs leading-5">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 p-4">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Activity size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Patient Experience Ready</p>
                  </div>
                  <p className="clinic-muted mt-2 text-xs leading-5">
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
