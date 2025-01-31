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
import PreviewEffectsService from '~/services/previewEffectsService'

export default {
  name: 'CardPreview',
  
  data() {
    return {
      effectsService: null,
      canvasInitialized: false,
      canvasReady: false,
      initializationPromise: null
    }
  },

  computed: {
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

      // Set canvas dimensions
      console.log('Setting canvas dimensions...');
      canvas.width = 813;  // Standard Yu-Gi-Oh card width
      canvas.height = 1185; // Standard Yu-Gi-Oh card height
      
      // Initialize card drawing service
      console.log('Initializing card drawing service...');
      await this.$cardDrawingService.initialize(canvas);
      
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
      
      // Ensure canvas context is available
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas 2D context');
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
    },

    async reinitializeCanvas() {
      try {
        const canvas = this.getCanvas()
        if (!canvas) {
          throw new Error('Canvas element not found')
        }
        
        await this.$cardDrawingService.initialize(canvas)
        this.canvasInitialized = true
        
        console.log('Canvas reinitialization complete')
      } catch (error) {
        console.error('Error reinitializing canvas:', error)
        this.$store.commit('setError', 'Failed to reinitialize card preview')
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
