<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'GameHeader',

  props: {
    currentRound: {
      type: Number as PropType<number>,
      required: true
    },
    soundEnabled: {
      type: Boolean as PropType<boolean>,
      required: true
    },
    showHelp: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },

  emits: ['toggle-sound', 'toggle-help'],

  setup(props, { emit }) {
    const toggleSound = () => {
      emit('toggle-sound')
    }

    const toggleHelp = () => {
      emit('toggle-help')
    }

    return {
      toggleSound,
      toggleHelp
    }
  }
})
</script>

<template>
  <header class="game-header">
    <div class="round-info">
      <h2 class="round-title">Round {{ currentRound }}</h2>
    </div>

    <div class="controls">
      <button 
        @click="toggleSound" 
        class="control-btn"
        :aria-label="soundEnabled ? 'Mute game sounds' : 'Unmute game sounds'"
        :aria-pressed="!soundEnabled"
      >
        <span aria-hidden="true">{{ soundEnabled ? '🔊' : '🔇' }}</span>
      </button>

      <button 
        @click="toggleHelp" 
        class="control-btn"
        aria-label="Show game help"
        :aria-expanded="showHelp"
      >
        <span aria-hidden="true">❔</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.round-info {
  flex: 1;
}

.round-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: transform 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  outline: none;
}

.control-btn:focus-visible {
  box-shadow: 0 0 0 3px #3498db, 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .game-header {
    padding: 10px 15px;
  }

  .round-title {
    font-size: 1.2rem;
  }

  .control-btn {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
}
</style>
