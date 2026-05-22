'use client'

import { useEffect, useState } from 'react'
import { createClient } from './supabase'

export function useEventPlan(eventId: string) {
  const [loading, setLoading] = useState(true)
  const [hasWebsite, setHasWebsite] = useState(false)
  const [isPro, setIsPro] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (!eventId) return;

    async function load() {
      const { data } = await supabase
        .from('events')
        .select('invitation_url, tier')
        .eq('id', eventId)
        .single()
        
      if (data) {
        setHasWebsite(!!data.invitation_url)
        setIsPro(data.tier === 'pro')
      }
      setLoading(false)
    }
    
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  return {
    loading,
    hasWebsite,
    isPro,
    canExportToWeb: hasWebsite,
    canImportFromWeb: isPro,
  }
}