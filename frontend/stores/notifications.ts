import { defineStore } from 'pinia'

export interface NotificationItem {
  notification_id: number
  user_id: number
  type: 'task_due_reminder' | 'collaborator_added'
  title: string
  message: string
  task_id: number | null
  triggered_by_user_id: number | null
  is_read: boolean
  created_at: string
  updated_at: string
  task?: {
    task_id: number
    title: string
    status: string
    due_date: string | null
  } | null
  triggered_by_user?: {
    user_id: number
    fname: string | null
    email: string
  } | null
}

export interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  isPanelOpen: boolean
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isPanelOpen: false,
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
  },

  actions: {
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen
    },

    openPanel() {
      this.isPanelOpen = true
    },

    closePanel() {
      this.isPanelOpen = false
    },

    async fetchNotifications() {
      const { apiFetch } = useApi()
      this.isLoading = true

      try {
        const notifications = await apiFetch<NotificationItem[]>('/notifications')
        this.notifications = notifications || []
        this.updateUnreadCount()
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchUnreadCount() {
      const { apiFetch } = useApi()

      try {
        const response = await apiFetch<{ count: number }>('/notifications/unread-count')
        if (response) {
          this.unreadCount = response.count
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.is_read).length
    },

    async markAsRead(notificationId: number) {
      const { apiFetch } = useApi()

      try {
        await apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' })
        const notification = this.notifications.find(n => n.notification_id === notificationId)
        if (notification) {
          notification.is_read = true
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },

    async markAllAsRead() {
      const { apiFetch } = useApi()

      try {
        await apiFetch('/notifications/mark-all-read', { method: 'PUT' })
        this.notifications.forEach(n => {
          n.is_read = true
        })
        this.unreadCount = 0
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
      }
    },

    async clearAll() {
      const { apiFetch } = useApi()

      try {
        await apiFetch('/notifications', { method: 'DELETE' })
        this.notifications = []
        this.unreadCount = 0
      } catch (error) {
        console.error('Failed to clear notifications:', error)
      }
    },

    async deleteNotification(notificationId: number) {
      const { apiFetch } = useApi()

      try {
        await apiFetch(`/notifications/${notificationId}`, { method: 'DELETE' })
        this.notifications = this.notifications.filter(n => n.notification_id !== notificationId)
        this.updateUnreadCount()
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    },
  },
})
