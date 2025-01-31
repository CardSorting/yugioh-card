export default class FormEventService {
  constructor(formStateService, emitter) {
    this.formStateService = formStateService
    this.emitter = emitter
  }

  handleUiLangChange(value) {
    this.formStateService.setUiLang(value)
  }

  handleCardLangChange(value) {
    this.formStateService.setCardLang(value)
  }

  handleHoloChange(value) {
    this.formStateService.setHolo(value)
  }

  handleRarityChange(value) {
    this.formStateService.setCardRare(value)
  }

  handleTitleColorChange(value) {
    this.formStateService.setTitleColor(value)
  }

  handleAutoFillChange(value) {
    this.formStateService.setAutoFillEnabled(value)
  }

  async handleCardKeyChange(value) {
    this.formStateService.setCardKey(value)
    if (this.formStateService.getAutoFillEnabled()) {
      await this.formStateService.loadYgoProData(value)
    }
  }

  handleCardTitleChange(value) {
    this.formStateService.setCardTitle(value)
  }

  handleGenerateClick() {
    this.emitter('generate')
  }

  handleDownloadClick() {
    this.emitter('download')
  }

  async handleResetClick() {
    await this.formStateService.resetToDefault()
  }
}
