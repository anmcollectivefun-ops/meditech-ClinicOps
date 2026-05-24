'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import ClinicThemeToggle from '../../../components/ClinicThemeToggle'
import { ArrowRight, Building2, FileText, Lock, Mail, MapPin } from 'lucide-react'

export default function B2BRegister() {
  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', nip: '', address: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('business_profiles').insert({
        user_id: authData.user.id,
        company_name: formData.companyName,
        nip: formData.nip,
        address: formData.address,
        is_pro: true
      })

      if (!profileError) router.push('/b2b/dashboard')
    }
    setLoading(false)
  }

  const fieldClass = 'w-full rounded-2xl border border-[var(--clinic-border)] bg-[var(--clinic-panel-strong)] py-3 pl-10 pr-4 text-sm font-bold text-[var(--clinic-text)] outline-none focus:border-cyan-300'
  const labelClass = 'clinic-muted text-xs font-bold uppercase'

  return (
    <div className="clinic-shell flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-6 top-6">
        <ClinicThemeToggle />
      </div>

      <div className="clinic-surface w-full max-w-xl rounded-[32px] p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Rejestracja ClinicOps</h1>
            <p className="clinic-muted text-sm">Załóż konto dla placówki medycznej.</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>E-mail służbowy</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Hasło</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={16} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={fieldClass} />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--clinic-border)] pt-4">
            <h3 className="mb-4 text-sm font-black">Dane placówki i systemu</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nazwa placówki</label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={16} />
                  <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className={fieldClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>NIP</label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={16} />
                  <input required type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className={fieldClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Adres placówki</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={16} />
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={fieldClass} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="clinic-primary-button mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-xl transition-all">
            {loading ? 'Tworzenie konta...' : <>Utwórz konto kliniki <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
