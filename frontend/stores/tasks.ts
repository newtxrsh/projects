import { defineStore } from 'pinia'
import type { Task, TaskFilters, SortOptions } from '~/types/api'

export interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filters: TaskFilters
  sorting: SortOptions
  lastFetched: number | null
  cacheTimeout: number // in milliseconds
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
    isLoading: false,
    error: null,
    filters: {
      search: '',
      category: 'all',
      status: 'all',
    },
    sorting: {
      field: 'created_at',
      direction: 'desc',
    },
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  }),

  getters: {
    // Filter for personal board (tasks without multiple collaborators)
    personalTasks: (state): Task[] => {
      return state.tasks.filter(task => {
        const collaborators = task.task_collaborators || []
        return collaborators.length <= 1
      })
    },

    // Filter for projects (tasks with multiple collaborators)
    projectTasks: (state): Task[] => {
      return state.tasks.filter(task => {
        const collaborators = task.task_collaborators || []
        return collaborators.length > 1
      })
    },

    // Filtered tasks based on current filters
    filteredTasks(): Task[] {
      let result = [...this.personalTasks]

      // Apply search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(task =>
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
        )
      }

      // Apply category filter
      if (this.filters.category && this.filters.category !== 'all') {
        result = result.filter(task =>
          task.category?.toUpperCase() === this.filters.category?.toUpperCase()
        )
      }

      // Apply status filter
      if (this.filters.status && this.filters.status !== 'all') {
        result = result.filter(task =>
          task.status?.toLowerCase() === this.filters.status?.toLowerCase()
        )
      }

      // Apply sorting
      result.sort((a, b) => {
        const field = this.sorting.field as keyof Task
        const direction = this.sorting.direction === 'asc' ? 1 : -1
        
        const aVal = a[field]
        const bVal = b[field]
        
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * direction
        }
        
        return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * direction
      })

      return result
    },

    // Filtered projects
    filteredProjects(): Task[] {
      let result = [...this.projectTasks]

      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(task =>
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
        )
      }

      if (this.filters.category && this.filters.category !== 'all') {
        result = result.filter(task =>
          task.category?.toUpperCase() === this.filters.category?.toUpperCase()
        )
      }

      if (this.filters.status && this.filters.status !== 'all') {
        result = result.filter(task =>
          task.status?.toLowerCase() === this.filters.status?.toLowerCase()
        )
      }

      return result
    },

    // Tasks grouped by status
    tasksByStatus(): Record<string, Task[]> {
      return {
        pending: this.filteredTasks.filter(t => t.status?.toLowerCase() === 'pending'),
        ongoing: this.filteredTasks.filter(t => t.status?.toLowerCase() === 'ongoing'),
        completed: this.filteredTasks.filter(t => t.status?.toLowerCase() === 'completed'),
      }
    },

    // Projects grouped by status
    projectsByStatus(): Record<string, Task[]> {
      return {
        pending: this.filteredProjects.filter(t => t.status?.toLowerCase() === 'pending'),
        ongoing: this.filteredProjects.filter(t => t.status?.toLowerCase() === 'ongoing'),
        completed: this.filteredProjects.filter(t => t.status?.toLowerCase() === 'completed'),
      }
    },

    // Task counts
    taskCounts(): { total: number; pending: number; ongoing: number; completed: number } {
      return {
        total: this.filteredTasks.length,
        pending: this.tasksByStatus.pending.length,
        ongoing: this.tasksByStatus.ongoing.length,
        completed: this.tasksByStatus.completed.length,
      }
    },

    // Project counts
    projectCounts(): { total: number; pending: number; ongoing: number; completed: number } {
      return {
        total: this.filteredProjects.length,
        pending: this.projectsByStatus.pending.length,
        ongoing: this.projectsByStatus.ongoing.length,
        completed: this.projectsByStatus.completed.length,
      }
    },

    // Check if cache is valid
    isCacheValid: (state): boolean => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheTimeout
    },

    // Get task by ID
    getTaskById: (state) => (id: number): Task | undefined => {
      return state.tasks.find(t => (t.task_id || t.id) === id)
    },
  },

  actions: {
    // Set filters
    setFilters(filters: Partial<TaskFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    setSearch(search: string) {
      this.filters.search = search
    },

    setCategory(category: string) {
      this.filters.category = category
    },

    setStatus(status: string) {
      this.filters.status = status
    },

    clearFilters() {
      this.filters = {
        search: '',
        category: 'all',
        status: 'all',
      }
    },

    // Set sorting
    setSorting(sorting: Partial<SortOptions>) {
      this.sorting = { ...this.sorting, ...sorting }
    },

    // Fetch all tasks
    async fetchTasks(force = false) {
      // Return cached data if valid and not forcing refresh
      if (!force && this.isCacheValid && this.tasks.length > 0) {
        return this.tasks
      }

      this.isLoading = true
      this.error = null

      try {
        const { fetchTasks } = useApi()
        const data = await fetchTasks()
        this.tasks = data || []
        this.lastFetched = Date.now()
        return this.tasks
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch tasks'
        console.error('Failed to fetch tasks:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Create task
    async createTask(taskData: Partial<Task>) {
      this.isLoading = true
      this.error = null

      try {
        const { createTask } = useApi()
        const newTask = await createTask(taskData)
        
        if (newTask) {
          this.tasks.unshift(newTask)
        }
        
        return newTask
      } catch (err: any) {
        this.error = err.message || 'Failed to create task'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Update task with optimistic update
    async updateTask(taskId: number, data: Partial<Task>) {
      const task = this.tasks.find(t => (t.task_id || t.id) === taskId)
      if (!task) return

      // Store original for rollback
      const original = { ...task }

      // Optimistic update
      Object.assign(task, data)

      try {
        const { updateTask } = useApi()
        await updateTask(taskId, data)
        return task
      } catch (err: any) {
        // Rollback on error
        Object.assign(task, original)
        this.error = err.message || 'Failed to update task'
        throw err
      }
    },

    // Update task status (optimized for drag and drop)
    async updateTaskStatus(taskId: number, newStatus: string) {
      return this.updateTask(taskId, { status: newStatus })
    },

    // Delete task
    async deleteTask(taskId: number) {
      const index = this.tasks.findIndex(t => (t.task_id || t.id) === taskId)
      if (index === -1) return

      // Store for rollback
      const removed = this.tasks[index]

      // Optimistic remove
      this.tasks.splice(index, 1)

      try {
        const { deleteTask } = useApi()
        await deleteTask(taskId)
      } catch (err: any) {
        // Rollback on error
        this.tasks.splice(index, 0, removed)
        this.error = err.message || 'Failed to delete task'
        throw err
      }
    },

    // Refresh a single task
    async refreshTask(taskId: number) {
      try {
        const config = useRuntimeConfig()
        const authStore = useAuthStore()
        
        const data = await $fetch<Task>(`${config.public.apiBase}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        
        const index = this.tasks.findIndex(t => (t.task_id || t.id) === taskId)
        if (index !== -1) {
          this.tasks[index] = data
        }
        
        return data
      } catch (err) {
        console.error('Failed to refresh task:', err)
        throw err
      }
    },

    // Clear cache and refetch
    async invalidateCache() {
      this.lastFetched = null
      await this.fetchTasks(true)
    },

    // Clear all data
    clearTasks() {
      this.tasks = []
      this.lastFetched = null
      this.error = null
    },
  },
})
