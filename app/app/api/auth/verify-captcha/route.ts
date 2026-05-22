import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter — działa w ramach jednej instancji Vercel.
// Turnstile (token jednorazowy) jest główną ochroną przed botami.
// Dla produkcyjnego rate limitingu między instancjami: użyj Vercel KV / Upstash Redis.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minut
const MAX_ATTEMPTS = 10

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    )
  }

  // Jeśli Turnstile nie jest skonfigurowany (np. lokalne dev), przepuść
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return NextResponse.json({ ok: true })
  }

  let token: string | undefined
  try {
    const body = await req.json()
    token = body.token
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe żądanie.' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu weryfikacji.' }, { status: 400 })
  }

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  })

  const data: { success: boolean; 'error-codes'?: string[] } = await verifyRes.json()

  if (!data.success) {
    return NextResponse.json(
      { error: 'Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie.' },
      { status: 403 }
    )
  }

  return NextResponse.json({ ok: true })
}
