import { createRouter,createWebHashHistory  } from 'vue-router';

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [ 
        {
            path: '/',
            name: 'setting-page',
            component: ()=> import('../components/SettingPage')
        },
        {
            path: '/warningMessage',
            name: 'warning-message',
            component: ()=> import('../components/WarningMessage')
        },
        {
            path: "/:catchAll(.*)",
            redirect: '/'
        }
    ]
})
