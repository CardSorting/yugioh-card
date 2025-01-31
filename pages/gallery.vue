<template>
  <div class="gallery-page">
    <main class="container mt-5 pt-5">
      <div v-if="isAuthenticated">
        <h1 class="mb-4">My Card Gallery</h1>
        
        <div v-if="loading" class="text-center py-5">
          <b-spinner label="Loading..."></b-spinner>
        </div>

        <div v-else-if="cards.length === 0" class="text-center py-5">
          <p>You haven't created any cards yet.</p>
          <b-button to="/create" variant="primary">Create Your First Card</b-button>
        </div>

        <div v-else class="gallery-grid">
          <div 
            v-for="card in cards" 
            :key="card.id" 
            class="gallery-item"
          >
            <div 
              class="card-item"
              :class="{ 'highlight': card.id === highlightedCardId }"
            >
              <img :src="card.image_url" class="card-preview" :alt="card.name">
              <div class="card-actions">
                <div class="button-group">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <p>Please login to view your gallery.</p>
        <b-button variant="primary" @click="showAuthModal = true">Login</b-button>
      </div>
    </main>

    <auth-modal v-model="showAuthModal" @auth-success="onAuthSuccess" />

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete Card"
      @ok="deleteCard"
      ok-variant="danger"
      ok-title="Delete"
    >
      <p class="my-4">Are you sure you want to delete this card?</p>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AuthModal from '~/components/auth/AuthModal.vue'
import UserMenu from '~/components/auth/UserMenu.vue'
import { supabase } from '~/config/supabase'

export default {
  name: 'GalleryPage',

  components: {
    AuthModal,
    UserMenu
  },

  middleware: 'auth',

  data() {
    return {
      showAuthModal: false,
      showDeleteModal: false,
      cards: [],
      loading: true,
      selectedCard: null,
      highlightedCardId: null
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    
    highlightCard() {
      return this.$route.query.highlight
    }
  },

  watch: {
    highlightCard: {
      immediate: true,
      handler(newId) {
        if (newId) {
          // Reset any existing highlights
          this.highlightedCardId = null
          
          // Set highlight after a brief delay to ensure DOM is ready
          setTimeout(() => {
            this.highlightedCardId = newId
            
            // Wait for the next tick to ensure the DOM is updated
            this.$nextTick(() => {
              // Find and scroll to the highlighted card
              const highlightedCard = document.querySelector('.card-item.highlight')
              if (highlightedCard) {
                highlightedCard.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center'
                })
              }
            })
            
            // Remove highlight after animation completes
            setTimeout(() => {
              this.highlightedCardId = null
            }, 3000)
          }, 100)
        }
      }
    }
  },

  async mounted() {
    if (this.isAuthenticated) {
      await this.loadCards()
    }
  },

  methods: {
    async loadCards() {
      try {
        this.loading = true
        const { data, error } = await supabase
          .from('saved_cards')
          .select('*')
          .eq('user_id', this.currentUser.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        this.cards = data
      } catch (error) {
        console.error('Error loading cards:', error)
      } finally {
        this.loading = false
      }
    },

    editCard(card) {
      this.$store.commit('card/SET_STATE', card.card_data)
      this.$router.push('/create')
    },

    confirmDelete(card) {
      this.selectedCard = card
      this.showDeleteModal = true
    },

    async deleteCard() {
      if (!this.selectedCard) return

      try {
        const { error } = await supabase
          .from('saved_cards')
          .delete()
          .eq('id', this.selectedCard.id)
          .eq('user_id', this.currentUser.id)

        if (error) throw error

        const { error: storageError } = await supabase.storage
          .from('card-images')
          .remove([`${this.currentUser.id}/${this.selectedCard.id}.jpg`])

        if (storageError) console.error('Storage cleanup error:', storageError)

        await this.loadCards()
      } catch (error) {
        console.error('Error deleting card:', error)
      }
    },

    onAuthSuccess() {
      this.loadCards()
    }
  }
}
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #2c3e50;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.gallery-item {
  perspective: 1000px;
}

.card-item {
  display: block;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  background-color: #ffffff;
  transform-origin: center;
  will-change: transform;
}

.card-item:hover {
  transform: translateY(-5px);
}

.card-item.highlight {
  animation: highlightCard 3s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 10;
}

.card-item.highlight::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, 
    rgba(52, 152, 219, 0.5), 
    rgba(255, 215, 0, 0.5), 
    rgba(52, 152, 219, 0.5));
  z-index: -1;
  filter: blur(15px);
  opacity: 0;
  animation: glowPulse 3s ease-out;
}

@keyframes glowPulse {
  0% { opacity: 0; }
  30% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes highlightCard {
  0% {
    transform: translateX(30px) rotateY(10deg) scale(0.95);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  30% {
    transform: translateX(0) rotateY(0) scale(1.05);
    box-shadow: 0 0 40px rgba(52, 152, 219, 0.8);
  }
  45% {
    transform: scale(1.02);
    box-shadow: 0 0 35px rgba(255, 215, 0, 0.7);
  }
  65% {
    transform: scale(1.01);
    box-shadow: 0 0 30px rgba(52, 152, 219, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

/* Blur effect for surrounding cards */
.card-item.highlight ~ .gallery-item .card-item {
  filter: blur(2px) brightness(0.95);
  transition: all 0.3s ease;
}

.card-preview {
  width: 100%;
  height: auto;
  display: block;
}

.card-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-top: 1px solid #e5e5e5;
}

.card-item:hover .card-actions {
  opacity: 1;
}
</style>
