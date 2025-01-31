import battleService from '~/services/battleService'

export const state = () => ({
  inQueue: false,
  currentBattle: null,
  rounds: [],
  error: null,
  loading: false
})

export const mutations = {
  SET_QUEUE_STATUS(state, status) {
    state.inQueue = status
  },
  SET_CURRENT_BATTLE(state, battle) {
    state.currentBattle = battle
  },
  ADD_ROUND(state, round) {
    state.rounds.push(round)
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  RESET_STATE(state) {
    state.inQueue = false
    state.currentBattle = null
    state.rounds = []
    state.error = null
    state.loading = false
  }
}

export const actions = {
  async fetchActiveBattle({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const battle = await battleService.getActiveBattle()
      if (battle) {
        commit('SET_CURRENT_BATTLE', battle)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async joinQueue({ commit, dispatch }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      commit('SET_QUEUE_STATUS', true)

      const battle = await battleService.joinQueue()
      if (battle) {
        commit('SET_CURRENT_BATTLE', battle)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      commit('SET_QUEUE_STATUS', false)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async leaveQueue({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      await battleService.leaveQueue()
      commit('SET_QUEUE_STATUS', false)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async makeMove({ commit, state }, move) {
    if (!state.currentBattle) return

    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const result = await battleService.makeMove(state.currentBattle.id, move)
      commit('ADD_ROUND', result)

      if (result.complete) {
        commit('SET_CURRENT_BATTLE', { ...state.currentBattle, status: 'completed' })
      }

      return result
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  resetBattle({ commit }) {
    commit('RESET_STATE')
  }
}

export const getters = {
  isInQueue: state => state.inQueue,
  currentBattle: state => state.currentBattle,
  rounds: state => state.rounds,
  roundCount: state => state.rounds.length,
  isComplete: state => state.currentBattle?.status === 'completed',
  error: state => state.error,
  isLoading: state => state.loading
}
