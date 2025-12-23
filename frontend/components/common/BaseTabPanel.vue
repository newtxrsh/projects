<template>
  <div 
    v-show="isActive" 
    class="tab-panel"
    role="tabpanel"
    :id="`tabpanel-${value}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string
}

const props = defineProps<Props>()

const activeTab = inject<ComputedRef<string>>('activeTab')

const isActive = computed(() => activeTab?.value === props.value)
</script>

<style scoped>
.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
