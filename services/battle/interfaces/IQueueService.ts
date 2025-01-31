import { Battle } from '../types'

export interface IQueueService {
  /**
   * Add a user to the battle queue
   * @throws {BattleError} If user is already in an active battle or queue
   */
  joinQueue(userId: string): Promise<Battle | null>

  /**
   * Remove a user from the battle queue
   */
  leaveQueue(userId: string): Promise<void>

  /**
   * Find a match for the user in queue
   * @returns Battle if match found, null if no match available
   * @throws {BattleError} If user is not in queue
   */
  findMatch(userId: string): Promise<Battle | null>
}
