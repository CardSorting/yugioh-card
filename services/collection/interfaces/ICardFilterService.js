export default class ICardFilterService {
  /**
   * Apply filters to a list of cards
   * @param {Array} cards List of cards to filter
   * @param {Object} filters Filter criteria
   * @returns {Array} Filtered cards
   */
  applyFilters(cards, filters) {
    throw new Error('Method not implemented')
  }

  /**
   * Search cards by text
   * @param {Array} cards List of cards to search
   * @param {string} query Search query
   * @returns {Array} Filtered cards
   */
  searchByText(cards, query) {
    throw new Error('Method not implemented')
  }

  /**
   * Filter cards by type
   * @param {Array} cards List of cards to filter
   * @param {Array} types Card types to include
   * @returns {Array} Filtered cards
   */
  filterByType(cards, types) {
    throw new Error('Method not implemented')
  }
}
