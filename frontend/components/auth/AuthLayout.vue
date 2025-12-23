<template>
  <div class="auth-layout">
    <!-- Background decoration -->
    <div class="auth-bg">
      <div class="bg-gradient bg-gradient-1"></div>
      <div class="bg-gradient bg-gradient-2"></div>
      <div class="bg-gradient bg-gradient-3"></div>
    </div>
    
    <div class="auth-container">
      <slot />
    </div>
    
    <!-- Footer -->
    <footer class="auth-page-footer">
      <p>&copy; {{ new Date().getFullYear() }} Task Manager. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: #0a0e1a;
}

.auth-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.bg-gradient-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  top: -200px;
  right: -200px;
}

.bg-gradient-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  bottom: -100px;
  left: -100px;
}

.bg-gradient-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.2;
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.auth-page-footer {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
}

.auth-page-footer p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}
</style>
