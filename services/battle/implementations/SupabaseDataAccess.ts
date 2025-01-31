import { SupabaseClient } from '@supabase/supabase-js'
import { IDataAccess } from '../interfaces/IDataAccess'
import { Battle, BattleCreationData, QueueEntry, Round, Card, BattleError } from '../types'

export class SupabaseDataAccess implements IDataAccess {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<{ id: string } | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw new BattleError('Authentication failed')
    return user
  }

  async getQueueEntry(userId: string): Promise<QueueEntry | null> {
    const { data, error } = await this.supabase
      .from('battle_queue')
      .select('id, player_id, created_at')
      .eq('player_id', userId)
      .maybeSingle()

    if (error) throw new BattleError('Failed to check queue status')
    if (!data) return null

    return {
      id: data.id,
      playerId: data.player_id,
      createdAt: data.created_at
    }
  }

  async addToQueue(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('battle_queue')
      .insert({ 
        player_id: userId,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return // User already in queue
      }
      throw new BattleError('Failed to join queue')
    }
  }

  async removeFromQueue(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('battle_queue')
      .delete()
      .eq('player_id', userId)

    if (error) throw new BattleError('Failed to leave queue')
  }

  async findOldestOpponent(userId: string): Promise<QueueEntry | null> {
    const { data, error } = await this.supabase
      .from('battle_queue')
      .select('id, player_id, created_at')
      .neq('player_id', userId)
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (error) throw new BattleError('Failed to find opponent')
    if (!data) return null

    return {
      id: data.id,
      playerId: data.player_id,
      createdAt: data.created_at
    }
  }

  async getBattle(battleId: string): Promise<Battle | null> {
    const { data, error } = await this.supabase
      .from('active_battles')
      .select('*')
      .eq('id', battleId)
      .maybeSingle()

    if (error) throw new BattleError('Failed to fetch battle')
    if (!data) return null

    return {
      id: data.id,
      player1Id: data.player1_id,
      player2Id: data.player2_id,
      player1CardId: data.player1_card_id,
      player2CardId: data.player2_card_id,
      status: data.status,
      winnerId: data.winner_id
    }
  }

  async createBattle(battleData: BattleCreationData): Promise<Battle> {
    const { data, error } = await this.supabase
      .from('active_battles')
      .insert({
        player1_id: battleData.player1Id,
        player2_id: battleData.player2Id,
        player1_card_id: battleData.player1CardId,
        player2_card_id: battleData.player2CardId,
        status: battleData.status
      })
      .select()
      .single()

    if (error) throw new BattleError('Failed to create battle')

    return {
      id: data.id,
      player1Id: data.player1_id,
      player2Id: data.player2_id,
      player1CardId: data.player1_card_id,
      player2CardId: data.player2_card_id,
      status: data.status,
      winnerId: data.winner_id
    }
  }

  async updateBattleStatus(battleId: string, status: string, winnerId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('active_battles')
      .update({
        status,
        winner_id: winnerId
      })
      .eq('id', battleId)

    if (error) throw new BattleError('Failed to update battle status')
  }

  async getRounds(battleId: string): Promise<Round[]> {
    const { data, error } = await this.supabase
      .from('battle_rounds')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_number')

    if (error) throw new BattleError('Failed to fetch battle rounds')
    if (!data) return []

    return data.map(round => ({
      battleId: round.battle_id,
      roundNumber: round.round_number,
      player1Move: round.player1_move,
      player2Move: round.player2_move
    }))
  }

  async addRound(
    battleId: string,
    roundNumber: number,
    player1Move: string,
    player2Move: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('battle_rounds')
      .insert({
        battle_id: battleId,
        round_number: roundNumber,
        player1_move: player1Move,
        player2_move: player2Move
      })

    if (error) throw new BattleError('Failed to add round')
  }

  async getRandomUserCard(userId: string): Promise<Card | null> {
    const { data, error } = await this.supabase
      .from('saved_cards')
      .select('id, user_id')
      .eq('user_id', userId)

    if (error) throw new BattleError('Failed to fetch user cards')
    if (!data?.length) return null

    const randomCard = data[Math.floor(Math.random() * data.length)]
    return {
      id: randomCard.id,
      userId: randomCard.user_id
    }
  }

  async transferCard(cardId: string, newOwnerId: string): Promise<void> {
    const { error } = await this.supabase.rpc('transfer_card', {
      card_id: cardId,
      new_owner_id: newOwnerId
    })

    if (error) throw new BattleError('Failed to transfer card')
  }
}
