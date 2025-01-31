import { Battle, Round, Move } from '~/services/battle/types'

export interface BattleGameState {
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

export interface BattleGameProps {
  battle: Battle
  rounds: Round[]
  playerCard?: any
  opponentCard?: any
}

export interface RoundState {
  currentRound: number
  lastRound: Round | null
  showRoundResult: boolean
}

export interface ErrorState {
  error: string | null
  errorTimeout: number | null
  retryCount: number
  lastError: ErrorDetails | null
}

export interface ErrorDetails {
  message: string
  category: ErrorCategory
  timestamp: number
  context?: Record<string, any>
}

export enum ErrorCategory {
  NETWORK = 'network',
  STATE = 'state',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

export interface FeedbackOptions {
  type: string
  args: any[]
}

export type ErrorHandler = (error: string | Error, context?: Record<string, any>) => void
export type FeedbackHandler = (type: string, ...args: any[]) => void
