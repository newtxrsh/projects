<?php

use App\Http\Controllers\UsersController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\SubtasksController;
use App\Http\Controllers\TaskCollaboratorsController;
use App\Http\Controllers\AttachmentsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\GoogleLoginController;
use App\Http\Controllers\GoogleDriveController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::post('/login', [AuthController::class, 'login'])->name('login.submit');

Route::get('/register', function () {
    return view('auth.register');
})->name('register');

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth:sanctum');

// Simple post-registration success page
Route::get('/verification-success', function () {
    return view('auth.verification-success');
})->name('verification.success');

// Google OAuth routes
Route::get('/auth/google', [GoogleLoginController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleLoginController::class, 'handleGoogleCallback'])->name('google.callback');

// Google Drive OAuth routes
Route::get('/auth/google-drive', [GoogleDriveController::class, 'redirectToDriveAuth'])->name('google-drive.auth');
Route::get('/api/google-drive/callback', [GoogleDriveController::class, 'handleCallback'])->name('google-drive.callback');

// main application routes
Route::get('/', function () {
    return view('board');
})->name('board');
Route::get('/create', function () {
    return view('create');
})->name('create');
Route::get('/projects', function () {
    return view('projects');
})->name('projects');
Route::get('/calendar', function () {
    return view('calendar');
})->name('calendar');

// Other routes (protected)
Route::get('/users', [UsersController::class, 'index'])->middleware('auth:sanctum');
Route::get('/tasks', [TasksController::class, 'index'])->middleware('auth:sanctum');
Route::get('/subtasks', [SubtasksController::class, 'index'])->middleware('auth:sanctum');
Route::get('/task-collaborators', [TaskCollaboratorsController::class, 'index'])->middleware('auth:sanctum');
Route::get('/attachments', [AttachmentsController::class, 'index'])->middleware('auth:sanctum');
