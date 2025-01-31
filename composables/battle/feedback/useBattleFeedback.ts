import { ref, onBeforeUnmount } from '@nuxtjs/composition-api'
import { useSound } from './useSound'
import { useHaptics } from './useHaptics'
import { useParticles } from './useParticles'

export interface BattleFeedback {
  triggerFeedback: (type: string, x?: number, y?: number) => void
  toggleSound: () => boolean
  toggleHaptics: () => boolean
  clearEffects: () => void
  isSoundEnabled: boolean
  isHapticsEnabled: boolean
  particles: any[] // Using any[] since Particle interface is internal to useParticles
}

interface FeedbackEffect {
  type: string
  x?: number
  y?: number
  timestamp: number
}

export function useBattleFeedback(): BattleFeedback {
  const sound = useSound()
  const haptics = useHaptics()
  const { particles, createParticles, clearParticles } = useParticles()

  // Effect queue to prevent rapid triggering
  const effectQueue = ref<FeedbackEffect[]>([])
  const isProcessing = ref(false)
  const processingTimeout = ref<number | null>(null)

  const processEffectQueue = () => {
    if (isProcessing.value || effectQueue.value.length === 0) return

    isProcessing.value = true
    const now = Date.now()
    
    // Remove stale effects (older than 1 second)
    effectQueue.value = effectQueue.value.filter(effect => 
      now - effect.timestamp < 1000
    )

    const effect = effectQueue.value.shift()
    if (effect) {
      // Sound feedback (with debounce)
      if (now - lastSoundTime.value > 100) {
        sound.play(effect.type)
        lastSoundTime.value = now
      }

      // Haptic feedback (with debounce)
      if (now - lastHapticTime.value > 100) {
        haptics.trigger(effect.type as any)
        lastHapticTime.value = now
      }

      // Particle effects for victory/defeat
      if ((effect.type === 'victory' || effect.type === 'defeat') && 
          effect.x !== undefined && effect.y !== undefined) {
        createParticles(effect.x, effect.y, effect.type)
      }
    }

    // Schedule next processing
    processingTimeout.value = window.setTimeout(() => {
      isProcessing.value = false
      processEffectQueue()
    }, 100) as unknown as number
  }

  const lastSoundTime = ref(0)
  const lastHapticTime = ref(0)

  const triggerFeedback = (type: string, x?: number, y?: number) => {
    effectQueue.value.push({
      type,
      x,
      y,
      timestamp: Date.now()
    })
    processEffectQueue()
  }

  const toggleSound = () => {
    return sound.toggle()
  }

  const toggleHaptics = () => {
    return haptics.toggle()
  }

  const clearEffects = () => {
    effectQueue.value = []
    clearParticles()
    if (processingTimeout.value) {
      clearTimeout(processingTimeout.value)
      processingTimeout.value = null
    }
    isProcessing.value = false
  }

  // Cleanup on component unmount
  onBeforeUnmount(() => {
    clearEffects()
  })

  return {
    triggerFeedback,
    toggleSound,
    toggleHaptics,
    clearEffects,
    isSoundEnabled: sound.enabled,
    isHapticsEnabled: haptics.enabled,
    particles: particles.value
  }
}
