/**
 * Interface for deck operations
 */
export default class IDeckService {
  /**
   * Create a new deck
   * @param {Object} params Deck creation parameters
   * @param {string} params.name Deck name
   * @param {string} params.description Deck description
   * @returns {Promise<Object>} Created deck
   */
  async createDeck(params) {
    throw new Error('Not implemented')
  }

  /**
   * Update an existing deck
   * @param {Object} params Deck update parameters
   * @param {string} params.id Deck ID
   * @param {string} params.name Deck name
   * @param {string} params.description Deck description
   * @returns {Promise<Object>} Updated deck
   */
  async updateDeck(params) {
    throw new Error('Not implemented')
  }

  /**
   * Delete a deck
   * @param {string} id Deck ID
   * @returns {Promise<void>}
   */
  async deleteDeck(id) {
    throw new Error('Not implemented')
  }

  /**
   * Get user's decks
   * @returns {Promise<Array>} List of decks
   */
  async getUserDecks() {
    throw new Error('Not implemented')
  }

  /**
   * Add card to deck
   * @param {Object} params Card addition parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @param {string} params.section Deck section (main/extra/side)
   * @param {number} params.quantity Card quantity
   * @returns {Promise<Object>} Added card details
   */
  async addCardToDeck(params) {
    throw new Error('Not implemented')
  }

  /**
   * Remove card from deck
   * @param {Object} params Card removal parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @returns {Promise<void>}
   */
  async removeCardFromDeck(params) {
    throw new Error('Not implemented')
  }

  /**
   * Update card quantity in deck
   * @param {Object} params Card update parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @param {string} params.section Deck section
   * @param {number} params.quantity New quantity
   * @returns {Promise<Object>} Updated card details
   */
  async updateCardQuantity(params) {
    throw new Error('Not implemented')
  }

  /**
   * Get deck section counts
   * @param {string} deckId Deck ID
   * @returns {Promise<Object>} Section counts
   */
  async getDeckSectionCounts(deckId) {
    throw new Error('Not implemented')
  }
}
