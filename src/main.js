import App from './App.vue'
import { createApp } from 'vue'
import { router } from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
    faExclamationTriangle,
    faExclamation,
    faQuestionCircle,
    faSpinner,
    faCheck,
    faUndoAlt,
    faTimes,
    faInfoCircle,
    faWindowMaximize,
    faSun,
    faVolumeMute,
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons'
import {
    faSquare,
    faWindowMinimize
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faExclamationTriangle);
library.add(faExclamation);
library.add(faQuestionCircle);
library.add(faSpinner);
library.add(faCheck);
library.add(faUndoAlt);
library.add(faTimes);
library.add(faInfoCircle);
library.add(faWindowMinimize);
library.add(faWindowMaximize);
library.add(faSquare);
library.add(faSun);
library.add(faVolumeMute);
library.add(faVolumeUp);

const app = createApp(App);
app.component('font-awesome-icon',FontAwesomeIcon)
app.use(router);
app.mount('#app')