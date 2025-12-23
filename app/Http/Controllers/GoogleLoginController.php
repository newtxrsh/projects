<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class GoogleLoginController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user already exists
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // User exists, log them in
                // Mark email as verified since Google already verified it
                if (!$user->is_verified) {
                    $user->update([
                        'is_verified' => true,
                        'email_verified_at' => now(),
                    ]);
                }
            } else {
                // Create new user
                // Split name into first name (use first part of name or email prefix)
                $googleName = $googleUser->name ?? $googleUser->nickname ?? null;
                if ($googleName) {
                    $nameParts = explode(' ', $googleName, 2);
                    $firstName = $nameParts[0];
                } else {
                    // Fallback to email prefix if no name
                    $emailParts = explode('@', $googleUser->email);
                    $firstName = $emailParts[0];
                }

                $user = User::create([
                    'fname' => $firstName,
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(32)), // Random password since they use Google
                    'is_verified' => true, // Google already verified the email
                    'email_verified_at' => now(),
                ]);
            }

            // Log the user in using Laravel's Auth system
            Auth::login($user);

            // Create Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to Nuxt frontend with token
            // The frontend URL can be configured via environment variable
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            // Redirect to frontend with token as query parameter
            // The frontend will handle storing the token and redirecting to the board
            return redirect($frontendUrl . '/auth/callback?token=' . $token . '&user_id=' . $user->id);
        } catch (\Exception $e) {
            // Handle errors - redirect to frontend login with error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/auth/login?error=google_auth_failed');
        }
    }
}
