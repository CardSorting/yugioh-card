import { IImageHandler, CardImage } from '../interfaces/ICardImageService';

export class DallEImageHandler implements IImageHandler {
  canHandle(source: any): boolean {
    return source && source.hasOwnProperty('generation') && source.file instanceof File;
  }

  async handle(source: { file: File; generation: any }): Promise<CardImage> {
    return {
      file: source.file,
      url: URL.createObjectURL(source.file),
      generation: source.generation
    };
  }
}
