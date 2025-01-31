<template>
  <div class="card-form panel-bg shadow p-3">
    <div class="card-body">
      <!-- Language Selection -->
      <b-row class="mb-3">
        <b-col class="px-2">
          <label>{{ ui[uiLang].ui_lang }}</label>
          <b-form-select 
            v-model="selectedUiLang" 
            :options="uiLangOpts"
          ></b-form-select>
        </b-col>
      </b-row>

      <!-- Card Settings -->
      <b-row class="mb-3">
        <b-col cols="6" lg="3" class="px-2">
          <label>{{ ui[uiLang].card_lang }}</label>
          <b-form-select 
            v-model="selectedCardLang" 
            :options="cardLangOpts"
          ></b-form-select>
        </b-col>
        <b-col cols="6" lg="3" class="px-2">
          <div class="form-check px-0">
            <label>{{ ui[uiLang].square_foil_stamp }}</label>
            <b-form-checkbox 
              v-model="holoEnabled" 
              :class="{'checkbox-wrap': true, 'active': holoEnabled}" 
              button
            >{{ holoEnabled ? ui[uiLang].on : ui[uiLang].off }}</b-form-checkbox>
          </div>
        </b-col>
        <b-col cols="6" lg="3" class="px-2">
          <label>{{ ui[uiLang].rarity }}</label>
          <b-form-select 
            v-model="selectedRarity" 
            :options="rarityOpts"
          ></b-form-select>
        </b-col>
        <b-col cols="6" lg="3" class="px-2">
          <label>{{ ui[uiLang].title_color }}</label>
          <b-form-input 
            :value="cardTitleColor"
            type="color"
            @input="updateTitleColor"
          ></b-form-input>
        </b-col>
      </b-row>

      <!-- Card ID -->
      <b-row class="my-3">
        <b-col cols="6" lg="4" class="px-2">
          <div class="form-check px-0">
            <label>{{ ui[uiLang].card_secret }}</label>
            <b-form-checkbox 
              v-model="autoFillEnabled" 
              :class="{'checkbox-wrap': true, 'active': autoFillEnabled}" 
              button
            >{{ ui[uiLang].auto_fill_card_data }}</b-form-checkbox>
          </div>
        </b-col>
        <b-col cols="6" lg="8" class="px-2">
          <label><small>{{ ui[uiLang].card_secret_note }}</small></label>
          <b-form-input 
            v-model="cardKeyValue" 
            type="number" 
            maxlength="8" 
            :placeholder="ui[uiLang].plz_input_card_secret"
          />
        </b-col>
      </b-row>

      <!-- Card Name -->
      <b-row class="my-3">
        <b-col class="px-2">
          <label>{{ ui[uiLang].card_name }}</label>
          <b-form-input v-model="cardName"></b-form-input>
        </b-col>
      </b-row>

      <!-- Image Upload -->
      <CardImageUpload />

      <!-- Card Attributes -->
      <CardAttributes />

      <!-- Card Stats -->
      <CardStats />
      
      <!-- Action Buttons -->
      <b-row class="my-3">
        <b-col class="px-2">
          <button 
            type="button" 
            class="my-2 btn btn-info" 
            @click="generateCard"
          >{{ ui[uiLang].generate }}</button>&emsp;
          
          <button 
            type="button" 
            class="my-2 btn btn-success" 
            @click="downloadCard"
          >{{ ui[uiLang].download }}</button>

          <button 
            ref="saveButton"
            v-if="isAuthenticated"
            type="button" 
            class="my-2 btn btn-primary ml-2"
            :disabled="isSaving"
            @click="saveCard"
          >{{ isSaving ? 'Saving...' : 'Save to Gallery' }}</button>
          
          <label style="color: #CCC;">&emsp;{{ ui[uiLang].auto_gen_note }}</label>
        </b-col>
        <b-col cols="6" class="px-2 text-right">
          <button 
            type="button" 
            class="my-2 btn btn-danger" 
            @click="resetToDefault"
          >{{ ui[uiLang].reset_to_default }}</button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CardImageUpload from './CardImageUpload.vue'
import CardAttributes from './CardAttributes.vue'
import CardStats from './CardStats.vue'
import FormStateService from '~/services/formStateService'
import FormEventService from '~/services/formEventService'
import CardStorageService from '~/services/cardStorageService'
import { soundManager } from '~/utils/sounds'

export default {
  name: 'CardForm',

  components: {
    CardImageUpload,
    CardAttributes,
    CardStats
  },

  data() {
    return {
      formState: new FormStateService(this.$store),
      formEvents: null,
      isSaving: false
    }
  },

  created() {
    this.formEvents = new FormEventService(this.formState, this.$emit.bind(this))
    soundManager.preload()
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated']),

    ui() {
      return this.$store.state.card.ui
    },

    uiLang() {
      return this.formState.getUiLang()
    },

    cardTitleColor() {
      return this.formState.getTitleColor()
    },

    selectedUiLang: {
      get() { return this.formState.getUiLang() },
      set(value) { this.formEvents.handleUiLangChange(value) }
    },

    selectedCardLang: {
      get() { return this.formState.getCardLang() },
      set(value) { this.formEvents.handleCardLangChange(value) }
    },

    holoEnabled: {
      get() { return this.formState.getHolo() },
      set(value) { this.formEvents.handleHoloChange(value) }
    },

    selectedRarity: {
      get() { return this.formState.getCardRare() },
      set(value) { this.formEvents.handleRarityChange(value) }
    },

    autoFillEnabled: {
      get() { return this.formState.getAutoFillEnabled() },
      set(value) { this.formEvents.handleAutoFillChange(value) }
    },

    cardKeyValue: {
      get() { return this.formState.getCardKey() },
      set(value) { this.formEvents.handleCardKeyChange(value) }
    },

    cardName: {
      get() { return this.formState.getCardTitle() },
      set(value) { this.formEvents.handleCardTitleChange(value) }
    },

    rarityOpts() {
      return this.formState.getRarityOptions()
    },

    uiLangOpts() {
      return this.$store.getters['card/uiLangOpts']
    },

    cardLangOpts() {
      return this.$store.getters['card/cardLangOpts']
    }
  },

  methods: {
    updateTitleColor(value) {
      this.formEvents.handleTitleColorChange(value)
    },

    generateCard() {
      this.formEvents.handleGenerateClick()
    },

    downloadCard() {
      this.formEvents.handleDownloadClick()
    },

    resetToDefault() {
      this.formEvents.handleResetClick()
    },

    async saveCard() {
      if (this.isSaving) return
      this.isSaving = true
      
      try {
        // Get canvas from CardPreview component
        const canvas = this.$parent.$refs.cardPreview.getCanvas()
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95))
        
        // Save card data and image
        const savedCard = await CardStorageService.saveCard(this.$store.state.card, blob)

        // If this card uses a DALL-E generation, mark it as used
        const cardImage = this.$store.state.card.cardImg
        if (cardImage?.generation?.id) {
          await this.$store.dispatch('dalle/markAsUsed', {
            generationId: cardImage.generation.id,
            cardId: savedCard.cardId
          })
        }
        
        // Play success sound
        soundManager.play('cardTransfer')
        
        // Add success animation class and handle navigation after animation
        if (this.$refs.saveButton) {
          this.$refs.saveButton.classList.add('save-success')
          setTimeout(() => {
            this.$refs.saveButton.classList.remove('save-success')
            // Redirect to gallery with highlight parameter after animation
            this.$router.push(`/gallery?highlight=${savedCard.cardId}`)
          }, 500)
        } else {
          // If ref is not available, navigate immediately
          this.$router.push(`/gallery?highlight=${savedCard.cardId}`)
        }

        // Show success message with optional chaining for safety
        if (this.$bvToast) {
          this.$bvToast.toast('Card saved successfully!', {
            title: 'Success',
            variant: 'success',
            solid: true
          })
        }
      } catch (error) {
        console.error('Error saving card:', error)
        this.$store.dispatch('handleError', 'Failed to save card. Please try again.');
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style scoped>
.checkbox-wrap {
  width: 100%;
}
.checkbox-wrap > label {
  width: 100%;
  text-align: left;
  border: none;
  color: #787878 !important;
  background-color: #7777774A !important;
}
.checkbox-wrap.active > label {
  color: #FFF !important;
  background-color: #17a2b8 !important;
}

@keyframes saveSuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.save-success {
  animation: saveSuccess 0.5s ease-in-out;
  background-color: #28a745 !important;
}
</style>
