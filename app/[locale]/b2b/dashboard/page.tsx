'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import ClinicThemeToggle from '../../../components/ClinicThemeToggle'
import { Activity, ChevronRight, Plus, Stethoscope } from 'lucide-react'

export default function B2BDashboardPage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/b2b/login')
          return
        }

        const { data: profile } = await supabase
          .from('business_profiles')
          .select('id')
          .limit(1)
          .single()

        if (profile?.id) {
          const { data, error } = await supabase
            .from('b2b_events')
            .select('*')
            .eq('business_id', profile.id)
            .order('created_at', { ascending: false })

          if (error) throw error
          setClinics(data || [])
        }
      } catch (error) {
        console.error('Błąd ładowania ClinicOps:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkspace()
  }, [router, supabase])

  return (
    <div className="clinic-shell min-h-screen font-sans">
      <header className="border-b border-[var(--clinic-border)] bg-[color-mix(in_srgb,var(--clinic-panel)_82%,transparent)] p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
              <Stethoscope size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">ANM ClinicOps</span>
          </div>
          <div className="flex items-center gap-2">
            <ClinicThemeToggle />
            <button className="clinic-secondary-button rounded-2xl px-4 py-2 text-xs font-bold transition hover:border-cyan-300/50">
              Ustawienia
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Centrum dowodzenia</p>
            <h1 className="mb-2 text-3xl font-black tracking-tight">Centrum kliniki</h1>
            <p className="clinic-muted max-w-2xl text-sm font-medium">
              Zarządzaj pacjentem, pierwszym kontaktem, zgodami, follow-upem i analityką placówki.
            </p>
          </div>
          <button onClick={() => router.push('/b2b/events/new')} className="clinic-primary-button flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black shadow-lg shadow-cyan-300/10 transition hover:-translate-y-0.5">
            <Plus size={18} /> Nowa klinika
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center font-black clinic-muted animate-pulse">Ładowanie przestrzeni ClinicOps...</div>
        ) : clinics.length === 0 ? (
          <div className="clinic-surface rounded-[40px] border-dashed p-12 text-center md:p-20">
            <Activity size={48} className="mx-auto mb-4 text-cyan-300" />
            <h3 className="mb-2 text-xl font-black">Przestrzeń kliniczna jest pusta</h3>
            <p className="clinic-muted mx-auto mb-6 max-w-md text-sm">
              Utwórz pierwszy projekt kliniki, aby rozpocząć konfigurację pacjenta 360, obsługi zapytań, zgód i analityki.
            </p>
            <button onClick={() => router.push('/b2b/events/new')} className="clinic-primary-button inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black shadow-lg transition">
              <Plus size={18} /> Utwórz projekt kliniki
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map(clinic => (
              <div key={clinic.id} onClick={() => router.push(`/b2b/events/${clinic.id}`)} className="clinic-surface flex cursor-pointer flex-col rounded-[32px] p-6 transition hover:-translate-y-1 hover:border-cyan-300/50">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-inner">
                    <Stethoscope size={24} />
                  </div>
                  <span className="clinic-surface-soft rounded-xl px-2 py-1 text-[10px] font-black uppercase clinic-muted">
                    {clinic.status || 'Aktywna'}
                  </span>
                </div>
                <h3 className="mb-1 line-clamp-1 text-xl font-black">{clinic.title}</h3>
                <p className="clinic-muted mb-6 flex-1 text-xs font-bold uppercase tracking-wider">{clinic.location}</p>
                <div className="flex items-center justify-between border-t border-[var(--clinic-border)] pt-4">
                  <span className="clinic-muted text-xs font-medium">
                    {clinic.event_date ? new Date(clinic.event_date).toLocaleDateString('pl-PL') : 'Plan bez daty startu'}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300 transition-colors group-hover:bg-cyan-300">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
