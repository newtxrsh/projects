/**
 * Google Picker API composable for selecting files from Google Drive
 */

interface GooglePickerFile {
  id: string
  name: string
  mimeType: string
  url: string
  sizeBytes?: number
  iconUrl?: string
}

interface UseGooglePickerOptions {
  onSelect?: (file: GooglePickerFile) => void
  onCancel?: () => void
  onError?: (error: Error) => void
}

// Google API types
declare global {
  interface Window {
    gapi: any
    google: any
  }
}

export const useGooglePicker = (options: UseGooglePickerOptions = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  const isLoading = ref(false)
  const isPickerReady = ref(false)
  const selectedFile = ref<GooglePickerFile | null>(null)
  const error = ref<string | null>(null)
  const accessToken = ref<string | null>(null)
  
  // Google API configuration
  const clientId = ref('')
  const apiKey = ref('')
  const appId = ref('')
  
  let pickerApiLoaded = false
  let oauthToken: string | null = null

  /**
   * Load Google API config from backend
   */
  const loadConfig = async () => {
    try {
      const response = await $fetch<{ clientId: string; developerKey: string; appId: string }>(
        `${config.public.apiBase}/google-drive/config`
      )
      clientId.value = response.clientId
      apiKey.value = response.developerKey
      appId.value = response.appId
    } catch (err) {
      console.error('Failed to load Google Drive config:', err)
    }
  }

  /**
   * Load the Google API scripts
   */
  const loadGoogleApis = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Load Google API script
      if (window.gapi && window.google) {
        resolve()
        return
      }

      const gapiScript = document.createElement('script')
      gapiScript.src = 'https://apis.google.com/js/api.js'
      gapiScript.async = true
      gapiScript.defer = true
      
      const gsiScript = document.createElement('script')
      gsiScript.src = 'https://accounts.google.com/gsi/client'
      gsiScript.async = true
      gsiScript.defer = true

      let gapiLoaded = false
      let gsiLoaded = false

      const checkBothLoaded = () => {
        if (gapiLoaded && gsiLoaded) {
          resolve()
        }
      }

      gapiScript.onload = () => {
        gapiLoaded = true
        checkBothLoaded()
      }
      
      gsiScript.onload = () => {
        gsiLoaded = true
        checkBothLoaded()
      }

      gapiScript.onerror = () => reject(new Error('Failed to load Google API'))
      gsiScript.onerror = () => reject(new Error('Failed to load Google Identity Services'))

      document.head.appendChild(gapiScript)
      document.head.appendChild(gsiScript)
    })
  }

  /**
   * Initialize the Picker API
   */
  const initializePicker = async () => {
    if (!window.gapi) {
      throw new Error('Google API not loaded')
    }

    return new Promise<void>((resolve, reject) => {
      window.gapi.load('picker', {
        callback: () => {
          pickerApiLoaded = true
          isPickerReady.value = true
          resolve()
        },
        onerror: () => reject(new Error('Failed to load Picker API')),
      })
    })
  }

  /**
   * Get OAuth token using Google Identity Services
   */
  const getOAuthToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!clientId.value) {
        reject(new Error('Google Client ID not configured'))
        return
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.value,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }
          oauthToken = response.access_token
          accessToken.value = response.access_token
          resolve(response.access_token)
        },
        error_callback: (error: any) => {
          // Handle errors including user cancellation
          reject(new Error(error.type || 'Authentication cancelled'))
        },
      })

      tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  /**
   * Create and show the Google Picker
   */
  const createPicker = (token: string) => {
    if (!window.google?.picker) {
      throw new Error('Google Picker not loaded')
    }

    // Create a view that only shows files owned by the user in My Drive
    const view = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setOwnedByMe(true) // Only show files owned by the user

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setDeveloperKey(apiKey.value)
      .setAppId(appId.value)
      .setOAuthToken(token)
      .addView(view)
      .addView(new window.google.picker.DocsUploadView())
      .setCallback(pickerCallback)
      .build()

    picker.setVisible(true)
  }

  /**
   * Handle picker selection callback
   */
  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const doc = data.docs[0]
      
      const file: GooglePickerFile = {
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        url: doc.url,
        sizeBytes: doc.sizeBytes,
        iconUrl: doc.iconUrl,
      }
      
      selectedFile.value = file
      options.onSelect?.(file)
    } else if (data.action === window.google.picker.Action.CANCEL) {
      options.onCancel?.()
    }
    
    isLoading.value = false
  }

  /**
   * Open the Google Drive Picker
   */
  const openPicker = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Load config if not already loaded
      if (!clientId.value) {
        await loadConfig()
      }

      // Load Google APIs if not already loaded
      await loadGoogleApis()

      // Initialize Picker API if not already done
      if (!pickerApiLoaded) {
        await initializePicker()
      }

      // Get OAuth token
      const token = await getOAuthToken()

      // Create and show picker
      createPicker(token)
    } catch (err: any) {
      console.error('Error opening Google Picker:', err)
      error.value = err.message || 'Failed to open Google Drive picker'
      isLoading.value = false
      options.onError?.(err)
    }
  }

  /**
   * Download selected file from Google Drive to server storage
   */
  const downloadToServer = async (file: GooglePickerFile): Promise<{ path: string; fileName: string; url: string } | null> => {
    if (!oauthToken) {
      throw new Error('No OAuth token available')
    }

    try {
      const response = await $fetch<{ success: boolean; path: string; fileName: string; url: string }>(
        `${config.public.apiBase}/google-drive/download`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
          body: {
            fileId: file.id,
            fileName: file.name,
            mimeType: file.mimeType,
            accessToken: oauthToken,
          },
        }
      )

      if (response.success) {
        return {
          path: response.path,
          fileName: response.fileName,
          url: response.url,
        }
      }
      
      return null
    } catch (err) {
      console.error('Failed to download file from Google Drive:', err)
      throw err
    }
  }

  return {
    isLoading,
    isPickerReady,
    selectedFile,
    error,
    accessToken,
    openPicker,
    downloadToServer,
  }
}
