// Composable for enhanced routing utilities
export const useRouting = () => {
  const route = useRoute()
  const router = useRouter()

  // Navigate while preserving or merging query parameters
  const navigateWithQuery = (
    path: string,
    query?: Record<string, string | number | undefined>,
    options?: { replace?: boolean; preserveQuery?: boolean }
  ) => {
    const newQuery = options?.preserveQuery
      ? { ...route.query, ...query }
      : query

    // Filter out undefined values
    const cleanQuery: Record<string, string> = {}
    if (newQuery) {
      for (const [key, value] of Object.entries(newQuery)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanQuery[key] = String(value)
        }
      }
    }

    if (options?.replace) {
      router.replace({ path, query: cleanQuery })
    } else {
      router.push({ path, query: cleanQuery })
    }
  }

  // Update query parameters without navigation
  const updateQuery = (
    query: Record<string, string | number | undefined>,
    options?: { replace?: boolean }
  ) => {
    const newQuery = { ...route.query, ...query }

    // Filter out undefined values
    const cleanQuery: Record<string, string> = {}
    for (const [key, value] of Object.entries(newQuery)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanQuery[key] = String(value)
      }
    }

    if (options?.replace) {
      router.replace({ query: cleanQuery })
    } else {
      router.push({ query: cleanQuery })
    }
  }

  // Remove specific query parameters
  const removeQueryParams = (...keys: string[]) => {
    const newQuery = { ...route.query }
    for (const key of keys) {
      delete newQuery[key]
    }
    router.replace({ query: newQuery })
  }

  // Get typed query parameter
  const getQueryParam = <T extends string | number>(
    key: string,
    defaultValue?: T
  ): T | undefined => {
    const value = route.query[key]
    if (value === undefined || value === null) return defaultValue
    return (typeof defaultValue === 'number' ? Number(value) : String(value)) as T
  }

  // Check if a specific route is active
  const isRouteActive = (path: string, exact = false) => {
    if (exact) {
      return route.path === path
    }
    return route.path.startsWith(path)
  }

  // Navigate back or to fallback
  const goBackOrFallback = (fallback = '/') => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return {
    route,
    router,
    navigateWithQuery,
    updateQuery,
    removeQueryParams,
    getQueryParam,
    isRouteActive,
    goBackOrFallback,
  }
}
