<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Notification;
use App\Mail\TaskDueReminderMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendTaskDueReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:send-due-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email reminders for tasks due tomorrow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        
        // Get all tasks due tomorrow that are not completed
        $tasks = Task::with(['user', 'taskCollaborators.user'])
            ->whereDate('due_date', $tomorrow)
            ->where('status', '!=', 'completed')
            ->get();

        $this->info("Found {$tasks->count()} tasks due tomorrow.");

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
                        'type' => 'task_due_reminder',
                        'title' => 'Task Due Tomorrow',
                        'message' => "Your task \"{$task->title}\" is due tomorrow.",
                        'task_id' => $task->task_id,
                        'is_read' => false,
                    ]);

                    $notifiedUsers[] = $owner->user_id;
                    $this->info("Sent reminder to owner {$owner->email} for task: {$task->title}");
                } catch (\Exception $e) {
                    $this->error("Failed to send reminder to owner {$owner->email}: {$e->getMessage()}");
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
                        'type' => 'task_due_reminder',
                        'title' => 'Task Due Tomorrow',
                        'message' => "Your task \"{$task->title}\" is due tomorrow.",
                        'task_id' => $task->task_id,
                        'is_read' => false,
                    ]);

                    $notifiedUsers[] = $user->user_id;
                    $this->info("Sent reminder to collaborator {$user->email} for task: {$task->title}");
                } catch (\Exception $e) {
                    $this->error("Failed to send reminder to collaborator {$user->email}: {$e->getMessage()}");
                }
            }
        }

        $this->info('Task due reminders sent successfully!');
        return Command::SUCCESS;
    }
}
