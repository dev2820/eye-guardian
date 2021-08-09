import { createApp } from 'vue'
import { router } from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle,faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faExclamationTriangle);
library.add(faQuestionCircle);

import App from './App.vue'
const app = createApp(App);
app.component('font-awesome-icon',FontAwesomeIcon)
app.use(router);
app.mount('#app')