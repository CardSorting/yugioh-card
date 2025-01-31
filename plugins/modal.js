import Vue from 'vue';
import { ModalPlugin } from 'bootstrap-vue';

// Install the ModalPlugin
Vue.use(ModalPlugin);

// Add a global mixin to handle modal operations
Vue.mixin({
  methods: {
    $showModal(modalId) {
      return new Promise((resolve, reject) => {
        try {
          if (this.$bvModal) {
            this.$bvModal.show(modalId);
            resolve();
          } else if (this.$root) {
            this.$root.$emit('bv::show::modal', modalId);
            resolve();
          } else {
            reject(new Error('Modal plugin not initialized'));
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    
    $hideModal(modalId) {
      return new Promise((resolve, reject) => {
        try {
          if (this.$bvModal) {
            this.$bvModal.hide(modalId);
            resolve();
          } else if (this.$root) {
            this.$root.$emit('bv::hide::modal', modalId);
            resolve();
          } else {
            reject(new Error('Modal plugin not initialized'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  }
});
