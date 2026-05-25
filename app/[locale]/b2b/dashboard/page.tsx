'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Activity, ChevronRight, Plus, Stethoscope, Trash2, Building2, Edit3, X } from 'lucide-react'

export default function B2BDashboardPage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Stany do szybkiej edycji
  const [editingClinic, setEditingClinic] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
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

  // --- FUNKCJA USUWANIA ---
  const handleDeleteClinic = async (e: React.MouseEvent, clinicId: string) => {
    e.stopPropagation(); // Zapobiega wejściu w kafel
    
    if (!confirm('Czy na pewno chcesz usunąć ten oddział i wszystkie powiązane z nim dane? Tej akcji nie da się cofnąć.')) return;

    setIsDeleting(clinicId);
    
    try {
      const { error } = await supabase
        .from('b2b_events')
        .delete()
        .eq('id', clinicId)

      if (error) throw error;
      
      setClinics(clinics.filter(c => c.id !== clinicId));
    } catch (err: any) {
      alert('Nie udało się usunąć oddziału: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  }

  // --- FUNKCJA SZYBKIEJ EDYCJI ---
  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('b2b_events')
        .update({
          title: editingClinic.title,
          location: editingClinic.location,
        })
        .eq('id', editingClinic.id);

      if (error) throw error;

      // Aktualizacja lokalnego stanu, żeby od razu było widać zmiany
      setClinics(clinics.map(c => c.id === editingClinic.id ? editingClinic : c));
      setEditingClinic(null);
    } catch (err: any) {
      alert('Nie udało się zapisać zmian: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="planner-shell min-h-screen font-sans relative">
      <style jsx global>{`
        .planner-shell {
          --app-bg: #eef8f9;
          --app-surface: #ffffff;
          --app-surface-muted: #f3f8fa;
          --app-surface-soft: #eef6f8;
          --app-border: rgba(15, 23, 42, 0.12);
          --app-text: #0f172a;
          --app-text-muted: #526174;
          --app-primary: #0f172a; 
          --app-accent: #22d3ee;
          background:
            radial-gradient(circle at top right, rgba(34, 211, 238, 0.18), transparent 34rem),
            radial-gradient(circle at top left, rgba(16, 185, 129, 0.10), transparent 30rem),
            linear-gradient(180deg, #f5fbfc 0%, #eef8f9 100%);
          color: var(--app-text);
        }

        .clinic-surface {
          background-color: var(--app-surface);
          border: 1px solid var(--app-border);
        }

        .clinic-surface-soft {
          background-color: var(--app-surface-soft);
          border: 1px solid var(--app-border);
        }

        .clinic-muted {
          color: var(--app-text-muted);
        }

        .clinic-primary-button {
          background-color: var(--app-accent);
          color: var(--app-primary);
          border: 1px solid rgba(15, 23, 42, 0.08);
        }
        
        .clinic-primary-button:hover {
          background-color: #22d3ee;
        }

        .clinic-secondary-button {
          background-color: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .clinic-secondary-button:hover {
          border-color: rgba(103, 232, 249, 0.5);
          color: var(--app-accent);
          background-color: rgba(103, 232, 249, 0.05);
        }
      `}</style>

      <header className="border-b border-slate-800 bg-[#071016]/95 p-4 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
              <Stethoscope size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white">ANM ClinicOps</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="clinic-secondary-button rounded-2xl px-4 py-2 text-xs font-bold transition">
              Konto
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">Centrum dowodzenia</p>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-950">Zarządzanie oddziałami</h1>
            <p className="clinic-muted max-w-2xl text-sm font-medium">
              Zarządzaj wieloma oddziałami kliniki. Każdy oddział posiada własną bazę pacjentów, kalendarz, dokumentację i system komunikacji.
            </p>
          </div>
          <button onClick={() => router.push('/b2b/events/new')} className="clinic-primary-button flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black shadow-lg shadow-cyan-300/20 transition hover:-translate-y-0.5 w-full md:w-auto">
            <Plus size={18} /> Dodaj oddział
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center font-black clinic-muted animate-pulse">Ładowanie oddziałów...</div>
        ) : clinics.length === 0 ? (
          <div className="clinic-surface rounded-[40px] border-dashed p-12 text-center md:p-20">
            <Activity size={48} className="mx-auto mb-4 text-cyan-600" />
            <h3 className="mb-2 text-xl font-black text-slate-950">Nie masz jeszcze żadnego oddziału</h3>
            <p className="clinic-muted mx-auto mb-6 max-w-md text-sm">
              Utwórz pierwszy oddział kliniki, aby rozpocząć konfigurację kalendarza, recepcji, zgód i analityki dla wybranej lokalizacji.
            </p>
            <button onClick={() => router.push('/b2b/events/new')} className="clinic-primary-button inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black shadow-lg transition">
              <Plus size={18} /> Dodaj oddział kliniki
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map(clinic => (
              <div 
                key={clinic.id} 
                onClick={() => router.push(`/b2b/events/${clinic.id}`)} 
                className={`clinic-surface group flex cursor-pointer flex-col rounded-[32px] p-6 transition-all hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] relative overflow-hidden ${isDeleting === clinic.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Wzorzec kafelka */}
                <div className="mb-6 flex items-start justify-between relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-inner group-hover:scale-105 transition-transform">
                    <Building2 size={24} />
                  </div>
                  
                  {/* Przyciski Akcji */}
                  <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClinic(clinic);
                      }}
                      className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                      title="Szybka edycja"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClinic(e, clinic.id)}
                      className="h-8 w-8 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      title="Usuń ten oddział"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="mb-2 line-clamp-1 text-xl font-black text-slate-950">{clinic.title}</h3>
                  <p className="text-cyan-700 text-[10px] font-black uppercase tracking-wider mb-2 line-clamp-2 leading-relaxed h-8">
                    {clinic.location || 'Brak zdefiniowanego adresu'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-[var(--app-border)] pt-4 relative z-10 mt-2">
                  <span className="clinic-muted text-[10px] font-black uppercase tracking-widest">
                    {clinic.event_date ? new Date(clinic.event_date).toLocaleDateString('pl-PL') : 'Brak daty otwarcia'}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all group-hover:bg-cyan-500 group-hover:text-white">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL SZYBKIEJ EDYCJI ODDZIAŁU */}
        {editingClinic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071016]/80 backdrop-blur-sm animate-in fade-in cursor-default" onClick={() => setEditingClinic(null)}>
            <div 
              className="clinic-surface w-full max-w-md rounded-[32px] p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--app-border)]">
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <Edit3 size={20} className="text-cyan-600"/> Edytuj oddział
                </h3>
                <button onClick={() => setEditingClinic(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleUpdateClinic} className="space-y-5">
                <div>
                  <label className="clinic-muted ml-2 block text-[10px] font-black uppercase tracking-widest mb-1.5">
                    Nazwa oddziału
                  </label>
                  <input 
                    required 
                    value={editingClinic.title || ''} 
                    onChange={e => setEditingClinic({...editingClinic, title: e.target.value})}
                    className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-5 py-4 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="clinic-muted ml-2 block text-[10px] font-black uppercase tracking-widest mb-1.5">
                    Dokładny adres
                  </label>
                  <input 
                    required 
                    value={editingClinic.location || ''} 
                    onChange={e => setEditingClinic({...editingClinic, location: e.target.value})}
                    className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-5 py-4 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="clinic-primary-button w-full mt-4 rounded-xl py-4 font-black text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
