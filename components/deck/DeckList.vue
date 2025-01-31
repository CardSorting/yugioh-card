<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>My Decks</h2>
      <b-button variant="primary" @click="showDeckBuilder = true">
        <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
        Create Deck
      </b-button>
    </div>

    <b-row>
      <b-col
        v-for="deck in decks"
        :key="deck.id"
        cols="12"
        md="6"
        lg="4"
        class="mb-4"
      >
        <b-card>
          <template #header>
            <h5 class="mb-0">{{ deck.name }}</h5>
          </template>

          <b-card-text v-if="deck.description">
            {{ deck.description }}
          </b-card-text>

          <div class="deck-stats mb-3">
            <div class="stat-item">
              <span class="stat-label">Main Deck:</span>
              <span class="stat-value" :class="{'text-danger': getMainCount(deck) > 60}">
                {{ getMainCount(deck) }}/60
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Extra Deck:</span>
              <span class="stat-value" :class="{'text-danger': getExtraCount(deck) > 15}">
                {{ getExtraCount(deck) }}/15
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Side Deck:</span>
              <span class="stat-value" :class="{'text-danger': getSideCount(deck) > 15}">
                {{ getSideCount(deck) }}/15
              </span>
            </div>
          </div>

          <template #footer>
            <div class="d-flex justify-content-between">
              <b-button
                variant="primary"
                size="sm"
                @click="editDeck(deck)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="mr-1" />
                Edit
              </b-button>
              <b-button
                variant="danger"
                size="sm"
                @click="confirmDelete(deck)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="mr-1" />
                Delete
              </b-button>
            </div>
          </template>
        </b-card>
      </b-col>
    </b-row>

    <deck-builder
      v-model="showDeckBuilder"
      :deck="selectedDeck"
      @saved="onDeckSaved"
      @hidden="onDeckBuilderHidden"
    />

    <b-modal
      v-model="showDeleteConfirm"
      title="Delete Deck"
      @ok="deleteDeck"
    >
      <p class="mb-0">Are you sure you want to delete this deck?</p>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeckBuilder from './DeckBuilder.vue'

export default {
  name: 'DeckList',

  components: {
    DeckBuilder
  },

  data() {
    return {
      showDeckBuilder: false,
      showDeleteConfirm: false,
      selectedDeck: {
        name: '',
        description: '',
        deck_cards: []
      },
      deckToDelete: null
    }
  },

  computed: {
    ...mapGetters('deck', ['getDecks', 'isLoading']),

    decks() {
      return this.getDecks
    }
  },

  async created() {
    await this.loadDecks()
  },

  methods: {
    ...mapActions('deck', ['loadDecks', 'deleteDeck']),

    getMainCount(deck) {
      return deck.deck_cards?.filter(card => card.section === 'main')
        .reduce((sum, card) => sum + card.quantity, 0) || 0
    },

    getExtraCount(deck) {
      return deck.deck_cards?.filter(card => card.section === 'extra')
        .reduce((sum, card) => sum + card.quantity, 0) || 0
    },

    getSideCount(deck) {
      return deck.deck_cards?.filter(card => card.section === 'side')
        .reduce((sum, card) => sum + card.quantity, 0) || 0
    },

    editDeck(deck) {
      this.selectedDeck = deck || {
        name: '',
        description: '',
        deck_cards: []
      }
      this.showDeckBuilder = true
    },

    confirmDelete(deck) {
      this.deckToDelete = deck
      this.showDeleteConfirm = true
    },

    async onDeleteConfirmed() {
      if (this.deckToDelete) {
        try {
          await this.deleteDeck(this.deckToDelete.id)
          this.showDeleteConfirm = false
          this.deckToDelete = null
        } catch (error) {
          console.error('Error deleting deck:', error)
        }
      }
    },

    async onDeckSaved() {
      await this.loadDecks()
    },

    onDeckBuilderHidden() {
      this.selectedDeck = {
        name: '',
        description: '',
        deck_cards: []
      }
    }
  }
}
</script>

<style scoped>
.deck-stats {
  font-size: 0.9rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
}

.text-danger {
  color: #dc3545 !important;
}
</style>
