'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-950 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-300 rounded flex items-center justify-center text-slate-950">
              <Stethoscope size={16} />
            </div>
            <span className="font-black tracking-widest uppercase text-xs">ANM ClinicOps</span>
          </div>
          <button className="text-xs font-bold text-slate-300 hover:text-white">Ustawienia</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Centrum kliniki</h1>
            <p className="text-sm text-slate-500 font-medium">
              Zarządzaj pacjentem, pierwszym kontaktem, zgodami, follow-upem i analityką placówki.
            </p>
          </div>
          <button onClick={() => router.push('/b2b/events/new')} className="bg-cyan-700 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-700/20">
            <Plus size={18} /> Nowa klinika
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black text-slate-400 animate-pulse">Ładowanie przestrzeni ClinicOps...</div>
        ) : clinics.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-20 text-center">
            <Activity size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">Przestrzeń kliniczna jest pusta</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Utwórz pierwszy projekt kliniki, aby rozpocząć konfigurację pacjenta 360, obsługi zapytań, zgód i analityki.
            </p>
            <button onClick={() => router.push('/b2b/events/new')} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg inline-flex items-center gap-2">
              <Plus size={18} /> Utwórz projekt kliniki
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map(clinic => (
              <div key={clinic.id} onClick={() => router.push(`/b2b/events/${clinic.id}`)} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all cursor-pointer group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: (clinic.primary_color || '#0e7490') + '20', color: clinic.primary_color || '#0e7490' }}>
                    <Stethoscope size={24} />
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    {clinic.status || 'Aktywna'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 line-clamp-1">{clinic.title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6 flex-1">{clinic.location}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">
                    {clinic.event_date ? new Date(clinic.event_date).toLocaleDateString('pl-PL') : 'Plan bez daty startu'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
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
