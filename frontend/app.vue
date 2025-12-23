<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
  <!-- Global Toast Notifications -->
  <ToastContainer />
  
  <!-- Global Confirm Dialog -->
  <GlobalConfirmDialog />
</template>

<script setup lang="ts">
import GlobalConfirmDialog from '~/components/common/GlobalConfirmDialog.vue'

// Initialize auth state on app mount
const authStore = useAuthStore()

onMounted(async () => {
  // Try to restore auth state from localStorage
  await authStore.initializeAuth()
})
</script>
