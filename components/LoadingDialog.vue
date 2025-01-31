<template>
  <div v-if="loading" class="loading-dialog">
    <div class="loading-content">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LoadingDialog',
  
  computed: {
    ...mapState({
      loading: state => state.loading
    })
  }
}
</script>

<style scoped>
.loading-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>