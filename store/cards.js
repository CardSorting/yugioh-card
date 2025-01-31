import { supabase } from '~/config/supabase'

export const state = () => ({
  allCards: [],
  loading: false,
  error: null
})

export const mutations = {
  SET_CARDS(state, cards) {
    state.allCards = cards
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

export const actions = {
  async fetchCards({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const { data: savedCards, error } = await supabase
        .from('saved_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our needs
      const cards = savedCards.map(card => ({
        id: card.id,
        name: card.card_data.name,
        description: card.card_data.description || '',
        type: card.card_data.type,
        attribute: card.card_data.attribute,
        level: card.card_data.level,
        atk: card.card_data.atk,
        def: card.card_data.def,
        image_url: card.image_url,
        card_data: card.card_data
      }))

      commit('SET_CARDS', cards)
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error('Error fetching cards:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export const getters = {
  getCardById: state => id => state.allCards.find(card => card.id === id),
  getCardsByType: state => type => state.allCards.filter(card => card.type === type),
  getCardsByAttribute: state => attribute => state.allCards.filter(card => card.attribute === attribute),
  getCardsByLevel: state => level => state.allCards.filter(card => card.level === level)
}
