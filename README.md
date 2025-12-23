<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Listed-3B82F6?style=for-the-badge&labelColor=1e293b&color=3B82F6">
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/Listed-3B82F6?style=for-the-badge&labelColor=f1f5f9&color=3B82F6">
    <img alt="Listed Logo" src="https://img.shields.io/badge/Listed-3B82F6?style=for-the-badge&labelColor=1e293b&color=3B82F6" height="60">
  </picture>
</p>

<h1 align="center">Listed - Task Management System</h1>

<p align="center">
  <strong>A modern, collaborative task management application for personal and team productivity</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel"/>
  <img src="https://img.shields.io/badge/Nuxt-3.14-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt"/>
  <img src="https://img.shields.io/badge/Vue-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
</p>

---

## 📖 Project Description

**Listed** is a full-stack collaborative task management application designed for individuals and teams to organize, track, and complete their work efficiently. The application provides an intuitive Kanban-style interface for visual task organization, enabling users to seamlessly manage personal tasks and collaborative projects.

Built with a modern tech stack featuring **Laravel 11** on the backend and **Nuxt 3/Vue 3** on the frontend, Listed offers a responsive, real-time experience with robust authentication, file management integration with Google Drive, and comprehensive notification systems.

Whether you're managing school assignments, work projects, or personal to-dos, Listed helps you stay organized and productive with a beautiful, user-friendly interface.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **Kanban Board** | Visual task organization with intuitive drag-and-drop status updates across To Do, Ongoing, and Completed columns |
| 👥 **Task Collaboration** | Invite users to collaborate on tasks and projects with real-time activity tracking |
| ✅ **Subtasks** | Break down complex tasks into smaller, actionable items with individual status tracking |
| 📎 **File Attachments** | Upload files from local storage or directly from Google Drive using the Google Picker API |
| 📅 **Calendar View** | Monthly calendar displaying task due dates alongside Philippine holidays |
| 📊 **Activity Logs** | Comprehensive activity tracking for collaborative projects showing status changes and updates |
| 🔔 **Smart Notifications** | In-app and email notifications for task due dates, overdue reminders, and collaborator additions |
| 🔐 **Google OAuth** | Seamless login with Google account alongside traditional email/password authentication |
| 🏷️ **Task Categories** | Organize tasks by category: School, Work, or Personal |
| 📱 **Responsive Design** | Fully responsive interface that works seamlessly across desktop and mobile devices |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.2+ | Server-side programming language |
| **Laravel** | 12.0 | Backend framework for API development |
| **Laravel Sanctum** | 4.2 | Token-based API authentication |
| **Laravel Socialite** | 5.23 | OAuth authentication (Google Login) |
| **MySQL** | 8.0 | Relational database management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt** | 3.14 | Vue.js meta-framework for SSR/SSG |
| **Vue** | 3.4 | Progressive JavaScript framework |
| **Pinia** | 2.1 | State management for Vue |
| **TailwindCSS** | 3.4 | Utility-first CSS framework |
| **TypeScript** | 5.3 | Type-safe JavaScript |

### External APIs & Services
| Service | Purpose |
|---------|---------|
| **Google OAuth API** | User authentication via Google |
| **Google Drive API** | File picker and attachment integration |
| **Google Calendar API** | Philippine holidays data |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Vite** | Frontend build tool and dev server |
| **Prettier** | Code formatting |
| **ESLint** | Code linting and quality |
| **PHPUnit** | Backend testing |

---

## 🚀 Installation & Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **npm** >= 9.0
- **MySQL** >= 8.0

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ITE18_webapp/app
```

### Step 2: Backend Setup (Laravel)

1. **Install PHP dependencies:**
   ```bash
   composer install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your database and API credentials:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=listed_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

   # Google Drive API
   GOOGLE_DRIVE_API_KEY=your_api_key
   GOOGLE_DRIVE_APP_ID=your_app_id
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Run database migrations:**
   ```bash
   php artisan migrate
   ```

6. **Create storage link:**
   ```bash
   php artisan storage:link
   ```

### Step 3: Frontend Setup (Nuxt)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure frontend environment:**
   ```bash
   cp .env.example .env
   ```

4. **Update frontend `.env`:**
   ```env
   NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

### Step 4: Run the Application

**Option A: Run both servers manually**

Terminal 1 - Backend:
```bash
php artisan serve
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option B: Use the Composer dev script (recommended)**

From the project root:
```bash
composer dev
```

This will concurrently start the Laravel server, queue worker, Pail logs, and Vite dev server.

### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

---

## 📁 Project Structure

```
app/
├── app/                    # Laravel application code
│   ├── Console/            # Artisan commands
│   ├── Http/
│   │   ├── Controllers/    # API & Web controllers
│   │   └── Middleware/     # Request middleware
│   ├── Mail/               # Email classes
│   └── Models/             # Eloquent models
├── config/                 # Laravel configuration
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── frontend/               # Nuxt 3 frontend application
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── layouts/            # Page layouts
│   ├── middleware/         # Route middleware
│   ├── pages/              # Application pages
│   ├── plugins/            # Nuxt plugins
│   ├── stores/             # Pinia stores
│   └── types/              # TypeScript types
├── routes/                 # Laravel routes
│   ├── api.php             # API routes
│   └── web.php             # Web routes
└── storage/                # File storage
```

---

## 📚 Documentation

For detailed system documentation, please refer to:

- **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)** - Complete system documentation including architecture, authentication flows, and API details
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints reference

---

## 📝 License

This project is developed for educational purposes as part of the ITE18 course.

---