import { RenderConfig } from '../interfaces/ICardRenderer';
import { CardState } from '../types/CardState';
import { BaseCardRenderer } from './BaseCardRenderer';

export class MonsterCardRenderer extends BaseCardRenderer {
  canRender(cardState: CardState): boolean {
    return cardState.cardType === 'Monster';
  }

  async render(cardState: CardState, config: RenderConfig): Promise<void> {
    this.config = config;
    this.validateConfig();

    const { context: ctx, images } = config;
    
    // Draw base image
    this.drawCardBase(cardState);

    // Draw card title
    this.drawCardTitle(cardState);

    // Draw monster info
    this.drawMonsterInfo(cardState);

    // Draw card secret code
    if (cardState.cardKey !== '') {
      this.drawCardSecret(cardState);
    }

    // Draw holo stamp
    if (cardState.holo && images.holo) {
      ctx.drawImage(images.holo, 928, 1371, 44, 46);
    }

    // Draw pendulum effect
    if (cardState.Pendulum) {
      this.drawPendulumInfo(cardState);
    }

    // Draw card info text
    this.drawCardInfoText(cardState);
  }

  private drawCardBase(cardState: CardState): void {
    const { context: ctx, images } = this.config!;
    const photo = images.photo;
    if (!photo) throw new Error('Photo image not loaded');

    // Calculate dimensions
    const isPendulum = cardState.Pendulum;
    const [cX, cY, cW, cH] = isPendulum 
      ? [69, 255, 862, 647]
      : [123, 268, 754, 754];

    const iW = photo.width / photo.height * cH;
    const iH = photo.height / photo.width * cW;

    // Draw photo
    if (photo.width <= photo.height * (isPendulum ? 1.33 : 1)) {
      ctx.drawImage(photo, cX, cY - ((iH - cH) / 2), cW, iH);
    } else {
      ctx.drawImage(photo, cX - ((iW - cW) / 2), cY, iW, cH);
    }

    // Draw template and attribute
    if (images.template) {
      ctx.drawImage(images.template, 0, 0, 1000, 1450);
    }
    if (images.attr) {
      ctx.drawImage(images.attr, 840, 68, 90, 90);
    }
  }

  private drawCardTitle(cardState: CardState): void {
    const { context: ctx } = this.config!;
    const offset = cardState.cardMeta[cardState.cardLang]._offset || { tS: 0, tX: 0, tY: 0 };
    const fontName = cardState.cardMeta[cardState.cardLang]._fontName;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${57 + offset.tS}pt ${fontName[0]}, ${fontName[3]}, ${fontName[4]}, ${fontName[5]}`;
    ctx.fillStyle = this.getRareColor(cardState);
    ctx.fillText(cardState.cardTitle, 77 + offset.tX, 140 + offset.tY, 750);
  }

  private drawMonsterInfo(cardState: CardState): void {
    const { context: ctx } = this.config!;
    const langStr = cardState.cardMeta[cardState.cardLang];
    const offset = langStr._offset || { oX: 0, oY: 0, sS: 0 };

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${25 - offset.sS}pt ${langStr._fontName[1]}`;
    ctx.fillStyle = '#000';

    // Build type text
    const cardSubtypeFilter = ['Normal', 'Effect', 'Slifer', 'Ra', 'Obelisk', 'LDragon'];
    const typeText = (cardState.cardCustomRaceEnabled ? cardState.cardCustomRace : langStr.Race[cardState.cardRace]) +
                    (cardState.Special ? langStr.M_SPECIAL : '') +
                    (!cardSubtypeFilter.includes(cardState.cardSubtype) ? langStr.Subtype[cardState.cardSubtype] : '') +
                    (langStr.Effect[cardState.cardEff1]) +
                    (cardState.cardEff1 !== cardState.cardEff2 ? langStr.Effect[cardState.cardEff2] : '') +
                    (cardState.Pendulum ? langStr.M_PENDULUM : '') +
                    (this.isEffectMonster(cardState) ? langStr.M_EFFECT : '');

    ctx.fillText(`${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`, 63 + offset.oX, 1120 + offset.oY, 750);

    // Draw stats and level/rank
    this.drawMonsterStats(cardState);
    this.drawLevelOrRank(cardState);
  }

  private drawMonsterStats(cardState: CardState): void {
    const { context: ctx } = this.config!;
    const fontName = cardState.cardMeta[cardState.cardLang]._fontName;

    // ATK
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `33pt 'MatrixBoldSmallCaps', ${fontName[2]}`;
    if (cardState.cardATK.includes('∞')) {
      ctx.font = `Bold 32pt 'Times New Roman', ${fontName[2]}`;
    }
    ctx.fillText(cardState.cardATK, 719, 1353, 95);

    // DEF / LINK
    if (this.isLinkMonster(cardState)) {
      const linkCount = Object.values(cardState.links).filter(item => item.val).length;
      ctx.font = `28pt 'link', 'MatrixBoldSmallCaps', ${fontName[2]}`;
      ctx.fillText(String(linkCount), 917, 1352, 95);
    } else {
      ctx.font = `33pt 'MatrixBoldSmallCaps', ${fontName[2]}`;
      if (cardState.cardDEF.includes('∞')) {
        ctx.font = `Bold 32pt 'Times New Roman', ${fontName[2]}`;
      }
      ctx.fillText(cardState.cardDEF, 920, 1353, 95);
    }
  }

  private drawLevelOrRank(cardState: CardState): void {
    if (this.isLinkMonster(cardState)) return;

    const { context: ctx, images } = this.config!;
    const levelImg = images.levelOrSubtype;
    if (!levelImg) return;

    const level = parseInt(cardState.cardLevel);
    if (isNaN(level)) return;

    const isXyz = this.isXyzMonster(cardState);
    const starSize = 60;
    const starSpacing = 58;
    const startX = isXyz ? 880 : 880 - (level - 1) * starSpacing;
    const y = 180;

    for (let i = 0; i < level; i++) {
      const x = startX + (isXyz ? -i * starSpacing : i * starSpacing);
      ctx.drawImage(levelImg, x, y, starSize, starSize);
    }
  }

  private drawPendulumInfo(cardState: CardState): void {
    const { context: ctx } = this.config!;
    const offset = cardState.cardMeta[cardState.cardLang]._offset || { oY: 0, lh: 0 };
    const fontName = cardState.cardMeta[cardState.cardLang]._fontName;

    // Draw scales
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '55pt MatrixBoldSmallCaps';
    const xOffset = (['Xyz', 'Link', 'Token'].includes(cardState.cardSubtype)) ? 5 : 0;
    ctx.fillText(cardState.cardBLUE.toString(), 106 - xOffset, 1040, 60);
    ctx.fillText(cardState.cardRED.toString(), 895, 1040, 60);

    // Draw pendulum effect
    const fontSize = Number(cardState.pendulumSize);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}pt ${fontName[2]}, ${fontName[3]}, ${fontName[4]}, ${fontName[5]}`;
    this.wrapText(cardState.cardPendulumInfo, 160, 920 + offset.oY, 660, fontSize + offset.lh);
  }

  private drawCardInfoText(cardState: CardState): void {
    const { context: ctx } = this.config!;
    const offset = cardState.cardMeta[cardState.cardLang]._offset || { oY: 0, lh: 0 };
    const fontName = cardState.cardMeta[cardState.cardLang]._fontName;

    const fontSize = Number(cardState.infoSize);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}pt ${fontName[2]}, ${fontName[3]}, ${fontName[4]}, ${fontName[5]}`;
    this.wrapText(
      cardState.cardInfo,
      75,
      1095 + offset.oY + 30,
      825,
      fontSize + offset.lh
    );
  }
}
