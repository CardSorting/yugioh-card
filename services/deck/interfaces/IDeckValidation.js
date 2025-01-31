/**
 * Interface for deck validation rules
 */
export default class IDeckValidation {
  /**
   * Validate the entire deck
   * @param {Object} deck - The deck to validate
   * @returns {Array<Object>} Array of validation errors
   */
  validateDeck(deck) {
    throw new Error('Not implemented')
  }

  /**
   * Validate a specific deck section
   * @param {Array} cards - Cards in the section
   * @param {string} section - Section name ('main', 'extra', 'side')
   * @returns {Array<Object>} Array of validation errors for the section
   */
  validateSection(cards, section) {
    throw new Error('Not implemented')
  }

  /**
   * Check if a card can be added to a section
   * @param {Object} card - Card to validate
   * @param {string} section - Target section
   * @param {Array} existingCards - Current cards in the section
   * @returns {Object} Validation result { isValid: boolean, error?: string }
   */
  canAddCard(card, section, existingCards) {
    throw new Error('Not implemented')
  }

  /**
   * Check if a card can be moved between sections
   * @param {Object} params - Move parameters
   * @param {Object} params.card - The card to move
   * @param {string} params.fromSection - Source section
   * @param {string} params.toSection - Target section
   * @param {Array} params.targetSectionCards - Cards in target section
   * @returns {Object} Validation result { isValid: boolean, error?: string }
   */
  canMoveCard(params) {
    throw new Error('Not implemented')
  }
}
