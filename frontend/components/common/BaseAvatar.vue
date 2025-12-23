<template>
  <div class="avatar" :class="sizeClass">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar-image"
      @error="handleError"
    />
    <div v-else class="avatar-fallback" :style="{ background: avatarColor }">
      {{ initials }}
    </div>
    
    <!-- Status indicator -->
    <span v-if="status" :class="['avatar-status', statusClass]"></span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Avatar',
  size: 'md',
})

const showFallback = ref(false)

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.substring(0, 2).toUpperCase()
})

const avatarColor = computed(() => {
  if (!props.name) return '#3b82f6'
  // Generate consistent color from name
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  return colors[Math.abs(hash) % colors.length]
})

const sizeClass = computed(() => ({
  'avatar-xs': props.size === 'xs',
  'avatar-sm': props.size === 'sm',
  'avatar-md': props.size === 'md',
  'avatar-lg': props.size === 'lg',
  'avatar-xl': props.size === 'xl',
}))

const statusClass = computed(() => ({
  'status-online': props.status === 'online',
  'status-offline': props.status === 'offline',
  'status-away': props.status === 'away',
  'status-busy': props.status === 'busy',
}))

const handleError = () => {
  showFallback.value = true
}
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.avatar-xs { width: 24px; height: 24px; font-size: 10px; }
.avatar-sm { width: 32px; height: 32px; font-size: 12px; }
.avatar-md { width: 40px; height: 40px; font-size: 14px; }
.avatar-lg { width: 48px; height: 48px; font-size: 16px; }
.avatar-xl { width: 64px; height: 64px; font-size: 20px; }

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid #0a0e1a;
}

.status-online { background: #10b981; }
.status-offline { background: #6b7280; }
.status-away { background: #f59e0b; }
.status-busy { background: #ef4444; }
</style>
