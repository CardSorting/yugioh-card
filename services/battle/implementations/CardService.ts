import { ICardService } from '../interfaces/ICardService'
import { IDataAccess } from '../interfaces/IDataAccess'
import { Card, BattleError } from '../types'

export class CardService implements ICardService {
  constructor(private readonly dataAccess: IDataAccess) {}

  async getRandomUserCard(userId: string): Promise<Card> {
    const card = await this.dataAccess.getRandomUserCard(userId)
    if (!card) {
      throw new BattleError('User has no cards')
    }
    return card
  }

  async transferCard(cardId: string, fromUserId: string, toUserId: string): Promise<void> {
    // Verify card ownership before transfer
    const card = await this.dataAccess.getRandomUserCard(fromUserId)
    if (!card || card.id !== cardId) {
      throw new BattleError('Card does not belong to the user')
    }

    await this.dataAccess.transferCard(cardId, toUserId)
  }

  async hasCards(userId: string): Promise<boolean> {
    const card = await this.dataAccess.getRandomUserCard(userId)
    return card !== null
  }

  async validateUserCards(player1Id: string, player2Id: string): Promise<void> {
    const [player1HasCards, player2HasCards] = await Promise.all([
      this.hasCards(player1Id),
      this.hasCards(player2Id)
    ])

    if (!player1HasCards) {
      throw new BattleError('Player 1 has no cards')
    }

    if (!player2HasCards && player2Id !== 'COMPUTER') {
      throw new BattleError('Player 2 has no cards')
    }
  }
}
