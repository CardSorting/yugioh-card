<template>
  <b-modal
    id="dalle-modal"
    :title="'Generate Image with AI'"
    size="lg"
    hide-footer
    centered
    @hidden="onHide"
    @show="onShow"
    ref="modal"
  >
    <DallEForm
      :loading="loading"
      @submit="onSubmit"
      @cancel="$bvModal.hide('dalle-modal')"
      ref="form"
    />

    <div v-if="error" class="alert alert-danger mt-3">
      <strong>Error:</strong> {{ error }}
      <div v-if="retryCount > 0" class="mt-2">
        <small>If the error persists, please try again or use a different prompt.</small>
      </div>
    </div>

    <DallEPreview
      v-if="generatedImage"
      :image-url="generatedImage"
      @select="selectImage"
    />
  </b-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { useAuth } from '~/composables/useAuth';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DallEForm from './DallEForm.vue';
import DallEPreview from './DallEPreview.vue';

export default {
  name: 'DallEModal',
  
  components: {
    DallEForm,
    DallEPreview
  },

  setup(props, { emit, root }) {
    const auth = useAuth();
    const retryCount = ref(0);
    const modal = ref(null);
    const form = ref(null);
    let showHandler = null;

    const generations = computed(() => root.$store.state.dalle.generations || []);
    const currentGeneration = computed(() => generations.value[0] || null);
    const generatedImage = computed(() => currentGeneration.value?.base64Data || null);

    onMounted(() => {
      // Listen for global show event
      showHandler = (modalId) => {
        if (modalId === 'dalle-modal' && modal.value) {
          modal.value.show();
        }
      };
      root.$on('bv::show::modal', showHandler);
    });

    onBeforeUnmount(() => {
      // Clean up event listeners
      if (showHandler) {
        root.$off('bv::show::modal', showHandler);
      }
    });

    return {
      auth,
      retryCount,
      modal,
      form,
      generations,
      currentGeneration,
      generatedImage
    };
  },

  computed: {
    ...mapState({
      loading: state => state.dalle.loading,
      error: state => state.dalle.error
    })
  },

  methods: {
    ...mapActions({
      generateImage: 'dalle/generateImage',
      markAsUsed: 'dalle/markAsUsed',
      fetchGenerations: 'dalle/fetchGenerations'
    }),

    async onShow() {
      console.log('DallE modal showing');
      this.retryCount = 0;
      
      if (!this.auth.isAuthenticated.value) {
        console.log('User not authenticated');
        this.$bvModal.hide('dalle-modal');
        this.$emit('auth-required');
        return;
      }

      try {
        // Load any unused generations
        await this.fetchGenerations({ unusedOnly: true, limit: 10 });
      } catch (error) {
        console.error('Error fetching generations:', error);
      }
      
      if (this.form) {
        this.$nextTick(() => {
          this.form.reset();
        });
      }
    },

    ...mapActions(['handleError']),
    
    async onSubmit(prompt) {
      if (!this.auth.isAuthenticated.value) {
        this.$bvModal.hide('dalle-modal');
        this.$emit('auth-required');
        return;
      }

      try {
        await this.generateImage(prompt);
        this.retryCount = 0;
      } catch (error) {
        console.error('Error in component:', error);
        if (error.message.includes('not authenticated')) {
          this.$bvModal.hide('dalle-modal');
          this.$emit('auth-required');
        } else {
          this.handleError(error);
          this.retryCount++;
        }
      }
    },

    async selectImage() {
      try {
        if (!this.currentGeneration) {
          throw new Error('No image generated');
        }

        // Process the image and emit it
        const file = await this.$dalleImageAdapter.processForCardMaker(
          this.currentGeneration,
          null // cardId will be set when the card is saved
        );
        
        this.$emit('image-selected', {
          file,
          generation: this.currentGeneration
        });
        
        await this.$bvModal.hide('dalle-modal');
      } catch (error) {
        console.error('Error processing image:', error);
        this.handleError('Error saving image. Please try again.');
      }
    },

    onHide() {
      if (this.loading) {
        return;
      }
      
      this.retryCount = 0;
      this.$store.dispatch('dalle/resetState');
      
      if (this.form) {
        this.$nextTick(() => {
          this.form.reset();
        });
      }
    }
  }
}
</script>

<style scoped>
.modal-body {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
