<template>
  <div class="deck-card-list">
    <div
      v-for="card in cards"
      :key="card.id"
      class="deck-card-item"
      :class="{
        'rarity-common': isCommon(card),
        'rarity-rare': isRare(card),
        'rarity-ultra': isUltraRare(card)
      }"
      @mouseenter="$emit('preview', card)"
      @mouseleave="$emit('preview', null)"
    >
      <div class="d-flex align-items-center p-2">
        <img
          :src="card.image_url"
          :alt="card.name"
          class="deck-card-thumb mr-2"
        >
        <div class="flex-grow-1">
          <div class="deck-card-name">{{ card.name }}</div>
          <div class="deck-card-details text-muted">
            <span>{{ card.type }}</span>
            <template v-if="isMonster(card)">
              <span class="mx-1">•</span>
              <span>ATK/{{ card.card_data.atk }}</span>
              <span class="mx-1">•</span>
              <span>DEF/{{ card.card_data.def }}</span>
            </template>
          </div>
        </div>
        <div class="deck-card-actions">
          <b-button
            size="sm"
            variant="link"
            class="p-0 mr-2"
            @click="$emit('remove', card)"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeckCardList',

  props: {
    cards: {
      type: Array,
      required: true
    }
  },

  methods: {
    isMonster(card) {
      return card.card_data.type.includes('Monster')
    },

    isCommon(card) {
      return !this.isRare(card) && !this.isUltraRare(card)
    },

    isRare(card) {
      return card.card_data.rarity === 'Rare'
    },

    isUltraRare(card) {
      return ['Ultra Rare', 'Secret Rare'].includes(card.card_data.rarity)
    }
  }
}
</script>

<style scoped>
.deck-card-list {
  padding: 1rem;
}

.deck-card-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #fff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.deck-card-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.deck-card-item:hover {
  border-color: #007bff;
  transform: translateX(4px);
}

/* Rarity animations inspired by Hearthstone */
.rarity-rare:hover::before {
  left: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 112, 255, 0.2),
    transparent
  );
}

.rarity-ultra {
  border-color: #ffd700;
}

.rarity-ultra:hover::before {
  left: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.3),
    transparent
  );
}

.deck-card-thumb {
  width: 45px;
  height: 65px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.deck-card-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.deck-card-details {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.deck-card-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.deck-card-item:hover .deck-card-actions {
  opacity: 1;
}
</style>
