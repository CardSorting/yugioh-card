<template>
  <div 
    class="deck-builder"
    @mousemove="updateMousePosition"
  >
    <!-- Header -->
    <deck-header
      :name="deckName"
      :main-count="mainDeckCards.length"
      :extra-count="extraDeckCards.length"
      :side-count="sideDeckCards.length"
      :validation-errors="validationErrors"
      @update:name="updateDeckName"
      @save="saveDeck"
      @clear="clearDeck"
      @export="exportDeck"
    />

    <!-- Main Content -->
    <div class="deck-builder-content">
      <!-- Card Collection -->
      <card-collection
        :cards="cards"
        :deck-counts="cardCounts"
        :is-loading="isLoading"
        @add="addCardToDeck"
        @show-options="showCardOptions"
        @show-filters="showAdvancedFilters"
        @card-hover="handleCardHover"
      />

      <!-- Deck Builder Sidebar -->
      <div class="deck-builder-sidebar">
        <!-- Deck Stats -->
        <div class="deck-stats p-3">
          <!-- Card Type Distribution -->
          <div class="type-distribution">
            <div class="d-flex justify-content-between mb-2">
              <span>Monsters: {{ monsterCount }}</span>
              <span>Spells: {{ spellCount }}</span>
              <span>Traps: {{ trapCount }}</span>
            </div>
            <b-progress class="type-progress" height="0.5rem">
              <b-progress-bar
                variant="warning"
                :value="(monsterCount / totalCards) * 100"
              />
              <b-progress-bar
                variant="success"
                :value="(spellCount / totalCards) * 100"
              />
              <b-progress-bar
                variant="danger"
                :value="(trapCount / totalCards) * 100"
              />
            </b-progress>
          </div>

          <!-- Level/Rank Distribution -->
          <div class="mt-4">
            <deck-curve :cards="mainDeckCards" />
          </div>
        </div>

        <!-- Deck Sections -->
        <deck-sections
          :main-deck-cards="mainDeckCards"
          :extra-deck-cards="extraDeckCards"
          :side-deck-cards="sideDeckCards"
          :validation-errors="sectionErrors"
          @remove-card="removeCardFromDeck"
          @move-card="moveCard"
          @card-hover="handleCardHover"
        />
      </div>
    </div>

    <!-- Card Options Context Menu -->
    <b-modal
      v-model="showOptions"
      title="Add to Deck"
      size="sm"
      @hidden="selectedCard = null"
    >
      <div class="d-flex flex-column">
        <b-button
          v-for="section in availableSections"
          :key="section.value"
          variant="outline-primary"
          class="mb-2"
          @click="addToSection(section.value)"
        >
          Add to {{ section.text }}
        </b-button>
      </div>
    </b-modal>

    <!-- Advanced Filter Modal -->
    <deck-filter-modal
      v-model="showFiltersModal"
      @apply-filters="handleFilters"
    />

    <!-- Card Preview -->
    <card-preview-float
      :card="previewCard"
      :position="mousePosition"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import DeckHeader from '~/components/deck/header/DeckHeader.vue'
import CardCollection from '~/components/collection/CardCollection.vue'
import DeckSections from '~/components/deck/sections/DeckSections.vue'
import DeckCurve from '~/components/deck/DeckCurve.vue'
import DeckFilterModal from '~/components/deck/DeckFilterModal.vue'
import CardPreviewFloat from '~/components/deck/CardPreviewFloat.vue'

export default {
  name: 'DeckBuilder',

  components: {
    DeckHeader,
    CardCollection,
    DeckSections,
    DeckCurve,
    DeckFilterModal,
    CardPreviewFloat
  },

  data() {
    return {
      showOptions: false,
      showFiltersModal: false,
      selectedCard: null,
      previewCard: null,
      mousePosition: { x: 0, y: 0 },
      deckName: '',
      isEditing: false,
      validationErrors: []
    }
  },

  computed: {
    ...mapState({
      deck: state => state.deck.currentDeck,
      cards: state => state.cards.allCards,
      isLoading: state => state.cards.isLoading
    }),

    mainDeckCards() {
      return this.deck?.deck_cards?.filter(card => card.section === 'main') || []
    },

    extraDeckCards() {
      return this.deck?.deck_cards?.filter(card => card.section === 'extra') || []
    },

    sideDeckCards() {
      return this.deck?.deck_cards?.filter(card => card.section === 'side') || []
    },

    totalCards() {
      return this.mainDeckCards.length + this.extraDeckCards.length + this.sideDeckCards.length
    },

    cardCounts() {
      const counts = {}
      this.deck?.deck_cards?.forEach(card => {
        counts[card.card.id] = (counts[card.card.id] || 0) + 1
      })
      return counts
    },

    monsterCount() {
      return this.countCardsByType('Monster')
    },

    spellCount() {
      return this.countCardsByType('Spell')
    },

    trapCount() {
      return this.countCardsByType('Trap')
    },

    sectionErrors() {
      return {
        main: this.validationErrors.filter(error => error.section === 'main'),
        extra: this.validationErrors.filter(error => error.section === 'extra'),
        side: this.validationErrors.filter(error => error.section === 'side')
      }
    },

    availableSections() {
      if (!this.selectedCard) return []

      const sections = [
        { text: 'Main Deck', value: 'main' },
        { text: 'Extra Deck', value: 'extra' },
        { text: 'Side Deck', value: 'side' }
      ]

      // Filter based on card type
      if (this.selectedCard.card_data.type.includes('Fusion') ||
          this.selectedCard.card_data.type.includes('Synchro') ||
          this.selectedCard.card_data.type.includes('Xyz') ||
          this.selectedCard.card_data.type.includes('Link')) {
        return sections.filter(s => s.value !== 'main')
      }

      return sections
    }
  },

  watch: {
    deck: {
      immediate: true,
      handler(deck) {
        if (deck) {
          this.deckName = deck.name
          this.isEditing = true
          this.validateDeck()
        }
      }
    }
  },

  methods: {
    ...mapActions('deck', [
      'createDeck',
      'updateDeck',
      'addCardToDeck',
      'removeCardFromDeck',
      'moveCardInDeck'
    ]),

    updateMousePosition(event) {
      this.mousePosition = {
        x: event.clientX,
        y: event.clientY
      }
    },

    handleCardHover({ card, isEnter }) {
      this.previewCard = isEnter ? card : null
    },

    showAdvancedFilters() {
      this.showFiltersModal = true
    },

    handleFilters(filters) {
      // Handle advanced filters
    },

    showCardOptions(card) {
      this.selectedCard = card
      this.showOptions = true
    },

    async addToSection(section) {
      if (!this.selectedCard) return

      try {
        await this.addCardToDeck({
          deckId: this.deck.id,
          cardId: this.selectedCard.id,
          section
        })
        this.showOptions = false
        this.validateDeck()
      } catch (error) {
        console.error('Error adding card to deck:', error)
      }
    },

    async moveCard({ card, fromSection, toSection }) {
      try {
        await this.moveCardInDeck({
          deckId: this.deck.id,
          cardId: card.id,
          fromSection,
          toSection
        })
        this.validateDeck()
      } catch (error) {
        console.error('Error moving card:', error)
      }
    },

    countCardsByType(type) {
      return this.deck?.deck_cards?.filter(c => 
        c.card.card_data.type.includes(type)
      ).length || 0
    },

    validateDeck() {
      const errors = []

      // Validate main deck
      if (this.mainDeckCards.length < 40) {
        errors.push({
          section: 'main',
          message: 'Main deck must have at least 40 cards'
        })
      }
      if (this.mainDeckCards.length > 60) {
        errors.push({
          section: 'main',
          message: 'Main deck cannot exceed 60 cards'
        })
      }

      // Validate extra deck
      if (this.extraDeckCards.length > 15) {
        errors.push({
          section: 'extra',
          message: 'Extra deck cannot exceed 15 cards'
        })
      }

      // Validate side deck
      if (this.sideDeckCards.length > 15) {
        errors.push({
          section: 'side',
          message: 'Side deck cannot exceed 15 cards'
        })
      }

      this.validationErrors = errors
    },

    async updateDeckName(name) {
      this.deckName = name
      if (this.isEditing) {
        await this.saveDeck()
      }
    },

    async saveDeck() {
      try {
        if (this.isEditing) {
          await this.updateDeck({
            id: this.deck.id,
            name: this.deckName
          })
        } else {
          await this.createDeck({
            name: this.deckName || 'New Deck'
          })
        }
      } catch (error) {
        console.error('Error saving deck:', error)
      }
    },

    clearDeck() {
      // Implement deck clearing
    },

    exportDeck() {
      // Implement deck export
    }
  }
}
</script>

<style scoped>
.deck-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.deck-builder-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.deck-builder-sidebar {
  width: 400px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 1px solid #dee2e6;
}

.type-progress {
  height: 6px;
  border-radius: 3px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
