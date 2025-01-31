import { ref, computed } from '@nuxtjs/composition-api'
import type { Round, Move } from '~/services/battle/types'
import type { RoundState } from '../types/battle-game.types'

export function useRoundManager(initialRounds: Round[]) {
  const state = ref<RoundState>({
    currentRound: initialRounds.length + 1,
    lastRound: initialRounds[initialRounds.length - 1] || null,
    showRoundResult: false
  })

  const roundTimeout = ref<number | null>(null)

  const showRoundResult = () => {
    state.value.showRoundResult = true
  }

  const hideRoundResult = () => {
    state.value.showRoundResult = false
  }

  const getRoundWinner = (player1Move: Move, player2Move: Move): number => {
    if (player1Move === player2Move) return 0
    
    const winningMoves = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    }
    
    return winningMoves[player1Move] === player2Move ? 1 : 2
  }

  const updateRound = (round: Round) => {
    state.value.lastRound = round
    state.value.currentRound++
  }

  const cleanupTimeouts = () => {
    if (roundTimeout.value) {
      clearTimeout(roundTimeout.value)
      roundTimeout.value = null
    }
  }

  const isValidMove = computed(() => {
    return !state.value.showRoundResult
  })

  return {
    state,
    showRoundResult,
    hideRoundResult,
    getRoundWinner,
    updateRound,
    cleanupTimeouts,
    isValidMove
  }
}
