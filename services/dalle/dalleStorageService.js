import supabaseStorageService from '../storage/supabaseService';
import { createClient } from '@supabase/supabase-js';

/**
 * Service for managing DALL-E generation storage and database records
 */
export class DalleStorageService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    this.bucket = 'dalle-generations';
  }

  /**
   * Generate a unique filename for a DALL-E generation
   * @param {string} userId - The user's ID
   * @returns {string} The unique filename
   */
  generateFilename(userId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 15);
    return `${userId}/${timestamp}-${random}.png`;
  }

  /**
   * Save a DALL-E generation to storage and database
   * @param {string} base64Data - The base64 image data
   * @param {string} prompt - The prompt used to generate the image
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} The saved generation record
   */
  async saveGeneration(base64Data, prompt, userId) {
    try {
      // Convert base64 to file
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Content);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const file = new File(byteArrays, 'image.png', { type: 'image/png' });

      // Upload to storage
      const filename = this.generateFilename(userId);
      const { data: storageData, error: storageError } = await this.supabase
        .storage
        .from(this.bucket)
        .upload(filename, file);

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase
        .storage
        .from(this.bucket)
        .getPublicUrl(filename);

      // Save to database
      const { data: dbData, error: dbError } = await this.supabase
        .from('dalle_generations')
        .insert({
          user_id: userId,
          prompt,
          image_url: publicUrl
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return dbData;
    } catch (error) {
      console.error('Error saving DALL-E generation:', error);
      throw error;
    }
  }

  /**
   * Mark a generation as used in a card
   * @param {string} generationId - The generation's ID
   * @param {string} cardId - The card's ID
   * @returns {Promise<Object>} The updated generation record
   */
  async markAsUsed(generationId, cardId) {
    try {
      const { data, error } = await this.supabase
        .from('dalle_generations')
        .update({ used_in_card: cardId })
        .eq('id', generationId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error marking generation as used: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error marking generation as used:', error);
      throw error;
    }
  }

  /**
   * Get all generations for a user
   * @param {string} userId - The user's ID
   * @param {Object} options - Query options
   * @param {boolean} [options.unusedOnly=false] - Only return unused generations
   * @param {number} [options.limit=20] - Maximum number of records to return
   * @returns {Promise<Array>} Array of generation records
   */
  async getUserGenerations(userId, { unusedOnly = false, limit = 20 } = {}) {
    try {
      let query = this.supabase
        .from('dalle_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unusedOnly) {
        query = query.is('used_in_card', null);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching generations: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user generations:', error);
      throw error;
    }
  }
}

export default new DalleStorageService();
