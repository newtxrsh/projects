<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test user that's not verified
        User::create([
            'fname' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'is_verified' => false,
            'email_verification_token' => 'test-token-123',
        ]);
        
        echo "Created test user: test@example.com\n";
    }
}
