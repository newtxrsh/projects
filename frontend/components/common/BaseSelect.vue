<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-sm font-medium text-white/90">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot />
      </select>
      
      <!-- Dropdown arrow -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  id?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectClasses = computed(() => [
  'w-full px-4 py-3.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-red-500/50 focus:ring-red-500/50' : '',
])
</script>

<style scoped>
select option {
  background: #1a1f2e;
  color: white;
}
</style>
