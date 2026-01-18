<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $historiques = Historique::all();
        return response()->json($historiques);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $historique = Historique::create($request->all());
        return response()->json($historique, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Historique $historique)
    {
        return response()->json($historique);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Historique $historique)
    {
        $historique->update($request->all());
        return response()->json($historique);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Historique $historique)
    {
        $historique->delete();
        return response()->json(['message' => 'Historique supprimé avec succès']);
    }
}
