<?php

use App\Http\Controllers\UsersController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\SubtasksController;
use App\Http\Controllers\TaskCollaboratorsController;
use App\Http\Controllers\AttachmentsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityLogsController;
use App\Http\Controllers\GoogleDriveController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\HolidaysController;
use Illuminate\Support\Facades\Route;


Route::get('/ping', function () { return response()->json(['status' => 'ok']); });

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google Drive routes (public config)
Route::get('/google-drive/config', [GoogleDriveController::class, 'getConfig']);

// Attachment file serving (public - files are already protected by being in task context)
Route::get('/attachments/{attachmentId}/file', [AttachmentsController::class, 'show']);
Route::get('/attachments/{attachmentId}/download', [AttachmentsController::class, 'download']);

// Philippine holidays (public - no auth required)
Route::get('/holidays', [HolidaysController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/users', [UsersController::class, 'apiIndex']);
    Route::get('/users/check-user', [UsersController::class, 'checkUser']);
    Route::get('/tasks', [TasksController::class, 'apiIndex']);
    Route::post('/tasks', [TasksController::class, 'store']);
    Route::put('/tasks/{taskId}', [TasksController::class, 'update']);
    Route::delete('/tasks/{taskId}', [TasksController::class, 'destroy']);
    Route::get('/projects', [TasksController::class, 'projects']);
    Route::get('/activity-logs', [ActivityLogsController::class, 'index']);
    Route::delete('/activity-logs', [ActivityLogsController::class, 'destroy']);
    Route::get('/subtasks', [SubtasksController::class, 'apiIndex']);
    Route::post('/subtasks', [SubtasksController::class, 'store']);
    Route::put('/subtasks/{subtaskId}', [SubtasksController::class, 'update']);
    Route::get('/task-collaborators', [TaskCollaboratorsController::class, 'apiIndex']);
    Route::get('/attachments', [AttachmentsController::class, 'apiIndex']);

    // Google Drive routes (authenticated)
    Route::get('/google-drive/token', [GoogleDriveController::class, 'getPickerToken']);
    Route::post('/google-drive/download', [GoogleDriveController::class, 'downloadFile']);

    // Notification routes
    Route::get('/notifications', [NotificationsController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationsController::class, 'unreadCount']);
    Route::put('/notifications/{notificationId}/read', [NotificationsController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationsController::class, 'markAllAsRead']);
    Route::delete('/notifications', [NotificationsController::class, 'clearAll']);
    Route::delete('/notifications/{notificationId}', [NotificationsController::class, 'destroy']);
});