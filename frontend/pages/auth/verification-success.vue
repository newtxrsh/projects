<template>
  <div class="w-full max-w-lg relative z-10">
    <!-- Confetti Animation -->
    <div v-if="showConfetti" class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="confetti-container">
        <div 
          v-for="i in 50" 
          :key="i"
          class="confetti"
          :style="{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)]
          }"
        ></div>
      </div>
    </div>

    <!-- Card Container -->
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 text-center">
      
      <!-- Animated Success Icon -->
      <div class="relative mx-auto w-28 h-28 mb-8">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/30"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
        <div class="relative flex items-center justify-center w-full h-full">
          <svg class="w-14 h-14 text-white checkmark-animate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">Account Successfully Created!</h1>
      <p class="text-white/70 text-lg mb-8">Your account has been successfully created.</p>

      <!-- Welcome Card -->
      <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 mb-8">
        <div class="flex items-center justify-center gap-3 mb-3">
          <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <h3 class="text-white font-semibold text-lg">Welcome aboard!</h3>
        </div>
        <p class="text-white/70 text-sm leading-relaxed">
          You're all set! Explore your dashboard, manage your tasks, and make the most of all the features available to you.
        </p>
      </div>

      <!-- Auto-redirect countdown -->
      <div class="mb-6">
        <p class="text-white/50 text-sm mb-4">
          Redirecting in <span class="text-white font-semibold">{{ countdown }}</span> seconds...
        </p>
        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 ease-linear"
            :style="{ width: `${(countdown / initialCountdown) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Action Button -->
      <NuxtLink 
        to="/"
        @click="storeToken"
        class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
      >
        <span>Go to Dashboard</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Account Successfully Created!',
})

const route = useRoute()
const authStore = useAuthStore()

// State
const initialCountdown = 5
const countdown = ref(initialCountdown)
const showConfetti = ref(true)
const confettiColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Get token from query params
const token = computed(() => route.query.token as string | undefined)

// Store the token if available
const storeToken = () => {
  if (token.value) {
    authStore.setToken(token.value)
  }
}

// Countdown and redirect
let countdownInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Store token immediately if available
  if (token.value) {
    authStore.setToken(token.value)
  }

  // Start countdown
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval) clearInterval(countdownInterval)
      navigateTo('/')
    }
  }, 1000)

  // Hide confetti after 4 seconds
  setTimeout(() => {
    showConfetti.value = false
  }, 4000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.confetti-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  animation: confetti-fall 3s linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.checkmark-animate path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: checkmark-draw 0.5s ease-out 0.3s forwards;
}

@keyframes checkmark-draw {
  0% {
    stroke-dashoffset: 24;
  }
  100% {
    stroke-dashoffset: 0;
  }
}
</style>
