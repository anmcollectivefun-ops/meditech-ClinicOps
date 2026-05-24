'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../../lib/supabase'
import { GOOGLE_FONT_OPTIONS, buildGoogleFontStack, getFontFamilyName } from '../../../../lib/googleFonts'
import { useRouter } from 'next/navigation'
import ClinicThemeToggle from '../../../../components/ClinicThemeToggle'
import { ArrowRight, Briefcase, Globe, Palette, Type, UploadCloud } from 'lucide-react'

export default function NewB2BEventPage() {
  const [loading, setLoading] = useState(false)
  const [currentDomain, setCurrentDomain] = useState('anm-clinicops.vercel.app')
  const [uploadStatus, setUploadStatus] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    slug: '',
    selection_rule: 'manual',
    limit_attendees: 100,
    primary_color: '#071016',
    secondary_color: '#67e8f9',
    bg_color: '#f4fbfc',
    text_color: '#5f7280',
    heading_color: '#071016',
    heading_font: 'Inter, sans-serif',
    body_font: 'Inter, sans-serif',
    cover_image: null as File | null,
    logo: null as File | null,
    image_1: null as File | null,
    image_2: null as File | null,
    image_3: null as File | null
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentDomain(window.location.host)
  }, [])

  const uploadFile = async (file: File | null, profileId: string, prefix: string) => {
    if (!file) return null
    const fileExt = file.name.split('.').pop()
    const fileName = `${profileId}-${prefix}-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('event-covers').upload(fileName, file)
    if (error) return null
    const { data } = supabase.storage.from('event-covers').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      setUploadStatus('Autoryzacja przestrzeni kliniki...')
      const { data: profile } = await supabase.from('business_profiles').select('id').limit(1).single()
      if (!profile?.id) throw new Error('Brak przypisanego profilu placówki.')

      setUploadStatus('Przetwarzanie materiałów placówki...')
      const [coverUrl, logoUrl, img1Url, img2Url, img3Url] = await Promise.all([
        uploadFile(formData.cover_image, profile.id, 'cover'),
        uploadFile(formData.logo, profile.id, 'logo'),
        uploadFile(formData.image_1, profile.id, 'gallery1'),
        uploadFile(formData.image_2, profile.id, 'gallery2'),
        uploadFile(formData.image_3, profile.id, 'gallery3')
      ])

      setUploadStatus('Zapis konfiguracji ClinicOps...')
      const safeSlug = formData.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const { data, error } = await supabase.from('b2b_events').insert([{
        business_id: profile.id,
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        slug: safeSlug,
        selection_rule: formData.selection_rule,
        expected_attendees: formData.limit_attendees,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        bg_color: formData.bg_color,
        text_color: formData.text_color,
        heading_color: formData.heading_color,
        heading_font: formData.heading_font,
        body_font: formData.body_font,
        cover_image_url: coverUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2070&auto=format&fit=crop',
        logo_url: logoUrl,
        image_1_url: img1Url,
        image_2_url: img2Url,
        image_3_url: img3Url,
        status: 'konfiguracja'
      }]).select().single()

      if (error) throw error
      router.push(`/b2b/events/${data.id}`)
    } catch (err: any) {
      console.error(err)
      alert('Wystąpił błąd: ' + err.message)
      setLoading(false)
      setUploadStatus('')
    }
  }

  const inputClass = 'w-full rounded-2xl border border-[var(--clinic-border)] bg-[var(--clinic-panel-strong)] px-5 py-4 font-bold text-[var(--clinic-text)] outline-none focus:border-cyan-300'
  const labelClass = 'clinic-muted ml-2 block text-[10px] font-black uppercase tracking-widest'

  return (
    <div className="clinic-shell min-h-screen px-4 py-12 pb-32 font-sans">
      <div className="fixed right-6 top-6 z-50">
        <ClinicThemeToggle />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Nowa przestrzeń</p>
          <h1 className="text-3xl font-black tracking-tight">Kreator ClinicOps</h1>
          <p className="clinic-muted mt-2 font-medium">
            Skonfiguruj profil placówki, publiczny formularz pacjenta i podstawową ścieżkę pierwszego kontaktu.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
          <section className="clinic-surface rounded-[32px] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
              <Briefcase size={20} className="text-cyan-300" /> Podstawy placówki
            </h2>
            <div className="space-y-6">
              <input required placeholder="Nazwa placówki lub projektu medycznego" className={`${inputClass} py-5 text-2xl font-black`} onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea placeholder="Krótki opis specjalizacji, zespołu i zakresu obsługi pacjenta..." rows={2} className={`${inputClass} resize-none clinic-muted`} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input required type="date" className={inputClass} onChange={e => setFormData({...formData, event_date: e.target.value})} />
                <input required placeholder="Lokalizacja placówki" className={inputClass} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="clinic-surface rounded-[32px] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
              <Palette size={20} className="text-cyan-300" /> Brand placówki
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: 'Tło strony', key: 'bg_color', val: formData.bg_color },
                { label: 'Nagłówki', key: 'heading_color', val: formData.heading_color },
                { label: 'Tekst', key: 'text_color', val: formData.text_color },
                { label: 'Akcent główny', key: 'primary_color', val: formData.primary_color },
                { label: 'Akcent dodatkowy', key: 'secondary_color', val: formData.secondary_color }
              ].map((item) => (
                <div key={item.key} className="clinic-surface-soft flex flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center">
                  <input type="color" value={item.val} onChange={e => setFormData({...formData, [item.key]: e.target.value})} className="h-12 w-12 cursor-pointer rounded-full border-none bg-transparent" />
                  <span className="clinic-muted text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="clinic-surface rounded-[32px] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
              <Type size={20} className="text-cyan-300" /> Typografia
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { label: 'Czcionka nagłówków', key: 'heading_font' },
                { label: 'Czcionka tekstów', key: 'body_font' }
              ].map(({ label, key }) => {
                const current = formData[key as 'heading_font' | 'body_font']
                return (
                  <div key={key} className="space-y-2">
                    <label className={labelClass}>{label}</label>
                    <select
                      className={inputClass}
                      value={GOOGLE_FONT_OPTIONS.some(font => font.family === getFontFamilyName(current)) ? getFontFamilyName(current) : ''}
                      onChange={e => e.target.value && setFormData({...formData, [key]: buildGoogleFontStack(e.target.value)})}
                    >
                      <option value="">Wybierz z listy Google Fonts</option>
                      {GOOGLE_FONT_OPTIONS.map(font => (
                        <option key={font.family} value={font.family}>{font.family} ({font.category})</option>
                      ))}
                    </select>
                    <input className={inputClass} value={getFontFamilyName(current)} onChange={e => setFormData({...formData, [key]: buildGoogleFontStack(e.target.value)})} placeholder="Albo wpisz własną nazwę, np. Lato" />
                  </div>
                )
              })}
            </div>
          </section>

          <section className="clinic-surface rounded-[32px] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-black">
              <UploadCloud size={20} className="text-cyan-300" /> Pliki i multimedia placówki
            </h2>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-6">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-cyan-300">Zdjęcie placówki lub zespołu</label>
                <input type="file" accept="image/*" className="text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-black file:text-[#071016]" onChange={e => e.target.files && setFormData({...formData, cover_image: e.target.files[0]})} />
              </div>
              <div className="clinic-surface-soft rounded-2xl border-dashed p-6">
                <label className="clinic-muted mb-3 block text-[10px] font-black uppercase tracking-widest">Logo placówki</label>
                <input type="file" accept="image/*" className="text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300/20 file:px-4 file:py-2 file:font-black file:text-cyan-300" onChange={e => e.target.files && setFormData({...formData, logo: e.target.files[0]})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Galeria placówki i specjalizacji</label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map(num => (
                  <div key={num} className="clinic-surface-soft rounded-2xl p-4">
                    <span className="clinic-muted mb-2 block text-[9px] font-black">Zdjęcie {num}</span>
                    <input type="file" accept="image/*" className="w-full text-[10px]" onChange={e => {
                      if (e.target.files) setFormData(prev => ({ ...prev, [`image_${num}`]: e.target.files![0] }))
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-cyan-300/20 bg-[#071016] p-8 text-white shadow-xl">
            <h2 className="relative z-10 mb-6 flex items-center gap-2 text-xl font-black">
              <Globe size={20} className="text-cyan-300" /> Ścieżka pierwszego kontaktu
            </h2>
            <div className="relative z-10 space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Unikalny link formularza pacjenta</label>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-1">
                  <span className="font-mono text-sm text-slate-400">{currentDomain}/join/</span>
                  <input required placeholder="nazwa-kliniki" className="flex-1 border-none bg-transparent py-3 font-bold text-cyan-300 outline-none" onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Obsługa zgłoszeń pacjentów</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-bold text-white outline-none" onChange={e => setFormData({...formData, selection_rule: e.target.value})}>
                    <option value="manual">Recepcja zatwierdza ręcznie</option>
                    <option value="first_x">Automatyczna akceptacja</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Limit aktywnych pacjentów</label>
                  <input type="number" value={formData.limit_attendees} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-bold outline-none" onChange={e => setFormData({...formData, limit_attendees: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </section>

          <div className="sticky bottom-8 z-40">
            <button
              type="submit"
              disabled={loading}
              className="clinic-primary-button flex w-full flex-col items-center justify-center gap-1 rounded-[24px] border border-cyan-300/20 py-6 text-xl font-black shadow-2xl shadow-cyan-900/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                {loading ? 'PRZETWARZANIE DANYCH...' : <>UTWÓRZ ŚRODOWISKO CLINICOPS <ArrowRight /></>}
              </div>
              {loading && <span className="text-[10px] font-bold uppercase tracking-widest text-[#071016]/70">{uploadStatus}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
