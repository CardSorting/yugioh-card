<template>
  <div class="card-collection">
    <card-filter-bar
      :sort-service="sortService"
      @search="onSearch"
      @type-filter="onTypeFilter"
      @sort="onSort"
      @show-advanced-filters="showAdvancedFilters"
      @advanced-filters="onAdvancedFilters"
    />

    <card-grid
      :cards="filteredCards"
      :deck-counts="deckCounts"
      :is-loading="isLoading"
      :grid-service="gridService"
      @can-add="canAddCard"
      @add="addCard"
      @show-options="showCardOptions"
      @card-hover="onCardHover"
    />

    <deck-filter-modal
      v-model="showFilterModal"
      @apply-filters="onAdvancedFilters"
    />
  </div>
</template>

<script>
import CardFilterBar from './CardFilterBar.vue'
import CardGrid from './CardGrid.vue'
import DeckFilterModal from '../deck/DeckFilterModal.vue'
import CardFilterService from '../../services/collection/implementations/CardFilterService'
import CardSortService from '../../services/collection/implementations/CardSortService'
import CardGridService from '../../services/collection/implementations/CardGridService'

export default {
  name: 'CardCollection',

  components: {
    CardFilterBar,
    CardGrid,
    DeckFilterModal
  },

  props: {
    cards: {
      type: Array,
      required: true
    },
    deckCounts: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      filterService: new CardFilterService(),
      sortService: new CardSortService(),
      gridService: new CardGridService(),
      searchQuery: '',
      selectedTypes: [],
      sortCriteria: { field: 'name', order: 'asc' },
      advancedFilters: {},
      showFilterModal: false
    }
  },

  computed: {
    filteredCards() {
      let filtered = this.cards

      // Apply text search
      if (this.searchQuery) {
        filtered = this.filterService.searchByText(filtered, this.searchQuery)
      }

      // Apply type filters
      if (this.selectedTypes.length > 0) {
        filtered = this.filterService.filterByType(filtered, this.selectedTypes)
      }

      // Apply advanced filters
      if (Object.keys(this.advancedFilters).length > 0) {
        filtered = this.filterService.applyFilters(filtered, this.advancedFilters)
      }

      // Apply sorting
      return this.sortService.sortCards(filtered, this.sortCriteria)
    }
  },

  methods: {
    onSearch(query) {
      this.searchQuery = query
    },

    onTypeFilter(types) {
      this.selectedTypes = types
    },

    onSort(criteria) {
      this.sortCriteria = criteria
    },

    showAdvancedFilters() {
      this.showFilterModal = true
    },

    onAdvancedFilters(filters) {
      this.advancedFilters = filters
    },

    canAddCard(card) {
      return this.$emit('can-add', card)
    },

    addCard(card) {
      this.$emit('add', card)
    },

    showCardOptions(params) {
      this.$emit('show-options', params)
    },

    onCardHover(params) {
      this.$emit('card-hover', params)
    }
  }
}
</script>

<style scoped>
.card-collection {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
