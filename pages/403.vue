<template>
  <div class="error-page">
    <div class="error-content">
      <font-awesome-icon
        :icon="['fas', 'lock']"
        size="4x"
        class="mb-4 text-danger"
      />
      <h1>Access Denied</h1>
      <p class="text-muted">You don't have permission to access this deck.</p>
      <div class="mt-4">
        <b-button
          variant="primary"
          to="/decks"
          class="mr-3"
        >
          My Decks
        </b-button>
        <b-button
          variant="outline-secondary"
          to="/"
        >
          Home
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForbiddenPage',
  layout: 'error'
}
</script>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
</style>
