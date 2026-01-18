<?php

namespace App\Http\Controllers;

use App\Models\Responsable;
use Illuminate\Http\Request;

class ResponsableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $responsables = Responsable::all();
        return response()->json($responsables);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'nullable|string',
            'email' => 'required|email|unique:responsables',
        ]);

        $responsable = Responsable::create($request->all());
        return response()->json($responsable, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Responsable $responsable)
    {
        return response()->json($responsable);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Responsable $responsable)
    {
        $request->validate([
            'nom' => 'sometimes|required|string',
            'prenom' => 'nullable|string',
            'email' => 'sometimes|required|email|unique:responsables,email,' . $responsable->id,
        ]);

        $responsable->update($request->all());
        return response()->json($responsable);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Responsable $responsable)
    {
        $responsable->delete();
        return response()->json(['message' => 'Responsable deleted successfully']);
    }
}
