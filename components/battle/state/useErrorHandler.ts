import { ref, onBeforeUnmount } from '@nuxtjs/composition-api'
import type { ErrorState, ErrorDetails } from '../types/battle-game.types'
import { ErrorCategory } from '../types/battle-game.types'

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000
const ERROR_DISPLAY_DURATION = 3000

export function useErrorHandler() {
  const state = ref<ErrorState>({
    error: null,
    errorTimeout: null,
    retryCount: 0,
    lastError: null
  })

  const cleanupFns: Array<() => void> = []

  const categorizeError = (error: any): ErrorCategory => {
    if (error instanceof TypeError || error.message?.includes('network')) {
      return ErrorCategory.NETWORK
    }
    if (error.message?.includes('state') || error.message?.includes('invalid state')) {
      return ErrorCategory.STATE
    }
    if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      return ErrorCategory.VALIDATION
    }
    if (error.message?.includes('timeout')) {
      return ErrorCategory.TIMEOUT
    }
    return ErrorCategory.UNKNOWN
  }

  const handleError = (error: string | Error, context?: Record<string, any>) => {
    if (state.value.errorTimeout) {
      clearTimeout(state.value.errorTimeout)
    }

    const errorMessage = error instanceof Error ? error.message : error
    const category = error instanceof Error ? categorizeError(error) : ErrorCategory.UNKNOWN

    const errorDetails: ErrorDetails = {
      message: errorMessage,
      category,
      timestamp: Date.now(),
      context
    }

    state.value.lastError = errorDetails
    state.value.error = errorMessage

    // Log error with context for debugging
    console.error('Battle Game Error:', {
      ...errorDetails,
      retryCount: state.value.retryCount
    })

    // Auto-clear error after display duration
    state.value.errorTimeout = window.setTimeout(() => {
      state.value.error = null
    }, ERROR_DISPLAY_DURATION) as unknown as number

    // Attempt recovery based on error category
    if (category === ErrorCategory.NETWORK && state.value.retryCount < MAX_RETRY_ATTEMPTS) {
      state.value.retryCount++
      const retryTimeout = window.setTimeout(() => {
        // Trigger retry logic
        state.value.error = null
        // Emit retry event that can be handled by parent components
        window.dispatchEvent(new CustomEvent('battle:retry', { detail: errorDetails }))
      }, RETRY_DELAY * state.value.retryCount)
      
      cleanupFns.push(() => clearTimeout(retryTimeout))
    }
  }

  const clearError = () => {
    if (state.value.errorTimeout) {
      clearTimeout(state.value.errorTimeout)
    }
    state.value.error = null
    state.value.retryCount = 0
    state.value.lastError = null
  }

  const canRetry = (category: ErrorCategory): boolean => {
    return category === ErrorCategory.NETWORK && 
           state.value.retryCount < MAX_RETRY_ATTEMPTS
  }

  onBeforeUnmount(() => {
    cleanupFns.forEach(cleanup => cleanup())
  })

  return {
    error: state,
    handleError,
    clearError,
    canRetry
  }
}
