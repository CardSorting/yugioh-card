import { Move, Round } from '../types'

export interface IGameRules {
  /**
   * Determine the winner of a single round
   * @returns 0 for draw, 1 for player1 win, 2 for player2 win
   */
  determineRoundWinner(move1: Move, move2: Move): number

  /**
   * Determine the winner of the battle based on all rounds
   * @returns 1 for player1 win, 2 for player2 win, null if battle not complete
   */
  determineBattleWinner(rounds: Round[]): number | null

  /**
   * Check if battle is complete based on rounds played
   */
  isBattleComplete(rounds: Round[]): boolean

  /**
   * Get the number of wins needed to win the battle
   */
  getWinsRequired(): number

  /**
   * Get the maximum number of rounds allowed
   */
  getMaxRounds(): number
}
