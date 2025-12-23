<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    use HasFactory;
    public $timestamps = false;


    protected $primaryKey = 'attachment_id';

    protected $fillable = [
        'task_id',
        'file_path',
        'original_filename',
    ];

    // Relationships
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
