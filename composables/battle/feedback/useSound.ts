import { ref } from '@nuxtjs/composition-api'
import { soundManager } from '~/utils/sounds'

export interface SoundFeedback {
  enabled: boolean
  play: (type: string) => void
  toggle: () => boolean
  preload: () => void
}

export function useSound(): SoundFeedback {
  const enabled = ref(!soundManager.muted)

  const play = (type: string) => {
    if (!enabled.value) return
    soundManager.play(type)
  }

  const toggle = () => {
    soundManager.toggleMute()
    enabled.value = !soundManager.muted
    return enabled.value
  }

  const preload = () => {
    soundManager.preload()
  }

  return {
    enabled: enabled.value,
    play,
    toggle,
    preload
  }
}
