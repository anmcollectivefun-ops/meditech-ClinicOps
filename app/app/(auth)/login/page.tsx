'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { GoogleSignInButton } from '../../components/GoogleSignInButton'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey: string
        callback: (token: string) => void
        'expired-callback': () => void
        'error-callback': () => void
        theme?: 'light' | 'dark' | 'auto'
      }) => string
      reset: (id: string) => void
    }
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const captchaEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function renderWidget() {
    if (!widgetRef.current || widgetIdRef.current || !window.turnstile) return
    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: (token) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(null),
      'error-callback': () => {
        setCaptchaToken(null)
        setError('Błąd weryfikacji CAPTCHA. Odśwież stronę i spróbuj ponownie.')
      },
      theme: 'light',
    })
  }

  useEffect(() => {
    if (window.turnstile) renderWidget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetCaptcha() {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
    setCaptchaToken(null)
  }

  async function handleLogin() {
    if (!email || !password) {
      setError('Wprowadź email i hasło.')
      return
    }
    if (captchaEnabled && !captchaToken) {
      setError('Proszę ukończyć weryfikację CAPTCHA.')
      return
    }

    setIsLoading(true)
    setError('')

    // Weryfikacja Turnstile po stronie serwera
    if (captchaEnabled) {
      const captchaRes = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      })
      if (!captchaRes.ok) {
        const data = await captchaRes.json()
        setError(data.error ?? 'Weryfikacja bezpieczeństwa nie powiodła się.')
        setIsLoading(false)
        resetCaptcha()
        return
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Nieprawidłowe dane logowania lub brak potwierdzenia adresu email.')
      setIsLoading(false)
      resetCaptcha()
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <>
      {captchaEnabled && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onReady={renderWidget}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#253a2a]">Zaloguj się</h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full border rounded-lg p-3 min-h-[48px] text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#253a2a] focus:outline-none disabled:opacity-50 transition-colors"
            />
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full border rounded-lg p-3 min-h-[48px] text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#253a2a] focus:outline-none disabled:opacity-50 transition-colors"
            />

            {/* Cloudflare Turnstile */}
            {captchaEnabled && (
              <div ref={widgetRef} className="flex justify-center" />
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#253a2a] text-white py-3 min-h-[48px] rounded-lg font-medium hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-70 transition-all flex justify-center items-center"
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </div>

          {/* Separator */}
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium uppercase tracking-wider">lub</span>
            </div>
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm mt-4 text-gray-600">
            Nie masz konta?{' '}
            <a href="/register" className="text-[#253a2a] font-bold hover:text-[#e8ce7a] transition-colors">
              Zarejestruj się
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
