// app/hooks/useCalendarEvents.ts
import { useState, useEffect, useCallback } from 'react'

export type CalendarEvent = {
  id: string
  date: string 
  title: string
  time?: string
  color: string
  completed: boolean
  icon?: string
  source: 'task' | 'budget' | 'schedule' | 'event' | 'custom'
  stage?: number
  amount?: number
}

export function ymd(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split('T')[0]
}

export function isToday(date: Date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export function getMonthName(date: Date) {
  return date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
}

export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  let startOffset = firstDay.getDay() - 1
  if (startOffset === -1) startOffset = 6 
  const days: Date[] = []
  const startDate = new Date(year, month, 1 - startOffset)
  for (let i = 0; i < 42; i++) { 
    days.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i))
  }
  return days
}

export function useCalendarEvents(eventId: string, supabase: any, eventData: any) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setLoading(true)

    // Pobieramy dane z zadań i budżetu naraz!
    const [tasksRes, budgetRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('event_id', eventId),
      supabase.from('budget_items').select('*').eq('event_id', eventId)
    ])

    const newEvents: CalendarEvent[] = []

    if (tasksRes.data) {
      tasksRes.data.forEach((t: any) => {
        if (t.deadline) {
          newEvents.push({
            id: `task_${t.id}`,
            date: t.deadline,
            title: t.title,
            time: t.time || null,
            color: '#6366f1',
            completed: t.status,
            icon: t.icon || (t.status ? '✅' : '📝'),
            source: t.category === 'custom' ? 'custom' : 'task',
            stage: t.stage
          })
        }
      })
    }

 if (budgetRes.data) {
      budgetRes.data.forEach((b: any) => {
        if (b.due_date) {
          const estimated = Number(b.estimated_cost) || 0
          const paid = Number(b.paid_amount) || 0
          const left = estimated - paid
          
          // Jeśli zaplanowano koszt i wpłacono całość (lub więcej) -> wydatek opłacony!
          const isCompleted = estimated > 0 && left <= 0;

          newEvents.push({
            id: `budget_${b.id}`,
            date: b.due_date,
            title: `Płatność: ${b.name}`,
            color: isCompleted ? '#10b981' : '#f59e0b', // Szmaragdowy (zielony) gdy opłacone, bursztynowy gdy do spłaty
            completed: isCompleted,
            icon: '💰',
            source: 'budget',
            amount: left > 0 ? left : 0
          })
        }
      })
    }

    if (eventData?.event_date) {
        newEvents.push({
          id: `main_event`,
          date: eventData.event_date.split('T')[0],
          title: eventData.title || 'Twój Event!',
          color: '#d4af37',
          completed: false,
          icon: '🎉',
          source: 'event'
        })
    }

    setEvents(newEvents)
    setLoading(false)
  }, [eventId, supabase, eventData])

  useEffect(() => { refresh() }, [refresh])

  return { events, loading, refresh }
}