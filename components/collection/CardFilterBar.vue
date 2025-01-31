<template>
  <div class="filter-bar p-3">
    <!-- Search Input -->
    <b-input-group>
      <b-form-input
        v-model="searchQuery"
        placeholder="Search cards..."
        @input="onSearch"
      />
      <b-input-group-append>
        <b-button variant="primary" @click="showAdvancedFilters">
          <font-awesome-icon :icon="['fas', 'filter']" />
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <!-- Quick Filters -->
    <div class="quick-filters mt-2">
      <div class="filter-group">
        <b-button-group size="sm">
          <b-button
            v-for="type in ['Monster', 'Spell', 'Trap']"
            :key="type"
            :pressed="selectedTypes.includes(type)"
            variant="outline-secondary"
            @click="toggleType(type)"
          >
            {{ type }}
          </b-button>
        </b-button-group>
      </div>

      <div class="filter-group">
        <b-dropdown
          text="Sort By"
          variant="outline-secondary"
          size="sm"
        >
          <b-dropdown-item
            v-for="option in sortOptions"
            :key="option.value"
            :active="sortBy === option.value"
            @click="setSortBy(option.value)"
          >
            {{ option.text }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="active-filters mt-2">
      <b-badge
        v-for="filter in activeFilterBadges"
        :key="filter.id"
        variant="primary"
        class="mr-1"
      >
        {{ filter.text }}
        <font-awesome-icon
          :icon="['fas', 'times']"
          class="ml-1"
          @click="removeFilter(filter.id)"
        />
      </b-badge>
      <b-button
        size="sm"
        variant="link"
        class="clear-filters"
        @click="clearFilters"
      >
        Clear All
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardFilterBar',

  props: {
    sortService: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      searchQuery: '',
      selectedTypes: [],
      sortBy: 'name',
      activeFilters: {}
    }
  },

  computed: {
    sortOptions() {
      return this.sortService.getSortOptions()
    },

    hasActiveFilters() {
      return this.selectedTypes.length > 0 || Object.keys(this.activeFilters).length > 0
    },

    activeFilterBadges() {
      const badges = []

      this.selectedTypes.forEach(type => {
        badges.push({
          id: `type-${type}`,
          text: type,
          type: 'cardType'
        })
      })

      Object.entries(this.activeFilters).forEach(([key, value]) => {
        badges.push({
          id: key,
          text: this.formatFilterBadge(key, value),
          type: 'advanced'
        })
      })

      return badges
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.searchQuery)
    },

    toggleType(type) {
      const index = this.selectedTypes.indexOf(type)
      if (index === -1) {
        this.selectedTypes.push(type)
      } else {
        this.selectedTypes.splice(index, 1)
      }
      this.$emit('type-filter', this.selectedTypes)
    },

    setSortBy(value) {
      this.sortBy = value
      this.$emit('sort', { field: value, order: 'asc' })
    },

    showAdvancedFilters() {
      this.$emit('show-advanced-filters')
    },

    removeFilter(filterId) {
      if (filterId.startsWith('type-')) {
        const type = filterId.replace('type-', '')
        this.selectedTypes = this.selectedTypes.filter(t => t !== type)
        this.$emit('type-filter', this.selectedTypes)
      } else {
        delete this.activeFilters[filterId]
        this.$emit('advanced-filters', this.activeFilters)
      }
    },

    clearFilters() {
      this.selectedTypes = []
      this.activeFilters = {}
      this.$emit('type-filter', [])
      this.$emit('advanced-filters', {})
    },

    formatFilterBadge(key, value) {
      switch (key) {
        case 'monsterType':
          return `Type: ${value}`
        case 'attribute':
          return `Attribute: ${value}`
        case 'level':
          return `Level: ${value.min}-${value.max}`
        case 'atk':
          return `ATK: ${value.min}-${value.max}`
        case 'def':
          return `DEF: ${value.min}-${value.max}`
        default:
          return key
      }
    }
  }
}
</script>

<style scoped>
.filter-bar {
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
}

.quick-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.active-filters .badge {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  font-weight: normal;
}

.active-filters .badge svg {
  cursor: pointer;
}

.clear-filters {
  padding: 0;
  font-size: 0.875rem;
}
</style>
