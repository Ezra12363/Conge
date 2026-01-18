<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('employee'),
            'token' => $token,
        ]);
    }

    /**
     * Register a new admin user.
     */
    public function registerAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'im' => 'required|string|max:20|unique:employes',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'corps' => 'required|string|max:255',
            'grades' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'types_personnel' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'date_prise_service' => 'required|date',
            'poste' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        $employe = Employe::create([
            'user_id' => $user->id,
            'im' => $request->im,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'corps' => $request->corps,
            'grades' => $request->grades,
            'sexe' => $request->sexe,
            'types_personnel' => $request->types_personnel,
            'date_naissance' => $request->date_naissance,
            'date_prise_service' => $request->date_prise_service,
            'poste' => $request->poste,
            'role' => 'admin',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'employe' => $employe,
            'token' => $token,
        ]);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Find user by email first
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        // Check if user is active
        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Account is deactivated. Please contact administrator.'
            ], 401);
        }

        // Create Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('employee'),
            'token' => $token,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json($request->user()->load('employee'));
    }
}
