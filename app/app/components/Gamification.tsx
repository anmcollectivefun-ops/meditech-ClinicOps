'use client'

import { useMemo } from 'react'
import { Trophy, Lock, Sparkles, Bell, BellOff, Flame } from 'lucide-react'
import {
  getEventGamificationConfig,
  getCurrentLevel,
  getNextLevel,
  getUnlockedAchievements,
  type AchievementContext,
  type InitialTask,
  type Stage,
  type EventType,
} from '../lib/eventGamification'

interface GamificationProps {
  eventId: string
  eventType: string | null | undefined
  theme: any
  supabase: any
  tasks: Array<{
    id: string
    status: boolean
    points: number
    stage: number
    title: string
    icon?: string
  }>
  notificationsEnabled?: boolean
  onTaskComplete?: (taskId: string) => void
  // legacy props (zachowane dla kompatybilności)
  allTasks?: any
}

export default function Gamification({
  eventType,
  tasks,
  notificationsEnabled = false,
}: GamificationProps) {
  // Konfiguracja całej grywalizacji dla danego typu eventu
  const config = useMemo(() => getEventGamificationConfig(eventType), [eventType])

  // Kontekst osiągnięć (suma punktów, ile w każdym etapie itd.)
  const ctx = useMemo(() => buildAchievementContext(tasks), [tasks])

  // Aktualny i następny poziom
  const currentLevel = useMemo(
    () => getCurrentLevel(ctx.totalPoints, config.levels),
    [ctx.totalPoints, config.levels]
  )
  const nextLevel = useMemo(
    () => getNextLevel(ctx.totalPoints, config.levels),
    [ctx.totalPoints, config.levels]
  )

  // Odblokowane osiągnięcia
  const unlockedAchievements = useMemo(
    () => getUnlockedAchievements(ctx, config.achievements),
    [ctx, config.achievements]
  )
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))

  // % postępu do następnego poziomu
  const progressToNext = useMemo(() => {
    if (!nextLevel) return 100
    const range = nextLevel.threshold - currentLevel.threshold
    if (range <= 0) return 100
    const earned = ctx.totalPoints - currentLevel.threshold
    return Math.min(100, Math.max(0, (earned / range) * 100))
  }, [currentLevel, nextLevel, ctx.totalPoints])

  // % ukończenia ogółem
  const overallProgress = ctx.totalCount > 0
    ? Math.round((ctx.completedCount / ctx.totalCount) * 100)
    : 0

  return (
    <div className="space-y-6">

      {/* HERO: POWITANIE + CYTAT */}
      <div
        className="rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.themeColors.primary}, ${config.themeColors.accent})`,
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{config.emoji}</span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              {config.label}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2 leading-tight">
            {config.welcomeMessage}
          </h3>
          <p className="text-sm opacity-90 italic">"{config.motivationalQuote}"</p>
        </div>
      </div>

      {/* MONIT O POWIADOMIENIA — informacyjny */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
        notificationsEnabled
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        <p className="text-xs font-bold">
          {notificationsEnabled
            ? 'Powiadomienia push są aktywne — będziemy przypominać o ważnych terminach!'
            : 'Powiadomienia push są wyłączone — możesz je włączyć powyżej.'}
        </p>
      </div>

      {/* AKTUALNY POZIOM */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Twój poziom
            </p>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span className="text-3xl">{currentLevel.emoji}</span>
              {currentLevel.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{currentLevel.description}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Punkty
            </p>
            <p className="text-3xl font-black" style={{ color: config.themeColors.primary }}>
              {ctx.totalPoints}
            </p>
          </div>
        </div>

        {nextLevel ? (
          <>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
              <span>{currentLevel.name}</span>
              <span className="flex items-center gap-1">
                <Sparkles size={12} />
                Następny: {nextLevel.name} ({nextLevel.threshold - ctx.totalPoints} pkt)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressToNext}%`,
                  background: `linear-gradient(90deg, ${config.themeColors.primary}, ${config.themeColors.accent})`,
                }}
              />
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Flame size={24} className="text-amber-500" />
            <p className="text-sm font-bold text-amber-800">
              Osiągnęłaś/eś najwyższy poziom! Wow!
            </p>
          </div>
        )}
      </div>

      {/* STATYSTYKI OGÓLNE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Ukończono" value={`${ctx.completedCount}/${ctx.totalCount}`} color={config.themeColors.primary} />
        <StatCard label="Postęp" value={`${overallProgress}%`} color={config.themeColors.accent} />
        <StatCard label="Punkty" value={ctx.totalPoints} color={config.themeColors.primary} />
        <StatCard label="Osiągnięcia" value={`${unlockedAchievements.length}/${config.achievements.length}`} color={config.themeColors.accent} />
      </div>

      {/* OSIĄGNIĘCIA */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Trophy size={20} style={{ color: config.themeColors.primary }} />
            Osiągnięcia
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {unlockedAchievements.length} / {config.achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.achievements.map(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className={`text-3xl shrink-0 ${isUnlocked ? '' : 'grayscale'}`}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-sm mb-0.5 ${
                    isUnlocked ? 'text-amber-900' : 'text-slate-500'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-xs ${
                    isUnlocked ? 'text-amber-700' : 'text-slate-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {!isUnlocked && <Lock size={14} className="text-slate-300 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* POSTĘP PER ETAP */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
          <Sparkles size={20} style={{ color: config.themeColors.primary }} />
          Postęp etapów
        </h3>

        <div className="space-y-3">
          {config.stages.map(stage => {
            const total = ctx.totalByStage[stage.num] ?? 0
            const done = ctx.completedByStage[stage.num] ?? 0
            const percent = total > 0 ? (done / total) * 100 : 0
            const isComplete = total > 0 && done === total

            return (
              <div key={stage.num} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{stage.icon}</span>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-800 truncate">{stage.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {stage.timeframe}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {done}/{total}
                  </span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      background: isComplete
                        ? '#10b981'
                        : `linear-gradient(90deg, ${stage.color}, ${config.themeColors.accent})`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ============================================================================
// MAŁY KOMPONENT POMOCNICZY
// ============================================================================
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
// ============================================================================
// FUNKCJE BRAKUJĄCE — dodaj na dole pliku
// ============================================================================

/**
 * Buduje kontekst potrzebny do sprawdzania warunków osiągnięć
 */
export function buildAchievementContext(tasks: any[]): AchievementContext {
  const completed = tasks.filter(t => t.status)
  const totalPoints = completed.reduce((sum, t) => sum + (t.points || 0), 0)

  const completedByStage: Record<number, number> = {}
  const totalByStage: Record<number, number> = {}

  for (const t of tasks) {
    const s = t.stage || 0
    totalByStage[s] = (totalByStage[s] || 0) + 1
    if (t.status) completedByStage[s] = (completedByStage[s] || 0) + 1
  }

  return {
    totalPoints,
    completedCount: completed.length,
    totalCount: tasks.length,
    completedByStage,
    totalByStage,
  }
}

/**
 * Zwraca listę zadań startowych dla danego typu eventu
 */
export function getTasksForEventType(type: string | null | undefined): InitialTask[] {
  const safeType = (type || 'inne') as EventType
  return getEventGamificationConfig(safeType).tasks
}

/**
 * Zwraca listę etapów dla danego typu eventu
 */
export function getStagesForEventType(type: string | null | undefined): Stage[] {
  const safeType = (type || 'inne') as EventType
  return getEventGamificationConfig(safeType).stages
}