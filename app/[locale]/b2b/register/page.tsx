'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
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

      if (!profileError) {
        router.push('/b2b/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-cyan-300">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Rejestracja ClinicOps</h1>
            <p className="text-sm text-slate-500">Załóż konto dla placówki medycznej.</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail służbowy</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-cyan-600" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Hasło</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-cyan-600" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-800 mb-4">Dane placówki i systemu</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nazwa placówki</label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-cyan-600" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">NIP</label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-cyan-600" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Adres placówki</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-cyan-600" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-slate-950 text-white rounded-xl font-black text-sm shadow-xl hover:bg-black transition-all">
            {loading ? 'Tworzenie konta...' : <>Utwórz konto kliniki <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
