<template>
  <div 
    class="project-card rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-105"
    style="background: linear-gradient(180deg, #0f1320 0%, #0a0e1a 100%)"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3 gap-3">
      <div class="flex-1">
        <h3 class="text-white font-bold text-lg leading-tight mb-2">{{ project.title }}</h3>
        <span 
          class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide inline-block"
          :class="categoryClass"
        >
          {{ formattedCategory }}
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

    <!-- Description -->
    <p class="text-white/60 text-sm line-clamp-2 mb-4 leading-relaxed">
      {{ project.description || 'No description provided.' }}
    </p>

    <!-- Divider -->
    <div class="border-t border-white/10 mb-4"></div>

    <!-- Meta info -->
    <div class="flex items-center gap-4 text-white/50 text-sm mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="17" rx="2" ry="2" stroke-width="1.5"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5"/>
        </svg>
        <span class="DueDate">{{ formattedDueDate }}</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" stroke-width="1.5"/>
        </svg>
        <span class="Subtask">{{ subtasksCount }} subtask(s)</span>
      </div>
    </div>

    <!-- Progress bar (if has subtasks) -->
    <div v-if="subtasksCount > 0" class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-white/50 font-semibold">Subtasks</span>
        <span class="text-xs text-white/60 font-medium">{{ completedSubtasksCount }}/{{ subtasksCount }}</span>
      </div>
      <div class="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Creator -->
    <div class="mb-3">
      <div class="text-xs text-white/40 uppercase font-semibold tracking-wide mb-1.5">Creator</div>
      <span class="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs rounded-md">
        {{ creatorEmail }}
      </span>
    </div>

    <!-- Collaborators -->
    <div>
      <div class="text-xs text-white/40 font-semibold uppercase tracking-wide mb-1.5">
        Collaborators ({{ collaboratorEmails.length }})
      </div>
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
        <span v-if="collaboratorEmails.length === 0" class="text-xs text-white/40">
          No collaborators
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  project: {
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
}>()

// Computed
const formattedCategory = computed(() => 
  (props.project.category || 'PERSONAL').toUpperCase()
)

const categoryClass = computed(() => {
  const category = props.project.category?.toUpperCase()
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
  const status = props.project.status?.toLowerCase()
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
  const status = props.project.status?.toLowerCase()
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
  const status = props.project.status?.toLowerCase() || 'pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
})

const formattedDueDate = computed(() => {
  if (!props.project.due_date) return 'No due date'
  return new Date(props.project.due_date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
})

const subtasksCount = computed(() => props.project.subtasks?.length || 0)

const completedSubtasksCount = computed(() => {
  const subtasks = props.project.subtasks || []
  return subtasks.filter(st => st.status === 'completed').length
})

const progressPercent = computed(() => {
  if (subtasksCount.value === 0) return 0
  return Math.round((completedSubtasksCount.value / subtasksCount.value) * 100)
})

const creatorEmail = computed(() => props.project.user?.email || 'Unknown')

const collaboratorEmails = computed(() => {
  const creatorEmail = props.project.user?.email
  const emails: string[] = []
  
  if (props.project.task_collaborators?.length) {
    props.project.task_collaborators.forEach(collab => {
      if (collab.user?.email && collab.user.email !== creatorEmail) {
        emails.push(collab.user.email)
      }
    })
  } else if (props.project.collaborators?.length) {
    props.project.collaborators.forEach(email => {
      if (email !== creatorEmail) {
        emails.push(email)
      }
    })
  }
  
  return emails
})

const displayedCollaborators = computed(() => collaboratorEmails.value.slice(0, 3))
const remainingCollaborators = computed(() => Math.max(0, collaboratorEmails.value.length - 3))
</script>

<style>
 .DueDate {
    font-weight: 600;
  }
  
  .Subtask {
    font-weight: 600;
  }
</style>