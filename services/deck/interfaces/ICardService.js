/**
 * Interface for card operations
 */
export default class ICardService {
  /**
   * Get all available cards
   * @returns {Promise<Array>} List of cards
   */
  async getAllCards() {
    throw new Error('Not implemented')
  }

  /**
   * Get card by ID
   * @param {string} id Card ID
   * @returns {Promise<Object>} Card details
   */
  async getCardById(id) {
    throw new Error('Not implemented')
  }

  /**
   * Search cards by criteria
   * @param {Object} criteria Search criteria
   * @param {string} [criteria.name] Card name
   * @param {string} [criteria.type] Card type
   * @param {string} [criteria.attribute] Card attribute
   * @param {string} [criteria.race] Monster race/type
   * @param {number} [criteria.levelMin] Minimum level/rank
   * @param {number} [criteria.levelMax] Maximum level/rank
   * @param {number} [criteria.atkMin] Minimum ATK
   * @param {number} [criteria.atkMax] Maximum ATK
   * @param {number} [criteria.defMin] Minimum DEF
   * @param {number} [criteria.defMax] Maximum DEF
   * @returns {Promise<Array>} List of matching cards
   */
  async searchCards(criteria) {
    throw new Error('Not implemented')
  }

  /**
   * Get card image URL
   * @param {string} id Card ID
   * @returns {Promise<string>} Card image URL
   */
  async getCardImageUrl(id) {
    throw new Error('Not implemented')
  }

  /**
   * Check if card can be added to section
   * @param {Object} params Check parameters
   * @param {Object} params.card Card object
   * @param {string} params.section Deck section (main/extra/side)
   * @param {Object} params.currentCounts Current section counts
   * @returns {boolean} Whether card can be added
   */
  canAddToSection(params) {
    throw new Error('Not implemented')
  }

  /**
   * Get maximum allowed copies of a card
   * @param {Object} card Card object
   * @returns {number} Maximum allowed copies
   */
  getMaxCopies(card) {
    throw new Error('Not implemented')
  }

  /**
   * Check if card is valid for a section
   * @param {Object} params Validation parameters
   * @param {Object} params.card Card object
   * @param {string} params.section Deck section
   * @returns {boolean} Whether card is valid for section
   */
  isValidForSection(params) {
    throw new Error('Not implemented')
  }
}
