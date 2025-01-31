<template>
  <div 
    class="particle-container"
    :aria-hidden="true"
  >
    <transition-group name="particle" tag="div">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          '--x': `${particle.x}px`,
          '--y': `${particle.y}px`,
          '--size': `${particle.size}px`,
          '--color': particle.color
        }"
      />
    </transition-group>
  </div>
</template>

<script>
import { useGameFeedback } from '~/composables/useGameFeedback'

export default {
  name: 'ParticleSystem',

  setup() {
    const { particles } = useGameFeedback()
    return { particles }
  }
}
</script>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 50%;
  transform: translate(var(--x), var(--y));
  will-change: transform;
}

.particle-enter-active {
  transition: opacity 0.2s ease-out;
}

.particle-leave-active {
  transition: opacity 0.5s ease-in;
}

.particle-enter-from,
.particle-leave-to {
  opacity: 0;
}
</style>
