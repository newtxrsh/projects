<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div 
        v-if="uiStore.confirmDialog.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleCancel"
        />
        
        <!-- Dialog -->
        <Transition name="confirm-scale">
          <div 
            v-if="uiStore.confirmDialog.isOpen"
            class="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div class="p-6">
              <!-- Icon -->
              <div 
                class="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                :class="iconBgClass"
              >
                <!-- Danger icon -->
                <svg v-if="uiStore.confirmDialog.variant === 'danger'" class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <!-- Warning icon -->
                <svg v-else-if="uiStore.confirmDialog.variant === 'warning'" class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <!-- Info icon -->
                <svg v-else class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Content -->
              <div class="text-center">
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ uiStore.confirmDialog.title }}
                </h3>
                <p class="text-white/60 text-sm leading-relaxed">
                  {{ uiStore.confirmDialog.message }}
                </p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 p-6 pt-0">
              <button
                @click="handleCancel"
                class="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                {{ uiStore.confirmDialog.cancelText }}
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors"
                :class="confirmButtonClass"
              >
                {{ uiStore.confirmDialog.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const uiStore = useUIStore()

const iconBgClass = computed(() => {
  switch (uiStore.confirmDialog.variant) {
    case 'danger':
      return 'bg-red-500/20'
    case 'warning':
      return 'bg-yellow-500/20'
    default:
      return 'bg-blue-500/20'
  }
})

const iconColorClass = computed(() => {
  switch (uiStore.confirmDialog.variant) {
    case 'danger':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    default:
      return 'text-blue-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (uiStore.confirmDialog.variant) {
    case 'danger':
      return 'bg-red-500 hover:bg-red-600 text-white'
    case 'warning':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white'
    default:
      return 'bg-blue-500 hover:bg-blue-600 text-white'
  }
})

const handleConfirm = () => {
  uiStore.confirmDialog.onConfirm?.()
}

const handleCancel = () => {
  uiStore.confirmDialog.onCancel?.()
}
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active,
.confirm-scale-leave-active {
  transition: all 0.2s ease;
}

.confirm-scale-enter-from,
.confirm-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
