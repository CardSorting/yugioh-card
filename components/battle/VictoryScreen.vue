<template>
  <div class="victory-screen">
    <transition name="fade">
      <div class="victory-content" :class="{ 'victory': isWinner, 'defeat': !isWinner }">
        <div class="result-banner">
          <div class="result-icon">{{ isWinner ? '🏆' : '💔' }}</div>
          <h2 class="result-title">{{ isWinner ? 'Victory!' : 'Defeat!' }}</h2>
        </div>

        <div class="result-details">
          <div class="score-display">
            <div class="score-item">
              <span class="score-label">Your Wins</span>
              <span class="score-value">{{ playerWins }}</span>
            </div>
            <div class="score-divider">-</div>
            <div class="score-item">
              <span class="score-label">Opponent Wins</span>
              <span class="score-value">{{ opponentWins }}</span>
            </div>
          </div>

          <p class="result-message">
            {{ resultMessage }}
          </p>

          <div v-if="cardTransferred" class="card-transfer">
            <div class="transfer-animation">
              <span class="card-icon">🎴</span>
              <span class="arrow">{{ isWinner ? '←' : '→' }}</span>
            </div>
            <p class="transfer-text">
              {{ isWinner ? 'You claimed your opponent\'s card!' : 'Your card was transferred to the winner.' }}
            </p>
          </div>
        </div>

        <button @click="$emit('reset')" class="play-again-btn">
          <span class="btn-icon">🔄</span>
          Play Again
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'VictoryScreen',

  props: {
    isWinner: {
      type: Boolean,
      required: true
    },
    playerWins: {
      type: Number,
      required: true
    },
    opponentWins: {
      type: Number,
      required: true
    },
    isComputerBattle: {
      type: Boolean,
      required: true
    },
    cardTransferred: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    resultMessage() {
      if (this.isComputerBattle) {
        return this.isWinner 
          ? 'Congratulations! You won the practice battle!'
          : 'Better luck next time! The computer won this practice battle.'
      } else {
        return this.isWinner
          ? 'Congratulations on your victory!'
          : 'Don\'t give up! Try again in the next battle!'
      }
    }
  }
}
</script>

<style scoped>
.victory-screen {
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
  padding: 20px;
}

.victory-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
}

.result-banner {
  margin-bottom: 30px;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: bounce 1s infinite;
}

.result-title {
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(45deg, #2ecc71, #3498db);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.victory .result-title {
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.defeat .result-title {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.score-divider {
  font-size: 2rem;
  color: #bdc3c7;
}

.result-message {
  font-size: 1.2rem;
  color: #34495e;
  margin: 20px 0;
  line-height: 1.5;
}

.card-transfer {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.transfer-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.card-icon {
  animation: float 2s infinite;
}

.arrow {
  font-size: 2rem;
  animation: pulse 1s infinite;
}

.transfer-text {
  color: #2c3e50;
  margin: 0;
}

.play-again-btn {
  margin-top: 20px;
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.btn-icon {
  font-size: 1.4rem;
}

.play-again-btn:hover {
  transform: translateY(-2px);
}

.play-again-btn:active {
  transform: translateY(0);
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

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .victory-content {
    padding: 20px;
  }

  .result-icon {
    font-size: 3rem;
  }

  .result-title {
    font-size: 2rem;
  }

  .score-value {
    font-size: 1.5rem;
  }

  .result-message {
    font-size: 1rem;
  }
}
</style>
