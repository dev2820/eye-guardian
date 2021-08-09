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
            path: '/screenFilter',
            name: 'screen-filter',
            component: require('@/components/ScreenFilter').default
        },
        {
            path: '/warningMessage',
            name: 'warning-message',
            component: require('@/components/WarningMessage').default
        },
        {
            path: '/faceProcess',
            name: 'face-process',
            component: require('@/components/FaceProcess').default
        },
        {
            path: '/stretchGuideScreen',
            name: 'stretch-guide-screen',
            component: require('@/components/StretchGuideScreen').default
        },
        {
            path: "/:catchAll(.*)",
            redirect: '/'
        }
    ]
})
