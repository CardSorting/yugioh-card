<template>
  <div class="collection-page">
    <h1 class="mb-4">Card Collection</h1>
    
    <card-collection
      :cards="cards"
      :deck-counts="deckCounts"
      :is-loading="isLoading"
      @add="addCardToDeck"
      @show-options="showCardOptions"
      @card-hover="handleCardHover"
    />

    <!-- Card Options Modal -->
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

    <!-- Card Preview -->
    <card-preview-float
      :card="previewCard"
      :position="mousePosition"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import CardCollection from '~/components/collection/CardCollection.vue'
import CardPreviewFloat from '~/components/deck/CardPreviewFloat.vue'

export default {
  name: 'CollectionPage',

  components: {
    CardCollection,
    CardPreviewFloat
  },

  data() {
    return {
      showOptions: false,
      selectedCard: null,
      previewCard: null,
      mousePosition: { x: 0, y: 0 }
    }
  },

  computed: {
    ...mapState({
      cards: state => state.cards.allCards,
      isLoading: state => state.cards.isLoading,
      currentDeck: state => state.deck.currentDeck
    }),

    deckCounts() {
      const counts = {}
      this.currentDeck?.deck_cards?.forEach(card => {
        counts[card.card.id] = (counts[card.card.id] || 0) + 1
      })
      return counts
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

  async fetch() {
    if (!this.cards.length) {
      await this.fetchCards()
    }
  },

  methods: {
    ...mapActions({
      fetchCards: 'cards/fetchCards',
      addCardToDeck: 'deck/addCardToDeck'
    }),

    showCardOptions(params) {
      this.selectedCard = params.card
      this.showOptions = true
    },

    async addToSection(section) {
      if (!this.selectedCard || !this.currentDeck) return

      try {
        await this.addCardToDeck({
          deckId: this.currentDeck.id,
          cardId: this.selectedCard.id,
          section
        })
        this.showOptions = false
      } catch (error) {
        console.error('Error adding card to deck:', error)
      }
    },

    handleCardHover({ card, isEnter }) {
      this.previewCard = isEnter ? card : null
    },

    updateMousePosition(event) {
      this.mousePosition = {
        x: event.clientX,
        y: event.clientY
      }
    }
  }
}
</script>

<style scoped>
.collection-page {
  padding: 2rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

h1 {
  color: #2c3e50;
}
</style>
