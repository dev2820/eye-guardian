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
      path: '/blueScreen',
      name: 'blue-screen',
      component: require('@/components/BlueScreen').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
