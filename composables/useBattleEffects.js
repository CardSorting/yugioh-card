import { ref, computed } from 'vue'
import gsap from 'gsap'

export function useBattleEffects() {
  const battleStage = ref('idle') // idle, charging, reveal, clash, impact, result
  const chargeLevel = ref(0)
  const elementEffects = ref({
    rock: {
      color: '#8B4513',
      particleColors: ['#8B4513', '#A0522D', '#6B4423'],
      glowColor: 'rgba(139, 69, 19, 0.6)'
    },
    paper: {
      color: '#4169E1',
      particleColors: ['#4169E1', '#1E90FF', '#0000CD'],
      glowColor: 'rgba(65, 105, 225, 0.6)'
    },
    scissors: {
      color: '#DC143C',
      particleColors: ['#DC143C', '#FF0000', '#B22222'],
      glowColor: 'rgba(220, 20, 60, 0.6)'
    }
  })

  const animateCardEntrance = (cardEl, isPlayer) => {
    const startX = isPlayer ? -100 : 100
    gsap.fromTo(cardEl, 
      {
        x: startX,
        y: 50,
        rotation: isPlayer ? -30 : 30,
        opacity: 0
      },
      {
        duration: 1,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        ease: 'back.out(1.7)'
      }
    )
  }

  const animateCharge = (cardEl, move) => {
    const effect = elementEffects.value[move]
    gsap.to(cardEl, {
      duration: 0.5,
      scale: 1.1,
      boxShadow: `0 0 30px ${effect.glowColor}`,
      repeat: -1,
      yoyo: true
    })

    return gsap.to(chargeLevel, {
      duration: 2,
      value: 100,
      ease: 'power2.inOut'
    })
  }

  const animateClash = (playerCardEl, opponentCardEl, playerMove, opponentMove) => {
    const timeline = gsap.timeline()
    
    // Move cards to clash position
    timeline.to([playerCardEl, opponentCardEl], {
      duration: 0.5,
      x: (i) => i === 0 ? 100 : -100,
      ease: 'power2.in'
    })

    // Add shake effect
    timeline.to([playerCardEl, opponentCardEl], {
      duration: 0.1,
      x: '+=10',
      yoyo: true,
      repeat: 5,
      ease: 'none'
    })

    // Determine winner and animate accordingly
    const playerWins = determineWinner(playerMove, opponentMove)
    const loserEl = playerWins ? opponentCardEl : playerCardEl
    
    timeline.to(loserEl, {
      duration: 0.3,
      rotation: playerWins ? 30 : -30,
      scale: 0.9,
      opacity: 0.7,
      ease: 'power2.in'
    })

    return timeline
  }

  const animateImpact = (x, y, type = 'normal') => {
    const particles = []
    const count = type === 'critical' ? 30 : 20
    const power = type === 'critical' ? 2 : 1

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const velocity = (3 + Math.random() * 2) * power
      const lifetime = 1000 + Math.random() * 500

      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: (5 + Math.random() * 5) * power,
        lifetime,
        birth: Date.now()
      })
    }

    return particles
  }

  const animateEnvironment = (intensity = 1) => {
    const timeline = gsap.timeline()
    
    // Arena shake
    timeline.to('.game-content', {
      duration: 0.2,
      x: `+=${5 * intensity}`,
      yoyo: true,
      repeat: 3,
      ease: 'none'
    })

    // Background flash
    timeline.to('.game-background', {
      duration: 0.1,
      opacity: 0.3,
      yoyo: true,
      repeat: 1
    }, 0)

    return timeline
  }

  const determineWinner = (move1, move2) => {
    if (move1 === move2) return null
    if (
      (move1 === 'rock' && move2 === 'scissors') ||
      (move1 === 'paper' && move2 === 'rock') ||
      (move1 === 'scissors' && move2 === 'paper')
    ) {
      return true
    }
    return false
  }

  const resetEffects = (elements) => {
    gsap.killTweensOf(elements)
    gsap.set(elements, {
      clearProps: 'all'
    })
    chargeLevel.value = 0
    battleStage.value = 'idle'
  }

  return {
    battleStage,
    chargeLevel,
    elementEffects,
    animateCardEntrance,
    animateCharge,
    animateClash,
    animateImpact,
    animateEnvironment,
    resetEffects
  }
}
