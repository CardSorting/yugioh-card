class SoundManager {
  constructor() {
    this.sounds = new Map()
    this.muted = false
  }

  preload() {
    const soundEffects = {
      move: '/sounds/move.mp3',
      win: '/sounds/win.mp3',
      lose: '/sounds/lose.mp3',
      draw: '/sounds/draw.mp3',
      victory: '/sounds/victory.mp3',
      defeat: '/sounds/defeat.mp3',
      cardTransfer: '/sounds/card-transfer.mp3'
    }

    for (const [name, path] of Object.entries(soundEffects)) {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.sounds.set(name, audio)
    }
  }

  play(soundName) {
    if (this.muted) return

    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(error => {
        console.warn(`Failed to play sound ${soundName}:`, error)
      })
    }
  }

  toggleMute() {
    this.muted = !this.muted
    return this.muted
  }
}

export const soundManager = new SoundManager()
