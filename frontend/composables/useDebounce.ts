/**
 * useDebounce - Composable for debouncing values and functions
 * 
 * @example
 * // Debounce a ref value
 * const searchQuery = ref('')
 * const debouncedQuery = useDebouncedRef(searchQuery, 300)
 * 
 * // Debounce a function
 * const { debounce } = useDebounce()
 * const debouncedSearch = debounce((query: string) => {
 *   fetchResults(query)
 * }, 300)
 */

import type { Ref } from 'vue'

/**
 * Creates a debounced version of a ref
 */
export function useDebouncedRef<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  onUnmounted(() => {
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  return debounced
}

/**
 * Provides debounce utility functions
 */
export function useDebounce() {
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

  /**
   * Creates a debounced version of a function
   */
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
    key: string = 'default'
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      const existingTimeout = timeouts.get(key)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const timeout = setTimeout(() => {
        fn(...args)
        timeouts.delete(key)
      }, delay)

      timeouts.set(key, timeout)
    }
  }

  /**
   * Cancels a pending debounced call
   */
  const cancel = (key: string = 'default') => {
    const timeout = timeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.delete(key)
    }
  }

  /**
   * Cancels all pending debounced calls
   */
  const cancelAll = () => {
    timeouts.forEach((timeout) => clearTimeout(timeout))
    timeouts.clear()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelAll()
  })

  return {
    debounce,
    cancel,
    cancelAll,
  }
}

/**
 * useThrottle - Composable for throttling functions
 */
export function useThrottle() {
  const lastCalled = new Map<string, number>()

  /**
   * Creates a throttled version of a function
   */
  const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    limit: number = 300,
    key: string = 'default'
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      const now = Date.now()
      const last = lastCalled.get(key) || 0

      if (now - last >= limit) {
        fn(...args)
        lastCalled.set(key, now)
      }
    }
  }

  return {
    throttle,
  }
}
