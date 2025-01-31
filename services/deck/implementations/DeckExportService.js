import IDeckExport from '../interfaces/IDeckExport'

/**
 * Implementation of deck export operations
 */
export default class DeckExportService extends IDeckExport {
  /**
   * Export formats supported by the service
   * @private
   */
  static FORMATS = {
    JSON: {
      id: 'json',
      name: 'JSON',
      extension: '.json',
      mimeType: 'application/json'
    },
    YDK: {
      id: 'ydk',
      name: 'YGOPro Deck',
      extension: '.ydk',
      mimeType: 'text/plain'
    }
  }

  /**
   * Export deck to a specific format
   * @param {Object} deck - The deck to export
   * @param {Object} options - Export options
   * @param {string} options.format - Export format ('json', 'ydk', etc.)
   * @param {boolean} options.includeDetails - Whether to include card details
   * @returns {Promise<Blob>} Exported deck data as a Blob
   */
  async exportDeck(deck, options) {
    const format = options.format.toLowerCase()
    let content = ''

    switch (format) {
      case 'json':
        content = this.exportToJson(deck, options.includeDetails)
        break
      case 'ydk':
        content = this.exportToYdk(deck)
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }

    return new Blob(
      [content],
      { type: this.getMimeType(format) }
    )
  }

  /**
   * Get supported export formats
   * @returns {Array<Object>} Array of supported formats
   */
  getSupportedFormats() {
    return Object.values(DeckExportService.FORMATS)
  }

  /**
   * Generate filename for exported deck
   * @param {Object} deck - The deck being exported
   * @param {string} format - Export format
   * @returns {string} Generated filename with appropriate extension
   */
  generateFilename(deck, format) {
    const formatInfo = this.getFormatInfo(format)
    const safeName = (deck.name || 'deck')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    return `${safeName}${formatInfo.extension}`
  }

  /**
   * Get MIME type for export format
   * @param {string} format - Export format
   * @returns {string} MIME type for the format
   */
  getMimeType(format) {
    const formatInfo = this.getFormatInfo(format)
    return formatInfo.mimeType
  }

  /**
   * Export deck to JSON format
   * @private
   * @param {Object} deck - The deck to export
   * @param {boolean} includeDetails - Whether to include full card details
   * @returns {string} JSON string
   */
  exportToJson(deck, includeDetails) {
    const exportData = {
      name: deck.name || '',
      description: deck.description || '',
      mainDeck: this.formatCardsForExport(
        deck.deck_cards.filter(c => c.section === 'main'),
        includeDetails
      ),
      extraDeck: this.formatCardsForExport(
        deck.deck_cards.filter(c => c.section === 'extra'),
        includeDetails
      ),
      sideDeck: this.formatCardsForExport(
        deck.deck_cards.filter(c => c.section === 'side'),
        includeDetails
      )
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export deck to YDK format
   * @private
   * @param {Object} deck - The deck to export
   * @returns {string} YDK format string
   */
  exportToYdk(deck) {
    const mainDeckIds = deck.deck_cards
      .filter(c => c.section === 'main')
      .map(c => c.card_id)
    
    const extraDeckIds = deck.deck_cards
      .filter(c => c.section === 'extra')
      .map(c => c.card_id)
    
    const sideDeckIds = deck.deck_cards
      .filter(c => c.section === 'side')
      .map(c => c.card_id)

    return [
      '#created by YuGiOh Card Maker',
      '#main',
      ...mainDeckIds,
      '#extra',
      ...extraDeckIds,
      '!side',
      ...sideDeckIds,
      ''
    ].join('\n')
  }

  /**
   * Format cards for export
   * @private
   * @param {Array} cards - Cards to format
   * @param {boolean} includeDetails - Whether to include full card details
   * @returns {Array} Formatted cards
   */
  formatCardsForExport(cards, includeDetails) {
    if (includeDetails) {
      return cards.map(c => ({
        id: c.card_id,
        name: c.card.name,
        type: c.card.type,
        attribute: c.card.attribute,
        level: c.card.level,
        attack: c.card.attack,
        defense: c.card.defense
      }))
    }

    // Simple format with just card IDs and quantities
    const quantities = cards.reduce((acc, card) => {
      acc[card.card_id] = (acc[card.card_id] || 0) + 1
      return acc
    }, {})

    return Object.entries(quantities).map(([id, quantity]) => ({
      id: parseInt(id),
      quantity
    }))
  }

  /**
   * Get format info by format ID
   * @private
   * @param {string} format - Format ID
   * @returns {Object} Format information
   */
  getFormatInfo(format) {
    const formatInfo = Object.values(DeckExportService.FORMATS)
      .find(f => f.id === format.toLowerCase())

    if (!formatInfo) {
      throw new Error(`Unknown format: ${format}`)
    }

    return formatInfo
  }
}
