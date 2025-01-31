/**
 * Interface for virtualization functionality
 */
export default class IVirtualization {
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
  calculateVisibleRange(params) {
    throw new Error('calculateVisibleRange must be implemented')
  }

  /**
   * Get item position
   * @param {number} index Item index
   * @param {number} itemHeight Item height
   * @returns {Object} Position {top, left}
   */
  getItemPosition(index, itemHeight) {
    throw new Error('getItemPosition must be implemented')
  }

  /**
   * Get container dimensions
   * @param {number} totalItems Total number of items
   * @param {number} itemHeight Item height
   * @returns {Object} Dimensions {height, width}
   */
  getContainerDimensions(totalItems, itemHeight) {
    throw new Error('getContainerDimensions must be implemented')
  }

  /**
   * Handle scroll event
   * @param {Event} event Scroll event
   * @returns {Object} Updated scroll state
   */
  handleScroll(event) {
    throw new Error('handleScroll must be implemented')
  }
}
