<template>
  <BattleGameLayout
    :error="error.error.value?.lastError || error.error.value?.error"
    :isInitialLoad="isInitialLoad"
    @mounted="onGameContainerMounted"
    @retry="handleErrorRetry"
  >
    <template #header>
      <GameHeader
        :currentRound="battleState.currentRound"
        :soundEnabled="isSoundEnabled"
        :showHelp="showHelp"
        @toggle-sound="toggleSound"
        @toggle-help="toggleHelpOverlay"
      />
    </template>

    <template #arena>
      <transition name="fade-slide" mode="out-in">
        <GameBoard
          v-if="battle"
          :playerCard="playerCard"
          :opponentCard="battle.isComputerBattle ? null : opponentCard"
          :playerMove="battleState.currentMove"
          :opponentMove="currentRound?.player2Move"
          :isPlayerTurn="!loading"
          class="battle-arena-container"
        />
      </transition>
    </template>

    <template #controls>
      <transition name="fade-slide" mode="out-in">
        <GameControls
          v-if="!isComplete"
          :disabled="loading || battleState.showRoundResult"
          :loading="loading"
          :selectedMove="currentRound?.player1Move"
          @move="handleMove"
        />
      </transition>
    </template>

    <template #overlays>
      <RoundResult
        v-if="battleState.showRoundResult && currentRound?.player1Move && currentRound?.player2Move"
        :show="battleState.showRoundResult"
        :playerMove="currentRound.player1Move"
        :opponentMove="currentRound.player2Move"
        :isComputerBattle="battle.isComputerBattle"
        :roundWinner="getRoundWinner(currentRound.player1Move, currentRound.player2Move)"
        @close="hideRoundResult"
      />

      <VictoryScreen
        v-if="isComplete"
        :isWinner="battleState.playerWins > battleState.opponentWins"
        :playerWins="battleState.playerWins"
        :opponentWins="battleState.opponentWins"
        :isComputerBattle="battle.isComputerBattle"
        :cardTransferred="battleState.cardTransferred"
        @reset="handleReset"
      />

      <HelpOverlay
        :show="showHelp"
        @close="toggleHelpOverlay"
      />
    </template>
  </BattleGameLayout>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch, computed, onBeforeUnmount } from '@nuxtjs/composition-api'
import { mapGetters } from 'vuex'
import { Battle, Round, Move } from '~/services/battle/types'
import { useBattleState } from '~/composables/battle/useBattleState'
import type { BattleGameState, ErrorDetails } from './types/battle-game.types'
import { useErrorHandler } from './state/useErrorHandler'
import { useRoundManager } from './state/useRoundManager'
import { useBattleFeedbackManager } from './feedback/useBattleFeedbackManager'
import BattleGameLayout from './ui/BattleGameLayout.vue'
import GameBoard from './game/GameBoard.vue'
import GameControls from './game/GameControls.vue'
import GameHeader from './game/GameHeader.vue'
import RoundResult from './RoundResult.vue'
import VictoryScreen from './VictoryScreen.vue'
import HelpOverlay from './ui/HelpOverlay.vue'

export default defineComponent({
  name: 'BattleGame',

  components: {
    BattleGameLayout,
    GameBoard,
    GameControls,
    GameHeader,
    RoundResult,
    VictoryScreen,
    HelpOverlay
  },

  props: {
    battle: {
      type: Object as PropType<Battle>,
      required: true
    },
    rounds: {
      type: Array as PropType<Round[]>,
      required: true
    },
    playerCard: {
      type: Object as PropType<any>,
      required: false,
      default: () => null
    },
    opponentCard: {
      type: Object as PropType<any>,
      required: false,
      default: () => null
    }
  },

  setup(props, { emit }) {
    const isInitialLoad = ref(true)
    const showHelp = ref(false)
    const loadTimeout = ref<number | null>(null)
    const cleanupFns: Array<() => void> = []

    // Cleanup on unmount
    onBeforeUnmount(() => {
      cleanupFns.forEach(cleanup => cleanup())
      if (loadTimeout.value) {
        clearTimeout(loadTimeout.value)
      }
      error.clearError()
    })

    const battleState = ref<BattleGameState>({
      isUpdating: false,
      currentRound: props.rounds.length + 1,
      playerWins: 0,
      opponentWins: 0,
      isComplete: false,
      loading: false,
      currentMove: null,
      showRoundResult: false,
      cardTransferred: false,
      error: null
    })

    // Initialize managers
    const error = useErrorHandler()
    const roundManager = useRoundManager(props.rounds)
    const feedbackManager = useBattleFeedbackManager()

    const {
      state,
      makeMove,
      reset,
      showRoundResult,
      hideRoundResult,
      getRoundWinner
    } = useBattleState(props.battle, props.rounds)

    const currentRound = computed(() => {
      return props.rounds[props.rounds.length - 1] || null
    })

    const canMakeMove = computed(() => {
      return !battleState.value.loading && 
             !battleState.value.isUpdating && 
             !battleState.value.isComplete
    })

    // Sync state changes
    watch(
      () => state,
      (newState: BattleGameState) => {
        battleState.value = { ...newState }
      },
      { deep: true, immediate: true }
    )

    // Lifecycle
    const onGameContainerMounted = (container: HTMLElement) => {
      loadTimeout.value = window.setTimeout(() => {
        isInitialLoad.value = false
      }, 1000)
    }

    // Game actions
    const handleMove = (move: Move) => {
      if (isInitialLoad.value) return
      if (!canMakeMove.value) {
        error.handleError(new Error('Invalid move at this time'), {
          move,
          gameState: {
            isUpdating: battleState.value.isUpdating,
            loading: battleState.value.loading,
            isComplete: battleState.value.isComplete
          }
        })
        return
      }
      
      try {
        makeMove(move)
        feedbackManager.triggerFeedback('move')
        emit('move', move)
      } catch (err) {
        const context = {
          move,
          currentRound: battleState.value.currentRound,
          gameState: {
            isUpdating: battleState.value.isUpdating,
            loading: battleState.value.loading
          }
        }
        error.handleError(err instanceof Error ? err : new Error('Failed to make move'), context)
      }
    }

    const handleReset = () => {
      try {
        reset()
        feedbackManager.clearEffects()
        emit('reset')
      } catch (err) {
        const context = {
          currentRound: battleState.value.currentRound,
          playerWins: battleState.value.playerWins,
          opponentWins: battleState.value.opponentWins
        }
        error.handleError(err instanceof Error ? err : new Error('Failed to reset game'), context)
      }
    }

    // Error recovery handler
    const handleRetry = (event: CustomEvent<ErrorDetails>) => {
      const { detail } = event
      if (detail.context?.move) {
        handleMove(detail.context.move as Move)
      }
    }

    // Error handling
    const handleErrorRetry = () => {
      const lastError = error.error.value?.lastError
      if (lastError?.context?.move) {
        handleMove(lastError.context.move as Move)
      } else if (lastError?.category === 'network') {
        // Generic retry for network errors
        emit('retry')
      }
    }

    const toggleHelpOverlay = () => {
      showHelp.value = !showHelp.value
    }

    // Watch for game completion
    watch(
      () => battleState.value.isComplete,
      (newValue: boolean, oldValue: boolean) => {
        if (newValue === oldValue) return
        
        queueMicrotask(() => {
          const container = document.querySelector('.battle-game')
          if (container) {
            const rect = container.getBoundingClientRect()
            feedbackManager.triggerGameEndFeedback(
              battleState.value.playerWins > battleState.value.opponentWins,
              rect,
              props.battle.isComputerBattle
            )
          }
        })
      }
    )

    // Watch for round updates
    watch(
      () => currentRound.value,
      (newRound: Round | null, oldRound: Round | null) => {
        if (!newRound || 
            (oldRound && 
             newRound.player1Move === oldRound.player1Move && 
             newRound.player2Move === oldRound.player2Move)) {
          return
        }

        if (newRound.player1Move && newRound.player2Move) {
          showRoundResult()
          const winner = getRoundWinner(newRound.player1Move, newRound.player2Move)
          feedbackManager.triggerRoundFeedback(winner)
        }
      }
    )

    return {
      isInitialLoad,
      showHelp,
      battleState,
      error,
      currentRound,
      showRoundResult,
      hideRoundResult,
      getRoundWinner,
      handleMove,
      handleReset,
      toggleHelpOverlay,
      onGameContainerMounted,
      canMakeMove,
      ...feedbackManager,
      handleErrorRetry
    }
  },

  computed: {
    ...mapGetters({
      loading: 'battle/isLoading',
      isComplete: 'battle/isComplete'
    })
  }
})
</script>

<style scoped>
.battle-arena-container {
  margin: 20px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
