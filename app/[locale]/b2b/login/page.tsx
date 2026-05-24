'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'
import ClinicThemeToggle from '../../../components/ClinicThemeToggle'
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.')
      setLoading(false)
    } else {
      router.push('/b2b/dashboard')
    }
  }

  return (
    <div className="clinic-shell flex min-h-screen flex-col justify-center px-4 py-12 font-sans sm:px-6 lg:px-8">
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <Link href="/" className="clinic-secondary-button flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition hover:border-cyan-300/50">
          <ArrowLeft size={16} /> Wróć do strony głównej
        </Link>
        <ClinicThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 shadow-lg">
          <Stethoscope size={32} className="text-cyan-300" />
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight">Panel ClinicOps</h2>
        <p className="clinic-muted mt-2 text-center text-sm">
          Zarządzaj pacjentami, pierwszym kontaktem, zgodami i efektywnością kliniki.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="clinic-surface rounded-[32px] px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="clinic-muted block text-xs font-bold uppercase tracking-wider">
                Służbowy adres e-mail
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-cyan-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-[var(--clinic-border)] bg-[var(--clinic-panel-strong)] py-3.5 pl-11 pr-4 text-sm font-bold text-[var(--clinic-text)] outline-none transition-all focus:border-cyan-300"
                  placeholder="recepcja@klinika.pl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="clinic-muted block text-xs font-bold uppercase tracking-wider">
                Hasło
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-cyan-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-[var(--clinic-border)] bg-[var(--clinic-panel-strong)] py-3.5 pl-11 pr-4 text-sm font-bold text-[var(--clinic-text)] outline-none transition-all focus:border-cyan-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-bold text-cyan-300 transition-colors hover:text-cyan-200">
                Zapomniałeś hasła?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clinic-primary-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Logowanie...' : <>Zaloguj się <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--clinic-border)] pt-6">
            <p className="clinic-muted text-center text-sm">
              Nie masz jeszcze konta kliniki?{' '}
              <Link href="/b2b/register" className="font-bold text-cyan-300 transition-colors hover:text-cyan-200">
                Zarejestruj placówkę
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
