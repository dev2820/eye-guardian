import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle,faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faExclamationTriangle);
library.add(faQuestionCircle);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.component('font-awesome-icon',FontAwesomeIcon)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
