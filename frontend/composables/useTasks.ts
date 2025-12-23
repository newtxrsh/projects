import type { Task, TaskFilters, SortOptions } from '~/types/api'

export const useTasks = (options?: {
  filters?: Ref<TaskFilters>
  sort?: Ref<SortOptions>
  immediate?: boolean
}) => {
  const api = useApi()
  const toast = useToast()

  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch tasks with optional filters
  const fetchTasks = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await api.fetchTasks()
      tasks.value = result || []
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch tasks'
      toast.error('Error', error.value || undefined)
    } finally {
      loading.value = false
    }
  }

  // Filter tasks locally (client-side filtering)
  const filteredTasks = computed(() => {
    let result = [...tasks.value]

    if (options?.filters?.value) {
      const { search, category, status } = options.filters.value

      if (search) {
        const searchLower = search.toLowerCase()
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower)
        )
      }

      if (category && category !== 'all') {
        result = result.filter((task) => task.category === category)
      }

      if (status && status !== 'all') {
        result = result.filter((task) => task.status === status)
      }
    }

    // Apply sorting
    if (options?.sort?.value) {
      const { field, direction } = options.sort.value
      result.sort((a, b) => {
        const aVal = a[field as keyof Task]
        const bVal = b[field as keyof Task]

        if (aVal === undefined) return 1
        if (bVal === undefined) return -1

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  })

  // Group tasks by status for Kanban view
  const tasksByStatus = computed(() => ({
    pending: filteredTasks.value.filter((t) => t.status === 'pending'),
    in_progress: filteredTasks.value.filter((t) => t.status === 'in_progress'),
    completed: filteredTasks.value.filter((t) => t.status === 'completed'),
  }))

  // Create a new task
  const createTask = async (taskData: Partial<Task>) => {
    loading.value = true
    error.value = null

    try {
      const result = await api.createTask(taskData)
      if (result) {
        tasks.value.push(result)
        toast.success('Task created', 'Your task has been created successfully')
      }
      return result
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to create task'
      toast.error('Error', error.value || undefined)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update a task
  const updateTask = async (taskId: number, taskData: Partial<Task>) => {
    loading.value = true
    error.value = null

    try {
      const result = await api.updateTask(taskId, taskData)
      if (result) {
        const index = tasks.value.findIndex((t) => t.task_id === taskId)
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...result }
        }
        toast.success('Task updated', 'Your task has been updated successfully')
      }
      return result
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to update task'
      toast.error('Error', error.value || undefined)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Delete a task
  const deleteTask = async (taskId: number) => {
    loading.value = true
    error.value = null

    try {
      await api.deleteTask(taskId)
      tasks.value = tasks.value.filter((t) => t.task_id !== taskId)
      toast.success('Task deleted', 'Your task has been deleted successfully')
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to delete task'
      toast.error('Error', error.value || undefined)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update task status (for drag and drop)
  const updateTaskStatus = async (taskId: number, status: Task['status']) => {
    // Optimistic update
    const task = tasks.value.find((t) => t.task_id === taskId)
    const previousStatus = task?.status

    if (task) {
      task.status = status
    }

    try {
      await api.updateTask(taskId, { status })
    } catch (e: any) {
      // Revert on error
      if (task && previousStatus) {
        task.status = previousStatus
      }
      toast.error('Error', 'Failed to update task status')
      throw e
    }
  }

  // Refresh task data
  const refresh = async () => {
    await fetchTasks()
  }

  // Fetch immediately if specified
  if (options?.immediate !== false) {
    fetchTasks()
  }

  return {
    tasks,
    filteredTasks,
    tasksByStatus,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refresh,
  }
}
