<template>
  <div class="kanban-column">
    <div class="column-header flex items-center gap-3 mb-4">
      <div 
        class="w-3 h-3 rounded-full"
        :class="{
          'bg-blue-500': color === 'blue',
          'bg-yellow-500': color === 'yellow',
          'bg-green-500': color === 'green',
        }"
      ></div>
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
      <span class="text-sm font-bold text-white/50">({{ tasks.length }})</span>
    </div>

    <div class="tasks-container space-y-3">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col gap-3">
        <div v-for="i in 2" :key="i" class="task-skeleton bg-white/5 rounded-xl p-4 animate-pulse">
          <div class="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State - Hidden, centralized empty state is shown in parent -->
      <div v-else-if="tasks.length === 0" class="hidden">
      </div>

      <!-- Task Cards -->
      <TaskCard 
        v-else
        v-for="task in tasks" 
        :key="task.task_id || task.id"
        :task="task"
        @click="$emit('task-click', task)"
        @status-change="(newStatus: string) => $emit('status-change', task.task_id || task.id, newStatus)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  status: string
  color: 'blue' | 'yellow' | 'green'
  tasks: any[]
  loading?: boolean
}

defineProps<Props>()

defineEmits<{
  'task-click': [task: any]
  'status-change': [taskId: number, newStatus: string]
}>()
</script>

<style scoped>
.column-header {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
