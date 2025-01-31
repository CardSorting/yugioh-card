import IVirtualization from '../interfaces/IVirtualization'

/**
 * Implementation of virtualization functionality for deck sections
 */
export default class DeckVirtualizationService extends IVirtualization {
  constructor() {
    super()
    this.scrollState = {
      scrollTop: 0,
      viewportHeight: 0
    }
    this.cachedRanges = new Map()
  }

  /**
   * Calculate visible items based on scroll position
   * @param {Object} params Calculation parameters
   * @param {number} params.scrollTop Current scroll position
   * @param {number} params.viewportHeight Viewport height
   * @param {number} params.itemHeight Item height
   * @param {number} params.totalItems Total number of items
   * @param {number} params.buffer Number of items to render above/below viewport
   * @returns {Object} Visible range {startIndex, endIndex}
   */
  calculateVisibleRange({ scrollTop, viewportHeight, itemHeight, totalItems, buffer }) {
    // Create cache key from parameters
    const cacheKey = `${scrollTop}-${viewportHeight}-${itemHeight}-${totalItems}-${buffer}`
    
    // Return cached result if available
    if (this.cachedRanges.has(cacheKey)) {
      return this.cachedRanges.get(cacheKey)
    }

    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIndex = Math.min(
      totalItems,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
    )

    const range = { startIndex, endIndex }
    
    // Cache the result
    this.cachedRanges.set(cacheKey, range)
    
    // Limit cache size
    if (this.cachedRanges.size > 100) {
      const firstKey = this.cachedRanges.keys().next().value
      this.cachedRanges.delete(firstKey)
    }

    return range
  }

  /**
   * Get item position
   * @param {number} index Item index
   * @param {number} itemHeight Item height
   * @returns {Object} Position {top, left}
   */
  getItemPosition(index, itemHeight) {
    return {
      top: index * itemHeight,
      left: 0
    }
  }

  /**
   * Get container dimensions
   * @param {number} totalItems Total number of items
   * @param {number} itemHeight Item height
   * @returns {Object} Dimensions {height, width}
   */
  getContainerDimensions(totalItems, itemHeight) {
    return {
      height: totalItems * itemHeight,
      width: '100%'
    }
  }

  /**
   * Handle scroll event
   * @param {Event} event Scroll event
   * @returns {Object} Updated scroll state
   */
  handleScroll(event) {
    if (!event.target) return this.scrollState

    // Use requestAnimationFrame to throttle scroll updates
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF)
    }

    return new Promise(resolve => {
      this.scrollRAF = requestAnimationFrame(() => {
        this.scrollState = {
          scrollTop: event.target.scrollTop,
          viewportHeight: event.target.clientHeight
        }
        resolve(this.scrollState)
      })
    })
  }

  /**
   * Clear cached ranges
   */
  clearCache() {
    this.cachedRanges.clear()
  }

  /**
   * Get current scroll state
   * @returns {Object} Current scroll state
   */
  getScrollState() {
    return { ...this.scrollState }
  }
}
