<template>
  <div class="user-menu">
    <b-dropdown right variant="link" toggle-class="text-decoration-none" no-caret>
      <template #button-content>
        <font-awesome-icon :icon="['fas', 'user']" class="nav-text" />
        <span v-if="user" class="ml-2 nav-text">{{ user.email }}</span>
      </template>

      <b-dropdown-item to="/gallery">
        <font-awesome-icon :icon="['fas', 'images']" class="mr-2" />
        My Gallery
      </b-dropdown-item>

      <b-dropdown-divider />

      <b-dropdown-item @click="handleSignOut">
        <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
        Sign Out
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserMenu',

  computed: {
    ...mapGetters('auth', ['currentUser']),
    user() {
      return this.currentUser || {}
    }
  },

  methods: {
    async handleSignOut() {
      try {
        await this.$store.dispatch('auth/signOut')
        if (this.$route.path === '/create' || this.$route.path === '/gallery') {
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Sign out error:', error)
      }
    }
  }
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
}

.dropdown-toggle::after {
  display: none;
}

.dropdown-menu {
  min-width: 200px;
}

.nav-text {
  color: #2c3e50;
}
</style>
