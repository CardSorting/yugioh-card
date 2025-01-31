import { ICardRenderer, ICardRendererFactory } from '../interfaces/ICardRenderer';
import { CardState } from '../types/CardState';
import { MonsterCardRenderer } from './MonsterCardRenderer';
import { SpellTrapCardRenderer } from './SpellTrapCardRenderer';

export class CardRendererFactory implements ICardRendererFactory {
  private static instance: CardRendererFactory;
  private renderers: ICardRenderer[];

  private constructor() {
    this.renderers = [
      new MonsterCardRenderer(),
      new SpellTrapCardRenderer()
    ];
  }

  static getInstance(): CardRendererFactory {
    if (!CardRendererFactory.instance) {
      CardRendererFactory.instance = new CardRendererFactory();
    }
    return CardRendererFactory.instance;
  }

  createRenderer(cardState: CardState): ICardRenderer {
    const renderer = this.renderers.find(r => r.canRender(cardState));
    if (!renderer) {
      throw new Error(`No renderer found for card type: ${cardState.cardType}`);
    }
    return renderer;
  }

  // Allow registration of custom renderers
  registerRenderer(renderer: ICardRenderer): void {
    this.renderers.unshift(renderer); // Add to start so custom renderers take precedence
  }
}

// Export singleton instance
export const cardRendererFactory = CardRendererFactory.getInstance();
