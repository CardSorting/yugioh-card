export default async function ({ store, route, redirect, $deckServices }) {
  // Skip middleware if not accessing a deck route
  if (!route.path.includes('/deck/')) {
    return
  }

  // Get deck ID from route
  const deckId = route.params.id

  // Skip if no deck ID (e.g., creating new deck)
  if (!deckId) {
    return
  }

  try {
    // Get current user
    const user = store.state.auth.user
    if (!user) {
      return redirect('/login')
    }

    // Get deck details
    const deck = await $deckServices.deck.getDeckById(deckId)
    
    // Check if deck exists
    if (!deck) {
      return redirect('/404')
    }

    // Check if user owns the deck
    if (deck.user_id !== user.id) {
      // Check if deck is shared
      const isShared = await $deckServices.deck.isDeckSharedWithUser({
        deckId,
        userId: user.id
      })

      if (!isShared) {
        return redirect('/403')
      }
    }

    // Store deck in Vuex for easy access
    store.commit('deck/SET_CURRENT_DECK', deck)

  } catch (error) {
    console.error('Error in deck auth middleware:', error)
    return redirect('/500')
  }
}
