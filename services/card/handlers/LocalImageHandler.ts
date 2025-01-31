import { IImageHandler, CardImage } from '../interfaces/ICardImageService';

export class LocalImageHandler implements IImageHandler {
  canHandle(source: any): boolean {
    return source instanceof File;
  }

  async handle(file: File): Promise<CardImage> {
    return {
      file,
      url: URL.createObjectURL(file)
    };
  }
}
