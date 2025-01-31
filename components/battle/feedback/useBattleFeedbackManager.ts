import { ref } from '@nuxtjs/composition-api'
import { useBattleFeedback } from '~/composables/battle/feedback/useBattleFeedback'
import type { FeedbackHandler } from '../types/battle-game.types'

export function useBattleFeedbackManager() {
  const {
    triggerFeedback: originalTriggerFeedback,
    toggleSound,
    toggleHaptics,
    clearEffects,
    isSoundEnabled,
    isHapticsEnabled,
    particles
  } = useBattleFeedback()

  const isEnabled = ref(true)

  const triggerFeedback: FeedbackHandler = (type, ...args) => {
    if (!isEnabled.value) return

    try {
      originalTriggerFeedback(type, ...args)
    } catch (error) {
      console.error('Feedback error:', error)
      // Non-critical error, don't propagate
    }
  }

  const triggerGameEndFeedback = (
    isWinner: boolean,
    rect: { width: number; height: number },
    isComputerBattle: boolean
  ) => {
    const type = isWinner ? 'victory' : 'defeat'
    
    queueMicrotask(() => {
      if (!isComputerBattle) {
        triggerFeedback('cardTransfer')
      }
      
      triggerFeedback(type, rect.width / 2, rect.height / 2)
    })
  }

  const triggerRoundFeedback = (winner: number) => {
    queueMicrotask(() => {
      triggerFeedback(winner === 1 ? 'win' : winner === 2 ? 'lose' : 'draw')
    })
  }

  const disable = () => {
    isEnabled.value = false
  }

  const enable = () => {
    isEnabled.value = true
  }

  return {
    triggerFeedback,
    triggerGameEndFeedback,
    triggerRoundFeedback,
    toggleSound,
    toggleHaptics,
    clearEffects,
    isSoundEnabled,
    isHapticsEnabled,
    particles,
    disable,
    enable
  }
}
