<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 font-sans antialiased">
    <!-- Decorative background elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout - no sidebar, centered content
</script>
