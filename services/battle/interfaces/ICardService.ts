import { Card } from '../types'

export interface ICardService {
  /**
   * Get a random card from a user's collection
   * @throws {BattleError} If user has no cards
   */
  getRandomUserCard(userId: string): Promise<Card>

  /**
   * Transfer a card from one user to another
   * @throws {BattleError} If card transfer fails
   */
  transferCard(cardId: string, fromUserId: string, toUserId: string): Promise<void>

  /**
   * Check if a user has any cards
   */
  hasCards(userId: string): Promise<boolean>

  /**
   * Validate that both users have cards before battle
   * @throws {BattleError} If either user has no cards
   */
  validateUserCards(player1Id: string, player2Id: string): Promise<void>
}
