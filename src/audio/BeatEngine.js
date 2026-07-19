// Простой движок для тренажёра биений: два синусоидальных генератора
// с плавной атакой/затуханием (без щелчков), проходящие через общий
// AnalyserNode для визуализации огибающей амплитуды.

const ATTACK = 0.05
const RELEASE = 0.08

export default class BeatEngine {
  constructor() {
    this.ctx = null
    this.oscA = null
    this.oscB = null
    this.gainA = null
    this.gainB = null
    this.master = null
    this.analyser = null
    this.playing = false
  }

  _ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      this.ctx = new AC()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  start(freqA = 440, freqB = 441, volume = 0.18) {
    const ctx = this._ensureContext()
    if (this.playing) {
      this.setFreqA(freqA)
      this.setFreqB(freqB)
      return
    }

    this.master = ctx.createGain()
    this.master.gain.value = volume

    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0

    this.oscA = ctx.createOscillator()
    this.oscA.type = 'sine'
    this.oscA.frequency.value = freqA
    this.gainA = ctx.createGain()
    this.gainA.gain.value = 0
    this.oscA.connect(this.gainA).connect(this.master)

    this.oscB = ctx.createOscillator()
    this.oscB.type = 'sine'
    this.oscB.frequency.value = freqB
    this.gainB = ctx.createGain()
    this.gainB.gain.value = 0
    this.oscB.connect(this.gainB).connect(this.master)

    this.master.connect(this.analyser)
    this.analyser.connect(ctx.destination)

    const now = ctx.currentTime
    this.gainA.gain.setValueAtTime(0, now)
    this.gainA.gain.linearRampToValueAtTime(1, now + ATTACK)
    this.gainB.gain.setValueAtTime(0, now)
    this.gainB.gain.linearRampToValueAtTime(1, now + ATTACK)

    this.oscA.start()
    this.oscB.start()
    this.playing = true
  }

  setFreqA(freq) {
    if (!this.oscA || !this.ctx) return
    this.oscA.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01)
  }

  setFreqB(freq) {
    if (!this.oscB || !this.ctx) return
    this.oscB.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01)
  }

  muteB(muted) {
    if (!this.gainB || !this.ctx) return
    const now = this.ctx.currentTime
    this.gainB.gain.cancelScheduledValues(now)
    this.gainB.gain.setTargetAtTime(muted ? 0 : 1, now, 0.02)
  }

  stop() {
    if (!this.playing || !this.ctx) return
    const now = this.ctx.currentTime
    const oscA = this.oscA
    const oscB = this.oscB
    this.gainA.gain.cancelScheduledValues(now)
    this.gainA.gain.setValueAtTime(this.gainA.gain.value, now)
    this.gainA.gain.linearRampToValueAtTime(0, now + RELEASE)
    this.gainB.gain.cancelScheduledValues(now)
    this.gainB.gain.setValueAtTime(this.gainB.gain.value, now)
    this.gainB.gain.linearRampToValueAtTime(0, now + RELEASE)
    setTimeout(() => {
      try {
        oscA.stop()
        oscB.stop()
      } catch {
        // already stopped
      }
    }, (RELEASE + 0.02) * 1000)
    this.playing = false
  }

  getAnalyser() {
    return this.analyser
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      if (this.ctx) {
        this.ctx.close().catch(() => {})
        this.ctx = null
      }
    }, (RELEASE + 0.05) * 1000)
  }
}
