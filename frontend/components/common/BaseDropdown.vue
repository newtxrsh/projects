<template>
  <div class="dropdown" ref="dropdownRef">
    <div @click="toggle" class="dropdown-trigger">
      <slot name="trigger">
        <BaseButton :variant="triggerVariant" :size="triggerSize">
          {{ triggerText }}
          <svg 
            class="dropdown-arrow" 
            :class="{ 'rotate-180': isOpen }"
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </BaseButton>
      </slot>
    </div>
    
    <Transition name="dropdown">
      <div 
        v-if="isOpen" 
        class="dropdown-menu"
        :class="[`dropdown-${position}`, `dropdown-${align}`]"
      >
        <slot :close="close">
          <div 
            v-for="(item, index) in items" 
            :key="index"
            class="dropdown-item"
            :class="{ 'dropdown-item-active': item.active, 'dropdown-item-disabled': item.disabled }"
            @click="handleItemClick(item)"
          >
            <component v-if="item.icon" :is="item.icon" class="dropdown-item-icon" />
            <span>{{ item.label }}</span>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
export interface DropdownItem {
  label: string
  value?: any
  icon?: any
  active?: boolean
  disabled?: boolean
  action?: () => void
}

interface Props {
  items?: DropdownItem[]
  triggerText?: string
  triggerVariant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  triggerSize?: 'sm' | 'md' | 'lg'
  position?: 'bottom' | 'top'
  align?: 'left' | 'right' | 'center'
  closeOnSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  triggerText: 'Select',
  triggerVariant: 'secondary',
  triggerSize: 'md',
  position: 'bottom',
  align: 'left',
  closeOnSelect: true,
})

const emit = defineEmits<{
  select: [item: DropdownItem]
  open: []
  close: []
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
  } else {
    emit('close')
  }
}

const open = () => {
  isOpen.value = true
  emit('open')
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const handleItemClick = (item: DropdownItem) => {
  if (item.disabled) return
  
  if (item.action) {
    item.action()
  }
  
  emit('select', item)
  
  if (props.closeOnSelect) {
    close()
  }
}

// Close on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

// Close on escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

defineExpose({ open, close, toggle, isOpen })
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  margin-left: 0.25rem;
}

.dropdown-menu {
  position: absolute;
  z-index: 50;
  min-width: 180px;
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-bottom {
  top: 100%;
}

.dropdown-top {
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.dropdown-left {
  left: 0;
}

.dropdown-right {
  right: 0;
}

.dropdown-center {
  left: 50%;
  transform: translateX(-50%);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item-active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.dropdown-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item-disabled:hover {
  background: transparent;
}

.dropdown-item-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.7;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
