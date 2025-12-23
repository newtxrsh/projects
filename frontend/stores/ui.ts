import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light' | 'system'
export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

export interface ModalState {
  isOpen: boolean
  component: string | null
  props: Record<string, any>
  onClose?: () => void
}

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'danger' | 'warning' | 'info'
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
}

export interface UIState {
  // Sidebar
  sidebarState: SidebarState
  sidebarMobileOpen: boolean
  
  // Theme
  theme: ThemeMode
  
  // Modal
  modal: ModalState
  
  // Confirm dialog
  confirmDialog: ConfirmDialogState
  
  // Global loading
  globalLoading: boolean
  globalLoadingMessage: string
  
  // Command palette
  commandPaletteOpen: boolean
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean
  
  // View preferences
  boardView: 'kanban' | 'list' | 'table'
  calendarView: 'month' | 'week' | 'day'
  
  // Filters persistence
  lastBoardFilter: string
  lastProjectFilter: string
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    // Sidebar
    sidebarState: 'expanded',
    sidebarMobileOpen: false,
    
    // Theme
    theme: 'dark',
    
    // Modal
    modal: {
      isOpen: false,
      component: null,
      props: {},
      onClose: undefined,
    },
    
    // Confirm dialog
    confirmDialog: {
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'info',
      onConfirm: null,
      onCancel: null,
    },
    
    // Global loading
    globalLoading: false,
    globalLoadingMessage: '',
    
    // Command palette
    commandPaletteOpen: false,
    
    // Keyboard shortcuts
    keyboardShortcutsEnabled: true,
    
    // View preferences
    boardView: 'kanban',
    calendarView: 'month',
    
    // Filters persistence
    lastBoardFilter: 'all',
    lastProjectFilter: 'all',
  }),

  getters: {
    isSidebarExpanded: (state) => state.sidebarState === 'expanded',
    isSidebarCollapsed: (state) => state.sidebarState === 'collapsed',
    isSidebarHidden: (state) => state.sidebarState === 'hidden',
    isDarkMode: (state) => {
      if (state.theme === 'system') {
        if (import.meta.client) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return true // default to dark on server
      }
      return state.theme === 'dark'
    },
    isLightMode(): boolean {
      return !this.isDarkMode
    },
  },

  actions: {
    // Sidebar actions
    toggleSidebar() {
      if (this.sidebarState === 'expanded') {
        this.sidebarState = 'collapsed'
      } else {
        this.sidebarState = 'expanded'
      }
      this.persistPreferences()
    },

    setSidebarState(state: SidebarState) {
      this.sidebarState = state
      this.persistPreferences()
    },

    toggleMobileSidebar() {
      this.sidebarMobileOpen = !this.sidebarMobileOpen
    },

    closeMobileSidebar() {
      this.sidebarMobileOpen = false
    },

    // Theme actions
    setTheme(theme: ThemeMode) {
      this.theme = theme
      this.applyTheme()
      this.persistPreferences()
    },

    toggleTheme() {
      if (this.theme === 'dark') {
        this.setTheme('light')
      } else {
        this.setTheme('dark')
      }
    },

    applyTheme() {
      if (!import.meta.client) return
      
      const isDark = this.isDarkMode
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.classList.toggle('light', !isDark)
    },

    // Modal actions
    openModal(component: string, props: Record<string, any> = {}, onClose?: () => void) {
      this.modal = {
        isOpen: true,
        component,
        props,
        onClose,
      }
    },

    closeModal() {
      if (this.modal.onClose) {
        this.modal.onClose()
      }
      this.modal = {
        isOpen: false,
        component: null,
        props: {},
        onClose: undefined,
      }
    },

    // Confirm dialog actions
    showConfirm(options: {
      title: string
      message: string
      confirmText?: string
      cancelText?: string
      variant?: 'danger' | 'warning' | 'info'
      onConfirm?: () => void
      onCancel?: () => void
    }): Promise<boolean> {
      return new Promise((resolve) => {
        this.confirmDialog = {
          isOpen: true,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          variant: options.variant || 'info',
          onConfirm: () => {
            options.onConfirm?.()
            resolve(true)
            this.closeConfirm()
          },
          onCancel: () => {
            options.onCancel?.()
            resolve(false)
            this.closeConfirm()
          },
        }
      })
    },

    closeConfirm() {
      this.confirmDialog = {
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'info',
        onConfirm: null,
        onCancel: null,
      }
    },

    // Global loading actions
    showGlobalLoading(message = 'Loading...') {
      this.globalLoading = true
      this.globalLoadingMessage = message
    },

    hideGlobalLoading() {
      this.globalLoading = false
      this.globalLoadingMessage = ''
    },

    // Command palette
    toggleCommandPalette() {
      this.commandPaletteOpen = !this.commandPaletteOpen
    },

    openCommandPalette() {
      this.commandPaletteOpen = true
    },

    closeCommandPalette() {
      this.commandPaletteOpen = false
    },

    // View preferences
    setBoardView(view: 'kanban' | 'list' | 'table') {
      this.boardView = view
      this.persistPreferences()
    },

    setCalendarView(view: 'month' | 'week' | 'day') {
      this.calendarView = view
      this.persistPreferences()
    },

    // Filter persistence
    setLastBoardFilter(filter: string) {
      this.lastBoardFilter = filter
      this.persistPreferences()
    },

    setLastProjectFilter(filter: string) {
      this.lastProjectFilter = filter
      this.persistPreferences()
    },

    // Persistence
    persistPreferences() {
      if (!import.meta.client) return
      
      const preferences = {
        sidebarState: this.sidebarState,
        theme: this.theme,
        boardView: this.boardView,
        calendarView: this.calendarView,
        lastBoardFilter: this.lastBoardFilter,
        lastProjectFilter: this.lastProjectFilter,
        keyboardShortcutsEnabled: this.keyboardShortcutsEnabled,
      }
      
      localStorage.setItem('ui_preferences', JSON.stringify(preferences))
    },

    loadPreferences() {
      if (!import.meta.client) return
      
      const stored = localStorage.getItem('ui_preferences')
      if (stored) {
        try {
          const preferences = JSON.parse(stored)
          this.sidebarState = preferences.sidebarState || 'expanded'
          this.theme = preferences.theme || 'dark'
          this.boardView = preferences.boardView || 'kanban'
          this.calendarView = preferences.calendarView || 'month'
          this.lastBoardFilter = preferences.lastBoardFilter || 'all'
          this.lastProjectFilter = preferences.lastProjectFilter || 'all'
          this.keyboardShortcutsEnabled = preferences.keyboardShortcutsEnabled ?? true
        } catch (e) {
          console.error('Failed to load UI preferences:', e)
        }
      }
      
      this.applyTheme()
    },

    // Initialize
    initialize() {
      this.loadPreferences()
      
      // Listen for system theme changes
      if (import.meta.client && this.theme === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          this.applyTheme()
        })
      }
    },
  },
})
