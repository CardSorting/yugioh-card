import { IQueueService } from '../interfaces/IQueueService'
import { IDataAccess } from '../interfaces/IDataAccess'
import { ICardService } from '../interfaces/ICardService'
import { Battle, BattleError, COMPUTER_USER_ID, COMPUTER_CARD_ID } from '../types'

export class BattleQueueService implements IQueueService {
  constructor(
    private readonly dataAccess: IDataAccess,
    private readonly cardService: ICardService
  ) {}

  async joinQueue(userId: string): Promise<Battle | null> {
    // Check if user is authenticated
    const user = await this.dataAccess.getCurrentUser()
    if (!user) {
      throw new BattleError('Authentication required')
    }

    // Check if user has any cards
    await this.cardService.validateUserCards(userId, COMPUTER_USER_ID)

    // Check if user is already in queue
    const existingEntry = await this.dataAccess.getQueueEntry(userId)
    if (existingEntry) {
      return this.findMatch(userId)
    }

    // Add user to queue
    await this.dataAccess.addToQueue(userId)

    // Try to find a match immediately
    return this.findMatch(userId)
  }

  async leaveQueue(userId: string): Promise<void> {
    const user = await this.dataAccess.getCurrentUser()
    if (!user) {
      throw new BattleError('Authentication required')
    }

    await this.dataAccess.removeFromQueue(userId)
  }

  async findMatch(userId: string): Promise<Battle | null> {
    // Get player's random card
    const player1Card = await this.cardService.getRandomUserCard(userId)
    if (!player1Card) {
      throw new BattleError('Player must have at least one card')
    }

    // Find an opponent
    const opponent = await this.dataAccess.findOldestOpponent(userId)
    
    if (!opponent) {
      // Create computer battle if no human opponent found
      const battle = await this.dataAccess.createBattle({
        player1Id: userId,
        player2Id: COMPUTER_USER_ID,
        player1CardId: player1Card.id,
        player2CardId: COMPUTER_CARD_ID,
        status: 'active'
      })

      return battle
    }

    // Validate opponent has cards
    const player2Card = await this.cardService.getRandomUserCard(opponent.playerId)
    if (!player2Card) {
      throw new BattleError('Opponent must have at least one card')
    }

    // Create human vs human battle
    const battle = await this.dataAccess.createBattle({
      player1Id: userId,
      player2Id: opponent.playerId,
      player1CardId: player1Card.id,
      player2CardId: player2Card.id,
      status: 'active'
    })

    // Remove both players from queue
    await Promise.all([
      this.leaveQueue(userId),
      this.leaveQueue(opponent.playerId)
    ])

    return battle
  }
}
