import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'pt_font_scale_v1'
const FontScaleContext = createContext(null)

export const FONT_SCALES = [
  { value: 'normal', label: 'Обычный', zoom: 1 },
  { value: 'large', label: 'Крупный', zoom: 1.15 },
  { value: 'xlarge', label: 'Очень крупный', zoom: 1.3 },
]

function readStoredScale() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (FONT_SCALES.some((s) => s.value === raw)) return raw
  } catch {
    // ignore
  }
  return 'normal'
}

export function FontScaleProvider({ children }) {
  const [scale, setScaleState] = useState(readStoredScale)

  useEffect(() => {
    const zoom = FONT_SCALES.find((s) => s.value === scale)?.zoom || 1
    document.documentElement.style.setProperty('--ui-zoom', zoom)
  }, [scale])

  const setScale = useCallback((next) => {
    setScaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  return (
    <FontScaleContext.Provider value={{ scale, setScale }}>
      {children}
    </FontScaleContext.Provider>
  )
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext)
  if (!ctx) throw new Error('useFontScale must be used within FontScaleProvider')
  return ctx
}
