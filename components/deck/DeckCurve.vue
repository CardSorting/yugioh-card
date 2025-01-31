<template>
  <div class="deck-curve">
    <h5 class="mb-3">Level/Rank Distribution</h5>
    <div class="curve-graph">
      <div
        v-for="level in 12"
        :key="level"
        class="curve-bar"
        :style="{
          height: `${getBarHeight(level)}%`,
          backgroundColor: getBarColor(level)
        }"
      >
        <div class="curve-count">{{ getLevelCount(level) }}</div>
        <div class="curve-label">{{ level }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeckCurve',

  props: {
    cards: {
      type: Array,
      required: true
    }
  },

  methods: {
    getLevelCount(level) {
      return this.cards.filter(card => {
        const cardLevel = card.card.card_data.level || card.card.card_data.rank || 0
        return cardLevel === level && card.card.card_data.type.includes('Monster')
      }).length
    },

    getBarHeight(level) {
      const count = this.getLevelCount(level)
      const maxCount = Math.max(...Array.from({ length: 12 }, (_, i) => this.getLevelCount(i + 1)))
      return maxCount > 0 ? (count / maxCount) * 100 : 0
    },

    getBarColor(level) {
      // Hearthstone-style color gradient
      const colors = [
        '#4a9eff', // Level 1-2
        '#4a9eff',
        '#2ecc71', // Level 3-4
        '#2ecc71',
        '#f1c40f', // Level 5-6
        '#f1c40f',
        '#e67e22', // Level 7-8
        '#e67e22',
        '#e74c3c', // Level 9-10
        '#e74c3c',
        '#9b59b6', // Level 11-12
        '#9b59b6'
      ]
      return colors[level - 1]
    }
  }
}
</script>

<style scoped>
.deck-curve {
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.curve-graph {
  height: 150px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding-bottom: 24px;
  position: relative;
}

.curve-bar {
  flex: 1;
  min-width: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
}

.curve-bar:hover {
  transform: scaleY(1.05);
  filter: brightness(1.1);
}

.curve-count {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

.curve-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #666;
}
</style>
