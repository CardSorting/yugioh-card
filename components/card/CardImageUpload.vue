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
import { mapState, mapMutations } from 'vuex';
import DallEModal from '../dalle/DallEModal.vue';
import supabaseStorageService from '../../services/storage/supabaseService';

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
    ...mapMutations('card', ['SET_CARD_IMAGE']),

    async handleFileInput(file) {
      if (file) {
        try {
          // Upload to Supabase and get permanent URL
          const uniqueFilename = supabaseStorageService.generateUniqueFilename(file.name);
          const publicUrl = await supabaseStorageService.uploadFile(file, uniqueFilename);
          
          // Create a new File object with the public URL
          const response = await fetch(publicUrl);
          const blob = await response.blob();
          const newFile = new File([blob], file.name, { type: file.type });
          this.selectedFile = newFile;
          this.SET_CARD_IMAGE(newFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          this.$bvToast.toast('Error uploading image. Please try again.', {
            title: 'Error',
            variant: 'danger',
            solid: true
          });
        }
      }
    },

    async showDallEModal() {
      try {
        await this.$showModal('dalle-modal');
      } catch (error) {
        console.error('Error showing DallE modal:', error);
        this.$bvToast?.toast('Error opening AI image generator. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true
        });
      }
    },

    async handleDallEImage(file) {
      if (!file) return;
      
      try {
        this.selectedFile = file;
        this.SET_CARD_IMAGE(file);
        await this.$hideModal('dalle-modal');
      } catch (error) {
        console.error('Error handling DallE image:', error);
        this.$bvToast?.toast('Error processing AI generated image. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true
        });
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
