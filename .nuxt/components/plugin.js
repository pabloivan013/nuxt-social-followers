import Vue from 'vue'

const components = {
  LoadingBar: () => import('../../components/LoadingBar.vue' /* webpackChunkName: "components/loading-bar" */).then(c => c.default || c),
  LoadingCircular: () => import('../../components/LoadingCircular.vue' /* webpackChunkName: "components/loading-circular" */).then(c => c.default || c),
  Logo: () => import('../../components/Logo.vue' /* webpackChunkName: "components/logo" */).then(c => c.default || c),
  Time: () => import('../../components/Time.vue' /* webpackChunkName: "components/time" */).then(c => c.default || c),
  VuetifyLogo: () => import('../../components/VuetifyLogo.vue' /* webpackChunkName: "components/vuetify-logo" */).then(c => c.default || c),
  TwitchUserCard: () => import('../../components/twitch/TwitchUserCard.vue' /* webpackChunkName: "components/twitch-user-card" */).then(c => c.default || c),
  TwitchUserFollowersCard: () => import('../../components/twitch/TwitchUserFollowersCard.vue' /* webpackChunkName: "components/twitch-user-followers-card" */).then(c => c.default || c),
  TwitchUserFollowingCard: () => import('../../components/twitch/TwitchUserFollowingCard.vue' /* webpackChunkName: "components/twitch-user-following-card" */).then(c => c.default || c)
}

for (const name in components) {
  Vue.component(name, components[name])
  Vue.component('Lazy' + name, components[name])
}
