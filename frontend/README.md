# Task Manager - Nuxt.js Frontend

This is the Vue.js/Nuxt.js frontend for the Task Manager application, migrated from the original Laravel Blade/Alpine.js implementation.

## Tech Stack

- **Framework**: Nuxt.js 3
- **UI Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Build Tool**: Vite (via Nuxt)

## Project Structure

```
frontend/
├── assets/
│   └── css/
│       └── main.css          # Global styles with Tailwind
├── components/
│   ├── board/
│   │   ├── KanbanColumn.vue  # Kanban board column
│   │   ├── TaskCard.vue      # Task card component
│   │   └── TaskModal.vue     # Task details modal
│   └── layout/
│       └── TheSidebar.vue    # Main navigation sidebar
├── composables/
│   └── useApi.ts             # API composable for backend communication
├── layouts/
│   ├── auth.vue              # Layout for auth pages (no sidebar)
│   └── default.vue           # Default layout with sidebar
├── middleware/
│   └── auth.global.ts        # Global auth middleware
├── pages/
│   ├── auth/
│   │   ├── login.vue         # Login page
│   │   ├── register.vue      # Registration page
│   │   └── verification-success.vue  # Success page after registration
│   ├── calendar.vue          # Calendar view
│   ├── create.vue            # Create task page
│   ├── index.vue             # Main board page (Kanban)
│   └── projects.vue          # Projects list page
├── stores/
│   └── auth.ts               # Pinia auth store
├── .env.example              # Environment variables example
├── nuxt.config.ts            # Nuxt configuration
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Laravel backend running (default: http://localhost:8000)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Laravel API URL:
   ```env
   NUXT_PUBLIC_API_BASE=http://localhost:8000/api
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:analyze` | Build with bundle analyzer |
| `npm run generate` | Generate static site |
| `npm run preview` | Preview production build locally |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build cache |
| `npm run clean:all` | Clean everything and reinstall |

## Deployment

### Option 1: Node.js Server (Recommended)

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   node .output/server/index.mjs
   ```

3. The app will run on port 3000 by default. Use a reverse proxy (nginx, caddy) to expose it.

### Option 2: Static Generation (SSG)

For static hosting (Netlify, Vercel, GitHub Pages):

1. Generate static files:
   ```bash
   npm run generate
   ```

2. Deploy the `.output/public` directory to your static host.

### Option 3: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

Build and run:
```bash
docker build -t task-manager-frontend .
docker run -p 3000:3000 -e NUXT_PUBLIC_API_BASE=https://api.example.com task-manager-frontend
```

### Environment Variables for Production

Set these in your deployment environment:

```env
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://your-api-domain.com/api
```

## API Integration

The frontend communicates with the Laravel backend through the `/api` endpoints. The `useApi` composable provides methods for all API calls:

- `fetchCurrentUser()` - Get authenticated user
- `fetchTasks()` - Get all tasks
- `createTask(data)` - Create a new task
- `updateTask(id, data)` - Update a task
- `deleteTask(id)` - Delete a task
- `fetchProjects()` - Get all projects
- And more...

## Authentication

Authentication is handled via Laravel Sanctum tokens:

1. Tokens are stored in `localStorage` after login
2. The `auth.global.ts` middleware protects routes
3. The `useAuthStore` manages auth state globally

## Key Migrations from Laravel/Alpine.js

| Original (Alpine.js) | Vue.js Equivalent |
|---------------------|-------------------|
| `x-data` | `ref()`, `reactive()` |
| `x-show` | `v-show` |
| `x-if` | `v-if` |
| `x-model` | `v-model` |
| `x-on:click` | `@click` |
| `x-bind:class` | `:class` |
| `$refs` | Template refs |
| `x-transition` | Vue `<Transition>` |

## Laravel CORS Configuration

Make sure your Laravel `config/cors.php` allows requests from the Nuxt frontend:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE` | Laravel API base URL | `http://localhost:8000/api` |

## Future Improvements

- [ ] Add TypeScript interfaces for all API responses
- [ ] Implement drag-and-drop for Kanban board
- [ ] Add real-time updates with WebSockets
- [ ] Add offline support with service workers
- [ ] Implement dark/light theme toggle
- [ ] Add unit and e2e tests
