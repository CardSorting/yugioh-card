import { createClient } from '@supabase/supabase-js';
import dalleStorageService from './dalleStorageService';

/**
 * Service for handling DALL-E and GPT-4 Vision API interactions
 */
export class DalleService {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.dalleEndpoint = 'https://api.openai.com/v1/images/generations';
    this.chatEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  /**
   * Generate an image using DALL-E API and save it
   * @param {string} prompt - The image description
   * @returns {Promise<Object>} The generation record including the image URL
   */
  async generateImage(prompt) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

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
        user.id
      );

      return {
        ...savedGeneration,
        base64Data // Include base64 data for immediate use
      };
    } catch (error) {
      console.error('DALL-E API error:', error);
      throw error;
    }
  }

  /**
   * Mark a generation as used in a card
   * @param {string} generationId - The generation's ID
   * @param {string} cardId - The card's ID
   */
  async markGenerationAsUsed(generationId, cardId) {
    return dalleStorageService.markAsUsed(generationId, cardId);
  }

  /**
   * Get user's DALL-E generations
   * @param {Object} options - Query options
   */
  async getUserGenerations(options) {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    if (userError) throw new Error('User not authenticated');

    return dalleStorageService.getUserGenerations(user.id, options);
  }

  /**
   * Analyze an image using GPT-4 Vision API
   * @param {string} imageData - Base64 encoded image or image URL
   * @returns {Promise<string>} The image description
   */
  async analyzeImage(imageData) {
    if (!imageData) {
      throw new Error('Image data is required');
    }

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
