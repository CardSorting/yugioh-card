/**
 * Interface for card grouping functionality
 */
export default class ICardGrouping {
  /**
   * Group cards by ID and calculate quantities
   * @param {Array} cards Array of card objects
   * @returns {Array} Grouped cards with quantities
   */
  groupCards(cards) {
    throw new Error('groupCards must be implemented')
  }

  /**
   * Get card quantities by ID
   * @param {Array} cards Array of card objects
   * @returns {Object} Map of card ID to quantity
   */
  getQuantities(cards) {
    throw new Error('getQuantities must be implemented')
  }

  /**
   * Get section statistics
   * @param {Array} cards Array of card objects
   * @returns {Object} Statistics object with counts by type
   */
  getSectionStats(cards) {
    throw new Error('getSectionStats must be implemented')
  }

  /**
   * Check if card can be added to section
   * @param {Object} params Check parameters
   * @param {Object} params.card Card to check
   * @param {string} params.section Section to check ('main', 'extra', 'side')
   * @param {Array} params.currentCards Current cards in section
   * @returns {boolean} Whether card can be added
   */
  canAddToSection(params) {
    throw new Error('canAddToSection must be implemented')
  }

  /**
   * Get section limits
   * @param {string} section Section name
   * @returns {Object} Section limits {max, cardLimit}
   */
  getSectionLimits(section) {
    throw new Error('getSectionLimits must be implemented')
  }
}
