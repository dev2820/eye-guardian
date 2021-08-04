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
      path: '*',
      redirect: '/'
    }
  ]
})
