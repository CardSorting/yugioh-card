import { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseDataAccess } from './implementations/SupabaseDataAccess'
import { RockPaperScissorsRules } from './implementations/RockPaperScissorsRules'
import { CardService } from './implementations/CardService'
import { BattleQueueService } from './implementations/BattleQueueService'
import { BattleService } from './implementations/BattleService'
import { IBattleService } from './interfaces/IBattleService'
import { IQueueService } from './interfaces/IQueueService'
import { ICardService } from './interfaces/ICardService'

export interface BattleServices {
  battleService: IBattleService
  queueService: IQueueService
  cardService: ICardService
}

export class BattleServiceFactory {
  static create(supabase: SupabaseClient): BattleServices {
    // Create data access layer
    const dataAccess = new SupabaseDataAccess(supabase)

    // Create game rules
    const gameRules = new RockPaperScissorsRules()

    // Create card service
    const cardService = new CardService(dataAccess)

    // Create queue service
    const queueService = new BattleQueueService(dataAccess, cardService)

    // Create battle service
    const battleService = new BattleService(dataAccess, gameRules, cardService)

    return {
      battleService,
      queueService,
      cardService
    }
  }
}
