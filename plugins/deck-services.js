import DeckServiceFactory from '../services/deck/DeckServiceFactory'

export default ({ store }, inject) => {
  // Create factory instance
  const factory = DeckServiceFactory.create(store)

  // Inject services into the app
  inject('deckServices', {
    operations: factory.getOperationsService(),
    validation: factory.getValidationService(),
    export: factory.getExportService(),
    state: factory.getStateService()
  })
}
