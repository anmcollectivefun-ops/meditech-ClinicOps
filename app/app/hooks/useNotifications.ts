// app/hooks/useNotifications.ts
'use client'
import { useState, useEffect } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Twoja przeglądarka nie wspiera powiadomień push.')
      return false
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      new Notification('Świetnie!', {
        body: 'Powiadomienia o zadaniach są włączone.',
        icon: '💡' 
      })
    }
    return result === 'granted'
  }

  return { permission, requestPermission }
}