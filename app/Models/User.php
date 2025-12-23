<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use App\Models\TaskCollaborator;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'fname',
        'email',
        'password',
        'email_verified_at',
        'email_verification_token',
        'is_verified',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    // Relationships
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'user_id');
    }

    public function taskCollaborators(): HasMany
    {
        return $this->hasMany(TaskCollaborator::class, 'user_id');
    }
}
