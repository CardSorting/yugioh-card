import { CardState } from '../types/CardState';

export interface RenderConfig {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  images: Record<string, HTMLImageElement>;
  fonts: string[];
}

export interface ICardRenderer {
  canRender(cardState: CardState): boolean;
  render(cardState: CardState, config: RenderConfig): Promise<void>;
}

export interface IImageLoader {
  loadImages(imageMap: Record<string, string>): Promise<Record<string, HTMLImageElement>>;
  preloadFonts(fontNames: string[]): Promise<void>;
}

export interface ICardRendererFactory {
  createRenderer(cardState: CardState): ICardRenderer;
}
