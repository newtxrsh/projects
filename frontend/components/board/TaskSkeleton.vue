<template>
  <div class="task-skeleton">
    <div class="task-skeleton-header">
      <BaseSkeleton variant="rounded" width="60px" height="24px" />
    </div>
    <BaseSkeleton variant="text" width="80%" />
    <BaseSkeleton variant="text" width="60%" />
    <div class="task-skeleton-footer">
      <BaseSkeleton variant="circular" width="28px" height="28px" />
      <BaseSkeleton variant="text" width="100px" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.task-skeleton {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-skeleton-header {
  margin-bottom: 0.25rem;
}

.task-skeleton-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
