import { IImageLoader } from '../interfaces/ICardRenderer';

export class ImageLoader implements IImageLoader {
  private loadedImages: Record<string, HTMLImageElement> = {};

  async loadImages(imageMap: Record<string, string>): Promise<Record<string, HTMLImageElement>> {
    console.log('Loading images with map:', imageMap);
    this.loadedImages = {};
    const promises: Promise<void>[] = [];

    for (const [key, url] of Object.entries(imageMap)) {
      console.log(`Loading image for ${key} from ${url}`);
      promises.push(
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            this.loadedImages[key] = image;
            resolve();
          };
          image.onerror = () => {
            const error = new Error(`Failed to load image: ${url}`);
            console.error(error);
            console.error('Image load error details:', { key, url });
            reject(error);
          };
          image.src = url;
        }).catch(error => {
          console.error(error);
          // Create a fallback image
          const fallbackImage = new Image();
          fallbackImage.width = 1000;
          fallbackImage.height = 1450;
          this.loadedImages[key] = fallbackImage;
        })
      );
    }

    await Promise.all(promises);
    return this.loadedImages;
  }

  async preloadFonts(fontNames: string[]): Promise<void> {
    console.log('Preloading fonts:', fontNames);
    try {
      await Promise.all(
        fontNames.map(font => 
          document.fonts.load(`16px "${font}"`)
        )
      );
      console.log('All fonts preloaded successfully');
    } catch (error) {
      console.error('Error preloading fonts:', error);
      throw new Error('Failed to preload required fonts');
    }
  }

  async checkFontsLoaded(fontNames: string[]): Promise<boolean> {
    console.log('Checking fonts:', fontNames);
    try {
      await Promise.all(
        fontNames.map(font => 
          document.fonts.load(`16px "${font}"`)
        )
      );
      console.log('All fonts loaded successfully');
      return true;
    } catch (error) {
      console.error('Error checking fonts:', error);
      return false;
    }
  }

  getLoadedImage(key: string): HTMLImageElement | undefined {
    return this.loadedImages[key];
  }

  clearLoadedImages(): void {
    this.loadedImages = {};
  }
}

// Create a singleton instance
export const imageLoader = new ImageLoader();
