import IDeckOperations from '../interfaces/IDeckOperations'
import IDeckValidation from '../interfaces/IDeckValidation'
import IDeckState from '../interfaces/IDeckState'

/**
 * Implementation of deck operations
 */
export default class DeckOperationsService extends IDeckOperations {
  /**
   * Create a new DeckOperationsService
   * @param {IDeckValidation} validationService - Service for validating operations
   * @param {IDeckState} stateService - Service for managing deck state
   */
  constructor(validationService, stateService) {
    super()
    this.validationService = validationService
    this.stateService = stateService
  }

  /**
   * Add a card to a specific section of the deck
   * @param {Object} card - The card to add
   * @param {string} section - The section to add the card to ('main', 'extra', 'side')
   * @returns {Promise<void>}
   */
  async addCard(card, section) {
    const existingCards = this.stateService.getCardsInSection(section)
    const validation = this.validationService.canAddCard(card, section, existingCards)

    if (!validation.isValid) {
      throw new Error(validation.error || 'Cannot add card to deck')
    }

    const state = this.stateService.getState()
    const deckCards = [...(state.deck_cards || [])]

    // Add new card
    deckCards.push({
      card_id: card.id,
      card: card,
      section: section,
      position: existingCards.length
    })

    // First update store through mutation
    this.stateService.store.commit('deck/UPDATE_CURRENT_DECK', deckCards)
    
    // Then save changes
    await this.stateService.save()
  }

  /**
   * Remove a card from the deck
   * @param {Object} card - The card to remove
   * @returns {Promise<void>}
   */
  async removeCard(card) {
    const state = this.stateService.getState()
    const deckCards = [...(state.deck_cards || [])]

    // Find and remove card
    const index = deckCards.findIndex(c => 
      c.card_id === card.id && c.section === card.section
    )

    if (index === -1) {
      throw new Error('Card not found in deck')
    }

    deckCards.splice(index, 1)

    // Update positions for remaining cards in the section
    deckCards
      .filter(c => c.section === card.section)
      .forEach((c, i) => {
        c.position = i
      })

    // First update store through mutation
    this.stateService.store.commit('deck/UPDATE_CURRENT_DECK', deckCards)
    
    // Then save changes
    await this.stateService.save()
  }

  /**
   * Move a card between deck sections
   * @param {Object} params - Move parameters
   * @param {Object} params.card - The card to move
   * @param {string} params.fromSection - Source section
   * @param {string} params.toSection - Target section
   * @returns {Promise<void>}
   */
  async moveCard(params) {
    const { card, fromSection, toSection } = params
    const targetSectionCards = this.stateService.getCardsInSection(toSection)

    const validation = this.validationService.canMoveCard({
      card,
      fromSection,
      toSection,
      targetSectionCards
    })

    if (!validation.isValid) {
      throw new Error(validation.error || 'Cannot move card')
    }

    const state = this.stateService.getState()
    const deckCards = [...(state.deck_cards || [])]

    // Find card to move
    const cardToMove = deckCards.find(c => 
      c.card_id === card.id && c.section === fromSection
    )

    if (!cardToMove) {
      throw new Error('Card not found in source section')
    }

    // Update section and position
    cardToMove.section = toSection
    cardToMove.position = targetSectionCards.length

    // Update positions for both sections
    deckCards
      .filter(c => c.section === fromSection || c.section === toSection)
      .forEach((c, i) => {
        if (c.section === fromSection) {
          c.position = i
        } else if (c.section === toSection) {
          c.position = i
        }
      })

    // First update store through mutation
    this.stateService.store.commit('deck/UPDATE_CURRENT_DECK', deckCards)
    
    // Then save changes
    await this.stateService.save()
  }
}
