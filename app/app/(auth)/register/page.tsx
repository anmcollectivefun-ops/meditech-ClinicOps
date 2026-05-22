'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'
import { createClient } from '../../lib/supabase'
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

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
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

  async function handleRegister() {
    if (!email || !password || !name) {
      setError('Wypełnij wszystkie pola.')
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      resetCaptcha()
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center border-t-4 border-[#253a2a]">
          <h1 className="text-2xl font-bold mb-4 text-[#253a2a]">Sprawdź email!</h1>
          <p className="text-gray-600">
            Wysłaliśmy link potwierdzający na adres <br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold mb-6 text-center text-[#253a2a]">Utwórz konto</h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Imię i nazwisko"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
              className="w-full border rounded-lg p-3 min-h-[48px] text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#253a2a] focus:outline-none disabled:opacity-50 transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border rounded-lg p-3 min-h-[48px] text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#253a2a] focus:outline-none disabled:opacity-50 transition-colors"
            />
            <input
              type="password"
              placeholder="Hasło (min. 6 znaków)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border rounded-lg p-3 min-h-[48px] text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#253a2a] focus:outline-none disabled:opacity-50 transition-colors"
            />

            {/* Cloudflare Turnstile */}
            {captchaEnabled && (
              <div ref={widgetRef} className="flex justify-center" />
            )}

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-[#253a2a] text-white py-3 min-h-[48px] rounded-lg font-medium hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-70 transition-all flex justify-center items-center"
            >
              {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
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

          <GoogleSignInButton label="Zarejestruj przez Google" />

          <p className="text-center text-sm mt-4 text-gray-600">
            Masz już konto?{' '}
            <a href="/login" className="text-[#253a2a] font-bold hover:text-[#e8ce7a] transition-colors">
              Zaloguj się
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
