import { DeckOperationResult } from '../models/DeckOperationResult'

/**
 * Base class for deck operations
 */
export class BaseDeckOperation {
  /**
   * Validate the operation
   * @returns {Promise<DeckOperationResult>}
   */
  async validate() {
    throw new Error('validate() must be implemented')
  }

  /**
   * Execute the operation
   * @returns {Promise<DeckOperationResult>}
   */
  async execute() {
    throw new Error('execute() must be implemented')
  }

  /**
   * Rollback the operation
   * @returns {Promise<DeckOperationResult>}
   */
  async rollback() {
    throw new Error('rollback() must be implemented')
  }

  /**
   * Execute the operation with validation
   * @returns {Promise<DeckOperationResult>}
   */
  async executeWithValidation() {
    const validationResult = await this.validate()
    if (!validationResult.successful) {
      return validationResult
    }
    return this.execute()
  }
}

/**
 * Interface for card addition operations
 */
export class ICardAdditionStrategy {
  /**
   * Validate card addition
   * @param {Object} card Card to add
   * @param {string} section Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async validateAddition(card, section) {
    throw new Error('validateAddition() must be implemented')
  }

  /**
   * Execute card addition
   * @param {Object} card Card to add
   * @param {string} section Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async executeAddition(card, section) {
    throw new Error('executeAddition() must be implemented')
  }
}

/**
 * Interface for card removal operations
 */
export class ICardRemovalStrategy {
  /**
   * Validate card removal
   * @param {Object} card Card to remove
   * @returns {Promise<DeckOperationResult>}
   */
  async validateRemoval(card) {
    throw new Error('validateRemoval() must be implemented')
  }

  /**
   * Execute card removal
   * @param {Object} card Card to remove
   * @returns {Promise<DeckOperationResult>}
   */
  async executeRemoval(card) {
    throw new Error('executeRemoval() must be implemented')
  }
}

/**
 * Interface for card movement operations
 */
export class ICardMovementStrategy {
  /**
   * Validate card movement
   * @param {Object} card Card to move
   * @param {string} fromSection Source section
   * @param {string} toSection Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async validateMovement(card, fromSection, toSection) {
    throw new Error('validateMovement() must be implemented')
  }

  /**
   * Execute card movement
   * @param {Object} card Card to move
   * @param {string} fromSection Source section
   * @param {string} toSection Target section
   * @returns {Promise<DeckOperationResult>}
   */
  async executeMovement(card, fromSection, toSection) {
    throw new Error('executeMovement() must be implemented')
  }
}
