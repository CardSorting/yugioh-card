/**
 * Interface for deck card operations
 */
export default class IDeckOperations {
  /**
   * Add a card to a specific section of the deck
   * @param {Object} card - The card to add
   * @param {string} section - The section to add the card to ('main', 'extra', 'side')
   * @returns {Promise<void>}
   */
  async addCard(card, section) {
    throw new Error('Not implemented')
  }

  /**
   * Remove a card from the deck
   * @param {Object} card - The card to remove
   * @returns {Promise<void>}
   */
  async removeCard(card) {
    throw new Error('Not implemented')
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
    throw new Error('Not implemented')
  }
}
