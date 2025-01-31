/**
 * Represents the result of a deck operation
 */
export class DeckOperationResult {
  constructor(successful = true, error = null, data = null) {
    this.successful = successful
    this.error = error
    this.data = data
  }

  /**
   * Create a successful result
   * @param {any} data Optional data to include
   * @returns {DeckOperationResult}
   */
  static success(data = null) {
    return new DeckOperationResult(true, null, data)
  }

  /**
   * Create a failed result
   * @param {string} error Error message
   * @param {any} data Optional data to include
   * @returns {DeckOperationResult}
   */
  static failure(error, data = null) {
    return new DeckOperationResult(false, error, data)
  }
}
