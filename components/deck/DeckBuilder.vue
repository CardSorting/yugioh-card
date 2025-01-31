<template>
  <div class="deck-builder">
    <!-- Deck Header -->
    <deck-header
      :name="deckName"
      :description="deckDescription"
      :main-count="mainDeckCards.length"
      :extra-count="extraDeckCards.length"
      :side-count="sideDeckCards.length"
      @update:name="updateDeckName"
      @update:description="updateDeckDescription"
      @save="saveDeck"
      @share="showShareModal"
      @export="exportDeck"
    />

    <!-- Main Content -->
    <div class="deck-content">
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

      <!-- Deck Sections -->
      <deck-sections
        :main-deck-cards="mainDeckCards"
        :extra-deck-cards="extraDeckCards"
        :side-deck-cards="sideDeckCards"
          @remove-card="removeCardFromDeck"
        @move-card="moveCard"
        @card-hover="handleCardHover"
      />
    </div>

    <!-- Share Modal -->
    <deck-share-modal
      v-model="showShare"
      :deck-id="deckId"
    />

    <!-- Filter Modal -->
    <deck-filter-modal
      v-model="showFilters"
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
import { mapState } from 'vuex'
import DeckHeader from './header/DeckHeader.vue'
import CardCollection from '../collection/CardCollection.vue'
import DeckSections from './sections/DeckSections.vue'
import DeckShareModal from './sharing/DeckShareModal.vue'
import DeckFilterModal from './DeckFilterModal.vue'
import CardPreviewFloat from './CardPreviewFloat.vue'
import DeckServiceFactory from '../../services/deck/DeckServiceFactory'

export default {
  name: 'DeckBuilder',

  components: {
    DeckHeader,
    CardCollection,
    DeckSections,
    DeckShareModal,
    DeckFilterModal,
    CardPreviewFloat
  },

  props: {
    deck: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        description: '',
        deck_cards: []
      })
    }
  },

  data() {
    return {
      showShare: false,
      showFilters: false,
      previewCard: null,
      mousePosition: { x: 0, y: 0 },
      services: null,
      mainDeckCards: [],
      extraDeckCards: [],
      sideDeckCards: [],
      cardCounts: {},
      unsubscribe: null
    }
  },

  computed: {
    ...mapState({
      cards: state => state.cards.allCards,
      isLoading: state => state.cards.isLoading
    }),

    deckName() {
      return this.deck?.name || ''
    },

    deckDescription() {
      return this.deck?.description || ''
    },

    deckId() {
      return this.deck?.id || null
    }
  },

  created() {
    // Initialize services
    this.services = DeckServiceFactory.create(this.$store)
    
    // Initial data load
    this.updateSectionData()
    
    // Subscribe to state changes
    this.unsubscribe = this.services.getStateService().subscribe(() => {
      this.updateSectionData()
    })
  },

  beforeDestroy() {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },

  methods: {
    updateSectionData() {
      if (!this.services) return
      
      const stateService = this.services.getStateService()
      this.mainDeckCards = stateService.getCardsInSection('main') || []
      this.extraDeckCards = stateService.getCardsInSection('extra') || []
      this.sideDeckCards = stateService.getCardsInSection('side') || []
      this.cardCounts = stateService.getCardQuantities() || {}
    },

    async updateDeckName(name) {
      if (!this.deck || !this.deck.id) return

      try {
        const result = await this.services.getMutationService().updateDeckMetadata({
          name,
          description: this.deck.description || ''
        })
        if (!result.successful) {
          throw new Error(result.error)
        }
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async updateDeckDescription(description) {
      if (!this.deck || !this.deck.id) return

      try {
        const result = await this.services.getMutationService().updateDeckMetadata({
          name: this.deck.name || '',
          description
        })
        if (!result.successful) {
          throw new Error(result.error)
        }
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async saveDeck() {
      if (!this.deck || !this.deck.id) return

      try {
        const result = await this.services.getMutationService().saveDeckChanges()
        if (!result.successful) {
          throw new Error(result.error)
        }
        
        this.$bvToast.toast('Deck saved successfully', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    showShareModal() {
      if (!this.deck?.id) {
        this.$bvToast.toast('Please save the deck before sharing', {
          title: 'Cannot Share',
          variant: 'warning'
        })
        return
      }
      this.showShare = true
    },

    showAdvancedFilters() {
      this.showFilters = true
    },

    handleFilters(filters) {
      // Handle advanced filters
    },

    handleCardHover({ card, isEnter }) {
      this.previewCard = isEnter ? card : null
      if (isEnter) {
        this.mousePosition = { x: event.clientX, y: event.clientY }
      }
    },

    async exportDeck() {
      if (!this.deck) return

      try {
        const exportService = this.services.getExportService()
        const blob = await exportService.exportDeck(this.deck, {
          format: 'json',
          includeDetails: true
        })
        
        const filename = exportService.generateFilename(this.deck, 'json')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        this.$bvToast.toast('Deck exported successfully', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        this.$bvToast.toast('Failed to export deck', {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async addCardToDeck(card, section) {
      try {
        const result = await this.services.getCardAdditionService().addCard(card, section)
        if (!result.successful) {
          throw new Error(result.error)
        }
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async removeCardFromDeck(card) {
      try {
        const result = await this.services.getCardRemovalService().removeCard(card)
        if (!result.successful) {
          throw new Error(result.error)
        }
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async moveCard({ card, fromSection, toSection }) {
      try {
        const result = await this.services.getCardMovementService().moveCard(card, fromSection, toSection)
        if (!result.successful) {
          throw new Error(result.error)
        }
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    showCardOptions(card) {
      // Show card options menu
      // This could be implemented as a modal or context menu
      // For now, we'll just show move options
      this.$bvModal.msgBoxConfirm('Move card to another section?', {
        title: 'Card Options',
        okVariant: 'primary',
        cancelVariant: 'outline-secondary',
        hideHeaderClose: false,
        centered: true
      })
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

.deck-content {
  flex: 1;
  display: flex;
  overflow: hidden;
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
