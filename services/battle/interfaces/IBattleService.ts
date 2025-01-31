import { Battle, Move, Round } from '../types'

export interface IBattleService {
  /**
   * Create a new battle between two players
   * @throws {BattleError} If either player is already in a battle
   */
  createBattle(player1Id: string, player2Id: string, isComputerBattle?: boolean): Promise<Battle>

  /**
   * Make a move in the battle
   * @throws {BattleError} If battle not found, already completed, or invalid move
   */
  makeMove(battleId: string, playerId: string, move: Move): Promise<{
    round: number
    playerMove: Move
    opponentMove: Move
    complete: boolean
  }>

  /**
   * Get the current status of a battle
   * @throws {BattleError} If battle not found
   */
  getBattleStatus(battleId: string): Promise<{
    battle: Battle
    rounds: Round[]
    currentRound: number
    winner?: string
  }>

  /**
   * Complete a battle and handle rewards
   * @throws {BattleError} If battle not found or already completed
   */
  completeBattle(battleId: string): Promise<{
    winnerId: string
    cardTransferred?: boolean
  }>
}
