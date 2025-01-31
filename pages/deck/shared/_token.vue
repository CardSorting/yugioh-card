<template>
  <div class="shared-deck">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <b-spinner variant="primary" />
      <p class="mt-2">Loading deck...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon
        :icon="['fas', 'exclamation-circle']"
        size="4x"
        class="mb-4 text-danger"
      />
      <h2>{{ error }}</h2>
      <div class="mt-4">
        <b-button
          variant="primary"
          to="/decks"
          class="mr-3"
        >
          My Decks
        </b-button>
        <b-button
          variant="outline-secondary"
          to="/"
        >
          Home
        </b-button>
      </div>
    </div>

    <!-- Deck View -->
    <template v-else>
      <!-- Deck Header -->
      <div class="deck-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="mb-0">{{ deck.name }}</h1>
              <p class="text-muted mb-0">
                Created by {{ deck.owner.username || deck.owner.email }}
              </p>
            </div>
            <div>
              <b-button
                v-if="isAuthenticated"
                variant="primary"
                @click="copyDeck"
              >
                <font-awesome-icon :icon="['fas', 'copy']" class="mr-2" />
                Copy to My Decks
              </b-button>
              <b-button
                v-else
                variant="primary"
                to="/login"
              >
                Sign in to Copy
              </b-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Deck Content -->
      <div class="container mt-4">
        <div class="row">
          <!-- Deck Stats -->
          <div class="col-md-4">
            <div class="stats-card">
              <h4>Deck Stats</h4>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">Main Deck:</span>
                  <span class="stat-value">{{ mainDeckCount }} cards</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Extra Deck:</span>
                  <span class="stat-value">{{ extraDeckCount }} cards</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Side Deck:</span>
                  <span class="stat-value">{{ sideDeckCount }} cards</span>
                </div>
              </div>

              <!-- Card Type Distribution -->
              <h5 class="mt-4">Card Types</h5>
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
              <h5 class="mt-4">Level/Rank Distribution</h5>
              <deck-curve :cards="mainDeckCards" />
            </div>
          </div>

          <!-- Deck Sections -->
          <div class="col-md-8">
            <!-- Main Deck -->
            <div class="deck-section">
              <h4>Main Deck ({{ mainDeckCount }})</h4>
              <div class="card-grid">
                <base-card-item
                  v-for="card in mainDeckCards"
                  :key="card.id"
                  :card="card"
                  :show-count="true"
                  @hover="onCardHover"
                />
              </div>
            </div>

            <!-- Extra Deck -->
            <div v-if="extraDeckCards.length > 0" class="deck-section mt-4">
              <h4>Extra Deck ({{ extraDeckCount }})</h4>
              <div class="card-grid">
                <base-card-item
                  v-for="card in extraDeckCards"
                  :key="card.id"
                  :card="card"
                  :show-count="true"
                  @hover="onCardHover"
                />
              </div>
            </div>

            <!-- Side Deck -->
            <div v-if="sideDeckCards.length > 0" class="deck-section mt-4">
              <h4>Side Deck ({{ sideDeckCount }})</h4>
              <div class="card-grid">
                <base-card-item
                  v-for="card in sideDeckCards"
                  :key="card.id"
                  :card="card"
                  :show-count="true"
                  @hover="onCardHover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Preview -->
      <card-preview-float
        :card="previewCard"
        :position="mousePosition"
      />
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BaseCardItem from '~/components/deck/base/BaseCardItem.vue'
import DeckCurve from '~/components/deck/DeckCurve.vue'
import CardPreviewFloat from '~/components/deck/CardPreviewFloat.vue'

export default {
  name: 'SharedDeckPage',

  components: {
    BaseCardItem,
    DeckCurve,
    CardPreviewFloat
  },

  data() {
    return {
      deck: null,
      error: null,
      isLoading: true,
      previewCard: null,
      mousePosition: { x: 0, y: 0 }
    }
  },

  computed: {
    ...mapState('auth', ['isAuthenticated']),

    mainDeckCards() {
      return this.deck?.deck_cards?.filter(c => c.section === 'main') || []
    },

    extraDeckCards() {
      return this.deck?.deck_cards?.filter(c => c.section === 'extra') || []
    },

    sideDeckCards() {
      return this.deck?.deck_cards?.filter(c => c.section === 'side') || []
    },

    mainDeckCount() {
      return this.mainDeckCards.length
    },

    extraDeckCount() {
      return this.extraDeckCards.length
    },

    sideDeckCount() {
      return this.sideDeckCards.length
    },

    totalCards() {
      return this.mainDeckCount + this.extraDeckCount + this.sideDeckCount
    },

    monsterCount() {
      return this.countCardsByType('Monster')
    },

    spellCount() {
      return this.countCardsByType('Spell')
    },

    trapCount() {
      return this.countCardsByType('Trap')
    }
  },

  async created() {
    await this.loadDeck()
  },

  methods: {
    ...mapActions('deck', ['createDeck']),

    async loadDeck() {
      try {
        const deck = await this.$deckServices.sharing.getDeckByShareToken(this.$route.params.token)
        if (!deck) {
          this.error = 'This share link is invalid or has expired'
          return
        }
        this.deck = deck
      } catch (error) {
        console.error('Error loading shared deck:', error)
        this.error = 'Failed to load deck'
      } finally {
        this.isLoading = false
      }
    },

    countCardsByType(type) {
      return this.deck?.deck_cards?.filter(c => 
        c.card.card_data.type.includes(type)
      ).length || 0
    },

    onCardHover({ card, isEnter }) {
      this.previewCard = isEnter ? card : null
    },

    async copyDeck() {
      try {
        const newDeck = await this.createDeck({
          name: `Copy of ${this.deck.name}`,
          description: this.deck.description,
          cards: this.deck.deck_cards.map(c => ({
            cardId: c.card.id,
            section: c.section
          }))
        })

        this.$router.push(`/deck/${newDeck.id}`)
        this.$bvToast.toast('Deck copied successfully', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    }
  }
}
</script>

<style scoped>
.shared-deck {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.deck-header {
  background-color: #fff;
  padding: 2rem 0;
  border-bottom: 1px solid #dee2e6;
}

.loading-state,
.error-state {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stats-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-list {
  margin-top: 1rem;
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
  font-weight: 500;
}

.type-progress {
  height: 6px;
  border-radius: 3px;
}

.deck-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
</style>
