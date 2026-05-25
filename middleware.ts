import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en', 'it'],
  defaultLocale: 'pl'
})

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const cleanPathname = pathname.replace(/^\/(pl|en|it)/, '') || '/'
  const localeMatch = pathname.match(/^\/(pl|en|it)/)
  const locale = localeMatch ? localeMatch[1] : 'pl'

  const isB2BPath = cleanPathname.startsWith('/b2b')
  const isB2BAuthPath = cleanPathname === '/b2b/login' || cleanPathname === '/b2b/register'
  const isB2BProtectedPath = isB2BPath && !isB2BAuthPath
  const demoEventId = process.env.NEXT_PUBLIC_DEMO_EVENT_ID
  const isPublicDemoEventPath = Boolean(
    demoEventId &&
    cleanPathname === `/b2b/events/${demoEventId}` &&
    request.nextUrl.searchParams.get('demo') === '1'
  )

  if (!user && isB2BProtectedPath && !isPublicDemoEventPath) {
    return NextResponse.redirect(new URL(`/${locale}/b2b/login`, request.url))
  }

  if (user && isB2BAuthPath) {
    return NextResponse.redirect(new URL(`/${locale}/b2b/dashboard`, request.url))
  }

  if (!user && cleanPathname === '/login') {
    return NextResponse.redirect(new URL(`/${locale}/b2b/login`, request.url))
  }

  if (!user && cleanPathname === '/register') {
    return NextResponse.redirect(new URL(`/${locale}/b2b/register`, request.url))
  }

  if (user && (cleanPathname === '/login' || cleanPathname === '/register')) {
    return NextResponse.redirect(new URL(`/${locale}/b2b/dashboard`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
