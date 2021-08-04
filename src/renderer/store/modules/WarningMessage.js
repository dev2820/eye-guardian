const state = {
    mode: 'regular-bottom',
    // type: 'eye-blink',
    messageQueue: [],
    duration:15
}

const mutations = {
    SET_WARNING_MODE (state,payload) {
        //추후 payload의 vailidata검사 진행
        state.mode=payload
    },
    UNSHIFT_WARNING_MESSAGE (state,payload) {
        // state.messageQueue.push(payload);
        state.messageQueue.splice(state.messageQueue.length-1, 0, payload)
    },
    POP_WARNING_MESSAGE (state) {
        // state.messageQueue.shift();
        state.messageQueue.splice(state.messageQueue.length-1, 1)
    },
    CLEAR_WARNING_MESSAGE (state) {
        state.messageQueue = [];
    }
}

const actions = {
    setWarningMode ({ commit },payload) {
        commit('SET_WARNING_MODE',payload);
    },
    insertWarningMessage({commit},payload) {
        commit('UNSHIFT_WARNING_MESSAGE',payload);
        setTimeout(()=>{
            commit('POP_WARNING_MESSAGE');
        },payload.duration*1000);
    },
    shiftWarningMessage({commit},payload) {
        commit('SHIFT_WARNING_MESSAGE');
    },
    clearWarningMEssage({state,commit},payload) {
        commit('CLEAR_WARNING_MESSAGE');
    }
}

export default {
    state,
    mutations,
    actions
}
