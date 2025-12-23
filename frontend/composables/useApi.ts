export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, any>
  headers?: Record<string, string>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = (additionalHeaders?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  const apiFetch = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T | null> => {
    try {
      const response = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        method: options.method || 'GET',
        headers: getHeaders(options.headers),
        body: options.body,
        onResponseError({ response }) {
          if (response.status === 401) {
            authStore.clearAuth()
            navigateTo('/auth/login')
          }
        },
      })

      return response
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error)
      
      if (error?.response?.status === 401) {
        authStore.clearAuth()
        navigateTo('/auth/login')
      }
      
      throw error
    }
  }

  // Specific API methods
  const fetchCurrentUser = async () => {
    return await apiFetch<{ id: number; email: string; fname?: string; lname?: string }>('/me')
  }

  const fetchTasks = async () => {
    return await apiFetch<any[]>('/tasks')
  }

  const createTask = async (taskData: Record<string, any>) => {
    return await apiFetch<any>('/tasks', {
      method: 'POST',
      body: taskData,
    })
  }

  const updateTask = async (taskId: number, taskData: Record<string, any>) => {
    return await apiFetch<any>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData,
    })
  }

  const deleteTask = async (taskId: number) => {
    return await apiFetch<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  const fetchProjects = async () => {
    return await apiFetch<any[]>('/projects')
  }

  const fetchUsers = async () => {
    return await apiFetch<any[]>('/users')
  }

  const checkUser = async (email: string) => {
    return await apiFetch<any>(`/users/check-user?email=${encodeURIComponent(email)}`)
  }

  const fetchSubtasks = async (taskId?: number) => {
    const query = taskId ? `?task_id=${taskId}` : ''
    return await apiFetch<any[]>(`/subtasks${query}`)
  }

  const createSubtask = async (subtaskData: Record<string, any>) => {
    return await apiFetch<any>('/subtasks', {
      method: 'POST',
      body: subtaskData,
    })
  }

  const updateSubtask = async (subtaskId: number, subtaskData: Record<string, any>) => {
    return await apiFetch<any>(`/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: subtaskData,
    })
  }

  const fetchActivityLogs = async () => {
    return await apiFetch<any[]>('/activity-logs')
  }

  const clearActivityLogs = async () => {
    return await apiFetch<void>('/activity-logs', {
      method: 'DELETE',
    })
  }

  const fetchTaskCollaborators = async (taskId?: number) => {
    const query = taskId ? `?task_id=${taskId}` : ''
    return await apiFetch<any[]>(`/task-collaborators${query}`)
  }

  const fetchAttachments = async (taskId?: number) => {
    const query = taskId ? `?task_id=${taskId}` : ''
    return await apiFetch<any[]>(`/attachments${query}`)
  }

  return {
    apiFetch,
    fetchCurrentUser,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchProjects,
    fetchUsers,
    checkUser,
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    fetchActivityLogs,
    clearActivityLogs,
    fetchTaskCollaborators,
    fetchAttachments,
  }
}
