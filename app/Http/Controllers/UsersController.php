<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UsersController extends Controller
{
    public function apiIndex()
    {
        // ONLY select the fields necessary for identification and collaboration
        $users = User::select('user_id', 'fname', 'email')
            // Filters out users who haven't verified their email
            ->where('is_verified', true) 
            ->get();
        
        return response()->json($users);
    }

    public function checkUser(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->query('email');
        $user = User::where('email', $email)
            ->where('is_verified', true)
            ->first();

        if ($user) {
            return response()->json([
                'exists' => true,
                'user' => [
                    'user_id' => $user->user_id,
                    'email' => $user->email,
                    'fname' => $user->fname
                ]
            ]);
        }

        return response()->json([
            'exists' => false
        ]);
    }
}
