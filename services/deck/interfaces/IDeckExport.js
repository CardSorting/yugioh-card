/**
 * Interface for deck export operations
 */
export default class IDeckExport {
  /**
   * Export deck to a specific format
   * @param {Object} deck - The deck to export
   * @param {Object} options - Export options
   * @param {string} options.format - Export format ('json', 'ydk', etc.)
   * @param {boolean} options.includeDetails - Whether to include card details
   * @returns {Promise<Blob>} Exported deck data as a Blob
   */
  async exportDeck(deck, options) {
    throw new Error('Not implemented')
  }

  /**
   * Get supported export formats
   * @returns {Array<Object>} Array of supported formats
   * @example [{ id: 'json', name: 'JSON', extension: '.json' }]
   */
  getSupportedFormats() {
    throw new Error('Not implemented')
  }

  /**
   * Generate filename for exported deck
   * @param {Object} deck - The deck being exported
   * @param {string} format - Export format
   * @returns {string} Generated filename with appropriate extension
   */
  generateFilename(deck, format) {
    throw new Error('Not implemented')
  }

  /**
   * Get MIME type for export format
   * @param {string} format - Export format
   * @returns {string} MIME type for the format
   */
  getMimeType(format) {
    throw new Error('Not implemented')
  }
}
