import { ref } from 'vue'

export function useGameFeedback() {
  const particles = ref([])
  const isHapticEnabled = ref(true)

  const triggerHaptic = (type) => {
    if (!isHapticEnabled.value) return
    
    if (!window.navigator.vibrate) return

    switch (type) {
      case 'move':
        window.navigator.vibrate(50)
        break
      case 'win':
        window.navigator.vibrate([100, 50, 100])
        break
      case 'lose':
        window.navigator.vibrate([50, 100, 50])
        break
      case 'draw':
        window.navigator.vibrate([75, 75])
        break
      case 'victory':
        window.navigator.vibrate([150, 50, 150, 50, 150])
        break
      default:
        window.navigator.vibrate(50)
    }
  }

  const createParticles = (x, y, type = 'victory') => {
    const colors = type === 'victory' 
      ? ['#FFD700', '#FFA500', '#FF6B6B'] 
      : ['#4CAF50', '#2196F3', '#9C27B0']

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2
      const velocity = 2 + Math.random() * 2
      const lifetime = 1000 + Math.random() * 1000

      particles.value.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        lifetime,
        birth: Date.now()
      })
    }

    requestAnimationFrame(updateParticles)
  }

  const updateParticles = () => {
    const now = Date.now()
    particles.value = particles.value.filter(particle => {
      const age = now - particle.birth
      if (age >= particle.lifetime) return false

      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // gravity
      return true
    })

    if (particles.value.length > 0) {
      requestAnimationFrame(updateParticles)
    }
  }

  const toggleHaptic = () => {
    isHapticEnabled.value = !isHapticEnabled.value
    return isHapticEnabled.value
  }

  return {
    particles,
    isHapticEnabled,
    triggerHaptic,
    createParticles,
    toggleHaptic
  }
}
