<template>
  <div class="calendar-skeleton">
    <!-- Calendar header -->
    <div class="calendar-header-skeleton">
      <BaseSkeleton variant="rounded" width="120px" height="32px" />
      <div class="nav-buttons">
        <BaseSkeleton variant="circular" width="36px" height="36px" />
        <BaseSkeleton variant="circular" width="36px" height="36px" />
      </div>
    </div>
    
    <!-- Weekday headers -->
    <div class="weekdays-skeleton">
      <div v-for="i in 7" :key="i" class="weekday-skeleton">
        <BaseSkeleton variant="text" width="40px" />
      </div>
    </div>
    
    <!-- Calendar grid -->
    <div class="calendar-grid-skeleton">
      <div v-for="i in 35" :key="i" class="day-skeleton">
        <BaseSkeleton variant="circular" width="28px" height="28px" />
        <div v-if="Math.random() > 0.6" class="day-tasks">
          <BaseSkeleton variant="rounded" width="100%" height="6px" />
          <BaseSkeleton v-if="Math.random() > 0.5" variant="rounded" width="80%" height="6px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.calendar-skeleton {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
}

.calendar-header-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

.weekdays-skeleton {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.weekday-skeleton {
  display: flex;
  justify-content: center;
}

.calendar-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-skeleton {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
}

.day-tasks {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: auto;
}
</style>
