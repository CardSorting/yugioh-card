import { ICardRenderer, RenderConfig } from '../interfaces/ICardRenderer';
import { CardState } from '../types/CardState';

export abstract class BaseCardRenderer implements ICardRenderer {
  protected config: RenderConfig | null = null;

  abstract canRender(cardState: CardState): boolean;
  abstract render(cardState: CardState, config: RenderConfig): Promise<void>;

  protected getRareColor(cardState: CardState): string | CanvasGradient {
    const ctx = this.config?.context;
    if (!ctx) throw new Error('Context not initialized');

    switch (cardState.cardRare) {
      case '2': {
        ctx.shadowColor = '#dcff32';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 0.4;
        ctx.shadowOffsetY = 1.5;
        return '#524100';
      }
      case '1': {
        const gradient = ctx.createLinearGradient(0, 0, 600, 0);
        gradient.addColorStop(0, '#ffdabf');
        gradient.addColorStop(0.14, '#fff6bf');
        gradient.addColorStop(0.28, '#fffebf');
        gradient.addColorStop(0.42, '#d8ffbf');
        gradient.addColorStop(0.56, '#bfffd4');
        gradient.addColorStop(0.7, '#bffdff');
        gradient.addColorStop(0.84, '#bfe4ff');
        gradient.addColorStop(1, '#bfc2ff');
        return gradient;
      }
      default:
        return cardState.titleColor;
    }
  }

  protected wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const ctx = this.config?.context;
    if (!ctx) throw new Error('Context not initialized');

    let lineWidth = 0 - ctx.measureText(text[0]).width;
    let initHeight = y;
    let lastSubStrIndex = 0;

    for (let i = 0; i < text.length; i++) {
      lineWidth += ctx.measureText(text[i]).width;
      if (lineWidth > maxWidth || text.substring(i, i + 1) === '\n') {
        if (text.substring(i, i + 1) === '\n') i++;
        ctx.fillText(text.substring(lastSubStrIndex, i), x, initHeight);
        initHeight += lineHeight;
        lineWidth = 0;
        lastSubStrIndex = i;
      }
      if (i === text.length - 1) {
        ctx.fillText(text.substring(lastSubStrIndex, i + 1), x, initHeight);
      }
    }
  }

  protected drawCardSecret(cardState: CardState): void {
    const ctx = this.config?.context;
    if (!ctx) throw new Error('Context not initialized');

    const isXyz = this.isXyzMonster(cardState);
    ctx.fillStyle = (isXyz && !cardState.Pendulum) ? '#FFF' : '#000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `22pt 'cardkey', 'MatrixBoldSmallCaps'`;
    ctx.fillText(cardState.cardKey.padStart(8, '0'), 54, 1405);
    ctx.fillStyle = '#000';
  }

  protected isEffectMonster(cardState: CardState): boolean {
    return cardState.cardSubtype === 'Effect' || 
           (cardState.cardEff2 !== 'none' && cardState.cardSubtype !== 'Normal');
  }

  protected isXyzMonster(cardState: CardState): boolean {
    return cardState.cardType === 'Monster' && cardState.cardSubtype === 'Xyz';
  }

  protected isLinkMonster(cardState: CardState): boolean {
    return cardState.cardType === 'Monster' && cardState.cardSubtype === 'Link';
  }

  protected validateConfig(): void {
    if (!this.config?.canvas || !this.config?.context || !this.config?.images || !this.config?.fonts) {
      throw new Error('Render config not properly initialized');
    }
  }
}
