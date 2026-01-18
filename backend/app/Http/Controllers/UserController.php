<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Builder;

class UserController extends Controller
{
    /**
     * Get dynamic validation rules based on operation type
     */
    protected function getValidationRules($operation = 'create', $userId = null)
    {
        $baseRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'role' => 'required|in:admin,rh,employe',
            'status' => 'required|in:active,inactive,suspended',
        ];

        // Add unique email validation
        if ($operation === 'create') {
            $baseRules['email'] .= '|unique:users';
            $baseRules['password'] = 'required|string|min:8';
        } elseif ($operation === 'update' && $userId) {
            $baseRules['email'] .= '|unique:users,email,' . $userId;
            $baseRules['password'] = 'nullable|string|min:8';
        }

        return $baseRules;
    }

    /**
     * Get fillable fields dynamically from the model
     */
    protected function getFillableFields()
    {
        $user = new User();
        return $user->getFillable();
    }

    /**
     * Apply dynamic filtering, sorting, and pagination
     */
    protected function applyDynamicQuery(Request $request, Builder $query)
    {
        // Dynamic search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        // Dynamic filtering
        $filterableFields = ['role', 'status'];
        foreach ($filterableFields as $field) {
            if ($request->has($field) && !empty($request->$field)) {
                $query->where($field, $request->$field);
            }
        }

        // Dynamic sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field is allowed
        $allowedSortFields = ['id', 'name', 'email', 'role', 'status', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query;
    }

    /**
     * Display a listing of the resource with dynamic features.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Apply dynamic filtering, searching, and sorting
        $query = $this->applyDynamicQuery($request, $query);

        // Dynamic pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        // Manually transform the user data to avoid serialization issues
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'password' => $user->password, // Include hashed password for display
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at ? $user->created_at->toDateTimeString() : null,
                'updated_at' => $user->updated_at ? $user->updated_at->toDateTimeString() : null,
            ];
        });

        // Add metadata for frontend
        $response = $users->toArray();
        $response['filters'] = [
            'roles' => ['admin', 'rh', 'employe'],
            'statuses' => ['active', 'inactive', 'suspended'],
        ];

        return response()->json($response);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->getValidationRules('create'));

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $validatedData = $validator->validated();

        // Hash password if provided
        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        // Filter only fillable fields
        $fillableData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));

        $user = User::create($fillableData);

        // Create employee record linked to the user
        $employeeData = [
            'user_id' => $user->id,
            'nom' => $validatedData['name'], // Use user's name as employee name
            'prenom' => '', // Will be filled later
            'im' => $this->generateUniqueIm(), // Generate unique IM
            'corps' => '',
            'grades' => '',
            'sexe' => 'M', // Default value
            'types_personnel' => '',
            'date_naissance' => now()->toDateString(), // Default value
            'date_prise_service' => now()->toDateString(), // Default value
            'poste' => '',
        ];

        $employee = Employe::create($employeeData);

        // Load relationships if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $user->load($relationships);
        }

        return response()->json([
            'user' => $user,
            'employee' => $employee,
            'message' => 'Utilisateur et employé créés avec succès'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user)
    {
        // Always load employee relationship for authenticated users
        $user->load('employee');

        // Load additional relationships dynamically if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $user->load($relationships);
        }

        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), $this->getValidationRules('update', $user->id));

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $validatedData = $validator->validated();

        // Hash password if provided and not empty
        if (isset($validatedData['password']) && !empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']); // Don't update password if empty
        }

        // Filter only fillable fields
        $fillableData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));

        $user->update($fillableData);

        // Load relationships if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $user->load($relationships);
        }

        return response()->json([
            'user' => $user,
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Check if user can be deleted (e.g., don't delete admin users)
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Impossible de supprimer un utilisateur administrateur'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Bulk operations for users
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
            'action' => 'required|in:update_status,update_role,delete',
            'value' => 'required_unless:action,delete'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userIds = $request->user_ids;
        $action = $request->action;
        $value = $request->value;

        switch ($action) {
            case 'update_status':
                User::whereIn('id', $userIds)->update(['status' => $value]);
                $message = 'Statut mis à jour pour ' . count($userIds) . ' utilisateurs';
                break;

            case 'update_role':
                User::whereIn('id', $userIds)->update(['role' => $value]);
                $message = 'Rôle mis à jour pour ' . count($userIds) . ' utilisateurs';
                break;

            case 'delete':
                // Don't delete admin users
                $adminCount = User::whereIn('id', $userIds)->where('role', 'admin')->count();
                if ($adminCount > 0) {
                    return response()->json([
                        'message' => 'Impossible de supprimer des utilisateurs administrateurs'
                    ], 403);
                }
                User::whereIn('id', $userIds)->delete();
                $message = count($userIds) . ' utilisateurs supprimés';
                break;
        }

        return response()->json(['message' => $message]);
    }

    /**
     * Reset password for a specific user.
     */
    public function resetPassword(Request $request, User $user)
    {
        $newPassword = $request->get('new_password', 'password123');

        // In production, generate a secure random password
        if ($request->has('generate_random')) {
            $newPassword = $this->generateSecurePassword();
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès',
            'new_password' => $newPassword, // In production, send via email instead
        ]);
    }

    /**
     * Toggle status for a specific user.
     */
    public function toggleStatus(User $user)
    {
        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'status' => $newStatus,
            'user' => $user
        ]);
    }

    /**
     * Get user statistics
     */
    public function statistics()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'inactive_users' => User::where('status', 'inactive')->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
            'role_distribution' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray(),
        ];

        return response()->json($stats);
    }

    /**
     * Generate a unique IM (Identification Number) for employee
     */
    protected function generateUniqueIm()
    {
        do {
            // Generate a random 8-digit IM
            $im = str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        } while (Employe::where('im', $im)->exists());

        return $im;
    }

    /**
     * Generate a secure random password
     */
    protected function generateSecurePassword($length = 12)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
        $password = '';

        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[rand(0, strlen($characters) - 1)];
        }

        return $password;
    }
}
