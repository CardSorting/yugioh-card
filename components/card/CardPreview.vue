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
      canvasInitialized: false
    }
  },

  computed: {
    transformStyle() {
      return this.effectsService?.getTransformStyle() || {}
    }
  },

  async mounted() {
    try {
      console.log('CardPreview mounted, initializing services')
      
      // Initialize effects service
      this.effectsService = new PreviewEffectsService(this.$refs["yugiohcard-wrap"])
      
      // Initialize canvas
      const canvas = this.getCanvas()
      if (!canvas) {
        throw new Error('Canvas element not found')
      }

      // Initialize card drawing service
      await this.$cardDrawingService.initialize(canvas)
      this.canvasInitialized = true
      
      console.log('CardPreview initialization complete')
    } catch (error) {
      console.error('Error initializing CardPreview:', error)
      this.$store.commit('setError', 'Failed to initialize card preview')
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
      const canvas = this.$refs.yugiohcard
      console.log('CardPreview.getCanvas called:', canvas ? 'Canvas found' : 'Canvas not found')
      if (!canvas) {
        console.error('Canvas element not found in CardPreview')
      }
      return canvas
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
