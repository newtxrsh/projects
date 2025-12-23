<template>
  <BaseModal
    v-model="isOpen"
    :size="size"
    :closable="closable"
    :close-on-backdrop="closeOnBackdrop"
  >
    <div class="confirm-dialog">
      <!-- Icon -->
      <div :class="['confirm-icon', iconClass]">
        <!-- Danger/Delete icon -->
        <svg v-if="type === 'danger'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <!-- Warning icon -->
        <svg v-else-if="type === 'warning'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- Info icon -->
        <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- Content -->
      <div class="confirm-content">
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
      </div>
      
      <!-- Actions -->
      <div class="confirm-actions">
        <BaseButton
          variant="secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          :variant="type === 'danger' ? 'danger' : 'primary'"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  type?: 'danger' | 'warning' | 'info'
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  size?: 'sm' | 'md'
  closable?: boolean
  closeOnBackdrop?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  size: 'sm',
  closable: true,
  closeOnBackdrop: true,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const iconClass = computed(() => ({
  'confirm-icon-danger': props.type === 'danger',
  'confirm-icon-warning': props.type === 'warning',
  'confirm-icon-info': props.type === 'info',
}))

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  isOpen.value = false
  emit('cancel')
}
</script>

<style scoped>
.confirm-dialog {
  text-align: center;
  padding: 1rem;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.confirm-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.confirm-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.confirm-content {
  margin-bottom: 1.5rem;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.confirm-message {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}
</style>
