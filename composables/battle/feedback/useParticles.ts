import { ref } from '@nuxtjs/composition-api'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  lifetime: number
  birth: number
}

interface ParticleConfig {
  victory: {
    colors: string[]
    count: number
    velocity: number
    size: number
  }
  defeat: {
    colors: string[]
    count: number
    velocity: number
    size: number
  }
}

const config: ParticleConfig = {
  victory: {
    colors: ['#FFD700', '#FFA500', '#FF6B6B'],
    count: 30,
    velocity: 2,
    size: 5
  },
  defeat: {
    colors: ['#4CAF50', '#2196F3', '#9C27B0'],
    count: 20,
    velocity: 1.5,
    size: 4
  }
}

export function useParticles() {
  const particles = ref<Particle[]>([])

  const createParticles = (x: number, y: number, type: keyof ParticleConfig = 'victory') => {
    const settings = config[type]
    
    for (let i = 0; i < settings.count; i++) {
      const angle = (i / settings.count) * Math.PI * 2
      const velocity = settings.velocity + Math.random() * 2
      const lifetime = 1000 + Math.random() * 1000

      particles.value.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: settings.size + Math.random() * 5,
        color: settings.colors[Math.floor(Math.random() * settings.colors.length)],
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

  const clearParticles = () => {
    particles.value = []
  }

  return {
    particles,
    createParticles,
    clearParticles
  }
}
