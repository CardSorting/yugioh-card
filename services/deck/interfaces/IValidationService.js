/**
 * Interface for deck validation operations
 */
export default class IValidationService {
  /**
   * Validate entire deck
   * @param {Object} deck Deck to validate
   * @returns {Object} Validation result
   * @property {boolean} isValid Whether deck is valid
   * @property {Array} errors List of validation errors
   * @property {Array} warnings List of validation warnings
   */
  validateDeck(deck) {
    throw new Error('Not implemented')
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
    throw new Error('Not implemented')
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
    throw new Error('Not implemented')
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
    throw new Error('Not implemented')
  }

  /**
   * Get deck size limits
   * @param {string} section Deck section
   * @returns {Object} Size limits
   * @property {number} min Minimum size
   * @property {number} max Maximum size
   */
  getSectionLimits(section) {
    throw new Error('Not implemented')
  }

  /**
   * Get card copy limits
   * @param {Object} card Card to check
   * @returns {Object} Copy limits
   * @property {number} min Minimum copies
   * @property {number} max Maximum copies
   */
  getCardLimits(card) {
    throw new Error('Not implemented')
  }

  /**
   * Check if deck meets tournament requirements
   * @param {Object} deck Deck to check
   * @returns {Object} Tournament validation result
   * @property {boolean} isValid Whether deck is tournament legal
   * @property {Array} violations List of tournament rule violations
   */
  validateTournamentRules(deck) {
    throw new Error('Not implemented')
  }
}
