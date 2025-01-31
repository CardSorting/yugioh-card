class BattleSoundManager {
  constructor() {
    this.sounds = new Map()
    this.muted = false
    this.context = null
    this.masterGain = null
  }

  async init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
      
      await this.loadSounds()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  async loadSounds() {
    const soundEffects = {
      charge: {
        url: '/sounds/charge.mp3',
        options: { loop: true }
      },
      clash: {
        url: '/sounds/clash.mp3',
        options: { loop: false }
      },
      impact: {
        url: '/sounds/impact.mp3',
        options: { loop: false }
      },
      victory: {
        url: '/sounds/victory.mp3',
        options: { loop: false }
      },
      defeat: {
        url: '/sounds/defeat.mp3',
        options: { loop: false }
      },
      cardTransfer: {
        url: '/sounds/card-transfer.mp3',
        options: { loop: false }
      }
    }

    for (const [name, config] of Object.entries(soundEffects)) {
      try {
        const response = await fetch(config.url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
        
        this.sounds.set(name, {
          buffer: audioBuffer,
          options: config.options
        })
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error)
      }
    }
  }

  play(soundName, options = {}) {
    if (this.muted || !this.context) return null

    const sound = this.sounds.get(soundName)
    if (!sound) return null

    try {
      const source = this.context.createBufferSource()
      source.buffer = sound.buffer
      
      // Create a gain node for this specific sound
      const gainNode = this.context.createGain()
      gainNode.gain.value = options.volume || 1

      // Create filters based on options
      if (options.filters) {
        const filters = this.createFilters(options.filters)
        source.connect(filters[0])
        filters[filters.length - 1].connect(gainNode)
      } else {
        source.connect(gainNode)
      }

      gainNode.connect(this.masterGain)

      // Apply any fade effects
      if (options.fadeIn) {
        gainNode.gain.setValueAtTime(0, this.context.currentTime)
        gainNode.gain.linearRampToValueAtTime(
          options.volume || 1,
          this.context.currentTime + options.fadeIn
        )
      }

      // Set loop and playback rate
      source.loop = options.loop || sound.options.loop || false
      source.playbackRate.value = options.playbackRate || 1

      source.start(options.delay ? this.context.currentTime + options.delay : 0)

      // Handle fade out if specified
      if (options.fadeOut && !source.loop) {
        gainNode.gain.setValueAtTime(options.volume || 1, this.context.currentTime + (options.duration || source.buffer.duration) - options.fadeOut)
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + (options.duration || source.buffer.duration))
      }

      // Stop the sound after duration if specified
      if (options.duration) {
        source.stop(this.context.currentTime + options.duration)
      }

      return {
        source,
        gainNode,
        stop: () => {
          try {
            source.stop()
          } catch (error) {
            // Ignore errors from stopping already stopped sources
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error)
      return null
    }
  }

  createFilters(filterConfigs) {
    return filterConfigs.map(config => {
      const filter = this.context.createBiquadFilter()
      filter.type = config.type
      filter.frequency.value = config.frequency || 1000
      filter.Q.value = config.Q || 1
      filter.gain.value = config.gain || 0
      return filter
    })
  }

  playCharge() {
    return this.play('charge', {
      volume: 0.7,
      fadeIn: 0.3,
      filters: [
        { type: 'lowpass', frequency: 1000 },
        { type: 'highpass', frequency: 100 }
      ]
    })
  }

  playClash() {
    this.play('clash', {
      volume: 0.8,
      filters: [
        { type: 'highpass', frequency: 200 },
        { type: 'lowshelf', frequency: 400, gain: 6 }
      ]
    })
  }

  playImpact() {
    this.play('impact', {
      volume: 1,
      filters: [
        { type: 'lowshelf', frequency: 200, gain: 8 },
        { type: 'highpass', frequency: 100 }
      ]
    })
  }

  playVictory() {
    this.play('victory', {
      volume: 0.8,
      fadeIn: 0.2,
      filters: [
        { type: 'highshelf', frequency: 2000, gain: 4 }
      ]
    })
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1
    }
    return this.muted
  }

  cleanup() {
    if (this.context) {
      this.context.close()
    }
  }
}

export const battleSoundManager = new BattleSoundManager()
