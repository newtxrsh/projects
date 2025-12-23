<template>
  <div class="kanban-skeleton">
    <!-- Column headers -->
    <div class="columns-header">
      <div v-for="i in 3" :key="i" class="column-header-skeleton">
        <BaseSkeleton variant="rounded" width="100px" height="24px" />
        <BaseSkeleton variant="circular" width="24px" height="24px" />
      </div>
    </div>
    
    <!-- Columns -->
    <div class="columns-grid">
      <div v-for="col in 3" :key="col" class="column-skeleton">
        <div v-for="card in cardsPerColumn" :key="card" class="card-skeleton">
          <div class="card-skeleton-header">
            <BaseSkeleton variant="rounded" width="60px" height="20px" />
          </div>
          <BaseSkeleton variant="text" width="90%" />
          <BaseSkeleton variant="text" width="70%" />
          <div class="card-skeleton-footer">
            <div class="avatar-group">
              <BaseSkeleton variant="circular" width="28px" height="28px" />
              <BaseSkeleton variant="circular" width="28px" height="28px" />
            </div>
            <BaseSkeleton variant="text" width="80px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cardsPerColumn?: number
}

withDefaults(defineProps<Props>(), {
  cardsPerColumn: 3,
})
</script>

<style scoped>
.kanban-skeleton {
  padding: 1rem 0;
}

.columns-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.column-header-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.column-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-skeleton {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-skeleton-header {
  margin-bottom: 0.25rem;
}

.card-skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.avatar-group {
  display: flex;
  gap: -8px;
}

.avatar-group > * {
  margin-left: -8px;
}

.avatar-group > *:first-child {
  margin-left: 0;
}
</style>
