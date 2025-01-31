<template>
  <transition name="fade">
    <div 
      v-if="show"
      class="help-overlay"
      role="dialog"
      aria-label="Game help"
    >
      <div class="help-content">
        <h3>How to Play</h3>
        <ul>
          <li>Click on a move to make your selection</li>
          <li>Rock beats Scissors</li>
          <li>Scissors beats Paper</li>
          <li>Paper beats Rock</li>
        </ul>
        <button 
          @click="$emit('close')"
          class="close-help-btn"
          aria-label="Close help"
        >
          Got it!
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'HelpOverlay',
  
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },

  emits: ['close']
})
</script>

<style scoped>
.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.help-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: left;
}

.help-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.help-content ul {
  margin: 0;
  padding-left: 20px;
  color: #34495e;
}

.help-content li {
  margin: 10px 0;
}

.close-help-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.close-help-btn:hover {
  background: #2980b9;
}

.close-help-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
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
