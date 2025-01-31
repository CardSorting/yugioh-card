import IDeckValidation from '../interfaces/IDeckValidation'

/**
 * Simplified deck validation service
 */
export default class DeckValidationService extends IDeckValidation {
  /**
   * Validate deck size limits only
   * @param {Object} deck - The deck to validate
   * @returns {Array<Object>} Array of validation errors
   */
  validateDeck(deck) {
    const errors = []
    const deckCards = deck.deck_cards || []

    // Get cards by section
    const mainDeckCards = deckCards.filter(c => c.section === 'main')
    const extraDeckCards = deckCards.filter(c => c.section === 'extra')
    const sideDeckCards = deckCards.filter(c => c.section === 'side')

    // Validate section sizes only
    if (mainDeckCards.length < 40) {
      errors.push({
        section: 'main',
        type: 'size',
        message: 'Main deck must have at least 40 cards'
      })
    }
    if (mainDeckCards.length > 60) {
      errors.push({
        section: 'main',
        type: 'size',
        message: 'Main deck cannot exceed 60 cards'
      })
    }
    if (extraDeckCards.length > 15) {
      errors.push({
        section: 'extra',
        type: 'size',
        message: 'Extra deck cannot exceed 15 cards'
      })
    }
    if (sideDeckCards.length > 15) {
      errors.push({
        section: 'side',
        type: 'size',
        message: 'Side deck cannot exceed 15 cards'
      })
    }

    return errors
  }

  /**
   * Check if a card can be added to a section based on size limits only
   * @param {Object} card - Card to validate
   * @param {string} section - Target section
   * @param {Array} existingCards - Current cards in the section
   * @returns {Object} Validation result { isValid: boolean, error?: string }
   */
  canAddCard(card, section, existingCards) {
    if (section === 'main' && existingCards.length >= 60) {
      return {
        isValid: false,
        error: 'Main deck cannot exceed 60 cards'
      }
    }
    if ((section === 'extra' || section === 'side') && existingCards.length >= 15) {
      return {
        isValid: false,
        error: `${section === 'extra' ? 'Extra' : 'Side'} deck cannot exceed 15 cards`
      }
    }

    return { isValid: true }
  }

  /**
   * Check if a card can be moved between sections based on size limits only
   * @param {Object} params - Move parameters
   * @param {Object} params.card - The card to move
   * @param {string} params.toSection - Target section
   * @param {Array} params.targetSectionCards - Cards in target section
   * @returns {Object} Validation result { isValid: boolean, error?: string }
   */
  canMoveCard(params) {
    const { card, toSection, targetSectionCards } = params
    return this.canAddCard(card, toSection, targetSectionCards)
  }
}
