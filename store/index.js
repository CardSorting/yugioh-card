import dalleModule from './modules/dalle';

export const state = () => ({
  loading: false,
  error: null
})

export const mutations = {
  fireLoadingDialog(state) {
    state.loading = true
  },
  closeLoadingDialog(state) {
    state.loading = false
  },
  setError(state, error) {
    state.error = error
  },
  clearError(state) {
    state.error = null
  }
}

export const actions = {
  handleError({ commit }, error) {
    commit('setError', error.message || 'An error occurred')
    commit('closeLoadingDialog')
  }
}

export const getters = {
  hasError: state => !!state.error
}

export const modules = {
  dalle: dalleModule
}
