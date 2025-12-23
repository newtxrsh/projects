/**
 * useKeyboardShortcuts - Composable for managing keyboard shortcuts
 * 
 * Provides a way to register and unregister keyboard shortcuts with
 * automatic cleanup on component unmount.
 * 
 * @example
 * const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts()
 * 
 * registerShortcut({
 *   key: 'k',
 *   ctrl: true,
 *   handler: () => openSearch(),
 *   description: 'Open search'
 * })
 */

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  handler: (event: KeyboardEvent) => void
  description?: string
  preventDefault?: boolean
}

interface ShortcutMap {
  [key: string]: KeyboardShortcut
}

export function useKeyboardShortcuts() {
  const shortcuts = ref<ShortcutMap>({})
  const uiStore = useUIStore()

  const getShortcutKey = (shortcut: Omit<KeyboardShortcut, 'handler' | 'description'>): string => {
    const parts = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.shift) parts.push('shift')
    if (shortcut.meta) parts.push('meta')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
    const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey)
    const altMatches = !!shortcut.alt === event.altKey
    const shiftMatches = !!shortcut.shift === event.shiftKey

    return keyMatches && ctrlMatches && altMatches && shiftMatches
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Skip if keyboard shortcuts are disabled
    if (!uiStore.keyboardShortcutsEnabled) return

    // Skip if user is typing in an input field
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow escape key even in input fields
      if (event.key !== 'Escape') return
    }

    for (const shortcut of Object.values(shortcuts.value)) {
      if (matchesShortcut(event, shortcut)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.handler(event)
        break
      }
    }
  }

  const registerShortcut = (shortcut: KeyboardShortcut): string => {
    const key = getShortcutKey(shortcut)
    shortcuts.value[key] = shortcut
    return key
  }

  const unregisterShortcut = (key: string) => {
    delete shortcuts.value[key]
  }

  const getRegisteredShortcuts = (): KeyboardShortcut[] => {
    return Object.values(shortcuts.value)
  }

  // Register global listener
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    registerShortcut,
    unregisterShortcut,
    getRegisteredShortcuts,
    shortcuts: readonly(shortcuts),
  }
}

/**
 * useGlobalShortcuts - Preset global shortcuts for the app
 * 
 * Call this in app.vue or a layout component to enable default shortcuts
 */
export function useGlobalShortcuts() {
  const { registerShortcut } = useKeyboardShortcuts()
  const uiStore = useUIStore()
  const router = useRouter()

  onMounted(() => {
    // Command palette: Ctrl/Cmd + K
    registerShortcut({
      key: 'k',
      ctrl: true,
      handler: () => uiStore.toggleCommandPalette(),
      description: 'Open command palette',
    })

    // Close modals: Escape
    registerShortcut({
      key: 'Escape',
      handler: () => {
        if (uiStore.commandPaletteOpen) {
          uiStore.closeCommandPalette()
        } else if (uiStore.modal.isOpen) {
          uiStore.closeModal()
        } else if (uiStore.confirmDialog.isOpen) {
          uiStore.confirmDialog.onCancel?.()
        }
      },
      description: 'Close modal/dialog',
      preventDefault: false,
    })

    // Navigation shortcuts
    registerShortcut({
      key: 'h',
      alt: true,
      handler: () => router.push('/'),
      description: 'Go to board',
    })

    registerShortcut({
      key: 'p',
      alt: true,
      handler: () => router.push('/projects'),
      description: 'Go to projects',
    })

    registerShortcut({
      key: 'c',
      alt: true,
      handler: () => router.push('/calendar'),
      description: 'Go to calendar',
    })

    registerShortcut({
      key: 'n',
      alt: true,
      handler: () => router.push('/create'),
      description: 'Create new task',
    })

    // Toggle sidebar: Ctrl/Cmd + B
    registerShortcut({
      key: 'b',
      ctrl: true,
      handler: () => uiStore.toggleSidebar(),
      description: 'Toggle sidebar',
    })

    // Toggle theme: Ctrl/Cmd + Shift + D
    registerShortcut({
      key: 'd',
      ctrl: true,
      shift: true,
      handler: () => uiStore.toggleTheme(),
      description: 'Toggle dark/light mode',
    })
  })
}
