<template>
  <b-modal
    v-model="isVisible"
    :title="isLogin ? 'Login' : 'Sign Up'"
    centered
    @hidden="onHide"
  >
    <b-form @submit.prevent="handleSubmit">
      <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>
      
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter your email"
        />
      </b-form-group>

      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter your password"
        />
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <b-button
        variant="secondary"
        @click="toggleMode"
      >
        {{ isLogin ? 'Need an account? Sign up' : 'Have an account? Login' }}
      </b-button>
      <b-button
        variant="primary"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ isLogin ? 'Login' : 'Sign Up' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AuthModal',
  
  props: {
    value: {
      type: Boolean,
      default: false
    },
    initialMode: {
      type: String,
      default: 'login'
    }
  },

  data() {
    return {
      isLogin: this.initialMode === 'login',
      form: {
        email: '',
        password: ''
      }
    }
  },

  computed: {
    ...mapState({
      loading: state => state.auth.loading,
      error: state => state.auth.error
    }),
    ...mapGetters('auth', ['isAuthenticated']),
    
    isVisible: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },

  methods: {
    async handleSubmit() {
      try {
        if (this.isLogin) {
          await this.$store.dispatch('auth/signIn', this.form)
        } else {
          await this.$store.dispatch('auth/signUp', this.form)
        }
        this.$emit('auth-success')
        this.isVisible = false
      } catch (error) {
        console.error('Auth error:', error)
      }
    },

    toggleMode() {
      this.isLogin = !this.isLogin
      this.form.email = ''
      this.form.password = ''
    },

    onHide() {
      this.form.email = ''
      this.form.password = ''
      this.isLogin = this.initialMode === 'login'
    }
  }
}
</script>

<style scoped>
.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: none;
  justify-content: space-between;
}
</style>
