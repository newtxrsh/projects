<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttachmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'task_id' => Task::inRandomOrder()->first()->task_id ?? Task::factory(),
            'file_path' => 'uploads/' . $this->faker->uuid() . '.pdf',
        ];
    }
}

