import { DALLE_CONSTANTS } from './types';
import supabaseStorageService from '../storage/supabaseService';
import dalleService from './dalleService';

/**
 * Adapter for handling DALL-E image conversions and processing
 */
export class DalleImageAdapter {
  /**
   * Convert base64 data to a File object
   * @param {string} base64Data - The base64 image data (with data URI scheme)
   * @param {string} [filename='dalle-generated.png'] - The desired filename
   * @returns {Promise<File>} A File object containing the image
   */
  async base64ToFile(base64Data, filename = DALLE_CONSTANTS.DEFAULT_FILENAME) {
    try {
      // Remove data URI scheme if present
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Convert base64 to binary
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
      
      const blob = new Blob(byteArrays, { type: DALLE_CONSTANTS.MIME_TYPE });
      return new File([blob], filename, { type: DALLE_CONSTANTS.MIME_TYPE });
    } catch (error) {
      console.error('Error converting base64 to File:', error);
      throw new Error('Failed to convert image data to File');
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
   * @param {Object} generation - The DALL-E generation record
   * @param {string} cardId - The ID of the card being created
   * @returns {Promise<File>} A processed image file ready for use
   */
  async processForCardMaker(generation, cardId) {
    try {
      // Convert base64 data to File
      const file = await this.base64ToFile(generation.base64Data);
      await this.validateImage(file);

      // Upload to storage and get permanent URL
      const publicUrl = await this.uploadToStorage(file);
      
      // Mark the generation as used in this card
      await dalleService.markGenerationAsUsed(generation.id, cardId);
      
      // Create new File with public URL
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      return new File([blob], file.name, { type: file.type });
    } catch (error) {
      console.error('Error processing image for card:', error);
      throw new Error('Failed to process image for card');
    }
  }
}

export default new DalleImageAdapter();
