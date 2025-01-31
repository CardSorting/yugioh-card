import ICardFilterService from '../interfaces/ICardFilterService'

export default class CardFilterService extends ICardFilterService {
  constructor() {
    super()
  }

  applyFilters(cards, filters) {
    let filtered = [...cards]

    // Apply card type filter
    if (filters.cardTypes?.length > 0) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        return filters.cardTypes.some(type => 
          cardData.type.toLowerCase().includes(type.toLowerCase())
        )
      })
    }

    // Apply monster type filter
    if (filters.monsterTypes?.length > 0) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        return cardData.type.includes('Monster') &&
          filters.monsterTypes.includes(cardData.race)
      })
    }

    // Apply attribute filter
    if (filters.attributes?.length > 0) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        return cardData.type.includes('Monster') &&
          filters.attributes.includes(cardData.attribute)
      })
    }

    // Apply level/rank range filter
    if (filters.levelMin !== undefined || filters.levelMax !== undefined) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        if (!cardData.type.includes('Monster')) return true
        const level = cardData.level || cardData.rank || 0
        return (filters.levelMin === undefined || level >= filters.levelMin) &&
               (filters.levelMax === undefined || level <= filters.levelMax)
      })
    }

    // Apply ATK range filter
    if (filters.atkMin !== undefined || filters.atkMax !== undefined) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        if (!cardData.type.includes('Monster')) return true
        const atk = parseInt(cardData.atk) || 0
        return (filters.atkMin === undefined || atk >= filters.atkMin) &&
               (filters.atkMax === undefined || atk <= filters.atkMax)
      })
    }

    // Apply DEF range filter
    if (filters.defMin !== undefined || filters.defMax !== undefined) {
      filtered = filtered.filter(card => {
        const cardData = card.card?.card_data || card.card_data
        if (!cardData.type.includes('Monster')) return true
        const def = parseInt(cardData.def) || 0
        return (filters.defMin === undefined || def >= filters.defMin) &&
               (filters.defMax === undefined || def <= filters.defMax)
      })
    }

    return filtered
  }

  searchByText(cards, query) {
    if (!query) return cards

    const searchQuery = query.toLowerCase()
    return cards.filter(card => {
      const cardData = card.card?.card_data || card.card_data
      return cardData.name.toLowerCase().includes(searchQuery) ||
             cardData.description.toLowerCase().includes(searchQuery)
    })
  }

  filterByType(cards, types) {
    if (!types || types.length === 0) return cards

    return cards.filter(card => {
      const cardData = card.card?.card_data || card.card_data
      return types.some(type => cardData.type.includes(type))
    })
  }
}
