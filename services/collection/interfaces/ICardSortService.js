export default class ICardSortService {
  /**
   * Sort cards by specified criteria
   * @param {Array} cards List of cards to sort
   * @param {Object} criteria Sort criteria
   * @param {string} criteria.field Field to sort by (name, type, level, atk, def)
   * @param {string} criteria.order Sort order ('asc' or 'desc')
   * @returns {Array} Sorted cards
   */
  sortCards(cards, criteria) {
    throw new Error('Method not implemented')
  }

  /**
   * Get available sort options
   * @returns {Array} List of sort options
   */
  getSortOptions() {
    throw new Error('Method not implemented')
  }

  /**
   * Validate sort criteria
   * @param {Object} criteria Sort criteria to validate
   * @returns {boolean} True if criteria is valid
   */
  isValidCriteria(criteria) {
    throw new Error('Method not implemented')
  }
}
