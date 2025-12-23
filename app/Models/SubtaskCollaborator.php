<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubtaskCollaborator extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'subtask_collaborator_id';

    protected $fillable = [
        'subtask_id',
        'user_id',
    ];

    // Relationships
    public function subtask(): BelongsTo
    {
        return $this->belongsTo(Subtask::class, 'subtask_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
