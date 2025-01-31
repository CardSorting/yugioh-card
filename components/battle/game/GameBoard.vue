<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Move } from '~/services/battle/types'

export default defineComponent({
  name: 'GameBoard',

  props: {
    playerCard: {
      type: Object as PropType<any>, // Using any since Card type isn't available
      required: false,
      default: null
    },
    opponentCard: {
      type: Object as PropType<any>,
      required: false,
      default: null
    },
    playerMove: {
      type: String as PropType<Move | null>,
      default: null
    },
    opponentMove: {
      type: String as PropType<Move | null>,
      default: null
    },
    isPlayerTurn: {
      type: Boolean as PropType<boolean>,
      required: true
    }
  },

  setup() {
    const getMoveIcon = (move: Move | null) => {
      if (!move) return '❓'
      switch (move) {
        case 'rock': return '🪨'
        case 'paper': return '📄'
        case 'scissors': return '✂️'
        default: return '❓'
      }
    }

    return {
      getMoveIcon
    }
  }
})
</script>

<template>
  <div class="game-board">
    <div class="player-area opponent" :class="{ active: !isPlayerTurn }">
      <div class="card-container">
        <div class="card opponent-card" :class="{ 'show-move': opponentMove }">
          <img 
            :src="opponentCard?.image_url || '/images/default.jpg'" 
            :alt="opponentCard?.name || 'Opponent Card'"
            class="card-image"
          >
          <div class="move-indicator" v-if="opponentMove">
            {{ getMoveIcon(opponentMove) }}
          </div>
        </div>
      </div>
    </div>

    <div class="battle-arena">
      <div class="arena-background"></div>
      <div class="versus-text">VS</div>
    </div>

    <div class="player-area player" :class="{ active: isPlayerTurn }">
      <div class="card-container">
        <div class="card player-card" :class="{ 'show-move': playerMove }">
          <img 
            :src="playerCard?.image_url || '/images/default.jpg'" 
            :alt="playerCard?.name || 'Player Card'"
            class="card-image"
          >
          <div class="move-indicator" v-if="playerMove">
            {{ getMoveIcon(playerMove) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  gap: 20px;
  min-height: 400px;
  position: relative;
}

.player-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  transition: transform 0.3s ease;
}

.player-area.active {
  transform: scale(1.05);
}

.card-container {
  perspective: 1000px;
  width: 200px;
  height: 300px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: white;
}

.card.show-move {
  transform: rotateY(180deg);
}

.card-image,
.move-indicator {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image {
  object-fit: cover;
}

.move-indicator {
  transform: rotateY(180deg);
  background: white;
  font-size: 48px;
}

.opponent-card {
  transform: rotateX(180deg);
}

.opponent-card.show-move {
  transform: rotateX(180deg) rotateY(180deg);
}

.battle-arena {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arena-background {
  position: absolute;
  top: 0;
  left: -20px;
  right: -20px;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 42, 108, 0.1), rgba(178, 31, 31, 0.1), rgba(253, 187, 45, 0.1));
  border-radius: 20px;
}

.versus-text {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

@media (max-width: 768px) {
  .game-board {
    min-height: 300px;
    gap: 10px;
  }

  .card-container {
    width: 150px;
    height: 225px;
  }

  .move-indicator {
    font-size: 36px;
  }

  .versus-text {
    font-size: 24px;
  }
}
</style>
