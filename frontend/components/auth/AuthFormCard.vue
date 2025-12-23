<template>
  <div class="auth-form-card">
    <div class="auth-logo" v-if="showLogo">
      <slot name="logo">
        <div class="default-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
            <path d="M12 20l6 6 10-12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                <stop stop-color="#3B82F6"/>
                <stop offset="1" stop-color="#8B5CF6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </slot>
    </div>
    
    <div class="auth-header">
      <h1 class="auth-title">{{ title }}</h1>
      <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
    </div>
    
    <form @submit.prevent="$emit('submit')" class="auth-form">
      <slot />
      
      <div v-if="error" class="auth-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ error }}</span>
      </div>
      
      <BaseButton 
        type="submit" 
        :loading="loading" 
        :disabled="loading"
        class="auth-submit-btn"
        full-width
      >
        {{ submitText }}
      </BaseButton>
    </form>
    
    <div v-if="$slots.footer" class="auth-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  submitText?: string
  loading?: boolean
  error?: string
  showLogo?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  submitText: 'Submit',
  loading: false,
  error: '',
  showLogo: true,
})

defineEmits<{
  submit: []
}>()
</script>

<style scoped>
.auth-form-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  backdrop-filter: blur(10px);
}

.auth-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.default-logo svg {
  width: 48px;
  height: 48px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
}

.auth-submit-btn {
  margin-top: 0.5rem;
}

.auth-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.auth-footer :deep(a) {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer :deep(a:hover) {
  text-decoration: underline;
}
</style>
