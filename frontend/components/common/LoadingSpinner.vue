<template>
  <div class="loading-spinner" :class="sizeClass">
    <svg class="animate-spin" :class="colorClass" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'blue' | 'gray'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'blue',
})

const sizeClass = computed(() => ({
  'spinner-sm': props.size === 'sm',
  'spinner-md': props.size === 'md',
  'spinner-lg': props.size === 'lg',
}))

const colorClass = computed(() => ({
  'text-white': props.color === 'white',
  'text-blue-500': props.color === 'blue',
  'text-gray-400': props.color === 'gray',
}))
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner-sm svg {
  width: 1.25rem;
  height: 1.25rem;
}

.spinner-md svg {
  width: 2rem;
  height: 2rem;
}

.spinner-lg svg {
  width: 3rem;
  height: 3rem;
}

.loading-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}
</style>
