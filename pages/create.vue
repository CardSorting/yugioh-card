<template>
  <div id="app">
    <!-- Main Content -->
    <main class="container-fluid mt-5 mb-3 h-100 py-3 py-md-5 px-0 px-sm-5">
      <b-row class="h-100 justify-content-center align-content-center">
        <!-- Card Preview -->
        <b-col id="card-panel" cols="12" md="6" lg="4" class="mt-3 mt-sm-5 mt-md-0">
          <div :class="{'padding-transition': true, 'sticky-top': true, 'pt-5': pageScrolling > 10}">
            <div :class="{'padding-transition': true, 'pt-5': pageScrolling > 10}">
              <div class="panel-bg shadow p-3">
                <CardPreview ref="cardPreview" />
              </div>
            </div>
          </div>
        </b-col>

        <!-- Card Form -->
        <b-col id="data-panel" cols="12" md="6" lg="8" class="mt-3 mt-sm-5 mt-md-0">
          <CardForm 
            @generate="generateCard"
            @download="downloadCard"
          />
        </b-col>
      </b-row>
    </main>

    <!-- Footer -->
    <footer class="container-fluid mb-5 px-0 px-md-5">
      <b-row class="justify-content-center align-content-center">
        <b-col id="footer-panel" cols="12">
          <div class="card-body text-center">
            Linziyou <a
              class="text-decoration-none"
              href="https://github.com/linziyou0601/yugioh-card-maker"
              data-size="large"
              aria-label="Star linziyou0601/yugioh-card-maker on GitHub"
            >
              <font-awesome-icon :icon="['fab', 'github']" /> GitHub
            </a>
          </div>
        </b-col>
      </b-row>
    </footer>

    <LoadingDialog />
    <ErrorDisplay />
    <auth-modal v-model="showAuthModal" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import CardPreview from '~/components/card/CardPreview.vue'
import CardForm from '~/components/card/CardForm.vue'
import ErrorDisplay from '~/components/ErrorDisplay.vue'
import UserMenu from '~/components/auth/UserMenu.vue'
import AuthModal from '~/components/auth/AuthModal.vue'
import CardManager from '~/services/cardManager'

export default {
  middleware: 'auth',
  components: {
    CardPreview,
    CardForm,
    ErrorDisplay,
    UserMenu,
    AuthModal
  },

  data() {
    return {
      pageScrolling: 0,
      isInitialized: false,
      cardManager: new CardManager(),
      showAuthModal: false
    }
  },

  computed: {
    ...mapState({
      cardState: state => state.card
    }),
    ...mapGetters('auth', ['isAuthenticated', 'currentUser'])
  },

  watch: {
    cardState: {
      deep: true,
      handler() {
        this.drawCard()
      }
    }
  },

  async created() {
    await this.resetToDefault()
  },

  async mounted() {
    window.addEventListener('scroll', this.onScroll)
    await this.$nextTick()
    if (!this.isInitialized) {
      await this.initializeCard()
      this.isInitialized = true
    }
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },

  methods: {
    ...mapMutations(['fireLoadingDialog', 'closeLoadingDialog', 'clearError']),
    ...mapActions({
      resetToDefault: 'card/resetToDefault',
      handleError: 'handleError'
    }),

    async initializeCard() {
      this.fireLoadingDialog()
      this.clearError()
      try {
        console.log('Initializing card in create.vue')
        const canvas = this.$refs.cardPreview?.getCanvas()
        console.log('Got canvas from CardPreview:', canvas ? 'Canvas found' : 'Canvas not found')
        
        if (!canvas) {
          throw new Error('Canvas not found in CardPreview')
        }

        await this.cardManager.initialize(canvas)
        console.log('CardManager initialized')
        
        // Wait for next tick to ensure DOM is updated
        await this.$nextTick()
        await this.drawCard()
        console.log('Initial card draw completed')
      } catch (error) {
        this.handleError(error)
        console.error('Failed to initialize card:', error)
      } finally {
        this.closeLoadingDialog()
      }
    },

    generateCard() {
      this.fireLoadingDialog()
      this.clearError()
      this.drawCard()
    },

    async drawCard() {
      if (!this.isInitialized) {
        console.log('Skipping drawCard - not initialized')
        return;
      }

      if (!this.cardState) {
        console.error('Card state is null')
        return;
      }

      if (!this.$refs.cardPreview?.getCanvas()) {
        console.error('Canvas not found in CardPreview')
        return;
      }
      
      try {
        console.log('Drawing card with state:', {
          cardLang: this.cardState.cardLang,
          cardType: this.cardState.cardType,
          cardSubtype: this.cardState.cardSubtype,
          hasCardMeta: !!this.cardState.cardMeta
        })
        await this.cardManager.generateCard(this.cardState)
        console.log('Card generation completed')
      } catch (error) {
        this.handleError(error)
      } finally {
        this.closeLoadingDialog()
      }
    },

    downloadCard() {
      try {
        const canvas = this.$refs.cardPreview.getCanvas()
        this.cardManager.downloadCard(canvas)
      } catch (error) {
        this.handleError(error)
      }
    },

    onScroll() {
      this.pageScrolling = window.pageYOffset || document.documentElement.scrollTop
    }
  }
}
</script>

<style>
/* font converted using font-converter.net. thank you! */
.preloadfont {
  font-family: YourFont;
  opacity: 0;
  height: 0;
  width: 0;
  display: inline-block;
}

:root {
  --chevron-down-svg-path: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%23CCC' d='M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z'%3E%3C/path%3E%3C/svg%3E")
}

body {
  font-family: 'Noto Sans JP', 'Noto Sans TC', 'Noto Sans SC', 'arial', "微軟正黑體";
}

.panel-bg {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #2c3e50;
}

/* Card Preview Transitions */
.padding-transition {
  transition: all .5s linear;
}
</style>
