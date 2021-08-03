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
      path: '/blueLightFilter',
      name: 'blue-light-filter',
      component: require('@/components/BlueLightFilter').default
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
