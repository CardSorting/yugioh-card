export type Move = 'rock' | 'paper' | 'scissors'

export interface BattleState {
  isUpdating: boolean
  currentRound: number
  playerWins: number
  opponentWins: number
  isComplete: boolean
  loading: boolean
  currentMove: Move | null
  showRoundResult: boolean
  cardTransferred: boolean
  error: string | null
}

export type BattleStatus = 'active' | 'completed'

export interface Battle {
  id: string
  player1Id: string
  player2Id: string
  player1CardId?: string
  player2CardId?: string
  status: BattleStatus
  winnerId?: string
}

export interface Round {
  battleId: string
  roundNumber: number
  player1Move: Move
  player2Move: Move
}

export interface QueueEntry {
  id: string
  playerId: string
  createdAt: string
}

export interface Card {
  id: string
  userId: string
}

export interface BattleCreationData {
  player1Id: string
  player2Id: string
  player1CardId?: string
  player2CardId?: string
  status: BattleStatus
}

// Constants
export const COMPUTER_USER_ID = 'b1b2d700-b02c-4ef5-bc5f-ec6eba7026af'
export const COMPUTER_CARD_ID = '00000000-0000-0000-0000-000000000002'

export class BattleError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'BattleError'
  }
}
