<template>
  <div class="calendar-page flex gap-6">
    <!-- Loading Skeleton -->
    <template v-if="loading">
      <CalendarSkeleton class="flex-1" />
      <div style="background: rgba(255, 255, 255, 0.02)" class="w-80 border border-white/10 rounded-xl p-5">
        <div class="mb-4">
          <BaseSkeleton variant="text" width="100px" height="22px" class="mb-2" />
          <BaseSkeleton variant="text" width="160px" />
        </div>
        <div class="text-center py-10 text-white/40">
          <BaseSkeleton variant="circular" width="40px" height="40px" class="mx-auto mb-2" />
          <BaseSkeleton variant="text" width="160px" class="mx-auto" />
        </div>
      </div>
    </template>

    <!-- Calendar Card -->
    <template v-else>
    <div style="background: rgba(255, 255, 255, 0.02)" class="flex-1 rounded-3xl p-6 shadow-lg shadow-black/20">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Calendar</h1>
          <p class="text-sm text-white/50">Track upcoming due dates across all active tasks.</p>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="previousMonth"
            class="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <span class="text-xl">‹</span>
          </button>
          <div class="min-w-[180px] text-center text-lg font-semibold text-white">
            {{ monthYearLabel }}
          </div>
          <button 
            @click="nextMonth"
            class="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <span class="text-xl">›</span>
          </button>
        </div>
      </div>

      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 mb-2">
        <div 
          v-for="(day, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
          :key="day"
          class="py-2 text-center text-sm font-medium"
          :class="index === 0 ? 'text-red-400/70' : 'text-white/50'"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="min-h-[100px] p-2 rounded-lg cursor-pointer transition-all"
          :class="getDayClasses(day)"
          @click="selectDate(day)"
        >
          <div 
            class="text-sm font-medium mb-2"
            :class="getDayNumberClasses(day)"
          >
            {{ day.date }}
          </div>
          
          <!-- Holiday Indicator -->
          <div v-if="getHolidaysForDate(day.fullDate).length > 0" class="mb-1">
            <div 
              v-for="holiday in getHolidaysForDate(day.fullDate).slice(0, 1)" 
              :key="holiday.id"
              class="px-2 py-0.5 rounded text-[10px] font-medium truncate bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              :title="holiday.summary"
              @click.stop="openHolidayModal(holiday)"
            >
              🇵🇭 {{ holiday.summary }}
            </div>
          </div>
          
          <!-- Task Pills -->
          <div class="space-y-1">
            <div 
              v-for="task in getTasksForDay(day.fullDate).slice(0, 2)" 
              :key="task.task_id || task.id"
              class="px-2 py-0.5 rounded text-[10px] font-medium truncate"
              :class="getCategoryPillClass(task.category)"
              :title="task.title"
            >
              {{ task.title }}
            </div>
            <div 
              v-if="getTasksForDay(day.fullDate).length > 2"
              class="text-[10px] text-white/40 px-2"
            >
              +{{ getTasksForDay(day.fullDate).length - 2 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Due Tasks Sidebar -->
    <div style="background: rgba(255, 255, 255, 0.02)" class="w-80 rounded-3xl p-5 h-fit sticky top-4 shadow-lg shadow-black/20">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-white mb-1">Due Tasks</h3>
        <p class="text-sm text-white/50">{{ selectedDateLabel }}</p>
      </div>
      
      <div v-if="!selectedDate" class="text-center py-10 text-white/40">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="1.5"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/>
        </svg>
        <p class="text-sm">Click on a date to view tasks</p>
      </div>
      
      <div v-else-if="selectedDateTasks.length === 0" class="text-center py-10 text-white/40">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-sm">No tasks scheduled for this date</p>
      </div>
      
      <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">
        <div 
          v-for="task in selectedDateTasks" 
          :key="task.task_id || task.id"
          class="p-3 bg-[#0f1320] rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-black/20 hover:shadow-lg hover:shadow-black/20"
          @click="toggleTaskDetails(task.task_id || task.id)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-white truncate">{{ task.title }}</h4>
              <div class="flex items-center gap-2 mt-1">
                <span 
                  class="inline-block px-2 py-0.5 rounded-2xl text-[10px] font-medium"
                  :class="getCategoryPillClass(task.category)"
                >
                  {{ formatCategory(task.category) }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                  :class="getStatusClass(task.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(task.status)"></span>
                  {{ formatStatus(task.status) }}
                </span>
              </div>
            </div>
            <svg 
              class="w-4 h-4 text-white/40 transition-transform duration-200"
              :class="{ 'rotate-180': expandedTaskId === (task.task_id || task.id) }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          
          <!-- Expanded Details -->
          <Transition name="expand">
            <div 
              v-if="expandedTaskId === (task.task_id || task.id)"
              class="mt-3 pt-3 border-t border-white/10 space-y-2"
            >
            <div class="flex items-center gap-2 text-xs text-white/60">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="1.5"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/>
              </svg>
              <span>Due: {{ formatDueDate(task.due_date) }}</span>
            </div>
            <div v-if="task.description" class="text-xs text-white/50">
              <p class="line-clamp-3">{{ task.description }}</p>
            </div>
            <div v-else class="text-xs text-white/40 italic">
              No description provided.
            </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    </template>

    <!-- Holiday Modal -->
    <Transition name="modal">
      <div 
        v-if="showHolidayModal && selectedHoliday"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeHolidayModal"
      >
        <div 
          class="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 p-6 transform transition-all"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">
                🇵🇭
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">{{ selectedHoliday.summary }}</h3>
                <p class="text-sm text-white/50 mt-1">Philippine Holiday</p>
              </div>
            </div>
            <button 
              @click="closeHolidayModal"
              class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Holiday Details -->
          <div class="space-y-4">
            <!-- Date -->
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
              </svg>
              <div>
                <p class="text-xs text-white/50 mb-0.5">Date</p>
                <p class="text-sm font-medium text-white">{{ formatHolidayDate(selectedHoliday.start.date) }}</p>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedHoliday.description" class="p-3 bg-white/5 rounded-xl">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="flex-1">
                  <p class="text-xs text-white/50 mb-1">Description</p>
                  <p class="text-sm text-white/70 leading-relaxed">{{ selectedHoliday.description }}</p>
                </div>
              </div>
            </div>

            <!-- Type Badge -->
            <div class="flex gap-2">
              <span class="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                National Holiday
              </span>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            @click="closeHolidayModal"
            class="w-full mt-6 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
  title: 'Calendar',
  meta: [
    { name: 'description', content: 'View your tasks on a calendar. Track due dates and upcoming deadlines at a glance.' },
    { property: 'og:title', content: 'Calendar View | Task Manager' },
    { property: 'og:description', content: 'View your tasks on a calendar and track upcoming deadlines.' },
  ],
})

const { fetchTasks } = useApi()
const { fetchHolidays, getHolidaysForDate, isHoliday } = usePhilippineHolidays()

const loading = ref(true)
const currentDate = ref(new Date())
const tasks = ref<any[]>([])
const selectedDate = ref<Date | null>(null)
const expandedTaskId = ref<number | null>(null)
const holidays = ref<any[]>([])
const selectedHoliday = ref<any>(null)
const showHolidayModal = ref(false)

// Methods
const toggleTaskDetails = (taskId: number) => {
  if (expandedTaskId.value === taskId) {
    expandedTaskId.value = null
  } else {
    expandedTaskId.value = taskId
  }
}

const openHolidayModal = (holiday: any) => {
  selectedHoliday.value = holiday
  showHolidayModal.value = true
}

const closeHolidayModal = () => {
  showHolidayModal.value = false
  selectedHoliday.value = null
}

// Computed
const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return 'Click on a date to view tasks'
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Filter out completed tasks for calendar display
const activeTasks = computed(() => 
  tasks.value.filter(task => task.status?.toLowerCase() !== 'completed')
)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Add days from previous month
  const startDayOfWeek = firstDay.getDay()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date: date.getDate(),
      fullDate: formatDateKey(date),
      dateObj: new Date(date),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    })
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    date.setHours(0, 0, 0, 0)
    const dateKey = formatDateKey(date)
    days.push({
      date: i,
      fullDate: dateKey,
      dateObj: new Date(date),
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isSelected: selectedDate.value && formatDateKey(selectedDate.value) === dateKey
    })
  }
  
  // Add days from next month to complete the grid (always show 6 rows)
  const remainingDays = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date: i,
      fullDate: formatDateKey(date),
      dateObj: new Date(date),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    })
  }
  
  return days
})

const selectedDateTasks = computed(() => {
  if (!selectedDate.value) return []
  
  const selectedStart = new Date(selectedDate.value)
  selectedStart.setHours(0, 0, 0, 0)
  const selectedEnd = new Date(selectedDate.value)
  selectedEnd.setHours(23, 59, 59, 999)
  
  return activeTasks.value
    .filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate >= selectedStart && dueDate <= selectedEnd
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
})

// Methods
const formatDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const previousMonth = async () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  selectedDate.value = null
  // Fetch holidays for the new year if changed
  await fetchHolidays(currentDate.value.getFullYear())
}

const nextMonth = async () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  selectedDate.value = null
  // Fetch holidays for the new year if changed
  await fetchHolidays(currentDate.value.getFullYear())
}

const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  selectedDate.value = day.dateObj
}

const getTasksForDay = (dateString: string) => {
  return activeTasks.value.filter(task => {
    if (!task.due_date) return false
    const taskDateKey = task.due_date.split('T')[0]
    return taskDateKey === dateString
  })
}

const getDayClasses = (day: any) => {
  const classes = []
  
  if (!day.isCurrentMonth) {
    classes.push('opacity-30')
  } else {
    classes.push('hover:bg-white/10')
  }
  
  if (day.isToday) {
    classes.push('bg-blue-500/20')
  }
  
  if (day.isSelected) {
    classes.push('ring-2 ring-blue-500')
  }

  // Highlight Philippine holidays
  if (isHoliday(day.fullDate)) {
    classes.push('bg-red-500/5')
  }
  
  return classes.join(' ')
}

const getDayNumberClasses = (day: any) => {
  if (day.isToday) return 'text-blue-400'
  if (!day.isCurrentMonth) return 'text-white/30'
  return 'text-white/70'
}

const getCategoryPillClass = (category: string) => {
  const cat = category?.toUpperCase()
  switch (cat) {
    case 'PERSONAL':
      return 'bg-orange-500/30 text-orange-300'
    case 'SCHOOL':
      return 'bg-violet-500/30 text-violet-300'
    case 'WORK':
      return 'bg-gray-300/30 text-gray-300'
    default:
      return 'bg-gray-500/30 text-gray-300'
  }
}

const getStatusClass = (status: string) => {
  const s = status?.toLowerCase()
  switch (s) {
    case 'pending':
      return 'bg-blue-500/20 text-blue-400'
    case 'ongoing':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'completed':
      return 'bg-green-500/20 text-green-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const getStatusDotClass = (status: string) => {
  const s = status?.toLowerCase()
  switch (s) {
    case 'pending':
      return 'bg-blue-500'
    case 'ongoing':
      return 'bg-yellow-500 animate-pulse'
    case 'completed':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const formatCategory = (category: string) => {
  return (category || 'PERSONAL').toUpperCase()
}

const formatStatus = (status: string) => {
  const s = status?.toLowerCase() || 'pending'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const formatDueDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatHolidayDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Load tasks and holidays
onMounted(async () => {
  loading.value = true
  try {
    const data = await fetchTasks()
    tasks.value = data || []
    // Fetch holidays for current year
    await fetchHolidays(currentDate.value.getFullYear())
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.calendar-page {
  min-height: calc(100vh - 120px);
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
