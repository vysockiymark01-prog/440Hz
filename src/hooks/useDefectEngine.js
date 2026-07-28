import { useRef, useEffect, useCallback } from 'react'
import DefectEngine from '../audio/DefectEngine.js'

export function useDefectEngine() {
  const engineRef = useRef(null)

  useEffect(() => {
    engineRef.current = new DefectEngine()
    return () => {
      engineRef.current?.dispose()
    }
  }, [])

  const play = useCallback((type, freq, duration) => {
    engineRef.current?.play(type, freq, duration)
  }, [])

  const stop = useCallback(() => {
    engineRef.current?.stop()
  }, [])

  return { play, stop }
}
