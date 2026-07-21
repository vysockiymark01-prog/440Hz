import { useLocalStorage } from './useLocalStorage.js'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000)
}

const DEFAULT_STREAK = { lastDate: null, current: 0, best: 0 }

// Серия дней практики в тренажёре. recordActivity() вызывается из режимов
// тренажёра при завершении осмысленного действия (не чаще раза в день).
export function useTrainerStreak() {
  const [streak, setStreak] = useLocalStorage('pt_trainer_streak_v1', DEFAULT_STREAK)

  const recordActivity = () => {
    const today = todayStr()
    setStreak((prev) => {
      if (prev.lastDate === today) return prev
      const current = prev.lastDate && daysBetween(prev.lastDate, today) === 1 ? prev.current + 1 : 1
      return { lastDate: today, current, best: Math.max(prev.best, current) }
    })
  }

  return { streak, recordActivity, todayDone: streak.lastDate === todayStr() }
}
