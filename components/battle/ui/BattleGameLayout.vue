<template>
  <div 
    class="battle-game"
    tabindex="-1"
    ref="gameContainer"
  >
    <div class="game-background"></div>
    
    <div class="game-content" :class="{ 'has-error': error }">
      <ErrorOverlay 
        :error="error" 
        @retry="handleRetry"
      />
      
      <transition name="fade" mode="out-in">
        <BattleSkeleton v-if="isInitialLoad" />
        <div v-else class="game-main">
          <slot name="header"></slot>
          <slot name="arena"></slot>
          <slot name="controls"></slot>
        </div>
      </transition>

      <slot name="overlays"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from '@nuxtjs/composition-api'
import type { ErrorDetails } from '../types/battle-game.types'
import ErrorOverlay from './ErrorOverlay.vue'
import BattleSkeleton from '../BattleSkeleton.vue'

export default defineComponent({
  name: 'BattleGameLayout',

  components: {
    ErrorOverlay,
    BattleSkeleton
  },

  props: {
    error: {
      type: [String, Object] as PropType<string | ErrorDetails>,
      required: false,
      default: null
    },
    isInitialLoad: {
      type: Boolean,
      required: true
    }
  },

  setup(_, { emit }) {
    const gameContainer = ref<HTMLElement | null>(null)

    onMounted(() => {
      if (gameContainer.value) {
        gameContainer.value.focus()
        emit('mounted', gameContainer.value)
      }
    })

    const handleRetry = () => {
      emit('retry')
    }

    return {
      gameContainer,
      handleRetry
    }
  },

  emits: ['mounted', 'retry']
})
</script>

<style scoped>
.battle-game {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  min-height: 600px;
}

.game-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  opacity: 0.1;
  border-radius: 12px;
  z-index: 0;
}

.game-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s ease;
}

.game-content.has-error {
  border-color: #e74c3c;
}

.game-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .battle-game {
    min-height: auto;
  }

  .game-content {
    padding: 15px;
  }
}
</style>
