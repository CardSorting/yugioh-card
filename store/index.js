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

export const actions = {};

export const modules = {
  dalle
};
