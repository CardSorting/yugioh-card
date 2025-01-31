import ICardGrouping from '../interfaces/ICardGrouping'

/**
 * Implementation of card grouping functionality for deck sections
 */
export default class DeckCardGroupingService extends ICardGrouping {
  constructor() {
    super()
    this.sectionLimits = {
      main: { max: 60, cardLimit: 3 },
      extra: { max: 15, cardLimit: 3 },
      side: { max: 15, cardLimit: 3 }
    }
    this.groupCache = new Map()
    this.quantityCache = new Map()
    this.statsCache = new Map()
  }

  /**
   * Group cards by ID and calculate quantities
   * @param {Array} cards Array of card objects
   * @returns {Array} Grouped cards with quantities
   */
  groupCards(cards) {
    if (!Array.isArray(cards)) return []

    // Create cache key from card IDs
    const cacheKey = cards.map(c => c.id).join('-')
    
    if (this.groupCache.has(cacheKey)) {
      return this.groupCache.get(cacheKey)
    }

    const groups = new Map()
    cards.forEach(card => {
      if (!card?.id) return // Skip invalid cards
      
      const existingCard = groups.get(card.id)
      if (existingCard) {
        existingCard.quantity++
      } else {
        groups.set(card.id, {
          ...card,
          quantity: 1,
          card_data: card.card_data || {}
        })
      }
    })

    const result = Array.from(groups.values())
    this.groupCache.set(cacheKey, result)

    // Limit cache size
    if (this.groupCache.size > 100) {
      const firstKey = this.groupCache.keys().next().value
      this.groupCache.delete(firstKey)
    }

    return result
  }

  /**
   * Get card quantities by ID
   * @param {Array} cards Array of card objects
   * @returns {Object} Map of card ID to quantity
   */
  getQuantities(cards) {
    if (!Array.isArray(cards)) return {}

    // Create cache key from card IDs
    const cacheKey = cards.map(c => c.id).join('-')
    
    if (this.quantityCache.has(cacheKey)) {
      return this.quantityCache.get(cacheKey)
    }

    const quantities = cards.reduce((acc, card) => {
      if (!card?.id) return acc
      acc[card.id] = (acc[card.id] || 0) + 1
      return acc
    }, {})

    this.quantityCache.set(cacheKey, quantities)

    // Limit cache size
    if (this.quantityCache.size > 100) {
      const firstKey = this.quantityCache.keys().next().value
      this.quantityCache.delete(firstKey)
    }

    return quantities
  }

  /**
   * Get section statistics
   * @param {Array} cards Array of card objects
   * @returns {Object} Statistics object with counts by type
   */
  getSectionStats(cards) {
    if (!Array.isArray(cards)) return { monsters: 0, spells: 0, traps: 0 }

    // Create cache key from card IDs
    const cacheKey = cards.map(c => c.id).join('-')
    
    if (this.statsCache.has(cacheKey)) {
      return this.statsCache.get(cacheKey)
    }

    const stats = cards.reduce((acc, card) => {
      if (!card?.card_data?.type) return acc

      if (card.card_data.type.includes('Monster')) {
        acc.monsters++
      } else if (card.card_data.type.includes('Spell')) {
        acc.spells++
      } else if (card.card_data.type.includes('Trap')) {
        acc.traps++
      }

      return acc
    }, { monsters: 0, spells: 0, traps: 0 })

    this.statsCache.set(cacheKey, stats)

    // Limit cache size
    if (this.statsCache.size > 100) {
      const firstKey = this.statsCache.keys().next().value
      this.statsCache.delete(firstKey)
    }

    return stats
  }

  /**
   * Check if card can be added to section
   * @param {Object} params Check parameters
   * @param {Object} params.card Card to check
   * @param {string} params.section Section to check ('main', 'extra', 'side')
   * @param {Array} params.currentCards Current cards in section
   * @returns {boolean} Whether card can be added
   */
  canAddToSection({ card, section, currentCards }) {
    if (!card || !section || !Array.isArray(currentCards)) return false

    const limits = this.getSectionLimits(section)
    if (!limits) return false

    // Check section size limit
    if (currentCards.length >= limits.max) return false

    // Check card quantity limit
    const quantities = this.getQuantities(currentCards)
    if (quantities[card.id] >= limits.cardLimit) return false

    // Check if card can go in extra deck
    if (section === 'extra') {
      const isExtraDeckMonster = card.card_data?.type?.includes('Fusion') ||
        card.card_data?.type?.includes('Synchro') ||
        card.card_data?.type?.includes('Xyz') ||
        card.card_data?.type?.includes('Link')
      
      if (!isExtraDeckMonster) return false
    }

    return true
  }

  /**
   * Get section limits
   * @param {string} section Section name
   * @returns {Object} Section limits {max, cardLimit}
   */
  getSectionLimits(section) {
    return this.sectionLimits[section] || null
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.groupCache.clear()
    this.quantityCache.clear()
    this.statsCache.clear()
  }
}
