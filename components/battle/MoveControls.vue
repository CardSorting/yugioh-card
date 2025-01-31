<template>
  <div 
    class="move-controls"
    role="group"
    aria-label="Game move controls"
    :class="{ 'controls-disabled': disabled }"
  >
    <div class="moves-container">
      <button 
        v-for="(move, index) in moves" 
        :key="move"
        @click="makeMove(move)"
        @keydown.space.prevent="makeMove(move)"
        @keydown.enter.prevent="makeMove(move)"
        @mouseenter="handleHover(move)"
        :disabled="disabled"
        class="move-btn"
        :class="[
          `move-${move}`,
          { 
            'selected': selectedMove === move,
            'animate-in': !disabled
          }
        ]"
        :style="{ '--delay': `${index * 0.1}s` }"
        :aria-label="`Select ${formatMove(move)}`"
        :aria-pressed="selectedMove === move"
        :aria-disabled="disabled"
        :data-move="move"
      >
        <div class="move-content">
          <div class="move-icon-wrapper">
            <span class="move-icon" aria-hidden="true">{{ getMoveIcon(move) }}</span>
            <div class="icon-glow"></div>
          </div>
          <span class="move-text">{{ formatMove(move) }}</span>
        </div>
        <div class="move-hover-effect"></div>
        <div class="move-particles"></div>
        <span class="sr-only">{{ getMoveDescription(move) }}</span>
      </button>
    </div>

    <transition name="fade">
      <div 
        v-if="loading" 
        class="loading-overlay"
        role="status"
        aria-live="polite"
      >
        <div class="loading-spinner" aria-hidden="true">
          <div class="spinner-ring"></div>
          <div class="spinner-core"></div>
        </div>
        <span>Making move...</span>
      </div>
    </transition>

    <div class="controls-hint" v-if="showHint">
      <p class="hint-text" role="status" aria-live="polite">
        {{ currentHint }}
        <span class="hint-icon">{{ getHintIcon() }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useGameFeedback } from '~/composables/useGameFeedback'
import { battleSoundManager } from '~/utils/battleSounds'
import gsap from 'gsap'

export default {
  name: 'MoveControls',

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedMove: {
      type: String,
      default: null
    }
  },

  setup() {
    const { triggerHaptic } = useGameFeedback()
    const showHint = ref(false)
    const currentHint = ref('')
    let hintTimeout = null
    let hoverTimeline = null

    const hints = [
      { text: 'Rock crushes Scissors', icon: '💥' },
      { text: 'Paper covers Rock', icon: '📜' },
      { text: 'Scissors cuts Paper', icon: '✂️' },
      { text: 'Choose your move wisely!', icon: '🤔' }
    ]

    const showRandomHint = () => {
      const hint = hints[Math.floor(Math.random() * hints.length)]
      currentHint.value = hint.text
      showHint.value = true
      if (hintTimeout) clearTimeout(hintTimeout)
      hintTimeout = setTimeout(() => {
        showHint.value = false
      }, 3000)
    }

    const handleHover = (move) => {
      if (hoverTimeline) hoverTimeline.kill()
      
      const button = document.querySelector(`[data-move="${move}"]`)
      const particles = button.querySelector('.move-particles')
      
      hoverTimeline = gsap.timeline()
      
      // Create particles
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particles.appendChild(particle)
        
        gsap.set(particle, {
          x: 0,
          y: 0,
          scale: Math.random() * 0.5 + 0.5,
          opacity: 1
        })
        
        hoverTimeline.to(particle, {
          duration: Math.random() * 0.8 + 0.4,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          opacity: 0,
          scale: 0,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        }, 0)
      }
    }

    onMounted(() => {
      showRandomHint()
      battleSoundManager.init()
    })

    onBeforeUnmount(() => {
      if (hintTimeout) clearTimeout(hintTimeout)
      if (hoverTimeline) hoverTimeline.kill()
    })

    return {
      triggerHaptic,
      showHint,
      currentHint,
      handleHover
    }
  },

  data() {
    return {
      moves: ['rock', 'paper', 'scissors']
    }
  },

  methods: {
    makeMove(move) {
      if (!this.disabled && !this.loading) {
        this.triggerHaptic('move')
        battleSoundManager.playCharge()
        this.$emit('move', move)
      }
    },

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
    },

    formatMove(move) {
      return move.charAt(0).toUpperCase() + move.slice(1)
    },

    getMoveDescription(move) {
      switch (move) {
        case 'rock':
          return 'Rock crushes scissors'
        case 'paper':
          return 'Paper covers rock'
        case 'scissors':
          return 'Scissors cuts paper'
        default:
          return ''
      }
    },

    getHintIcon() {
      return hints[Math.floor(Math.random() * hints.length)].icon
    }
  }
}
</script>

<style scoped>
.move-controls {
  position: relative;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
}

.controls-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.moves-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.move-btn {
  position: relative;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  outline: none;
  opacity: 0;
  transform: translateY(20px);
}

.move-btn.animate-in {
  animation: moveIn 0.5s ease forwards;
  animation-delay: var(--delay);
}

.move-btn:focus-visible {
  box-shadow: 0 0 0 3px #3498db, 5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff;
}

.move-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.move-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-icon {
  font-size: 2rem;
  display: block;
  transition: transform 0.3s ease;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.4) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  border-radius: 50%;
  z-index: -1;
}

.move-btn:hover .icon-glow {
  width: 60px;
  height: 60px;
}

.move-btn:hover .move-icon {
  transform: scale(1.2);
}

.move-text {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.move-hover-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0) 70%);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
  border-radius: 50%;
}

.move-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #3498db;
  border-radius: 50%;
}

.move-btn:hover:not(:disabled),
.move-btn:focus:not(:disabled) {
  transform: translateY(-2px);
}

.move-btn:hover:not(:disabled) .move-hover-effect,
.move-btn:focus:not(:disabled) .move-hover-effect {
  width: 200px;
  height: 200px;
}

.move-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 3px 3px 6px #d9d9d9, -3px -3px 6px #ffffff;
}

.move-btn.selected {
  background: linear-gradient(145deg, #3498db, #2980b9);
  animation: pulse 2s infinite;
}

.move-btn.selected .move-text {
  color: white;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  background: #3498db;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 1.5s ease-in-out infinite;
}

.controls-hint {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  text-align: center;
  animation: fadeInUp 0.3s ease-out;
}

.hint-text {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hint-icon {
  font-size: 1.2rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes moveIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
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

/* Element-specific styles */
.move-rock .icon-glow { background: radial-gradient(circle, rgba(231, 76, 60, 0.4) 0%, transparent 70%); }
.move-paper .icon-glow { background: radial-gradient(circle, rgba(46, 204, 113, 0.4) 0%, transparent 70%); }
.move-scissors .icon-glow { background: radial-gradient(circle, rgba(155, 89, 182, 0.4) 0%, transparent 70%); }

@media (max-width: 600px) {
  .moves-container {
    flex-direction: column;
    gap: 15px;
  }

  .move-btn {
    width: 100%;
    padding: 12px 20px;
    touch-action: manipulation;
  }

  .move-icon {
    font-size: 1.5rem;
  }

  .move-text {
    font-size: 0.9rem;
  }

  .controls-hint {
    bottom: -50px;
  }
}

@media (hover: none) {
  .move-btn:hover:not(:disabled) {
    transform: none;
  }

  .move-hover-effect {
    display: none;
  }
}
</style>
