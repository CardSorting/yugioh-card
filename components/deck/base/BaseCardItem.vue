<template>
  <div
    :class="cardClasses"
    @click="onClick"
    @contextmenu.prevent="onRightClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @dragstart="onDragStart"
    draggable="true"
  >
    <!-- Card Image -->
    <div class="card-image">
      <img :src="cardImageUrl" :alt="cardName">
      <div v-if="showCount && count > 0" class="card-count">
        {{ count }}
      </div>
      <div v-if="isRare" class="card-rarity" :class="rarityClass" />
    </div>

    <!-- Card Details -->
    <div v-if="showDetails" class="card-details">
      <div class="card-name" :title="cardName">{{ cardName }}</div>
      <div class="card-type text-muted">{{ cardType }}</div>
      <div v-if="isMonster" class="card-stats">
        <span class="card-atk">ATK/{{ cardAtk }}</span>
        <span class="card-def">DEF/{{ cardDef }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCardItem',

  props: {
    /**
     * Card data
     */
    card: {
      type: Object,
      required: true
    },

    /**
     * Number of copies in deck
     */
    count: {
      type: Number,
      default: 0
    },

    /**
     * Whether to show card details
     */
    showDetails: {
      type: Boolean,
      default: true
    },

    /**
     * Whether to show card count
     */
    showCount: {
      type: Boolean,
      default: true
    },

    /**
     * Whether card is selected
     */
    isSelected: {
      type: Boolean,
      default: false
    },

    /**
     * Whether card is disabled
     */
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Safe card data getters
     */
    cardName() {
      return this.card?.name || 'Unknown Card'
    },

    cardType() {
      return this.card?.type || ''
    },

    cardImageUrl() {
      return this.card?.image_url || ''
    },

    cardAtk() {
      return this.card?.card_data?.atk || '?'
    },

    cardDef() {
      return this.card?.card_data?.def || '?'
    },

    /**
     * Whether card is a monster
     */
    isMonster() {
      return this.card?.card_data?.type?.includes('Monster') || false
    },

    /**
     * Whether card is rare
     */
    isRare() {
      return this.card?.card_data?.rarity !== 'Common'
    },

    /**
     * CSS class for rarity animation
     */
    rarityClass() {
      const rarity = this.card?.card_data?.rarity
      return {
        'rarity-rare': rarity === 'Rare',
        'rarity-ultra': rarity === 'Ultra Rare',
        'rarity-secret': rarity === 'Secret Rare'
      }
    },

    /**
     * CSS classes for card item
     */
    cardClasses() {
      return {
        'card-item': true,
        'is-selected': this.isSelected,
        'is-disabled': this.isDisabled,
        'has-details': this.showDetails,
        'is-monster': this.isMonster
      }
    }
  },

  methods: {
    onClick() {
      if (!this.isDisabled) {
        this.$emit('click', this.card)
      }
    },

    onRightClick(event) {
      if (!this.isDisabled) {
        this.$emit('right-click', { card: this.card, event })
      }
    },

    onMouseEnter() {
      this.$emit('hover', { card: this.card, isEnter: true })
    },

    onMouseLeave() {
      this.$emit('hover', { card: this.card, isEnter: false })
    },

    onDragStart(event) {
      if (!this.isDisabled) {
        this.$emit('drag-start', { card: this.card, event })
      }
    }
  }
}
</script>

<style scoped>
.card-item {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.card-item:not(.is-disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-item.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-item.is-selected {
  box-shadow: 0 0 0 2px #007bff;
}

.card-image {
  position: relative;
  padding-top: 146%; /* Card aspect ratio */
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-count {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007bff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.card-rarity {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.card-rarity.rarity-rare::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 112, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.card-rarity.rarity-ultra::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.3),
    transparent
  );
  animation: shine 2s infinite;
}

.card-rarity.rarity-secret::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shine 1.5s infinite;
}

.card-item:hover .rarity-rare::before {
  left: 100%;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  20% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.card-details {
  padding: 0.5rem;
}

.card-name {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-type {
  font-size: 0.8rem;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style>
