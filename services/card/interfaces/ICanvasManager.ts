export interface CanvasConfig {
  width: number;
  height: number;
  contextType: '2d';
}

export interface ICanvasManager {
  initialize(canvas: HTMLCanvasElement, config: CanvasConfig): Promise<void>;
  getContext(): CanvasRenderingContext2D | null;
  getCanvas(): HTMLCanvasElement | null;
  clear(): void;
  resize(width: number, height: number): void;
  isInitialized(): boolean;
}
