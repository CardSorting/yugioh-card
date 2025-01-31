<template>
  <client-only>
    <div class="battle-queue">
      <div v-if="error" class="error-message" :class="getErrorCategory(error)">
        {{ error }}
        <button @click="handleError" class="error-action-btn">
          {{ getErrorActionText(error) }}
        </button>
      </div>

      <div v-if="!error && !currentBattle" class="queue-section">
        <button
          v-if="!inQueue"
          @click="joinQueue"
          :disabled="loading"
          class="join-queue-btn"
        >
          {{ loading ? 'Joining...' : 'Join Battle Queue' }}
        </button>
        <div v-else class="queue-status">
          <p>Searching for opponent...</p>
          <button @click="leaveQueue" :disabled="loading" class="leave-queue-btn">
            Leave Queue
          </button>
        </div>
      </div>

      <div v-else>
        <div v-if="cardsLoading || !isReady" class="loading-message">
          {{ loadingMessage }}
        </div>
        <BattleGame
          v-else-if="currentBattle && rounds"
          :battle="currentBattle"
          :rounds="rounds"
          :playerCard="playerCard"
          :opponentCard="opponentCard"
          @move="makeMove"
          @reset="resetBattle"
          @retry="handleRetry"
        />
        <div v-else class="error-message">
          Failed to initialize battle. Please try again.
        </div>
      </div>
    </div>
  </client-only>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'BattleQueue',

  beforeMount() {
    // Clear any existing error state on mount
    this.$store.commit('battle/SET_ERROR', null)
  },

  data() {
    return {
      playerCard: null,
      opponentCard: null,
      cardsLoading: false,
      retryAttempts: 0
    }
  },

  computed: {
    ...mapState({
      loading: state => state.battle.loading,
      error: state => state.battle.error
    }),
    ...mapGetters({
      inQueue: 'battle/isInQueue',
      currentBattle: 'battle/currentBattle',
      rounds: 'battle/rounds'
    }),
    isReady() {
      return !!(
        this.currentBattle &&
        this.rounds &&
        ((this.currentBattle.isComputerBattle && this.playerCard) ||
          (this.playerCard && this.opponentCard))
      )
    },
    loadingMessage() {
      if (this.cardsLoading) return 'Loading battle cards...'
      if (!this.currentBattle) return 'Initializing battle...'
      if (!this.rounds) return 'Loading battle data...'
      return 'Preparing battle...'
    }
  },

  methods: {
    ...mapActions({
      joinQueue: 'battle/joinQueue',
      leaveQueue: 'battle/leaveQueue',
      makeMove: 'battle/makeMove',
      resetBattle: 'battle/resetBattle',
      fetchActiveBattle: 'battle/fetchActiveBattle'
    }),

    getErrorActionText(error) {
      if (error?.includes('in-progress battle')) return 'Resume Battle'
      if (error?.includes('Failed to load')) return 'Retry Loading'
      if (error?.includes('network')) return 'Retry Connection'
      return 'Try Again'
    },

    getErrorCategory(error) {
      if (error?.includes('network')) return 'network'
      if (error?.includes('Failed to load')) return 'state'
      if (error?.includes('in-progress battle')) return 'validation'
      return 'unknown'
    },

    async handleError() {
      const errorType = this.error?.toLowerCase() || ''
      
      if (errorType.includes('in-progress battle')) {
        await this.fetchActiveBattle()
      } else if (errorType.includes('failed to load')) {
        await this.loadBattleCards()
      } else if (errorType.includes('network') && this.retryAttempts < 3) {
        this.retryAttempts++
        setTimeout(() => {
          this.loadBattleCards()
        }, this.retryAttempts * 1000)
      } else {
        this.retryAttempts = 0
        this.$store.commit('battle/SET_ERROR', null)
      }
    },

    async handleRetry() {
      // Reset error state
      this.$store.commit('battle/SET_ERROR', null)
      
      // Reload battle state
      await this.fetchActiveBattle()
      
      // Reload cards if needed
      if (this.currentBattle && !this.playerCard) {
        await this.loadBattleCards()
      }
    },

    async loadBattleCards() {
      if (!this.currentBattle) {
        this.$store.commit('battle/SET_ERROR', 'No active battle found')
        return
      }

      if (!this.currentBattle.player1CardId) {
        this.$store.commit('battle/SET_ERROR', 'Player card not assigned')
        return
      }

      this.cardsLoading = true
      try {
        // Always fetch player's card
        const playerResponse = await this.$supabase
          .from('saved_cards')
          .select('*')
          .eq('id', this.currentBattle.player1CardId)
          .single()

        if (playerResponse.error) throw new Error('Failed to load player card')
        if (!playerResponse.data) throw new Error('Player card not found')

        this.playerCard = {
          id: playerResponse.data.id,
          ...playerResponse.data.card_data,
          image_url: playerResponse.data.image_url
        }

        // For computer battles, use a default card
        if (this.currentBattle.isComputerBattle) {
          this.opponentCard = {
            id: 'computer-card',
            name: 'Computer Card',
            type: 'monster',
            level: 4,
            attribute: 'dark',
            race: 'machine',
            atk: 1200,
            def: 1200,
            description: 'A mysterious mechanical opponent.',
            image_url: '/images/default.PNG'
          }
        } else if (this.currentBattle.player2CardId) {
          // For human battles, fetch opponent's card
          const opponentResponse = await this.$supabase
            .from('saved_cards')
            .select('*')
            .eq('id', this.currentBattle.player2CardId)
            .single()

          if (opponentResponse.error) throw new Error('Failed to load opponent card')
          if (!opponentResponse.data) throw new Error('Opponent card not found')

          this.opponentCard = {
            id: opponentResponse.data.id,
            ...opponentResponse.data.card_data,
            image_url: opponentResponse.data.image_url
          }
        }
      } catch (error) {
        console.error('Failed to load cards:', error)
        this.$store.commit('battle/SET_ERROR', 'Failed to load battle cards')
        this.playerCard = null
        this.opponentCard = null
      } finally {
        this.cardsLoading = false
      }
    }
  },

  watch: {
    currentBattle: {
      immediate: true,
      handler(battle) {
        if (battle) {
          this.loadBattleCards()
        } else {
          this.playerCard = null
          this.opponentCard = null
        }
      }
    }
  }
}
</script>

<style scoped>
.battle-queue {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

/* Error category styles */
.error-message.network {
  background-color: #cce5ff;
  color: #004085;
}

.error-message.state {
  background-color: #fff3cd;
  color: #856404;
}

.error-message.validation {
  background-color: #f8d7da;
  color: #721c24;
}

.error-message.unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.error-action-btn {
  margin-top: 10px;
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: var(--error-btn-color, #dc3545);
}

.error-message.network .error-action-btn { --error-btn-color: #0056b3; }
.error-message.state .error-action-btn { --error-btn-color: #d39e00; }
.error-message.validation .error-action-btn { --error-btn-color: #c82333; }
.error-message.unknown .error-action-btn { --error-btn-color: #5a6268; }

.error-action-btn:hover {
  filter: brightness(90%);
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.queue-section {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.join-queue-btn,
.leave-queue-btn {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.join-queue-btn {
  background-color: #28a745;
  color: white;
}

.join-queue-btn:hover {
  background-color: #218838;
}

.join-queue-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.leave-queue-btn {
  background-color: #dc3545;
  color: white;
  margin-top: 10px;
}

.leave-queue-btn:hover {
  background-color: #c82333;
}

.leave-queue-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.queue-status {
  margin-top: 20px;
}
</style>
