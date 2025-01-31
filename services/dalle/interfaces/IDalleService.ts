export interface GenerationOptions {
  unusedOnly?: boolean;
  limit?: number;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string;
  used_in_card?: string | null;
  created_at: string;
}

export interface GenerationResult extends Generation {
  base64Data?: string;
}

export interface IDalleService {
  generateImage(prompt: string): Promise<GenerationResult>;
  analyzeImage(imageData: string): Promise<string>;
  markGenerationAsUsed(generationId: string, cardId: string): Promise<void>;
  getUserGenerations(options: GenerationOptions): Promise<Generation[]>;
}

export interface IDalleStorageService {
  saveGeneration(base64Data: string, prompt: string, userId: string): Promise<Generation>;
  markAsUsed(generationId: string, cardId: string): Promise<Generation>;
  getUserGenerations(userId: string, options: GenerationOptions): Promise<Generation[]>;
}
