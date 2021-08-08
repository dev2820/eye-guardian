const state = {
    show: false,
    autoSetting:false,//true일 경우 어두워지면 자동으로 밝기 조절
    blueLightFigure:0.1,//0~0.5
    darkness:0 // 0~0.5
}

const mutations = {
    SHOW_FILTER (state) {
        state.show=true
    },
    HIDE_FILTER (state) {
        state.show=false
    },
    SET_DARKNESS (state,payload) {
        state.darkness = payload;
    },
    SET_BLUELIGHTFIGURE (state,payload) {
        state.blueLightFigure = payload;
    }
}

const actions = {
    showFilter ({ commit }) {
        commit('SHOW_FILTER')
    },
    hideFilter ({ commit }) {
        commit('HIDE_FILTER')
    },
    setDarkness({commit},payload) {
        commit('SET_DARKNESS',payload)
    },
    setBlueLightFigure({commit},payload) {
        commit('SET_BLUELIGHTFIGURE',payload)
    }
}

export default {
    state,
    mutations,
    actions
}
