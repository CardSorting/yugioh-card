<template>
  <div
    ref="cardGrid"
    class="card-grid p-3"
    @scroll="onScroll"
  >
    <div 
      class="grid-container"
      :style="gridStyle"
    >
      <div
        v-for="card in visibleCards"
        :key="card.id"
        class="card-wrapper"
        :style="getCardStyle(card)"
      >
        <base-card-item
          :card="card"
          :count="getCardCount(card.id)"
          :is-disabled="!canAddCard(card)"
          @click="addCard(card)"
          @right-click="showCardOptions(card, $event)"
          @hover="onCardHover"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="loading-state"
    >
      <b-spinner variant="primary" />
      <span class="ml-2">Loading cards...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="cards.length === 0"
      class="empty-state"
    >
      <font-awesome-icon
        :icon="['fas', 'search']"
        size="2x"
        class="mb-2"
      />
      <p class="mb-0">No cards found</p>
      <small class="text-muted">Try adjusting your filters</small>
    </div>
  </div>
</template>

<script>
import BaseCardItem from '../deck/base/BaseCardItem.vue'

const CARD_HEIGHT = 250
const CARD_WIDTH = 180
const GRID_GAP = 16
const BUFFER_SIZE = 5

export default {
  name: 'CardGrid',

  components: {
    BaseCardItem
  },

  props: {
    cards: {
      type: Array,
      required: true
    },
    deckCounts: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    gridService: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      scrollTop: 0,
      containerWidth: 0,
      containerHeight: 0,
      debouncedResize: null
    }
  },

  computed: {
    gridLayout() {
      return this.gridService.calculateGridLayout({
        containerWidth: this.containerWidth,
        itemWidth: CARD_WIDTH,
        gap: GRID_GAP
      })
    },

    visibleRange() {
      return this.gridService.calculateVisibleRange({
        scrollTop: this.scrollTop,
        containerHeight: this.containerHeight,
        containerWidth: this.containerWidth,
        totalItems: this.cards.length,
        itemHeight: CARD_HEIGHT,
        itemWidth: CARD_WIDTH,
        bufferSize: BUFFER_SIZE
      })
    },

    visibleCards() {
      const { startIndex, endIndex } = this.visibleRange
      return this.cards.slice(startIndex, endIndex)
    },

    gridStyle() {
      const totalHeight = this.gridService.calculateTotalHeight({
        totalItems: this.cards.length,
        columnsPerRow: this.gridLayout.columnsPerRow,
        itemHeight: CARD_HEIGHT,
        gap: GRID_GAP
      })

      return {
        height: `${totalHeight}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${this.gridLayout.columnsPerRow}, 1fr)`,
        gap: `${GRID_GAP}px`,
        position: 'relative'
      }
    }
  },

  mounted() {
    this.updateContainerSize()
    this.debouncedResize = this.debounce(this.updateContainerSize, 150)
    window.addEventListener('resize', this.debouncedResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedResize)
  },

  methods: {
    updateContainerSize() {
      if (this.$refs.cardGrid) {
        this.containerWidth = this.$refs.cardGrid.clientWidth
        this.containerHeight = this.$refs.cardGrid.clientHeight
      }
    },

    getCardStyle(card) {
      const index = this.cards.indexOf(card)
      const position = this.gridService.calculateItemPosition({
        index,
        columnsPerRow: this.gridLayout.columnsPerRow,
        itemHeight: CARD_HEIGHT,
        itemWidth: CARD_WIDTH,
        gap: GRID_GAP
      })

      return {
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`
      }
    },

    onScroll(event) {
      this.scrollTop = event.target.scrollTop
    },

    debounce(fn, delay) {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), delay)
      }
    },

    getCardCount(cardId) {
      return this.deckCounts[cardId] || 0
    },

    canAddCard(card) {
      return this.$emit('can-add', card)
    },

    addCard(card) {
      this.$emit('add', card)
    },

    showCardOptions(card, event) {
      this.$emit('show-options', { card, event })
    },

    onCardHover(params) {
      this.$emit('card-hover', params)
    }
  }
}
</script>

<style scoped>
.card-grid {
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.grid-container {
  position: relative;
  width: 100%;
}

.card-wrapper {
  position: absolute;
  transition: transform 0.2s ease;
}

.card-wrapper:hover {
  transform: translateY(-4px);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
}
</style>
