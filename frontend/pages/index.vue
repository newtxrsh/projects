<template>
  <div>
    <!-- Board Header -->
    <div class="board-header mb-8">
      <h1 class="text-3xl font-bold text-white mb-6">Board</h1>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Search Bar -->
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              class="w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-black/10 hover:shadow-black/20"
              placeholder="Search tasks..."
            >
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          
          <!-- Quick Filters Dropdown -->
          <div class="relative">
            <button 
              @click="showFiltersDropdown = !showFiltersDropdown"
              class="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:translate-y-0.3"
            >
              <span>{{ currentCategoryLabel }}</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showFiltersDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            
            <Transition name="dropdown">
              <div 
                v-if="showFiltersDropdown" 
                class="absolute top-full left-0 mt-2 w-48 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
              >
                <button 
                  v-for="filter in filters" 
                  :key="filter.value"
                  @click="selectCategory(filter.value)"
                  class="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors"
                  :class="{ 'bg-blue-500/20 text-blue-400': currentCategory === filter.value }"
                >
                  {{ filter.label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Notification Button -->
        <NotificationPanel @open-task="handleOpenTaskFromNotification" />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <KanbanSkeleton v-if="loading" :cards-per-column="3" />

    <!-- Centralized Empty State -->
    <div v-else-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 mb-4 text-white/20">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke-width="1.5"/>
          <line x1="8" y1="7" x2="16" y2="7" stroke-width="1.5"/>
          <line x1="8" y1="11" x2="16" y2="11" stroke-width="1.5"/>
          <line x1="8" y1="15" x2="12" y2="15" stroke-width="1.5"/>
        </svg>
      </div>
      <p class="text-white/40 text-base mb-4">No task created.</p>
      <NuxtLink 
        to="/create"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-3xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Create Task</span>
      </NuxtLink>
    </div>

    <!-- Kanban Board -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <!-- To Do Column -->
      <KanbanColumn 
        title="To Do" 
        status="pending" 
        color="blue"
        :tasks="pendingTasks"
        :loading="loading"
        @task-click="openTaskModal"
        @status-change="handleStatusChange"
      />

      <!-- Ongoing Column -->
      <KanbanColumn 
        title="Ongoing" 
        status="ongoing" 
        color="yellow"
        :tasks="ongoingTasks"
        :loading="loading"
        @task-click="openTaskModal"
        @status-change="handleStatusChange"
      />

      <!-- Completed Column -->
      <KanbanColumn 
        title="Completed" 
        status="completed" 
        color="green"
        :tasks="completedTasks"
        :loading="loading"
        @task-click="openTaskModal"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- Task Details Modal -->
    <Transition name="modal">
      <TaskModal 
        v-if="selectedTask"
        :task="selectedTask"
        @close="selectedTask = null"
        @update="handleTaskUpdate"
        @delete="handleTaskDelete"
        @subtask-updated="handleSubtaskUpdated"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
  title: 'Board',
  meta: [
    { name: 'description', content: 'View and manage your tasks in a Kanban board layout. Organize tasks by status: pending, ongoing, and completed.' },
    { property: 'og:title', content: 'Task Board | Task Manager' },
    { property: 'og:description', content: 'View and manage your tasks in a Kanban board layout.' },
  ],
})

const { fetchTasks, updateTask, deleteTask } = useApi()
const toast = useToast()

// State
const loading = ref(true)
const allTasks = ref<any[]>([])
const searchQuery = ref('')
const currentCategory = ref('all')
const showFiltersDropdown = ref(false)
const selectedTask = ref<any>(null)

// Filter options
const filters = [
  { label: 'All Categories', value: 'all' },
  { label: 'Personal', value: 'PERSONAL' },
  { label: 'School', value: 'SCHOOL' },
  { label: 'Work', value: 'WORK' },
]

// Computed
const currentCategoryLabel = computed(() => {
  const filter = filters.find(f => f.value === currentCategory.value)
  return filter?.label || 'Quick Filters'
})

const filteredTasks = computed(() => {
  let tasks = [...allTasks.value]
  
  // Filter out tasks with multiple collaborators (for personal board view - show solo tasks and tasks where user is the only collaborator)
  tasks = tasks.filter(task => {
    const collaborators = task.task_collaborators || task.collaborators || []
    return collaborators.length <= 1
  })

  // Apply search filter
  if (searchQuery.value.trim()) {
    const search = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title?.toLowerCase().includes(search)
    )
  }

  // Apply category filter
  if (currentCategory.value !== 'all') {
    tasks = tasks.filter(task => 
      task.category?.toUpperCase() === currentCategory.value.toUpperCase()
    )
  }

  return tasks
})

const pendingTasks = computed(() => 
  filteredTasks.value.filter(t => t.status?.toLowerCase() === 'pending')
)

const ongoingTasks = computed(() => 
  filteredTasks.value.filter(t => t.status?.toLowerCase() === 'ongoing')
)

const completedTasks = computed(() => 
  filteredTasks.value.filter(t => t.status?.toLowerCase() === 'completed')
)

// Methods
const selectCategory = (value: string) => {
  currentCategory.value = value
  showFiltersDropdown.value = false
}

const openTaskModal = (task: any) => {
  selectedTask.value = task
}

const getTaskId = (task: any) => task.task_id || task.id

const handleStatusChange = async (taskId: number, newStatus: string) => {
  try {
    await updateTask(taskId, { status: newStatus })
    // Update local state
    const task = allTasks.value.find(t => getTaskId(t) === taskId)
    if (task) {
      task.status = newStatus
    }
    toast.success('Task status updated')
  } catch (error) {
    console.error('Failed to update task status:', error)
    toast.error('Failed to update task status')
  }
}

const handleTaskUpdate = async (taskId: number, data: any) => {
  try {
    await updateTask(taskId, data)
    // Update local state instead of refetching everything
    const task = allTasks.value.find(t => getTaskId(t) === taskId)
    if (task) {
      Object.assign(task, data)
    }
    // Also update selected task if it's the same
    if (selectedTask.value && getTaskId(selectedTask.value) === taskId) {
      Object.assign(selectedTask.value, data)
    }
    toast.success('Task updated successfully')
  } catch (error) {
    console.error('Failed to update task:', error)
    toast.error('Failed to update task')
  }
}

const handleSubtaskUpdated = async (taskId: number) => {
  // Refresh tasks to get updated subtask status and progress
  await loadTasks()
  // Keep modal open with updated task
  if (selectedTask.value && getTaskId(selectedTask.value) === taskId) {
    const updatedTask = allTasks.value.find(t => getTaskId(t) === taskId)
    if (updatedTask) {
      selectedTask.value = updatedTask
    }
  }
}

const handleTaskDelete = async (taskId: number) => {
  try {
    await deleteTask(taskId)
    allTasks.value = allTasks.value.filter(t => getTaskId(t) !== taskId)
    selectedTask.value = null
    toast.success('Task deleted successfully')
  } catch (error) {
    console.error('Failed to delete task:', error)
    toast.error('Failed to delete task')
  }
}

const handleOpenTaskFromNotification = async (taskId: number) => {
  // Try to find task in current tasks
  let task = allTasks.value.find(t => getTaskId(t) === taskId)
  
  if (task) {
    selectedTask.value = task
  } else {
    // If not found, reload tasks and try again
    await loadTasks()
    task = allTasks.value.find(t => getTaskId(t) === taskId)
    if (task) {
      selectedTask.value = task
    }
  }
}

const loadTasks = async () => {
  loading.value = true
  try {
    const tasks = await fetchTasks()
    allTasks.value = tasks || []
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showFiltersDropdown.value = false
  }
}

onMounted(() => {
  loadTasks()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.relative:hover {
  transform: translateY(1px);
  transition: all 0.2s ease;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}
</style>
