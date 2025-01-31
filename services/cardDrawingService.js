export class CardDrawingService {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.imgs = {}
    this.fontName = null
  }

  initialize(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.canvas.width = 1000
    this.canvas.height = 1450
  }

  async loadImages(imageMap) {
    this.imgs = {}
    const promises = []
    
    for (const [key, url] of Object.entries(imageMap)) {
      promises.push(
        new Promise((resolve, reject) => {
          const image = new Image()
          image.onload = () => {
            this.imgs[key] = image
            resolve()
          }
          image.onerror = () => {
            console.error(`Failed to load image: ${url}`)
            reject(new Error(`Failed to load image: ${url}`))
          }
          image.src = url
        }).catch(error => {
          console.error(error)
          // Create a fallback image
          const fallbackImage = new Image()
          fallbackImage.width = 1000
          fallbackImage.height = 1450
          this.imgs[key] = fallbackImage
        })
      )
    }

    await Promise.all(promises)
  }

  drawCard(cardData, langStr) {
    if (!this.canvas || !this.ctx) return

    const offset = langStr._offset
    this.fontName = langStr._fontName

    // Draw base image
    this.drawCardBase(cardData)

    // Draw card title
    this.drawCardTitle(cardData, offset)

    // Draw card info
    this.drawCardInfo(cardData, langStr, offset)

    // Draw card secret code
    if (cardData.cardKey !== '') {
      this.drawCardSecret(cardData)
    }

    // Draw holo stamp
    if (cardData.holo) {
      this.ctx.drawImage(this.imgs.holo, 928, 1371, 44, 46)
    }

    // Draw pendulum effect
    if (cardData.Pendulum) {
      this.drawPendulumInfo(cardData, offset)
    }

    // Draw card info text
    this.drawCardInfoText(cardData, offset)
  }

  drawCardBase(cardData) {
    let cX, cY, cW, cH
    if (cardData.Pendulum) {
      cX = 69; cY = 255; cW = 862; cH = 647
    } else {
      cX = 123; cY = 268; cW = 754; cH = 754
    }

    const photo = this.imgs.photo
    const iW = photo.width / photo.height * cH
    const iH = photo.height / photo.width * cW

    if (photo.width <= photo.height * (cardData.Pendulum ? 1.33 : 1)) {
      this.ctx.drawImage(photo, cX, cY - ((iH - cH) / 2), cW, iH)
    } else {
      this.ctx.drawImage(photo, cX - ((iW - cW) / 2), cY, iW, cH)
    }

    this.ctx.drawImage(this.imgs.template, 0, 0, 1000, 1450)
    this.ctx.drawImage(this.imgs.attr, 840, 68, 90, 90)
  }

  drawCardTitle(cardData, offset) {
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.font = `${57 + offset.tS}pt ${this.fontName[0]}, ${this.fontName[3]}, ${this.fontName[4]}, ${this.fontName[5]}`
    this.ctx.fillStyle = this.getRareColor(cardData)
    this.ctx.fillText(cardData.cardTitle, 77 + offset.tX, 140 + offset.tY, 750)
    this.ctx.shadowColor = '#000'
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetX = 0
    this.ctx.shadowOffsetY = 0
  }

  drawCardInfo(cardData, langStr, offset) {
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.font = `${(cardData.cardType === 'Monster' ? 25 : 40) - offset.sS}pt ${this.fontName[1]}`
    this.ctx.fillStyle = '#000'

    if (cardData.cardType === 'Monster') {
      this.drawMonsterInfo(cardData, langStr, offset)
    } else {
      this.drawSpellTrapInfo(cardData, langStr, offset)
    }
  }

  drawMonsterInfo(cardData, langStr, offset) {
    const cardSubtypeFilter = ['Normal', 'Effect', 'Slifer', 'Ra', 'Obelisk', 'LDragon']
    const typeText = (cardData.cardCustomRaceEnabled ? cardData.cardCustomRace : langStr.Race[cardData.cardRace]) +
                    (cardData.Special ? langStr.M_SPECIAL : '') +
                    (!cardSubtypeFilter.includes(cardData.cardSubtype) ? langStr.Subtype[cardData.cardSubtype] : '') +
                    (langStr.Effect[cardData.cardEff1]) +
                    (cardData.cardEff1 !== cardData.cardEff2 ? langStr.Effect[cardData.cardEff2] : '') +
                    (cardData.Pendulum ? langStr.M_PENDULUM : '') +
                    (this.isEffectMonster(cardData) ? langStr.M_EFFECT : '')

    this.ctx.fillText(`${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`, 63 + offset.oX, 1120 + offset.oY, 750)
    this.drawMonsterStats(cardData)
    this.drawLevelOrRank(cardData)
  }

  drawLevelOrRank(cardData) {
    if (this.isLinkMonster(cardData)) return // Link monsters don't have levels/ranks

    const levelImg = this.imgs.levelOrSubtype
    if (!levelImg) return

    const level = parseInt(cardData.cardLevel)
    if (isNaN(level)) return

    const isXyz = this.isXyzMonster(cardData)
    const starSize = 60 // Increased from 40
    const starSpacing = 58 // Adjusted spacing for larger stars
    const startX = isXyz ? 880 : 880 - (level - 1) * starSpacing // Increased from 820 to 850
    const y = 180 // Shifted down from 180

    for (let i = 0; i < level; i++) {
      const x = startX + (isXyz ? -i * starSpacing : i * starSpacing) // Using new spacing
      this.ctx.drawImage(levelImg, x, y, starSize, starSize)
    }
  }

  drawMonsterStats(cardData) {
    // ATK
    this.ctx.textAlign = 'right'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.font = `33pt 'MatrixBoldSmallCaps', ${this.fontName[2]}`
    if (cardData.cardATK.includes('∞')) {
      this.ctx.font = `Bold 32pt 'Times New Roman', ${this.fontName[2]}`
    }
    this.ctx.fillText(cardData.cardATK, 719, 1353, 95)

    // DEF / LINK
    this.ctx.font = `33pt 'MatrixBoldSmallCaps', ${this.fontName[2]}`
    if (this.isLinkMonster(cardData)) {
      const linkCount = Object.values(cardData.links).filter(item => item.val).length
      this.ctx.font = `28pt 'link', 'MatrixBoldSmallCaps', ${this.fontName[2]}`
      this.ctx.fillText(String(linkCount), 917, 1352, 95)
    } else {
      if (cardData.cardDEF.includes('∞')) {
        this.ctx.font = `Bold 32pt 'Times New Roman', ${this.fontName[2]}`
      }
      this.ctx.fillText(cardData.cardDEF, 920, 1353, 95)
    }
  }

  drawSpellTrapInfo(cardData, langStr, offset) {
    const typeText = (cardData.cardType === 'Spell' ? langStr.Spell : langStr.Trap) +
                    (cardData.cardSubtype === 'Normal' ? '' : langStr.SEP)
    
    this.ctx.textAlign = 'right'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.fillText(`${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`, 920 + offset.sX1, 222 + offset.sY1)
    
    if (cardData.cardSubtype !== 'Normal') {
      this.ctx.drawImage(this.imgs.levelOrSubtype, 820 + offset.sX2, 178 + offset.sY2, 58, 58)
    }
  }

  drawCardSecret(cardData) {
    this.ctx.fillStyle = (this.isXyzMonster(cardData) && !cardData.Pendulum) ? '#FFF' : '#000'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.font = `22pt 'cardkey', 'MatrixBoldSmallCaps', ${this.fontName[2]}`
    this.ctx.fillText(cardData.cardKey.padStart(8, '0'), 54, 1405)
    this.ctx.fillStyle = '#000'
  }

  drawPendulumInfo(cardData, offset) {
    // Draw pendulum scales
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.font = '55pt MatrixBoldSmallCaps'
    const xOffset = (['Xyz', 'Link', 'Token'].includes(cardData.cardSubtype) || cardData.cardType !== 'Monster') ? 5 : 0
    this.ctx.fillText(cardData.cardBLUE, 106 - xOffset, 1040, 60)
    this.ctx.fillText(cardData.cardRED, 895, 1040, 60)

    // Draw pendulum effect text
    const fontSize = Number(cardData.pendulumSize)
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.font = `${fontSize}pt ${this.fontName[2]}, ${this.fontName[3]}, ${this.fontName[4]}, ${this.fontName[5]}`
    this.wrapText(cardData.cardPendulumInfo, 160, 920 + offset.oY, 660, fontSize + offset.lh)
  }

  drawCardInfoText(cardData, offset) {
    const fontSize = Number(cardData.infoSize)
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.font = `${fontSize}pt ${this.fontName[2]}, ${this.fontName[3]}, ${this.fontName[4]}, ${this.fontName[5]}`
    this.wrapText(
      cardData.cardInfo,
      75,
      1095 + offset.oY + (cardData.cardType === 'Monster' ? 30 : 0),
      825,
      fontSize + offset.lh
    )
  }

  wrapText(text, x, y, maxWidth, lineHeight) {
    let lineWidth = 0 - this.ctx.measureText(text[0]).width
    let initHeight = y
    let lastSubStrIndex = 0

    for (let i = 0; i < text.length; i++) {
      lineWidth += this.ctx.measureText(text[i]).width
      if (lineWidth > maxWidth || text.substring(i, i + 1) === '\n') {
        if (text.substring(i, i + 1) === '\n') i++
        this.ctx.fillText(text.substring(lastSubStrIndex, i), x, initHeight)
        initHeight += lineHeight
        lineWidth = 0
        lastSubStrIndex = i
      }
      if (i === text.length - 1) {
        this.ctx.fillText(text.substring(lastSubStrIndex, i + 1), x, initHeight)
      }
    }
  }

  getRareColor(cardData) {
    switch (cardData.cardRare) {
      case '2': {
        this.ctx.shadowColor = '#dcff32'
        this.ctx.shadowBlur = 1
        this.ctx.shadowOffsetX = 0.4
        this.ctx.shadowOffsetY = 1.5
        return '#524100'
      }
      case '1': {
        const gradient = this.ctx.createLinearGradient(0, 0, 600, 0)
        gradient.addColorStop('0', '#ffdabf')
        gradient.addColorStop('0.14', '#fff6bf')
        gradient.addColorStop('0.28', '#fffebf')
        gradient.addColorStop('0.42', '#d8ffbf')
        gradient.addColorStop('0.56', '#bfffd4')
        gradient.addColorStop('0.7', '#bffdff')
        gradient.addColorStop('0.84', '#bfe4ff')
        gradient.addColorStop('1', '#bfc2ff')
        return gradient
      }
      default:
        return cardData.titleColor
    }
  }

  isEffectMonster(cardData) {
    return cardData.cardSubtype === 'Effect' || 
           (cardData.cardEff2 !== 'none' && cardData.cardSubtype !== 'Normal')
  }

  isXyzMonster(cardData) {
    return cardData.cardType === 'Monster' && cardData.cardSubtype === 'Xyz'
  }

  isLinkMonster(cardData) {
    return cardData.cardType === 'Monster' && cardData.cardSubtype === 'Link'
  }
}

export default new CardDrawingService()
