'use client'

import { useRouter } from 'next/navigation'
import { usePlan } from '../lib/usePlan'

const FREE_FEATURES = [
  'Do 2 eventów',
  'Lista gości do 50 osób',
  'Podstawowa checklist zadań',
  'Podstawowy budżet',
  'Dostęp do planera',
]

const PREMIUM_FEATURES = [
  'Nielimitowane eventy',
  'Nielimitowana lista gości',
  'Zaawansowany budżet z paskami postępu',
  'Lista vendorów z statusami',
  'Eksport do PDF',
  'Statystyki i podsumowania',
  'Przypomnienia o zadaniach',
  'Priorytetowe wsparcie',
  'Wszystkie przyszłe funkcje',
]

export default function UpgradePage() {
  const router = useRouter()
  const { isPremium } = usePlan()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-4xl">⭐</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">Odblokuj pełny planer</h1>
          <p className="text-gray-500">Wszystkie narzędzia do organizacji Twojego wymarzonego eventu</p>
        </div>

        {isPremium && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-8">
            <p className="text-green-700 font-semibold">Masz już aktywny plan Premium!</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Free</p>
              <p className="text-4xl font-bold text-gray-800">0 zł</p>
              <p className="text-sm text-gray-400 mt-1">na zawsze darmowy</p>
            </div>
            <ul className="space-y-3">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-6 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Zostań z Free
            </button>
          </div>

          <div className="bg-purple-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              POLECANY
            </div>
            <div className="text-center mb-6">
              <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2">Premium</p>
              <p className="text-4xl font-bold text-white">49 zł</p>
              <p className="text-sm text-purple-200 mt-1">jednorazowo · dostęp na zawsze</p>
            </div>
            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white">
                  <span className="text-amber-300">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => alert('Wkrótce — podpinamy płatność!')}
              className="w-full bg-amber-400 text-amber-900 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors text-sm"
            >
              Kup Premium →
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-amber-800 mb-1">Masz już stronę zaproszeniową od ANM Collective?</p>
          <p className="text-xs text-amber-700 mb-3">Klienci ANM Collective otrzymują Premium gratis — skontaktuj się z nami.</p>
          <a href="mailto:kontakt@anmcollective.pl" className="text-amber-600 text-xs font-semibold underline">
            kontakt@anmcollective.pl
          </a>
        </div>
      </div>
    </div>
  )
}