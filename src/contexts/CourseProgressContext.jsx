import { createContext, useContext, useCallback } from 'react'
import lectures from '../data/lectures.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const STORAGE_KEY = 'pt_course_progress_v1'
const CourseProgressContext = createContext(null)

const DEFAULT_STATE = {
  status: 'unset', // 'unset' | 'novice' | 'graduate'
  schedule: {}, // lectureId -> ISO date string (when the topic becomes available)
  testsPassed: {}, // lectureId -> true (at least 1 correct answer given)
  notes: {}, // lectureId -> free text
  quotesSeen: [], // indices already shown, to reduce repeats
  courseCompleteSeen: false,
}

function isWeekend(d) {
  const day = d.getDay()
  return day === 0 || day === 6
}

function nextWeekday(d) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + 1)
  while (isWeekend(nd)) nd.setDate(nd.getDate() + 1)
  return nd
}

// Строит расписание от даты первой лекции: каждый следующий будний день (пропуская сб/вс), то же время.
function buildSchedule(firstDateISO) {
  const schedule = {}
  let cur = new Date(firstDateISO)
  lectures.forEach((l, i) => {
    if (i === 0) {
      schedule[l.id] = cur.toISOString()
    } else {
      cur = nextWeekday(cur)
      schedule[l.id] = cur.toISOString()
    }
  })
  return schedule
}

export function CourseProgressProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, DEFAULT_STATE)

  const setStatus = useCallback((status) => {
    setState((s) => ({ ...s, status }))
  }, [setState])

  const startNoviceSchedule = useCallback((firstDateISO) => {
    setState((s) => ({ ...s, status: 'novice', schedule: buildSchedule(firstDateISO) }))
  }, [setState])

  const setLectureDate = useCallback((lectureId, isoDate) => {
    setState((s) => ({ ...s, schedule: { ...s.schedule, [lectureId]: isoDate } }))
  }, [setState])

  const markTestPassed = useCallback((lectureId) => {
    setState((s) => ({ ...s, testsPassed: { ...s.testsPassed, [lectureId]: true } }))
  }, [setState])

  const setNote = useCallback((lectureId, text) => {
    setState((s) => ({ ...s, notes: { ...s.notes, [lectureId]: text } }))
  }, [setState])

  const markQuoteSeen = useCallback((index) => {
    setState((s) => (s.quotesSeen.includes(index) ? s : { ...s, quotesSeen: [...s.quotesSeen, index] }))
  }, [setState])

  const markCourseCompleteSeen = useCallback(() => {
    setState((s) => ({ ...s, courseCompleteSeen: true }))
  }, [setState])

  // Доступна ли тема (лекция) целиком: первая — всегда, остальные — если сдан тест
  // предыдущей лекции И наступила запланированная дата этой лекции.
  const isLectureUnlocked = useCallback((lectureId) => {
    if (state.status !== 'novice') return true
    const idx = lectures.findIndex((l) => l.id === lectureId)
    if (idx <= 0) return true
    const prevId = lectures[idx - 1].id
    const prevDone = !!state.testsPassed[prevId]
    const dateStr = state.schedule[lectureId]
    const dateReached = !dateStr || new Date() >= new Date(dateStr)
    return prevDone && dateReached
  }, [state])

  const unlockDateFor = useCallback((lectureId) => state.schedule[lectureId], [state])

  // Почему тема ещё закрыта: 'prev_test' — не сдан тест предыдущей темы, 'date' — не наступила дата, null — открыта.
  const lockReason = useCallback((lectureId) => {
    if (state.status !== 'novice') return null
    const idx = lectures.findIndex((l) => l.id === lectureId)
    if (idx <= 0) return null
    const prevId = lectures[idx - 1].id
    const prevDone = !!state.testsPassed[prevId]
    if (!prevDone) return 'prev_test'
    const dateStr = state.schedule[lectureId]
    const dateReached = !dateStr || new Date() >= new Date(dateStr)
    if (!dateReached) return 'date'
    return null
  }, [state])

  const totalLectures = lectures.length
  const passedCount = Object.keys(state.testsPassed).length
  const isCourseComplete = state.status === 'novice' && passedCount >= totalLectures

  const value = {
    status: state.status,
    schedule: state.schedule,
    testsPassed: state.testsPassed,
    notes: state.notes,
    quotesSeen: state.quotesSeen,
    courseCompleteSeen: state.courseCompleteSeen,
    setStatus,
    startNoviceSchedule,
    setLectureDate,
    markTestPassed,
    setNote,
    markQuoteSeen,
    markCourseCompleteSeen,
    isLectureUnlocked,
    unlockDateFor,
    lockReason,
    totalLectures,
    passedCount,
    isCourseComplete,
  }

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  )
}

export function useCourseProgress() {
  const ctx = useContext(CourseProgressContext)
  if (!ctx) throw new Error('useCourseProgress must be used within CourseProgressProvider')
  return ctx
}
