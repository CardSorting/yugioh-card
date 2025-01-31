import { DeckOperationResult } from '../models/DeckOperationResult'
import { ICardRemovalStrategy } from '../interfaces/IDeckOperation'

/**
 * Service responsible for card removal operations
 */
export default class CardRemovalService extends ICardRemovalStrategy {
  /**
   * Create a new CardRemovalService
   * @param {Object} validationService Validation service instance
   * @param {Object} mutationService Mutation service instance
   */
  constructor(validationService, mutationService) {
    super()
    this.validationService = validationService
    this.mutationService = mutationService
  }

  /**
   * Validate card removal
   * @param {Object} card Card to remove
   * @returns {Promise<DeckOperationResult>}
   */
  async validateRemoval(card) {
    try {
      // Get current deck cards
      const currentCards = this.mutationService.getCurrentDeckCards()

      // Check if card exists in deck
      const cardExists = currentCards.some(c => 
        c.card_id === card.id && c.section === card.section
      )

      if (!cardExists) {
        return DeckOperationResult.failure('Card not found in deck')
      }

      return DeckOperationResult.success()
    } catch (error) {
      return DeckOperationResult.failure('Failed to validate card removal: ' + error.message)
    }
  }

  /**
   * Execute card removal
   * @param {Object} card Card to remove
   * @returns {Promise<DeckOperationResult>}
   */
  async executeRemoval(card) {
    try {
      // Get current deck cards
      const currentCards = this.mutationService.getCurrentDeckCards()

      // Find card to remove
      const index = currentCards.findIndex(c => 
        c.card_id === card.id && c.section === card.section
      )

      if (index === -1) {
        return DeckOperationResult.failure('Card not found in deck')
      }

      // Create new array without the card
      const updatedCards = [...currentCards]
      const removedCard = updatedCards.splice(index, 1)[0]

      // Update positions for remaining cards in the section
      updatedCards
        .filter(c => c.section === card.section)
        .forEach((c, i) => {
          c.position = i
        })

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

      return DeckOperationResult.success(removedCard)
    } catch (error) {
      return DeckOperationResult.failure('Failed to execute card removal: ' + error.message)
    }
  }

  /**
   * Remove a card from the deck
   * @param {Object} card Card to remove
   * @returns {Promise<DeckOperationResult>}
   */
  async removeCard(card) {
    // Validate first
    const validationResult = await this.validateRemoval(card)
    if (!validationResult.successful) {
      return validationResult
    }

    // Execute removal
    return this.executeRemoval(card)
  }
}
