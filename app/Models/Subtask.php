<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subtask extends Model
{
    use HasFactory;
    public $timestamps = false;


    protected $primaryKey = 'subtask_id';

    protected $fillable = [
        'task_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    // Relationships
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function collaborators(): HasMany
    {
        return $this->hasMany(SubtaskCollaborator::class, 'subtask_id');
    }
}
