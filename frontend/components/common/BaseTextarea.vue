<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-sm font-medium text-white/90">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="textareaClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    
    <!-- Character count -->
    <div v-if="maxLength" class="flex justify-end">
      <span 
        class="text-xs"
        :class="isOverLimit ? 'text-red-400' : 'text-white/40'"
      >
        {{ characterCount }}/{{ maxLength }}
      </span>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  id?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
  error?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
  resize: 'vertical',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const characterCount = computed(() => props.modelValue?.length || 0)
const isOverLimit = computed(() => props.maxLength && characterCount.value > props.maxLength)

const textareaClasses = computed(() => [
  'w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-red-500/50 focus:ring-red-500/50' : '',
  `resize-${props.resize}`,
])
</script>

<style scoped>
.resize-none {
  resize: none;
}
.resize-vertical {
  resize: vertical;
}
.resize-horizontal {
  resize: horizontal;
}
.resize-both {
  resize: both;
}
</style>
