# API DOCUMENTATION

**BASE URL**: `http://localhost:8000/api`

## Authentication Endpoints

### Register
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/register`
- **Body (raw):** `{"fname": "string", "email": "email", "password": "string"}`

### Email Verification
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/verify-email`
- **Body (raw):** `{"token": "string"}`

### Resend Verification
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/resend-verification`
- **Body (raw):** `{"email": "email"}`

### Login
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/login`
- **Body (raw):** `{"email": "email", "password": "string"}`

### Check Verification Status
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/verification-status`

## Protected Endpoints 
>**Require:** Bearer Token

### Display User Profile
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/me`

### Logout
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/logout`

### Get Users
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/users`

### Verify User from database
- **Method:**`GET`
- **URL=**`http://localhost:8000/api/users/check-user?email=example@gmail.com`

### Get Tasks
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/tasks`

### Create Tasks
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/tasks`
- **Body:** `form-data`

| Key | Type | Value | Description |
|-----|------|-------|-------------|
| title | Text | (value) | Task title |
| category | Text | (value) | Task category |
| description | Text | (value) | Task description (optional) |
| attachments | File | (file upload) | Attachment files |
| collaborators | Text | `["alice@example.com", "bob@example.com"]` | List of collaborator emails |
| subtasks | Text | `[{"title": "(title)","status": "ongoing","due_date": "yyyy-mm-dd"},{"title": "(title)","status": "pending"}]` | List of subtasks |
| due_date | Text | yyyy-mm-dd | Task due date |
| status | Text | *(options: pending, ongoing, completed)* | Task status |

> **Note:** Attachments are stored locally in `storage/app/public/attachments/`

### Update Task Status
- **Method:** `PUT`
- **URL=** `http://localhost:8000/api/tasks/{taskId}`
- **Body (raw):** `{"status": "string"}` *(options: pending, ongoing, completed)*

### Get All Tasks with Collaborators
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/projects`

### Get All Subtasks
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/subtasks`

### Get Subtask from Specific Task
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/subtasks?task_id=(task_id)`

### Create Subtask for Specific Task
- **Method:** `POST`
- **URL=** `http://localhost:8000/api/subtasks`
- **Body (raw):** `{"task_id": "integer", "title": "string", "status": "string", "due_date": "date"}`

### Update Subtask Status
- **Method:** `PUT`
- **URL=** `http://localhost:8000/api/subtasks/{subtaskId}`
- **Body (raw):** `{"status": "string"}`

### Get All Tasks with Collaborators
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/task-collaborators`

### Get All Attachments
- **Method:** `GET`
- **URL=** `http://localhost:8000/api/attachments`
