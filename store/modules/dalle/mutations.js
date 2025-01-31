export const SET_LOADING = 'SET_LOADING';
export const SET_ANALYZING = 'SET_ANALYZING';
export const SET_ERROR = 'SET_ERROR';
export const SET_GENERATED_IMAGE = 'SET_GENERATED_IMAGE';
export const SET_UPLOADED_IMAGE = 'SET_UPLOADED_IMAGE';
export const SET_IMAGE_DESCRIPTION = 'SET_IMAGE_DESCRIPTION';
export const RESET_STATE = 'RESET_STATE';

export default {
  [SET_LOADING](state, loading) {
    state.loading = loading;
  },

  [SET_ERROR](state, error) {
    state.error = error;
  },

  [SET_GENERATED_IMAGE](state, image) {
    state.generatedImage = image;
  },

  [SET_ANALYZING](state, analyzing) {
    state.analyzing = analyzing;
  },

  [SET_UPLOADED_IMAGE](state, image) {
    state.uploadedImage = image;
  },

  [SET_IMAGE_DESCRIPTION](state, description) {
    state.imageDescription = description;
  },

  [RESET_STATE](state) {
    state.loading = false;
    state.analyzing = false;
    state.error = null;
    state.generatedImage = null;
    state.uploadedImage = null;
    state.imageDescription = null;
  }
};
