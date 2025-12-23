<template>
  <div class="progress-bar">
    <div class="progress-track">
      <div 
        class="progress-fill"
        :class="colorClass"
        :style="{ width: `${clampedValue}%` }"
      ></div>
    </div>
    <span v-if="showLabel" class="progress-label">{{ clampedValue }}%</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
  max?: number
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  color: 'blue',
  size: 'md',
  showLabel: false,
})

const clampedValue = computed(() => {
  const percentage = (props.value / props.max) * 100
  return Math.min(100, Math.max(0, Math.round(percentage)))
})

const colorClass = computed(() => ({
  'fill-blue': props.color === 'blue',
  'fill-green': props.color === 'green',
  'fill-yellow': props.color === 'yellow',
  'fill-red': props.color === 'red',
  'fill-purple': props.color === 'purple',
  'fill-gradient': props.color === 'gradient',
}))
</script>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.fill-blue { background: #3b82f6; }
.fill-green { background: #10b981; }
.fill-yellow { background: #f59e0b; }
.fill-red { background: #ef4444; }
.fill-purple { background: #8b5cf6; }
.fill-gradient { background: linear-gradient(90deg, #3b82f6, #10b981); }

.progress-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  min-width: 36px;
  text-align: right;
}
</style>
