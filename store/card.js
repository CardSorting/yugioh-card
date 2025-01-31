import ui from '../static/lang.ui.json'
import cardMeta from '../static/lang.card_meta.json'
import ygoproData from '../static/ygo/card_data.json'

export const state = () => ({
  // Language and UI Data
  ui,
  cardMeta,
  uiLang: 'en',
  cardLang: 'en',
  
  // Card Basic Info
  holo: true,
  cardRare: '0',
  titleColor: '#000000',
  cardLoadYgoProEnabled: true,
  cardKey: '',
  cardTitle: '',
  cardImg: {
    file: null,
    generation: null
  },

  // Card Type Info
  cardType: 'Monster',
  cardSubtype: 'Normal',
  cardEff1: 'normal',
  cardEff2: 'none',
  
  // Monster Specific
  cardAttr: 'LIGHT',
  cardCustomRaceEnabled: false,
  cardCustomRace: '',
  cardRace: 'dragon',
  Pendulum: true,
  Special: true,
  cardLevel: '12',
  cardBLUE: 12,
  cardRED: 12,
  cardATK: '',
  cardDEF: '',
  
  // Link Markers
  links: {
    1: {val: false, symbol: '◤'},
    2: {val: false, symbol: '▲'},
    3: {val: false, symbol: '◥'},
    4: {val: false, symbol: '◀'},
    6: {val: false, symbol: '▶'},
    7: {val: false, symbol: '◣'},
    8: {val: false, symbol: '▼'},
    9: {val: false, symbol: '◢'},
  },

  // Text Info
  infoSize: '22',
  cardInfo: '',
  pendulumSize: 23,
  cardPendulumInfo: '',

  // Resources
  imgs: {},
})

export const mutations = {
  SET_UI_LANG(state, lang) {
    state.uiLang = lang
    if (cardMeta[lang]) state.cardLang = lang
  },
  SET_CARD_LANG(state, lang) {
    state.cardLang = lang
    if (state.cardKey === '') {
      this.commit('card/RESET_TO_DEFAULT')
    }
  },
  SET_CARD_IMAGE(state, { file, generation = null }) {
    state.cardImg = {
      file: file,
      generation: generation
    }
  },
  SET_CARD_TYPE(state, type) {
    state.cardType = type
    state.cardSubtype = 'Normal'
    if (type !== 'Monster') state.Pendulum = false
  },
  SET_CARD_SUBTYPE(state, subtype) {
    state.cardSubtype = subtype
    if (['Slifer', 'Ra', 'Obelisk', 'LDragon'].includes(subtype)) {
      state.Pendulum = false
    }
  },
  SET_CARD_EFF1(state, effect) {
    state.cardEff1 = effect
  },
  SET_CARD_EFF2(state, effect) {
    state.cardEff2 = effect
  },
  SET_CARD_ATTR(state, attr) {
    state.cardAttr = attr
  },
  SET_CUSTOM_RACE_ENABLED(state, enabled) {
    state.cardCustomRaceEnabled = enabled
  },
  SET_CUSTOM_RACE(state, race) {
    state.cardCustomRace = race
  },
  SET_CARD_RACE(state, race) {
    state.cardRace = race
  },
  SET_PENDULUM(state, enabled) {
    state.Pendulum = enabled
  },
  SET_SPECIAL(state, enabled) {
    state.Special = enabled
  },
  SET_CARD_LEVEL(state, level) {
    state.cardLevel = level
  },
  SET_HOLO(state, enabled) {
    state.holo = enabled
  },
  SET_CARD_RARE(state, rare) {
    state.cardRare = rare
  },
  SET_TITLE_COLOR(state, color) {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    state.titleColor = color && colorRegex.test(color) ? color : '#000000'
  },
  SET_AUTO_FILL_ENABLED(state, enabled) {
    state.cardLoadYgoProEnabled = enabled
  },
  SET_CARD_KEY(state, key) {
    state.cardKey = key
  },
  SET_CARD_TITLE(state, title) {
    state.cardTitle = title
  },
  SET_CARD_ATK(state, atk) {
    state.cardATK = atk
  },
  SET_CARD_DEF(state, def) {
    state.cardDEF = def
  },
  SET_LINK_MARKERS(state, markers) {
    state.links = markers
  },
  SET_INFO_SIZE(state, size) {
    state.infoSize = size
  },
  SET_CARD_INFO(state, info) {
    state.cardInfo = info
  },
  SET_CARD_BLUE(state, value) {
    state.cardBLUE = value
  },
  SET_CARD_RED(state, value) {
    state.cardRED = value
  },
  SET_PENDULUM_SIZE(state, size) {
    state.pendulumSize = size
  },
  SET_PENDULUM_INFO(state, info) {
    state.cardPendulumInfo = info
  },
  RESET_TO_DEFAULT(state) {
    const data = state.cardMeta[state.cardLang].Default
    state.holo = true
    state.cardRare = '0'
    state.titleColor = '#000000'
    state.cardLoadYgoProEnabled = true
    state.cardKey = ''
    state.cardTitle = data.title
    state.cardImg = {
      file: null,
      generation: null
    }
    state.cardType = 'Monster'
    state.cardSubtype = 'Normal'
    state.cardAttr = 'LIGHT'
    state.cardEff1 = 'normal'
    state.cardEff2 = 'none'
    state.cardCustomRaceEnabled = false
    state.cardCustomRace = ''
    state.cardRace = 'dragon'
    state.Pendulum = true
    state.Special = true
    state.cardLevel = '12'
    state.cardBLUE = '12'
    state.cardRED = '12'
    state.cardATK = '?'
    state.cardDEF = '?'
    Object.keys(state.links).forEach(key => {
      if (key !== '5') state.links[key].val = false
    })
    state.cardInfo = data.info
    state.infoSize = data.size
    state.cardPendulumInfo = data.pInfo
    state.pendulumSize = data.pSize
  },
  LOAD_YGOPRO_DATA(state, key) {
    const data = ygoproData[key]
    if (!data) return false
    
    state.cardLang = 'en'  // Changed from 'zh' to 'en'
    state.cardRare = data.rare
    // Validate color format and use default if invalid
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    state.titleColor = data.color && colorRegex.test(data.color) ? data.color : '#000000'
    state.cardTitle = data.title
    state.cardImg = {
      file: null,
      generation: null
    }
    state.cardType = data.type[0]
    state.cardSubtype = data.type[1]
    if (data.attribute !== 'Trap' && data.attribute !== 'Spell') {
      state.cardAttr = data.attribute
    }
    state.cardEff1 = data.type[2]
    state.cardEff2 = data.type[3]
    state.cardCustomRaceEnabled = false
    state.cardCustomRace = ''
    state.cardRace = data.race
    state.Pendulum = data.type[4]
    state.Special = data.type[5]
    state.cardLevel = data.level
    state.cardBLUE = data.blue
    state.cardRED = data.red
    state.cardATK = data.atk
    state.cardDEF = data.def
    Object.keys(state.links).forEach(key => {
      if (key !== '5') state.links[key].val = data[`link${key}`]
    })
    state.cardInfo = data.infoText
    state.infoSize = data.size
    state.cardPendulumInfo = data.pendulumText
    state.pendulumSize = data.pSize
    return true
  }
}

export const getters = {
  uiLangOpts: state => {
    return Object.keys(ui).map(key => ({
      value: key,
      text: ui[key].name || key
    }))
  },
  cardLangOpts: state => {
    return Object.keys(cardMeta).map(key => ({
      value: key,
      text: cardMeta[key].name || key
    }))
  },
  isEffectMonster: state => {
    return state.cardSubtype === 'Effect' || 
           (state.cardEff2 !== 'none' && state.cardSubtype !== 'Normal')
  },
  isXyzMonster: state => {
    return state.cardType === 'Monster' && state.cardSubtype === 'Xyz'
  },
  isLinkMonster: state => {
    return state.cardType === 'Monster' && state.cardSubtype === 'Link'
  },
  canPendulumEnabled: state => {
    return state.cardType === 'Monster' && 
           !['Slifer', 'Ra', 'Obelisk', 'LDragon'].includes(state.cardSubtype)
  }
}

export const actions = {
  resetToDefault({ commit }) {
    commit('RESET_TO_DEFAULT')
  },
  loadYgoProData({ commit }, key) {
    return commit('LOAD_YGOPRO_DATA', key)
  }
}
