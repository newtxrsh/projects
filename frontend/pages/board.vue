<template>
  <!-- Redirect to home/board -->
</template>

<script setup lang="ts">
// /board redirects to /
// The main board is served at the index route
definePageMeta({
  middleware: () => {
    return navigateTo('/', { replace: true })
  },
})
</script>
