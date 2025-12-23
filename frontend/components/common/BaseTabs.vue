<template>
  <div class="tabs">
    <!-- Tab Headers -->
    <div class="tabs-header" :class="[`tabs-${variant}`, `tabs-${size}`]" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        class="tab-button"
        :class="{ 
          'tab-active': modelValue === tab.value,
          'tab-disabled': tab.disabled 
        }"
        :disabled="tab.disabled"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :aria-controls="`tabpanel-${tab.value}`"
        @click="selectTab(tab.value)"
      >
        <component v-if="tab.icon" :is="tab.icon" class="tab-icon" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
      
      <!-- Active indicator (for underline variant) -->
      <div 
        v-if="variant === 'underline'" 
        class="tab-indicator"
        :style="indicatorStyle"
      />
    </div>
    
    <!-- Tab Panels -->
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Tab {
  label: string
  value: string
  icon?: any
  badge?: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string
  tabs: Tab[]
  variant?: 'underline' | 'pills' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const tabRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({})

const selectTab = (value: string) => {
  const tab = props.tabs.find(t => t.value === value)
  if (tab?.disabled) return
  
  emit('update:modelValue', value)
  emit('change', value)
}

// Update indicator position for underline variant
const updateIndicator = () => {
  if (props.variant !== 'underline') return
  
  const activeIndex = props.tabs.findIndex(t => t.value === props.modelValue)
  if (activeIndex === -1 || !tabRefs.value[activeIndex]) return
  
  const activeTab = tabRefs.value[activeIndex]
  indicatorStyle.value = {
    width: `${activeTab.offsetWidth}px`,
    transform: `translateX(${activeTab.offsetLeft}px)`,
  }
}

watch(() => props.modelValue, () => {
  nextTick(updateIndicator)
})

onMounted(() => {
  nextTick(updateIndicator)
})

// Provide context for tab panels
provide('activeTab', computed(() => props.modelValue))
</script>

<style scoped>
.tabs {
  width: 100%;
}

.tabs-header {
  display: flex;
  position: relative;
  gap: 0.25rem;
}

/* Underline Variant */
.tabs-underline {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0;
}

.tabs-underline .tab-button {
  padding: 0.75rem 1rem;
  border-radius: 0;
  background: transparent;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tabs-underline .tab-button.tab-active {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: #3b82f6;
  transition: all 0.3s ease;
}

/* Pills Variant */
.tabs-pills {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: 0.75rem;
}

.tabs-pills .tab-button {
  border-radius: 0.5rem;
  background: transparent;
}

.tabs-pills .tab-button.tab-active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* Bordered Variant */
.tabs-bordered .tab-button {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: transparent;
}

.tabs-bordered .tab-button.tab-active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

/* Base Tab Button */
.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover:not(.tab-disabled) {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tab-active {
  color: white;
}

.tab-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-icon {
  width: 1rem;
  height: 1rem;
}

.tab-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-radius: 9999px;
}

/* Sizes */
.tabs-sm .tab-button {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.tabs-lg .tab-button {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
}

/* Content */
.tabs-content {
  margin-top: 1rem;
}
</style>
