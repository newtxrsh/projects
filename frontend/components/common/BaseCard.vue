<template>
  <div :class="cardClasses">
    <!-- Header -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-white">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-white/60 mt-1">{{ subtitle }}</p>
      </slot>
    </div>
    
    <!-- Body -->
    <div class="card-body">
      <slot />
    </div>
    
    <!-- Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  clickable: false,
})

const baseClasses = 'rounded-2xl transition-all duration-200'

const variantClasses = {
  default: 'bg-white/5 border border-white/10',
  elevated: 'bg-white/5 shadow-xl shadow-black/20',
  bordered: 'bg-transparent border-2 border-white/20',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10',
}

const paddingClasses = {
  none: '',
  sm: '[&>.card-header]:p-4 [&>.card-body]:p-4 [&>.card-footer]:p-4',
  md: '[&>.card-header]:p-6 [&>.card-body]:p-6 [&>.card-footer]:p-6',
  lg: '[&>.card-header]:p-8 [&>.card-body]:p-8 [&>.card-footer]:p-8',
}

const cardClasses = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  paddingClasses[props.padding],
  props.hoverable ? 'hover:bg-white/10 hover:border-white/20' : '',
  props.clickable ? 'cursor-pointer' : '',
])
</script>

<style scoped>
.card-header + .card-body {
  padding-top: 0;
}

.card-body + .card-footer {
  padding-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
