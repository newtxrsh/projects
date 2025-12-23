<template>
  <div 
    class="tooltip-wrapper"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <slot />
    
    <Transition name="tooltip">
      <div 
        v-if="visible && content"
        class="tooltip"
        :class="[`tooltip-${position}`, { 'tooltip-dark': dark }]"
        role="tooltip"
      >
        <div class="tooltip-content">
          {{ content }}
        </div>
        <div class="tooltip-arrow" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  dark?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  position: 'top',
  delay: 200,
  dark: true,
  disabled: false,
})

const visible = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

const showTooltip = () => {
  if (props.disabled) return
  
  timeout = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  visible.value = false
}

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip {
  position: absolute;
  z-index: 100;
  pointer-events: none;
  white-space: nowrap;
}

.tooltip-content {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1f2e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip-dark .tooltip-content {
  background: #1a1f2e;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}

/* Position: Top */
.tooltip-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.tooltip-top .tooltip-arrow {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  background: rgba(255, 255, 255, 0.95);
}

.tooltip-top.tooltip-dark .tooltip-arrow {
  background: #1a1f2e;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Position: Bottom */
.tooltip-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.tooltip-bottom .tooltip-arrow {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  background: rgba(255, 255, 255, 0.95);
}

.tooltip-bottom.tooltip-dark .tooltip-arrow {
  background: #1a1f2e;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Position: Left */
.tooltip-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.tooltip-left .tooltip-arrow {
  right: -4px;
  top: 50%;
  margin-top: -4px;
  background: rgba(255, 255, 255, 0.95);
}

.tooltip-left.tooltip-dark .tooltip-arrow {
  background: #1a1f2e;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Position: Right */
.tooltip-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

.tooltip-right .tooltip-arrow {
  left: -4px;
  top: 50%;
  margin-top: -4px;
  background: rgba(255, 255, 255, 0.95);
}

.tooltip-right.tooltip-dark .tooltip-arrow {
  background: #1a1f2e;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.95);
}

.tooltip-left.tooltip-enter-from,
.tooltip-left.tooltip-leave-to,
.tooltip-right.tooltip-enter-from,
.tooltip-right.tooltip-leave-to {
  transform: translateY(-50%) scale(0.95);
}
</style>
