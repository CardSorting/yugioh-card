import IDeckState from '../interfaces/IDeckState'

/**
 * Implementation of deck state management
 */
export default class DeckStateService extends IDeckState {
  /**
   * Create a new DeckStateService
   * @param {Object} store - Vuex store instance
   */
  constructor(store) {
    super()
    this.store = store
    this.subscribers = new Set()
    
    // Watch for store changes
    store.watch(
      state => state.deck.currentDeck,
      () => this.notifySubscribers(),
      { deep: true }
    )
  }

  /**
   * Get current deck state
   * @returns {Object} Current deck state
   */
  getState() {
    return this.store.state.deck.currentDeck ? { ...this.store.state.deck.currentDeck } : null
  }

  /**
   * Update deck metadata
   * @param {Object} metadata - Deck metadata
   * @param {string} metadata.name - Deck name
   * @param {string} metadata.description - Deck description
   * @returns {Promise<void>}
   */
  async updateMetadata(metadata) {
    const currentDeck = this.getState()
    if (!currentDeck || !currentDeck.id) {
      throw new Error('No deck loaded')
    }

    await this.store.dispatch('deck/updateDeck', {
      id: currentDeck.id,
      ...metadata
    })

    this.notifySubscribers()
  }

  /**
   * Get cards in a specific section
   * @param {string} section - Section name ('main', 'extra', 'side')
   * @returns {Array} Cards in the section
   */
  getCardsInSection(section) {
    const currentDeck = this.getState()
    if (!currentDeck) return []

    return (currentDeck.deck_cards || [])
      .filter(c => c.section === section)
      .sort((a, b) => a.position - b.position)
  }

  /**
   * Get card counts by section
   * @returns {Object} Card counts { main: number, extra: number, side: number }
   */
  getCardCounts() {
    const currentDeck = this.getState()
    if (!currentDeck) {
      return { main: 0, extra: 0, side: 0 }
    }

    return (currentDeck.deck_cards || []).reduce((counts, card) => {
      counts[card.section] = (counts[card.section] || 0) + 1
      return counts
    }, { main: 0, extra: 0, side: 0 })
  }

  /**
   * Get card quantities by card ID
   * @returns {Object} Card quantities { [cardId: string]: number }
   */
  getCardQuantities() {
    const currentDeck = this.getState()
    if (!currentDeck) return {}

    return (currentDeck.deck_cards || []).reduce((quantities, card) => {
      quantities[card.card_id] = (quantities[card.card_id] || 0) + 1
      return quantities
    }, {})
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Save current state
   * @returns {Promise<void>}
   */
  async save() {
    const currentDeck = this.getState()
    if (!currentDeck || !currentDeck.id) {
      throw new Error('No deck loaded')
    }

    await this.store.dispatch('deck/saveDeck')
    // No need to call notifySubscribers here as the store watch will handle it
  }

  /**
   * Notify all subscribers of state change
   * @private
   */
  notifySubscribers() {
    const state = this.getState()
    this.subscribers.forEach(callback => {
      try {
        callback(state)
      } catch (error) {
        console.error('Error in deck state subscriber:', error)
      }
    })
  }
}
