import { defineStore } from 'pinia'

export interface User {
  id: number
  email: string
  fname?: string
  lname?: string
  profile_picture?: string | null
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: number | null
  sessionTimeout: number // in milliseconds
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    lastActivity: null,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes default
  }),

  getters: {
    currentUser: (state) => state.user,
    authToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
    userName: (state) => {
      if (state.user?.fname) return state.user.fname
      if (state.user?.email) return state.user.email.split('@')[0]
      return 'User'
    },
    userFullName: (state) => {
      if (state.user?.fname && state.user?.lname) {
        return `${state.user.fname} ${state.user.lname}`
      }
      return state.user?.fname || state.user?.email?.split('@')[0] || 'User'
    },
    userInitials: (state) => {
      if (state.user?.fname && state.user?.lname) {
        return `${state.user.fname[0]}${state.user.lname[0]}`.toUpperCase()
      }
      if (state.user?.fname) return state.user.fname[0].toUpperCase()
      if (state.user?.email) return state.user.email[0].toUpperCase()
      return 'U'
    },
    isEmailVerified: (state) => !!state.user?.email_verified_at,
    isSessionExpired: (state) => {
      if (!state.lastActivity || !state.isAuthenticated) return false
      return Date.now() - state.lastActivity > state.sessionTimeout
    },
  },

  actions: {
    setToken(token: string) {
      this.token = token
      this.isAuthenticated = true
      this.updateActivity()
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    setUser(user: User) {
      this.user = user
    },

    updateActivity() {
      this.lastActivity = Date.now()
      if (import.meta.client) {
        localStorage.setItem('last_activity', String(this.lastActivity))
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.lastActivity = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('last_activity')
      }
    },

    async initializeAuth() {
      this.isLoading = true
      
      if (import.meta.client) {
        const storedToken = localStorage.getItem('auth_token')
        const storedActivity = localStorage.getItem('last_activity')
        
        if (storedActivity) {
          this.lastActivity = parseInt(storedActivity, 10)
        }
        
        if (storedToken) {
          // Check if session has expired
          if (this.lastActivity && Date.now() - this.lastActivity > this.sessionTimeout) {
            console.log('Session expired, clearing auth')
            this.clearAuth()
            this.isLoading = false
            return
          }
          
          this.token = storedToken
          this.isAuthenticated = true
          
          // Verify token by fetching user data
          try {
            const { fetchCurrentUser } = useApi()
            const user = await fetchCurrentUser()
            if (user) {
              this.user = user
              this.updateActivity()
            } else {
              // Token is invalid, clear auth
              this.clearAuth()
            }
          } catch (error) {
            console.error('Failed to verify auth token:', error)
            this.clearAuth()
          }
        }
      }
      
      this.isLoading = false
    },

    async updateProfile(data: Partial<User>) {
      const config = useRuntimeConfig()
      
      try {
        const response = await $fetch<User>(`${config.public.apiBase}/me`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: data,
        })
        
        this.user = { ...this.user, ...response }
        this.updateActivity()
        return { success: true }
      } catch (error: any) {
        const message = error?.data?.message || 'Failed to update profile'
        return { success: false, error: message }
      }
    },

    async refreshUser() {
      if (!this.token) return
      
      try {
        const { fetchCurrentUser } = useApi()
        const user = await fetchCurrentUser()
        if (user) {
          this.user = user
          this.updateActivity()
        }
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    },

    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      
      try {
        const response = await $fetch<{ token: string; user?: User }>(`${config.public.apiBase}/login`, {
          method: 'POST',
          body: { email, password },
        })

        this.setToken(response.token)
        
        if (response.user) {
          this.setUser(response.user)
        } else {
          // Fetch user data if not returned with login
          const { fetchCurrentUser } = useApi()
          const user = await fetchCurrentUser()
          if (user) this.setUser(user)
        }

        return { success: true }
      } catch (error: any) {
        const message = error?.data?.message || 'Login failed. Please try again.'
        return { success: false, error: message }
      }
    },

    async register(email: string, password: string) {
      const config = useRuntimeConfig()
      
      try {
        // Extract fname from email (username part before @)
        const fname = email.split('@')[0]
        
        const response = await $fetch<{ token: string; message?: string }>(`${config.public.apiBase}/register`, {
          method: 'POST',
          body: { email, password, fname },
        })

        if (response.token) {
          this.setToken(response.token)
        }

        return { success: true, token: response.token }
      } catch (error: any) {
        const message = error?.data?.message || 'Registration failed. Please try again.'
        return { success: false, error: message }
      }
    },

    async logout() {
      const config = useRuntimeConfig()
      
      try {
        if (this.token) {
          await $fetch(`${config.public.apiBase}/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
        }
      } catch (error) {
        console.error('Logout API call failed:', error)
      } finally {
        this.clearAuth()
        navigateTo('/auth/login')
      }
    },
  },
})
