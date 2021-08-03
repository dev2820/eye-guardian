const state = {
    show: false
}

const mutations = {
    SHOW_BLUESCREEN (state) {
        state.show=true
    },
    HIDE_BLUESCREEN (state) {
        state.show=false
    }
}

const actions = {
    showBlueScreen ({ commit }) {
        commit('SHOW_BLUESCREEN')
    },
    hideBlueScreen ({ commit }) {
        commit('HIDE_BLUESCREEN')
    }
}

export default {
    state,
    mutations,
    actions
}
