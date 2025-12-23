import { defineStore } from 'pinia'
import type { ActivityLog } from '~/types/api'

export interface ActivityState {
  logs: ActivityLog[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
}

export const useActivityStore = defineStore('activity', {
  state: (): ActivityState => ({
    logs: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  }),

  getters: {
    // Recent logs (last 10)
    recentLogs: (state): ActivityLog[] => {
      return state.logs.slice(0, 10)
    },

    // Logs grouped by date
    logsByDate: (state): Record<string, ActivityLog[]> => {
      const grouped: Record<string, ActivityLog[]> = {}
      
      state.logs.forEach(log => {
        const date = log.created_at 
          ? new Date(log.created_at).toLocaleDateString()
          : 'Unknown'
        
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(log)
      })
      
      return grouped
    },

    // Logs for a specific task
    getLogsForTask: (state) => (taskId: number): ActivityLog[] => {
      return state.logs.filter(log => log.task_id === taskId)
    },

    hasLogs: (state): boolean => state.logs.length > 0,
  },

  actions: {
    async fetchLogs(force = false) {
      // Simple cache check (5 minutes)
      if (!force && this.lastFetched && Date.now() - this.lastFetched < 5 * 60 * 1000) {
        return this.logs
      }

      this.isLoading = true
      this.error = null

      try {
        const { fetchActivityLogs } = useApi()
        const data = await fetchActivityLogs()
        this.logs = data || []
        this.lastFetched = Date.now()
        return this.logs
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch activity logs'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async clearLogs() {
      this.isLoading = true
      
      try {
        const { clearActivityLogs } = useApi()
        await clearActivityLogs()
        this.logs = []
      } catch (err: any) {
        this.error = err.message || 'Failed to clear activity logs'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Add a log locally (for optimistic updates)
    addLog(log: ActivityLog) {
      this.logs.unshift(log)
    },

    // Invalidate cache
    invalidateCache() {
      this.lastFetched = null
    },
  },
})
