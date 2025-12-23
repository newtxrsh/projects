// API Type Definitions

export interface User {
  id: number
  email: string
  fname?: string
  lname?: string
  profile_picture?: string
  created_at?: string
  updated_at?: string
}

export interface Subtask {
  id: number
  task_id: number
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  assigned_to?: number
  assigned_user?: User
  created_at?: string
  updated_at?: string
}

export interface Attachment {
  id: number
  task_id: number
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: number
  created_at?: string
}

export interface TaskCollaborator {
  id: number
  task_id: number
  user_id: number
  user?: User
  created_at?: string
}

export interface Task {
  task_id: number
  id?: number // Some API responses use 'id' instead of 'task_id'
  title: string
  description?: string
  category?: 'work' | 'personal' | 'shopping' | 'others' | 'WORK' | 'PERSONAL' | 'SCHOOL' | string
  status: 'pending' | 'in_progress' | 'completed' | 'ongoing' | string
  due_date?: string
  created_by: number
  creator?: User
  subtasks?: Subtask[]
  collaborators?: TaskCollaborator[]
  task_collaborators?: TaskCollaborator[] // Alternative field name from API
  attachments?: Attachment[]
  subtask_count?: number
  completed_subtask_count?: number
  created_at?: string
  updated_at?: string
}

export interface Project extends Task {
  // Projects are tasks with collaborators
}

export interface ActivityLog {
  id: number
  user_id: number
  task_id?: number
  action: string
  description: string
  user?: User
  task?: Task
  created_at?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Filter and Sort Types
export interface TaskFilters {
  search?: string
  category?: string
  status?: string
  due_date?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}
