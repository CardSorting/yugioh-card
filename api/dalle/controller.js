import dalleService from '../../services/dalle/dalleService';
import { validateGenerateRequest } from './validator';
import { validateConfig } from './config';

/**
 * Handle image generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGenerateImage = async (req, res) => {
  try {
    // Validate configuration
    validateConfig();

    // Validate request
    const validation = validateGenerateRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Generate image
    const imageUrl = await dalleService.generateImage(req.body.prompt);
    
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error in handleGenerateImage:', error);
    
    // Handle different types of errors
    if (error.message === 'OpenAI API key is not configured') {
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: error.message
      });
    }

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'DALL-E API error',
        details: error.response.data
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
};
