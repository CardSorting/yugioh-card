import { ICardImageService, CardImage, IImageHandler, IImageStorage, IImageStateManager } from './interfaces/ICardImageService';
import { LocalImageHandler } from './handlers/LocalImageHandler';
import { DallEImageHandler } from './handlers/DallEImageHandler';

export class CardImageService implements ICardImageService {
  private handlers: IImageHandler[];

  constructor(
    private imageStorage: IImageStorage,
    private stateManager: IImageStateManager
  ) {
    this.handlers = [
      new LocalImageHandler(),
      new DallEImageHandler()
    ];
  }

  private async processImage(image: CardImage): Promise<CardImage> {
    try {
      // Upload to storage and get URL if not already present
      if (!image.url && image.file) {
        image.url = await this.imageStorage.upload(image.file);
      }
      
      // Update state
      this.stateManager.updateImageState(image);
      
      return image;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  private getHandler(source: any): IImageHandler {
    const handler = this.handlers.find(h => h.canHandle(source));
    if (!handler) {
      throw new Error('No handler found for image source');
    }
    return handler;
  }

  async handleLocalImage(file: File): Promise<CardImage> {
    const handler = this.getHandler(file);
    const image = await handler.handle(file);
    return this.processImage(image);
  }

  async handleRemoteImage(url: string): Promise<CardImage> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'remote-image.jpg', { type: 'image/jpeg' });
      return this.handleLocalImage(file);
    } catch (error) {
      console.error('Error handling remote image:', error);
      throw error;
    }
  }

  async handleDallEImage(file: File, generation: any): Promise<CardImage> {
    const handler = this.getHandler({ file, generation });
    const image = await handler.handle({ file, generation });
    return this.processImage(image);
  }
}
