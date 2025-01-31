<template>
  <b-alert
    v-if="error"
    class="error-alert"
    show
    variant="danger"
    dismissible
    @dismissed="clearError"
  >
    {{ error }}
  </b-alert>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'ErrorDisplay',
  
  computed: {
    ...mapState({
      error: state => state.error
    })
  },

  methods: {
    ...mapMutations(['clearError'])
  }
}
</script>

<style scoped>
.error-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}
</style>