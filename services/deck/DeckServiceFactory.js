import DeckValidationService from './implementations/DeckValidationService'
import CardAdditionService from './implementations/CardAdditionService'
import CardRemovalService from './implementations/CardRemovalService'
import CardMovementService from './implementations/CardMovementService'
import DeckMutationService from './implementations/DeckMutationService'
import DeckStateService from './implementations/DeckStateService'
import DeckVirtualizationService from './implementations/DeckVirtualizationService'
import DeckCardGroupingService from './implementations/DeckCardGroupingService'
import DeckOperationsService from './implementations/DeckOperationsService'
import DeckExportService from './implementations/DeckExportService'

/**
 * Factory for creating deck-related services
 */
export default class DeckServiceFactory {
  /**
   * Create all required deck services
   * @param {Object} store Vuex store instance
   * @returns {Object} Service instances
   */
  static create(store) {
    // Create base services first
    const stateService = new DeckStateService(store)
    const mutationService = new DeckMutationService(store)
    const validationService = new DeckValidationService()
    const virtualizationService = new DeckVirtualizationService()
    const cardGroupingService = new DeckCardGroupingService()

    // Create additional services
    const exportService = new DeckExportService(store)

    // Create operation services
    const cardAdditionService = new CardAdditionService(validationService, mutationService)
    const cardRemovalService = new CardRemovalService(validationService, mutationService)
    const cardMovementService = new CardMovementService(validationService, mutationService)
    const operationsService = new DeckOperationsService(cardAdditionService, cardRemovalService, cardMovementService)

    return {
      // Get state service
      getStateService() {
        return stateService
      },

      // Get validation service
      getValidationService() {
        return validationService
      },

      // Get virtualization service
      getVirtualizationService() {
        return virtualizationService
      },

      // Get card grouping service
      getCardGroupingService() {
        return cardGroupingService
      },

      // Get mutation service
      getMutationService() {
        return mutationService
      },

      // Get card addition service
      getCardAdditionService() {
        return cardAdditionService
      },

      // Get card removal service
      getCardRemovalService() {
        return cardRemovalService
      },

      // Get card movement service
      getCardMovementService() {
        return cardMovementService
      },

      // Get operations service
      getOperationsService() {
        return operationsService
      },

      // Get export service
      getExportService() {
        return exportService
      }
    }
  }
}
