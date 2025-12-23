<template>
  <Teleport to="body">
    <!-- Transition wrapper for smooth modal enter/leave animations -->
    <Transition name="modal">
      <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Modal container - stops click propagation to prevent closing when clicking inside -->
        <div class="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" @click.stop>
        <!-- Header -->
        <div class="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 class="text-xl font-bold text-white mb-2">{{ task.title }}</h2>
            <span 
              class="px-3 py-1 rounded-2xl text-xs font-medium uppercase tracking-wide"
              :class="categoryClass"
            >
              {{ task.category || 'Personal' }}
            </span>
          </div>
          <button 
            @click="$emit('close')"
            class="text-white/40 hover:text-white/80 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          <!-- Description -->
          <div>
            <h3 class="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              Description
            </h3>
            <p class="text-white/60 text-sm leading-relaxed">{{ task.description || 'No description provided.' }}</p>
          </div>

          <!-- Task Details Grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Due Date -->
            <div class="bg-white/5 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/>
                </svg>
                <span class="text-xs text-white/50">Due Date</span>
              </div>
              <p class="text-white font-medium">{{ formattedDueDate || 'Not set' }}</p>
            </div>

            <!-- Status -->
            <div class="bg-white/5 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-width="1.5"/>
                </svg>
                <span class="text-xs text-white/50">Status</span>
              </div>
              <!-- Status dropdown - only visible to task creator -->
              <div v-if="isTaskCreator" class="relative">
                <select 
                  v-model="localStatus"
                  @change="updateStatus"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                >
                  <option value="pending" class="bg-[#1a1f2e]">Pending</option>
                  <option value="ongoing" class="bg-[#1a1f2e]">Ongoing</option>
                  <option value="completed" class="bg-[#1a1f2e]">Completed</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <!-- Status badge - shown to collaborators (read-only) -->
              <div v-else>
                <span 
                  class="inline-block px-3 py-2 rounded-lg text-sm font-medium"
                  :class="getTaskStatusClass(localStatus)"
                >
                  {{ formatTaskStatus(localStatus) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progress Section -->
          <div v-if="localSubtasks.length > 0" class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Progress
            </h3>
            <div class="flex items-center gap-4">
              <div class="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
              <span class="text-sm font-medium text-white/70 min-w-[60px] text-right">{{ progressPercent }}%</span>
            </div>
          </div>

          <!-- Subtasks -->
          <div v-if="localSubtasks.length > 0">
            <h3 class="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Subtasks ({{ completedSubtasksCount }}/{{ localSubtasks.length }})
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(subtask, index) in localSubtasks" 
                :key="subtask.subtask_id || index"
                class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors"
              >
                <div class="flex-1">
                  <span 
                    class="text-sm font-medium"
                    :class="subtask.status === 'completed' ? 'text-white/50 line-through' : 'text-white'"
                  >
                    {{ subtask.title }}
                  </span>
                  <p v-if="subtask.description" class="text-xs text-white/40 mt-1">{{ subtask.description }}</p>
                  <div v-if="subtask.collaborators?.length" class="flex items-center gap-1 mt-1">
                    <span class="text-xs text-white/40">Assigned:</span>
                    <span v-for="collab in subtask.collaborators" :key="collab.user?.id" class="text-xs text-blue-400">
                      {{ collab.user?.email || 'Unknown' }}
                    </span>
                  </div>
                </div>
                <!-- Status dropdown only for assigned users -->
                <div v-if="canChangeSubtaskStatus(subtask)" class="relative ml-3">
                  <select 
                    :value="subtask.status"
                    @change="updateSubtaskStatus(subtask, ($event.target as HTMLSelectElement).value)"
                    class="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer pr-8"
                  >
                    <option value="pending" class="bg-[#1a1f2e]">Pending</option>
                    <option value="ongoing" class="bg-[#1a1f2e]">Ongoing</option>
                    <option value="completed" class="bg-[#1a1f2e]">Completed</option>
                  </select>
                  <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <!-- Status badge for non-assigned users -->
                <div v-else class="ml-3">
                  <span 
                    class="px-3 py-1.5 rounded-lg text-xs font-medium"
                    :class="getSubtaskStatusClass(subtask.status)"
                  >
                    {{ formatSubtaskStatus(subtask.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Collaborators -->
          <div v-if="collaboratorsList.length > 0">
            <h3 class="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              Collaborators ({{ collaboratorsList.length }})
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="email in collaboratorsList" 
                :key="email"
                class="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg"
              >
                {{ email }}
              </span>
            </div>
          </div>

          <!-- Attachments -->
          <div v-if="attachments.length > 0">
            <h3 class="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              Attachments ({{ attachments.length }})
            </h3>
            <div class="grid grid-cols-1 gap-2">
              <div 
                v-for="attachment in attachments" 
                :key="attachment.attachment_id"
                class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer group"
                @click="previewAttachment(attachment)"
              >
                <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg v-if="isImage(attachment.file_path)" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke-width="1.5"/>
                    <polyline points="21 15 16 10 5 21" stroke-width="1.5"/>
                  </svg>
                  <svg v-else-if="isPdf(attachment.file_path)" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8" stroke-width="1.5"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9" stroke-width="1.5"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white truncate">{{ getFileName(attachment) }}</p>
                  <p class="text-xs text-white/40">{{ getFileExt(attachment.file_path).toUpperCase() }} File</p>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click.stop="downloadAttachment(attachment)"
                    class="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Download"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between p-6 border-t border-white/10 bg-white/2">
          <button 
            v-if="isTaskCreator"
            @click="confirmDelete"
            class="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            Delete Task
          </button>
          <div v-else></div>
          <button 
            @click="$emit('close')"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
        </div>
      </div>
    </Transition>

    <!-- 
      Attachment Preview Modal
      ========================
      Secondary modal for previewing file attachments.
      - Images: Displayed inline with full resolution
      - PDFs: Displayed in iframe viewer
      - Other files: Shows "preview not available" message with file info
      
      Uses z-index 60 to appear above the main modal (z-50)
    -->
    <Transition name="modal">
      <div 
        v-if="previewingAttachment"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        @click.self="previewingAttachment = null"
      >
        <div class="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-white/10">
          <h3 class="text-white font-medium">{{ getFileName(previewingAttachment) }}</h3>
          <button 
            @click="previewingAttachment = null"
            class="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <!-- Preview content area with conditional rendering based on file type -->
        <div class="p-4 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto bg-black/20">
          <!-- Image preview -->
          <img 
            v-if="isImage(previewingAttachment.file_path)"
            :src="getAttachmentUrl(previewingAttachment)"
            :alt="getFileName(previewingAttachment)"
            class="max-w-full max-h-full object-contain rounded-lg"
          />
          <!-- PDF preview via iframe -->
          <iframe 
            v-else-if="isPdf(previewingAttachment.file_path)"
            :src="getAttachmentUrl(previewingAttachment)"
            class="w-full h-[60vh] rounded-lg"
          />
          <!-- Unsupported file type - show friendly message with file details -->
          <div v-else class="text-center text-white/60">
            <svg class="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9" stroke-width="1.5"/>
            </svg>
            <p class="text-lg font-medium mb-2">{{ getFileName(previewingAttachment) }}</p>
            <p class="text-sm text-white/40 mb-1">Preview not available for this file type</p>
            <p class="text-xs text-white/30">{{ getFileExt(previewingAttachment.file_path).toUpperCase() }} File</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button 
            @click="downloadAttachment(previewingAttachment)"
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </button>
          <button 
            v-if="isImage(previewingAttachment.file_path) || isPdf(previewingAttachment.file_path)"
            @click="printAttachment(previewingAttachment)"
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="6 9 6 2 18 2 18 9" stroke-width="1.5"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-width="1.5"/>
              <rect x="6" y="14" width="12" height="8" stroke-width="1.5"/>
            </svg>
            Print
          </button>
        </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

interface Subtask {
  subtask_id?: number
  id?: number
  title: string
  status: string
  description?: string
  collaborators?: Array<{ user?: { id?: number; email?: string } }>
}

/**
 * Attachment interface - represents a file attachment
 */
interface Attachment {
  attachment_id: number
  file_path: string
  original_filename?: string
}

interface Task {
  task_id?: number
  id?: number
  title: string
  description?: string
  category?: string
  status?: string
  due_date?: string
  subtasks?: Subtask[]
  attachments?: Attachment[]
  task_collaborators?: Array<{ user?: { email?: string } }>
  collaborators?: string[]
  user?: { email?: string }
}

interface Props {
  task: Task
}

const props = defineProps<Props>()
const config = useRuntimeConfig()
const { updateSubtask, updateTask } = useApi()
const { confirmDanger } = useConfirm()
const toast = useToast()

const emit = defineEmits<{
  'close': []
  'update': [taskId: number, data: any]
  'delete': [taskId: number]
  'subtask-updated': [taskId: number]
}>()

// Local state
const localStatus = ref(props.task.status || 'pending')
const localSubtasks = ref<Subtask[]>([...(props.task.subtasks || [])])
const previewingAttachment = ref<Attachment | null>(null)

// Watch for task changes
watch(() => props.task, (newTask) => {
  localStatus.value = newTask.status || 'pending'
  localSubtasks.value = [...(newTask.subtasks || [])]
}, { deep: true })

// Computed
const taskId = computed(() => props.task.task_id || props.task.id)

const isTaskCreator = computed(() => {
  const currentUserEmail = authStore.currentUser?.email
  if (!currentUserEmail) return false
  return props.task.user?.email === currentUserEmail
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

const formattedDueDate = computed(() => {
  if (!props.task.due_date) return null
  const date = new Date(props.task.due_date)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
})

const completedSubtasksCount = computed(() => {
  return localSubtasks.value.filter(st => st.status === 'completed').length
})

const progressPercent = computed(() => {
  if (localSubtasks.value.length === 0) return 0
  return Math.round((completedSubtasksCount.value / localSubtasks.value.length) * 100)
})

const collaboratorsList = computed(() => {
  const creatorEmail = props.task.user?.email
  const collaborators: string[] = []
  
  if (props.task.task_collaborators?.length) {
    props.task.task_collaborators.forEach(collab => {
      if (collab.user?.email && collab.user.email !== creatorEmail) {
        collaborators.push(collab.user.email)
      }
    })
  } else if (props.task.collaborators?.length) {
    props.task.collaborators.forEach(email => {
      if (email !== creatorEmail) {
        collaborators.push(email)
      }
    })
  }
  
  return collaborators
})

const attachments = computed(() => props.task.attachments || [])

// Check if current user can change a subtask's status
const canChangeSubtaskStatus = (subtask: Subtask) => {
  const currentUserEmail = authStore.currentUser?.email
  if (!currentUserEmail) return false
  
  // If subtask has no collaborators assigned, allow all task collaborators to change status
  if (!subtask.collaborators || subtask.collaborators.length === 0) {
    return true
  }
  
  // Only assigned collaborators can change the subtask status
  return subtask.collaborators.some(collab => collab.user?.email === currentUserEmail)
}

// Helper functions for subtask status display
const getSubtaskStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400'
    case 'ongoing':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'pending':
    default:
      return 'bg-blue-500/20 text-blue-400'
  }
}

const formatSubtaskStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Get CSS class for task status badge (read-only display for collaborators)
 * @param status - The task status value
 * @returns CSS class string for styling
 */
const getTaskStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400'
    case 'ongoing':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'pending':
    default:
      return 'bg-blue-500/20 text-blue-400'
  }
}

/**
 * Format task status for display (capitalize first letter)
 * @param status - The task status value
 * @returns Formatted status string
 */
const formatTaskStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Methods
const updateStatus = async () => {
  const id = taskId.value
  if (!id) return
  emit('update', id, { status: localStatus.value })
}

const updateSubtaskStatus = async (subtask: Subtask, newStatus: string) => {
  const subtaskId = subtask.subtask_id || subtask.id
  if (!subtaskId) return
  
  try {
    await updateSubtask(subtaskId, { status: newStatus })
    
    // Update local state
    const index = localSubtasks.value.findIndex(s => (s.subtask_id || s.id) === subtaskId)
    if (index !== -1) {
      localSubtasks.value[index].status = newStatus
    }
    
    // Check if all subtasks are completed - auto-complete task
    const allCompleted = localSubtasks.value.every(s => s.status === 'completed')
    if (allCompleted && localSubtasks.value.length > 0 && localStatus.value !== 'completed') {
      localStatus.value = 'completed'
      const id = taskId.value
      if (id) {
        await updateTask(id, { status: 'completed' })
        emit('update', id, { status: 'completed' })
        toast.success('Task completed!', 'All subtasks have been marked as done.')
      }
    }
    
    // Notify parent to refresh
    const id = taskId.value
    if (id) emit('subtask-updated', id)
  } catch (error) {
    console.error('Failed to update subtask status:', error)
    toast.error('Update failed', 'Could not update subtask status.')
  }
}

const confirmDelete = async () => {
  const id = taskId.value
  if (!id) return
  
  const confirmed = await confirmDanger({
    title: 'Delete Task',
    message: 'Are you sure you want to delete this task? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })
  
  if (confirmed) {
    emit('delete', id)
    // Toast notification is handled by parent component after successful deletion
  }
}

// Attachment helpers
const getFileName = (attachment: Attachment) => {
  // Use original_filename if available, otherwise extract from file_path
  if (attachment.original_filename) {
    return attachment.original_filename
  }
  // Fallback: extract from file_path and remove UUID prefix if present
  const pathName = attachment.file_path?.split('/').pop() || 'attachment'
  // Check if it has UUID prefix (36 chars + underscore)
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_/i
  if (uuidPattern.test(pathName)) {
    return pathName.substring(37) // Remove UUID prefix (36 chars + underscore)
  }
  return pathName
}
const getFileExt = (filePath: string) => filePath?.split('.').pop()?.toLowerCase() || ''
const isImage = (filePath: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExt(filePath))
const isPdf = (filePath: string) => getFileExt(filePath) === 'pdf'

const getAttachmentUrl = (attachment: Attachment) => {
  const apiBase = config.public.apiBase as string
  // Use authenticated API endpoint to serve files (inline for preview)
  return `${apiBase}/attachments/${attachment.attachment_id}/file`
}

const getDownloadUrl = (attachment: Attachment) => {
  const apiBase = config.public.apiBase as string
  // Use download endpoint for forced download
  return `${apiBase}/attachments/${attachment.attachment_id}/download`
}

/**
 * Preview an attachment by opening the preview modal
 * Always opens the modal - shows preview for supported types (images, PDFs)
 * or a "preview not available" message for unsupported types
 * 
 * @param attachment - The attachment to preview
 */
const previewAttachment = (attachment: Attachment) => {
  // Always open the preview modal - it will show appropriate content
  // based on file type (image, PDF, or "not available" message)
  previewingAttachment.value = attachment
}

/**
 * Download an attachment file
 * Creates a temporary link and triggers download
 * 
 * @param attachment - The attachment to download
 */
const downloadAttachment = (attachment: Attachment) => {
  const url = getDownloadUrl(attachment)
  const a = document.createElement('a')
  a.href = url
  a.download = getFileName(attachment)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const printAttachment = (attachment: Attachment) => {
  const url = getAttachmentUrl(attachment)
  const fileName = getFileName(attachment)
  
  if (isPdf(attachment.file_path)) {
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => printWindow.print()
    }
  } else if (isImage(attachment.file_path)) {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print ${fileName}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
            <img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onload = () => printWindow.print()
    }
  }
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (previewingAttachment.value) {
        previewingAttachment.value = null
      } else {
        emit('close')
      }
    }
  }
  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => document.removeEventListener('keydown', handleEscape))
})
</script>

<style scoped>
/* Modal transitions - matching calendar page */
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