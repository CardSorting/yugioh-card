import { CardImageService } from '~/services/card/CardImageService';
import { SupabaseImageStorage } from '~/services/card/storage/SupabaseImageStorage';
import { VuexImageStateManager } from '~/services/card/state/VuexImageStateManager';

export default ({ store }, inject) => {
  const storage = new SupabaseImageStorage();
  const stateManager = new VuexImageStateManager(store);
  const imageService = new CardImageService(storage, stateManager);

  // Inject as $cardImageService
  inject('cardImageService', imageService);
}
