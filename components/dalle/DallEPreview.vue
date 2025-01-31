<template>
  <div v-if="imageUrl" class="dalle-preview mt-3">
    <img
      :src="imageUrl"
      class="img-fluid mb-3"
      alt="Generated image"
      @error="handleImageError"
    />
    <div class="text-center">
      <b-button 
        variant="success" 
        @click="$emit('select')" 
        :disabled="hasError"
      >
        Use This Image
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DallEPreview',

  props: {
    imageUrl: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      hasError: false
    }
  },

  watch: {
    imageUrl() {
      // Reset error state when image URL changes
      this.hasError = false;
    }
  },

  methods: {
    handleImageError() {
      this.hasError = true;
      this.$bvToast.toast('Error loading generated image. Please try again.', {
        title: 'Error',
        variant: 'danger',
        solid: true
      });
    }
  }
}
</script>

<style scoped>
.img-fluid {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
