import { defineStore } from 'pinia'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
}

export interface ToastState {
  toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: [],
  }),

  actions: {
    show(toast: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        duration: 5000,
        dismissible: true,
        ...toast,
      }

      this.toasts.push(newToast)

      // Auto-dismiss after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          this.dismiss(id)
        }, newToast.duration)
      }

      return id
    },

    success(title: string, message?: string) {
      return this.show({ type: 'success', title, message })
    },

    error(title: string, message?: string) {
      return this.show({ type: 'error', title, message, duration: 8000 })
    },

    warning(title: string, message?: string) {
      return this.show({ type: 'warning', title, message })
    },

    info(title: string, message?: string) {
      return this.show({ type: 'info', title, message })
    },

    dismiss(id: string) {
      const index = this.toasts.findIndex((t) => t.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    clear() {
      this.toasts = []
    },
  },
})
