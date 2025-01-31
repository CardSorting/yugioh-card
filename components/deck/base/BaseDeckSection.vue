<script>
/**
 * Base component for deck sections
 * Provides common functionality and props for deck section components
 */
export default {
  name: 'BaseDeckSection',

  props: {
    /**
     * Cards in the section
     */
    cards: {
      type: Array,
      required: true
    },

    /**
     * Section name (main/extra/side)
     */
    section: {
      type: String,
      required: true,
      validator: value => ['main', 'extra', 'side'].includes(value)
    },

    /**
     * Current section count
     */
    count: {
      type: Number,
      default: 0
    },

    /**
     * Maximum allowed cards in section
     */
    maxCards: {
      type: Number,
      default: 60
    },

    /**
     * Whether section is currently being edited
     */
    isEditing: {
      type: Boolean,
      default: false
    },

    /**
     * Whether to show card previews on hover
     */
    showPreviews: {
      type: Boolean,
      default: true
    },

    /**
     * Whether to show card counts
     */
    showCounts: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    /**
     * Whether section is at max capacity
     */
    isFull() {
      return this.count >= this.maxCards
    },

    /**
     * Whether section has any cards
     */
    isEmpty() {
      return this.count === 0
    },

    /**
     * CSS classes for section
     */
    sectionClasses() {
      return {
        'deck-section': true,
        'is-full': this.isFull,
        'is-empty': this.isEmpty,
        'is-editing': this.isEditing
      }
    }
  },

  methods: {
    /**
     * Handle card click
     * @param {Object} card Clicked card
     */
    onCardClick(card) {
      this.$emit('card-click', { card, section: this.section })
    },

    /**
     * Handle card right click
     * @param {Object} card Right-clicked card
     * @param {Event} event Click event
     */
    onCardRightClick(card, event) {
      event.preventDefault()
      this.$emit('card-right-click', { card, section: this.section, event })
    },

    /**
     * Handle card hover
     * @param {Object} card Hovered card
     * @param {boolean} isEnter Whether mouse entered or left
     */
    onCardHover(card, isEnter) {
      if (this.showPreviews) {
        this.$emit('card-hover', { card, isEnter, section: this.section })
      }
    },

    /**
     * Handle card removal
     * @param {Object} card Card to remove
     */
    onCardRemove(card) {
      this.$emit('card-remove', { card, section: this.section })
    },

    /**
     * Handle drag start
     * @param {Object} card Dragged card
     * @param {Event} event Drag event
     */
    onDragStart(card, event) {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        cardId: card.id,
        sourceSection: this.section
      }))
      this.$emit('drag-start', { card, section: this.section, event })
    },

    /**
     * Handle drag over
     * @param {Event} event Drag event
     */
    onDragOver(event) {
      event.preventDefault()
      this.$emit('drag-over', { section: this.section, event })
    },

    /**
     * Handle drop
     * @param {Event} event Drop event
     */
    onDrop(event) {
      event.preventDefault()
      const data = JSON.parse(event.dataTransfer.getData('text/plain'))
      this.$emit('drop', { 
        cardId: data.cardId,
        sourceSection: data.sourceSection,
        targetSection: this.section,
        event
      })
    }
  }
}
</script>

<style scoped>
.deck-section {
  position: relative;
  min-height: 100px;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.deck-section.is-full {
  background: #fff5f5;
}

.deck-section.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
}

.deck-section.is-editing {
  box-shadow: 0 0 0 2px #007bff;
}
</style>
