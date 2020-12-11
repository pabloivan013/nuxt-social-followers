<template>
  <v-card :elevation="3" class="mx-auto" max-width="350" outlined style="border: #9146ff 1px solid">
    <v-list-item three-line>
      <v-list-item-avatar tile size="100" color="grey">
        <v-img
          v-bind:src="userData.profile_image_url"
          style="border: black 1px solid"
        ></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title class=" text-center">
          <div class="text-h5 ">{{ userData.username }}</div>
        </v-list-item-title>
        <v-list-item-subtitle class="text-center h6">
          <div v-if="userData.type">
            LIVE
            <br>
            <v-icon
              color="red"
            >
              mdi-account
            </v-icon>
            {{ new Intl.NumberFormat("de-DE").format(userData.viewer_count)}}
          </div>
          <div v-else> Offline </div>
          
        </v-list-item-subtitle>
        <v-list-item class="my-0 justify-center">
          <v-btn
            class="ma-0 white--text"
            color="#9146ff"
            v-bind:href="userData.page_url"
            target="_blank"
          >
            <v-icon color="black">
              mdi-twitch
            </v-icon>
            <div class="px-1">Twitch</div>
          </v-btn>
        </v-list-item>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
export default {
  name: "TwitchUserCard",
  props: {
    userData: {}
  }
};
</script>
