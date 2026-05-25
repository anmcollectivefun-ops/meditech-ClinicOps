'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound
} from 'lucide-react'

const demoEventId = process.env.NEXT_PUBLIC_DEMO_EVENT_ID || ''
const demoPortalSlug = process.env.NEXT_PUBLIC_DEMO_PORTAL_SLUG || 'integracja'
const demoReceptionToken = process.env.NEXT_PUBLIC_DEMO_RECEPTION_TOKEN || ''
const demoDoctorToken = process.env.NEXT_PUBLIC_DEMO_DOCTOR_TOKEN || ''

export default function ClinicOpsDemoPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'pl'
  const managerHref = demoEventId ? `/${locale}/b2b/events/${demoEventId}?demo=1` : `/${locale}/b2b/login`
  const portalHref = `/${locale}/join/${demoPortalSlug}?demo=1`
  const receptionHref = demoReceptionToken ? `/${locale}/staff-pass/${demoReceptionToken}?demo=1` : ''
  const doctorHref = demoDoctorToken ? `/${locale}/staff-pass/${demoDoctorToken}?demo=1` : ''

  const modules = [
    {
      title: 'CRM pacjenta',
      desc: 'Centralna karta pacjenta z wizytami, dokumentami, statusem zgód, historią i komunikacją.',
      icon: UsersRound
    },
    {
      title: 'Dokumenty i zgody',
      desc: 'Szablony zgód, wywiady medyczne, RODO, zalecenia i statusy podpisu widoczne dla zespołu.',
      icon: FileText
    },
    {
      title: 'Komunikacja i follow-up',
      desc: 'Portal pacjenta, historia rozmów, SMS, e-mail, szkice AI i automatyczne działania po wizycie.',
      icon: Mail
    },
    {
      title: 'AI Patient Experience',
      desc: 'Rekomendacje kolejnych kroków, przypomnienia, kontrola powrotów i analiza jakości obsługi.',
      icon: Sparkles
    },
    {
      title: 'Analityka kliniki',
      desc: 'Dashboardy KPI: nowi pacjenci, powracalność, wartość wizyt, popularność zabiegów i efektywność.',
      icon: BarChart3
    },
    {
      title: 'Praca personelu',
      desc: 'Widoki dla managera, recepcji i lekarza, grafiki, zadania oraz dostęp do danych według roli.',
      icon: ClipboardList
    }
  ]

  const demoEntrances = [
    {
      title: 'Panel managera kliniki',
      desc: 'Pełne centrum dowodzenia: pacjenci, wizyty, zgody, komunikacja, personel, płatności i analityka.',
      href: managerHref,
      icon: Stethoscope,
      primary: true,
      disabled: !demoEventId,
      note: demoEventId ? 'Rekomendowane wejście dla komisji' : 'Ustaw NEXT_PUBLIC_DEMO_EVENT_ID w Vercel'
    },
    {
      title: 'Portal pacjenta',
      desc: 'Widok pacjenta: dokumenty, komunikaty, zalecenia, rozmowy z recepcją i przypomnienia.',
      href: portalHref,
      icon: Globe,
      primary: false,
      disabled: false,
      note: 'Publiczny widok pacjenta'
    },
    {
      title: 'Widok recepcji',
      desc: 'Dostęp operacyjny do komunikacji, dokumentów, zadań i obsługi pacjentów bez pełnych finansów.',
      href: receptionHref,
      icon: Mail,
      primary: false,
      disabled: !receptionHref,
      note: receptionHref ? 'Gotowy link staff-pass' : 'Opcjonalnie ustaw NEXT_PUBLIC_DEMO_RECEPTION_TOKEN'
    },
    {
      title: 'Widok lekarza',
      desc: 'Karta pacjenta, historia kliniczna, notatki, zalecenia i kontekst wizyt dla personelu medycznego.',
      href: doctorHref,
      icon: Activity,
      primary: false,
      disabled: !doctorHref,
      note: doctorHref ? 'Gotowy link staff-pass' : 'Opcjonalnie ustaw NEXT_PUBLIC_DEMO_DOCTOR_TOKEN'
    }
  ]

  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_34rem),radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28rem)]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-between px-5 py-8 md:px-8 md:py-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                <Stethoscope size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Demo systemu</p>
                <h1 className="text-lg font-black tracking-tight">ClinicOps</h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 md:flex">
              <ShieldCheck size={14} className="text-cyan-300" />
              Dane demonstracyjne
            </div>
          </header>

          <div className="grid items-end gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                <Sparkles size={14} />
                demonstrator dla komisji
              </span>
              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-tight md:text-6xl">
                Zintegrowany system zarządzania pacjentem w klinice medycznej
              </h2>
              <p className="mt-6 max-w-3xl text-base font-medium leading-relaxed text-slate-300 md:text-lg">
                Demo pokazuje, jak ClinicOps łączy CRM pacjenta, dokumentację medyczną, portal pacjenta, komunikację, follow-up, pracę personelu, płatności i analitykę AI w jednym systemie.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={managerHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-wider transition ${
                    demoEventId
                      ? 'bg-cyan-300 text-[#071016] hover:bg-cyan-200'
                      : 'pointer-events-none bg-slate-700 text-slate-400'
                  }`}
                >
                  Wejdź do demo managera <ArrowRight size={16} />
                </Link>
                <Link
                  href={portalHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:border-cyan-300/50 hover:text-cyan-300"
                >
                  Zobacz portal pacjenta <Globe size={16} />
                </Link>
              </div>
              {!demoEventId && (
                <p className="mt-4 max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs font-bold leading-relaxed text-amber-100">
                  Demo jest przygotowane technicznie. Aby przycisk managera prowadził do gotowej kliniki, ustaw w Vercel zmienną `NEXT_PUBLIC_DEMO_EVENT_ID` z ID rekordu demo.
                </p>
              )}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Co komisja zobaczy</p>
              <div className="space-y-3">
                {[
                  'fikcyjnych pacjentów, wizyty, zabiegi i ceny',
                  'zgody, wywiady, RODO i dokumenty do podpisu',
                  'komunikację pacjent - recepcja z pomocą AI',
                  'Patient Experience Manager i automatyczny follow-up',
                  'dashboardy KPI, finanse i efektywność kliniki'
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                    <p className="text-sm font-bold leading-relaxed text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Wejścia demo</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Jedna aplikacja, kilka perspektyw pracy</h3>
          </div>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-400">
            Najlepiej wysłać komisji ten link. Z tego miejsca może przejść do panelu managera, portalu pacjenta i opcjonalnych widoków personelu.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {demoEntrances.map(item => (
            <Link
              key={item.title}
              href={item.disabled ? '#' : item.href}
              className={`group rounded-[28px] border p-5 transition ${
                item.disabled
                  ? 'pointer-events-none border-white/10 bg-white/[0.03] opacity-60'
                  : item.primary
                    ? 'border-cyan-300/35 bg-cyan-300/10 hover:-translate-y-1 hover:bg-cyan-300/15'
                    : 'border-white/10 bg-white/[0.05] hover:-translate-y-1 hover:border-cyan-300/35'
              }`}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.primary ? 'bg-cyan-300 text-[#071016]' : 'bg-white/10 text-cyan-300'}`}>
                  <item.icon size={20} />
                </div>
                {item.disabled ? <Lock size={16} className="text-slate-500" /> : <ArrowRight size={16} className="text-slate-400 transition group-hover:text-cyan-300" />}
              </div>
              <h4 className="text-base font-black">{item.title}</h4>
              <p className="mt-2 min-h-[72px] text-xs font-medium leading-relaxed text-slate-400">{item.desc}</p>
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-cyan-300">{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(item => (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                <item.icon size={18} />
              </div>
              <h4 className="font-black">{item.title}</h4>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Informacja dla komisji</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
            Wszystkie dane w demonstratorze są fikcyjne i służą wyłącznie prezentacji koncepcji systemu. Demo pokazuje docelowy sposób działania aplikacji: centralny rekord pacjenta, cyfrowe dokumenty, portal pacjenta, komunikację wielokanałową, automatyczny follow-up i analitykę zarządczą dla kliniki.
          </p>
        </div>
      </section>
    </main>
  )
}
