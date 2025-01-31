import { IImageStorage } from '../interfaces/ICardImageService';
import { supabase } from '~/config/supabase';

export class SupabaseImageStorage implements IImageStorage {
  private async getUserId(): Promise<string> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  async upload(file: File): Promise<string> {
    try {
      const userId = await this.getUserId();
      const uniqueId = crypto.randomUUID();
      const filename = `${userId}/${uniqueId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(filename, file, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async delete(url: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const filename = url.split('/').pop();
      if (!filename) throw new Error('Invalid URL');

      const { error } = await supabase.storage
        .from('card-images')
        .remove([`${userId}/${filename}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}
