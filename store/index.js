import dalle from './modules/dalle';

export const state = () => ({
  loading: false,
  error: null
});

export const mutations = {
  fireLoadingDialog(state) {
    state.loading = true;
  },
  closeLoadingDialog(state) {
    state.loading = false;
  },
  setError(state, error) {
    state.error = error;
  },
  clearError(state) {
    state.error = null;
  }
};

export const actions = {
  handleError({ commit }, error) {
    const errorMessage = error?.message || error || 'An error occurred';
    commit('setError', errorMessage);
    
    // Clear error after 5 seconds
    setTimeout(() => {
      commit('clearError');
    }, 5000);
  }
};

export const modules = {
  dalle
};
