import { RenderConfig } from '../interfaces/ICardRenderer';
import { CardState } from '../types/CardState';
import { BaseCardRenderer } from './BaseCardRenderer';

export class SpellTrapCardRenderer extends BaseCardRenderer {
  canRender(cardState: CardState): boolean {
    return cardState.cardType === 'Spell' || cardState.cardType === 'Trap';
  }

  async render(cardState: CardState, config: RenderConfig): Promise<void> {
    this.config = config;
    this.validateConfig();

    const { context: ctx, images } = config;
    
    // Draw base image
    this.drawCardBase(cardState);

    // Draw card title
    this.drawCardTitle(cardState);

    // Draw spell/trap info
    this.drawSpellTrapInfo(cardState);

    // Draw card secret code
    if (cardState.cardKey !== '') {
      this.drawCardSecret(cardState);
    }

    // Draw holo stamp
    if (cardState.holo && images.holo) {
      ctx.drawImage(images.holo, 928, 1371, 44, 46);
    }

    // Draw card info text
    this.drawCardInfoText(cardState);
  }

  private drawCardBase(cardState: CardState): void {
    const { context: ctx, images } = this.config!;
    const photo = images.photo;
    if (!photo) throw new Error('Photo image not loaded');

    // Calculate dimensions
    const cX = 123;
    const cY = 268;
    const cW = 754;
    const cH = 754;

    const iW = photo.width / photo.height * cH;
    const iH = photo.height / photo.width * cW;

    // Draw photo
    if (photo.width <= photo.height) {
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

  private drawSpellTrapInfo(cardState: CardState): void {
    const { context: ctx, images } = this.config!;
    const langStr = cardState.cardMeta[cardState.cardLang];
    const offset = langStr._offset || { sX1: 0, sY1: 0, sX2: 0, sY2: 0 };

    // Draw type text
    const typeText = (cardState.cardType === 'Spell' ? langStr.Spell : langStr.Trap) +
                    (cardState.cardSubtype === 'Normal' ? '' : langStr.SEP);
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `40pt ${langStr._fontName[1]}`;
    ctx.fillStyle = '#000';
    ctx.fillText(`${langStr.QUOTE_L}${typeText}${langStr.QUOTE_R}`, 920 + offset.sX1, 222 + offset.sY1);
    
    // Draw subtype icon if not Normal
    if (cardState.cardSubtype !== 'Normal' && images.levelOrSubtype) {
      ctx.drawImage(images.levelOrSubtype, 820 + offset.sX2, 178 + offset.sY2, 58, 58);
    }
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
      1095 + offset.oY,
      825,
      fontSize + offset.lh
    );
  }
}
