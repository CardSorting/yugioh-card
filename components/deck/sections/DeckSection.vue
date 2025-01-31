<template>
  <div
    :class="[sectionClasses, `deck-section-${section}`]"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Section Header -->
    <div class="section-header">
      <div class="section-title">
        <h3 class="mb-0">{{ sectionTitle }}</h3>
        <span 
          class="section-count"
          :class="{ 'text-danger': isOverLimit }"
        >
          {{ cards.length }}/{{ maxCards }}
        </span>
      </div>

      <!-- Section Stats -->
      <div v-if="showStats && !isEmpty" class="section-stats">
        <div class="stat-item">
          <span class="stat-label">Monsters:</span>
          <span class="stat-value">{{ sectionStats.monsters }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Spells:</span>
          <span class="stat-value">{{ sectionStats.spells }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Traps:</span>
          <span class="stat-value">{{ sectionStats.traps }}</span>
        </div>
      </div>
    </div>

    <!-- Card List -->
    <virtualized-card-list
      :items="groupedCards"
      :item-height="100"
      :buffer="3"
      :empty-text="emptyStateText"
      class="section-content"
    >
      <template #item="{ item: card }">
        <base-card-item
          :card="card"
          :count="card.quantity"
          :show-details="true"
          :show-count="true"
          draggable="true"
          @drag-start="onDragStart($event, card)"
          @click="onCardClick(card)"
          @right-click="onCardRightClick(card, $event)"
          @hover="onCardHover"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <font-awesome-icon
            :icon="['fas', 'layer-group']"
            size="2x"
            class="mb-2"
          />
          <p class="mb-0">{{ emptyStateText }}</p>
          <small class="text-muted">Drag cards here or click to add</small>
        </div>
      </template>
    </virtualized-card-list>
  </div>
</template>

<script>
import BaseDeckSection from '../base/BaseDeckSection.vue'
import BaseCardItem from '../base/BaseCardItem.vue'
import VirtualizedCardList from '../base/VirtualizedCardList.vue'
import DeckCardGroupingService from '../../../services/deck/implementations/DeckCardGroupingService'

export default {
  name: 'DeckSection',

  extends: BaseDeckSection,

  components: {
    BaseCardItem,
    VirtualizedCardList
  },

  props: {
    showStats: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      cardGrouping: new DeckCardGroupingService()
    }
  },

  computed: {
    sectionTitle() {
      switch (this.section) {
        case 'main':
          return 'Main Deck'
        case 'extra':
          return 'Extra Deck'
        case 'side':
          return 'Side Deck'
        default:
          return 'Deck Section'
      }
    },

    emptyStateText() {
      switch (this.section) {
        case 'main':
          return 'Add cards to your main deck'
        case 'extra':
          return 'Add extra deck monsters'
        case 'side':
          return 'Add cards to your side deck'
        default:
          return 'No cards added yet'
      }
    },

    isOverLimit() {
      return this.cards.length > this.maxCards
    },

    groupedCards() {
      return this.cardGrouping.groupCards(this.cards)
    },

    sectionStats() {
      return this.cardGrouping.getSectionStats(this.cards)
    }
  }
}
</script>

<style scoped>
.section-header {
  margin-bottom: 1rem;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-count {
  font-size: 1.1rem;
  font-weight: 500;
}

.section-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 500;
}

.section-content {
  height: calc(100% - 4rem);
  overflow-y: auto;
  position: relative;
}

.card-container {
  position: relative;
  width: 100%;
}

.card-wrapper {
  padding: 0.25rem;
  transition: transform 0.2s ease;
}

.card-wrapper:hover {
  transform: translateY(-2px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  height: 100%;
}


/* Section-specific styles */
.deck-section-main {
  border-color: #007bff;
}

.deck-section-extra {
  border-color: #6f42c1;
}

.deck-section-side {
  border-color: #28a745;
}
</style>
