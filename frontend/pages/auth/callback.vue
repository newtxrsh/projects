<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
        <svg class="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
      <p class="text-white/60 text-sm">Please wait while we complete your authentication.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const { fetchCurrentUser } = useApi()

onMounted(async () => {
  const token = route.query.token as string
  const error = route.query.error as string

  if (error) {
    // Handle error from Google OAuth
    navigateTo({
      path: '/auth/login',
      query: { error: 'Google authentication failed. Please try again.' }
    })
    return
  }

  if (token) {
    try {
      // Store the token
      authStore.setToken(token)
      
      // Fetch user data
      const user = await fetchCurrentUser()
      
      if (user) {
        authStore.setUser(user)
        // Redirect to home/board
        navigateTo('/')
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (err) {
      console.error('OAuth callback error:', err)
      authStore.logout()
      navigateTo({
        path: '/auth/login',
        query: { error: 'Authentication failed. Please try again.' }
      })
    }
  } else {
    // No token provided
    navigateTo('/auth/login')
  }
})
</script>
