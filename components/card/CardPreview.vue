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
      effectsService: null
    }
  },

  computed: {
    transformStyle() {
      return this.effectsService?.getTransformStyle() || {}
    }
  },

  mounted() {
    this.effectsService = new PreviewEffectsService(this.$refs["yugiohcard-wrap"])
  },

  methods: {
    move(e) {
      this.effectsService?.handleMouseMove(e)
    },

    leave(e) {
      this.effectsService?.handleMouseLeave(e)
    },

    getCanvas() {
      return this.$refs.yugiohcard
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
