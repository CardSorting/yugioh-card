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
      error: state => state.dalle.error,
      generatedImage: state => state.dalle.generatedImage
    })
  },

  created() {
    // Initialize state
    this.resetState();
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
    // Clean up event listeners and state
    if (this.showHandler) {
      this.$root.$off('bv::show::modal', this.showHandler);
    }
    this.resetState();
  },

  methods: {
    ...mapActions({
      generateImage: 'dalle/generateImage',
      processGeneratedImage: 'dalle/processGeneratedImage',
      resetState: 'dalle/resetState'
    }),

    onShow() {
      console.log('DallE modal showing');
      this.resetState();
      this.retryCount = 0;
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.reset();
        });
      }
    },

    async onSubmit(prompt) {
      try {
        await this.generateImage(prompt);
        this.retryCount = 0;
      } catch (error) {
        console.error('Error in component:', error);
        this.retryCount++;
      }
    },

    async selectImage() {
      try {
        const file = await this.processGeneratedImage(this.generatedImage);
        this.$emit('image-selected', file);
        await this.$hideModal('dalle-modal');
      } catch (error) {
        console.error('Error processing image:', error);
        this.$bvToast.toast('Error saving image. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true
        });
      }
    },

    onHide() {
      if (this.loading) {
        return;
      }
      
      this.retryCount = 0;
      this.resetState();
      
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
