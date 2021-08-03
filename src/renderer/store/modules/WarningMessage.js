const state = {
    mode: 'regular-bottom',
    // type: 'eye-blink'
}

const mutations = {
    SET_WARNING_MODE (state,payload) {
        //추후 payload의 vailidata검사 진행
        state.mode=payload
    },
}

const actions = {
    setWarningMode ({ commit },payload) {
        commit('SET_WARNING_MODE',payload);
    },
}

export default {
    state,
    mutations,
    actions
}
