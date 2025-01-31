/**
 * Service for handling DALL-E and GPT-4 Vision API interactions
 */
export class DalleService {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.dalleEndpoint = 'https://api.openai.com/v1/images/generations';
    this.chatEndpoint = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Generate an image using DALL-E API
   * @param {string} prompt - The image description
   * @returns {Promise<string>} The generated image URL
   */
  async generateImage(prompt) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
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
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
      }

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      return data.data[0].url;
    } catch (error) {
      console.error('DALL-E API error:', error);
      throw error;
    }
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
