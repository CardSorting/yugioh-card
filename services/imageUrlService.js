export default class ImageUrlService {
  getTemplateUrl(cardState, templateLang) {
    console.log('Getting template URL for:', { cardType: cardState.cardType, cardSubtype: cardState.cardSubtype, templateLang })
    
    let templateUrl = cardState.cardType !== "Monster" ? cardState.cardType : cardState.cardSubtype
    if (cardState.Pendulum && !["Slifer", "Ra", "Obelisk", "LDragon"].includes(cardState.cardSubtype)) {
      templateUrl += "Pendulum"
    }
    
    const url = `/images/card/${templateLang}/${templateUrl}.png`
    console.log('Generated template URL:', url)
    return url
  }

  getAttributeUrl(cardState, templateLang) {
    console.log('Getting attribute URL for:', { cardType: cardState.cardType, cardAttr: cardState.cardAttr, templateLang })
    
    const url = cardState.cardType === "Monster"
      ? `/images/attr/${templateLang}/${cardState.cardAttr}.webp`
      : `/images/attr/${templateLang}/${cardState.cardType}.webp`
      
    console.log('Generated attribute URL:', url)
    return url
  }

  getLevelOrSubtypeUrl(cardState) {
    console.log('Getting level/subtype URL for:', { cardType: cardState.cardType, cardSubtype: cardState.cardSubtype })
    
    const url = cardState.cardType !== "Monster" && cardState.cardSubtype !== "Normal"
      ? `/images/pic/${cardState.cardSubtype}.webp`
      : `/images/pic/${cardState.isXyzMonster ? 'Rank' : 'Level'}.webp`
      
    console.log('Generated level/subtype URL:', url)
    return url
  }

  getImageMap(cardState, templateLang, cardImgUrl) {
    console.log('Generating image map with:', { templateLang, hasCardImage: !!cardImgUrl })
    
    const imageMap = {
      template: this.getTemplateUrl(cardState, templateLang),
      holo: "/images/pic/holo.png",
      link1: "/images/pic/LINK1.png",
      link2: "/images/pic/LINK2.png",
      link3: "/images/pic/LINK3.png",
      link4: "/images/pic/LINK4.png",
      link6: "/images/pic/LINK6.png",
      link7: "/images/pic/LINK7.png",
      link8: "/images/pic/LINK8.png",
      link9: "/images/pic/LINK9.png",
      attr: this.getAttributeUrl(cardState, templateLang),
      photo: cardImgUrl || "/images/default.PNG", // Using PNG version since it's likely higher quality
      levelOrSubtype: this.getLevelOrSubtypeUrl(cardState)
    }
    
    console.log('Final image map:', imageMap)
    return imageMap
  }
}
