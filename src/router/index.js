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
            component: require('@/components/WarningMessage').default
        },
        {
            path: "/:catchAll(.*)",
            redirect: '/'
        }
    ]
})
