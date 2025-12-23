<template>
  <div class="lazy-image-wrapper" :class="wrapperClass">
    <!-- Placeholder/Skeleton -->
    <div 
      v-if="!loaded && !error" 
      class="lazy-image-placeholder"
      :class="placeholderClass"
      :style="aspectRatioStyle"
      aria-hidden="true"
    >
      <div class="lazy-image-shimmer"></div>
    </div>
    
    <!-- Error State -->
    <div 
      v-if="error" 
      class="lazy-image-error"
      :class="placeholderClass"
      :style="aspectRatioStyle"
    >
      <svg class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span v-if="errorText" class="text-xs text-white/40 mt-1">{{ errorText }}</span>
    </div>
    
    <!-- Actual Image -->
    <img
      v-show="loaded && !error"
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :class="['lazy-image', imageClass, { 'lazy-image-loaded': loaded }]"
      :width="width"
      :height="height"
      :loading="lazy ? 'lazy' : 'eager'"
      :decoding="decoding"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  aspectRatio?: string // e.g., "16/9", "1/1", "4/3"
  lazy?: boolean
  decoding?: 'async' | 'sync' | 'auto'
  fallbackSrc?: string
  errorText?: string
  wrapperClass?: string
  imageClass?: string
  placeholderClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true,
  decoding: 'async',
  errorText: 'Image failed to load',
})

const emit = defineEmits<{
  'load': [event: Event]
  'error': [event: Event]
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const loaded = ref(false)
const error = ref(false)
const currentSrc = ref(props.src)

const aspectRatioStyle = computed(() => {
  if (props.aspectRatio) {
    return { aspectRatio: props.aspectRatio }
  }
  if (props.width && props.height) {
    return { aspectRatio: `${props.width}/${props.height}` }
  }
  return {}
})

const onLoad = (event: Event) => {
  loaded.value = true
  error.value = false
  emit('load', event)
}

const onError = (event: Event) => {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc
  } else {
    error.value = true
    loaded.value = false
  }
  emit('error', event)
}

// Reset state when src changes
watch(() => props.src, (newSrc) => {
  loaded.value = false
  error.value = false
  currentSrc.value = newSrc
})
</script>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
}

.lazy-image-placeholder,
.lazy-image-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: inherit;
}

.lazy-image-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
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

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image-loaded {
  opacity: 1;
}
</style>
