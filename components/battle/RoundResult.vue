<template>
  <transition name="fade">
    <div v-if="show" class="round-result" :class="resultClass">
      <div class="result-content">
        <div class="moves-comparison">
          <div class="move-display player">
            <div class="move-icon">{{ getMoveIcon(playerMove) }}</div>
            <div class="move-label">Your Move</div>
          </div>
          
          <div class="versus">
            <div class="versus-line"></div>
            <div class="result-icon">{{ resultIcon }}</div>
            <div class="versus-line"></div>
          </div>
          
          <div class="move-display opponent">
            <div class="move-icon">{{ getMoveIcon(opponentMove) }}</div>
            <div class="move-label">{{ isComputerBattle ? 'Computer\'s Move' : 'Opponent\'s Move' }}</div>
          </div>
        </div>
        
        <div class="result-message">{{ resultMessage }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'RoundResult',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    playerMove: {
      type: String,
      required: true
    },
    opponentMove: {
      type: String,
      required: true
    },
    isComputerBattle: {
      type: Boolean,
      required: true
    },
    roundWinner: {
      type: Number,
      required: true // 0 = draw, 1 = player, 2 = opponent
    }
  },

  computed: {
    resultClass() {
      return {
        'result-win': this.roundWinner === 1,
        'result-lose': this.roundWinner === 2,
        'result-draw': this.roundWinner === 0
      }
    },

    resultIcon() {
      switch (this.roundWinner) {
        case 1:
          return '✨'
        case 2:
          return '💥'
        default:
          return '🤝'
      }
    },

    resultMessage() {
      switch (this.roundWinner) {
        case 1:
          return 'You won this round!'
        case 2:
          return this.isComputerBattle ? 'Computer wins this round!' : 'Opponent wins this round!'
        default:
          return 'It\'s a draw!'
      }
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
.round-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.result-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
  max-width: 600px;
  width: 90%;
}

.moves-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.move-display {
  text-align: center;
  animation: bounceIn 0.5s ease-out;
}

.move-icon {
  font-size: 4rem;
  margin-bottom: 10px;
  transform-origin: center;
}

.player .move-icon {
  animation: playerMove 0.5s ease-out;
}

.opponent .move-icon {
  animation: opponentMove 0.5s ease-out;
}

.move-label {
  font-size: 1rem;
  color: #666;
}

.versus {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 20px;
}

.versus-line {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
}

.result-icon {
  font-size: 2.5rem;
  animation: pulse 1s infinite;
}

.result-message {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  animation: fadeIn 0.5s ease-out;
}

.result-win .result-message {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.result-lose .result-message {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.result-draw .result-message {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes playerMove {
  0% {
    transform: translateX(-50px) rotate(-45deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0);
    opacity: 1;
  }
}

@keyframes opponentMove {
  0% {
    transform: translateX(50px) rotate(45deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .result-content {
    padding: 20px;
  }

  .move-icon {
    font-size: 3rem;
  }

  .result-icon {
    font-size: 2rem;
  }

  .result-message {
    font-size: 1.2rem;
  }

  .move-label {
    font-size: 0.9rem;
  }
}
</style>
