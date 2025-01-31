import { IDalleService, GenerationResult, GenerationOptions, Generation } from './interfaces/IDalleService';
import { authStateManager } from '../auth/AuthStateManager';
import dalleStorageService from './dalleStorageService';

export class DalleService implements IDalleService {
  private apiKey: string;
  private dalleEndpoint: string;
  private chatEndpoint: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    this.apiKey = apiKey;
    this.dalleEndpoint = 'https://api.openai.com/v1/images/generations';
    this.chatEndpoint = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Ensure user is authenticated before proceeding
   */
  private ensureAuthenticated(): void {
    const authState = authStateManager.getAuthState();
    if (!authState.initialized) {
      throw new Error('Auth state not initialized');
    }
    if (!authState.user) {
      throw new Error('User not authenticated');
    }
  }

  /**
   * Generate an image using DALL-E API and save it
   */
  async generateImage(prompt: string): Promise<GenerationResult> {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      this.ensureAuthenticated();
      const authState = authStateManager.getAuthState();
      const userId = authState.user!.id;

      // Generate image
      const response = await fetch(this.dalleEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '1792x1024',
          model: 'dall-e-3',
          quality: "hd",
          response_format: 'b64_json'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
      }

      if (!data.data?.[0]?.b64_json) {
        throw new Error('No image data in response');
      }

      const base64Data = `data:image/png;base64,${data.data[0].b64_json}`;

      // Save generation
      const savedGeneration = await dalleStorageService.saveGeneration(
        base64Data,
        prompt,
        userId
      );

      return {
        ...savedGeneration,
        base64Data
      };
    } catch (error) {
      console.error('DALL-E API error:', error);
      throw error;
    }
  }

  /**
   * Mark a generation as used in a card
   */
  async markGenerationAsUsed(generationId: string, cardId: string): Promise<void> {
    this.ensureAuthenticated();
    await dalleStorageService.markAsUsed(generationId, cardId);
  }

  /**
   * Get user's DALL-E generations
   */
  async getUserGenerations(options: GenerationOptions): Promise<Generation[]> {
    this.ensureAuthenticated();
    const authState = authStateManager.getAuthState();
    return dalleStorageService.getUserGenerations(authState.user!.id, options);
  }

  /**
   * Analyze an image using GPT-4 Vision API
   */
  async analyzeImage(imageData: string): Promise<string> {
    if (!imageData) {
      throw new Error('Image data is required');
    }

    this.ensureAuthenticated();

    const isBase64 = imageData.startsWith('data:');
    const imageUrl = isBase64 ? imageData : imageData;

    try {
      const response = await fetch(this.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'What is in this image? Describe it in detail to be used as a prompt for DALL-E image generation.' },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze image');
      }

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('No description in response');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('GPT-4 Vision API error:', error);
      throw error;
    }
  }
}

export default new DalleService();
