import { ICanvasManager, CanvasConfig } from '../interfaces/ICanvasManager';

export class CanvasManager implements ICanvasManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private initialized: boolean = false;

  async initialize(canvas: HTMLCanvasElement, config: CanvasConfig): Promise<void> {
    try {
      console.log('Initializing canvas manager...');
      
      if (!canvas) {
        throw new Error('Canvas element is required for initialization');
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext(config.contextType);

      if (!this.ctx) {
        throw new Error('Failed to get 2D context from canvas');
      }

      // Set canvas dimensions
      this.resize(config.width, config.height);

      // Test context by drawing a pixel
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, 1, 1);
      this.clear();

      console.log('Canvas initialized with dimensions:', config.width, 'x', config.height);
      console.log('Canvas context properties:', {
        fillStyle: this.ctx.fillStyle,
        font: this.ctx.font,
        textAlign: this.ctx.textAlign,
        textBaseline: this.ctx.textBaseline
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      this.initialized = false;
      throw error;
    }
  }

  getContext(): CanvasRenderingContext2D | null {
    if (!this.initialized) {
      console.warn('Attempting to get context before initialization');
    }
    return this.ctx;
  }

  getCanvas(): HTMLCanvasElement | null {
    if (!this.initialized) {
      console.warn('Attempting to get canvas before initialization');
    }
    return this.canvas;
  }

  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      console.warn('Attempting to clear uninitialized canvas');
    }
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      console.log('Resizing canvas to:', width, 'x', height);
      this.canvas.width = width;
      this.canvas.height = height;
    } else {
      console.warn('Attempting to resize uninitialized canvas');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Create a singleton instance
export const canvasManager = new CanvasManager();
