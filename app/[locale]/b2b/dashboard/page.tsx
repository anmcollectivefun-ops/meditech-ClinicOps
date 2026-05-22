'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, ChevronRight, Leaf } from 'lucide-react'

export default function B2BDashboardPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadWorkspace() {
      try {
        // 1. Zabezpieczenie: Sprawdzamy czy uĹĽytkownik jest w ogĂłle zalogowany
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/b2b/login') // JeĹ›li nie, wyrzucamy do logowania
          return
        }

        // 2. AUTOMATYZACJA: Bierzemy pierwsze i jedyne ID firmy z bazy (Twoje ANM Event Green Hub)
        const { data: profile } = await supabase
          .from('business_profiles')
          .select('id')
          .limit(1)
          .single()

        if (profile && profile.id) {
          // 3. Pobieramy WSZYSTKIE eventy, ktĂłre majÄ… przypisane to konkretne ID firmy
          const { data: myEvents, error } = await supabase
            .from('b2b_events')
            .select('*')
            .eq('business_id', profile.id)
            .order('created_at', { ascending: false }) // Od najnowszych

          if (error) throw error
          if (myEvents) setEvents(myEvents)
        }
      } catch (error) {
        console.error("BĹ‚Ä…d Ĺ‚adowania dashboardu:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkspace()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                <Leaf size={16} />
             </div>
             <span className="font-black tracking-widest uppercase text-xs">ANM Event Green Hub</span>
          </div>
          <button className="text-xs font-bold text-slate-300 hover:text-white">Ustawienia</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">ANM Event Green Hub</h1>
            <p className="text-sm text-slate-500 font-medium">Platforma AI do cyrkularnego zarządzania wydarzeniami.</p>
          </div>
          <button onClick={() => router.push('/b2b/events/new')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
            <Plus size={18} /> Nowy Projekt
          </button>
        </div>

        {/* LISTA WYDARZEĹ LUB PUSTY STAN */}
        {loading ? (
           <div className="text-center py-20 font-black text-slate-400 animate-pulse">Ĺadowanie przestrzeni roboczej...</div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-20 text-center">
            <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">PrzestrzeĹ„ robocza jest pusta</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">UtwĂłrz pierwszÄ… konferencjÄ™ lub szkolenie, aby rozpoczÄ…Ä‡ proces zarzÄ…dzania zasobami (GOZ).</p>
            <button onClick={() => router.push('/b2b/events/new')} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg inline-flex items-center gap-2">
              <Plus size={18} /> UtwĂłrz Wydarzenie
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} onClick={() => router.push(`/b2b/events/${event.id}`)} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: (event.primary_color || '#10b981') + '20', color: event.primary_color || '#10b981' }}>
                      <Calendar size={24} />
                   </div>
                   <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                      {event.status || 'Aktywne'}
                   </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6 flex-1">{event.location}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <span className="text-xs text-slate-400 font-medium">
                     {event.event_date ? new Date(event.event_date).toLocaleDateString('pl-PL') : 'Brak daty'}
                   </span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
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

