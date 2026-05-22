'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../../lib/supabase'
import { GOOGLE_FONT_OPTIONS, buildGoogleFontStack, getFontFamilyName } from '../../../../lib/googleFonts'
import { useRouter } from 'next/navigation'
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
    primary_color: '#0e7490',
    secondary_color: '#67e8f9',
    bg_color: '#f8fafc',
    text_color: '#475569',
    heading_color: '#0f172a',
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

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kreator ClinicOps</h1>
          <p className="text-slate-500 font-medium mt-2">
            Skonfiguruj profil placówki, publiczny formularz pacjenta i podstawową ścieżkę pierwszego kontaktu.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-cyan-600" /> Podstawy placówki
            </h2>
            <div className="space-y-6">
              <input
                required
                placeholder="Nazwa placówki lub projektu medycznego"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-5 font-black text-2xl outline-none focus:ring-2 focus:ring-cyan-500/20"
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <textarea
                placeholder="Krótki opis specjalizacji, zespołu i zakresu obsługi pacjenta..."
                rows={2}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-600 outline-none resize-none"
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="date"
                  className="bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none text-slate-600"
                  onChange={e => setFormData({...formData, event_date: e.target.value})}
                />
                <input
                  required
                  placeholder="Lokalizacja placówki"
                  className="bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none"
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Palette size={20} className="text-cyan-600" /> Brand placówki
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Tło strony', key: 'bg_color', val: formData.bg_color },
                { label: 'Nagłówki', key: 'heading_color', val: formData.heading_color },
                { label: 'Tekst', key: 'text_color', val: formData.text_color },
                { label: 'Akcent główny', key: 'primary_color', val: formData.primary_color },
                { label: 'Akcent dodatkowy', key: 'secondary_color', val: formData.secondary_color }
              ].map((item) => (
                <div key={item.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                  <input type="color" value={item.val} onChange={e => setFormData({...formData, [item.key]: e.target.value})} className="w-12 h-12 rounded-full cursor-pointer border-none bg-transparent" />
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Type size={20} className="text-cyan-600" /> Typografia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Czcionka nagłówków', key: 'heading_font' },
                { label: 'Czcionka tekstów', key: 'body_font' }
              ].map(({ label, key }) => {
                const current = formData[key as 'heading_font' | 'body_font']
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{label}</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none"
                      value={GOOGLE_FONT_OPTIONS.some(font => font.family === getFontFamilyName(current)) ? getFontFamilyName(current) : ''}
                      onChange={e => e.target.value && setFormData({...formData, [key]: buildGoogleFontStack(e.target.value)})}
                    >
                      <option value="">Wybierz z listy Google Fonts</option>
                      {GOOGLE_FONT_OPTIONS.map(font => (
                        <option key={font.family} value={font.family}>{font.family} ({font.category})</option>
                      ))}
                    </select>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none"
                      value={getFontFamilyName(current)}
                      onChange={e => setFormData({...formData, [key]: buildGoogleFontStack(e.target.value)})}
                      placeholder="Albo wpisz własną nazwę, np. Lato"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <UploadCloud size={20} className="text-cyan-600" /> Pliki i multimedia placówki
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 border-dashed">
                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-800 block mb-3">Zdjęcie placówki lub zespołu</label>
                <input type="file" accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-black file:bg-cyan-700 file:text-white" onChange={e => e.target.files && setFormData({...formData, cover_image: e.target.files[0]})} />
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-3">Logo placówki</label>
                <input type="file" accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-black file:bg-slate-200 file:text-slate-700" onChange={e => e.target.files && setFormData({...formData, logo: e.target.files[0]})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Galeria placówki i specjalizacji</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(num => (
                  <div key={num} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 block mb-2">Zdjęcie {num}</span>
                    <input type="file" accept="image/*" className="text-[10px] w-full" onChange={e => {
                      if (e.target.files) {
                        setFormData(prev => ({ ...prev, [`image_${num}`]: e.target.files![0] }))
                      }
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
              <Globe size={20} className="text-cyan-300" /> Ścieżka pierwszego kontaktu
            </h2>
            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Unikalny link formularza pacjenta</label>
                <div className="flex items-center bg-white/10 rounded-2xl px-4 py-1 border border-white/10">
                  <span className="text-slate-400 text-sm font-mono">{currentDomain}/join/</span>
                  <input required placeholder="nazwa-kliniki" className="bg-transparent border-none focus:ring-0 font-bold text-cyan-300 flex-1 py-3 outline-none" onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Obsługa zgłoszeń pacjentów</label>
                  <select className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-4 font-bold outline-none text-slate-900" onChange={e => setFormData({...formData, selection_rule: e.target.value})}>
                    <option value="manual">Recepcja zatwierdza ręcznie</option>
                    <option value="first_x">Automatyczna akceptacja</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Limit aktywnych pacjentów</label>
                  <input type="number" value={formData.limit_attendees} className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-4 font-bold outline-none" onChange={e => setFormData({...formData, limit_attendees: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-8 z-50">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-cyan-700 hover:bg-cyan-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-cyan-900/30 transition-all flex flex-col items-center justify-center gap-1 active:scale-[0.98] border-2 border-cyan-400/20"
            >
              <div className="flex items-center gap-3">
                {loading ? 'PRZETWARZANIE DANYCH...' : <>UTWÓRZ ŚRODOWISKO CLINICOPS <ArrowRight /></>}
              </div>
              {loading && <span className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest">{uploadStatus}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
