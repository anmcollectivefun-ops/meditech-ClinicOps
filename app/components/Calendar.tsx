// ============================================================================
// Calendar.tsx — Kalendarz miesięczny z "wow"
// ============================================================================
// Features:
// - Animowane przejścia między miesiącami (slide)
// - Ikonki dla dni z wydarzeniami zamiast kropek
// - Mini-legenda źródeł danych
// - Klik w dzień = panel dnia z listą + szybkim dodaniem zadania
// - Hover efekty, dzień dzisiejszy pulsujący, dzień eventu podświetlony
// - Pobieranie danych z całej aplikacji (tasks, budget, schedule, event)
// ============================================================================

'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Sparkles, Check, Clock, Zap } from 'lucide-react'
import { useCalendarEvents, ymd, isToday, getMonthGrid, getMonthName, CalendarEvent } from '../hooks/useCalendarEvents'
import { AVAILABLE_ICONS } from '../lib/taskLibrary'

const WEEK_DAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']

type Props = {
  eventId: string
  event: any
  theme: any
  supabase: any
  onTaskAdded?: () => void
}

export default function Calendar({ eventId, event, theme, supabase, onTaskAdded }: Props) {
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const { events, loading, refresh } = useCalendarEvents(eventId, supabase, event)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  // Grupowanie wydarzeń po dniu
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [events])

  const todayStr = ymd(new Date())
  const eventDateStr = event?.event_date ? event.event_date.split('T')[0] : null

  function navigateMonth(delta: number) {
    setSlideDir(delta > 0 ? 'left' : 'right')
    setTimeout(() => {
      const next = new Date(viewDate)
      next.setDate(1) // zawsze 1 żeby uniknąć przeskoków
      next.setMonth(next.getMonth() + delta)
      setViewDate(next)
      setTimeout(() => setSlideDir(null), 50)
    }, 150)
  }

  function goToday() {
    setSlideDir(null)
    setViewDate(new Date())
  }

  // Statystyki miesiąca
  const monthStats = useMemo(() => {
    let total = 0, completed = 0, overdue = 0
    for (const e of events) {
      const eDate = new Date(e.date)
      if (eDate.getFullYear() === year && eDate.getMonth() === month) {
        total++
        if (e.completed) completed++
        else if (e.date < todayStr) overdue++
      }
    }
    return { total, completed, overdue }
  }, [events, year, month, todayStr])

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft  { from { opacity: 0; transform: translateX(-30px);} to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseSoft    { 0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); } }
        @keyframes popIn        { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer      { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .slide-right { animation: slideInRight 0.3s ease-out; }
        .slide-left  { animation: slideInLeft 0.3s ease-out; }
        .today-pulse { animation: pulseSoft 2s infinite; }
        .pop-in      { animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .event-shimmer {
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* NAGŁÓWEK KALENDARZA */}
      <div className={`${theme.bgCard} rounded-3xl p-6 shadow-lg relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20`}>
              <CalendarIcon size={22} className={theme.textMain} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${theme.textMain} capitalize`}>
                {getMonthName(viewDate)}
              </h2>
              <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${theme.textMain}`}>
                {monthStats.total} {monthStats.total === 1 ? 'wydarzenie' : monthStats.total < 5 ? 'wydarzenia' : 'wydarzeń'}
                {monthStats.overdue > 0 && <span className="text-rose-300 ml-2">• {monthStats.overdue} po terminie</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20 ${theme.textMain} hover:bg-white/25 transition-all`}
            >
              Dziś
            </button>
            <button
              onClick={() => navigateMonth(-1)}
              className={`w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center ${theme.textMain} hover:bg-white/25 transition-all`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className={`w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center ${theme.textMain} hover:bg-white/25 transition-all`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* LEGENDA */}
      <div className="flex flex-wrap items-center gap-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span className="flex items-center gap-1"><span className="text-xs">📝</span> Zadanie</span>
        <span className="flex items-center gap-1"><span className="text-xs">💰</span> Płatność</span>
        <span className="flex items-center gap-1"><span className="text-xs">🎉</span> Wydarzenie</span>
        <span className="flex items-center gap-1"><span className="text-xs opacity-50 grayscale">✅</span> Zrobione</span>
      </div>

      {/* SIATKA KALENDARZA */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Nagłówki dni tygodnia */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className={`text-center py-2 text-[20px] sm:text-xs font-black uppercase tracking-wider ${i >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Siatka dni */}
        <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${slideDir === 'left' ? 'slide-right' : slideDir === 'right' ? 'slide-left' : ''}`}>
          {grid.map((date, idx) => {
            const dateStr = ymd(date)
            const dayEvents = eventsByDate[dateStr] || []
            const isCurrentMonth = date.getMonth() === month
            const todayFlag = isToday(date)
            const isEventDay = dateStr === eventDateStr
            const isPast = dateStr < todayStr && !todayFlag
            const hasOverdue = dayEvents.some(e => !e.completed && e.date < todayStr)
            const weekend = date.getDay() === 0 || date.getDay() === 6

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(date)}
                className={`
                  relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-start p-1.5 sm:p-2
                  transition-all duration-200 group
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isEventDay ? 'bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 shadow-md event-shimmer' : ''}
                  ${todayFlag && !isEventDay ? `${theme.bgLight} border-2 ${theme.border || 'border-slate-300'} today-pulse` : ''}
                  ${!todayFlag && !isEventDay && dayEvents.length > 0 ? 'bg-slate-50 border border-slate-200 hover:border-slate-300' : ''}
                  ${!todayFlag && !isEventDay && dayEvents.length === 0 ? 'hover:bg-slate-50 border border-transparent' : ''}
                  hover:scale-[1.03] hover:shadow-sm active:scale-95
                `}
              >
                <span className={`
                  text-xs sm:text-sm font-black leading-none mt-0.5
                  ${isEventDay ? 'text-amber-900' : ''}
                  ${todayFlag && !isEventDay ? theme.textTheme : ''}
                  ${!todayFlag && !isEventDay && weekend ? 'text-rose-500' : ''}
                  ${!todayFlag && !isEventDay && !weekend ? 'text-slate-700' : ''}
                  ${isPast && !isEventDay && !todayFlag ? 'opacity-60' : ''}
                `}>
                  {date.getDate()}
                </span>

                {/* Ikona dnia wydarzenia */}
                {isEventDay && (
                  <div className="absolute top-1 right-1 text-[10px] pop-in">
                    <Sparkles size={10} className="text-amber-600" />
                  </div>
                )}

               {/* Ikonki wydarzeń (Zastępują kropki) */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 sm:bottom-1.5 left-1 right-1 flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 pop-in">
                    {dayEvents.slice(0, 4).map((e, i) => (
                      <span
                        key={i}
                        title={e.title}
                        className={`text-xs sm:text-base lg:text-lg leading-none drop-shadow-md transition-all hover:scale-125 ${e.completed ? 'opacity-40 grayscale' : ''}`}
                      >
                        {e.completed ? '✅' : (e.icon || '📌')}
                      </span>
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[9px] sm:text-xs font-black text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 ml-0.5 leading-none shadow-sm border border-slate-200">
                        +{dayEvents.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Wskaźnik zaległych */}
                {hasOverdue && (
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none backdrop-blur-sm">
            <div className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-wider">Ładowanie...</div>
          </div>
        )}
      </div>

      {/* MINI-PODSUMOWANIE */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <div className="text-2xl font-black text-slate-800">{monthStats.total}</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">W tym miesiącu</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
          <div className="text-2xl font-black text-emerald-600">{monthStats.completed}</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mt-1">Ukończone</div>
        </div>
        <div className={`rounded-2xl p-4 border text-center ${monthStats.overdue > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`text-2xl font-black ${monthStats.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{monthStats.overdue}</div>
          <div className={`text-[10px] font-black uppercase tracking-wider mt-1 ${monthStats.overdue > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Po terminie</div>
        </div>
      </div>

      {/* MODAL DNIA */}
      {selectedDay && (
        <DayModal
          date={selectedDay}
          events={eventsByDate[ymd(selectedDay)] || []}
          onClose={() => { setSelectedDay(null); setShowQuickAdd(false) }}
          onAddTask={() => setShowQuickAdd(true)}
          showQuickAdd={showQuickAdd}
          setShowQuickAdd={setShowQuickAdd}
          theme={theme}
          eventId={eventId}
          supabase={supabase}
          onTaskAdded={() => { refresh(); onTaskAdded?.(); }}
          isEventDay={ymd(selectedDay) === eventDateStr}
        />
      )}
    </div>
  )
}

// ============================================================================
// MODAL DNIA
// ============================================================================
function DayModal({
  date, events, onClose, onAddTask, showQuickAdd, setShowQuickAdd,
  theme, eventId, supabase, onTaskAdded, isEventDay
}: any) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [newTaskIcon, setNewTaskIcon] = useState('📝')
  const [notify, setNotify] = useState(true)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [saving, setSaving] = useState(false)
  const [showIcons, setShowIcons] = useState(false)

  async function addTask() {
    if (!newTaskTitle.trim()) return
    setSaving(true)
    const newTask = {
      event_id: eventId,
      title: newTaskTitle,
      deadline: ymd(date),
      time: newTaskTime || null,
      icon: newTaskIcon,
      notify,
      priority,
      category: 'custom',
      stage: 0,
      points: 10
    }
    await supabase.from('tasks').insert([newTask])
    setNewTaskTitle(''); setNewTaskTime(''); setNewTaskIcon('📝'); setPriority('normal')
    setShowQuickAdd(false)
    setSaving(false)
    onTaskAdded?.()
  }

  const sortedEvents = [...events].sort((a: CalendarEvent, b: CalendarEvent) => (a.time || '99:99').localeCompare(b.time || '99:99'))

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${isEventDay ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : ''}`}>
          <div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${isEventDay ? 'text-amber-600' : 'text-slate-400'}`}>
              {isEventDay ? '⭐ Dzień wydarzenia' : date.toLocaleDateString('pl-PL', { weekday: 'long' })}
            </div>
            <h3 className={`text-2xl font-black ${isEventDay ? 'text-amber-900' : 'text-slate-800'}`}>
              {date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedEvents.length === 0 && !showQuickAdd ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center text-3xl">✨</div>
              <p className="text-slate-500 font-bold">Ten dzień jest wolny</p>
              <p className="text-xs text-slate-400 mt-1">Dodaj zadanie, by o niczym nie zapomnieć.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedEvents.map((e: CalendarEvent) => (
                <DayEventRow key={e.id} event={e} theme={theme} />
              ))}
            </div>
          )}

          {/* Szybkie dodawanie */}
          {showQuickAdd && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 animate-in slide-in-from-top-2 duration-200">
              <h4 className="font-black text-sm text-slate-800 mb-3 flex items-center gap-2"><Plus size={14} /> Nowe zadanie</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowIcons(!showIcons)}
                    className="w-12 h-12 flex items-center justify-center text-2xl bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    {newTaskIcon}
                  </button>
                  <input
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Co masz do zrobienia?"
                    className={`flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none ${theme.ring}`}
                    autoFocus
                  />
                </div>
                {showIcons && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                      {AVAILABLE_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => { setNewTaskIcon(icon); setShowIcons(false) }}
                          className={`aspect-square flex items-center justify-center text-xl rounded-lg hover:bg-slate-100 ${newTaskIcon === icon ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3">
                    <Clock size={14} className="text-slate-400" />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={e => setNewTaskTime(e.target.value)}
                      className="flex-1 py-3 outline-none text-sm font-bold text-slate-700"
                    />
                  </div>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold outline-none"
                  >
                    <option value="low">🟢 Niski</option>
                    <option value="normal">🟡 Normalny</option>
                    <option value="high">🔴 Wysoki</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                  <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="w-4 h-4" />
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" /> Przypomnij mi push-em
                  </span>
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addTask}
                    disabled={saving || !newTaskTitle.trim()}
                    className={`flex-1 py-3 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn} disabled:opacity-50`}
                  >
                    {saving ? 'Zapisuję...' : 'Zapisz zadanie'}
                  </button>
                  <button
                    onClick={() => setShowQuickAdd(false)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm text-slate-600"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showQuickAdd && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onAddTask}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm shadow-md transition-all ${theme.btn}`}
            >
              <Plus size={16} /> Dodaj zadanie na ten dzień
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DayEventRow({ event, theme }: { event: CalendarEvent, theme: any }) {
  const sourceLabels: Record<string, string> = {
    task: 'Zadanie',
    budget: 'Budżet',
    schedule: 'Harmonogram',
    event: 'WYDARZENIE',
    custom: 'Własne'
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
        event.completed ? 'bg-emerald-50/40 border-emerald-100 opacity-70' :
        event.source === 'event' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
        'bg-slate-50 border-slate-100 hover:border-slate-200'
      }`}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm border border-white"
        style={{ backgroundColor: event.color + '22' }}
      >
        {event.completed ? <Check className="text-emerald-500" /> : event.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: event.color + '22', color: event.color }}>
            {sourceLabels[event.source]}
          </span>
          {event.time && (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Clock size={9} /> {event.time}
            </span>
          )}
        </div>
        <p className={`text-sm font-bold truncate ${event.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
          {event.title}
        </p>
        {event.amount !== undefined && event.amount > 0 && (
          <p className="text-xs font-black text-rose-600 mt-0.5">Do zapłaty: {event.amount.toLocaleString()} zł</p>
        )}
      </div>
    </div>
  )
}