'use client'

import { useState } from 'react'

export default function PremiumLock({ feature, description, eventId }: { feature: string, description?: string, eventId: string }) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(`BŁĄD STRIPE: ${data.error}`)
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      alert('Błąd połączenia z serwerem.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
      <div className="text-4xl mb-3">⭐</div>
      <h3 className="font-bold text-slate-800 text-lg mb-1">{feature}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        {description || 'Ta funkcja dostępna jest w planie PRO. Odblokuj pełen potencjał planera!'}
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-black text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50"
      >
        {loading ? 'Przekierowywanie...' : 'Odblokuj Pakiet PRO 🔓'}
      </button>
      <p className="text-xs text-slate-400 mt-4 font-medium">Subskrypcja 59 zł / miesiąc · Anuluj kiedy chcesz</p>
    </div>
  )
}