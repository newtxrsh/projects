<template>
  <div class="empty-state">
    <!-- Icon -->
    <div class="empty-icon">
      <slot name="icon">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>
    
    <!-- Title -->
    <h3 class="empty-title">{{ title }}</h3>
    
    <!-- Description -->
    <p v-if="description" class="empty-description">{{ description }}</p>
    
    <!-- Action -->
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No data found',
  description: '',
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9375rem;
  max-width: 320px;
  margin: 0 auto;
  line-height: 1.5;
}

.empty-action {
  margin-top: 1.5rem;
}
</style>
