import { ref } from '@nuxtjs/composition-api'

export interface HapticPattern {
  move: number[]
  win: number[]
  lose: number[]
  draw: number[]
  victory: number[]
  defeat: number[]
  cardTransfer: number[]
}

export interface HapticFeedback {
  enabled: boolean
  trigger: (type: keyof HapticPattern) => void
  toggle: () => boolean
}

const patterns: HapticPattern = {
  move: [50],
  win: [100, 50, 100],
  lose: [50, 100, 50],
  draw: [75, 75],
  victory: [150, 50, 150, 50, 150],
  defeat: [50, 150, 50, 150, 50],
  cardTransfer: [100, 30, 100]
}

export function useHaptics(): HapticFeedback {
  const enabled = ref(true)

  const trigger = (type: keyof HapticPattern) => {
    if (!enabled.value || !window.navigator.vibrate) return
    
    const pattern = patterns[type]
    if (pattern) {
      window.navigator.vibrate(pattern)
    }
  }

  const toggle = () => {
    enabled.value = !enabled.value
    return enabled.value
  }

  return {
    enabled: enabled.value,
    trigger,
    toggle
  }
}
