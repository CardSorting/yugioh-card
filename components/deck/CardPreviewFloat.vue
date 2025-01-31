<template>
  <transition name="preview-fade">
    <div
      v-if="card"
      class="card-preview-float"
      :style="previewStyle"
    >
      <div class="preview-content">
        <img :src="cardImageUrl" :alt="cardName">
        <div class="preview-details" v-if="isMonster">
          <div class="preview-stats">
            <span class="preview-atk">ATK/{{ cardAtk }}</span>
            <span class="preview-def">DEF/{{ cardDef }}</span>
          </div>
          <div class="preview-type">
            {{ monsterTypeText }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CardPreviewFloat',

  props: {
    card: {
      type: Object,
      default: null
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    }
  },

  computed: {
    cardImageUrl() {
      return this.card?.image_url || ''
    },

    cardName() {
      return this.card?.name || 'Unknown Card'
    },

    cardAtk() {
      return this.card?.card_data?.atk || '?'
    },

    cardDef() {
      return this.card?.card_data?.def || '?'
    },

    isMonster() {
      return this.card?.card_data?.type?.includes('Monster') || false
    },

    monsterTypeText() {
      if (!this.card?.card_data) return ''
      
      const parts = []
      const data = this.card.card_data
      
      if (data.attribute) {
        parts.push(data.attribute)
      }
      if (data.level) {
        parts.push(`Level ${data.level}`)
      }
      if (data.race) {
        parts.push(data.race)
      }
      return parts.join(' • ')
    },

    previewStyle() {
      return {
        left: `${this.position.x + 20}px`,
        top: `${this.position.y - 100}px`
      }
    }
  }
}
</script>

<style scoped>
.card-preview-float {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  transform-origin: center;
}

.preview-content {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.preview-content img {
  width: 240px;
  height: auto;
  border-radius: 4px;
}

.preview-details {
  margin-top: 8px;
  color: #fff;
  font-size: 0.9rem;
}

.preview-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.preview-type {
  font-size: 0.8rem;
  color: #aaa;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.2s ease;
}

.preview-fade-enter,
.preview-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
