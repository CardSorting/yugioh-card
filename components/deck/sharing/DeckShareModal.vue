<template>
  <b-modal
    v-model="isVisible"
    title="Share Deck"
    size="lg"
    @hidden="onHide"
  >
    <div class="share-modal">
      <!-- Share with Users -->
      <div class="share-section">
        <h5>Share with Users</h5>
        <b-form-group>
          <b-form-input
            v-model="userEmail"
            placeholder="Enter user email"
            :state="isValidEmail"
            @keyup.enter="shareWithUser"
          />
          <template #invalid-feedback>
            Please enter a valid email address
          </template>
        </b-form-group>

        <div class="d-flex align-items-center mb-3">
          <b-form-select
            v-model="sharePermission"
            :options="permissionOptions"
            size="sm"
            class="w-auto mr-2"
          />
          <b-button
            variant="primary"
            size="sm"
            :disabled="!isValidEmail"
            @click="shareWithUser"
          >
            Share
          </b-button>
        </div>

        <!-- Shared Users List -->
        <div v-if="deckShares.length > 0" class="shared-users mt-3">
          <div
            v-for="share in deckShares"
            :key="share.id"
            class="shared-user d-flex align-items-center justify-content-between p-2"
          >
            <div>
              <span class="user-email">{{ share.user.email }}</span>
              <b-badge
                :variant="share.permission === 'edit' ? 'success' : 'info'"
                class="ml-2"
              >
                {{ share.permission }}
              </b-badge>
            </div>
            <b-button
              variant="outline-danger"
              size="sm"
              @click="unshareWithUser(share.user.id)"
            >
              Remove
            </b-button>
          </div>
        </div>
      </div>

      <!-- Share Links -->
      <div class="share-section mt-4">
        <h5>Share Links</h5>
        <div class="d-flex align-items-center mb-3">
          <b-form-datepicker
            v-model="expirationDate"
            :min="minDate"
            placeholder="No expiration"
            size="sm"
            class="w-auto mr-2"
          />
          <b-button
            variant="primary"
            size="sm"
            @click="createLink"
          >
            Create Link
          </b-button>
        </div>

        <!-- Share Links List -->
        <div v-if="shareLinks.length > 0" class="share-links mt-3">
          <div
            v-for="link in shareLinks"
            :key="link.id"
            class="share-link d-flex align-items-center justify-content-between p-2"
          >
            <div class="d-flex flex-column">
              <div class="d-flex align-items-center">
                <b-form-input
                  :value="getShareUrl(link.token)"
                  readonly
                  size="sm"
                  class="share-url mr-2"
                />
                <b-button
                  variant="outline-primary"
                  size="sm"
                  @click="copyLink(link.token)"
                >
                  Copy
                </b-button>
              </div>
              <small v-if="link.expires_at" class="text-muted">
                Expires: {{ formatDate(link.expires_at) }}
              </small>
            </div>
            <b-button
              variant="outline-danger"
              size="sm"
              @click="deleteLink(link.token)"
            >
              Delete
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <template #modal-footer>
      <b-button
        variant="secondary"
        @click="isVisible = false"
      >
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { format } from 'date-fns'

export default {
  name: 'DeckShareModal',

  props: {
    /**
     * Whether modal is visible
     */
    value: {
      type: Boolean,
      default: false
    },

    /**
     * Deck ID
     */
    deckId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      userEmail: '',
      sharePermission: 'view',
      expirationDate: null,
      permissionOptions: [
        { value: 'view', text: 'Can view' },
        { value: 'edit', text: 'Can edit' }
      ]
    }
  },

  computed: {
    ...mapState('deck', ['deckShares', 'shareLinks']),

    isVisible: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },

    isValidEmail() {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userEmail)
    },

    minDate() {
      return new Date().toISOString().split('T')[0]
    }
  },

  watch: {
    isVisible(visible) {
      if (visible) {
        this.loadShares()
      }
    }
  },

  methods: {
    ...mapActions('deck', [
      'loadDeckShares',
      'shareDeck',
      'unshareDeck',
      'createShareLink',
      'deleteShareLink'
    ]),

    async loadShares() {
      if (!this.deckId) return
      
      try {
        await this.loadDeckShares(this.deckId)
      } catch (error) {
        this.$bvToast.toast(error.message, {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async shareWithUser() {
      if (!this.isValidEmail || !this.deckId) return

      try {
        const user = await this.$deckService.getUserByEmail(this.userEmail)
        if (!user) {
          this.$bvToast.toast('User not found', {
            title: 'Error',
            variant: 'danger'
          })
          return
        }

        await this.shareDeck({
          deckId: this.deckId,
          userId: user.id,
          permission: this.sharePermission
        })

        this.userEmail = ''
        this.$bvToast.toast('Deck shared successfully', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        console.error('Share error:', error)
        this.$bvToast.toast(error.message || 'Failed to share deck', {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async unshareWithUser(userId) {
      if (!this.deckId) return

      try {
        await this.unshareDeck({
          deckId: this.deckId,
          userId
        })

        this.$bvToast.toast('Share removed successfully', {
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

    async createLink() {
      if (!this.deckId) return
      
      try {
        await this.createShareLink({
          deckId: this.deckId,
          expiresAt: this.expirationDate ? new Date(this.expirationDate).toISOString() : null
        })

        this.expirationDate = null
        this.$bvToast.toast('Share link created successfully', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        console.error('Create link error:', error)
        this.$bvToast.toast(error.message || 'Failed to create share link', {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    async deleteLink(token) {
      try {
        await this.deleteShareLink(token)
        this.$bvToast.toast('Share link deleted successfully', {
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

    getShareUrl(token) {
      return `${window.location.origin}/deck/shared/${token}`
    },

    async copyLink(token) {
      try {
        await navigator.clipboard.writeText(this.getShareUrl(token))
        this.$bvToast.toast('Link copied to clipboard', {
          title: 'Success',
          variant: 'success'
        })
      } catch (error) {
        this.$bvToast.toast('Failed to copy link', {
          title: 'Error',
          variant: 'danger'
        })
      }
    },

    formatDate(date) {
      return format(new Date(date), 'MMM d, yyyy')
    },

    onHide() {
      this.userEmail = ''
      this.sharePermission = 'view'
      this.expirationDate = null
    }
  }
}
</script>

<style scoped>
.share-section {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.shared-users,
.share-links {
  max-height: 200px;
  overflow-y: auto;
}

.shared-user,
.share-link {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.user-email {
  font-weight: 500;
}

.share-url {
  width: 300px;
  font-family: monospace;
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
