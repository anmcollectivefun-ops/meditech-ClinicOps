'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ClinicThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const storedTheme = localStorage.getItem('clinicops-theme') as 'light' | 'dark' | null
    const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.dataset.clinicTheme = initialTheme
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('clinicops-theme', nextTheme)
    document.documentElement.dataset.clinicTheme = nextTheme
  }

  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--clinic-border)] bg-[color-mix(in_srgb,var(--clinic-panel)_80%,transparent)] text-[var(--clinic-text)] transition hover:border-cyan-300/50 hover:text-cyan-300"
      aria-label={theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
      title={theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
    >
      <Icon size={17} />
    </button>
  )
}
