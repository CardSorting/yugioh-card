import cardDrawingService from './cardDrawingService'
import ImageUrlService from './imageUrlService'
import CardDownloadService from './cardDownloadService'

export default class CardManager {
  constructor() {
    this.imageUrlService = new ImageUrlService()
    this.downloadService = new CardDownloadService()
  }

  initialize(canvas) {
    if (!canvas) {
      throw new Error('Canvas not found')
    }
    cardDrawingService.initialize(canvas)
  }

  async generateCard(cardState) {
    if (!cardState.cardMeta[cardState.cardLang]) {
      throw new Error('Language data not found')
    }

    const langStr = cardState.cardMeta[cardState.cardLang]
    const templateLang = langStr._templateLang
    const cardImgUrl = cardState.cardImg ? URL.createObjectURL(cardState.cardImg) : null
    
    const imageMap = this.imageUrlService.getImageMap(cardState, templateLang, cardImgUrl)
    
    await cardDrawingService.loadImages(imageMap)
    cardDrawingService.drawCard(cardState, langStr)
  }

  downloadCard(canvas) {
    this.downloadService.downloadCard(canvas)
  }
}
