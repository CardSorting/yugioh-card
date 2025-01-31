import dalleImageAdapter from '~/services/dalle/dalleImageAdapter';

export default (_, inject) => {
  inject('dalleImageAdapter', dalleImageAdapter);
};
