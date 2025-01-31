export default class FormStateService {
  constructor(store) {
    this.store = store
  }

  getUiLang() {
    return this.store.state.card.uiLang
  }

  setUiLang(value) {
    this.store.commit('card/SET_UI_LANG', value)
  }

  getCardLang() {
    return this.store.state.card.cardLang
  }

  setCardLang(value) {
    this.store.commit('card/SET_CARD_LANG', value)
  }

  getHolo() {
    return this.store.state.card.holo
  }

  setHolo(value) {
    this.store.commit('card/SET_HOLO', value)
  }

  getCardRare() {
    return this.store.state.card.cardRare
  }

  setCardRare(value) {
    this.store.commit('card/SET_CARD_RARE', value)
  }

  getTitleColor() {
    return this.store.state.card.titleColor
  }

  setTitleColor(value) {
    this.store.commit('card/SET_TITLE_COLOR', value)
  }

  getAutoFillEnabled() {
    return this.store.state.card.cardLoadYgoProEnabled
  }

  setAutoFillEnabled(value) {
    this.store.commit('card/SET_AUTO_FILL_ENABLED', value)
  }

  getCardKey() {
    return this.store.state.card.cardKey
  }

  setCardKey(value) {
    this.store.commit('card/SET_CARD_KEY', value)
  }

  getCardTitle() {
    return this.store.state.card.cardTitle
  }

  setCardTitle(value) {
    this.store.commit('card/SET_CARD_TITLE', value)
  }

  getRarityOptions() {
    return [
      { value: '0', text: 'N' },
      { value: '1', text: 'R' },
      { value: '2', text: 'UR' }
    ]
  }

  async resetToDefault() {
    await this.store.dispatch('card/resetToDefault')
  }

  async loadYgoProData(value) {
    await this.store.dispatch('card/loadYgoProData', value)
  }
}
