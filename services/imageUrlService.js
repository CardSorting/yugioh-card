export default class ImageUrlService {
  getTemplateUrl(cardState, templateLang) {
    let templateUrl = cardState.cardType !== "Monster" ? cardState.cardType : cardState.cardSubtype
    if (cardState.Pendulum && !["Slifer", "Ra", "Obelisk", "LDragon"].includes(cardState.cardSubtype)) {
      templateUrl += "Pendulum"
    }
    return `/images/card/${templateLang}/${templateUrl}.png`
  }

  getAttributeUrl(cardState, templateLang) {
    return cardState.cardType === "Monster"
      ? `/images/attr/${templateLang}/${cardState.cardAttr}.webp`
      : `/images/attr/${templateLang}/${cardState.cardType}.webp`
  }

  getLevelOrSubtypeUrl(cardState) {
    return cardState.cardType !== "Monster" && cardState.cardSubtype !== "Normal"
      ? `/images/pic/${cardState.cardSubtype}.webp`
      : `/images/pic/${cardState.isXyzMonster ? 'Rank' : 'Level'}.webp`
  }

  getImageMap(cardState, templateLang, cardImgUrl) {
    return {
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
      photo: cardImgUrl || "/images/default.jpg",
      levelOrSubtype: this.getLevelOrSubtypeUrl(cardState)
    }
  }
}
