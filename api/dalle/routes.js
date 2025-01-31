import { handleGenerateImage } from './controller';
import { dalleConfig } from './config';

export default function handler(req, res) {
  // Set CORS headers
  Object.entries(dalleConfig.corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle the request
  return handleGenerateImage(req, res);
}
