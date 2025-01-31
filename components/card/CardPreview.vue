<template>
  <div 
    id="yugiohcard-wrap"
    ref="yugiohcard-wrap"
    class="card-body"
    :style="transformStyle"
    @mousemove="move"
    @mouseleave="leave"
  >
    <canvas id="yugiohcard" ref="yugiohcard" class="cardbg img-fluid"></canvas>
  </div>
</template>

<script>
import PreviewEffectsService from '~/services/previewEffectsService';
import { canvasManager } from '~/services/card/canvas/CanvasManager';
import { imageLoader } from '~/services/card/resources/ImageLoader';
import { cardRendererFactory } from '~/services/card/rendering/CardRendererFactory';
import { mapState } from 'vuex';

export default {
  name: 'CardPreview',
  
  data() {
    return {
      effectsService: null,
      canvasInitialized: false,
      canvasReady: false,
      initializationPromise: null,
      _resolveCanvas: null,
      _rejectCanvas: null
    }
  },

  computed: {
    ...mapState({
      cardState: state => state.card
    }),
    
    transformStyle() {
      return this.effectsService?.getTransformStyle() || {}
    }
  },

  created() {
    // Create a promise that will resolve when the canvas is ready
    this.initializationPromise = new Promise((resolve, reject) => {
      this._resolveCanvas = resolve;
      this._rejectCanvas = reject;
    });
  },

  async mounted() {
    try {
      console.log('CardPreview mounted, starting initialization');
      
      // Initialize effects service
      console.log('Initializing effects service...');
      this.effectsService = new PreviewEffectsService(this.$refs["yugiohcard-wrap"]);
      
      // Get canvas element
      console.log('Getting canvas element...');
      const canvas = this.getCanvas();
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Initialize canvas manager
      console.log('Initializing canvas manager...');
      await canvasManager.initialize(canvas, {
        width: 1000,
        height: 1450,
        contextType: '2d'
      });
      
      // Mark canvas as ready
      this.canvasInitialized = true;
      this.canvasReady = true;
      
      console.log('CardPreview initialization complete');
      this._resolveCanvas(canvas);
    } catch (error) {
      console.error('Error initializing CardPreview:', error);
      this.$store.commit('setError', 'Failed to initialize card preview');
      this._rejectCanvas(error);
    }
  },

  beforeDestroy() {
    if (!this.canvasReady && this._rejectCanvas) {
      this._rejectCanvas(new Error('Component destroyed before canvas was ready'));
    }
  },

  watch: {
    cardState: {
      deep: true,
      async handler(newState) {
        if (!this.canvasReady || !newState) return;
        
        try {
          // Get canvas and context
          const canvas = canvasManager.getCanvas();
          const ctx = canvasManager.getContext();
          if (!canvas || !ctx) {
            throw new Error('Canvas not properly initialized');
          }

          // Load images
          const imageMap = this.$imageUrlService.getImageMap(newState, newState.cardMeta[newState.cardLang]._templateLang);
          const images = await imageLoader.loadImages(imageMap);

          // Load fonts
          const fonts = [
            'MatrixBoldSmallCaps',
            ...newState.cardMeta[newState.cardLang]._fontName,
            'cardkey',
            'link'
          ];
          await imageLoader.preloadFonts(fonts);

          // Get appropriate renderer and render card
          const renderer = cardRendererFactory.createRenderer(newState);
          await renderer.render(newState, {
            canvas,
            context: ctx,
            images,
            fonts
          });
        } catch (error) {
          console.error('Error rendering card:', error);
          this.$store.commit('setError', 'Failed to render card');
        }
      }
    }
  },

  methods: {
    move(e) {
      this.effectsService?.handleMouseMove(e)
    },

    leave(e) {
      this.effectsService?.handleMouseLeave(e)
    },

    getCanvas() {
      const canvas = this.$refs.yugiohcard;
      console.log('CardPreview.getCanvas called:', canvas ? 'Canvas found' : 'Canvas not found');
      if (!canvas) {
        console.error('Canvas element not found in CardPreview');
        return null;
      }
      
      return canvas;
    },

    async waitForCanvas() {
      console.log('Waiting for canvas to be ready...');
      try {
        const canvas = await this.initializationPromise;
        console.log('Canvas is ready');
        return canvas;
      } catch (error) {
        console.error('Error waiting for canvas:', error);
        throw error;
      }
    }
  }
}
</script>

<style scoped>
#yugiohcard-wrap {
  transition: transform 0.1s ease;
  transform-style: preserve-3d;
  will-change: transform;
}
#yugiohcard-wrap:hover #yugiohcard {
  transform: translateZ(12px);
}
#yugiohcard {
  transition: transform 0.3s ease;
}
</style>
