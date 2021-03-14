<template>
  <v-app dark>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-switch
        class="pt-5"
        :prepend-icon="'mdi-weather-sunny'"
        v-model="darkTheme"
        @click="$vuetify.theme.dark=darkTheme"
        :append-icon="'mdi-weather-night'"
      ></v-switch>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Followers',
          to: '/followers'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      darkTheme: false,
      title: 'Social followers'
    }
  }
}
</script>
