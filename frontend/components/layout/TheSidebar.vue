<template>
  <aside class="sidebar">
    <!-- Logo Section -->
    <div class="logo-section">
      <div class="logo-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h4l3-9 4 18 3-9h4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="logo-text">Listed</span>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Navigation -->
    <nav class="nav-section">
      <NuxtLink to="/" class="nav-item" :class="{ active: route.path === '/' || route.path === '/board' }">
        <div class="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
        </div>
        <span class="nav-text">Board</span>
      </NuxtLink>

      <NuxtLink to="/create" class="nav-item" :class="{ active: route.path === '/create' }">
        <div class="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span class="nav-text">Create</span>
      </NuxtLink>

      <NuxtLink to="/projects" class="nav-item" :class="{ active: route.path === '/projects' }">
        <div class="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6h16M4 12h16M4 18h10"/>
            <rect x="2" y="4" width="4" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.5"/>
            <rect x="2" y="10" width="4" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.5"/>
            <rect x="2" y="16" width="4" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.5"/>
          </svg>
        </div>
        <span class="nav-text">Project</span>
      </NuxtLink>

      <NuxtLink to="/calendar" class="nav-item" :class="{ active: route.path === '/calendar' }">
        <div class="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/>
          </svg>
        </div>
        <span class="nav-text">Calendar</span>
      </NuxtLink>
    </nav>

    <!-- Spacer -->
    <div class="flex-grow"></div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- User Section at Bottom -->
    <div class="user-section">
      <div class="user-info">
        <div class="user-avatar">
          <img 
            v-if="authStore.user?.profile_picture" 
            :src="authStore.user.profile_picture" 
            :alt="authStore.userName"
            class="avatar-image"
          />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.userName }}</div>
          <div class="user-email">{{ authStore.user?.email || 'user@gmail.com' }}</div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: linear-gradient(180deg, #0f1320 0%, #0a0e1a 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 4px 0 14px rgba(0, 0, 0, 0.3);
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 8px;
}

.logo-icon {
  color: white;
}

.logo-text {
  font-size: 26px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Divider */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
}

/* Navigation */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 26px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(10px);
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-icon svg {
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon svg {
  transform: scale(1.05);
}

.nav-text {
  font-size: 15px;
  font-weight: 600;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Spacer */
.flex-grow {
  flex-grow: 1;
}

/* User Section */
.user-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar svg {
  color: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.user-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Logout Button */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: 2px solid #ef4444;
  border-radius: 12px;
  color: #ef4444;
  font-size: 15px;
  font-weight: 600;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #f87171;
  color: #f87171;
  transform: translateY(-3px);
}

.logout-btn:active {
  transform: translateY(0);
}
</style>
