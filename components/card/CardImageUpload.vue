<template>
  <div class="card-image-upload">
    <b-row class="my-3">
      <b-col class="px-2">
        <div class="d-flex">
          <b-form-file
            v-model="selectedFile"
            :state="Boolean(selectedFile)"
            :placeholder="ui[uiLang].upload_image"
            browse="✚"
            accept="image/*"
            :drop-placeholder="ui[uiLang].drag_and_drop"
            class="flex-grow-1 mr-2"
            @input="handleFileInput"
          ></b-form-file>
          <b-button
            variant="info"
            @click="showDallEModal"
            class="ml-2"
          >
            {{ ui[uiLang].generate_image }}
          </b-button>
        </div>
      </b-col>
    </b-row>

    <!-- DALL-E Modal -->
    <DallEModal
      ref="dalleModal"
      @image-selected="handleDallEImage"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DallEModal from '../dalle/DallEModal.vue';

export default {
  name: 'CardImageUpload',

  components: {
    DallEModal
  },

  data() {
    return {
      selectedFile: null
    }
  },

  computed: {
    ...mapState({
      ui: state => state.card.ui,
      uiLang: state => state.card.uiLang
    })
  },

  methods: {
    async handleFileInput(file) {
      if (!file) return;
      
      try {
        this.selectedFile = file;
        await this.$cardImageService.handleLocalImage(file);
      } catch (error) {
        console.error('Error handling file input:', error);
        this.$store.dispatch('handleError', 'Error uploading image. Please try again.');
      }
    },

    async showDallEModal() {
      try {
        await this.$showModal('dalle-modal');
      } catch (error) {
        console.error('Error showing DallE modal:', error);
        this.$store.dispatch('handleError', 'Error opening AI image generator. Please try again.');
      }
    },

    async handleDallEImage({ file, generation }) {
      if (!file) return;
      
      try {
        this.selectedFile = file;
        await this.$cardImageService.handleDallEImage(file, generation);
        await this.$hideModal('dalle-modal');
      } catch (error) {
        console.error('Error handling DallE image:', error);
        this.$store.dispatch('handleError', 'Error processing AI generated image. Please try again.');
      }
    }
  }
}
</script>

<style scoped>
.custom-file-label::after {
  content: '✚' !important;
  background-color: #787878 !important;
  color: #FFF;
}
</style>
