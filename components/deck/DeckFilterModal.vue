<template>
  <b-modal
    v-model="isVisible"
    title="Card Filters"
    size="md"
    @hidden="onHidden"
  >
    <div class="filters-content">
      <!-- Basic Card Type Filters -->
      <div class="filter-section">
        <h5>Card Type</h5>
        <div class="filter-options">
          <b-form-checkbox-group
            v-model="filters.cardTypes"
            :options="cardTypeOptions"
            stacked
          />
        </div>
      </div>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="resetFilters">
        Reset
      </b-button>
      <b-button variant="primary" @click="applyFilters">
        Apply
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'DeckFilterModal',

  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      filters: {
        cardTypes: []
      },
      cardTypeOptions: [
        { text: 'Monster', value: 'Monster' },
        { text: 'Spell', value: 'Spell' },
        { text: 'Trap', value: 'Trap' }
      ]
    }
  },

  computed: {
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
    resetFilters() {
      this.filters = {
        cardTypes: []
      }
    },

    applyFilters() {
      this.$emit('apply-filters', { ...this.filters })
      this.isVisible = false
    },

    onHidden() {
      this.$emit('hidden')
    }
  }
}
</script>

<style scoped>
.filters-content {
  padding: 1rem;
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
