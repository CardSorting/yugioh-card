/**
 * Interface for deck state management
 */
export default class IDeckState {
  /**
   * Get current deck state
   * @returns {Object} Current deck state
   */
  getState() {
    throw new Error('Not implemented')
  }

  /**
   * Update deck metadata
   * @param {Object} metadata - Deck metadata
   * @param {string} metadata.name - Deck name
   * @param {string} metadata.description - Deck description
   * @returns {Promise<void>}
   */
  async updateMetadata(metadata) {
    throw new Error('Not implemented')
  }

  /**
   * Get cards in a specific section
   * @param {string} section - Section name ('main', 'extra', 'side')
   * @returns {Array} Cards in the section
   */
  getCardsInSection(section) {
    throw new Error('Not implemented')
  }

  /**
   * Get card counts by section
   * @returns {Object} Card counts { main: number, extra: number, side: number }
   */
  getCardCounts() {
    throw new Error('Not implemented')
  }

  /**
   * Get card quantities by card ID
   * @returns {Object} Card quantities { [cardId: string]: number }
   */
  getCardQuantities() {
    throw new Error('Not implemented')
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    throw new Error('Not implemented')
  }

  /**
   * Save current state
   * @returns {Promise<void>}
   */
  async save() {
    throw new Error('Not implemented')
  }
}
