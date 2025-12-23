# 📋 Listed - Complete System Documentation

> **Project Name:** Listed - Task Management System  
> **Tech Stack:** Laravel 11 (Backend) + Nuxt 3/Vue 3 (Frontend)  
> **Last Updated:** December 2, 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Flow](#2-architecture-flow)
3. [Authentication System](#3-authentication-system)
4. [Backend (Laravel)](#4-backend-laravel)
   - [API Routes](#41-api-routes)
   - [Web Routes](#42-web-routes)
   - [Controllers](#43-controllers)
   - [Models](#44-models)
   - [Middleware](#45-middleware)
   - [Mail Classes](#46-mail-classes)
   - [Console Commands](#47-console-commands)
5. [Frontend (Nuxt/Vue)](#5-frontend-nuxtvue)
   - [Pages/Routes](#51-pagesroutes)
   - [Stores (Pinia)](#52-stores-pinia)
   - [Composables](#53-composables)
   - [Middleware](#54-middleware)
   - [Layouts](#55-layouts)
   - [Key Components](#56-key-components)
6. [Google API Integrations](#6-google-api-integrations)
7. [Database Schema](#7-database-schema)
8. [Data Flow & Business Logic](#8-data-flow--business-logic)
9. [Configuration Files](#9-configuration-files)

---

## 1. System Overview

**Listed** is a collaborative task management application that allows users to:

- Create and manage personal tasks and collaborative projects
- Organize tasks in a Kanban board (To Do, Ongoing, Completed)
- Add collaborators to tasks for team projects
- Attach files from local storage or Google Drive
- View tasks in a calendar with Philippine holidays
- Receive notifications (in-app and email) for task updates and due dates
- Track activity logs for collaborative projects

### Key Features

| Feature | Description |
|---------|-------------|
| **Kanban Board** | Visual task organization with drag-and-drop status updates |
| **Task Collaboration** | Invite users to collaborate on tasks |
| **Subtasks** | Break down tasks into smaller actionable items |
| **File Attachments** | Upload files locally or from Google Drive |
| **Calendar View** | Monthly calendar with due dates and holidays |
| **Activity Logs** | Track changes on collaborative projects |
| **Notifications** | In-app and email notifications for due dates and collaborator additions |
| **Google OAuth** | Login with Google account |

---

## 2. Architecture Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                │
│                         http://localhost:3000                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│    ┌─────────────────────────────────────────────────────────────────┐   │
│    │                     NUXT 3 FRONTEND                              │   │
│    ├──────────────┬──────────────┬──────────────┬────────────────────┤   │
│    │    Pages     │    Stores    │  Composables │    Components      │   │
│    │  (Routing)   │   (Pinia)    │   (Logic)    │      (UI)          │   │
│    └──────────────┴──────────────┴──────────────┴────────────────────┘   │
│                                   │                                       │
│                                   │ HTTP Requests                         │
│                                   │ Authorization: Bearer {token}         │
│                                   ▼                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ CORS Enabled
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        LARAVEL 11 BACKEND                                 │
│                       http://localhost:8000                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│    ┌─────────────────────────────────────────────────────────────────┐   │
│    │                         ROUTING                                  │   │
│    │                   routes/api.php (REST API)                      │   │
│    │                   routes/web.php (OAuth callbacks)               │   │
│    └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                       │
│                                   ▼                                       │
│    ┌─────────────────────────────────────────────────────────────────┐   │
│    │                       MIDDLEWARE                                 │   │
│    │            auth:sanctum (Token Authentication)                   │   │
│    │            CheckUsers (JSON Response Headers)                    │   │
│    └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                       │
│                                   ▼                                       │
│    ┌─────────────────────────────────────────────────────────────────┐   │
│    │                      CONTROLLERS                                 │   │
│    │  AuthController │ TasksController │ GoogleDriveController │ ... │   │
│    └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                       │
│                                   ▼                                       │
│    ┌─────────────────────────────────────────────────────────────────┐   │
│    │                        MODELS                                    │   │
│    │   User │ Task │ Subtask │ TaskCollaborator │ Attachment │ ...   │   │
│    └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           MySQL DATABASE                                  │
│  ┌─────────┬─────────┬──────────┬───────────────────┬────────────────┐   │
│  │  users  │  tasks  │ subtasks │ task_collaborators│  attachments   │   │
│  ├─────────┴─────────┴──────────┴───────────────────┴────────────────┤   │
│  │ activity_logs │ notifications │ subtask_collaborators │ sessions  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Authentication System

### 3.1 Overview

The application uses **Laravel Sanctum** for API token-based authentication with support for:
1. **Email/Password Login** - Traditional credential-based authentication
2. **Google OAuth Login** - Social login via Google

### 3.2 Token Handling

#### Token Creation
- Tokens are created using Sanctum's `createToken('auth_token')` method
- Returns a plain text token that the client must store
- Tokens have no expiration (configured in `config/sanctum.php`)

#### Token Storage (Frontend)
```typescript
// frontend/stores/auth.ts
localStorage.setItem('auth_token', token)
localStorage.setItem('last_activity', timestamp)
```

#### Token Usage
- All protected API routes use `auth:sanctum` middleware
- Client sends token in `Authorization: Bearer {token}` header
- Stateful domains include `localhost:3000` for SPA authentication

#### Token Deletion
- On logout, the current token is deleted: `$request->user()->currentAccessToken()->delete()`

### 3.3 Regular Login Flow

**Files Involved:**
- Backend: [app/Http/Controllers/AuthController.php](app/Http/Controllers/AuthController.php)
- Frontend: [frontend/pages/auth/login.vue](frontend/pages/auth/login.vue)
- Store: [frontend/stores/auth.ts](frontend/stores/auth.ts)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User enters email/password on login page                              │
│    Frontend: pages/auth/login.vue                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Frontend POSTs to /api/login                                          │
│    Composable: composables/useApi.ts → apiFetch()                        │
│    Store: stores/auth.ts → login()                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Backend validates credentials                                         │
│    Controller: AuthController@login                                      │
│    - Finds user by email                                                 │
│    - Validates password with Hash::check()                               │
│    - Creates Sanctum token                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Backend returns JSON response                                         │
│    { token: "...", user: { user_id, fname, email } }                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Frontend stores token and user data                                   │
│    - localStorage.setItem('auth_token', token)                           │
│    - stores/auth.ts state updated                                        │
│    - Redirects to dashboard (/)                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Google OAuth Login Flow

**Files Involved:**
- Backend: [app/Http/Controllers/GoogleLoginController.php](app/Http/Controllers/GoogleLoginController.php)
- Frontend: [frontend/pages/auth/login.vue](frontend/pages/auth/login.vue)
- Callback: [frontend/pages/auth/callback.vue](frontend/pages/auth/callback.vue)
- Config: [config/services.php](config/services.php)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Continue with Google" button                             │
│    Frontend: pages/auth/login.vue                                        │
│    Link: {API_BASE}/auth/google                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Backend redirects to Google OAuth consent screen                      │
│    Controller: GoogleLoginController@redirectToGoogle                    │
│    Uses: Laravel Socialite                                               │
│    Scopes: openid, profile, email                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. User approves on Google, redirected to callback                       │
│    URL: /auth/google/callback                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. Backend processes Google callback                                     │
│    Controller: GoogleLoginController@handleGoogleCallback                │
│    - Gets user info from Google via Socialite                            │
│    - Finds or creates user in database                                   │
│    - Creates Sanctum token                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Backend redirects to frontend callback                                │
│    URL: {FRONTEND_URL}/auth/callback?token={token}&user_id={id}          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. Frontend callback page extracts and stores token                      │
│    Page: pages/auth/callback.vue                                         │
│    - Extracts token from URL query params                                │
│    - Stores in localStorage and auth store                               │
│    - Fetches user data via /api/me                                       │
│    - Redirects to dashboard (/)                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Session Management

**Frontend Session Timeout:**
- 30-minute inactivity timeout
- Tracked via `lastActivity` timestamp in auth store
- Activity updated on user interactions
- Expired sessions redirect to login

**File:** [frontend/stores/auth.ts](frontend/stores/auth.ts)

```typescript
// Session timeout check
const isSessionExpired = computed(() => {
  if (!lastActivity.value) return false
  const now = Date.now()
  return now - lastActivity.value > sessionTimeout.value
})
```

---

## 4. Backend (Laravel)

### 4.1 API Routes

**File:** [routes/api.php](routes/api.php)

#### Public Routes (No Authentication Required)

| Method | Endpoint | Controller | Method | Description |
|--------|----------|------------|--------|-------------|
| GET | `/api/ping` | Closure | - | Health check endpoint |
| POST | `/api/register` | `AuthController` | `register` | User registration |
| POST | `/api/login` | `AuthController` | `login` | User login |
| GET | `/api/google-drive/config` | `GoogleDriveController` | `getConfig` | Get Google API config for Picker |
| GET | `/api/attachments/{attachmentId}/file` | `AttachmentsController` | `show` | Download attachment file |
| GET | `/api/holidays` | `HolidaysController` | `index` | Get Philippine holidays |

#### Protected Routes (Requires `auth:sanctum`)

| Method | Endpoint | Controller | Method | Description |
|--------|----------|------------|--------|-------------|
| GET | `/api/me` | `AuthController` | `me` | Get authenticated user info |
| POST | `/api/logout` | `AuthController` | `logout` | Logout and delete token |
| GET | `/api/users` | `UsersController` | `apiIndex` | List all verified users |
| GET | `/api/users/check-user` | `UsersController` | `checkUser` | Check if user exists by email |
| GET | `/api/tasks` | `TasksController` | `apiIndex` | Get all user's tasks |
| POST | `/api/tasks` | `TasksController` | `store` | Create new task |
| PUT | `/api/tasks/{taskId}` | `TasksController` | `update` | Update task status |
| DELETE | `/api/tasks/{taskId}` | `TasksController` | `destroy` | Delete task |
| GET | `/api/projects` | `TasksController` | `projects` | Get collaborative projects |
| GET | `/api/activity-logs` | `ActivityLogsController` | `index` | Get activity logs |
| DELETE | `/api/activity-logs` | `ActivityLogsController` | `destroy` | Clear activity logs |
| GET | `/api/subtasks` | `SubtasksController` | `apiIndex` | Get subtasks |
| POST | `/api/subtasks` | `SubtasksController` | `store` | Create subtask |
| PUT | `/api/subtasks/{subtaskId}` | `SubtasksController` | `update` | Update subtask |
| GET | `/api/task-collaborators` | `TaskCollaboratorsController` | `apiIndex` | Get task collaborators |
| GET | `/api/attachments` | `AttachmentsController` | `apiIndex` | List attachments |
| GET | `/api/google-drive/token` | `GoogleDriveController` | `getPickerToken` | Get OAuth token for Picker |
| POST | `/api/google-drive/download` | `GoogleDriveController` | `downloadFile` | Download file from Google Drive |
| GET | `/api/notifications` | `NotificationsController` | `index` | Get user notifications |
| GET | `/api/notifications/unread-count` | `NotificationsController` | `unreadCount` | Count unread notifications |
| PUT | `/api/notifications/{id}/read` | `NotificationsController` | `markAsRead` | Mark notification as read |
| PUT | `/api/notifications/mark-all-read` | `NotificationsController` | `markAllAsRead` | Mark all as read |
| DELETE | `/api/notifications` | `NotificationsController` | `clearAll` | Delete all notifications |
| DELETE | `/api/notifications/{id}` | `NotificationsController` | `destroy` | Delete single notification |

### 4.2 Web Routes

**File:** [routes/web.php](routes/web.php)

| Method | Endpoint | Controller/View | Description |
|--------|----------|-----------------|-------------|
| GET | `/login` | View: `auth.login` | Login page |
| POST | `/login` | `AuthController@login` | Login form submission |
| GET | `/register` | View: `auth.register` | Registration page |
| POST | `/logout` | `AuthController@logout` | Logout (protected) |
| GET | `/verification-success` | View: `auth.verification-success` | Post-registration success |
| GET | `/auth/google` | `GoogleLoginController@redirectToGoogle` | Initiate Google OAuth |
| GET | `/auth/google/callback` | `GoogleLoginController@handleGoogleCallback` | Google OAuth callback |
| GET | `/auth/google-drive` | `GoogleDriveController@redirectToDriveAuth` | Initiate Google Drive OAuth |
| GET | `/api/google-drive/callback` | `GoogleDriveController@handleCallback` | Google Drive OAuth callback |
| GET | `/` | `BoardController@index` | Main board page |
| GET | `/board` | `BoardController@index` | Main board page |
| GET | `/create` | View: `create` | Task creation page |
| GET | `/projects` | View: `projects` | Projects page |
| GET | `/calendar` | View: `calendar` | Calendar page |

### 4.3 Controllers

#### AuthController
**File:** [app/Http/Controllers/AuthController.php](app/Http/Controllers/AuthController.php)

| Method | Description |
|--------|-------------|
| `register()` | Creates new user with hashed password, auto-verifies, generates Sanctum token |
| `login()` | Validates email/password, returns token and user data |
| `me()` | Returns authenticated user information |
| `logout()` | Deletes current access token |

**Logic Details:**
- Password is hashed using `bcrypt()` or `Hash::make()`
- User is created with `is_verified = true` (no email verification required)
- Token is created immediately upon registration/login

---

#### GoogleLoginController
**File:** [app/Http/Controllers/GoogleLoginController.php](app/Http/Controllers/GoogleLoginController.php)

| Method | Description |
|--------|-------------|
| `redirectToGoogle()` | Initiates Google OAuth flow using Laravel Socialite |
| `handleGoogleCallback()` | Processes callback, finds/creates user, issues token, redirects to frontend |

**Logic Details:**
- Uses Socialite's `stateless()` for API compatibility
- If user doesn't exist, creates new user with Google name and email
- Password is set to a random string for Google users
- Redirects to `{FRONTEND_URL}/auth/callback?token={token}&user_id={id}`

---

#### GoogleDriveController
**File:** [app/Http/Controllers/GoogleDriveController.php](app/Http/Controllers/GoogleDriveController.php)

| Method | Description |
|--------|-------------|
| `getConfig()` | Returns Google API client ID, developer key, and app ID for Google Picker |
| `redirectToDriveAuth()` | Initiates Google Drive OAuth with `drive.readonly` and `drive.file` scopes |
| `handleCallback()` | Exchanges OAuth code for access token, stores in session |
| `getPickerToken()` | Returns OAuth token for Google Picker from session |
| `downloadFile()` | Downloads file from Google Drive and stores locally |

**Logic Details:**
- Supports downloading Google Docs, Sheets, Slides as PDF/XLSX
- Non-Google files are downloaded directly via Drive API
- Files are stored in `storage/app/public/attachments/`

---

#### TasksController
**File:** [app/Http/Controllers/TasksController.php](app/Http/Controllers/TasksController.php)

| Method | Description |
|--------|-------------|
| `apiIndex()` | Get all tasks for authenticated user (via task_collaborators) |
| `store()` | Create task with collaborators, subtasks, attachments |
| `projects()` | Get tasks with >1 collaborator (collaborative projects) |
| `update()` | Update task status (logs activity for projects) |
| `destroy()` | Delete task (only creator can delete) |

**Logic Details:**
- Tasks are fetched based on `task_collaborators` relationship, not `user_id`
- Creating a task automatically adds creator as first collaborator
- Adding collaborators sends email notification via `CollaboratorAddedMail`
- Creates in-app notification for added collaborators
- Attachments can be from local upload or Google Drive
- Activity logging for status changes on collaborative tasks

---

#### SubtasksController
**File:** [app/Http/Controllers/SubtasksController.php](app/Http/Controllers/SubtasksController.php)

| Method | Description |
|--------|-------------|
| `apiIndex()` | Get subtasks filtered by task ownership |
| `store()` | Create subtask with optional collaborators |
| `update()` | Update subtask status/description, logs activity for project tasks |

**Logic Details:**
- Subtasks belong to a parent task
- Can have their own collaborators via `subtask_collaborators` table
- Status updates log activity if parent task has multiple collaborators

---

#### UsersController
**File:** [app/Http/Controllers/UsersController.php](app/Http/Controllers/UsersController.php)

| Method | Description |
|--------|-------------|
| `apiIndex()` | List all verified users (for collaborator selection dropdown) |
| `checkUser()` | Check if a user exists by email (validates collaborator before adding) |

---

#### AttachmentsController
**File:** [app/Http/Controllers/AttachmentsController.php](app/Http/Controllers/AttachmentsController.php)

| Method | Description |
|--------|-------------|
| `apiIndex()` | List all attachments |
| `show()` | Serve attachment file with proper MIME type |

---

#### ActivityLogsController
**File:** [app/Http/Controllers/ActivityLogsController.php](app/Http/Controllers/ActivityLogsController.php)

| Method | Description |
|--------|-------------|
| `index()` | Get activity logs for project tasks (>1 collaborator) |
| `destroy()` | Delete all activity logs for user's tasks |

---

#### NotificationsController
**File:** [app/Http/Controllers/NotificationsController.php](app/Http/Controllers/NotificationsController.php)

| Method | Description |
|--------|-------------|
| `index()` | Get user's notifications (limit 50, newest first) |
| `unreadCount()` | Count unread notifications |
| `markAsRead()` | Mark single notification as read |
| `markAllAsRead()` | Mark all notifications as read |
| `clearAll()` | Delete all notifications |
| `destroy()` | Delete single notification |

---

#### HolidaysController
**File:** [app/Http/Controllers/HolidaysController.php](app/Http/Controllers/HolidaysController.php)

| Method | Description |
|--------|-------------|
| `index()` | Fetches Philippine holidays from Google Calendar API, caches for 24 hours |

**Logic Details:**
- Uses Google Calendar API with public calendar ID
- Caches results to reduce API calls
- Returns holidays for current year

---

#### BoardController
**File:** [app/Http/Controllers/BoardController.php](app/Http/Controllers/BoardController.php)

| Method | Description |
|--------|-------------|
| `index()` | Renders the main board view (JavaScript handles auth via API) |

---

#### TaskCollaboratorsController
**File:** [app/Http/Controllers/TaskCollaboratorsController.php](app/Http/Controllers/TaskCollaboratorsController.php)

| Method | Description |
|--------|-------------|
| `apiIndex()` | List all task collaborators with user/task relations |

---

### 4.4 Models

#### User
**File:** [app/Models/User.php](app/Models/User.php)

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | PK | Primary key |
| `fname` | string | User's first name |
| `email` | string | Unique email address |
| `password` | string | Hashed password |
| `email_verified_at` | datetime | Verification timestamp |
| `email_verification_token` | string | Verification token (unused) |
| `is_verified` | boolean | Verification status |

**Traits:** `HasApiTokens`, `HasFactory`, `Notifiable`

**Relationships:**
- `hasMany(Task)` - Tasks created by user
- `hasMany(TaskCollaborator)` - Collaboration records

---

#### Task
**File:** [app/Models/Task.php](app/Models/Task.php)

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | PK | Primary key |
| `user_id` | FK | Task creator |
| `title` | string | Task title |
| `description` | text | Task description |
| `category` | enum | SCHOOL, WORK, PERSONAL |
| `status` | string | pending, ongoing, completed |
| `due_date` | date | Due date |

**Relationships:**
- `belongsTo(User)` - Task creator
- `hasMany(Subtask)` - Child subtasks
- `hasMany(Attachment)` - File attachments
- `hasMany(TaskCollaborator)` - Collaborators
- `hasMany(ActivityLog)` - Activity history

---

#### Subtask
**File:** [app/Models/Subtask.php](app/Models/Subtask.php)

| Field | Type | Description |
|-------|------|-------------|
| `subtask_id` | PK | Primary key |
| `task_id` | FK | Parent task |
| `title` | string | Subtask title |
| `description` | text | Description |
| `status` | string | pending, ongoing, completed |
| `due_date` | date | Due date |

**Relationships:**
- `belongsTo(Task)` - Parent task
- `hasMany(SubtaskCollaborator)` - Assigned users

---

#### TaskCollaborator
**File:** [app/Models/TaskCollaborator.php](app/Models/TaskCollaborator.php)

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | FK | Collaborator user ID |
| `task_id` | FK | Task ID |

**Note:** Uses composite primary key (no auto-increment)

**Relationships:**
- `belongsTo(User)` - The collaborator
- `belongsTo(Task)` - The task

---

#### SubtaskCollaborator
**File:** [app/Models/SubtaskCollaborator.php](app/Models/SubtaskCollaborator.php)

| Field | Type | Description |
|-------|------|-------------|
| `subtask_collaborator_id` | PK | Primary key |
| `subtask_id` | FK | Subtask ID |
| `user_id` | FK | User ID |

**Relationships:**
- `belongsTo(Subtask)` - The subtask
- `belongsTo(User)` - The assigned user

---

#### Attachment
**File:** [app/Models/Attachment.php](app/Models/Attachment.php)

| Field | Type | Description |
|-------|------|-------------|
| `attachment_id` | PK | Primary key |
| `task_id` | FK | Associated task |
| `file_path` | string | Storage path |
| `original_filename` | string | Original file name |

**Relationships:**
- `belongsTo(Task)` - Parent task

---

#### ActivityLog
**File:** [app/Models/ActivityLog.php](app/Models/ActivityLog.php)

| Field | Type | Description |
|-------|------|-------------|
| `activity_id` | PK | Primary key |
| `task_id` | FK | Task ID |
| `subtask_id` | FK | Subtask ID (optional) |
| `user_id` | FK | User who performed action |
| `event_type` | string | `task_status_updated`, `subtask_status_updated` |
| `description` | string | Human-readable description |
| `metadata` | json | Additional data |
| `created_at` | datetime | Timestamp |

**Relationships:**
- `belongsTo(Task)` - The task
- `belongsTo(Subtask)` - The subtask (optional)
- `belongsTo(User)` - The actor

---

#### Notification
**File:** [app/Models/Notification.php](app/Models/Notification.php)

| Field | Type | Description |
|-------|------|-------------|
| `notification_id` | PK | Primary key |
| `user_id` | FK | Recipient user |
| `type` | string | `collaborator_added`, `task_due_reminder`, `task_overdue` |
| `title` | string | Notification title |
| `message` | string | Notification message |
| `task_id` | FK | Associated task |
| `triggered_by_user_id` | FK | User who triggered (for collaborator_added) |
| `is_read` | boolean | Read status |

**Scopes:**
- `unread()` - Filter unread notifications
- `forUser($userId)` - Filter by user

**Relationships:**
- `belongsTo(User)` - Recipient
- `belongsTo(Task)` - Related task
- `belongsTo(User, 'triggered_by_user_id')` - Triggering user

---

### 4.5 Middleware

#### CheckUsers
**File:** [app/Http/Middleware/CheckUsers.php](app/Http/Middleware/CheckUsers.php)

| Purpose | Sets `Accept: application/json` header for all API requests |
|---------|-------------------------------------------------------------|
| Applied to | Requests matching `api/*` pattern |
| Effect | Ensures API routes always return JSON responses |

#### Built-in Middleware

| Middleware | Description |
|------------|-------------|
| `auth:sanctum` | Authenticates requests using Sanctum tokens |
| Applied to | All protected API routes inside `Route::middleware('auth:sanctum')` group |

---

### 4.6 Mail Classes

#### CollaboratorAddedMail
**File:** [app/Mail/CollaboratorAddedMail.php](app/Mail/CollaboratorAddedMail.php)

| Property | Type | Description |
|----------|------|-------------|
| `$task` | Task | The task being shared |
| `$collaborator` | User | The user being added |
| `$addedBy` | User | The user who added them |

**Subject:** "New Assignment: You have been added as a collaborator on the task {task_title}"

**View:** `resources/views/emails/collaborator-added.blade.php`

**Triggered:** When a user adds a collaborator to a task in `TasksController@store`

---

#### TaskDueReminderMail
**File:** [app/Mail/TaskDueReminderMail.php](app/Mail/TaskDueReminderMail.php)

| Property | Type | Description |
|----------|------|-------------|
| `$task` | Task | The task due tomorrow |
| `$user` | User | The recipient user |

**Subject:** "Task Reminder: {task_title} is due tomorrow."

**View:** `resources/views/emails/task-due-reminder.blade.php`

**Triggered:** By scheduled command `tasks:send-due-reminders`

---

### 4.7 Console Commands

**File:** [routes/console.php](routes/console.php)

#### SendTaskDueReminders
**File:** [app/Console/Commands/SendTaskDueReminders.php](app/Console/Commands/SendTaskDueReminders.php)

| Command | `tasks:send-due-reminders` |
|---------|---------------------------|
| Schedule | Daily at 8:00 AM |
| Purpose | Send email and in-app notifications for tasks due tomorrow |

**Logic:**
1. Finds all tasks with `due_date = tomorrow` and `status != completed`
2. Sends email to task owner and all collaborators
3. Creates in-app notification for each user
4. Avoids duplicate notifications

---

#### SendOverdueTaskNotifications
**File:** [app/Console/Commands/SendOverdueTaskNotifications.php](app/Console/Commands/SendOverdueTaskNotifications.php)

| Command | `tasks:send-overdue-notifications` |
|---------|-----------------------------------|
| Schedule | Daily at 9:00 AM |
| Purpose | Send notifications for tasks that were due yesterday |

**Logic:**
1. Finds all tasks with `due_date = yesterday` and `status != completed`
2. Sends email to task owner and all collaborators
3. Creates in-app notification with `type = task_overdue`

---

## 5. Frontend (Nuxt/Vue)

### 5.1 Pages/Routes

**Directory:** [frontend/pages/](frontend/pages/)

| Route | File | Layout | Description |
|-------|------|--------|-------------|
| `/` | `index.vue` | default | **Main Board** - Kanban board for personal tasks (≤1 collaborator) |
| `/board` | `board.vue` | default | Redirects to `/` |
| `/create` | `create.vue` | default | **Create Task** - Form with all task options |
| `/projects` | `projects.vue` | default | **Projects View** - Kanban for collaborative tasks (>1 collaborator) |
| `/calendar` | `calendar.vue` | default | **Calendar View** - Monthly calendar with holidays |
| `/auth/login` | `auth/login.vue` | auth | **Login Page** - Email/password + Google OAuth |
| `/auth/register` | `auth/register.vue` | auth | **Registration Page** - Create account form |
| `/auth/callback` | `auth/callback.vue` | - | **OAuth Callback** - Handles Google OAuth redirect |
| `/auth/verification-success` | `auth/verification-success.vue` | auth | **Success Page** - Post-registration confirmation |

---

### 5.2 Stores (Pinia)

**Directory:** [frontend/stores/](frontend/stores/)

#### auth.ts
**File:** [frontend/stores/auth.ts](frontend/stores/auth.ts)

| State | Type | Description |
|-------|------|-------------|
| `user` | User \| null | Current authenticated user |
| `token` | string \| null | Sanctum API token |
| `isAuthenticated` | boolean | Authentication status |
| `isLoading` | boolean | Loading state |
| `lastActivity` | number \| null | Last activity timestamp |
| `sessionTimeout` | number | Session timeout (30 min default) |

**Actions:**
- `login(email, password)` - Authenticate user
- `logout()` - Clear auth and redirect to login
- `initializeAuth()` - Check localStorage for existing token
- `updateActivity()` - Update last activity timestamp
- `clearAuth()` - Clear all auth data

---

#### tasks.ts
**File:** [frontend/stores/tasks.ts](frontend/stores/tasks.ts)

| State | Type | Description |
|-------|------|-------------|
| `tasks` | Task[] | All tasks |
| `personalTasks` | computed | Tasks with ≤1 collaborator |
| `projectTasks` | computed | Tasks with >1 collaborator |
| `isLoading` | boolean | Loading state |
| `lastFetch` | number | Last fetch timestamp |
| `cacheTimeout` | number | 5 minutes |

**Actions:**
- `fetchTasks()` - Fetch all tasks from API
- `createTask(data)` - Create new task
- `updateTask(id, data)` - Update task
- `deleteTask(id)` - Delete task

**Getters:**
- `tasksByStatus(status)` - Filter tasks by status
- `filteredTasks(search, category, status)` - Multi-filter tasks

---

#### notifications.ts
**File:** [frontend/stores/notifications.ts](frontend/stores/notifications.ts)

| State | Type | Description |
|-------|------|-------------|
| `notifications` | Notification[] | All notifications |
| `unreadCount` | number | Unread count |
| `isPanelOpen` | boolean | Notification panel state |

**Actions:**
- `fetchNotifications()` - Get all notifications
- `fetchUnreadCount()` - Get unread count
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete single
- `clearAll()` - Delete all

---

#### activityLog.ts
**File:** [frontend/stores/activityLog.ts](frontend/stores/activityLog.ts)

| State | Type | Description |
|-------|------|-------------|
| `logs` | ActivityLog[] | Activity logs |
| `isLoading` | boolean | Loading state |
| `cacheTimeout` | number | 5 minutes |

**Actions:**
- `fetchLogs()` - Fetch activity logs
- `clearLogs()` - Clear all logs

**Getters:**
- `groupedByDate` - Logs grouped by date

---

#### toast.ts
**File:** [frontend/stores/toast.ts](frontend/stores/toast.ts)

| State | Type | Description |
|-------|------|-------------|
| `toasts` | Toast[] | Active toasts |

**Actions:**
- `success(message)` - Show success toast
- `error(message)` - Show error toast
- `warning(message)` - Show warning toast
- `info(message)` - Show info toast
- `remove(id)` - Remove toast

---

#### ui.ts
**File:** [frontend/stores/ui.ts](frontend/stores/ui.ts)

| State | Type | Description |
|-------|------|-------------|
| `sidebarState` | 'expanded' \| 'collapsed' \| 'hidden' | Sidebar visibility |
| `theme` | 'dark' \| 'light' \| 'system' | Theme mode |
| `isModalOpen` | boolean | Modal state |
| `confirmDialog` | object | Confirm dialog config |
| `isLoading` | boolean | Global loading state |
| `keyboardShortcutsEnabled` | boolean | Shortcuts toggle |
| `viewPreference` | 'kanban' \| 'list' \| 'table' | View mode |

---

### 5.3 Composables

**Directory:** [frontend/composables/](frontend/composables/)

| Composable | File | Purpose |
|------------|------|---------|
| `useApi` | `useApi.ts` | API communication wrapper with auth headers and error handling |
| `useGooglePicker` | `useGooglePicker.ts` | Google Drive file picker integration |
| `useActivityLog` | `useActivityLog.ts` | Activity log fetching and management |
| `useConfirm` | `useConfirm.ts` | Confirmation dialog helpers |
| `useDebounce` | `useDebounce.ts` | Debounce utilities for refs and functions |
| `useKeyboardShortcuts` | `useKeyboardShortcuts.ts` | Register/unregister keyboard shortcuts |
| `useHolidays` | `useHolidays.ts` | Fetch Philippine holidays from backend |
| `useProjects` | `useProjects.ts` | Project-specific task operations |
| `useRoute` | `useRoute.ts` | Enhanced routing utilities |
| `useTasks` | `useTasks.ts` | Task CRUD operations with filtering |
| `useToast` | `useToast.ts` | Toast notification helpers |

#### useApi.ts Details
**File:** [frontend/composables/useApi.ts](frontend/composables/useApi.ts)

```typescript
const apiFetch = async <T>(endpoint: string, options = {}): Promise<T | null> => {
  const response = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    },
    body: options.body,
    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.clearAuth()
        navigateTo('/auth/login')
      }
    },
  })
  return response
}
```

**Key Features:**
- Automatically attaches auth token to all requests
- Handles 401 errors by clearing auth and redirecting
- Provides typed response handling

---

### 5.4 Middleware

**Directory:** [frontend/middleware/](frontend/middleware/)

#### auth.global.ts
**File:** [frontend/middleware/auth.global.ts](frontend/middleware/auth.global.ts)

**Type:** Global middleware (runs on every route)

**Logic:**
```typescript
const publicRoutes = ['/auth/login', '/auth/register', '/auth/verification-success', '/auth/callback']

// If NOT authenticated AND accessing protected route → redirect to /auth/login
// If authenticated AND accessing auth pages → redirect to home
```

---

### 5.5 Layouts

**Directory:** [frontend/layouts/](frontend/layouts/)

#### default.vue
**File:** [frontend/layouts/default.vue](frontend/layouts/default.vue)

Used for authenticated pages with sidebar navigation.

```vue
<template>
  <div class="min-h-screen bg-background flex">
    <TheSidebar />
    <main class="flex-1 p-10 bg-background-secondary overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
```

---

#### auth.vue
**File:** [frontend/layouts/auth.vue](frontend/layouts/auth.vue)

Centered layout for login/register pages without sidebar.

```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
    <!-- Decorative background blurs -->
    <slot />
  </div>
</template>
```

---

### 5.6 Key Components

**Directory:** [frontend/components/](frontend/components/)

| Component | Purpose |
|-----------|---------|
| `TheSidebar.vue` | Navigation sidebar with logo, links, user info, logout |
| `board/TaskCard.vue` | Task card displayed in Kanban columns |
| `board/KanbanColumn.vue` | Kanban board column (To Do, Ongoing, Completed) |
| `TaskModal.vue` | Full task details modal with subtasks, collaborators, attachments |
| `NotificationBell.vue` | Notification bell icon with flyout panel |
| `ToastNotification.vue` | Toast notification display |
| `ConfirmDialog.vue` | Confirmation dialog modal |
| `ui/Button.vue`, `ui/Input.vue`, etc. | Reusable UI components |

---

## 6. Google API Integrations

### 6.1 Google OAuth (Social Login)

**Purpose:** Allow users to login/register using their Google account

**Backend Files:**
- [app/Http/Controllers/GoogleLoginController.php](app/Http/Controllers/GoogleLoginController.php)
- [config/services.php](config/services.php)

**Configuration:**
```php
// config/services.php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URL'), // /auth/google/callback
]
```

**Flow:**
1. User clicks "Continue with Google" → `GET /auth/google`
2. Socialite redirects to Google consent screen
3. User approves → Google redirects to `/auth/google/callback`
4. Backend creates/finds user, generates token
5. Redirects to `{FRONTEND_URL}/auth/callback?token={token}`

---

### 6.2 Google Drive Integration

**Purpose:** Allow users to attach files from their Google Drive to tasks

**Backend Files:**
- [app/Http/Controllers/GoogleDriveController.php](app/Http/Controllers/GoogleDriveController.php)

**Frontend Files:**
- [frontend/composables/useGooglePicker.ts](frontend/composables/useGooglePicker.ts)

**Configuration:**
```php
// config/services.php
'google_drive' => [
    'api_key' => env('GOOGLE_API_KEY'),
    'app_id' => env('GOOGLE_APP_ID'),
    'redirect' => env('GOOGLE_DRIVE_REDIRECT_URL'),
]
```

**OAuth Scopes:**
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.file`

---

### 6.3 Google Picker API

**Purpose:** Display Google Drive file picker UI in the browser

**Frontend Implementation:**
```typescript
// composables/useGooglePicker.ts

// 1. Load Google API scripts
await loadGapiScript()      // https://apis.google.com/js/api.js
await loadGisScript()       // https://accounts.google.com/gsi/client

// 2. Get config from backend
const config = await $fetch('/api/google-drive/config')

// 3. Request OAuth token
const tokenClient = window.google.accounts.oauth2.initTokenClient({
  client_id: clientId,
  scope: 'https://www.googleapis.com/auth/drive.readonly',
  callback: (response) => { /* store token */ }
})

// 4. Build and show picker
const picker = new window.google.picker.PickerBuilder()
  .setDeveloperKey(developerKey)
  .setAppId(appId)
  .setOAuthToken(token)
  .addView(docsView)
  .setCallback(pickerCallback)
  .build()
picker.setVisible(true)
```

---

### 6.4 Google Calendar API (Holidays)

**Purpose:** Fetch Philippine public holidays for calendar view

**Backend File:**
- [app/Http/Controllers/HolidaysController.php](app/Http/Controllers/HolidaysController.php)

**Frontend File:**
- [frontend/composables/useHolidays.ts](frontend/composables/useHolidays.ts)

**Implementation:**
```php
// HolidaysController@index
$calendarId = 'en.philippines#holiday@group.v.calendar.google.com';
$url = "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events";

// Uses GOOGLE_API_KEY for authentication
// Caches results for 24 hours
```

---

## 7. Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│     users       │     │  task_collaborators  │     │     tasks       │
├─────────────────┤     ├──────────────────────┤     ├─────────────────┤
│ user_id (PK)    │◄────┤ user_id (FK)         │────►│ task_id (PK)    │
│ fname           │     │ task_id (FK)         │     │ user_id (FK)    │
│ email           │     └──────────────────────┘     │ title           │
│ password        │                                   │ description     │
│ is_verified     │                                   │ category        │
│ created_at      │                                   │ status          │
│ updated_at      │                                   │ due_date        │
└─────────────────┘                                   │ created_at      │
        │                                             └─────────────────┘
        │                                                     │
        │                                                     │
        ▼                                                     ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  notifications  │     │      subtasks        │     │  attachments    │
├─────────────────┤     ├──────────────────────┤     ├─────────────────┤
│ notification_id │     │ subtask_id (PK)      │     │ attachment_id   │
│ user_id (FK)    │     │ task_id (FK)         │     │ task_id (FK)    │
│ type            │     │ title                │     │ file_path       │
│ title           │     │ description          │     │ original_filename│
│ message         │     │ status               │     └─────────────────┘
│ task_id (FK)    │     │ due_date             │
│ triggered_by_   │     └──────────────────────┘
│   user_id (FK)  │               │
│ is_read         │               ▼
│ created_at      │     ┌──────────────────────┐
└─────────────────┘     │subtask_collaborators │
                        ├──────────────────────┤
                        │ subtask_collaborator_│
                        │   id (PK)            │
                        │ subtask_id (FK)      │
                        │ user_id (FK)         │
                        └──────────────────────┘

┌─────────────────┐
│  activity_logs  │
├─────────────────┤
│ activity_id (PK)│
│ task_id (FK)    │
│ subtask_id (FK) │
│ user_id (FK)    │
│ event_type      │
│ description     │
│ metadata (JSON) │
│ created_at      │
└─────────────────┘
```

### Migration Files

| File | Purpose |
|------|---------|
| [2025_10_09_132343_add_tables_to_database.php](database/migrations/2025_10_09_132343_add_tables_to_database.php) | Creates users, tasks, subtasks, groups, attachments tables |
| [2025_10_16_132347_create_personal_access_tokens_table.php](database/migrations/2025_10_16_132347_create_personal_access_tokens_table.php) | Creates Sanctum tokens table |
| [2025_10_17_032944_add_email_verification_to_users_table.php](database/migrations/2025_10_17_032944_add_email_verification_to_users_table.php) | Adds email verification fields |
| [2025_10_29_053731_rename_groups_table_to_task_collaborators.php](database/migrations/2025_10_29_053731_rename_groups_table_to_task_collaborators.php) | Renames groups to task_collaborators |
| [2025_11_28_000000_create_activity_logs_table.php](database/migrations/2025_11_28_000000_create_activity_logs_table.php) | Creates activity_logs table |
| [2025_12_03_000001_create_subtask_collaborators_table.php](database/migrations/2025_12_03_000001_create_subtask_collaborators_table.php) | Creates subtask_collaborators table |
| [2025_12_11_000001_update_notifications_table.php](database/migrations/2025_12_11_000001_update_notifications_table.php) | Adds triggered_by_user_id to notifications |

---

## 8. Data Flow & Business Logic

### 8.1 Task Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User fills create task form                                           │
│    Page: pages/create.vue                                                │
│    Data: title, category, due_date, description, attachments,           │
│          subtasks, collaborators                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Frontend sends POST /api/tasks                                        │
│    Composable: useApi → apiFetch('POST', '/tasks', formData)             │
│    If Google Drive file: includes fileId and accessToken                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Backend creates task                                                  │
│    Controller: TasksController@store                                     │
│    - Creates Task record                                                 │
│    - Adds creator as first collaborator                                  │
│    - Creates subtasks if provided                                        │
│    - Handles file attachments (local or Google Drive)                    │
│    - Adds additional collaborators                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. For each collaborator added:                                          │
│    - Send CollaboratorAddedMail email                                    │
│    - Create Notification record (type: collaborator_added)               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Backend returns created task with all relations                       │
│    Frontend updates tasks store                                          │
│    User redirected to board/home                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Task vs Project Distinction

**Business Logic:**
- **Personal Tasks:** Tasks where `taskCollaborators.count() <= 1`
  - Displayed on Board page (`/`)
  - Only the creator can see and manage
  
- **Projects:** Tasks where `taskCollaborators.count() > 1`
  - Displayed on Projects page (`/projects`)
  - All collaborators can see and update status
  - Activity logging is enabled

**Implementation:**

Backend ([TasksController](app/Http/Controllers/TasksController.php)):
```php
// apiIndex - Get personal tasks
$tasks = Task::whereHas('taskCollaborators', function ($query) use ($userId) {
    $query->where('user_id', $userId);
})->withCount('taskCollaborators')
  ->having('task_collaborators_count', '<=', 1)
  ->get();

// projects - Get collaborative projects
$tasks = Task::whereHas('taskCollaborators', function ($query) use ($userId) {
    $query->where('user_id', $userId);
})->withCount('taskCollaborators')
  ->having('task_collaborators_count', '>', 1)
  ->get();
```

Frontend ([stores/tasks.ts](frontend/stores/tasks.ts)):
```typescript
const personalTasks = computed(() => 
  tasks.value.filter(t => t.task_collaborators?.length <= 1)
)

const projectTasks = computed(() => 
  tasks.value.filter(t => t.task_collaborators?.length > 1)
)
```

### 8.3 Activity Logging

**When Activity is Logged:**
- Task status change (only for projects with >1 collaborator)
- Subtask status change (only for projects with >1 collaborator)

**Implementation:**
```php
// TasksController@update
if ($task->taskCollaborators->count() > 1) {
    ActivityLog::create([
        'task_id' => $task->task_id,
        'user_id' => $user->user_id,
        'event_type' => 'task_status_updated',
        'description' => "{$user->fname} updated task status to {$status}",
        'metadata' => ['old_status' => $oldStatus, 'new_status' => $status]
    ]);
}
```

### 8.4 Notification System

**Notification Types:**

| Type | Trigger | Email | In-App |
|------|---------|-------|--------|
| `collaborator_added` | User added to a task | ✅ `CollaboratorAddedMail` | ✅ |
| `task_due_reminder` | Task due tomorrow | ✅ `TaskDueReminderMail` | ✅ |
| `task_overdue` | Task was due yesterday | ✅ `TaskDueReminderMail` | ✅ |

**Scheduled Commands:**
- `tasks:send-due-reminders` - Runs daily at 8:00 AM
- `tasks:send-overdue-notifications` - Runs daily at 9:00 AM

### 8.5 File Attachment Flow

**Local File Upload:**
```
User selects file → FormData sent to API → 
File stored in storage/app/public/attachments/ → 
Attachment record created with file_path
```

**Google Drive File:**
```
User opens Google Picker → Selects file → 
Frontend sends fileId + accessToken to API →
Backend downloads file from Drive API →
File stored in storage/app/public/attachments/ →
Attachment record created
```

**Google Docs Export:**
- Google Docs → Exported as PDF
- Google Sheets → Exported as XLSX
- Google Slides → Exported as PDF
- Other files → Downloaded as-is

---

## 9. Configuration Files

### Backend Configuration

| File | Purpose |
|------|---------|
| [config/auth.php](config/auth.php) | Authentication guards and providers |
| [config/sanctum.php](config/sanctum.php) | Sanctum token configuration |
| [config/cors.php](config/cors.php) | CORS settings for API |
| [config/services.php](config/services.php) | Third-party services (Google OAuth, Drive) |
| [config/mail.php](config/mail.php) | Email configuration |

### Key Environment Variables

```env
# Application
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=listed
DB_USERNAME=root
DB_PASSWORD=

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback

# Google Drive
GOOGLE_API_KEY=your_api_key
GOOGLE_APP_ID=your_app_id
GOOGLE_DRIVE_REDIRECT_URL=http://localhost:8000/api/google-drive/callback

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
```

### Frontend Configuration

**File:** [frontend/nuxt.config.ts](frontend/nuxt.config.ts)

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },
  // ... other config
})
```

---

## Summary

**Listed** is a full-stack task management application built with:

- **Backend:** Laravel 11 with Sanctum authentication, Eloquent ORM, and scheduled commands
- **Frontend:** Nuxt 3 with Vue 3, Pinia stores, and Tailwind CSS
- **Database:** MySQL with 8 main tables for users, tasks, collaborators, and metadata
- **Integrations:** Google OAuth, Google Drive, Google Picker, Google Calendar API

The system follows a clean separation of concerns with:
- API-first architecture
- Token-based authentication
- Real-time notifications
- Activity logging for collaboration
- Scheduled email reminders

---

*Documentation generated on December 15, 2025*
