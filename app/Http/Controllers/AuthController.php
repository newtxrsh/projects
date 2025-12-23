<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'fname' => $validated['fname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            // Mark users as verified immediately (no email verification flow)
            'email_verification_token' => null,
            'is_verified' => true,
        ]);

        // Create token so the user can access the app immediately
        $token = $user->createToken('auth_token')->plainTextToken;

        // For API routes, always return JSON
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Registration successful.',
                'token' => $token,
                'redirect_url' => '/verification-success',
            ], 201);
        }

        // For web requests, redirect directly to success page
        return redirect()->route('verification.success');
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        if ($request->is('api/*')) {
            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ]);
        }

        // For web requests, redirect to board page
        return redirect()->route('board')->with('token', $token);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}


