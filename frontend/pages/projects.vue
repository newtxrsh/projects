<template>
  <div>
    <!-- Projects Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-6">Projects</h1>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Search Bar -->
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              class="w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-black/10 hover:shadow-black/10"
              placeholder="Search projects..."
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
    <template v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div v-for="col in 3" :key="col" class="flex flex-col">
          <div class="flex items-center gap-3 mb-5">
            <BaseSkeleton variant="circular" width="12px" height="12px" />
            <BaseSkeleton variant="text" width="100px" height="20px" />
            <BaseSkeleton variant="text" width="30px" />
          </div>
          <div class="space-y-4">
            <ProjectSkeleton v-for="i in 2" :key="i" />
          </div>
        </div>
      </div>
      
      <!-- Activity Log Skeleton -->
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <BaseSkeleton variant="text" width="140px" height="24px" class="mb-2" />
            <BaseSkeleton variant="text" width="280px" height="16px" />
          </div>
          <BaseSkeleton variant="rounded" width="140px" height="36px" />
        </div>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="p-4 bg-white/5 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <BaseSkeleton variant="text" width="120px" height="18px" />
                <BaseSkeleton variant="rounded" width="60px" height="18px" />
              </div>
              <BaseSkeleton variant="text" width="80px" />
            </div>
            <BaseSkeleton variant="text" width="80%" />
          </div>
        </div>
      </div>
    </template>

    <!-- Centralized Empty State -->
    <div v-else-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center py-20 mb-10">
      <div class="w-16 h-16 mb-4 text-white/20">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke-width="1.5"/>
        </svg>
      </div>
      <p class="text-white/40 text-base mb-4">No project created.</p>
      <NuxtLink 
        to="/create"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-3xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Create Project</span>
      </NuxtLink>
    </div>

    <!-- Projects Board -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-10">
      <!-- Pending Column -->
      <div class="kanban-column">
        <div class="column-header flex items-center gap-3 mb-4">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <h2 class="text-lg font-semibold text-white">Pending</h2>
          <span class="text-sm font-bold text-white/50">({{ pendingProjects.length }})</span>
        </div>
        <div class="tasks-container space-y-3">
          <ProjectCard 
            v-for="project in pendingProjects" 
            :key="getProjectId(project)"
            :project="project"
            @click="openProjectModal(project)"
          />
        </div>
      </div>

      <!-- Ongoing Column -->
      <div class="kanban-column">
        <div class="column-header flex items-center gap-3 mb-4">
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <h2 class="text-lg font-semibold text-white">Ongoing</h2>
          <span class="text-sm font-bold text-white/50">({{ ongoingProjects.length }})</span>
        </div>
        <div class="tasks-container space-y-3">
          <ProjectCard 
            v-for="project in ongoingProjects" 
            :key="getProjectId(project)"
            :project="project"
            @click="openProjectModal(project)"
          />
        </div>
      </div>

      <!-- Completed Column -->
      <div class="kanban-column">
        <div class="column-header flex items-center gap-3 mb-4">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <h2 class="text-lg font-semibold text-white">Completed</h2>
          <span class="text-sm font-bold text-white/50">({{ completedProjects.length }})</span>
        </div>
        <div class="tasks-container space-y-3">
          <ProjectCard 
            v-for="project in completedProjects" 
            :key="getProjectId(project)"
            :project="project"
            @click="openProjectModal(project)"
          />
        </div>
      </div>
    </div>

    <!-- Activity Log Section -->
    <div style="background: rgba(255, 255, 255, 0.02)" class="rounded-3xl p-6 shadow-lg shadow-black/20">

      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-white mb-1">Activity Log</h2>
          <p class="text-sm text-white/50">Showing the latest updates for all projects.</p>
        </div>
        <button 
          @click="clearLogs"
          class="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors text-sm font-medium hover hover:translate-y-0.5 duration-300 hover:shadow-lg hover:shadow-black/10"
        >
          Clear Activity Log
        </button>
      </div>
      
      <div v-if="activityLogs.length === 0" class="text-center py-10 text-white/40">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2" ry="2" stroke-width="1.5"/>
          <line x1="8" y1="7" x2="16" y2="7" stroke-width="1.5"/>
          <line x1="8" y1="11" x2="16" y2="11" stroke-width="1.5"/>
          <line x1="8" y1="15" x2="12" y2="15" stroke-width="1.5"/>
        </svg>
        <p class="text-sm">No activity recorded yet.</p>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="log in activityLogs" 
          :key="log.id"
          class="p-4 bg-[#0f1320] rounded-lg cursor-pointer transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-medium text-white">{{ log.task?.title || 'Task Update' }}</span>
              <span 
                class="px-2 py-0.5 rounded-2xl text-xs font-medium"
                :class="getCategoryClass(log.task?.category)"
              >
                {{ formatCategory(log.task?.category) }}
              </span>
            </div>
            <span class="text-xs text-white/40">{{ formatLogDate(log.created_at) }}</span>
          </div>
          <p class="text-sm text-white/60">{{ log.description || 'Activity update' }}</p>
        </div>
      </div>
    </div>

    <!-- Project Details Modal -->
    <Transition name="modal">
      <TaskModal 
        v-if="selectedProject"
        :task="selectedProject"
        @close="selectedProject = null"
        @update="handleProjectUpdate"
        @delete="handleProjectDelete"
        @subtask-updated="handleSubtaskUpdated"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '../components/projects/ProjectCard.vue'
import TaskModal from '~/components/board/TaskModal.vue'
import ProjectSkeleton from '~/components/projects/ProjectSkeleton.vue'

// SEO Meta
useHead({
  title: 'Projects',
  meta: [
    { name: 'description', content: 'Manage collaborative projects with your team. Track progress and view activity logs.' },
    { property: 'og:title', content: 'Projects | Task Manager' },
    { property: 'og:description', content: 'Manage collaborative projects and track team progress.' },
  ],
})

const { fetchProjects, fetchActivityLogs, clearActivityLogs, updateTask, deleteTask } = useApi()
const { confirmDanger } = useConfirm()
const toast = useToast()

// State
const loading = ref(true)
const allProjects = ref<any[]>([])
const activityLogs = ref<any[]>([])
const searchQuery = ref('')
const currentCategory = ref('all')
const showFiltersDropdown = ref(false)
const selectedProject = ref<any>(null)

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

const filteredProjects = computed(() => {
  let projects = [...allProjects.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const search = searchQuery.value.toLowerCase()
    projects = projects.filter(project => 
      project.title?.toLowerCase().includes(search)
    )
  }

  // Apply category filter
  if (currentCategory.value !== 'all') {
    projects = projects.filter(project => 
      project.category?.toUpperCase() === currentCategory.value.toUpperCase()
    )
  }

  return projects
})

const pendingProjects = computed(() => 
  filteredProjects.value.filter(p => p.status?.toLowerCase() === 'pending')
)

const ongoingProjects = computed(() => 
  filteredProjects.value.filter(p => p.status?.toLowerCase() === 'ongoing')
)

const completedProjects = computed(() => 
  filteredProjects.value.filter(p => p.status?.toLowerCase() === 'completed')
)

// Methods
const getProjectId = (project: any) => project.task_id || project.id

const selectCategory = (value: string) => {
  currentCategory.value = value
  showFiltersDropdown.value = false
}

const openProjectModal = (project: any) => {
  selectedProject.value = project
}

const handleProjectUpdate = async (projectId: number, data: any) => {
  try {
    await updateTask(projectId, data)
    // Update local state
    const project = allProjects.value.find(p => getProjectId(p) === projectId)
    if (project) {
      Object.assign(project, data)
    }
    await loadActivityLogs()
  } catch (error) {
    console.error('Failed to update project:', error)
  }
}

const handleProjectDelete = async (projectId: number) => {
  try {
    await deleteTask(projectId)
    allProjects.value = allProjects.value.filter(p => getProjectId(p) !== projectId)
    selectedProject.value = null
    toast.success('Project deleted', 'The project has been removed successfully.')
    await loadActivityLogs()
  } catch (error) {
    console.error('Failed to delete project:', error)
    toast.error('Delete failed', 'Could not delete the project.')
  }
}

const handleSubtaskUpdated = async () => {
  await loadProjects()
  await loadActivityLogs()
}

const clearLogs = async () => {
  const confirmed = await confirmDanger({
    title: 'Clear Activity Log',
    message: 'Are you sure you want to clear all activity log entries? This action cannot be undone.',
    confirmText: 'Clear All',
    cancelText: 'Cancel',
  })
  
  if (!confirmed) return
  
  try {
    await clearActivityLogs()
    activityLogs.value = []
    toast.success('Activity log cleared', 'All entries have been removed.')
  } catch (error) {
    console.error('Failed to clear activity logs:', error)
    toast.error('Failed to clear', 'Could not clear activity logs.')
  }
}

const handleOpenTaskFromNotification = async (taskId: number) => {
  // Try to find task in current projects
  let project = allProjects.value.find(p => getProjectId(p) === taskId)
  
  if (project) {
    selectedProject.value = project
  } else {
    // If not found, reload projects and try again
    await loadProjects()
    project = allProjects.value.find(p => getProjectId(p) === taskId)
    if (project) {
      selectedProject.value = project
    }
  }
}

const getCategoryClass = (category: string) => {
  const cat = category?.toUpperCase()
  switch (cat) {
    case 'PERSONAL':
      return 'bg-red-500/20 text-red-300'
    case 'SCHOOL':
      return 'bg-indigo-500/20 text-indigo-300'
    case 'WORK':
      return 'bg-yellow-500/20 text-yellow-300'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const formatCategory = (category: string) => {
  return category?.toUpperCase() || 'PERSONAL'
}

const formatLogDate = (dateString: string) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const loadProjects = async () => {
  try {
    const data = await fetchProjects()
    allProjects.value = data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

const loadActivityLogs = async () => {
  try {
    const data = await fetchActivityLogs()
    activityLogs.value = data || []
  } catch (error) {
    console.error('Failed to load activity logs:', error)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showFiltersDropdown.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadProjects(), loadActivityLogs()])
  loading.value = false
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

.column-header {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
