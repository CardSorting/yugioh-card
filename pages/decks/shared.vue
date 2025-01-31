<template>
  <div class="shared-decks">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1>Shared Decks</h1>
          <b-tabs pills>
            <b-tab title="Shared with Me" active />
            <b-tab title="My Shares" />
          </b-tabs>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2">Loading decks...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-5">
        <font-awesome-icon
          :icon="['fas', 'exclamation-circle']"
          size="4x"
          class="mb-4 text-danger"
        />
        <h3>{{ error }}</h3>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasDecks" class="text-center py-5">
        <font-awesome-icon
          :icon="['fas', 'share-alt']"
          size="4x"
          class="mb-4 text-muted"
        />
        <h3>No Shared Decks</h3>
        <p class="text-muted">
          {{ emptyStateMessage }}
        </p>
      </div>

      <!-- Deck Grid -->
      <div v-else class="deck-grid">
        <b-card
          v-for="deck in displayedDecks"
          :key="deck.id"
          no-body
          class="deck-card"
        >
          <!-- Card Stats -->
          <div class="card-stats p-3">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="mb-1">{{ deck.name }}</h5>
                <p class="mb-0 text-muted">
                  {{ isMyShares ? `Shared with ${deck.shares.length} users` : `By ${deck.owner.username || deck.owner.email}` }}
                </p>
              </div>
              <b-badge
                :variant="deck.permission === 'edit' ? 'success' : 'info'"
              >
                {{ deck.permission }}
              </b-badge>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content p-3">
            <div class="deck-stats mb-3">
              <div class="stat-item">
                <span class="stat-label">Main:</span>
                <span class="stat-value">{{ getDeckCount(deck, 'main') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Extra:</span>
                <span class="stat-value">{{ getDeckCount(deck, 'extra') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Side:</span>
                <span class="stat-value">{{ getDeckCount(deck, 'side') }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
              <b-button
                variant="primary"
                size="sm"
                :to="`/deck/${deck.id}`"
              >
                View Deck
              </b-button>
              <b-button
                v-if="isMyShares"
                variant="outline-danger"
                size="sm"
                @click="unshareWithAll(deck)"
              >
                Unshare
              </b-button>
              <b-button
                v-else
                variant="outline-primary"
                size="sm"
                @click="copyDeck(deck)"
              >
                Copy
              </b-button>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SharedDecksPage',

  data() {
    return {
      activeTab: 0,
      error: null
    }
  },

  computed: {
    ...mapState('deck', ['sharedDecks', 'deckShares', 'isLoading']),

    isMyShares() {
      return this.activeTab === 1
    },

    displayedDecks() {
      return this.isMyShares ? this.deckShares : this.sharedDecks
    },

    hasDecks() {
      return this.displayedDecks.length > 0
    },

    emptyStateMessage() {
      return this.isMyShares
        ? 'You haven\'t shared any decks yet'
        : 'No decks have been shared with you'
    }
  },

  async created() {
    await this.loadDecks()
  },

  methods: {
    ...mapActions('deck', [
      'loadSharedDecks',
      'loadDeckShares',
      'createDeck',
      'unshareDeck'
    ]),

    async loadDecks() {
      try {
        if (this.isMyShares) {
          await this.loadDeckShares()
        } else {
          await this.loadSharedDecks()
        }
      } catch (error) {
        console.error('Error loading decks:', error)
        this.error = 'Failed to load decks'
      }
    },

    getDeckCount(deck, section) {
      return deck.deck_cards.filter(c => c.section === section).length
    },

    async copyDeck(deck) {
      try {
        const newDeck = await this.createDeck({
          name: `Copy of ${deck.name}`,
          description: deck.description,
          cards: deck.deck_cards.map(c => ({
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
    },

    async unshareWithAll(deck) {
      try {
        await Promise.all(
          deck.shares.map(share =>
            this.unshareDeck({
              deckId: deck.id,
              userId: share.user_id
            })
          )
        )

        this.$bvToast.toast('Deck unshared successfully', {
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
.shared-decks {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  background-color: #fff;
  padding: 2rem 0;
  border-bottom: 1px solid #dee2e6;
}

.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.deck-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.deck-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-stats {
  border-bottom: 1px solid #dee2e6;
}

.deck-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.stat-value {
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
