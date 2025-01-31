import { IGameRules } from '../interfaces/IGameRules'
import { Move, Round } from '../types'

export class RockPaperScissorsRules implements IGameRules {
  private readonly winsRequired = 3
  private readonly maxRounds = 5

  determineRoundWinner(move1: Move, move2: Move): number {
    if (move1 === move2) return 0

    const winningMoves: Record<Move, Move> = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    }

    return winningMoves[move1] === move2 ? 1 : 2
  }

  determineBattleWinner(rounds: Round[]): number | null {
    let player1Wins = 0
    let player2Wins = 0

    for (const round of rounds) {
      const winner = this.determineRoundWinner(round.player1Move, round.player2Move)
      if (winner === 1) player1Wins++
      else if (winner === 2) player2Wins++
    }

    // Check if either player has reached required wins
    if (player1Wins >= this.winsRequired) return 1
    if (player2Wins >= this.winsRequired) return 2

    // If max rounds reached, player with most wins is winner
    if (rounds.length === this.maxRounds) {
      if (player1Wins === player2Wins) {
        // In case of tie after max rounds, player 1 wins (can be modified based on requirements)
        return 1
      }
      return player1Wins > player2Wins ? 1 : 2
    }

    return null
  }

  isBattleComplete(rounds: Round[]): boolean {
    if (rounds.length === this.maxRounds) return true

    let player1Wins = 0
    let player2Wins = 0

    for (const round of rounds) {
      const winner = this.determineRoundWinner(round.player1Move, round.player2Move)
      if (winner === 1) player1Wins++
      else if (winner === 2) player2Wins++

      if (player1Wins >= this.winsRequired || player2Wins >= this.winsRequired) {
        return true
      }
    }

    return false
  }

  getWinsRequired(): number {
    return this.winsRequired
  }

  getMaxRounds(): number {
    return this.maxRounds
  }
}
