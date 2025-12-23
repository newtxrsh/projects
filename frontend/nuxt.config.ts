// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      appName: 'Listed',
      appDescription: 'A modern task management system to organize your work, personal, and school tasks.',
    },
  },

  // App configuration with enhanced SEO
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'Listed',
      titleTemplate: 'Listed',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern task management system to organize your work, personal, and school tasks efficiently.' },
        { name: 'format-detection', content: 'telephone=no' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Listed' },
        { property: 'og:title', content: 'Listed - Organize Your Tasks' },
        { property: 'og:description', content: 'A modern task management system to organize your work, personal, and school tasks efficiently.' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Listed' },
        { name: 'twitter:description', content: 'A modern task management system to organize your tasks efficiently.' },
        // Theme color
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2"><path d="M3 12h4l3-9 4 18 3-9h4" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false,
    typeCheck: false, // Disable runtime type checking (run npm run typecheck manually)
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  // Pinia configuration
  pinia: {
    storesDirs: ['./stores/**'],
  },

  // Component auto-import configuration
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false, // Don't prefix component names with folder path
      },
    ],
  },

  // Route rules for authentication
  routeRules: {
    '/': { ssr: false },
    '/board': { ssr: false },
    '/create': { ssr: false },
    '/projects': { ssr: false },
    '/calendar': { ssr: false },
    '/auth/**': { ssr: false },
  },

  // SSR configuration - disabled for SPA mode initially
  ssr: false,

  // Vite configuration for performance
  vite: {
    build: {
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'ui': ['@vueuse/core'],
          },
        },
      },
    },
  },

  // Experimental features for performance
  experimental: {
    // Enable payload extraction for smaller client bundles
    payloadExtraction: false,
  },

  // Nitro configuration
  nitro: {
    compressPublicAssets: true,
  },

  compatibilityDate: '2024-12-10',
})
