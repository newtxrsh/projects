/**
 * useConfirm - Composable for confirmation dialogs
 * 
 * Provides an easy way to show confirmation dialogs using the UI store.
 * Returns a Promise that resolves with the user's choice.
 * 
 * @example
 * const { confirm, confirmDanger } = useConfirm()
 * 
 * const shouldDelete = await confirmDanger({
 *   title: 'Delete Task',
 *   message: 'Are you sure you want to delete this task?'
 * })
 * 
 * if (shouldDelete) {
 *   await deleteTask(id)
 * }
 */

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function useConfirm() {
  const uiStore = useUIStore()

  /**
   * Show a standard confirmation dialog
   */
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return uiStore.showConfirm({
      ...options,
      variant: 'info',
    })
  }

  /**
   * Show a warning confirmation dialog
   */
  const confirmWarning = (options: ConfirmOptions): Promise<boolean> => {
    return uiStore.showConfirm({
      ...options,
      variant: 'warning',
      confirmText: options.confirmText || 'Proceed',
    })
  }

  /**
   * Show a danger/destructive confirmation dialog
   */
  const confirmDanger = (options: ConfirmOptions): Promise<boolean> => {
    return uiStore.showConfirm({
      ...options,
      variant: 'danger',
      confirmText: options.confirmText || 'Delete',
    })
  }

  return {
    confirm,
    confirmWarning,
    confirmDanger,
  }
}
