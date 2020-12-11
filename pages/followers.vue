<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-card
            elevation="3"
            :loading="loading_username"
            v-bind:style="{ border: '' + platform.color + ' 2px solid' }"
          >
            <v-card-title>Search username</v-card-title>
            <v-divider></v-divider>
            <v-form>
              <v-container>
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      style="height:60px"
                      v-bind:color="platform.color"
                      label="Username"
                      v-model="username"
                      :loading="loading_username"
                      v-on:keydown.enter.prevent
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" sm="4" md="4">
                    <div
                      v-if="!loading_username && !valid_username && username"
                    >
                      <v-alert class="my-0" dense type="error">
                        Not Found</v-alert
                      >
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
            <v-card-actions>
              <v-row no-gutters>
                <v-col cols="12" sm="6" md="6">
                  <v-btn
                    :disabled="!valid_username || !username_data"
                    v-bind:color="platform.color"
                    @click="getUserFollowType(FOLLOWTYPE.FOLLOWING)"
                  >
                    Following
                  </v-btn>
                  <v-btn
                    :disabled="!valid_username || !username_data"
                    v-bind:color="platform.color"
                    @click="getUserFollowType(FOLLOWTYPE.FOLLOWERS)"
                  >
                    Followers
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="text-center">
                  <div v-if="loading_follows">
                    <v-progress-circular
                      indeterminate
                      v-bind:color="platform.color"
                    ></v-progress-circular>
                  </div>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col sm="6" md="6">
          <v-row>
            <v-col>
              <div v-if="valid_username">
                <twitch-user-card :userData="username_data" />
              </div>
            </v-col>
          </v-row>
          <v-row class="text-center">
            <v-col class="py-0">
              <div v-if="user_follows.total >= 0">
                <v-chip
                  class="ma-2 text-center text-h6"
                  v-bind:color="platform.color"
                  label
                >
                  {{ query_follow_type.toUpperCase() }}:
                  {{
                    new Intl.NumberFormat("de-DE").format(user_follows.total)
                  }}
                  <v-icon right>
                    mdi-account-outline
                  </v-icon>
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="user_follows.total">
        <v-col>
          <v-card elevation="3">
            <v-container>
              <v-row>
                <v-col v-for="user in user_follows.info" :key="user.user_id">
                  <twitch-user-following-card :userData="user" />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-row
        v-if="!(!valid_username || !username_data || !query_follow_type)"
        class="text-center"
      >
        <v-col>
          <v-btn
            :disabled="pagination_cursor === 'end'"
            v-bind:color="platform.color"
            rounded
            @click="getUserFollowType(query_follow_type, pagination_cursor)"
          >
            <div v-if="loading_follows">
              <v-progress-circular
                size="25"
                indeterminate
                color="black"
              ></v-progress-circular>
            </div>
            <div v-else>
              <v-icon dark>
                mdi-plus
              </v-icon>
            </div>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import _ from "lodash";
import Time from "../components/Time.vue";
import LoadingCircular from "../components/LoadingCircular.vue";
import LoadingBar from "../components/LoadingBar.vue";

import TwitchUserCard from "../components/twitch/TwitchUserCard.vue";
import TwitchUserFollowingCard from "../components/twitch/TwitchUserFollowingCard.vue";

const FOLLOWTYPE = {
  FOLLOWING: 'following',
  FOLLOWERS: 'followers'
}

const PLATFORMTYPE = {
  TWITCH: {name:'twitch', color:'#9146ff'}
}

export default {
  data() {
    return {
      username: "",
      username_data: "",
      valid_username: false,
      loading_username: false,

      FOLLOWTYPE: FOLLOWTYPE,
      PLATFORMTYPE: PLATFORMTYPE,

      platform: PLATFORMTYPE.TWITCH,

      user_follows: {},
      loading_follows: false,
      query_follow_type: "", // following or follower
      pagination_cursor: "",

    };
  },
  watch: {
    username: function(newUsername, oldUsername) {
      this.loading_username = true;
      this.user_follows = {};
      this.query_follow_type = "";
      this.pagination_cursor = "";
      this.debouncedUser();
    }
  },
  created: function() {
    this.debouncedUser = _.debounce(this.getUserData, 500);
  },
  methods: {
    getUserData: async function() {
      this.loading_username = true;
      this.valid_username = false;

      var apiResponse = await fetch(
        `/api/${this.platform.name}/data?username=${this.username}`
      ).then(res => res.json());
      console.log(apiResponse);

      if (apiResponse.success) {
        if (apiResponse.data) {
          this.username_data = apiResponse.data[0];
          this.valid_username = true;
        } else {
          this.username_data = "Not found";
        }
      }

      this.loading_username = false;
    },
    getUserFollowType: async function(followType, cursor = undefined) {
      //this.user_follows = {}
      
      this.loading_follows = true;

      let url =
        `/api/${this.platform.name}/${followType}` +
        `?username=${this.username}` +
        `&id=${this.username_data.user_id}` +
        `${cursor ? "&cursor=" + cursor : ""}`; 

      var apiResponse = await fetch(url).then(res => res.json());

      console.log("Follow:", apiResponse);
      this.loading_follows = false;

      if (apiResponse.success && apiResponse.data) {
        this.pagination_cursor = apiResponse.data.cursor;
        if (cursor && _.has(this.user_follows, "info")) {
          Array.prototype.push.apply(
            this.user_follows.info,
            apiResponse.data.info
          );
        } else {
          this.user_follows = apiResponse.data;
          this.query_follow_type = followType;
        }
      }
    }
  },
  components: {
    Time,
    LoadingCircular,
    LoadingBar,
    TwitchUserCard,
    TwitchUserFollowingCard
  }
};
</script>
