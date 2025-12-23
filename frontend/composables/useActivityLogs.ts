import type { ActivityLog } from '~/types/api'

export const useActivityLogs = (options?: {
  immediate?: boolean
}) => {
  const api = useApi()
  const toast = useToast()

  const logs = ref<ActivityLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch activity logs
  const fetchLogs = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await api.fetchActivityLogs()
      logs.value = result || []
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch activity logs'
      // Don't show toast for activity logs fetch failure (non-critical)
      console.error('Activity logs fetch error:', error.value)
    } finally {
      loading.value = false
    }
  }

  // Clear all activity logs
  const clearLogs = async () => {
    loading.value = true
    error.value = null

    try {
      await api.clearActivityLogs()
      logs.value = []
      toast.success('Cleared', 'Activity logs have been cleared')
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to clear activity logs'
      toast.error('Error', error.value || undefined)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Get recent logs (limited)
  const recentLogs = computed(() => {
    return logs.value.slice(0, 10)
  })

  // Refresh
  const refresh = async () => {
    await fetchLogs()
  }

  // Fetch immediately if specified
  if (options?.immediate !== false) {
    fetchLogs()
  }

  return {
    logs,
    recentLogs,
    loading,
    error,
    fetchLogs,
    clearLogs,
    refresh,
  }
}
