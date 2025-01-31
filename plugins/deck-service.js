import { deckService } from '~/services/deckService'

export default (_, inject) => {
  inject('deckService', deckService)
}
