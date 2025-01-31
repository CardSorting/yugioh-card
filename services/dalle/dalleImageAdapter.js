import { DALLE_CONSTANTS } from './types';
import supabaseStorageService from '../storage/supabaseService';

/**
 * Adapter for handling DALL-E image conversions and processing
 */
export class DalleImageAdapter {
  /**
   * Convert a URL to a File object
   * @param {string} imageUrl - The URL of the image
   * @param {string} [filename='dalle-generated.png'] - The desired filename
   * @returns {Promise<File>} A File object containing the image
   */
  async urlToFile(imageUrl, filename = DALLE_CONSTANTS.DEFAULT_FILENAME) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], filename, { type: DALLE_CONSTANTS.MIME_TYPE });
    } catch (error) {
      console.error('Error converting image URL to File:', error);
      throw new Error('Failed to convert image URL to File');
    }
  }

  /**
   * Validate image data
   * @param {File} file - The image file to validate
   * @returns {Promise<boolean>} True if valid, throws error if invalid
   */
  async validateImage(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    return true;
  }

  /**
   * Upload image to Supabase storage
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The URL of the uploaded file
   */
  async uploadToStorage(file) {
    try {
      const uniqueFilename = supabaseStorageService.generateUniqueFilename(file.name);
      return await supabaseStorageService.uploadFile(file, uniqueFilename);
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Failed to upload image to storage');
    }
  }

  /**
   * Process an image from DALL-E for use in the card maker
   * @param {string} imageUrl - The DALL-E generated image URL
   * @returns {Promise<File>} A processed image file ready for use
   */
  async processForCardMaker(imageUrl) {
    // Convert DALL-E URL to File
    const file = await this.urlToFile(imageUrl);
    await this.validateImage(file);

    // Upload to storage and get permanent URL
    const publicUrl = await this.uploadToStorage(file);
    
    // Create new File with public URL
    const response = await fetch(publicUrl);
    const blob = await response.blob();
    return new File([blob], file.name, { type: file.type });
  }
}

export default new DalleImageAdapter();
