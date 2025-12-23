<template>
  <div class="min-h-screen bg-background flex">
    <!-- Sidebar -->
    <TheSidebar />

    <!-- Main Content -->
    <main class="flex-1 p-10 bg-background-secondary overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Default layout with sidebar
</script>
