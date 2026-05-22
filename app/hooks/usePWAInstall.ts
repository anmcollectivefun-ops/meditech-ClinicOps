'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  
  // Nowe stany dla obsługi iOS
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Wykrywanie systemu iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // 2. Sprawdź czy aplikacja jest już zainstalowana (tryb standalone)
    // Działa zarówno dla standardowych PWA, jak i specyficznej flagi Apple
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  ('standalone' in window.navigator && (window.navigator as any).standalone === true)

    if (isPWA) {
      setIsInstalled(true)
      setIsStandalone(true)
      return // Jeśli już zainstalowane, nie musimy podpinać listenerów
    }

    // 3. Standardowa obsługa dla Android/Chrome/Edge
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const triggerInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  // Hook zwraca teraz dodatkowe flagi dla iOS
  return { triggerInstall, isInstallable, isInstalled, isIOS, isStandalone }
}