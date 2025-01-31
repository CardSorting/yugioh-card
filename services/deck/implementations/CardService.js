import ICardService from '../interfaces/ICardService'

export default class CardService extends ICardService {
  constructor(supabase) {
    super()
    this.supabase = supabase
    this.sectionRules = {
      main: {
        maxCards: 60,
        validTypes: ['Monster', 'Spell', 'Trap'],
        excludeTypes: ['Fusion', 'Synchro', 'Xyz', 'Link']
      },
      extra: {
        maxCards: 15,
        validTypes: ['Fusion', 'Synchro', 'Xyz', 'Link']
      },
      side: {
        maxCards: 15,
        validTypes: ['Monster', 'Spell', 'Trap', 'Fusion', 'Synchro', 'Xyz', 'Link']
      }
    }
  }

  /**
   * Get all available cards
   * @returns {Promise<Array>} List of cards
   */
  async getAllCards() {
    const { data, error } = await this.supabase
      .from('cards')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  /**
   * Get card by ID
   * @param {string} id Card ID
   * @returns {Promise<Object>} Card details
   */
  async getCardById(id) {
    const { data, error } = await this.supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Search cards by criteria
   * @param {Object} criteria Search criteria
   * @param {string} [criteria.name] Card name
   * @param {string} [criteria.type] Card type
   * @param {string} [criteria.attribute] Card attribute
   * @param {string} [criteria.race] Monster race/type
   * @param {number} [criteria.levelMin] Minimum level/rank
   * @param {number} [criteria.levelMax] Maximum level/rank
   * @param {number} [criteria.atkMin] Minimum ATK
   * @param {number} [criteria.atkMax] Maximum ATK
   * @param {number} [criteria.defMin] Minimum DEF
   * @param {number} [criteria.defMax] Maximum DEF
   * @returns {Promise<Array>} List of matching cards
   */
  async searchCards(criteria) {
    let query = this.supabase
      .from('cards')
      .select('*')

    if (criteria.name) {
      query = query.ilike('name', `%${criteria.name}%`)
    }

    if (criteria.type) {
      query = query.eq('card_data->>type', criteria.type)
    }

    if (criteria.attribute) {
      query = query.eq('card_data->>attribute', criteria.attribute)
    }

    if (criteria.race) {
      query = query.eq('card_data->>race', criteria.race)
    }

    if (criteria.levelMin !== undefined) {
      query = query.gte('card_data->>level', criteria.levelMin)
    }

    if (criteria.levelMax !== undefined) {
      query = query.lte('card_data->>level', criteria.levelMax)
    }

    if (criteria.atkMin !== undefined) {
      query = query.gte('card_data->>atk', criteria.atkMin)
    }

    if (criteria.atkMax !== undefined) {
      query = query.lte('card_data->>atk', criteria.atkMax)
    }

    if (criteria.defMin !== undefined) {
      query = query.gte('card_data->>def', criteria.defMin)
    }

    if (criteria.defMax !== undefined) {
      query = query.lte('card_data->>def', criteria.defMax)
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data
  }

  /**
   * Get card image URL
   * @param {string} id Card ID
   * @returns {Promise<string>} Card image URL
   */
  async getCardImageUrl(id) {
    const { data: card } = await this.supabase
      .from('cards')
      .select('image_url')
      .eq('id', id)
      .single()

    return card?.image_url
  }

  /**
   * Check if card can be added to section
   * @param {Object} params Check parameters
   * @param {Object} params.card Card object
   * @param {string} params.section Deck section (main/extra/side)
   * @param {Object} params.currentCounts Current section counts
   * @returns {boolean} Whether card can be added
   */
  canAddToSection(params) {
    const { card, section, currentCounts } = params
    const rules = this.sectionRules[section]

    // Check section size
    if (currentCounts[section] >= rules.maxCards) {
      return false
    }

    // Check card type compatibility
    const cardType = card.card_data.type
    if (section === 'main' && rules.excludeTypes.some(type => cardType.includes(type))) {
      return false
    }

    if (section === 'extra' && !rules.validTypes.some(type => cardType.includes(type))) {
      return false
    }

    // Check copy limits
    const copies = Object.values(currentCounts).reduce((sum, count) => sum + count, 0)
    return copies < this.getMaxCopies(card)
  }

  /**
   * Get maximum allowed copies of a card
   * @param {Object} card Card object
   * @returns {number} Maximum allowed copies
   */
  getMaxCopies(card) {
    // Check for special restrictions
    if (card.card_data.is_limited) return 1
    if (card.card_data.is_semi_limited) return 2
    return 3 // Default limit
  }

  /**
   * Check if card is valid for a section
   * @param {Object} params Validation parameters
   * @param {Object} params.card Card object
   * @param {string} params.section Deck section
   * @returns {boolean} Whether card is valid for section
   */
  isValidForSection(params) {
    const { card, section } = params
    const rules = this.sectionRules[section]
    const cardType = card.card_data.type

    if (section === 'main') {
      return !rules.excludeTypes.some(type => cardType.includes(type))
    }

    if (section === 'extra') {
      return rules.validTypes.some(type => cardType.includes(type))
    }

    return true // Side deck accepts all cards
  }
}
