<template>
  <div :class="['skeleton', variantClass]" :style="skeletonStyle">
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'shimmer' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animation: 'shimmer',
})

const variantClass = computed(() => {
  return {
    text: 'skeleton-text',
    circular: 'skeleton-circular',
    rectangular: 'skeleton-rectangular',
    rounded: 'skeleton-rounded',
  }[props.variant]
})

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})
</script>

<style scoped>
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-text {
  height: 1rem;
  border-radius: 0.25rem;
  width: 100%;
}

.skeleton-circular {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.skeleton-rectangular {
  border-radius: 0;
  width: 100%;
  height: 100px;
}

.skeleton-rounded {
  border-radius: 0.75rem;
  width: 100%;
  height: 100px;
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
