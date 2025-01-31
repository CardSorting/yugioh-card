import { DeckOperationResult } from '../models/DeckOperationResult'

/**
 * Service responsible for all Vuex mutations related to deck operations
 */
export default class DeckMutationService {
  /**
   * Create a new DeckMutationService
   * @param {Object} store Vuex store instance
   */
  constructor(store) {
    this.store = store
  }

  /**
   * Update deck cards
   * @param {Array} cards New deck cards array
   * @returns {DeckOperationResult}
   */
  updateDeckCards(cards) {
    try {
      this.store.commit('deck/UPDATE_CURRENT_DECK', [...cards])
      return DeckOperationResult.success(cards)
    } catch (error) {
      return DeckOperationResult.failure('Failed to update deck cards: ' + error.message)
    }
  }

  /**
   * Save deck changes
   * @returns {Promise<DeckOperationResult>}
   */
  async saveDeckChanges() {
    try {
      await this.store.dispatch('deck/saveDeck')
      return DeckOperationResult.success()
    } catch (error) {
      return DeckOperationResult.failure('Failed to save deck changes: ' + error.message)
    }
  }

  /**
   * Get current deck cards
   * @returns {Array}
   */
  getCurrentDeckCards() {
    const currentDeck = this.store.state.deck.currentDeck
    return currentDeck?.deck_cards || []
  }

  /**
   * Update deck metadata
   * @param {Object} metadata Deck metadata
   * @param {string} metadata.name Deck name
   * @param {string} metadata.description Deck description
   * @returns {Promise<DeckOperationResult>}
   */
  async updateDeckMetadata(metadata) {
    try {
      const currentDeck = this.store.state.deck.currentDeck
      if (!currentDeck?.id) {
        return DeckOperationResult.failure('No deck loaded')
      }

      await this.store.dispatch('deck/updateDeck', {
        id: currentDeck.id,
        ...metadata
      })

      return DeckOperationResult.success()
    } catch (error) {
      return DeckOperationResult.failure('Failed to update deck metadata: ' + error.message)
    }
  }

  /**
   * Create a deep clone of deck cards
   * @param {Array} cards Cards to clone
   * @returns {Array}
   */
  cloneDeckCards(cards) {
    return cards.map(card => ({
      ...card,
      card: { ...card.card }
    }))
  }
}
