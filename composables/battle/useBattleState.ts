import { reactive, computed, onBeforeUnmount, ref, watch, ComputedRef } from '@nuxtjs/composition-api'
import { Move, Round, Battle } from '~/services/battle/types'

// Enhanced debounce with proper typing and cleanup
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  const debouncedFn = function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }

  debouncedFn.cancel = () => {
    clearTimeout(timeoutId)
  }

  return debouncedFn
}

// State validation helper
const validateState = (state: BattleState): boolean => {
  if (state.currentRound < 1) return false
  if (state.playerWins < 0 || state.opponentWins < 0) return false
  if (state.playerWins + state.opponentWins > state.currentRound - 1) return false
  return true
}

interface BattleStateType {
  isUpdating: boolean
  currentRound: number
  playerWins: number
  opponentWins: number
  isComplete: boolean
  loading: boolean
  currentMove: Move | null
  showRoundResult: boolean
  cardTransferred: boolean
  error: string | null
}

export interface BattleStateReturn {
  state: BattleStateType
  lastRound: ComputedRef<Round | undefined>
  makeMove: (move: Move) => void
  reset: () => void
  showRoundResult: () => void
  hideRoundResult: () => void
  getRoundWinner: (move1: Move, move2: Move) => number
  isValidMove: ComputedRef<boolean>
}

export type BattleState = BattleStateType

interface StateUpdate {
  type: 'reset' | 'move' | 'roundComplete' | 'battleComplete'
  payload?: any
}

export function useBattleState(battle: Battle, initialRounds: Round[]): BattleStateReturn {
  // Keep a local copy of rounds to prevent external mutations
  const rounds = ref<Round[]>([...initialRounds])
  
  const state = reactive<BattleState>({
    isUpdating: false,
    currentRound: rounds.value.length + 1,
    playerWins: 0,
    opponentWins: 0,
    isComplete: false,
    loading: false,
    currentMove: null,
    showRoundResult: false,
    cardTransferred: false,
    error: null
  })

  // Track cleanup functions
  const cleanupFns: (() => void)[] = []

  // Memoized computed properties
  const lastRound = computed(() => {
    const roundsArray = rounds.value
    return roundsArray[roundsArray.length - 1]
  })

  const isValidMove = computed(() => {
    return !state.loading && !state.isUpdating && !state.isComplete
  })

  // Enhanced win calculation with error handling
  const calculateWins = debounce(() => {
    if (state.isUpdating) return
    state.isUpdating = true
    state.error = null

    try {
      const validRounds = rounds.value.filter(
        round => round?.player1Move && round?.player2Move
      )

      state.playerWins = validRounds.filter(
        round => getRoundWinner(round.player1Move!, round.player2Move!) === 1
      ).length

      state.opponentWins = validRounds.filter(
        round => getRoundWinner(round.player1Move!, round.player2Move!) === 2
      ).length

      if (!validateState(state)) {
        throw new Error('Invalid state after win calculation')
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error calculating wins'
      console.error('Win calculation error:', error)
    } finally {
      state.isUpdating = false
    }
  }, 100)

  cleanupFns.push(() => calculateWins.cancel())

  const getRoundWinner = (move1: Move, move2: Move): number => {
    if (!move1 || !move2) return 0
    if (move1 === move2) return 0
    if (
      (move1 === 'rock' && move2 === 'scissors') ||
      (move1 === 'paper' && move2 === 'rock') ||
      (move1 === 'scissors' && move2 === 'paper')
    ) {
      return 1
    }
    return 2
  }

  // Enhanced move handling with state machine
  const moveTimeout = ref<number | null>(null)
  const makeMove = (move: Move) => {
    if (!isValidMove.value) return
    
    if (moveTimeout.value) {
      clearTimeout(moveTimeout.value)
    }

    try {
      updateState({ type: 'move', payload: move })
      
      // Auto-reset loading state after timeout
      moveTimeout.value = window.setTimeout(() => {
        if (state.loading) {
          updateState({ type: 'move', payload: null })
        }
      }, 5000) as unknown as number
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error making move'
      console.error('Move error:', error)
    }
  }

  cleanupFns.push(() => {
    if (moveTimeout.value) {
      clearTimeout(moveTimeout.value)
    }
  })

  // State update handler
  const updateState = (update: StateUpdate) => {
    if (state.isUpdating && update.type !== 'move') return

    state.isUpdating = true
    state.error = null

    try {
      switch (update.type) {
        case 'reset':
          state.currentMove = null
          state.cardTransferred = false
          state.showRoundResult = false
          state.loading = false
          rounds.value = []
          state.currentRound = 1
          state.playerWins = 0
          state.opponentWins = 0
          state.isComplete = false
          break

        case 'move':
          state.currentMove = update.payload
          state.showRoundResult = false
          state.loading = !!update.payload
          break

        case 'roundComplete':
          state.showRoundResult = true
          state.loading = false
          calculateWins()
          break

        case 'battleComplete':
          state.isComplete = true
          state.loading = false
          state.cardTransferred = update.payload?.cardTransferred ?? false
          break
      }

      if (!validateState(state)) {
        throw new Error('Invalid state after update')
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error updating state'
      console.error('State update error:', error)
    } finally {
      state.isUpdating = false
    }
  }

  const reset = debounce(() => {
    updateState({ type: 'reset' })
  }, 100)

  cleanupFns.push(() => reset.cancel())

  // Watch for round changes
  const roundWatcher = watch(lastRound, (newRound, oldRound) => {
    if (!newRound || !newRound.player1Move || !newRound.player2Move) return
    if (oldRound && 
        newRound.player1Move === oldRound.player1Move && 
        newRound.player2Move === oldRound.player2Move) return

    updateState({ type: 'roundComplete' })
  })

  cleanupFns.push(() => roundWatcher())

  // Enhanced cleanup
  onBeforeUnmount(() => {
    cleanupFns.forEach(cleanup => cleanup())
  })

  const showRoundResult = () => {
    updateState({ type: 'roundComplete' })
  }

  const hideRoundResult = () => {
    state.showRoundResult = false
  }

  // Initialize state
  const initTimeout = setTimeout(calculateWins, 0)
  cleanupFns.push(() => clearTimeout(initTimeout))

  const isValidMoveComputed = computed(() => !state.loading && !state.isUpdating && !state.isComplete)

  return {
    state,
    lastRound,
    makeMove,
    reset,
    showRoundResult,
    hideRoundResult,
    getRoundWinner,
    isValidMove: isValidMoveComputed
  }
}
