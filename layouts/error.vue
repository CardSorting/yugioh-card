<template>
  <div class="error-layout">
    <!-- Navigation -->
    <nav class="error-nav">
      <div class="container d-flex justify-content-between align-items-center">
        <nuxt-link to="/" class="navbar-brand">
          <font-awesome-icon :icon="['fas', 'credit-card']" class="mr-2" />
          Yu-Gi-Oh! Card Maker
        </nuxt-link>
        <div>
          <nuxt-link
            v-if="!isAuthenticated"
            to="/login"
            class="btn btn-outline-primary btn-sm"
          >
            Sign In
          </nuxt-link>
          <template v-else>
            <nuxt-link
              to="/decks"
              class="btn btn-outline-primary btn-sm mr-2"
            >
              My Decks
            </nuxt-link>
            <button
              class="btn btn-outline-danger btn-sm"
              @click="logout"
            >
              Sign Out
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Error Content -->
    <main class="error-main">
      <nuxt />
    </main>

    <!-- Footer -->
    <footer class="error-footer">
      <div class="container text-center text-muted">
        <small>&copy; {{ new Date().getFullYear() }} Yu-Gi-Oh! Card Maker. All rights reserved.</small>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ErrorLayout',

  computed: {
    ...mapState('auth', ['isAuthenticated'])
  },

  methods: {
    ...mapActions('auth', ['logout'])
  }
}
</script>

<style scoped>
.error-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.error-nav {
  padding: 1rem 0;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-main {
  flex: 1;
}

.error-footer {
  padding: 1rem 0;
  background-color: #fff;
  border-top: 1px solid #dee2e6;
}

.navbar-brand {
  color: #333;
  font-weight: 500;
  text-decoration: none;
}

.navbar-brand:hover {
  color: #007bff;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  text-decoration: none;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>
