<template>
  <b-form @submit.prevent="onSubmit">
    <b-form-group label="Upload an image or enter a prompt directly">
      <div 
        class="drop-zone mb-3" 
        @dragover.prevent 
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
        :class="{ 'is-dragover': isDragover }"
        @dragenter.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
      >
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          class="d-none"
          @change="handleFileSelect" 
        >
        <div v-if="!selectedImage" class="drop-zone-content">
          <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i>
          <p class="mb-0">Drag & drop an image here or click to select</p>
          <small class="text-muted">Supported formats: PNG, JPEG, WEBP, GIF</small>
        </div>
        <img v-else :src="selectedImage" class="preview-image">
      </div>
    </b-form-group>

    <b-form-group
      label="Image Description / Generation Prompt"
      label-for="prompt-input"
    >
      <b-form-textarea
        id="prompt-input"
        v-model="localPrompt"
        :placeholder="analyzing ? 'Analyzing image...' : 'Enter a detailed description or upload an image above...'"
        rows="3"
        :disabled="loading || analyzing"
        required
      ></b-form-textarea>
    </b-form-group>

    <div class="text-center my-3">
      <b-button
        type="submit"
        variant="primary"
        :disabled="loading || analyzing || !localPrompt.trim()"
        class="mr-2"
      >
        <b-spinner small v-if="loading"></b-spinner>
        {{ loading ? 'Generating...' : 'Generate' }}
      </b-button>
      <b-button 
        variant="secondary" 
        @click="handleClear" 
        :disabled="loading || analyzing"
        class="mr-2"
      >
        Clear
      </b-button>
      <b-button 
        variant="outline-secondary" 
        @click="$emit('cancel')" 
        :disabled="loading || analyzing"
      >
        Cancel
      </b-button>
    </div>
  </b-form>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'DallEForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      localPrompt: '',
      isDragover: false
    }
  },

  computed: {
    ...mapState({
      analyzing: state => state.dalle.analyzing,
      imageDescription: state => state.dalle.imageDescription,
      selectedImage: state => state.dalle.uploadedImage
    })
  },

  methods: {
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        await this.processImage(file);
      }
    },

    async handleDrop(event) {
      this.isDragover = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        await this.processImage(file);
      }
    },

    ...mapActions({
      analyzeImage: 'dalle/analyzeImage',
      resetDalleState: 'dalle/resetState'
    }),

    async processImage(file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const description = await this.analyzeImage(e.target.result);
            this.localPrompt = description;
          } catch (error) {
            console.error('Error analyzing image:', error);
            this.$bvToast.toast('Error analyzing image. Please try again or enter description manually.', {
              title: 'Error',
              variant: 'danger',
              solid: true
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    },

    onSubmit() {
      this.$emit('submit', this.localPrompt);
    },

    handleClear() {
      this.localPrompt = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.resetDalleState();
    },

    reset() {
      this.handleClear();
    }
  }
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #666;
}

.drop-zone.is-dragover {
  background-color: rgba(0, 123, 255, 0.1);
  border-color: #007bff;
}

.drop-zone-content {
  color: #666;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}
</style>
