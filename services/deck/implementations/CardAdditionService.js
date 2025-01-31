import { DeckOperationResult } from '../models/DeckOperationResult'
import { ICardAdditionStrategy } from '../interfaces/IDeckOperation'

/**
 * Service responsible for card addition operations
 */
export default class CardAdditionService extends ICardAdditionStrategy {
  /**
   * Create a new CardAdditionService
   * @param {Object} validationService Validation service instance
   * @param {Object} mutationService Mutation service instance
   */
  constructor(validationService, mutationService) {
    super()
    this.validationService = validationService
    this.mutationService = mutationService
  }

  /**
   * Validate card addition
   * @param {Object} card Card to add
   * @param {string} section Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async validateAddition(card, section) {
    try {
      const existingCards = this.mutationService.getCurrentDeckCards()
        .filter(c => c.section === section)

      const validation = this.validationService.canAddCard(card, section, existingCards)

      if (!validation.isValid) {
        return DeckOperationResult.failure(validation.error || 'Cannot add card to deck')
      }

      return DeckOperationResult.success()
    } catch (error) {
      return DeckOperationResult.failure('Failed to validate card addition: ' + error.message)
    }
  }

  /**
   * Execute card addition
   * @param {Object} card Card to add
   * @param {string} section Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async executeAddition(card, section) {
    try {
      // Get current deck cards
      const currentCards = this.mutationService.getCurrentDeckCards()
      const sectionCards = currentCards.filter(c => c.section === section)

      // Create new card entry
      const newCard = {
        card_id: card.id,
        card: card,
        section: section,
        position: sectionCards.length
      }

      // Create new deck cards array with addition
      const updatedCards = [...currentCards, newCard]

      // Update store
      const updateResult = this.mutationService.updateDeckCards(updatedCards)
      if (!updateResult.successful) {
        return updateResult
      }

      // Save changes
      const saveResult = await this.mutationService.saveDeckChanges()
      if (!saveResult.successful) {
        return saveResult
      }

      return DeckOperationResult.success(newCard)
    } catch (error) {
      return DeckOperationResult.failure('Failed to execute card addition: ' + error.message)
    }
  }

  /**
   * Add a card to the deck
   * @param {Object} card Card to add
   * @param {string} section Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async addCard(card, section) {
    // Validate first
    const validationResult = await this.validateAddition(card, section)
    if (!validationResult.successful) {
      return validationResult
    }

    // Execute addition
    return this.executeAddition(card, section)
  }
}
