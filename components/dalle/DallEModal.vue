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
import { mapState, mapActions, mapGetters } from 'vuex';
import DallEForm from './DallEForm.vue';
import DallEPreview from './DallEPreview.vue';

export default {
  name: 'DallEModal',
  
  components: {
    DallEForm,
    DallEPreview
  },

  data() {
    return {
      retryCount: 0
    }
  },

  computed: {
    ...mapState({
      loading: state => state.dalle.loading,
      error: state => state.dalle.error
    }),
    ...mapState('dalle', ['generations']),
    ...mapGetters('dalle', ['unusedGenerations']),
    currentGeneration() {
      return this.generations?.[0] || null;
    },
    generatedImage() {
      return this.currentGeneration?.base64Data || null;
    }
  },

  mounted() {
    // Listen for global show event
    this.showHandler = (modalId) => {
      if (modalId === 'dalle-modal' && this.$refs.modal) {
        this.$refs.modal.show();
      }
    };
    this.$root.$on('bv::show::modal', this.showHandler);
  },

  beforeDestroy() {
    // Clean up event listeners
    if (this.showHandler) {
      this.$root.$off('bv::show::modal', this.showHandler);
    }
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
      
      try {
        // Load any unused generations
        await this.fetchGenerations({ unusedOnly: true, limit: 10 });
      } catch (error) {
        console.error('Error fetching generations:', error);
      }
      
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.reset();
        });
      }
    },

    ...mapActions(['handleError']),
    
    async onSubmit(prompt) {
      try {
        await this.generateImage(prompt);
        this.retryCount = 0;
      } catch (error) {
        console.error('Error in component:', error);
        this.handleError(error);
        this.retryCount++;
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
      
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.reset();
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
