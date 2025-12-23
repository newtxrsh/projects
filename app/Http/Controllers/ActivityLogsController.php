<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogsController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->user_id;
        $taskId = $request->query('task_id');

        $query = ActivityLog::with(['task.taskCollaborators', 'subtask', 'user'])
            // Only get logs for tasks that have MORE THAN 1 collaborator (project tasks, not board tasks)
            ->whereHas('task', function ($q) use ($userId) {
                $q->where(function ($taskQuery) use ($userId) {
                    $taskQuery->where('user_id', $userId)
                        ->orWhereHas('taskCollaborators', function ($cq) use ($userId) {
                            $cq->where('user_id', $userId);
                        });
                });
            });

        if ($taskId) {
            $query->where('task_id', $taskId);
        }

        $logs = $query->orderByDesc('created_at')->limit(200)->get();
        
        // Filter logs to only include tasks with more than 1 collaborator (matching projects endpoint logic)
        $logs = $logs->filter(function ($log) {
            return $log->task && $log->task->taskCollaborators->count() > 1;
        })->values();

        return response()->json($logs);
    }

    public function destroy(Request $request)
    {
        $userId = $request->user()->user_id;
        $taskId = $request->query('task_id');

        $query = ActivityLog::whereHas('task', function ($q) use ($userId) {
            $q->where('user_id', $userId)
                ->orWhereHas('taskCollaborators', function ($cq) use ($userId) {
                    $cq->where('user_id', $userId);
                });
        });

        if ($taskId) {
            $query->where('task_id', $taskId);
        }

        $deleted = $query->delete();

        return response()->json([
            'deleted' => $deleted,
        ]);
    }
}

