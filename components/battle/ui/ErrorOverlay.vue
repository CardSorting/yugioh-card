<template>
  <transition name="fade">
    <div 
      v-if="errorDetails" 
      class="error-container" 
      role="alert"
      :class="errorDetails.category"
    >
      <div class="error-content">
        <div class="error-icon" :class="errorDetails.category">
          <i :class="getErrorIcon(errorDetails.category)"></i>
        </div>
        <div class="error-text">
          <div class="error-message">{{ errorDetails.message }}</div>
          <div v-if="showRetry" class="error-retry">
            <button @click="handleRetry" class="retry-button">
              <i class="fas fa-redo"></i> Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@nuxtjs/composition-api'
import type { ErrorDetails, ErrorCategory } from '../types/battle-game.types'

export default defineComponent({
  name: 'ErrorOverlay',
  
  props: {
    error: {
      type: [String, Object] as PropType<string | ErrorDetails>,
      required: false,
      default: null
    }
  },

  setup(props, { emit }) {
    const errorDetails = computed(() => {
      if (!props.error) return null
      if (typeof props.error === 'string') {
        return {
          message: props.error,
          category: 'unknown' as ErrorCategory,
          timestamp: Date.now()
        }
      }
      return props.error
    })

    const showRetry = computed(() => {
      return errorDetails.value?.category === 'network'
    })

    const getErrorIcon = (category: ErrorCategory) => {
      const icons = {
        network: 'fas fa-wifi',
        state: 'fas fa-exclamation-triangle',
        validation: 'fas fa-times-circle',
        timeout: 'fas fa-clock',
        unknown: 'fas fa-exclamation-circle'
      }
      return icons[category] || icons.unknown
    }

    const handleRetry = () => {
      emit('retry')
    }

    return {
      errorDetails,
      showRetry,
      getErrorIcon,
      handleRetry
    }
  }
})
</script>

<style scoped>
.error-container {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: #e74c3c;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 200px;
  max-width: 400px;
  animation: slide-down 0.3s ease;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.error-text {
  flex: 1;
}

.error-message {
  margin-bottom: 4px;
  line-height: 1.4;
}

.error-retry {
  margin-top: 8px;
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.retry-button i {
  font-size: 10px;
}

/* Error category styles */
.error-container.network { background: #3498db; }
.error-container.state { background: #e67e22; }
.error-container.validation { background: #e74c3c; }
.error-container.timeout { background: #f1c40f; }
.error-container.unknown { background: #95a5a6; }

@keyframes slide-down {
  from {
    transform: translate(-50%, -20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
