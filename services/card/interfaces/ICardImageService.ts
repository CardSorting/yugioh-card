export interface CardImage {
  file: File;
  url?: string;
  generation?: any;
}

export interface IImageHandler {
  canHandle(source: any): boolean;
  handle(source: any): Promise<CardImage>;
}

export interface IImageStorage {
  upload(file: File): Promise<string>;
  delete(url: string): Promise<void>;
}

export interface IImageStateManager {
  updateImageState(image: CardImage): void;
  getImageState(): CardImage;
}

export interface ICardImageService {
  handleLocalImage(file: File): Promise<CardImage>;
  handleRemoteImage(url: string): Promise<CardImage>;
  handleDallEImage(file: File, generation: any): Promise<CardImage>;
}
