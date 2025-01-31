<template>
  <div class="battle-skeleton" role="status" aria-label="Loading game">
    <div class="header-skeleton">
      <div class="title-skeleton"></div>
      <div class="progress-skeleton">
        <div v-for="i in 5" :key="i" class="progress-dot"></div>
      </div>
    </div>

    <div class="cards-skeleton">
      <div class="card-skeleton">
        <div class="card-image-skeleton"></div>
        <div class="card-label-skeleton"></div>
      </div>
      <div class="vs-skeleton">VS</div>
      <div class="card-skeleton">
        <div class="card-image-skeleton"></div>
        <div class="card-label-skeleton"></div>
      </div>
    </div>

    <div class="controls-skeleton">
      <div v-for="i in 3" :key="i" class="button-skeleton"></div>
    </div>

    <span class="sr-only">Loading game interface...</span>
  </div>
</template>

<script>
export default {
  name: 'BattleSkeleton'
}
</script>

<style scoped>
.battle-skeleton {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.header-skeleton {
  text-align: center;
  margin-bottom: 30px;
}

.title-skeleton {
  height: 32px;
  width: 200px;
  background: #e0e0e0;
  margin: 0 auto 20px;
  border-radius: 4px;
}

.progress-skeleton {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  max-width: 300px;
}

.progress-dot {
  width: 30px;
  height: 30px;
  background: #e0e0e0;
  border-radius: 50%;
}

.cards-skeleton {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 40px 0;
}

.card-skeleton {
  text-align: center;
}

.card-image-skeleton {
  width: 220px;
  height: 320px;
  background: #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.card-label-skeleton {
  height: 20px;
  width: 100px;
  background: #e0e0e0;
  margin: 0 auto;
  border-radius: 4px;
}

.vs-skeleton {
  font-size: 24px;
  font-weight: bold;
  color: #e0e0e0;
}

.controls-skeleton {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.button-skeleton {
  width: 120px;
  height: 48px;
  background: #e0e0e0;
  border-radius: 8px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .cards-skeleton {
    flex-direction: column;
    gap: 20px;
  }

  .card-image-skeleton {
    width: 180px;
    height: 260px;
  }

  .controls-skeleton {
    flex-direction: column;
    align-items: center;
  }

  .button-skeleton {
    width: 100%;
    max-width: 300px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
