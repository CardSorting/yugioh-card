declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}

declare module '~/services/battle/types' {
  export type Move = 'rock' | 'paper' | 'scissors'
  export type BattleStatus = 'active' | 'completed'

  export interface Battle {
    id: string
    player1Id: string
    player2Id: string
    player1CardId?: string
    player2CardId?: string
    status: BattleStatus
    isComputerBattle: boolean
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
    isComputerBattle: boolean
    status: BattleStatus
  }

  export class BattleError extends Error {
    code?: string
    constructor(message: string, code?: string)
  }
}

declare module '~/composables/battle/useBattleState' {
  import { Ref } from '@nuxtjs/composition-api'
  import { Battle, Move, Round } from '~/services/battle/types'
  
  export function useBattleState(battle: Battle, rounds: Round[]): {
    state: {
      currentRound: number;
      currentMove: Move | null;
      playerWins: number;
      opponentWins: number;
      showRoundResult: boolean;
      cardTransferred: boolean;
    };
    lastRound: Round | null;
    makeMove: (move: Move) => void;
    reset: () => void;
    showRoundResult: () => void;
    hideRoundResult: () => void;
    getRoundWinner: (player1Move: Move, player2Move: Move) => number;
  }
}

declare module '~/composables/battle/feedback/useBattleFeedback' {
  export function useBattleFeedback(): {
    triggerFeedback: (type: string, x?: number, y?: number) => void;
    toggleSound: () => void;
    toggleHaptics: () => void;
    clearEffects: () => void;
    isSoundEnabled: boolean;
    isHapticsEnabled: boolean;
    particles: any;
  }
}
