<template>
  <div class="deck-sections">
    <b-tabs pills card vertical>
      <!-- Main Deck -->
      <b-tab active>
        <template #title>
          <div class="d-flex align-items-center">
            <span>Main Deck</span>
            <span 
              class="ml-2"
              :class="{ 'text-danger': isOverLimit('main') }"
            >
              {{ sectionCounts.main }}/{{ sectionLimits.main.max }}
            </span>
          </div>
        </template>
        <deck-section
          section="main"
          :cards="mainDeckCards"
          :max-cards="sectionLimits.main.max"
          @card-click="removeCard"
          @card-right-click="showCardOptions"
          @card-hover="onCardHover"
          @drop="handleDrop"
        />
      </b-tab>

      <!-- Extra Deck -->
      <b-tab>
        <template #title>
          <div class="d-flex align-items-center">
            <span>Extra Deck</span>
            <span 
              class="ml-2"
              :class="{ 'text-danger': isOverLimit('extra') }"
            >
              {{ sectionCounts.extra }}/{{ sectionLimits.extra.max }}
            </span>
          </div>
        </template>
        <deck-section
          section="extra"
          :cards="extraDeckCards"
          :max-cards="sectionLimits.extra.max"
          @card-click="removeCard"
          @card-right-click="showCardOptions"
          @card-hover="onCardHover"
          @drop="handleDrop"
        />
      </b-tab>

      <!-- Side Deck -->
      <b-tab>
        <template #title>
          <div class="d-flex align-items-center">
            <span>Side Deck</span>
            <span 
              class="ml-2"
              :class="{ 'text-danger': isOverLimit('side') }"
            >
              {{ sectionCounts.side }}/{{ sectionLimits.side.max }}
            </span>
          </div>
        </template>
        <deck-section
          section="side"
          :cards="sideDeckCards"
          :max-cards="sectionLimits.side.max"
          @card-click="removeCard"
          @card-right-click="showCardOptions"
          @card-hover="onCardHover"
          @drop="handleDrop"
        />
      </b-tab>
    </b-tabs>

    <!-- Card Options Menu -->
    <b-modal
      v-model="showOptions"
      title="Move Card"
      size="sm"
      @hidden="selectedCard = null"
    >
      <div class="d-flex flex-column">
        <b-button
          v-for="section in availableSections"
          :key="section.value"
          variant="outline-primary"
          class="mb-2"
          :disabled="!canMoveToSection(section.value)"
          @click="moveCard(section.value)"
        >
          Move to {{ section.text }}
        </b-button>
        <b-button
          variant="outline-danger"
          @click="removeCard(selectedCard)"
        >
          Remove Card
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import DeckSection from './DeckSection.vue'
import DeckCardGroupingService from '../../../services/deck/implementations/DeckCardGroupingService'

export default {
  name: 'DeckSections',

  components: {
    DeckSection
  },

  props: {
    /**
     * Main deck cards
     */
    mainDeckCards: {
      type: Array,
      required: true
    },

    /**
     * Extra deck cards
     */
    extraDeckCards: {
      type: Array,
      required: true
    },

    /**
     * Side deck cards
     */
    sideDeckCards: {
      type: Array,
      required: true
    },

    /**
     * Validation errors by section
     */
    validationErrors: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      showOptions: false,
      selectedCard: null,
      selectedSection: null,
      cardGrouping: new DeckCardGroupingService()
    }
  },

  computed: {
    /**
     * Section card counts
     */
    sectionCounts() {
      return {
        main: this.mainDeckCards.length,
        extra: this.extraDeckCards.length,
        side: this.sideDeckCards.length
      }
    },

    /**
     * Section limits from card grouping service
     */
    sectionLimits() {
      return {
        main: this.cardGrouping.getSectionLimits('main'),
        extra: this.cardGrouping.getSectionLimits('extra'),
        side: this.cardGrouping.getSectionLimits('side')
      }
    },

    /**
     * Available sections for card movement
     */
    availableSections() {
      if (!this.selectedCard || !this.selectedSection) return []

      return [
        { text: 'Main Deck', value: 'main' },
        { text: 'Extra Deck', value: 'extra' },
        { text: 'Side Deck', value: 'side' }
      ].filter(section => section.value !== this.selectedSection)
    }
  },

  methods: {
    /**
     * Check if section is over limit
     */
    isOverLimit(section) {
      const count = this.sectionCounts[section]
      const limit = this.sectionLimits[section]?.max
      return count > limit
    },

    /**
     * Check if card can be moved to section
     */
    canMoveToSection(targetSection) {
      if (!this.selectedCard) return false

      const currentCards = {
        main: this.mainDeckCards,
        extra: this.extraDeckCards,
        side: this.sideDeckCards
      }[targetSection]

      return this.cardGrouping.canAddToSection({
        card: this.selectedCard,
        section: targetSection,
        currentCards
      })
    },

    /**
     * Handle card hover
     */
    onCardHover(params) {
      this.$emit('card-hover', params)
    },

    /**
     * Show card options menu
     */
    showCardOptions({ card, section, event }) {
      this.selectedCard = card
      this.selectedSection = section
      this.showOptions = true
    },

    /**
     * Move card to different section
     */
    moveCard(targetSection) {
      if (!this.selectedCard || !this.selectedSection) return
      if (!this.canMoveToSection(targetSection)) return

      this.$emit('move-card', {
        card: this.selectedCard,
        fromSection: this.selectedSection,
        toSection: targetSection
      })
      this.showOptions = false
    },

    /**
     * Remove card from deck
     */
    removeCard(card) {
      this.$emit('remove-card', card)
      this.showOptions = false
    },

    /**
     * Handle card drop
     */
    handleDrop({ cardId, sourceSection, targetSection }) {
      if (!cardId || !sourceSection || !targetSection) return
      if (sourceSection === targetSection) return

      const sourceCards = {
        main: this.mainDeckCards || [],
        extra: this.extraDeckCards || [],
        side: this.sideDeckCards || []
      }

      const card = sourceCards[sourceSection]?.find(c => c?.id === cardId)
      if (!card) return

      // Validate move
      if (!this.cardGrouping.canAddToSection({
        card,
        section: targetSection,
        currentCards: sourceCards[targetSection]
      })) return

      this.$emit('move-card', {
        card,
        fromSection: sourceSection,
        toSection: targetSection
      })
    }
  }
}
</script>

<style scoped>
.deck-sections {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Custom tab styling */
::v-deep .nav-pills {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

::v-deep .nav-pills .nav-link {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #495057;
}

::v-deep .nav-pills .nav-link.active {
  background-color: #007bff;
  color: #fff;
}

::v-deep .tab-content {
  flex: 1;
  overflow: hidden;
}

::v-deep .tab-pane {
  height: 100%;
  padding: 1rem;
}
</style>
