import Vue from 'vue'
import cardDrawingService from '~/services/cardDrawingService'

Vue.prototype.$cardDrawingService = cardDrawingService

export default ({ app }, inject) => {
  inject('cardDrawingService', cardDrawingService)
}
