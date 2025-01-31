import { supabase } from '~/config/supabase'
import { COMPUTER_USER_ID, COMPUTER_CARD_ID } from './battle/types'

class BattleService {
  // Convert snake_case to camelCase
  transformBattle(battle) {
    if (!battle) return null
    return {
      id: battle.id,
      player1Id: battle.player1_id,
      player2Id: battle.player2_id,
      player1CardId: battle.player1_card_id,
      player2CardId: battle.player2_card_id,
      status: battle.status,
      winnerId: battle.winner_id
    }
  }

  // Get active battle for current user
  async getActiveBattle() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error('Authentication failed')
      if (!user) throw new Error('Authentication required')

      const { data: battle, error: battleError } = await supabase
        .from('active_battles')
        .select('*')
        .eq('status', 'in_progress')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .maybeSingle()

      if (battleError) throw new Error('Failed to fetch active battle')
      return this.transformBattle(battle)
    } catch (error) {
      console.error('Failed to get active battle:', error)
      throw error
    }
  }

  // Join the battle queue
  async joinQueue() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error('Authentication failed')
      if (!user) throw new Error('Authentication required')

      // Check if user has an in-progress battle
      const activeBattle = await this.getActiveBattle()
      if (activeBattle) {
        return activeBattle
      }

      // Check if user is already in queue
      const { data: existingEntry, error: queueError } = await supabase
        .from('battle_queue')
        .select('id')
        .eq('player_id', user.id)
        .maybeSingle()

      if (queueError) {
        throw new Error('Failed to check queue status')
      }

      if (existingEntry) {
        // User already in queue, try to find a match
        return this.findMatch()
      }

      // Clean up any stale queue entries for this user
      await supabase
        .from('battle_queue')
        .delete()
        .eq('player_id', user.id)

      // Add user to queue
      const { error: insertError } = await supabase
        .from('battle_queue')
        .insert({ 
          player_id: user.id,
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          return this.findMatch()
        }
        throw new Error('Failed to join queue')
      }

      return this.findMatch()
    } catch (error) {
      console.error('Failed to join queue:', error)
      throw error
    }
  }

  // Leave the battle queue
  async leaveQueue() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      await supabase.from('battle_queue')
        .delete()
        .eq('player_id', user.id)
    } catch (error) {
      console.error('Failed to leave queue:', error)
      throw error
    }
  }

  // Find a match for the current player
  async findMatch() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      // Get oldest queued player that isn't current user
      const { data: opponents } = await supabase
        .from('battle_queue')
        .select('player_id')
        .neq('player_id', user.id)
        .order('created_at')
        .limit(1)

      // Get player's cards
      const { data: player1Cards, error: p1Error } = await supabase
        .from('saved_cards')
        .select('id')
        .eq('user_id', user.id)

      if (p1Error) {
        throw new Error('Failed to fetch player cards')
      }

      if (!player1Cards?.length) {
        throw new Error('You must have at least one card to battle')
      }

      const player1Card = player1Cards[Math.floor(Math.random() * player1Cards.length)]

      // Check for human opponent
      if (!opponents || opponents.length === 0) {
        // Create computer battle
        const { data: battle, error: battleError } = await supabase
          .from('active_battles')
          .insert({
            player1_id: user.id,
            player2_id: COMPUTER_USER_ID,
            player1_card_id: player1Card.id,
            player2_card_id: COMPUTER_CARD_ID,
            status: 'in_progress'
          })
          .select('*')
          .single()

        if (battleError) throw new Error('Failed to create battle')

        return this.transformBattle(battle)
      }
      
      // Human opponent found
      const opponent = opponents[0]

      // Get opponent's cards
      const { data: player2Cards, error: p2Error } = await supabase
        .from('saved_cards')
        .select('id')
        .eq('user_id', opponent.player_id)

      if (p2Error) {
        throw new Error('Failed to fetch opponent cards')
      }

      if (!player2Cards?.length) {
        throw new Error('Opponent must have at least one card')
      }

      const player2Card = player2Cards[Math.floor(Math.random() * player2Cards.length)]

      // Create human vs human battle
      const { data: battle, error: battleError } = await supabase
        .from('active_battles')
        .insert({
          player1_id: user.id,
          player2_id: opponent.player_id,
          player1_card_id: player1Card.id,
          player2_card_id: player2Card.id,
          status: 'in_progress'
        })
        .select('*')
        .single()

      if (battleError) throw new Error('Failed to create battle')

      // Remove both players from queue
      await Promise.all([
        this.leaveQueue(user.id),
        this.leaveQueue(opponent.player_id)
      ])

      return this.transformBattle(battle)
    } catch (error) {
      console.error('Failed to find match:', error)
      throw error
    }
  }

  // Make a move in the battle
  async makeMove(battleId, move) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      const { data: battle, error: battleError } = await supabase
        .from('active_battles')
        .select('*')
        .eq('id', battleId)
        .single()

      if (battleError) throw new Error('Failed to fetch battle')

      const battleData = this.transformBattle(battle)
      if (!battleData) throw new Error('Battle not found')
      if (battleData.status !== 'in_progress') throw new Error('Battle is not in progress')

      const isPlayer1 = battleData.player1Id === user.id
      if (!isPlayer1 && battleData.player2Id !== user.id) {
        throw new Error('Not a participant in this battle')
      }

      // Get current round number
      const { data: rounds, error: roundsError } = await supabase
        .from('battle_rounds')
        .select('round_number')
        .eq('battle_id', battleId)
        .order('round_number', { ascending: false })
        .limit(1)

      if (roundsError) throw new Error('Failed to fetch battle rounds')

      const roundNumber = (rounds?.[0]?.round_number || 0) + 1
      if (roundNumber > 5) throw new Error('Battle already has 5 rounds')

      // For computer opponent, generate a random move
      const isComputerOpponent = battleData.player2Id === COMPUTER_USER_ID
      const computerMove = isComputerOpponent ? ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] : null

      // Insert round
      await supabase.from('battle_rounds').insert({
        battle_id: battleId,
        round_number: roundNumber,
        player1_move: isPlayer1 ? move : computerMove,
        player2_move: isPlayer1 ? computerMove : move
      })

      // Check if battle is complete
      const { data: allRounds, error: allRoundsError } = await supabase
        .from('battle_rounds')
        .select('*')
        .eq('battle_id', battleId)
        .order('round_number')

      if (allRoundsError) throw new Error('Failed to fetch all rounds')

      if (allRounds.length === 5 || this.getWinner(allRounds)) {
        await this.completeBattle(battleData, allRounds)
      }

      return {
        round: roundNumber,
        playerMove: move,
        opponentMove: isComputerOpponent ? computerMove : null,
        complete: allRounds.length === 5
      }
    } catch (error) {
      console.error('Failed to make move:', error)
      throw error
    }
  }

  // Determine winner of the rounds
  getWinner(rounds) {
    let player1Wins = 0
    let player2Wins = 0

    for (const round of rounds) {
      const winner = this.getRoundWinner(round.player1_move, round.player2_move)
      if (winner === 1) player1Wins++
      else if (winner === 2) player2Wins++
    }

    if (player1Wins >= 3) return 1
    if (player2Wins >= 3) return 2
    if (rounds.length === 5) return player1Wins > player2Wins ? 1 : 2
    return null
  }

  // Determine winner of a single round
  getRoundWinner(move1, move2) {
    if (move1 === move2) return 0
    if (
      (move1 === 'rock' && move2 === 'scissors') ||
      (move1 === 'paper' && move2 === 'rock') ||
      (move1 === 'scissors' && move2 === 'paper')
    ) {
      return 1
    }
    return 2
  }

  // Complete the battle and transfer card only in human vs human battles
  async completeBattle(battle, rounds) {
    const winner = this.getWinner(rounds)
    if (!winner) return

    const winnerId = winner === 1 ? battle.player1Id : battle.player2Id
    const loserId = winner === 1 ? battle.player2Id : battle.player1Id

    // Skip card transfer for computer battles
    if (loserId !== COMPUTER_USER_ID) {
      const loserCardId = winner === 1 ? battle.player2CardId : battle.player1CardId
      await supabase.rpc('transfer_card', {
        card_id: loserCardId,
        new_owner_id: winnerId
      })
    }

    await supabase
      .from('active_battles')
      .update({
        status: 'completed',
        winner_id: winnerId
      })
      .eq('id', battle.id)
  }
}

export default new BattleService()
