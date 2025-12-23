<template>
  <div 
    class="task-card rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-105"
    style="background: linear-gradient(180deg, #0f1320 0%, #0a0e1a 100%)"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3 gap-3">
      <div class="flex-1">
        <h3 class="text-white font-bold text-lg leading-tight mb-2">{{ task.title }}</h3>
        <span 
          class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide inline-block"
          :class="categoryClass"
        >
          {{ task.category || 'Personal' }}
        </span>
      </div>
      <div 
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
        :class="statusClass"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
        {{ formattedStatus }}
      </div>
    </div>

    <!-- Description preview -->
    <p class="text-white/60 text-sm line-clamp-3 mb-4 leading-relaxed">
      {{ task.description || 'No description provided.' }}
    </p>

    <!-- Divider -->
    <div class="border-t border-white/10 mb-4"></div>

    <!-- Meta info -->
    <div class="flex items-center gap-4 text-white/50 text-sm mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/>
        </svg>
        <span :class="dueDateClass" | class="dueDate">{{ formattedDueDate || 'No due date' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" stroke-width="1.5"/>
        </svg>
        <span class="subtask">{{ task.subtasks?.length || 0 }} subtask(s)</span>
      </div>
    </div>

    <!-- Progress bar (only show if task has subtasks) -->
    <div v-if="task.subtasks && task.subtasks.length > 0" class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-white/50 font-semibold">Subtasks</span>
        <span class="text-xs text-white/60 font-medium">{{ completedSubtasks }}/{{ task.subtasks.length }}</span>
      </div>
      <div class="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
          :style="{ width: `${taskProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Collaborators (if any) -->
    <div v-if="hasCollaborators" class="pt-4 border-t border-white/10">
      <div class="text-xs text-white/40 uppercase tracking-wide mb-2">Collaborators</div>
      <div class="flex flex-wrap gap-1.5">
        <span 
          v-for="email in displayedCollaborators" 
          :key="email"
          class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md"
        >
          {{ email }}
        </span>
        <span v-if="remainingCollaborators > 0" class="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-md">
          +{{ remainingCollaborators }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  task: {
    task_id?: number
    id?: number
    title: string
    description?: string
    category?: string
    status?: string
    due_date?: string
    subtasks?: Array<{ status: string }>
    task_collaborators?: Array<{ user?: { email?: string } }>
    collaborators?: string[]
    user?: { email?: string }
  }
}

const props = defineProps<Props>()

defineEmits<{
  'click': []
  'status-change': [newStatus: string]
}>()

// Computed
const taskProgress = computed(() => {
  const subtasks = props.task.subtasks || []
  if (subtasks.length === 0) return 0
  const completed = subtasks.filter(st => st.status === 'completed').length
  return Math.round((completed / subtasks.length) * 100)
})

const completedSubtasks = computed(() => {
  const subtasks = props.task.subtasks || []
  return subtasks.filter(st => st.status === 'completed').length
})

const categoryClass = computed(() => {
  const category = props.task.category?.toUpperCase()
  switch (category) {
    case 'PERSONAL':
      return 'bg-orange-500/20 text-orange-300'
    case 'SCHOOL':
      return 'bg-violet-500/20 text-violet-300'
    case 'WORK':
        return 'bg-gray-300/20 text-gray-300'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
  }
})

const statusClass = computed(() => {
  const status = props.task.status?.toLowerCase()
  switch (status) {
    case 'pending':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'ongoing':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
    case 'completed':
      return 'bg-green-500/10 text-green-400 border-green-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
})

const statusDotClass = computed(() => {
  const status = props.task.status?.toLowerCase()
  switch (status) {
    case 'pending':
      return 'bg-blue-500'
    case 'ongoing':
      return 'bg-yellow-500 animate-pulse'
    case 'completed':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
})

const formattedStatus = computed(() => {
  const status = props.task.status?.toLowerCase() || 'pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
})

const formattedDueDate = computed(() => {
  if (!props.task.due_date) return ''
  const date = new Date(props.task.due_date)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const dueDateClass = computed(() => {
  if (!props.task.due_date) return ''
  const dueDate = new Date(props.task.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (dueDate < today) {
    return 'text-red-400'
  } else if (dueDate.getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
    return 'text-yellow-400'
  }
  return ''
})

const collaboratorEmails = computed(() => {
  const creatorEmail = props.task.user?.email
  const emails: string[] = []
  
  if (props.task.task_collaborators?.length) {
    props.task.task_collaborators.forEach(collab => {
      if (collab.user?.email && collab.user.email !== creatorEmail) {
        emails.push(collab.user.email)
      }
    })
  } else if (props.task.collaborators?.length) {
    props.task.collaborators.forEach(email => {
      if (email !== creatorEmail) {
        emails.push(email)
      }
    })
  }
  
  return emails
})

const hasCollaborators = computed(() => collaboratorEmails.value.length > 0)
const displayedCollaborators = computed(() => collaboratorEmails.value.slice(0, 3))
const remainingCollaborators = computed(() => Math.max(0, collaboratorEmails.value.length - 3))
</script>

<style>
    .dueDate{
        font-weight: 600;
    }
    .subtask{
        font-weight: 600;
    }
</style>