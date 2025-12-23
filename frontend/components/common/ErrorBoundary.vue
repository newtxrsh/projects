<template>
  <div v-if="error" class="error-boundary">
    <div class="error-boundary-content">
      <div class="error-icon">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 class="error-title">Something went wrong</h3>
      
      <p v-if="fallbackMessage" class="error-message">
        {{ fallbackMessage }}
      </p>
      <p v-else class="error-message">
        An unexpected error occurred. Please try again.
      </p>
      
      <div class="error-details" v-if="showDetails && error">
        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-white/50 hover:text-white/70">
            Technical Details
          </summary>
          <pre class="mt-2 p-3 bg-black/30 rounded-lg text-xs text-red-400 overflow-auto max-h-32">{{ error.message || error }}</pre>
        </details>
      </div>
      
      <div class="error-actions">
        <button 
          @click="retry" 
          class="retry-btn"
          aria-label="Retry loading"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  fallbackMessage?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
})

const emit = defineEmits<{
  'error': [error: Error]
  'retry': []
}>()

const error = ref<Error | null>(null)

const retry = () => {
  error.value = null
  emit('retry')
}

// Handle errors from child components
onErrorCaptured((err: Error) => {
  error.value = err
  emit('error', err)
  console.error('ErrorBoundary caught:', err)
  return false // Prevent propagation
})

// Expose reset method
defineExpose({
  reset: () => {
    error.value = null
  }
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.error-boundary-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: rgba(239, 68, 68, 0.7);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
}

.error-actions {
  margin-top: 1rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.retry-btn:focus {
  outline: none;
  ring: 2px solid rgba(59, 130, 246, 0.5);
}
</style>
