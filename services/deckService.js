import { supabase } from '~/config/supabase'

export const deckService = {
  async createDeck({ name, description = '' }) {
    const { data, error } = await supabase
      .from('decks')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDeck({ id, name, description }) {
    const { data, error } = await supabase
      .from('decks')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDeck(id) {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getUserDecks() {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        *,
        deck_cards (
          quantity,
          section,
          card:saved_cards (
            id,
            card_data,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async addCardToDeck({ deckId, cardId, section = 'main', quantity = 1 }) {
    const { data, error } = await supabase
      .from('deck_cards')
      .upsert(
        { deck_id: deckId, card_id: cardId, section, quantity },
        { onConflict: 'deck_id,card_id' }
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeCardFromDeck({ deckId, cardId }) {
    const { error } = await supabase
      .from('deck_cards')
      .delete()
      .eq('deck_id', deckId)
      .eq('card_id', cardId)

    if (error) throw error
  },

  async updateCardQuantity({ deckId, cardId, section, quantity }) {
    if (quantity <= 0) {
      return this.removeCardFromDeck({ deckId, cardId })
    }

    const { data, error } = await supabase
      .from('deck_cards')
      .update({ quantity, section })
      .eq('deck_id', deckId)
      .eq('card_id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getDeckSectionCounts(deckId) {
    const { data, error } = await supabase
      .from('deck_cards')
      .select('section, quantity')
      .eq('deck_id', deckId)

    if (error) throw error

    const counts = {
      main: 0,
      extra: 0,
      side: 0
    }

    data.forEach(card => {
      counts[card.section] += card.quantity
    })

    return counts
  },

  // Sharing methods
  async getDeckShares(deckId) {
    const { data, error } = await supabase
      .from('deck_shares')
      .select(`
        *,
        user:users (
          id,
          email,
          username
        )
      `)
      .eq('deck_id', deckId)

    if (error) throw error
    return data
  },

  async shareDeck(params) {
    const { data: existingShare } = await supabase
      .from('deck_shares')
      .select('*')
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })
      .single()

    if (existingShare) {
      const { data, error } = await supabase
        .from('deck_shares')
        .update({
          permission: params.permission || 'view',
          updated_at: new Date().toISOString()
        })
        .match({
          deck_id: params.deckId,
          user_id: params.userId
        })
        .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('deck_shares')
      .insert({
        deck_id: params.deckId,
        user_id: params.userId,
        permission: params.permission || 'view'
      })
      .single()

    if (error) throw error
    return data
  },

  async unshareDeck(params) {
    const { error } = await supabase
      .from('deck_shares')
      .delete()
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })

    if (error) throw error
  },

  async createShareLink(params) {
    const { data, error } = await supabase
      .from('deck_share_links')
      .insert({
        deck_id: params.deckId,
        expires_at: params.expiresAt,
        token: this._generateToken()
      })
      .single()

    if (error) throw error
    return data
  },

  async deleteShareLink(token) {
    const { error } = await supabase
      .from('deck_share_links')
      .delete()
      .eq('token', token)

    if (error) throw error
  },

  _generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }
}
