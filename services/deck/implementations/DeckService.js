import IDeckService from '../interfaces/IDeckService'

export default class DeckService extends IDeckService {
  constructor(supabase) {
    super()
    this.supabase = supabase
  }

  /**
   * Create a new deck
   * @param {Object} params Deck creation parameters
   * @param {string} params.name Deck name
   * @param {string} params.description Deck description
   * @returns {Promise<Object>} Created deck
   */
  async createDeck(params) {
    const { data, error } = await this.supabase
      .from('decks')
      .insert({
        name: params.name,
        description: params.description,
        user_id: this.supabase.auth.user()?.id
      })
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update an existing deck
   * @param {Object} params Deck update parameters
   * @param {string} params.id Deck ID
   * @param {string} params.name Deck name
   * @param {string} params.description Deck description
   * @returns {Promise<Object>} Updated deck
   */
  async updateDeck(params) {
    const { data, error } = await this.supabase
      .from('decks')
      .update({
        name: params.name,
        description: params.description,
        updated_at: new Date().toISOString()
      })
      .match({ id: params.id, user_id: this.supabase.auth.user()?.id })
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a deck
   * @param {string} id Deck ID
   * @returns {Promise<void>}
   */
  async deleteDeck(id) {
    const { error } = await this.supabase
      .from('decks')
      .delete()
      .match({ id, user_id: this.supabase.auth.user()?.id })

    if (error) throw error
  }

  /**
   * Get user's decks
   * @returns {Promise<Array>} List of decks
   */
  async getUserDecks() {
    const { data, error } = await this.supabase
      .from('decks')
      .select(`
        *,
        deck_cards (
          id,
          section,
          card:saved_cards (
            id,
            card_data,
            image_url
          )
        )
      `)
      .match({ user_id: this.supabase.auth.user()?.id })
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Add card to deck
   * @param {Object} params Card addition parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @param {string} params.section Deck section (main/extra/side)
   * @returns {Promise<Object>} Added card details
   */
  async addCardToDeck(params) {
    const { data, error } = await this.supabase
      .from('deck_cards')
      .insert({
        deck_id: params.deckId,
        card_id: params.cardId,
        section: params.section
      })
      .single()

    if (error) throw error
    return data
  }

  /**
   * Remove card from deck
   * @param {Object} params Card removal parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @returns {Promise<void>}
   */
  async removeCardFromDeck(params) {
    const { error } = await this.supabase
      .from('deck_cards')
      .delete()
      .match({
        deck_id: params.deckId,
        card_id: params.cardId
      })

    if (error) throw error
  }

  /**
   * Update card quantity in deck
   * @param {Object} params Card update parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.cardId Card ID
   * @param {string} params.section Deck section
   * @param {number} params.quantity New quantity
   * @returns {Promise<Object>} Updated card details
   */
  async updateCardQuantity(params) {
    // First, remove all copies of the card
    await this.supabase
      .from('deck_cards')
      .delete()
      .match({
        deck_id: params.deckId,
        card_id: params.cardId,
        section: params.section
      })

    // Then add the new quantity
    const promises = Array(params.quantity).fill().map(() =>
      this.supabase
        .from('deck_cards')
        .insert({
          deck_id: params.deckId,
          card_id: params.cardId,
          section: params.section
        })
        .single()
    )

    const results = await Promise.all(promises)
    const error = results.find(r => r.error)
    if (error) throw error

    return results.map(r => r.data)
  }

  /**
   * Get deck section counts
   * @param {string} deckId Deck ID
   * @returns {Promise<Object>} Section counts
   */
  async getDeckSectionCounts(deckId) {
    const { data, error } = await this.supabase
      .from('deck_cards')
      .select('section')
      .match({ deck_id: deckId })

    if (error) throw error

    return {
      main: data.filter(c => c.section === 'main').length,
      extra: data.filter(c => c.section === 'extra').length,
      side: data.filter(c => c.section === 'side').length
    }
  }
}
