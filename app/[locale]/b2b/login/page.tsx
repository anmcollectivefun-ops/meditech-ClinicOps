'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'
import { AlertCircle, ArrowLeft, ArrowRight, Lock, Mail, Stethoscope } from 'lucide-react'

export default function B2BLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.')
      setLoading(false)
    } else {
      router.push('/b2b/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Wróć do strony głównej
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Stethoscope size={32} className="text-cyan-300" />
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
          Panel ClinicOps
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Zarządzaj pacjentami, pierwszym kontaktem, zgodami i efektywnością kliniki.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Służbowy adres e-mail
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all"
                  placeholder="recepcja@klinika.pl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Hasło
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-bold text-cyan-700 hover:text-cyan-600 transition-colors">
                Zapomniałeś hasła?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-white bg-slate-950 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading ? 'Logowanie...' : <>Zaloguj się <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-600">
              Nie masz jeszcze konta kliniki?{' '}
              <Link href="/b2b/register" className="font-bold text-cyan-700 hover:text-cyan-600 transition-colors">
                Zarejestruj placówkę
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
