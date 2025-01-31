import { deckService } from '~/services/deckService'

export const state = () => ({
  decks: [],
  currentDeck: null,
  loading: false,
  error: null,
  sectionCounts: {
    main: 0,
    extra: 0,
    side: 0
  },
  deckShares: [],
  shareLinks: []
})

export const mutations = {
  SET_DECKS(state, decks) {
    state.decks = decks
  },
  SET_CURRENT_DECK(state, deck) {
    state.currentDeck = { ...deck }
  },

  UPDATE_CURRENT_DECK(state, deckCards) {
    if (state.currentDeck) {
      state.currentDeck = {
        ...state.currentDeck,
        deck_cards: deckCards
      }
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_DECK(state, deck) {
    state.decks.unshift(deck)
  },
  UPDATE_DECK(state, updatedDeck) {
    const index = state.decks.findIndex(d => d.id === updatedDeck.id)
    if (index !== -1) {
      state.decks.splice(index, 1, updatedDeck)
    }
  },
  REMOVE_DECK(state, deckId) {
    state.decks = state.decks.filter(d => d.id !== deckId)
    if (state.currentDeck?.id === deckId) {
      state.currentDeck = null
    }
  },
  SET_SECTION_COUNTS(state, counts) {
    state.sectionCounts = counts
  },
  SET_DECK_SHARES(state, shares) {
    state.deckShares = shares
  },
  SET_SHARE_LINKS(state, links) {
    state.shareLinks = links
  }
}

export const actions = {
  async loadDecks({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const decks = await deckService.getUserDecks()
      commit('SET_DECKS', decks)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createDeck({ commit }, { name, description }) {
    try {
      commit('SET_ERROR', null)
      const deck = await deckService.createDeck({ name, description })
      commit('ADD_DECK', deck)
      return deck
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateDeck({ commit }, { id, name, description }) {
    try {
      commit('SET_ERROR', null)
      const deck = await deckService.updateDeck({ id, name, description })
      commit('UPDATE_DECK', deck)
      return deck
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async deleteDeck({ commit }, deckId) {
    try {
      commit('SET_ERROR', null)
      await deckService.deleteDeck(deckId)
      commit('REMOVE_DECK', deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async addCardToDeck({ commit, dispatch }, { deckId, cardId, section, quantity }) {
    try {
      commit('SET_ERROR', null)
      await deckService.addCardToDeck({ deckId, cardId, section, quantity })
      await dispatch('loadDecks')
      await dispatch('updateSectionCounts', deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async saveDeck({ commit, state }) {
    try {
      commit('SET_ERROR', null)
      const updatedDeck = await deckService.saveDeck(state.currentDeck)
      commit('SET_CURRENT_DECK', updatedDeck)
      commit('UPDATE_DECK', updatedDeck)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeCardFromDeck({ commit, dispatch }, { deckId, cardId }) {
    try {
      commit('SET_ERROR', null)
      await deckService.removeCardFromDeck({ deckId, cardId })
      await dispatch('loadDecks')
      await dispatch('updateSectionCounts', deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateCardQuantity({ commit, dispatch }, { deckId, cardId, section, quantity }) {
    try {
      commit('SET_ERROR', null)
      await deckService.updateCardQuantity({ deckId, cardId, section, quantity })
      await dispatch('loadDecks')
      await dispatch('updateSectionCounts', deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateSectionCounts({ commit }, deckId) {
    try {
      const counts = await deckService.getDeckSectionCounts(deckId)
      commit('SET_SECTION_COUNTS', counts)
    } catch (error) {
      console.error('Error updating section counts:', error)
    }
  },

  setCurrentDeck({ commit, dispatch }, deck) {
    commit('SET_CURRENT_DECK', deck)
    if (deck) {
      dispatch('updateSectionCounts', deck.id)
    }
  },

  async loadDeckShares({ commit }, deckId) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const shares = await deckService.getDeckShares(deckId)
      commit('SET_DECK_SHARES', shares)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async shareDeck({ commit, dispatch }, params) {
    try {
      commit('SET_ERROR', null)
      await deckService.shareDeck(params)
      await dispatch('loadDeckShares', params.deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async unshareDeck({ commit, dispatch }, params) {
    try {
      commit('SET_ERROR', null)
      await deckService.unshareDeck(params)
      await dispatch('loadDeckShares', params.deckId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async createShareLink({ commit, state }, params) {
    try {
      commit('SET_ERROR', null)
      const link = await deckService.createShareLink(params)
      commit('SET_SHARE_LINKS', [...state.shareLinks, link])
      return link
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async deleteShareLink({ commit, state }, token) {
    try {
      commit('SET_ERROR', null)
      await deckService.deleteShareLink(token)
      commit('SET_SHARE_LINKS', state.shareLinks.filter(link => link.token !== token))
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

export const getters = {
  getDeckById: state => id => state.decks.find(d => d.id === id),
  getCurrentDeck: state => state.currentDeck,
  getDecks: state => state.decks,
  isLoading: state => state.loading,
  getError: state => state.error,
  getSectionCounts: state => state.sectionCounts,
  canAddToSection: state => section => {
    const count = state.sectionCounts[section] || 0
    const limits = {
      main: 60,
      extra: 15,
      side: 15
    }
    return count < limits[section]
  }
}
