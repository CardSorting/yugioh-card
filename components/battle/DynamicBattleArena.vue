<template>
  <div class="dynamic-battle-arena" ref="arenaRef">
    <div class="arena-background">
      <div class="energy-field" :class="{ active: battleStage !== 'idle' }"></div>
      <div class="arena-lines"></div>
    </div>

    <div class="battle-area">
      <div class="player-field">
        <div 
          class="card-container"
          ref="playerCardRef"
          :class="[
            `element-${playerMove}`,
            { 'charging': battleStage === 'charging' }
          ]"
        >
          <div class="card-aura" :style="getAuraStyle(playerMove)"></div>
          <CardPreview 
            :card="playerCard" 
            size="medium"
            class="battle-card"
          />
          <div class="energy-charge" :style="{ width: `${chargeLevel}%` }"></div>
        </div>
      </div>

      <div class="battle-center">
        <div class="versus-circle" :class="{ active: battleStage === 'clash' }">
          <span>VS</span>
        </div>
        <div class="clash-effects" v-if="battleStage === 'clash'">
          <div class="clash-lightning"></div>
          <div class="clash-shockwave"></div>
        </div>
      </div>

      <div class="opponent-field">
        <div 
          class="card-container"
          ref="opponentCardRef"
          :class="[
            `element-${opponentMove}`,
            { 'charging': battleStage === 'charging' }
          ]"
        >
          <div class="card-aura" :style="getAuraStyle(opponentMove)"></div>
          <CardPreview 
            :card="opponentCard" 
            size="medium"
            class="battle-card"
          />
          <div class="energy-charge"></div>
        </div>
      </div>
    </div>

    <div class="move-indicators" v-if="battleStage === 'reveal'">
      <div class="move-indicator player" :class="playerMove">
        {{ getMoveIcon(playerMove) }}
      </div>
      <div class="move-indicator opponent" :class="opponentMove">
        {{ getMoveIcon(opponentMove) }}
      </div>
    </div>

    <ParticleSystem ref="particleSystem" />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import CardPreview from '~/components/card/CardPreview.vue'
import ParticleSystem from './ParticleSystem.vue'
import { useBattleEffects } from '~/composables/useBattleEffects'
import { useGameFeedback } from '~/composables/useGameFeedback'
import { battleSoundManager } from '~/utils/battleSounds'

export default {
  name: 'DynamicBattleArena',

  components: {
    CardPreview,
    ParticleSystem
  },

  props: {
    playerCard: {
      type: Object,
      required: false,
      default: () => null
    },
    opponentCard: {
      type: Object,
      required: false,
      default: () => null
    },
    playerMove: {
      type: String,
      required: false,
      default: null
    },
    opponentMove: {
      type: String,
      required: false,
      default: null
    },
    isPlayerTurn: {
      type: Boolean,
      required: true
    }
  },

  setup(props) {
    const arenaRef = ref(null)
    const playerCardRef = ref(null)
    const opponentCardRef = ref(null)
    const particleSystem = ref(null)

    const {
      battleStage,
      chargeLevel,
      elementEffects,
      animateCardEntrance,
      animateCharge,
      animateClash,
      animateImpact,
      animateEnvironment,
      resetEffects
    } = useBattleEffects()

    const { triggerHaptic } = useGameFeedback()

    onMounted(() => {
      // Initialize battle sound manager
      battleSoundManager.init()
      
      // Animate cards entrance
      animateCardEntrance(playerCardRef.value, true)
      animateCardEntrance(opponentCardRef.value, false)
    })

    onBeforeUnmount(() => {
      battleSoundManager.cleanup()
    })

    watch(() => props.playerMove, async (newMove, oldMove) => {
      if (!newMove) return

      battleStage.value = 'charging'
      triggerHaptic('charging')
      
      // Start charge sound and animation
      const chargeSound = battleSoundManager.playCharge()
      await animateCharge(playerCardRef.value, newMove).then(() => {
        battleStage.value = 'reveal'
        triggerHaptic('reveal')
        if (chargeSound) chargeSound.stop()
      })

      // If opponent move is ready, proceed to clash
      if (props.opponentMove) {
        battleStage.value = 'clash'
        triggerHaptic('clash')
        battleSoundManager.playClash()
        
        const timeline = animateClash(
          playerCardRef.value,
          opponentCardRef.value,
          props.playerMove,
          props.opponentMove
        )

        // Add impact effects
        timeline.call(() => {
          const rect = arenaRef.value.getBoundingClientRect()
          const particles = animateImpact(
            rect.width / 2,
            rect.height / 2,
            'critical'
          )
          particleSystem.value.addParticles(particles)
          animateEnvironment(2)
          triggerHaptic('impact')
          battleSoundManager.playImpact()
        })

        timeline.call(() => {
          battleStage.value = 'result'
          // Play victory/defeat sound based on the move comparison
          const playerWins = determineWinner(props.playerMove, props.opponentMove)
          if (playerWins) {
            battleSoundManager.playVictory()
          }
        })
      }
    })

    onBeforeUnmount(() => {
      resetEffects([playerCardRef.value, opponentCardRef.value])
    })

    const getAuraStyle = (move) => {
      if (!move || battleStage.value === 'idle') return {}
      const effect = elementEffects.value[move]
      return {
        boxShadow: `0 0 30px ${effect.glowColor}`,
        background: `radial-gradient(circle, ${effect.glowColor} 0%, transparent 70%)`
      }
    }

    const getMoveIcon = (move) => {
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
    }

    return {
      arenaRef,
      playerCardRef,
      opponentCardRef,
      particleSystem,
      battleStage,
      chargeLevel,
      getAuraStyle,
      getMoveIcon
    }
  }
}
</script>

<style scoped>
.dynamic-battle-arena {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  background: #1a1a1a;
}

.arena-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.energy-field {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.energy-field.active {
  opacity: 1;
}

.arena-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%),
    linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%);
  background-size: 50px 50px;
  animation: movingGrid 20s linear infinite;
}

.battle-area {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.player-field,
.opponent-field {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-container {
  position: relative;
  transition: transform 0.3s ease;
}

.card-container.charging {
  animation: cardPulse 1s ease-in-out infinite;
}

.card-aura {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.charging .card-aura {
  opacity: 1;
}

.battle-card {
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
}

.energy-charge {
  position: absolute;
  bottom: -10px;
  left: 0;
  height: 4px;
  background: linear-gradient(to right, #4CAF50, #FFC107, #F44336);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.battle-center {
  position: relative;
  z-index: 2;
  width: 100px;
}

.versus-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.versus-circle.active {
  background: rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  transform: scale(1.2);
}

.clash-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.clash-lightning {
  position: absolute;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  animation: lightningPulse 0.5s ease-out infinite;
}

.clash-shockwave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transform: translate(-50%, -50%);
  animation: shockwave 1s ease-out infinite;
}

.move-indicators {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 100px;
  pointer-events: none;
}

.move-indicator {
  font-size: 48px;
  animation: moveReveal 0.5s ease-out;
}

.element-rock { filter: sepia(100%) hue-rotate(350deg); }
.element-paper { filter: sepia(100%) hue-rotate(180deg); }
.element-scissors { filter: sepia(100%) hue-rotate(300deg); }

@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes movingGrid {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes lightningPulse {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

@keyframes shockwave {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 300px; height: 300px; opacity: 0; }
}

@keyframes moveReveal {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@media (max-width: 768px) {
  .dynamic-battle-arena {
    height: 400px;
  }

  .move-indicators {
    padding: 0 50px;
  }

  .move-indicator {
    font-size: 36px;
  }
}
</style>
