/**
 * Plugin to initialize stores on app load
 * Handles loading preferences from localStorage and setting up listeners
 */
export default defineNuxtPlugin(() => {
  // Only run on client
  if (!import.meta.client) return

  const uiStore = useUIStore()
  const authStore = useAuthStore()

  // Initialize UI preferences (theme, sidebar state, etc.)
  uiStore.initialize()

  // Initialize auth state (check for stored token)
  authStore.initializeAuth()

  // Set up keyboard shortcuts
  if (uiStore.keyboardShortcutsEnabled) {
    window.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        uiStore.toggleCommandPalette()
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        if (uiStore.commandPaletteOpen) {
          uiStore.closeCommandPalette()
        } else if (uiStore.modal.isOpen) {
          uiStore.closeModal()
        } else if (uiStore.confirmDialog.isOpen) {
          uiStore.confirmDialog.onCancel?.()
        }
      }
    })
  }

  // Update activity on user interaction to prevent session timeout
  const updateActivity = () => {
    if (authStore.isAuthenticated) {
      authStore.updateActivity()
    }
  }

  // Throttle activity updates to every 5 minutes
  let lastUpdate = 0
  const throttledUpdate = () => {
    const now = Date.now()
    if (now - lastUpdate > 5 * 60 * 1000) {
      lastUpdate = now
      updateActivity()
    }
  }

  window.addEventListener('click', throttledUpdate)
  window.addEventListener('keypress', throttledUpdate)
  window.addEventListener('scroll', throttledUpdate)
})
