import { DeckOperationResult } from '../models/DeckOperationResult'
import { ICardMovementStrategy } from '../interfaces/IDeckOperation'

/**
 * Service responsible for card movement operations
 */
export default class CardMovementService extends ICardMovementStrategy {
  /**
   * Create a new CardMovementService
   * @param {Object} validationService Validation service instance
   * @param {Object} mutationService Mutation service instance
   */
  constructor(validationService, mutationService) {
    super()
    this.validationService = validationService
    this.mutationService = mutationService
  }

  /**
   * Validate card movement
   * @param {Object} card Card to move
   * @param {string} fromSection Source section
   * @param {string} toSection Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async validateMovement(card, fromSection, toSection) {
    try {
      // Get current cards in target section
      const currentCards = this.mutationService.getCurrentDeckCards()
      const targetSectionCards = currentCards.filter(c => c.section === toSection)

      // Validate using validation service
      const validation = this.validationService.canMoveCard({
        card,
        fromSection,
        toSection,
        targetSectionCards
      })

      if (!validation.isValid) {
        return DeckOperationResult.failure(validation.error || 'Cannot move card')
      }

      return DeckOperationResult.success()
    } catch (error) {
      return DeckOperationResult.failure('Failed to validate card movement: ' + error.message)
    }
  }

  /**
   * Execute card movement
   * @param {Object} card Card to move
   * @param {string} fromSection Source section
   * @param {string} toSection Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async executeMovement(card, fromSection, toSection) {
    try {
      // Get current deck cards
      const currentCards = this.mutationService.getCurrentDeckCards()

      // Find card to move
      const cardToMove = currentCards.find(c => 
        c.card_id === card.id && c.section === fromSection
      )

      if (!cardToMove) {
        return DeckOperationResult.failure('Card not found in source section')
      }

      // Get target section cards for position calculation
      const targetSectionCards = currentCards.filter(c => c.section === toSection)

      // Create new array with updated card
      const updatedCards = currentCards.map(c => 
        c === cardToMove
          ? { ...c, section: toSection, position: targetSectionCards.length }
          : c
      )

      // Update positions for both sections
      updatedCards
        .filter(c => c.section === fromSection || c.section === toSection)
        .forEach((c, i) => {
          if (c.section === fromSection) {
            c.position = i
          } else if (c.section === toSection) {
            c.position = i
          }
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

      return DeckOperationResult.success(cardToMove)
    } catch (error) {
      return DeckOperationResult.failure('Failed to execute card movement: ' + error.message)
    }
  }

  /**
   * Move a card between sections
   * @param {Object} card Card to move
   * @param {string} fromSection Source section
   * @param {string} toSection Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async moveCard(card, fromSection, toSection) {
    // Validate first
    const validationResult = await this.validateMovement(card, fromSection, toSection)
    if (!validationResult.successful) {
      return validationResult
    }

    // Execute movement
    return this.executeMovement(card, fromSection, toSection)
  }
}
