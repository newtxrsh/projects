import type { Task, TaskFilters } from '~/types/api'

export const useProjects = (options?: {
  filters?: Ref<TaskFilters>
  immediate?: boolean
}) => {
  const api = useApi()
  const toast = useToast()

  const projects = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch projects
  const fetchProjects = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await api.fetchProjects()
      projects.value = result || []
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to fetch projects'
      toast.error('Error', error.value || undefined)
    } finally {
      loading.value = false
    }
  }

  // Filter projects locally
  const filteredProjects = computed(() => {
    let result = [...projects.value]

    if (options?.filters?.value) {
      const { search, category, status } = options.filters.value

      if (search) {
        const searchLower = search.toLowerCase()
        result = result.filter(
          (project) =>
            project.title.toLowerCase().includes(searchLower) ||
            project.description?.toLowerCase().includes(searchLower)
        )
      }

      if (category && category !== 'all') {
        result = result.filter((project) => project.category === category)
      }

      if (status && status !== 'all') {
        result = result.filter((project) => project.status === status)
      }
    }

    return result
  })

  // Group projects by status for Kanban view
  const projectsByStatus = computed(() => ({
    pending: filteredProjects.value.filter((p) => p.status === 'pending'),
    in_progress: filteredProjects.value.filter((p) => p.status === 'in_progress'),
    completed: filteredProjects.value.filter((p) => p.status === 'completed'),
  }))

  // Update a project
  const updateProject = async (taskId: number, projectData: Partial<Task>) => {
    loading.value = true
    error.value = null

    try {
      const result = await api.updateTask(taskId, projectData)
      if (result) {
        const index = projects.value.findIndex((p) => p.task_id === taskId)
        if (index !== -1) {
          projects.value[index] = { ...projects.value[index], ...result }
        }
        toast.success('Project updated', 'Your project has been updated successfully')
      }
      return result
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to update project'
      toast.error('Error', error.value || undefined)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update project status
  const updateProjectStatus = async (taskId: number, status: Task['status']) => {
    const project = projects.value.find((p) => p.task_id === taskId)
    const previousStatus = project?.status

    if (project) {
      project.status = status
    }

    try {
      await api.updateTask(taskId, { status })
    } catch (e: any) {
      if (project && previousStatus) {
        project.status = previousStatus
      }
      toast.error('Error', 'Failed to update project status')
      throw e
    }
  }

  // Refresh
  const refresh = async () => {
    await fetchProjects()
  }

  // Fetch immediately if specified
  if (options?.immediate !== false) {
    fetchProjects()
  }

  return {
    projects,
    filteredProjects,
    projectsByStatus,
    loading,
    error,
    fetchProjects,
    updateProject,
    updateProjectStatus,
    refresh,
  }
}
