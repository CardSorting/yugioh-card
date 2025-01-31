import IValidationService from '../interfaces/IValidationService'

export default class ValidationService extends IValidationService {
  constructor() {
    super()
    this.customRules = new Map()
    this.sectionLimits = {
      main: { min: 40, max: 60 },
      extra: { min: 0, max: 15 },
      side: { min: 0, max: 15 }
    }
  }

  /**
   * Validate entire deck
   * @param {Object} deck Deck to validate
   * @returns {Object} Validation result
   * @property {boolean} isValid Whether deck is valid
   * @property {Array} errors List of validation errors
   * @property {Array} warnings List of validation warnings
   */
  validateDeck(deck) {
    const errors = []
    const warnings = []

    // Validate section sizes
    Object.entries(this.sectionLimits).forEach(([section, limits]) => {
      const cards = deck.deck_cards.filter(c => c.section === section)
      
      if (cards.length < limits.min) {
        errors.push(`${section} deck must have at least ${limits.min} cards`)
      }
      if (cards.length > limits.max) {
        errors.push(`${section} deck cannot exceed ${limits.max} cards`)
      }
    })

    // Validate card copies
    const cardCounts = new Map()
    deck.deck_cards.forEach(card => {
      const id = card.card.id
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1)
    })

    cardCounts.forEach((count, cardId) => {
      const card = deck.deck_cards.find(c => c.card.id === cardId)?.card
      if (!card) return

      const maxCopies = this.getCardLimits(card).max
      if (count > maxCopies) {
        errors.push(`Deck contains ${count} copies of "${card.name}" (max: ${maxCopies})`)
      }
    })

    // Validate card placement
    deck.deck_cards.forEach(({ card, section }) => {
      if (!this.canAddCard({ card, section, currentCounts: {} })) {
        errors.push(`"${card.name}" cannot be placed in ${section} deck`)
      }
    })

    // Apply custom rules
    this.customRules.forEach(rule => {
      try {
        const result = rule.validate(deck)
        if (!result.valid) {
          if (rule.isWarning) {
            warnings.push(rule.errorMessage)
          } else {
            errors.push(rule.errorMessage)
          }
        }
      } catch (error) {
        console.error(`Error applying validation rule: ${rule.name}`, error)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate deck section
   * @param {Object} params Validation parameters
   * @param {Array} params.cards Cards in section
   * @param {string} params.section Section name (main/extra/side)
   * @returns {Object} Validation result
   * @property {boolean} isValid Whether section is valid
   * @property {Array} errors List of validation errors
   * @property {Array} warnings List of validation warnings
   */
  validateSection(params) {
    const { cards, section } = params
    const errors = []
    const warnings = []
    const limits = this.sectionLimits[section]

    // Check section size
    if (cards.length < limits.min) {
      errors.push(`Section must have at least ${limits.min} cards`)
    }
    if (cards.length > limits.max) {
      errors.push(`Section cannot exceed ${limits.max} cards`)
    }

    // Check card placement
    cards.forEach(card => {
      if (!this.canAddCard({ card, section, currentCounts: {} })) {
        errors.push(`"${card.name}" cannot be placed in this section`)
      }
    })

    // Check card copies within section
    const cardCounts = new Map()
    cards.forEach(card => {
      const id = card.id
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1)
    })

    cardCounts.forEach((count, cardId) => {
      const card = cards.find(c => c.id === cardId)
      if (!card) return

      const maxCopies = this.getCardLimits(card).max
      if (count > maxCopies) {
        errors.push(`Section contains ${count} copies of "${card.name}" (max: ${maxCopies})`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Check if adding card would violate rules
   * @param {Object} params Check parameters
   * @param {Object} params.card Card to add
   * @param {string} params.section Target section
   * @param {Object} params.currentCounts Current deck counts
   * @returns {Object} Validation result
   * @property {boolean} canAdd Whether card can be added
   * @property {string} [error] Error message if card cannot be added
   */
  canAddCard(params) {
    const { card, section, currentCounts } = params

    // Check section limits
    const sectionCount = currentCounts[section] || 0
    const limits = this.sectionLimits[section]
    if (sectionCount >= limits.max) {
      return {
        canAdd: false,
        error: `${section} deck cannot exceed ${limits.max} cards`
      }
    }

    // Check card type compatibility
    const cardType = card.card_data.type
    if (section === 'main' && (
      cardType.includes('Fusion') ||
      cardType.includes('Synchro') ||
      cardType.includes('Xyz') ||
      cardType.includes('Link')
    )) {
      return {
        canAdd: false,
        error: `${cardType} monsters cannot be placed in main deck`
      }
    }

    if (section === 'extra' && !(
      cardType.includes('Fusion') ||
      cardType.includes('Synchro') ||
      cardType.includes('Xyz') ||
      cardType.includes('Link')
    )) {
      return {
        canAdd: false,
        error: 'Only Extra Deck monsters can be placed in extra deck'
      }
    }

    // Check copy limits
    const totalCopies = Object.values(currentCounts).reduce((sum, count) => sum + count, 0)
    const { max: maxCopies } = this.getCardLimits(card)
    if (totalCopies >= maxCopies) {
      return {
        canAdd: false,
        error: `Cannot add more copies of "${card.name}" (max: ${maxCopies})`
      }
    }

    return { canAdd: true }
  }

  /**
   * Register custom validation rule
   * @param {Object} rule Rule definition
   * @param {string} rule.name Rule name
   * @param {Function} rule.validate Validation function
   * @param {string} rule.errorMessage Error message
   * @param {boolean} [rule.isWarning=false] Whether rule generates warning instead of error
   */
  registerRule(rule) {
    this.customRules.set(rule.name, rule)
  }

  /**
   * Get deck size limits
   * @param {string} section Deck section
   * @returns {Object} Size limits
   * @property {number} min Minimum size
   * @property {number} max Maximum size
   */
  getSectionLimits(section) {
    return this.sectionLimits[section]
  }

  /**
   * Get card copy limits
   * @param {Object} card Card to check
   * @returns {Object} Copy limits
   * @property {number} min Minimum copies
   * @property {number} max Maximum copies
   */
  getCardLimits(card) {
    // Check for special restrictions
    if (card.card_data.is_limited) {
      return { min: 0, max: 1 }
    }
    if (card.card_data.is_semi_limited) {
      return { min: 0, max: 2 }
    }
    return { min: 0, max: 3 } // Default limit
  }

  /**
   * Check if deck meets tournament requirements
   * @param {Object} deck Deck to check
   * @returns {Object} Tournament validation result
   * @property {boolean} isValid Whether deck is tournament legal
   * @property {Array} violations List of tournament rule violations
   */
  validateTournamentRules(deck) {
    const violations = []

    // Validate main deck size
    if (deck.deck_cards.filter(c => c.section === 'main').length < 40) {
      violations.push('Main deck must contain at least 40 cards for tournament play')
    }

    // Validate forbidden cards
    deck.deck_cards.forEach(({ card }) => {
      if (card.card_data.is_forbidden) {
        violations.push(`"${card.name}" is forbidden in tournament play`)
      }
    })

    // Validate copy limits
    const cardCounts = new Map()
    deck.deck_cards.forEach(({ card }) => {
      const id = card.id
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1)
    })

    cardCounts.forEach((count, cardId) => {
      const card = deck.deck_cards.find(c => c.card.id === cardId)?.card
      if (!card) return

      const maxCopies = this.getCardLimits(card).max
      if (count > maxCopies) {
        violations.push(
          `Deck contains ${count} copies of "${card.name}" (tournament limit: ${maxCopies})`
        )
      }
    })

    return {
      isValid: violations.length === 0,
      violations
    }
  }
}
