// Composable for easy toast notifications
export const useToast = () => {
  const toastStore = useToastStore()

  return {
    success: (title: string, message?: string) => toastStore.success(title, message),
    error: (title: string, message?: string) => toastStore.error(title, message),
    warning: (title: string, message?: string) => toastStore.warning(title, message),
    info: (title: string, message?: string) => toastStore.info(title, message),
    dismiss: (id: string) => toastStore.dismiss(id),
    clear: () => toastStore.clear(),
  }
}
