import ICardSortService from '../interfaces/ICardSortService'

export default class CardSortService extends ICardSortService {
  constructor() {
    super()
    this.validFields = ['name', 'type', 'level', 'atk', 'def']
    this.validOrders = ['asc', 'desc']
  }

  sortCards(cards, criteria) {
    if (!this.isValidCriteria(criteria)) {
      return cards
    }

    const { field, order = 'asc' } = criteria
    const direction = order === 'desc' ? -1 : 1

    return [...cards].sort((a, b) => {
      const cardDataA = a.card?.card_data || a.card_data
      const cardDataB = b.card?.card_data || b.card_data

      switch (field) {
        case 'name':
          return direction * cardDataA.name.localeCompare(cardDataB.name)

        case 'type':
          return direction * cardDataA.type.localeCompare(cardDataB.type)

        case 'level':
          const levelA = cardDataA.level || cardDataA.rank || 0
          const levelB = cardDataB.level || cardDataB.rank || 0
          return direction * (levelA - levelB)

        case 'atk':
          const atkA = parseInt(cardDataA.atk) || 0
          const atkB = parseInt(cardDataB.atk) || 0
          return direction * (atkA - atkB)

        case 'def':
          const defA = parseInt(cardDataA.def) || 0
          const defB = parseInt(cardDataB.def) || 0
          return direction * (defA - defB)

        default:
          return 0
      }
    })
  }

  getSortOptions() {
    return [
      { text: 'Name', value: 'name' },
      { text: 'Type', value: 'type' },
      { text: 'Level/Rank', value: 'level' },
      { text: 'ATK', value: 'atk' },
      { text: 'DEF', value: 'def' }
    ]
  }

  isValidCriteria(criteria) {
    if (!criteria || typeof criteria !== 'object') return false

    // Check field
    if (!criteria.field || !this.validFields.includes(criteria.field)) {
      return false
    }

    // Check order if provided
    if (criteria.order && !this.validOrders.includes(criteria.order)) {
      return false
    }

    return true
  }
}
