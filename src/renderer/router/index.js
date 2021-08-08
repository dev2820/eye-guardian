import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    //},    
    {
      path: '/',
      name: 'setting-page',
      component: require('@/components/SettingPage').default
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
      path: '*',
      redirect: '/'
    }
  ]
})
