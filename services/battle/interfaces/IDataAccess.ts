import { Battle, BattleCreationData, QueueEntry, Round, Card } from '../types'

export interface IDataAccess {
  // Queue operations
  getQueueEntry(userId: string): Promise<QueueEntry | null>
  addToQueue(userId: string): Promise<void>
  removeFromQueue(userId: string): Promise<void>
  findOldestOpponent(userId: string): Promise<QueueEntry | null>
  
  // Battle operations
  getBattle(battleId: string): Promise<Battle | null>
  createBattle(battleData: BattleCreationData): Promise<Battle>
  updateBattleStatus(battleId: string, status: string, winnerId?: string): Promise<void>
  
  // Round operations
  getRounds(battleId: string): Promise<Round[]>
  addRound(battleId: string, roundNumber: number, player1Move: string, player2Move: string): Promise<void>
  
  // Card operations
  getRandomUserCard(userId: string): Promise<Card | null>
  transferCard(cardId: string, newOwnerId: string): Promise<void>
  
  // Auth operations
  getCurrentUser(): Promise<{ id: string } | null>
}
