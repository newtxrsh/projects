<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subtask;
use App\Models\Task;
use App\Models\SubtaskCollaborator;
use App\Models\User;
use App\Models\ActivityLog;

class SubtasksController extends Controller
{
    public function apiIndex(Request $request)
    {

        $query = Subtask::with('task', 'collaborators.user');
    
        // Filter by Task Ownership (Existing security filter)
        $query->whereHas('task', function($q) use ($request) {
            // Ensuring user_id is compared to the authenticated user's ID
            $q->where('user_id', $request->user()->user_id); 
        });
    
        // Add Specific Task ID Filter (NEW LOGIC)
        if ($request->has('task_id')) {
            $taskId = $request->query('task_id');
            
            // Ensure the provided task_id is an integer to prevent query errors
            if (is_numeric($taskId)) {
                $query->where('task_id', $taskId);
            }
        }
    
        // Execute the final query
        $subtasks = $query->get();
        
        return response()->json($subtasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,task_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:pending,ongoing,completed',
            'due_date' => 'nullable|date',
            'collaborators' => 'nullable|array',
            'collaborators.*' => 'email'
        ]);

        // Verify the task belongs to the authenticated user
        $task = Task::where('task_id', $validated['task_id'])
            ->where('user_id', $request->user()->user_id)
            ->first();

        if (!$task) {
            return response()->json(['message' => 'Task not found or access denied'], 404);
        }

        $subtask = Subtask::create([
            'task_id' => $validated['task_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'due_date' => $validated['due_date'] ?? null
        ]);

        // Handle subtask collaborators
        if (!empty($validated['collaborators'])) {
            foreach ($validated['collaborators'] as $email) {
                $collaborator = User::where('email', $email)->first();
                if ($collaborator) {
                    SubtaskCollaborator::firstOrCreate([
                        'subtask_id' => $subtask->subtask_id,
                        'user_id' => $collaborator->user_id
                    ]);
                }
            }
        }

        $subtask->load(['collaborators.user']);
        return response()->json($subtask, 201);
    }

    public function update(Request $request, $subtaskId)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,ongoing,completed,Pending,Ongoing,Completed',
            'description' => 'nullable|string',
            'collaborators' => 'nullable|array',
            'collaborators.*' => 'email'
        ]);

        $subtask = Subtask::with('task.taskCollaborators', 'collaborators.user')->where('subtask_id', $subtaskId)->first();

        if (!$subtask) {
            return response()->json(['message' => 'Subtask not found'], 404);
        }

        if (!$subtask->task) {
            return response()->json(['message' => 'Parent task not found'], 404);
        }

        $authUserId = $request->user()->user_id;
        $isOwner = $subtask->task->user_id === $authUserId;
        $isCollaborator = $subtask->task->taskCollaborators->contains(function ($collab) use ($authUserId) {
            return $collab->user_id === $authUserId;
        });

        if (!$isOwner && !$isCollaborator) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $subtask->update([
            'status' => strtolower($validated['status']),
            'description' => $validated['description'] ?? $subtask->description
        ]);

        // Update collaborators if provided
        if (array_key_exists('collaborators', $validated)) {
            SubtaskCollaborator::where('subtask_id', $subtaskId)->delete();
            
            if (!empty($validated['collaborators'])) {
                foreach ($validated['collaborators'] as $email) {
                    $collaborator = User::where('email', $email)->first();
                    if ($collaborator) {
                        SubtaskCollaborator::firstOrCreate([
                            'subtask_id' => $subtaskId,
                            'user_id' => $collaborator->user_id
                        ]);
                    }
                }
            }
        }

        // Only log activity if the parent task has more than 1 collaborator (project tasks only)
        $collaboratorCount = $subtask->task->taskCollaborators()->count();
        if ($collaboratorCount > 1) {
            ActivityLog::create([
                'task_id' => $subtask->task_id,
                'subtask_id' => $subtask->subtask_id,
                'user_id' => $authUserId,
                'event_type' => 'subtask_status_updated',
                'description' => sprintf(
                    '%s updated subtask "%s" to %s.',
                    $request->user()->fname ?? $request->user()->email,
                    $subtask->title,
                    strtolower($validated['status'])
                ),
                'metadata' => [
                    'task_title' => $subtask->task->title,
                    'subtask_title' => $subtask->title,
                    'status' => strtolower($validated['status']),
                    'user_email' => $request->user()->email,
                ],
            ]);
        }

        $subtask->load(['collaborators.user']);
        return response()->json($subtask);
    }
}

