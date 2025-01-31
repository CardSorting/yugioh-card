import dalleService from '~/services/dalle/dalleService';

export const state = () => ({
  generations: [],
  loading: false,
  error: null
});

export const mutations = {
  setGenerations(state, generations) {
    state.generations = generations;
  },
  addGeneration(state, generation) {
    state.generations.unshift(generation);
  },
  updateGeneration(state, { id, updates }) {
    const index = state.generations.findIndex(g => g.id === id);
    if (index !== -1) {
      state.generations[index] = { ...state.generations[index], ...updates };
    }
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setError(state, error) {
    state.error = error;
  }
};

export const actions = {
  resetState({ commit }) {
    commit('setGenerations', []);
    commit('setLoading', false);
    commit('setError', null);
  },

  async fetchGenerations({ commit }, options = {}) {
    try {
      commit('setLoading', true);
      commit('setError', null);
      const generations = await dalleService.getUserGenerations(options);
      commit('setGenerations', generations);
    } catch (error) {
      console.error('Error fetching generations:', error);
      commit('setError', error.message);
    } finally {
      commit('setLoading', false);
    }
  },

  async generateImage({ commit }, prompt) {
    try {
      commit('setLoading', true);
      commit('setError', null);
      const generation = await dalleService.generateImage(prompt);
      commit('addGeneration', generation);
      return generation;
    } catch (error) {
      console.error('Error generating image:', error);
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  async markAsUsed({ commit }, { generationId, cardId }) {
    try {
      const updatedGeneration = await dalleService.markGenerationAsUsed(generationId, cardId);
      commit('updateGeneration', {
        id: generationId,
        updates: { used_in_card: cardId }
      });
      return updatedGeneration;
    } catch (error) {
      console.error('Error marking generation as used:', error);
      throw error;
    }
  }
};

export const getters = {
  unusedGenerations: state => state.generations.filter(g => !g.used_in_card),
  usedGenerations: state => state.generations.filter(g => g.used_in_card),
  isLoading: state => state.loading,
  error: state => state.error
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
