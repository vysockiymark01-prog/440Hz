import { useRef, useState, useCallback, useEffect } from 'react'
import PitchDetector from '../audio/PitchDetector.js'

export function usePitchDetector() {
  const detectorRef = useRef(null)
  const [frequency, setFrequency] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    detectorRef.current = new PitchDetector()
    return () => detectorRef.current?.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    await detectorRef.current?.start(
      (freq) => setFrequency(freq > 0 ? freq : null),
      (err) => {
        setError(err)
        setIsListening(false)
      }
    )
    setIsListening(true)
  }, [])

  const stop = useCallback(() => {
    detectorRef.current?.stop()
    setIsListening(false)
    setFrequency(null)
  }, [])

  return { start, stop, isListening, frequency, error }
}
