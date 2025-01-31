<template>
  <div class="error-page">
    <div class="error-content">
      <font-awesome-icon
        :icon="['fas', 'exclamation-triangle']"
        size="4x"
        class="mb-4 text-danger"
      />
      <h1>Server Error</h1>
      <p class="text-muted">Something went wrong on our end. Please try again later.</p>
      <div class="mt-4">
        <b-button
          variant="primary"
          @click="reload"
          class="mr-3"
        >
          Try Again
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
  name: 'ServerErrorPage',
  layout: 'error',

  methods: {
    reload() {
      window.location.reload()
    }
  }
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
