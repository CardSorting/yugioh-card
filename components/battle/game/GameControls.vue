<script lang="ts">
import { defineComponent, ref, PropType } from '@nuxtjs/composition-api'
import { Move } from '~/services/battle/types'

export default defineComponent({
  name: 'GameControls',

  props: {
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    loading: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    selectedMove: {
      type: String as PropType<Move | null>,
      default: null
    }
  },

  setup(props, { emit }) {
    const selectedMoveIndex = ref(0)
    const moves: Move[] = ['rock', 'paper', 'scissors']

    const selectPreviousMove = () => {
      if (props.disabled) return
      selectedMoveIndex.value = (selectedMoveIndex.value - 1 + 3) % 3
    }

    const selectNextMove = () => {
      if (props.disabled) return
      selectedMoveIndex.value = (selectedMoveIndex.value + 1) % 3
    }

    const makeMove = (move: Move) => {
      if (props.disabled) return
      emit('move', move)
    }

    return {
      moves,
      selectedMoveIndex,
      selectPreviousMove,
      selectNextMove,
      makeMove
    }
  }
})
</script>

<template>
  <div class="game-controls">
    <div class="moves-container">
      <button
        v-for="(move, index) in moves"
        :key="move"
        class="move-button"
        :class="{
          'selected': index === selectedMoveIndex,
          'disabled': disabled,
          'loading': loading && selectedMove === move
        }"
        :disabled="disabled"
        :data-move="move"
        @click="makeMove(move)"
      >
        <span class="move-icon">
          {{ move === 'rock' ? '🪨' : move === 'paper' ? '📄' : '✂️' }}
        </span>
        <span class="move-name">{{ move }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-controls {
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.moves-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.move-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 25px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.move-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.move-button:active:not(.disabled) {
  transform: translateY(0);
}

.move-button.selected {
  border-color: #3498db;
  background: #f8f9fa;
}

.move-button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.move-button.loading {
  animation: pulse 1.5s infinite;
}

.move-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.move-name {
  font-size: 14px;
  text-transform: capitalize;
  color: #2c3e50;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .moves-container {
    gap: 10px;
  }

  .move-button {
    padding: 10px 15px;
    min-width: 80px;
  }

  .move-icon {
    font-size: 20px;
  }

  .move-name {
    font-size: 12px;
  }
}
</style>
