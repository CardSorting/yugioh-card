import { Store } from 'vuex';
import { IImageStateManager, CardImage } from '../interfaces/ICardImageService';

export class VuexImageStateManager implements IImageStateManager {
  constructor(private store: Store<any>) {}

  updateImageState(image: CardImage): void {
    this.store.commit('card/SET_CARD_IMAGE', {
      file: image.file,
      generation: image.generation
    });
  }

  getImageState(): CardImage {
    const cardState = this.store.state.card;
    return {
      file: cardState.cardImg.file,
      generation: cardState.cardImg.generation
    };
  }
}
