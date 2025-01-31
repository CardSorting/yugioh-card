import cardDrawingService from './cardDrawingService'
import ImageUrlService from './imageUrlService'
import CardDownloadService from './cardDownloadService'

export default class CardManager {
  constructor() {
    this.imageUrlService = new ImageUrlService()
    this.downloadService = new CardDownloadService()
  }

  async initialize(canvas) {
    if (!canvas) {
      throw new Error('Canvas not found')
    }
    console.log('Initializing CardManager with canvas')
    try {
      await cardDrawingService.initialize(canvas)
      console.log('CardDrawingService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize CardDrawingService:', error)
      throw error
    }
  }

  validateCardState(cardState) {
    if (!cardState) {
      throw new Error('Card state is required')
    }

    // Check required properties
    const requiredProps = ['cardLang', 'cardType', 'cardSubtype', 'cardMeta']
    for (const prop of requiredProps) {
      if (!cardState[prop]) {
        console.error(`Missing required property: ${prop}`)
        throw new Error(`Missing required property: ${prop}`)
      }
    }

    // Check language data
    if (!cardState.cardMeta[cardState.cardLang]) {
      console.error('Language data not found for:', cardState.cardLang)
      throw new Error('Language data not found')
    }

    // Check template language
    const langStr = cardState.cardMeta[cardState.cardLang]
    if (!langStr._templateLang) {
      console.error('Template language not defined')
      throw new Error('Template language not defined')
    }

    return langStr
  }

  async generateCard(cardState) {
    console.log('Generating card with state:', {
      cardLang: cardState.cardLang,
      cardType: cardState.cardType,
      cardSubtype: cardState.cardSubtype
    })

    const langStr = this.validateCardState(cardState)
    const templateLang = langStr._templateLang
    console.log('Using template language:', templateLang)

    const cardImgUrl = cardState.cardImg?.file ? URL.createObjectURL(cardState.cardImg.file) : null
    console.log('Card image URL:', cardImgUrl || 'Using default image')
    
    const imageMap = this.imageUrlService.getImageMap(cardState, templateLang, cardImgUrl)
    console.log('Generated image map:', imageMap)
    
    try {
      console.log('Loading images...')
      await cardDrawingService.loadImages(imageMap)
      console.log('Images loaded successfully')
      
      console.log('Drawing card...')
      await cardDrawingService.drawCard(cardState, langStr)
      console.log('Card drawn successfully')
    } catch (error) {
      console.error('Error during card generation:', error)
      throw error
    }
  }

  downloadCard(canvas) {
    this.downloadService.downloadCard(canvas)
  }
}
