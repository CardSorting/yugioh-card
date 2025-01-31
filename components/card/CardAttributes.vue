<template>
  <div class="card-attributes">
    <!-- Card Type Selection -->
    <b-row class="my-3">
      <b-col cols="6" lg="3" class="px-2">
        <label>{{ ui[uiLang].card_type }}</label>
        <b-form-select 
          v-model="selectedType" 
          :options="cardTypeOpts"
        ></b-form-select>
      </b-col>

      <b-col cols="6" lg="3" class="px-2">
        <label>{{ ui[uiLang].card_subtype }}</label>
        <b-form-select 
          v-model="selectedSubtype" 
          :options="currentSubtypeOpts"
        ></b-form-select>
      </b-col>

      <!-- Monster Effects -->
      <template v-if="isMonster">
        <b-col cols="6" lg="3" class="px-2">
          <label>{{ ui[uiLang].card_effect }}</label>
          <b-form-select 
            v-model="selectedEff1" 
            :options="cardEff1Opts"
          ></b-form-select>
        </b-col>
        <b-col cols="6" lg="3" class="px-2">
          <label>&emsp;</label>
          <b-form-select 
            v-model="selectedEff2" 
            :options="cardEff2Opts"
          ></b-form-select>
        </b-col>
      </template>
    </b-row>

    <!-- Monster Attributes -->
    <b-row v-if="isMonster" class="my-3">
      <b-col cols="12" lg="6" class="px-2">
        <label>{{ ui[uiLang].card_attribute }}</label>
        <b-form-select 
          v-model="selectedAttr" 
          :options="cardAttrOpts"
        ></b-form-select>
      </b-col>

      <b-col cols="6" lg="3" class="px-2">
        <div class="form-check px-0">
          <label>{{ ui[uiLang].card_race_type }}</label>
          <b-form-checkbox 
            v-model="customRaceEnabled" 
            :class="{'checkbox-wrap': true, 'active': customRaceEnabled}" 
            button
          >{{ ui[uiLang].custom }}</b-form-checkbox>
        </div>
      </b-col>

      <b-col v-if="!customRaceEnabled" cols="6" lg="3" class="px-2">
        <label>&emsp;</label>
        <b-form-select 
          v-model="selectedRace" 
          :options="cardRaceOpts"
        ></b-form-select>
      </b-col>

      <b-col v-else cols="6" lg="3" class="px-2">
        <label>&emsp;</label>
        <b-form-input 
          v-model="customRace"
          type="text"
          maxlength="8"
          :placeholder="ui[uiLang].plz_input_race_type"
        />
      </b-col>
    </b-row>

    <!-- Monster Special Properties -->
    <b-row v-if="isMonster" class="my-3">
      <b-col v-if="canPendulumEnabled" cols="6" lg="4" class="px-2">
        <div class="form-check px-0">
          <label>&emsp;</label>
          <b-form-checkbox 
            v-model="pendulumEnabled" 
            :class="{'checkbox-wrap': true, 'active': pendulumEnabled}" 
            button
          >{{ ui[uiLang].pendulum }}</b-form-checkbox>
        </div>
      </b-col>

      <b-col cols="6" lg="4" class="px-2">
        <div class="form-check px-0">
          <label>&emsp;</label>
          <b-form-checkbox 
            v-model="specialSummon" 
            :class="{'checkbox-wrap': true, 'active': specialSummon}" 
            button
          >{{ ui[uiLang].special_summon }}</b-form-checkbox>
        </div>
      </b-col>

      <b-col v-if="!isLinkMonster" cols="12" lg="4" class="px-2">
        <label>{{ ui[uiLang].lavel_and_rank }}</label>
        <b-form-select 
          v-model="selectedLevel" 
          :options="cardLevelOpts"
        ></b-form-select>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'CardAttributes',

  computed: {
    ...mapState({
      ui: state => state.card.ui,
      uiLang: state => state.card.uiLang,
      cardType: state => state.card.cardType,
      cardSubtype: state => state.card.cardSubtype,
      cardEff1: state => state.card.cardEff1,
      cardEff2: state => state.card.cardEff2,
      cardAttr: state => state.card.cardAttr,
      cardCustomRaceEnabled: state => state.card.cardCustomRaceEnabled,
      cardCustomRace: state => state.card.cardCustomRace,
      cardRace: state => state.card.cardRace,
      Pendulum: state => state.card.Pendulum,
      Special: state => state.card.Special,
      cardLevel: state => state.card.cardLevel,
      cardMeta: state => state.card.cardMeta
    }),

    ...mapGetters('card', [
      'isEffectMonster',
      'isXyzMonster',
      'isLinkMonster',
      'canPendulumEnabled'
    ]),

    isMonster() {
      return this.cardType === 'Monster'
    },

    selectedType: {
      get() { return this.cardType },
      set(value) { this.SET_CARD_TYPE(value) }
    },

    selectedSubtype: {
      get() { return this.cardSubtype },
      set(value) { this.SET_CARD_SUBTYPE(value) }
    },

    selectedEff1: {
      get() { return this.cardEff1 },
      set(value) { this.SET_CARD_EFF1(value) }
    },

    selectedEff2: {
      get() { return this.cardEff2 },
      set(value) { this.SET_CARD_EFF2(value) }
    },

    selectedAttr: {
      get() { return this.cardAttr },
      set(value) { this.SET_CARD_ATTR(value) }
    },

    customRaceEnabled: {
      get() { return this.cardCustomRaceEnabled },
      set(value) { this.SET_CUSTOM_RACE_ENABLED(value) }
    },

    customRace: {
      get() { return this.cardCustomRace },
      set(value) { this.SET_CUSTOM_RACE(value) }
    },

    selectedRace: {
      get() { return this.cardRace },
      set(value) { this.SET_CARD_RACE(value) }
    },

    pendulumEnabled: {
      get() { return this.Pendulum },
      set(value) { this.SET_PENDULUM(value) }
    },

    specialSummon: {
      get() { return this.Special },
      set(value) { this.SET_SPECIAL(value) }
    },

    selectedLevel: {
      get() { return this.cardLevel },
      set(value) { this.SET_CARD_LEVEL(value) }
    },

    cardTypeOpts() {
      return [
        { value: 'Monster', text: this.ui[this.uiLang].monster_card },
        { value: 'Spell', text: this.ui[this.uiLang].spell_card },
        { value: 'Trap', text: this.ui[this.uiLang].trap_card }
      ]
    },

    currentSubtypeOpts() {
      return this.cardType === 'Monster' ? this.monsterSubtypeOpts :
             this.cardType === 'Spell' ? this.spellSubtypeOpts :
             this.trapSubtypeOpts
    },

    monsterSubtypeOpts() {
      return [
        { value: 'Normal', text: this.ui[this.uiLang].m_card.normal },
        { value: 'Effect', text: this.ui[this.uiLang].m_card.effect },
        { value: 'Fusion', text: this.ui[this.uiLang].m_card.fusion },
        { value: 'Ritual', text: this.ui[this.uiLang].m_card.ritual },
        { value: 'Synchro', text: this.ui[this.uiLang].m_card.synchro },
        { value: 'Xyz', text: this.ui[this.uiLang].m_card.xyz },
        { value: 'Link', text: this.ui[this.uiLang].m_card.link },
        { value: 'Token', text: this.ui[this.uiLang].m_card.token },
        { value: 'Slifer', text: this.ui[this.uiLang].m_card.slifer },
        { value: 'Ra', text: this.ui[this.uiLang].m_card.ra },
        { value: 'Obelisk', text: this.ui[this.uiLang].m_card.obelisk },
        { value: 'LDragon', text: this.ui[this.uiLang].m_card.ldragon }
      ]
    },

    spellSubtypeOpts() {
      return [
        { value: 'Normal', text: this.ui[this.uiLang].st_card.normal },
        { value: 'Continuous', text: this.ui[this.uiLang].st_card.continuous },
        { value: 'Field', text: this.ui[this.uiLang].st_card.field },
        { value: 'Equip', text: this.ui[this.uiLang].st_card.equip },
        { value: 'Quick', text: this.ui[this.uiLang].st_card.quick },
        { value: 'Ritual', text: this.ui[this.uiLang].st_card.ritual }
      ]
    },

    trapSubtypeOpts() {
      return [
        { value: 'Normal', text: this.ui[this.uiLang].st_card.normal },
        { value: 'Continuous', text: this.ui[this.uiLang].st_card.continuous },
        { value: 'Counter', text: this.ui[this.uiLang].st_card.counter }
      ]
    },

    cardEff1Opts() {
      return Object.entries(this.cardMeta[this.uiLang].Effect).map(([value, text]) => ({
        value,
        text: text || this.ui[this.uiLang].none
      }))
    },

    cardEff2Opts() {
      return Object.entries(this.cardMeta[this.uiLang].Effect).map(([value, text]) => ({
        value,
        text: text || this.ui[this.uiLang].none
      }))
    },

    cardAttrOpts() {
      return [
        { value: 'LIGHT', text: 'LIGHT' },
        { value: 'DARK', text: 'DARK' },
        { value: 'EARTH', text: 'EARTH' },
        { value: 'WATER', text: 'WATER' },
        { value: 'FIRE', text: 'FIRE' },
        { value: 'WIND', text: 'WIND' },
        { value: 'DIVINE', text: 'DIVINE' }
      ]
    },

    cardRaceOpts() {
      return Object.entries(this.cardMeta[this.uiLang].Race).map(([value, text]) => ({
        value,
        text
      }))
    },

    cardLevelOpts() {
      return Array.from({ length: 13 }, (_, i) => ({
        value: i.toString(),
        text: i.toString()
      }))
    }
  },

  methods: {
    ...mapMutations('card', [
      'SET_CARD_TYPE',
      'SET_CARD_SUBTYPE',
      'SET_CARD_EFF1',
      'SET_CARD_EFF2',
      'SET_CARD_ATTR',
      'SET_CUSTOM_RACE_ENABLED',
      'SET_CUSTOM_RACE',
      'SET_CARD_RACE',
      'SET_PENDULUM',
      'SET_SPECIAL',
      'SET_CARD_LEVEL'
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