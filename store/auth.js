import AuthService from '~/services/authService'

export const state = () => ({
  user: null,
  loading: false,
  error: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  }
}

export const actions = {
  async initAuth({ commit }) {
    try {
      commit('SET_LOADING', true)
      const user = await AuthService.getCurrentUser()
      commit('SET_USER', user)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async signUp({ commit }, { email, password }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      const { user } = await AuthService.signUp(email, password)
      commit('SET_USER', user)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async signIn({ commit }, { email, password }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      const { user } = await AuthService.signIn(email, password)
      commit('SET_USER', user)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async signOut({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      await AuthService.signOut()
      commit('SET_USER', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export const getters = {
  isAuthenticated: state => !!state.user,
  currentUser: state => state.user,
  loading: state => state.loading,
  error: state => state.error
}
