import { supabase } from '~/config/supabase'

class CardStorageService {
  async saveCard(cardData, imageBlob) {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('User not authenticated')

      // Generate unique ID for the card
      const cardId = crypto.randomUUID()

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(`${user.id}/${cardId}.jpg`, imageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(`${user.id}/${cardId}.jpg`)

      // Save card data to database
      const { error: dbError } = await supabase
        .from('saved_cards')
        .insert({
          id: cardId,
          user_id: user.id,
          card_data: cardData,
          image_url: publicUrl
        })

      if (dbError) throw dbError

      return { cardId, imageUrl: publicUrl }
    } catch (error) {
      console.error('Error saving card:', error)
      throw error
    }
  }

  async updateCard(cardId, cardData, imageBlob) {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('User not authenticated')

      // Upload new image if provided
      if (imageBlob) {
        const { error: uploadError } = await supabase.storage
          .from('card-images')
          .upload(`${user.id}/${cardId}.jpg`, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) throw uploadError
      }

      // Get public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(`${user.id}/${cardId}.jpg`)

      // Update card data in database
      const { error: dbError } = await supabase
        .from('saved_cards')
        .update({
          card_data: cardData,
          image_url: publicUrl
        })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      return { cardId, imageUrl: publicUrl }
    } catch (error) {
      console.error('Error updating card:', error)
      throw error
    }
  }

  async deleteCard(cardId) {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('User not authenticated')

      // Delete image from storage
      const { error: storageError } = await supabase.storage
        .from('card-images')
        .remove([`${user.id}/${cardId}.jpg`])

      if (storageError) throw storageError

      // Delete card data from database
      const { error: dbError } = await supabase
        .from('saved_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting card:', error)
      throw error
    }
  }

  async getUserCards() {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('saved_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching user cards:', error)
      throw error
    }
  }
}

export default new CardStorageService()
