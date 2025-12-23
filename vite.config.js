import { defineConfig } from "vite"
import laravel from "laravel-vite-plugin"

export default defineConfig({
  plugins: [
    laravel({
      input: [
        "resources/css/app.css", 
        "resources/js/app.js",
        "resources/css/sidebar.css",
        "resources/js/sidebar.js",
        "resources/css/board.css",
        "resources/js/board.js",
        "resources/css/create.css",
        "resources/js/create.js",
        "resources/css/projects.css",
        "resources/js/projects.js",
        "resources/css/calendar.css",
        "resources/js/calendar.js",
        "resources/css/auth/login.css",
        "resources/js/auth/login.js",
        "resources/css/auth/register.css",
        "resources/js/auth/register.js",
        "resources/css/auth/verification-success.css",
        "resources/js/auth/verification-success.js"
      ],
      refresh: true,
    }),
  ],
})
