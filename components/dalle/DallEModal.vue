<template>
  <b-modal
    id="dalle-modal"
    :title="'Generate Image with AI'"
    size="lg"
    hide-footer
    centered
    @hidden="onHide"
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

  methods: {
    ...mapActions({
      generateImage: 'dalle/generateImage',
      processGeneratedImage: 'dalle/processGeneratedImage',
      resetState: 'dalle/resetState'
    }),

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
        this.$bvModal.hide('dalle-modal');
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
      if (!this.loading) {
        if (this.$refs.form) {
          this.$refs.form.reset();
        }
        this.retryCount = 0;
        this.resetState();
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
