import IFilterService from '../interfaces/IFilterService'

/**
 * Simplified filter service with basic functionality
 */
export default class FilterService extends IFilterService {
  /**
   * Apply basic filters to card list
   * @param {Array} cards List of cards to filter
   * @param {Object} filters Filter criteria
   * @param {Array} [filters.cardTypes] Basic card types to include (Monster/Spell/Trap)
   * @returns {Array} Filtered cards
   */
  applyFilters(cards, filters) {
    let filtered = [...cards]

    // Apply basic card type filter
    if (filters.cardTypes?.length > 0) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data;
        return filters.cardTypes.some(type => 
          cardData.type.toLowerCase().includes(type.toLowerCase())
        );
      });
    }

    return filtered
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
    const {
      matchName = true,
      matchDescription = true,
      caseSensitive = false
    } = options

    if (!query) return cards

    const searchQuery = caseSensitive ? query : query.toLowerCase()
    const matchText = (text) => {
      if (!text) return false
      return caseSensitive ? 
        text.includes(searchQuery) :
        text.toLowerCase().includes(searchQuery)
    }

    return cards.filter(card => {
      if (matchName && matchText(card.name)) return true
      if (matchDescription && matchText(card.description)) return true
      return false
    })
  }

  /**
   * Sort cards by name
   * @param {Array} cards List of cards to sort
   * @param {Object} criteria Sort criteria
   * @param {string} criteria.order Sort order ('asc' or 'desc')
   * @returns {Array} Sorted cards
   */
  sortCards(cards, criteria) {
    const { order = 'asc' } = criteria
    const direction = order === 'desc' ? -1 : 1

    return [...cards].sort((a, b) => {
      return direction * a.name.localeCompare(b.name)
    })
  }
}
