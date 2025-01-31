<template>
  <div class="card-arena">
    <div class="player-side">
      <div 
        class="card-container"
        :class="{ 'card-highlight': isPlayerTurn }"
      >
        <CardPreview 
          :card="playerCard" 
          size="medium" 
          class="card-preview"
          :class="{ 'card-animate': showMoveAnimation }"
        />
        <div class="player-move" v-if="playerMove">
          <div class="move-icon">{{ getMoveIcon(playerMove) }}</div>
        </div>
      </div>
      <p class="player-label">Your Card</p>
    </div>

    <div class="battle-indicator">
      <div class="versus-circle">VS</div>
    </div>

    <div class="player-side">
      <div 
        class="card-container"
        :class="{ 'card-highlight': !isPlayerTurn }"
      >
        <CardPreview 
          :card="opponentCard" 
          size="medium"
          class="card-preview"
          :class="{ 'card-animate': showMoveAnimation }"
        />
        <div class="player-move" v-if="opponentMove">
          <div class="move-icon">{{ getMoveIcon(opponentMove) }}</div>
        </div>
      </div>
      <p class="player-label">Opponent's Card</p>
    </div>
  </div>
</template>

<script>
import CardPreview from '~/components/card/CardPreview.vue'

export default {
  name: 'CardArena',

  components: {
    CardPreview
  },

  props: {
    playerCard: {
      type: Object,
      required: false,
      default: () => null
    },
    opponentCard: {
      type: Object,
      required: false,
      default: () => null
    },
    playerMove: {
      type: String,
      required: false,
      default: null
    },
    opponentMove: {
      type: String,
      required: false,
      default: null
    },
    isPlayerTurn: {
      type: Boolean,
      required: true
    },
    showMoveAnimation: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  methods: {
    getMoveIcon(move) {
      switch (move) {
        case 'rock':
          return '🪨'
        case 'paper':
          return '📄'
        case 'scissors':
          return '✂️'
        default:
          return '❓'
      }
    }
  }
}
</script>

<style scoped>
.card-arena {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 30px 0;
  min-height: 300px;
  perspective: 1000px;
}

.player-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
}

.card-container {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-style: preserve-3d;
  padding: 10px;
  border-radius: 10px;
}

.card-highlight {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-preview {
  transition: transform 0.5s ease;
}

.card-animate {
  animation: cardFlip 0.5s ease;
}

.player-move {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: moveReveal 0.3s ease;
}

.move-icon {
  font-size: 1.5rem;
}

.battle-indicator {
  padding: 0 20px;
}

.versus-circle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.player-label {
  margin-top: 40px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

@keyframes cardFlip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

@keyframes moveReveal {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@media (max-width: 768px) {
  .card-arena {
    flex-direction: column;
    gap: 30px;
  }

  .battle-indicator {
    transform: rotate(90deg);
  }

  .player-side {
    width: 100%;
    max-width: none;
  }
}
</style>
