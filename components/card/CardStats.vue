<template>
  <div class="card-stats">
    <b-row class="my-3">     
      <!-- Attack -->
      <b-col v-if="isMonster" cols="4" class="px-2">
        <label>{{ ui[uiLang].attack }}</label>
        <b-form-input 
          v-model="attackValue" 
          type="text" 
          maxlength="6"
        ></b-form-input>
      </b-col>
      
      <!-- Defense -->
      <b-col v-if="isMonster && !isLinkMonster" cols="4" class="px-2">
        <label>{{ ui[uiLang].defence }}</label>
        <b-form-input 
          v-model="defenseValue" 
          type="text" 
          maxlength="6"
        ></b-form-input>
      </b-col>

      <!-- Link Markers -->
      <b-col v-if="isLinkMonster" cols="4" class="px-2">
        <label>{{ ui[uiLang].link }}</label>
        <table>
          <tr v-for="row in [0,1,2]" :key="row">
            <td v-for="col in [1,2,3]" :key="col">
              <b-form-checkbox 
                v-if="row*3+col!==5"
                v-model="linkMarkers[row*3+col].val" 
                :class="{'checkbox-wrap': true, 'active': linkMarkers[row*3+col].val}" 
                button
              >{{ linkMarkers[row*3+col].symbol }}</b-form-checkbox>
            </td>
          </tr>
        </table>
      </b-col>

      <!-- Text Size -->
      <b-col cols="4" class="px-2">
        <label>{{ ui[uiLang].text_size }}</label>
        <b-form-input 
          v-model="textSize" 
          type="number"
        ></b-form-input>
      </b-col>
    </b-row>

    <!-- Pendulum Scales (if enabled) -->
    <b-row v-if="pendulumEnabled" class="my-3">
      <b-col cols="12">
        <h4 class="text-light text-center">{{ ui[uiLang].pendulum_area }}</h4>
      </b-col>
      <b-col cols="12">
        <b-row class="mb-3">
          <b-col cols="4" class="px-2">
            <label>{{ ui[uiLang].pendulum_blue }}</label>
            <b-form-input 
              v-model="blueScale" 
              type="number" 
              min="0" 
              max="12"
            ></b-form-input>
          </b-col>

          <b-col cols="4" class="px-2">
            <label>{{ ui[uiLang].pendulum_red }}</label>
            <b-form-input 
              v-model="redScale" 
              type="number" 
              min="0" 
              max="12"
            ></b-form-input>
          </b-col>

          <b-col cols="4" class="px-2">
            <label>{{ ui[uiLang].text_size }}</label>
            <b-form-input 
              v-model="pendulumTextSize" 
              type="number"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="my-3">
          <b-col class="px-2">
            <label>{{ ui[uiLang].card_info_text }}</label>
            <b-form-textarea 
              v-model="pendulumText" 
              rows="5"
            ></b-form-textarea>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <!-- Card Info Text -->
    <b-row class="my-3">
      <b-col class="px-2">
        <label>{{ ui[uiLang].card_info_text }}</label>
        <b-form-textarea 
          v-model="cardText" 
          rows="5"
        ></b-form-textarea>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'CardStats',

  computed: {
    ...mapState({
      ui: state => state.card.ui,
      uiLang: state => state.card.uiLang,
      cardType: state => state.card.cardType,
      Pendulum: state => state.card.Pendulum,
      cardATK: state => state.card.cardATK,
      cardDEF: state => state.card.cardDEF,
      links: state => state.card.links,
      infoSize: state => state.card.infoSize,
      cardInfo: state => state.card.cardInfo,
      cardBLUE: state => state.card.cardBLUE,
      cardRED: state => state.card.cardRED,
      pendulumSize: state => state.card.pendulumSize,
      cardPendulumInfo: state => state.card.cardPendulumInfo
    }),

    ...mapGetters('card', [
      'isLinkMonster'
    ]),

    isMonster() {
      return this.cardType === 'Monster'
    },

    pendulumEnabled() {
      return this.Pendulum
    },

    attackValue: {
      get() { return this.cardATK },
      set(value) { this.SET_CARD_ATK(value) }
    },

    defenseValue: {
      get() { return this.cardDEF },
      set(value) { this.SET_CARD_DEF(value) }
    },

    linkMarkers: {
      get() { return this.links },
      set(value) { this.SET_LINK_MARKERS(value) }
    },

    textSize: {
      get() { return this.infoSize },
      set(value) { this.SET_INFO_SIZE(value) }
    },

    cardText: {
      get() { return this.cardInfo },
      set(value) { this.SET_CARD_INFO(value) }
    },

    blueScale: {
      get() { return this.cardBLUE },
      set(value) { this.SET_CARD_BLUE(value) }
    },

    redScale: {
      get() { return this.cardRED },
      set(value) { this.SET_CARD_RED(value) }
    },

    pendulumTextSize: {
      get() { return this.pendulumSize },
      set(value) { this.SET_PENDULUM_SIZE(value) }
    },

    pendulumText: {
      get() { return this.cardPendulumInfo },
      set(value) { this.SET_PENDULUM_INFO(value) }
    }
  },

  methods: {
    ...mapMutations('card', [
      'SET_CARD_ATK',
      'SET_CARD_DEF',
      'SET_LINK_MARKERS',
      'SET_INFO_SIZE',
      'SET_CARD_INFO',
      'SET_CARD_BLUE',
      'SET_CARD_RED',
      'SET_PENDULUM_SIZE',
      'SET_PENDULUM_INFO'
    ])
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
</style>