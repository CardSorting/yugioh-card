<template>
  <div>
    <nav class="nav-header">
    <div class="nav-container">
      <nuxt-link to="/" v-slot="{ href, navigate }" custom>
        <a :href="href" @click="navigate" class="nav-brand">Yu-Gi-Oh! Card Maker</a>
      </nuxt-link>
      <div class="nav-content">
        <div class="nav-links">
          <nuxt-link to="/" v-slot="{ href, navigate }" custom>
            <a :href="href" @click="navigate" class="nav-link">Home</a>
          </nuxt-link>
          <nuxt-link v-if="isAuthenticated" to="/create" v-slot="{ href, navigate }" custom>
            <a :href="href" @click="navigate" class="nav-link">Create Card</a>
          </nuxt-link>
          <nuxt-link v-if="isAuthenticated" to="/gallery" v-slot="{ href, navigate }" custom>
            <a :href="href" @click="navigate" class="nav-link">Gallery</a>
          </nuxt-link>
        </div>
      <div class="nav-auth">
        <template v-if="isAuthenticated">
          <user-menu />
        </template>
        <template v-else>
          <b-button variant="primary" @click="openAuthModal('login')">Sign In / Sign Up</b-button>
        </template>
      </div>
      </div>
    </div>
    </nav>
    <auth-modal v-model="showAuthModal" :initial-mode="initialAuthMode" />
  </div>  
</template>

<script>
import UserMenu from '~/components/auth/UserMenu.vue'
import AuthModal from '~/components/auth/AuthModal.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    UserMenu,
    AuthModal
  },

  data() {
    return {
      showAuthModal: false,
      initialAuthMode: 'login'
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },

  methods: {
    openAuthModal(mode) {
      this.initialAuthMode = mode
      this.showAuthModal = true
    }
  }
}
</script>

<style scoped>
.nav-header {
  background-color: #ffffff;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-bottom: 1px solid #e5e5e5;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  color: #2c3e50;
  font-size: 1.5rem;
  text-decoration: none;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #0056b3;
}

.nuxt-link-exact-active {
  background-color: #e9ecef;
  color: #0056b3;
}
</style>
