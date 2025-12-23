<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TaskCollaborator;
use App\Models\ActivityLog;

class Task extends Model
{
    use HasFactory;
    public $timestamps = false;


    protected $primaryKey = 'task_id';

    protected $fillable = [
        'user_id',
        'status',
        'title',
        'description',
        'category',
        'due_date',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Subtask::class, 'task_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'task_id');
    }

    public function taskCollaborators(): HasMany
    {
        return $this->hasMany(TaskCollaborator::class, 'task_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'task_id');
    }
}
