<template>
  <client-only>
    <div class="battle-page">
      <div v-if="!isAuthenticated" class="auth-check">
        <h2>Authentication Required</h2>
        <p>Please sign in to access card battles.</p>
        <AuthModal />
      </div>
      <div v-else-if="!currentUser" class="loading-message">
        Loading user data...
      </div>
      <div v-else>
        <h1 class="battle-title">Card Battles</h1>
        <div class="battle-description">
          <p>Challenge other players to a battle of Rock, Paper, Scissors!</p>
          <p>The winner claims the loser's card as their prize.</p>
        </div>
        <BattleQueue />
      </div>
    </div>
  </client-only>
</template>

<script>
import AuthModal from '~/components/auth/AuthModal.vue'
import BattleQueue from '~/components/battle/BattleQueue.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'BattlePage',

  computed: {
    ...mapGetters('auth', ['currentUser', 'isAuthenticated'])
  },

  components: {
    AuthModal,
    BattleQueue
  },

  middleware: 'auth'
}
</script>

<style scoped>
.battle-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.battle-title {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.battle-description {
  text-align: center;
  margin-bottom: 30px;
  color: #6c757d;
}

.auth-check {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.auth-check h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.auth-check p {
  color: #6c757d;
  margin-bottom: 20px;
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
