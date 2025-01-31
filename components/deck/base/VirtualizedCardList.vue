<template>
  <div
    ref="container"
    class="virtualized-list"
    @scroll="onScroll"
  >
    <div
      class="virtualized-content"
      :style="containerStyle"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtualized-item"
        :style="getItemStyle(item)"
      >
        <slot
          name="item"
          v-bind="{ item, index: items.indexOf(item) }"
        />
      </div>
    </div>

    <div v-if="isEmpty" class="empty-state">
      <slot name="empty">
        <div class="empty-content">
          <font-awesome-icon
            :icon="['fas', 'layer-group']"
            size="2x"
            class="mb-2"
          />
          <p class="mb-0">{{ emptyText }}</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import DeckVirtualizationService from '../../../services/deck/implementations/DeckVirtualizationService'

export default {
  name: 'VirtualizedCardList',

  props: {
    /**
     * Items to display
     */
    items: {
      type: Array,
      required: true,
      default: () => []
    },

    /**
     * Height of each item
     */
    itemHeight: {
      type: Number,
      default: 100
    },

    /**
     * Number of items to render above/below viewport
     */
    buffer: {
      type: Number,
      default: 3
    },

    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: 'No items to display'
    }
  },

  data() {
    return {
      virtualization: new DeckVirtualizationService(),
      scrollState: {
        scrollTop: 0,
        viewportHeight: 0
      },
      isClient: false
    }
  },

  computed: {
    /**
     * Whether list is empty
     */
    isEmpty() {
      return this.items.length === 0
    },

    /**
     * Container style with total height
     */
    containerStyle() {
      const { height, width } = this.virtualization.getContainerDimensions(
        this.items.length,
        this.itemHeight
      )
      return {
        height: `${height}px`,
        width
      }
    },

    /**
     * Currently visible items
     */
    visibleItems() {
      if (!this.isClient) {
        // During SSR, return first few items
        return this.items.slice(0, 10)
      }

      const { startIndex, endIndex } = this.virtualization.calculateVisibleRange({
        scrollTop: this.scrollState.scrollTop,
        viewportHeight: this.scrollState.viewportHeight,
        itemHeight: this.itemHeight,
        totalItems: this.items.length,
        buffer: this.buffer
      })

      return this.items.slice(startIndex, endIndex)
    }
  },

  mounted() {
    this.isClient = true
    this.$nextTick(() => {
      this.updateContainerSize()
      window.addEventListener('resize', this.onResize)
    })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    /**
     * Get style for individual item
     */
    getItemStyle(item) {
      const index = this.items.indexOf(item)
      const { top, left } = this.virtualization.getItemPosition(index, this.itemHeight)
      return {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: '100%',
        height: `${this.itemHeight}px`
      }
    },

    /**
     * Handle scroll event
     */
    async onScroll(event) {
      this.scrollState = await this.virtualization.handleScroll(event)
    },

    /**
     * Handle resize event
     */
    onResize() {
      this.updateContainerSize()
      this.virtualization.clearCache()
    },

    /**
     * Update container size
     */
    updateContainerSize() {
      if (this.$refs.container) {
        this.scrollState.viewportHeight = this.$refs.container.clientHeight
      }
    }
  }
}
</script>

<style scoped>
.virtualized-list {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtualized-content {
  position: relative;
  width: 100%;
}

.virtualized-item {
  padding: 0.25rem;
  transition: transform 0.2s ease;
}

.virtualized-item:hover {
  transform: translateY(-2px);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}
</style>
