export interface Holiday {
  id: string
  summary: string
  description?: string
  start: {
    date: string
  }
  end: {
    date: string
  }
}

export const usePhilippineHolidays = () => {
  const config = useRuntimeConfig()
  const holidays = ref<Holiday[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchHolidays = async (year?: number) => {
    isLoading.value = true
    error.value = null

    const targetYear = year || new Date().getFullYear()

    try {
      // Fetch from Laravel backend API
      const response = await $fetch<{ success: boolean; holidays: Holiday[] }>(
        `${config.public.apiBase}/holidays`,
        {
          params: {
            year: targetYear,
          },
        }
      )

      holidays.value = response.holidays || []
      return holidays.value
    } catch (err: any) {
      console.error('Failed to fetch holidays:', err)
      error.value = err.message || 'Failed to fetch holidays'
      holidays.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getHolidaysForDate = (dateString: string): Holiday[] => {
    return holidays.value.filter(holiday => {
      return holiday.start.date === dateString
    })
  }

  const isHoliday = (dateString: string): boolean => {
    return getHolidaysForDate(dateString).length > 0
  }

  return {
    holidays: readonly(holidays),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchHolidays,
    getHolidaysForDate,
    isHoliday,
  }
}
