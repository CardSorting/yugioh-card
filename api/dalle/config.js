import { DALLE_CONSTANTS } from '../../services/dalle/types';

export const dalleConfig = {
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  },
  
  requestConfig: {
    model: DALLE_CONSTANTS.DEFAULT_MODEL,
    size: DALLE_CONSTANTS.DEFAULT_SIZE,
    n: DALLE_CONSTANTS.DEFAULT_COUNT
  }
};

export const validateConfig = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  return true;
};
