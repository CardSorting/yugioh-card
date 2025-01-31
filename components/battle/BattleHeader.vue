<template>
  <div class="battle-header">
    <h2 class="battle-title">Battle in Progress</h2>
    <div class="round-progress">
      <div class="progress-bar">
        <div 
          v-for="i in 5" 
          :key="i"
          class="progress-segment"
          :class="{
            'completed': i <= currentRound - 1,
            'active': i === currentRound
          }"
        >
          <span class="round-number">{{ i }}</span>
        </div>
      </div>
      <p class="round-text">Round {{ currentRound }} of 5</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BattleHeader',
  
  props: {
    currentRound: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.battle-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(to right, #2c3e50, #3498db);
  border-radius: 8px;
  color: white;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.battle-title {
  font-size: 2rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.round-progress {
  max-width: 500px;
  margin: 0 auto;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 20px;
}

.progress-segment {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.progress-segment::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  width: calc(100% - 40px);
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%);
}

.progress-segment:last-child::after {
  display: none;
}

.progress-segment.completed {
  background: #2ecc71;
  transform: scale(1.1);
}

.progress-segment.completed::after {
  background: #2ecc71;
}

.progress-segment.active {
  background: #f1c40f;
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(241, 196, 15, 0.5);
}

.round-number {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.round-text {
  font-size: 1.2rem;
  margin: 10px 0 0 0;
  font-weight: 500;
}

@media (max-width: 600px) {
  .battle-title {
    font-size: 1.5rem;
  }

  .progress-segment {
    width: 30px;
    height: 30px;
  }

  .round-number {
    font-size: 0.9rem;
  }

  .round-text {
    font-size: 1rem;
  }
}
</style>
