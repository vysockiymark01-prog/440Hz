import { useRef, useEffect, useCallback, useState } from 'react'
import TemperamentEngine from '../audio/TemperamentEngine.js'

export function useTemperamentEngine() {
  const engineRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    engineRef.current = new TemperamentEngine()
    return () => {
      engineRef.current?.dispose()
    }
  }, [])

  const start = useCallback((freqA, freqB, volume) => {
    engineRef.current?.start(freqA, freqB, volume)
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    engineRef.current?.stop()
    setIsPlaying(false)
  }, [])

  const setFreqA = useCallback((f) => engineRef.current?.setFreqA(f), [])
  const setFreqB = useCallback((f) => engineRef.current?.setFreqB(f), [])
  const getAnalyser = useCallback(() => engineRef.current?.getAnalyser(), [])

  return { start, stop, setFreqA, setFreqB, getAnalyser, isPlaying }
}
