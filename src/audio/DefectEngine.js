// Синтетическая имитация типичных звуковых дефектов фортепиано для тренажёра
// «Диагностика на слух». Это не реальные записи инструментов (их нет в приложении),
// а смоделированные через Web Audio API паттерны: дребезжание, лишние жёсткие
// обертона и негармоничность (биения внутри одной ноты).

const ATTACK = 0.05
const RELEASE = 0.15

export const DEFECT_TYPES = ['clean', 'buzz', 'harsh', 'inharmonic']

export default class DefectEngine {
  constructor() {
    this.ctx = null
    this.nodes = []
  }

  _ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      this.ctx = new AC()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  _envGain(ctx, now, duration, peak) {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(peak, now + ATTACK)
    g.gain.setValueAtTime(peak, now + duration - RELEASE)
    g.gain.linearRampToValueAtTime(0, now + duration)
    return g
  }

  play(type, freq = 220, duration = 2.2) {
    this.stop()
    const ctx = this._ensureContext()
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.value = 0.4
    master.connect(ctx.destination)
    const nodes = []

    if (type === 'harsh') {
      const partials = [
        { mult: 1, gain: 0.5 },
        { mult: 2, gain: 0.32 },
        { mult: 3, gain: 0.24 },
        { mult: 4, gain: 0.18 },
        { mult: 5, gain: 0.12 },
      ]
      partials.forEach((p) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq * p.mult
        const g = this._envGain(ctx, now, duration, p.gain)
        osc.connect(g).connect(master)
        osc.start(now)
        osc.stop(now + duration + 0.05)
        nodes.push(osc)
      })
    } else if (type === 'inharmonic') {
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.value = freq
      const g1 = this._envGain(ctx, now, duration, 0.5)
      osc1.connect(g1).connect(master)

      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2 + 4 // лёгкая расстройка обертона — биения внутри ноты
      const g2 = this._envGain(ctx, now, duration, 0.35)
      osc2.connect(g2).connect(master)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + duration + 0.05)
      osc2.stop(now + duration + 0.05)
      nodes.push(osc1, osc2)
    } else if (type === 'buzz') {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const g = this._envGain(ctx, now, duration, 0.42)
      osc.connect(g).connect(master)
      osc.start(now)
      osc.stop(now + duration + 0.05)
      nodes.push(osc)

      const bufferSize = Math.floor(ctx.sampleRate * duration)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const bandpass = ctx.createBiquadFilter()
      bandpass.type = 'bandpass'
      bandpass.frequency.value = freq * 3.5
      bandpass.Q.value = 1.5

      const lfo = ctx.createOscillator()
      lfo.frequency.value = 28
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.09
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.06
      lfo.connect(lfoGain).connect(noiseGain.gain)

      noise.connect(bandpass).connect(noiseGain).connect(master)
      lfo.start(now)
      noise.start(now)
      lfo.stop(now + duration + 0.05)
      noise.stop(now + duration + 0.05)
      nodes.push(noise, lfo)
    } else {
      // 'clean' — эталонный чистый тон без дефектов
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const g = this._envGain(ctx, now, duration, 0.5)
      osc.connect(g).connect(master)
      osc.start(now)
      osc.stop(now + duration + 0.05)
      nodes.push(osc)
    }

    this.nodes = nodes
  }

  stop() {
    this.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* уже остановлен */
      }
    })
    this.nodes = []
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      if (this.ctx) {
        this.ctx.close().catch(() => {})
        this.ctx = null
      }
    }, 200)
  }
}
