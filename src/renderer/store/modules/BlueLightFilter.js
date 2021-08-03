const state = {
    show: false
}

const mutations = {
    SHOW_BLUELIGHT_FILTER (state) {
        state.show=true
    },
    HIDE_BLUELIGHT_FILTER (state) {
        state.show=false
    }
}

const actions = {
    showBlueLightFilter ({ commit }) {
        commit('SHOW_BLUELIGHT_FILTER')
    },
    hideBlueLightFilter ({ commit }) {
        commit('HIDE_BLUELIGHT_FILTER')
    }
}

export default {
    state,
    mutations,
    actions
}
