import { IBattleService } from '../interfaces/IBattleService'
import { IDataAccess } from '../interfaces/IDataAccess'
import { IGameRules } from '../interfaces/IGameRules'
import { ICardService } from '../interfaces/ICardService'
import { Battle, Move, Round, BattleError, COMPUTER_USER_ID, COMPUTER_CARD_ID } from '../types'

export class BattleService implements IBattleService {
  private moveQueue: Map<string, Promise<any>> = new Map()
  private battleCache: Map<string, { battle: Battle; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5000 // 5 seconds cache TTL
  private readonly MAX_RETRIES = 3

  constructor(
    private readonly dataAccess: IDataAccess,
    private readonly gameRules: IGameRules,
    private readonly cardService: ICardService
  ) {}

  private async withRetry<T>(operation: () => Promise<T>, retries = this.MAX_RETRIES): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0 && error instanceof BattleError) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.withRetry(operation, retries - 1)
      }
      throw error
    }
  }

  private getCachedBattle(battleId: string): Battle | null {
    const cached = this.battleCache.get(battleId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.battle
    }
    return null
  }

  private setCachedBattle(battleId: string, battle: Battle): void {
    this.battleCache.set(battleId, { battle, timestamp: Date.now() })
  }

  private isComputerBattle(battle: Battle): boolean {
    return battle.player2Id === COMPUTER_USER_ID
  }

  async createBattle(
    player1Id: string,
    player2Id: string
  ): Promise<Battle> {
    await this.cardService.validateUserCards(player1Id, player2Id)

    // Get player 1's card
    const player1Card = await this.cardService.getRandomUserCard(player1Id)
    if (!player1Card) {
      throw new BattleError('Player must have at least one card')
    }

    // For computer opponent, use computer card ID
    const player2CardId = player2Id === COMPUTER_USER_ID 
      ? COMPUTER_CARD_ID
      : (await this.cardService.getRandomUserCard(player2Id))?.id

    if (!player2CardId) {
      throw new BattleError('Opponent must have at least one card')
    }

    return this.dataAccess.createBattle({
      player1Id,
      player2Id,
      player1CardId: player1Card.id,
      player2CardId,
      status: 'active'
    })
  }

  async makeMove(
    battleId: string,
    playerId: string,
    move: Move
  ): Promise<{
    round: number
    playerMove: Move
    opponentMove: Move
    complete: boolean
  }> {
    // Queue moves for the same battle to prevent race conditions
    const existingMove = this.moveQueue.get(battleId)
    if (existingMove) {
      await existingMove
    }

    const movePromise = this.withRetry(async () => {
      let battle = this.getCachedBattle(battleId) || await this.dataAccess.getBattle(battleId)
      if (!battle) {
        throw new BattleError('Battle not found')
      }

      this.setCachedBattle(battleId, battle)

      if (battle.status === 'completed') {
        throw new BattleError('Battle already completed')
      }

      const isPlayer1 = battle.player1Id === playerId
      if (!isPlayer1 && battle.player2Id !== playerId) {
        throw new BattleError('Not a participant in this battle')
      }

      // Get current round number with retry
      const rounds = await this.withRetry(() => this.dataAccess.getRounds(battleId))
      const roundNumber = rounds.length + 1

      if (roundNumber > this.gameRules.getMaxRounds()) {
        throw new BattleError('Maximum rounds reached')
      }

      // For computer opponent, generate a random move
      const computerMove: Move = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] as Move

      const isComputerOpponent = this.isComputerBattle(battle)
      const opponentMove = isComputerOpponent ? computerMove : move

      // Add round with retry
      await this.withRetry(() => 
        this.dataAccess.addRound(
          battleId,
          roundNumber,
          isPlayer1 ? move : opponentMove,
          isPlayer1 ? opponentMove : move
        )
      )

      // Get updated rounds with retry
      const updatedRounds = await this.withRetry(() => this.dataAccess.getRounds(battleId))

      // Check if battle is complete
      if (this.gameRules.isBattleComplete(updatedRounds)) {
        await this.completeBattle(battleId)
      }

      return {
        round: roundNumber,
        playerMove: move,
        opponentMove: isComputerOpponent ? computerMove : (isPlayer1 ? opponentMove : move),
        complete: this.gameRules.isBattleComplete(updatedRounds)
      }
    })

    this.moveQueue.set(battleId, movePromise)
    
    try {
      return await movePromise
    } finally {
      this.moveQueue.delete(battleId)
    }
  }

  async getBattleStatus(battleId: string): Promise<{
    battle: Battle
    rounds: Round[]
    currentRound: number
    winner?: string
  }> {
    return this.withRetry(async () => {
      let battle = this.getCachedBattle(battleId)
      let rounds: Round[] = []

      if (!battle) {
        [battle, rounds] = await Promise.all([
          this.dataAccess.getBattle(battleId),
          this.dataAccess.getRounds(battleId)
        ])

        if (!battle) {
          throw new BattleError('Battle not found')
        }

        this.setCachedBattle(battleId, battle)
      } else {
        rounds = await this.dataAccess.getRounds(battleId)
      }

      return {
        battle,
        rounds,
        currentRound: rounds.length + 1,
        winner: battle.winnerId
      }
    })
  }

  async completeBattle(battleId: string): Promise<{
    winnerId: string
    cardTransferred?: boolean
  }> {
    return this.withRetry(async () => {
      const [battle, rounds] = await Promise.all([
        this.dataAccess.getBattle(battleId),
        this.dataAccess.getRounds(battleId)
      ])

      if (!battle) {
        throw new BattleError('Battle not found')
      }

      if (battle.status === 'completed') {
        throw new BattleError('Battle already completed')
      }

      const winner = this.gameRules.determineBattleWinner(rounds)
      if (!winner) {
        throw new BattleError('Cannot determine winner')
      }

      const winnerId = winner === 1 ? battle.player1Id : battle.player2Id
      let cardTransferred = false

      // Only transfer cards in human vs human battles
      if (!this.isComputerBattle(battle)) {
        const loserCardId = winner === 1 ? battle.player2CardId : battle.player1CardId
        const loserId = winner === 1 ? battle.player2Id : battle.player1Id

        if (loserCardId) {
          await this.withRetry(() => 
            this.cardService.transferCard(loserCardId, loserId, winnerId)
          )
          cardTransferred = true
        }
      }

      await this.withRetry(() => 
        this.dataAccess.updateBattleStatus(battleId, 'completed', winnerId)
      )

      // Clear battle from cache since it's completed
      this.battleCache.delete(battleId)

      return {
        winnerId,
        cardTransferred
      }
    })
  }
}
