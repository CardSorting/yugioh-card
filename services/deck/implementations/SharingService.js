import IDeckService from '../interfaces/IDeckService'

export default class SharingService extends IDeckService {
  constructor(supabase) {
    super()
    this.supabase = supabase
  }

  /**
   * Share deck with another user
   * @param {Object} params Share parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.userId User ID to share with
   * @param {string} [params.permission='view'] Permission level (view/edit)
   * @returns {Promise<Object>} Share details
   */
  async shareDeck(params) {
    const { data: existingShare } = await this.supabase
      .from('deck_shares')
      .select('*')
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })
      .single()

    if (existingShare) {
      const { data, error } = await this.supabase
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

    const { data, error } = await this.supabase
      .from('deck_shares')
      .insert({
        deck_id: params.deckId,
        user_id: params.userId,
        permission: params.permission || 'view'
      })
      .single()

    if (error) throw error
    return data
  }

  /**
   * Remove deck share
   * @param {Object} params Unshare parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.userId User ID to unshare with
   * @returns {Promise<void>}
   */
  async unshareDeck(params) {
    const { error } = await this.supabase
      .from('deck_shares')
      .delete()
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })

    if (error) throw error
  }

  /**
   * Get users a deck is shared with
   * @param {string} deckId Deck ID
   * @returns {Promise<Array>} List of users and their permissions
   */
  async getDeckShares(deckId) {
    const { data, error } = await this.supabase
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
  }

  /**
   * Get decks shared with user
   * @param {string} userId User ID
   * @returns {Promise<Array>} List of shared decks
   */
  async getSharedDecks(userId) {
    const { data, error } = await this.supabase
      .from('deck_shares')
      .select(`
        permission,
        deck:decks (
          *,
          owner:users (
            id,
            email,
            username
          ),
          deck_cards (
            id,
            section,
            card:cards (*)
          )
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data.map(share => ({
      ...share.deck,
      permission: share.permission
    }))
  }

  /**
   * Check if deck is shared with user
   * @param {Object} params Check parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.userId User ID
   * @returns {Promise<boolean>} Whether deck is shared with user
   */
  async isDeckSharedWithUser(params) {
    const { data, error } = await this.supabase
      .from('deck_shares')
      .select('id')
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error
    }

    return !!data
  }

  /**
   * Get user's deck share permission
   * @param {Object} params Check parameters
   * @param {string} params.deckId Deck ID
   * @param {string} params.userId User ID
   * @returns {Promise<string|null>} Permission level or null if not shared
   */
  async getUserPermission(params) {
    const { data, error } = await this.supabase
      .from('deck_shares')
      .select('permission')
      .match({
        deck_id: params.deckId,
        user_id: params.userId
      })
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data?.permission || null
  }

  /**
   * Create a public share link
   * @param {Object} params Share parameters
   * @param {string} params.deckId Deck ID
   * @param {string} [params.expiresAt] Expiration date
   * @returns {Promise<Object>} Share link details
   */
  async createShareLink(params) {
    const { data, error } = await this.supabase
      .from('deck_share_links')
      .insert({
        deck_id: params.deckId,
        expires_at: params.expiresAt,
        token: this._generateToken()
      })
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a share link
   * @param {string} token Share token
   * @returns {Promise<void>}
   */
  async deleteShareLink(token) {
    const { error } = await this.supabase
      .from('deck_share_links')
      .delete()
      .eq('token', token)

    if (error) throw error
  }

  /**
   * Get deck by share token
   * @param {string} token Share token
   * @returns {Promise<Object|null>} Deck details or null if invalid/expired
   */
  async getDeckByShareToken(token) {
    const { data: shareLink, error: shareLinkError } = await this.supabase
      .from('deck_share_links')
      .select('*')
      .eq('token', token)
      .single()

    if (shareLinkError) throw shareLinkError

    if (!shareLink || (shareLink.expires_at && new Date(shareLink.expires_at) < new Date())) {
      return null
    }

    const { data: deck, error: deckError } = await this.supabase
      .from('decks')
      .select(`
        *,
        owner:users (
          id,
          email,
          username
        ),
        deck_cards (
          id,
          section,
          card:cards (*)
        )
      `)
      .eq('id', shareLink.deck_id)
      .single()

    if (deckError) throw deckError
    return deck
  }

  /**
   * Generate a random share token
   * @private
   * @returns {string} Share token
   */
  _generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Get user by email
   * @param {string} email User email
   * @returns {Promise<Object|null>} User details or null if not found
   */
  async getUserByEmail(email) {
    const { data, error } = await this.supabase
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
