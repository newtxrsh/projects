<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Notification;
use App\Mail\TaskDueReminderMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendOverdueTaskNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:send-overdue-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications for tasks that were due yesterday';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $yesterday = Carbon::yesterday()->toDateString();
        
        // Get all tasks that were due yesterday and are not completed
        $tasks = Task::with(['user', 'taskCollaborators.user'])
            ->whereDate('due_date', $yesterday)
            ->where('status', '!=', 'completed')
            ->get();

        $this->info("Found {$tasks->count()} tasks that were due yesterday.");

        foreach ($tasks as $task) {
            $notifiedUsers = []; // Track notified users to avoid duplicates
            
            // Send notification to task owner
            $owner = $task->user;
            if ($owner && $owner->email) {
                try {
                    // Send email notification
                    Mail::to($owner->email)->send(new TaskDueReminderMail($task, $owner));
                    
                    // Create in-app notification
                    Notification::create([
                        'user_id' => $owner->user_id,
                        'type' => 'task_overdue',
                        'title' => 'Task Was Due Yesterday',
                        'message' => "Your task \"{$task->title}\" was due yesterday and is now overdue.",
                        'task_id' => $task->task_id,
                        'is_read' => false,
                    ]);

                    $notifiedUsers[] = $owner->user_id;
                    $this->info("Sent overdue notification to owner {$owner->email} for task: {$task->title}");
                } catch (\Exception $e) {
                    $this->error("Failed to send overdue notification to owner {$owner->email}: {$e->getMessage()}");
                }
            }
            
            // Send notifications to all collaborators
            foreach ($task->taskCollaborators as $collaborator) {
                $user = $collaborator->user;
                
                if (!$user || !$user->email || in_array($user->user_id, $notifiedUsers)) {
                    continue; // Skip if already notified or invalid user
                }

                try {
                    // Send email notification
                    Mail::to($user->email)->send(new TaskDueReminderMail($task, $user));
                    
                    // Create in-app notification
                    Notification::create([
                        'user_id' => $user->user_id,
                        'type' => 'task_overdue',
                        'title' => 'Task Was Due Yesterday',
                        'message' => "Your task \"{$task->title}\" was due yesterday and is now overdue.",
                        'task_id' => $task->task_id,
                        'is_read' => false,
                    ]);

                    $notifiedUsers[] = $user->user_id;
                    $this->info("Sent overdue notification to collaborator {$user->email} for task: {$task->title}");
                } catch (\Exception $e) {
                    $this->error("Failed to send overdue notification to collaborator {$user->email}: {$e->getMessage()}");
                }
            }
        }

        $this->info('Overdue task notifications sent successfully!');
        return Command::SUCCESS;
    }
}
