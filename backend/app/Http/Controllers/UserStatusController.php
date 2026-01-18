<?php

namespace App\Http\Controllers;

use App\Models\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $statuses = UserStatus::active()->ordered()->get();
        return response()->json($statuses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:user_statuses',
            'label' => 'required|string|max:100',
            'color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = UserStatus::create($request->all());
        return response()->json($status, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserStatus $userStatus)
    {
        return response()->json($userStatus);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserStatus $userStatus)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:user_statuses,name,' . $userStatus->id,
            'label' => 'required|string|max:100',
            'color' => 'required|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userStatus->update($request->all());
        return response()->json($userStatus);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserStatus $userStatus)
    {
        // Check if status is being used by any users
        if ($userStatus->users()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce statut car il est utilisé par des utilisateurs.'
            ], 422);
        }

        $userStatus->delete();
        return response()->json(['message' => 'Statut supprimé avec succès']);
    }

    /**
     * Get all statuses including inactive ones
     */
    public function all()
    {
        $statuses = UserStatus::ordered()->get();
        return response()->json($statuses);
    }
}
