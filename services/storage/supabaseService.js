import { supabase, STORAGE_BUCKET } from '../../config/supabase'

class SupabaseStorageService {
  constructor() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.')
    }
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxAttempts - Maximum number of attempts
   * @returns {Promise<any>} - Result of the function
   */
  async retry(fn, maxAttempts = 3) {
    let lastError
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (attempt === maxAttempts) break
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
      }
    }
    throw lastError
  }

  /**
   * Upload a file to Supabase storage
   * @param {File|Blob} file - The file to upload
   * @param {string} filename - The name to give the file in storage
   * @returns {Promise<string>} The URL of the uploaded file
   */
  async uploadFile(file, filename) {
    return this.retry(async () => {
      try {
        console.log('Starting file upload to Supabase...', { filename })

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          })

        if (error) {
          if (error.message.includes('row-level security')) {
            throw new Error(
              'Storage permission denied. Please ensure the storage bucket has proper public access policies. See README.md for setup instructions.'
            )
          }
          throw error
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filename)

        console.log('File successfully uploaded to Supabase:', filename)
        return publicUrl
      } catch (error) {
        console.error('Error uploading to Supabase:', error)
        throw new Error(`Failed to upload file to storage: ${error.message}`)
      }
    })
  }

  /**
   * Generate a unique filename for storage
   * @param {string} originalFilename - The original filename
   * @returns {string} A unique filename
   */
  generateUniqueFilename(originalFilename) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = originalFilename.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }
}

// Create a single instance
const supabaseStorageService = new SupabaseStorageService()

export default supabaseStorageService
