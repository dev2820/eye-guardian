const state = {
    show: false
}

const mutations = {
    SHOW_FILTER (state) {
        state.show=true
    },
    HIDE_FILTER (state) {
        state.show=false
    }
}

const actions = {
    showFilter ({ commit }) {
        commit('SHOW_FILTER')
    },
    hideFilter ({ commit }) {
        commit('HIDE_FILTER')
    }
}

export default {
    state,
    mutations,
    actions
}
