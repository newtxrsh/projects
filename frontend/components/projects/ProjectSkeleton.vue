<template>
  <div class="project-card-skeleton">
    <div class="card-header">
      <BaseSkeleton variant="rounded" width="60px" height="20px" />
      <BaseSkeleton variant="circular" width="32px" height="32px" />
    </div>
    
    <BaseSkeleton variant="text" width="80%" height="20px" />
    <BaseSkeleton variant="text" width="100%" />
    <BaseSkeleton variant="text" width="60%" />
    
    <div class="card-progress">
      <BaseSkeleton variant="rounded" width="100%" height="6px" />
    </div>
    
    <div class="card-footer">
      <div class="collaborators">
        <BaseSkeleton variant="circular" width="24px" height="24px" />
        <BaseSkeleton variant="circular" width="24px" height="24px" />
        <BaseSkeleton variant="circular" width="24px" height="24px" />
      </div>
      <BaseSkeleton variant="text" width="60px" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.project-card-skeleton {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-progress {
  margin: 0.5rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.collaborators {
  display: flex;
  gap: -6px;
}

.collaborators > * {
  margin-left: -6px;
  border: 2px solid #0a0e1a;
  border-radius: 50%;
}

.collaborators > *:first-child {
  margin-left: 0;
}
</style>
