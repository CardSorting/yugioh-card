<template>
  <div class="deck-header">
    <div class="header-content">
      <!-- Deck Name -->
      <div class="deck-name">
        <template v-if="isEditing">
          <b-form-input
            v-model="localName"
            placeholder="Enter deck name"
            :state="isNameValid"
            @blur="saveName"
            @keyup.enter="saveName"
          />
          <div v-if="!isNameValid" class="invalid-feedback">
            Deck name is required
          </div>
        </template>
        <h1 v-else class="mb-0" @click="startEditing">
          {{ name || 'Untitled Deck' }}
          <font-awesome-icon
            :icon="['fas', 'pen']"
            class="edit-icon ml-2"
          />
        </h1>
      </div>

      <!-- Deck Stats -->
      <div class="deck-stats">
        <div class="stat-item">
          <span class="stat-label">Main:</span>
          <span 
            class="stat-value"
            :class="{ 'text-danger': mainCount > 60 || mainCount < 40 }"
          >
            {{ mainCount }}/60
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Extra:</span>
          <span 
            class="stat-value"
            :class="{ 'text-danger': extraCount > 15 }"
          >
            {{ extraCount }}/15
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Side:</span>
          <span 
            class="stat-value"
            :class="{ 'text-danger': sideCount > 15 }"
          >
            {{ sideCount }}/15
          </span>
        </div>
      </div>

      <!-- Deck Actions -->
      <div class="deck-actions">
        <b-button-group>
          <b-button
            variant="outline-primary"
            :disabled="!isDeckValid"
            @click="$emit('save')"
          >
            <font-awesome-icon :icon="['fas', 'save']" />
            <span class="ml-1">Save</span>
          </b-button>
          <b-button
            variant="outline-success"
            :disabled="!isDeckValid"
            @click="$emit('share')"
          >
            <font-awesome-icon :icon="['fas', 'share-alt']" />
            <span class="ml-1">Share</span>
          </b-button>
          <b-button
            variant="outline-info"
            :disabled="!isDeckValid"
            @click="$emit('export')"
          >
            <font-awesome-icon :icon="['fas', 'file-export']" />
            <span class="ml-1">Export</span>
          </b-button>
        </b-button-group>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'DeckHeader',

  props: {
    /**
     * Deck name
     */
    name: {
      type: String,
      default: ''
    },

    /**
     * Main deck count
     */
    mainCount: {
      type: Number,
      default: 0
    },

    /**
     * Extra deck count
     */
    extraCount: {
      type: Number,
      default: 0
    },

    /**
     * Side deck count
     */
    sideCount: {
      type: Number,
      default: 0
    },

  },

  data() {
    return {
      isEditing: false,
      localName: this.name
    }
  },

  computed: {
    /**
     * Whether deck name is valid
     */
    isNameValid() {
      return this.localName && this.localName.trim().length > 0
    },

    /**
     * Whether deck has a valid name
     */
    isDeckValid() {
      return this.isNameValid
    }
  },

  watch: {
    name(newName) {
      this.localName = newName
    }
  },

  methods: {
    startEditing() {
      this.isEditing = true
      this.$nextTick(() => {
        this.$el.querySelector('input')?.focus()
      })
    },

    saveName() {
      if (this.isNameValid && this.localName !== this.name) {
        this.$emit('update:name', this.localName)
      }
      this.isEditing = false
    }
  }
}
</script>

<style scoped>
.deck-header {
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.deck-name {
  flex: 1;
}

.deck-name h1 {
  font-size: 1.5rem;
  cursor: pointer;
}

.deck-name h1:hover .edit-icon {
  opacity: 1;
}

.edit-icon {
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.deck-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-weight: 500;
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
}

</style>
