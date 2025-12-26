<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Mobile menu toggle -->
      <button 
        class="mobile-menu-btn"
        @click="uiStore.toggleMobileSidebar()"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      
      <!-- Breadcrumb / Page title -->
      <div class="page-info">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
    </div>
    
    <div class="header-right">
      <!-- Search -->
      <div class="header-search" v-if="showSearch">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
            @input="$emit('search', searchQuery)"
          >
          <kbd class="search-shortcut">⌘K</kbd>
        </div>
      </div>
      
      <!-- Notifications -->
      <NotificationPanel v-if="showNotifications" />
      
      <!-- User Menu -->
      <BaseDropdown 
        :items="userMenuItems" 
        position="bottom" 
        align="right"
        @select="handleUserMenuSelect"
      >
        <template #trigger>
          <button class="user-menu-btn">
            <BaseAvatar 
              :name="authStore.userFullName" 
              :src="authStore.currentUser?.profile_picture ?? undefined"
              size="sm"
            />
            <span class="user-name">{{ authStore.userName }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </template>
      </BaseDropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DropdownItem } from '~/components/common/BaseDropdown.vue'

interface Props {
  pageTitle?: string
  pageSubtitle?: string
  showSearch?: boolean
  searchPlaceholder?: string
  showNotifications?: boolean
}

withDefaults(defineProps<Props>(), {
  pageTitle: '',
  pageSubtitle: '',
  showSearch: true,
  searchPlaceholder: 'Search...',
  showNotifications: true,
})

const emit = defineEmits<{
  search: [query: string]
}>()

const authStore = useAuthStore()
const uiStore = useUIStore()

const searchQuery = ref('')

const userMenuItems: DropdownItem[] = [
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Help', value: 'help' },
  { label: 'Logout', value: 'logout' },
]

const handleUserMenuSelect = async (item: DropdownItem) => {
  switch (item.value) {
    case 'profile':
      navigateTo('/profile')
      break
    case 'settings':
      navigateTo('/settings')
      break
    case 'help':
      // Open help modal or navigate
      break
    case 'logout':
      await authStore.logout()
      break
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-btn {
  display: none;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
}

.page-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.page-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Search */
.header-search {
  display: none;
}

@media (min-width: 768px) {
  .header-search {
    display: block;
  }
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.search-input {
  width: 240px;
  padding: 0.5rem 3rem 0.5rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-shortcut {
  position: absolute;
  right: 0.5rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: inherit;
}

/* Icon buttons */
.header-icon-btn {
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

.header-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* User Menu */
.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  display: none;
}

@media (min-width: 640px) {
  .user-name {
    display: block;
  }
}
</style>
