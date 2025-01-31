/**
 * Interface for card filtering operations
 */
export default class IFilterService {
  /**
   * Apply filters to card list
   * @param {Array} cards List of cards to filter
   * @param {Object} filters Filter criteria
   * @param {Array} [filters.cardTypes] Card types to include
   * @param {Array} [filters.monsterTypes] Monster types to include
   * @param {Array} [filters.attributes] Attributes to include
   * @param {number} [filters.levelMin] Minimum level/rank
   * @param {number} [filters.levelMax] Maximum level/rank
   * @param {number} [filters.atkMin] Minimum ATK
   * @param {number} [filters.atkMax] Maximum ATK
   * @param {number} [filters.defMin] Minimum DEF
   * @param {number} [filters.defMax] Maximum DEF
   * @returns {Array} Filtered cards
   */
  applyFilters(cards, filters) {
    throw new Error('Not implemented')
  }

  /**
   * Search cards by text
   * @param {Array} cards List of cards to search
   * @param {string} query Search query
   * @param {Object} [options] Search options
   * @param {boolean} [options.matchName=true] Match card name
   * @param {boolean} [options.matchDescription=true] Match card description
   * @param {boolean} [options.caseSensitive=false] Case sensitive search
   * @returns {Array} Matching cards
   */
  searchByText(cards, query, options = {}) {
    throw new Error('Not implemented')
  }

  /**
   * Filter cards by type
   * @param {Array} cards List of cards to filter
   * @param {Array} types Types to include
   * @returns {Array} Filtered cards
   */
  filterByType(cards, types) {
    throw new Error('Not implemented')
  }

  /**
   * Filter monster cards by criteria
   * @param {Array} cards List of cards to filter
   * @param {Object} criteria Monster criteria
   * @param {Array} [criteria.types] Monster types to include
   * @param {Array} [criteria.attributes] Attributes to include
   * @param {Object} [criteria.level] Level/Rank range
   * @param {Object} [criteria.atk] ATK range
   * @param {Object} [criteria.def] DEF range
   * @returns {Array} Filtered cards
   */
  filterMonsters(cards, criteria) {
    throw new Error('Not implemented')
  }

  /**
   * Sort cards by criteria
   * @param {Array} cards List of cards to sort
   * @param {Object} criteria Sort criteria
   * @param {string} criteria.field Field to sort by
   * @param {string} criteria.order Sort order ('asc' or 'desc')
   * @returns {Array} Sorted cards
   */
  sortCards(cards, criteria) {
    throw new Error('Not implemented')
  }

  /**
   * Register a custom filter
   * @param {string} name Filter name
   * @param {Function} filterFn Filter function
   */
  registerFilter(name, filterFn) {
    throw new Error('Not implemented')
  }

  /**
   * Apply custom filter
   * @param {Array} cards List of cards to filter
   * @param {string} filterName Name of custom filter
   * @param {*} params Filter parameters
   * @returns {Array} Filtered cards
   */
  applyCustomFilter(cards, filterName, params) {
    throw new Error('Not implemented')
  }
}
