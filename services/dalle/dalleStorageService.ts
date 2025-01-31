import { createClient } from '@supabase/supabase-js';
import { IDalleStorageService, Generation, GenerationOptions } from './interfaces/IDalleService';
import { authStateManager } from '../auth/AuthStateManager';

/**
 * Service for managing DALL-E generation storage and database records
 */
export class DalleStorageService implements IDalleStorageService {
  private supabase;
  private bucket: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
    this.bucket = 'dalle-generations';
  }

  /**
   * Generate a unique filename for a DALL-E generation
   */
  private generateFilename(userId: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 15);
    return `${userId}/${timestamp}-${random}.png`;
  }

  /**
   * Save a DALL-E generation to storage and database
   */
  async saveGeneration(base64Data: string, prompt: string, userId: string): Promise<Generation> {
    try {
      // Convert base64 to file
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Content);
      const byteArrays: Uint8Array[] = [];
      
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
   */
  async markAsUsed(generationId: string, cardId: string): Promise<Generation> {
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
   */
  async getUserGenerations(userId: string, { unusedOnly = false, limit = 20 }: GenerationOptions = {}): Promise<Generation[]> {
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
