/**
 * Validate the request body for DALL-E image generation
 * @param {Object} body - The request body to validate
 * @returns {Object} Validation result with error if invalid
 */
export const validateGenerateRequest = (body) => {
  const errors = [];

  // Check if body exists
  if (!body) {
    return {
      isValid: false,
      error: 'Request body is required'
    };
  }

  // Validate prompt
  if (!body.prompt) {
    errors.push('Prompt is required');
  } else if (typeof body.prompt !== 'string') {
    errors.push('Prompt must be a string');
  } else if (body.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }

  // Optional parameters validation
  if (body.n !== undefined && (typeof body.n !== 'number' || body.n < 1)) {
    errors.push('n must be a positive number');
  }

  if (body.size !== undefined && typeof body.size !== 'string') {
    errors.push('size must be a string');
  }

  if (body.model !== undefined && typeof body.model !== 'string') {
    errors.push('model must be a string');
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join(', ') : null
  };
};
