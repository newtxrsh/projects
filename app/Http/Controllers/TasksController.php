<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskCollaborator;
use App\Models\User;
use App\Models\Subtask;
use App\Models\SubtaskCollaborator;
use App\Models\Attachment;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Mail\CollaboratorAddedMail;
use App\Mail\TaskDueReminderMail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TasksController extends Controller
{
    public function apiIndex(Request $request)
    {
        $authUserId = $request->user()->user_id;

        // Fetch tasks based only on task_collaborators table
        $tasks = Task::with(['user', 'taskCollaborators.user', 'subtasks.collaborators.user', 'attachments'])
            ->whereHas('taskCollaborators', function ($cq) use ($authUserId) {
                $cq->where('user_id', $authUserId);
            })
            ->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        // If coming from multipart/form-data, collaborators/subtasks may be JSON strings.
        // Normalize them before validation.
        $collaboratorsInput = $request->input('collaborators');
        if (is_string($collaboratorsInput)) {
            $decoded = json_decode($collaboratorsInput, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['collaborators' => $decoded]);
            }
        }

        $subtasksInput = $request->input('subtasks');
        if (is_string($subtasksInput)) {
            $decoded = json_decode($subtasksInput, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['subtasks' => $decoded]);
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:SCHOOL,WORK,PERSONAL',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,ongoing,completed,Pending,Ongoing,Completed',
            'collaborators' => 'nullable|array',
            'collaborators.*' => 'email',
            'subtasks' => 'nullable|array',
            'subtasks.*.title' => 'required|string|max:255',
            'subtasks.*.description' => 'nullable|string',
            'subtasks.*.status' => 'nullable|string|in:pending,ongoing,completed,Pending,Ongoing,Completed',
            'subtasks.*.due_date' => 'nullable|date',
            'subtasks.*.collaborators' => 'nullable|array',
            'subtasks.*.collaborators.*' => 'email',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt,zip|max:10240'
        ]);

        // Normalize status to lowercase for consistency
        $status = strtolower($validated['status'] ?? 'pending');

        $task = Task::create([
            'user_id' => $request->user()->user_id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'due_date' => $validated['due_date'] ?? null,
            'status' => $status,
        ]);

        // Always add the creator to task_collaborators table
        TaskCollaborator::firstOrCreate([
            'user_id' => $request->user()->user_id,
            'task_id' => $task->task_id
        ]);

        // Handle additional collaborators using task_collaborators table
        if (!empty($validated['collaborators'])) {
            foreach ($validated['collaborators'] as $email) {
                // Find user by email
                $collaborator = User::where('email', $email)->first();
                if ($collaborator && $collaborator->user_id !== $request->user()->user_id) {
                    // Only add if it's not the creator
                    TaskCollaborator::firstOrCreate([
                        'user_id' => $collaborator->user_id,
                        'task_id' => $task->task_id
                    ]);

                    // Send email notification to the collaborator
                    try {
                        Mail::to($collaborator->email)->send(new CollaboratorAddedMail($task, $collaborator, $request->user()));
                    } catch (\Exception $e) {
                        Log::error("Failed to send collaborator email to {$email}: " . $e->getMessage());
                    }

                    // Create in-app notification
                    Notification::create([
                        'user_id' => $collaborator->user_id,
                        'type' => 'collaborator_added',
                        'title' => 'New Task Assignment',
                        'message' => "You have been added as a collaborator to \"{$task->title}\" by " . ($request->user()->fname ?? $request->user()->email) . ".",
                        'task_id' => $task->task_id,
                        'triggered_by_user_id' => $request->user()->user_id,
                        'is_read' => false,
                    ]);
                } elseif (!$collaborator) {
                    // Log if user not found for debugging
                    Log::warning("Collaborator email not found: {$email}");
                }
            }
        }

        // Handle subtasks
        if (!empty($validated['subtasks'])) {
            foreach ($validated['subtasks'] as $subtaskData) {
                $subtask = Subtask::create([
                    'task_id' => $task->task_id,
                    'title' => $subtaskData['title'],
                    'description' => $subtaskData['description'] ?? null,
                    'status' => strtolower($subtaskData['status'] ?? 'pending'),
                    'due_date' => $subtaskData['due_date'] ?? null
                ]);

                // Handle subtask collaborators if provided
                if (!empty($subtaskData['collaborators'])) {
                    foreach ($subtaskData['collaborators'] as $email) {
                        $collaborator = User::where('email', $email)->first();
                        if ($collaborator) {
                            \App\Models\SubtaskCollaborator::firstOrCreate([
                                'subtask_id' => $subtask->subtask_id,
                                'user_id' => $collaborator->user_id
                            ]);
                        }
                    }
                }
            }
        }

        // Handle optional file attachment
        if ($request->hasFile('attachment')) {
            $originalFilename = $request->file('attachment')->getClientOriginalName();
            $storedPath = $request->file('attachment')->store('attachments', 'public');
            Attachment::create([
                'task_id' => $task->task_id,
                'file_path' => $storedPath,
                'original_filename' => $originalFilename,
            ]);
        }

        // Handle Google Drive file attachment
        $googleDriveFile = $request->input('google_drive_file');
        if ($googleDriveFile) {
            if (is_string($googleDriveFile)) {
                $googleDriveFile = json_decode($googleDriveFile, true);
            }
            
            if ($googleDriveFile && isset($googleDriveFile['id'])) {
                try {
                    // Get OAuth token from the request (passed from frontend's Google Picker)
                    $token = $googleDriveFile['accessToken'] ?? null;
                    
                    if ($token) {
                        $fileId = $googleDriveFile['id'];
                        $fileName = $googleDriveFile['name'];
                        $mimeType = $googleDriveFile['mimeType'];
                        
                        // Determine if we need to export (Google Docs) or download directly
                        $isGoogleDoc = str_starts_with($mimeType, 'application/vnd.google-apps');
                        
                        if ($isGoogleDoc) {
                            // Export Google Docs to PDF
                            $exportMimeType = 'application/pdf';
                            $downloadResponse = Http::withToken($token)
                                ->get("https://www.googleapis.com/drive/v3/files/{$fileId}/export", [
                                    'mimeType' => $exportMimeType,
                                ]);
                            $fileName = pathinfo($fileName, PATHINFO_FILENAME) . '.pdf';
                        } else {
                            // Download regular file
                            $downloadResponse = Http::withToken($token)
                                ->get("https://www.googleapis.com/drive/v3/files/{$fileId}", [
                                    'alt' => 'media',
                                ]);
                        }
                        
                        if ($downloadResponse->successful()) {
                            $uniqueFileName = Str::uuid() . '_' . $fileName;
                            $storedPath = 'attachments/' . $uniqueFileName;
                            Storage::disk('public')->put($storedPath, $downloadResponse->body());
                            
                            Attachment::create([
                                'task_id' => $task->task_id,
                                'file_path' => $storedPath,
                                'original_filename' => $fileName,
                            ]);
                        } else {
                            Log::warning("Failed to download Google Drive file: {$fileId}. Response: " . $downloadResponse->body());
                        }
                    } else {
                        Log::warning("No Google Drive access token provided for file download");
                    }
                } catch (\Exception $e) {
                    Log::error("Error downloading Google Drive file: " . $e->getMessage());
                }
            }
        }

        // Check if due date is tomorrow and send notifications
        if (isset($validated['due_date'])) {
            $dueDate = Carbon::parse($validated['due_date']);
            $tomorrow = Carbon::tomorrow();
            
            if ($dueDate->isSameDay($tomorrow)) {
                // Send notification to task creator
                $creator = $request->user();
                try {
                    Mail::to($creator->email)->send(new TaskDueReminderMail($task, $creator));
                    
                    Notification::create([
                        'user_id' => $creator->user_id,
                        'type' => 'task_due_reminder',
                        'title' => 'Task Due Tomorrow',
                        'message' => "Your task \"{$task->title}\" is due tomorrow.",
                        'task_id' => $task->task_id,
                        'is_read' => false,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to send due date reminder to creator: " . $e->getMessage());
                }
                
                // Send notification to all collaborators
                if (!empty($validated['collaborators'])) {
                    foreach ($validated['collaborators'] as $email) {
                        $collaborator = User::where('email', $email)->first();
                        if ($collaborator && $collaborator->user_id !== $request->user()->user_id) {
                            try {
                                Mail::to($collaborator->email)->send(new TaskDueReminderMail($task, $collaborator));
                                
                                Notification::create([
                                    'user_id' => $collaborator->user_id,
                                    'type' => 'task_due_reminder',
                                    'title' => 'Task Due Tomorrow',
                                    'message' => "Your task \"{$task->title}\" is due tomorrow.",
                                    'task_id' => $task->task_id,
                                    'is_read' => false,
                                ]);
                            } catch (\Exception $e) {
                                Log::error("Failed to send due date reminder to {$email}: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
        }

        // Load the task with its collaborators, subtasks, and attachments for response
        $task->load(['user', 'taskCollaborators.user', 'subtasks.collaborators.user', 'attachments']);
        return response()->json($task, 201);
    }

    public function projects(Request $request)
    {
        $authUserId = $request->user()->user_id;

        // Get tasks that have more than one collaborator (i.e., have additional collaborators beyond the creator)
        // and are accessible to the authenticated user
        $projects = Task::with(['user', 'taskCollaborators.user', 'subtasks.collaborators.user', 'attachments'])
            ->whereHas('taskCollaborators', function ($cq) use ($authUserId) {
                $cq->where('user_id', $authUserId);
            })
            ->get()
            ->filter(function ($task) {
                // Only include tasks that have more than one collaborator
                return $task->taskCollaborators->count() > 1;
            })
            ->map(function ($task) {
                $task->collaborators = $task->taskCollaborators->map(function ($collab) {
                    return $collab->user->email;
                })->toArray();
                return $task;
            })
            ->values(); // Re-index the collection

        return response()->json($projects);
    }

    public function update(Request $request, $taskId)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,ongoing,completed,Pending,Ongoing,Completed'
        ]);

        $task = Task::with('taskCollaborators')->where('task_id', $taskId)->first();

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $authUserId = $request->user()->user_id;
        // Check access based on task_collaborators table only
        $hasAccess = $task->taskCollaborators->contains(function ($collab) use ($authUserId) {
            return $collab->user_id === $authUserId;
        });

        if (!$hasAccess) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $task->update([
            'status' => strtolower($validated['status'])
        ]);

        // Only log activity if the task has more than 1 collaborator (project tasks only)
        $collaboratorCount = $task->taskCollaborators()->count();
        if ($collaboratorCount > 1) {
            ActivityLog::create([
                'task_id' => $task->task_id,
                'user_id' => $authUserId,
                'event_type' => 'task_status_updated',
                'description' => sprintf(
                    '%s updated task "%s" status to %s.',
                    $request->user()->fname ?? $request->user()->email,
                    $task->title,
                    strtolower($validated['status'])
                ),
                'metadata' => [
                    'task_title' => $task->title,
                    'status' => strtolower($validated['status']),
                    'user_email' => $request->user()->email,
                ],
            ]);
        }

        $task->load(['user', 'taskCollaborators.user', 'subtasks.collaborators.user', 'attachments']);
        return response()->json($task);
    }

    public function destroy(Request $request, $taskId)
    {
        $task = Task::with('taskCollaborators')->where('task_id', $taskId)->first();

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $authUserId = $request->user()->user_id;
        
        // Only the task creator can delete the task
        if ($task->user_id !== $authUserId) {
            return response()->json(['message' => 'Only the task creator can delete this task'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}