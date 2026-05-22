'use client'

import { useEffect, useState } from 'react'
import { createClient } from './supabase'

export function usePlan() {
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      if (data?.plan === 'premium') setPlan('premium')
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    plan,
    loading,
    isPremium: plan === 'premium',
    isFree: plan === 'free',
  }
}