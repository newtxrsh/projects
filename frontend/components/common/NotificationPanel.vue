<template>
  <div class="notification-wrapper" ref="wrapperRef">
    <!-- Notification Bell Button -->
    <button 
      class="notification-btn"
      @click="togglePanel"
      :aria-label="`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`"
    >
      <svg 
        class="notification-icon" 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Flyout Panel -->
    <Transition name="flyout">
      <div v-if="isPanelOpen" class="notification-panel">
        <!-- Panel Header -->
        <div class="panel-header">
          <h3 class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Notifications
          </h3>
          <div class="panel-actions">
            <button 
              v-if="notifications.length > 0"
              class="panel-action-btn"
              @click="handleMarkAllRead"
              title="Mark all as read"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <button 
              v-if="notifications.length > 0"
              class="panel-action-btn panel-action-danger"
              @click="handleClearAll"
              title="Clear all notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="panel-loading">
          <div class="loading-spinner"></div>
          <span>Loading notifications...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="panel-empty">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
          <p>No notifications yet</p>
          <span>We'll notify you when something important happens</span>
        </div>

        <!-- Notifications List -->
        <div v-else class="notifications-list">
          <TransitionGroup name="notification-item">
            <div 
              v-for="notification in sortedNotifications" 
              :key="notification.notification_id"
              class="notification-card"
              :class="{ 'unread': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <!-- Notification Icon -->
              <div class="notification-card-icon" :class="getIconClass(notification.type)">
                <svg v-if="notification.type === 'task_due_reminder'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <svg v-if="notification.type === 'task_overdue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <svg v-else-if="notification.type === 'collaborator_added'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>

              <!-- Notification Content -->
              <div class="notification-card-content">
                <div class="notification-card-header">
                  <span class="notification-card-title">{{ notification.title }}</span>
                  <span v-if="!notification.is_read" class="unread-dot"></span>
                </div>
                <p class="notification-card-message">{{ notification.message }}</p>
                <span class="notification-card-time">{{ formatTimeAgo(notification.created_at) }}</span>
              </div>

              <!-- Delete Button -->
              <button 
                class="notification-delete-btn"
                @click.stop="handleDeleteNotification(notification.notification_id)"
                title="Delete notification"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { NotificationItem } from '~/stores/notifications'

const notificationStore = useNotificationStore()
const { notifications, unreadCount, isLoading, isPanelOpen } = storeToRefs(notificationStore)

const wrapperRef = ref<HTMLElement | null>(null)

// Sorted notifications
const sortedNotifications = computed(() => notificationStore.sortedNotifications)

// Toggle panel
const togglePanel = () => {
  notificationStore.togglePanel()
  if (notificationStore.isPanelOpen) {
    notificationStore.fetchNotifications()
  }
}

const emit = defineEmits<{
  'open-task': [taskId: number]
}>()

// Handle notification click
const handleNotificationClick = async (notification: NotificationItem) => {
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.notification_id)
  }
  
  // If notification has a task_id, emit event to open task modal
  if (notification.task_id) {
    emit('open-task', notification.task_id)
    notificationStore.closePanel()
  }
}

// Handle mark all as read
const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
}

// Handle clear all notifications
const handleClearAll = async () => {
  await notificationStore.clearAll()
}

// Handle delete notification
const handleDeleteNotification = async (notificationId: number) => {
  await notificationStore.deleteNotification(notificationId)
}

// Get icon class based on notification type
const getIconClass = (type: string) => {
  switch (type) {
    case 'task_due_reminder':
      return 'icon-warning'
    case 'task_overdue':
      return 'icon-error'
    case 'collaborator_added':
      return 'icon-success'
    default:
      return 'icon-info'
  }
}

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Close panel when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    notificationStore.closePanel()
  }
}

// Fetch unread count on mount
onMounted(() => {
  notificationStore.fetchUnreadCount()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Poll for unread count every 60 seconds
let pollInterval: NodeJS.Timeout | null = null

onMounted(() => {
  pollInterval = setInterval(() => {
    notificationStore.fetchUnreadCount()
  }, 60000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.notification-icon {
  transition: transform 0.2s ease;
}

.notification-btn:hover .notification-icon {
  transform: rotate(15deg);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
}

/* Flyout Panel */
.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 480px;
  background: linear-gradient(180deg, #1a1f2e 0%, #151922 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  z-index: 1000;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.panel-title svg {
  color: #3b82f6;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-action-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.panel-action-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Loading State */
.panel-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.panel-empty p {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  margin: 0 0 4px;
}

.panel-empty span {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

/* Notifications List */
.notifications-list {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px;
}

.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Notification Card */
.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 6px;
}

.notification-card:last-child {
  margin-bottom: 0;
}

.notification-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.notification-card.unread {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.15);
}

.notification-card.unread:hover {
  background: rgba(59, 130, 246, 0.12);
}

/* Notification Card Icon */
.notification-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}

.icon-warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1));
  color: #fbbf24;
}

.icon-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  color: #ef4444;
}

.icon-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
  color: #10b981;
}

.icon-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
  color: #3b82f6;
}

/* Notification Card Content */
.notification-card-content {
  flex: 1;
  min-width: 0;
}

.notification-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-card-message {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-card-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Delete Button */
.notification-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-card:hover .notification-delete-btn {
  opacity: 1;
}

.notification-delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Animations */
.flyout-enter-active,
.flyout-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.notification-item-enter-active,
.notification-item-leave-active {
  transition: all 0.3s ease;
}

.notification-item-enter-from,
.notification-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-item-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 480px) {
  .notification-panel {
    width: calc(100vw - 32px);
    right: -8px;
  }
}
</style>
