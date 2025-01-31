import dalleService from '../../../services/dalle/dalleService';
import dalleImageAdapter from '../../../services/dalle/dalleImageAdapter';
import {
  SET_LOADING,
  SET_ANALYZING,
  SET_ERROR,
  SET_GENERATED_IMAGE,
  SET_UPLOADED_IMAGE,
  SET_IMAGE_DESCRIPTION,
  RESET_STATE
} from './mutations';

export default {
  /**
   * Generate an image using DALL-E
   * @param {Object} context - Vuex action context
   * @param {string} prompt - The image description
   */
  async generateImage({ commit }, prompt) {
    commit(SET_LOADING, true);
    commit(SET_ERROR, null);
    
    try {
      console.log('Sending request to generate image...');
      const imageUrl = await dalleService.generateImage(prompt);
      console.log('Image URL received:', imageUrl);
      
      commit(SET_GENERATED_IMAGE, imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      commit(SET_ERROR, error.message || 'Failed to generate image');
      throw error; // Re-throw to handle in component
    } finally {
      commit(SET_LOADING, false);
    }
  },

  /**
   * Process the generated image for use in the card maker
   * @param {Object} context - Vuex action context
   * @param {string} imageUrl - URL of the generated image
   * @returns {Promise<File>} Processed image file
   */
  async processGeneratedImage({ commit }, imageUrl) {
    try {
      return await dalleImageAdapter.processForCardMaker(imageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      commit(SET_ERROR, 'Failed to process generated image');
      throw error;
    }
  },

  /**
   * Reset the DALL-E store state
   * @param {Object} context - Vuex action context
   */
  /**
   * Analyze an uploaded image using GPT-4 Vision
   * @param {Object} context - Vuex action context
   * @param {string} imageData - Base64 encoded image data or image URL
   */
  async analyzeImage({ commit }, imageData) {
    commit(SET_ANALYZING, true);
    commit(SET_ERROR, null);
    
    try {
      console.log('Analyzing image...');
      const description = await dalleService.analyzeImage(imageData);
      console.log('Image analysis complete');
      
      commit(SET_UPLOADED_IMAGE, imageData);
      commit(SET_IMAGE_DESCRIPTION, description);
      return description;
    } catch (error) {
      console.error('Error analyzing image:', error);
      commit(SET_ERROR, error.message || 'Failed to analyze image');
      throw error;
    } finally {
      commit(SET_ANALYZING, false);
    }
  },

  resetState({ commit }) {
    commit(RESET_STATE);
  }
};
