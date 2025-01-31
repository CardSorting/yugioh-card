import { supabase } from '~/config/supabase'
import { BattleServiceFactory } from './battle/BattleServiceFactory'
import { Move } from './battle/types'

// Create battle services using factory
const { battleService, queueService, cardService } = BattleServiceFactory.create(supabase)

class BattleServiceFacade {
  async joinQueue() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('Authentication required')

    return queueService.joinQueue(user.id)
  }

  async leaveQueue() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('Authentication required')

    return queueService.leaveQueue(user.id)
  }

  async makeMove(battleId: string, move: Move) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('Authentication required')

    return battleService.makeMove(battleId, user.id, move)
  }

  async getBattleStatus(battleId: string) {
    return battleService.getBattleStatus(battleId)
  }

  async getRandomUserCard(userId: string) {
    return cardService.getRandomUserCard(userId)
  }
}

// Export singleton instance
export default new BattleServiceFacade()
