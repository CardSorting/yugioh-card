/**
 * @typedef {Object} DalleConfig
 * @property {string} apiKey - OpenAI API key
 * @property {string} apiEndpoint - DALL-E API endpoint
 */

/**
 * @typedef {Object} DalleResponse
 * @property {Array<{url: string}>} data - Array containing generated image data
 * @property {Object} [error] - Error information if request fails
 */

/**
 * @typedef {Object} DalleRequest
 * @property {string} prompt - The image description
 * @property {number} [n=1] - Number of images to generate
 * @property {string} [size='1024x1024'] - Image size
 * @property {string} [model='dall-e-3'] - DALL-E model version
 */

/**
 * @typedef {Object} ImageProcessingResult
 * @property {File} file - Processed image file
 * @property {string} filename - Name of the processed file
 * @property {string} type - MIME type of the file
 */

export const DALLE_CONSTANTS = {
  DEFAULT_MODEL: 'dall-e-3',
  DEFAULT_SIZE: '1024x1024',
  DEFAULT_COUNT: 1,
  DEFAULT_FILENAME: 'dalle-generated.png',
  MIME_TYPE: 'image/png'
};

// Note: This file uses JSDoc for type definitions since the project appears to use JavaScript
// If migrating to TypeScript, these could be converted to proper TypeScript interfaces
