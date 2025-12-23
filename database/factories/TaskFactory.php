<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->user_id ?? User::factory(),
            'status' => $this->faker->randomElement(['pending', 'in progress', 'completed']),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'category' => $this->faker->randomElement(['Work', 'Personal', 'School', 'Other']),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
        ];
    }
}
