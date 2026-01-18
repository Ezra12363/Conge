<?php

namespace App\Http\Controllers;

use App\Models\SoldeConge;
use Illuminate\Http\Request;

class SoldeCongeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $soldeConges = SoldeConge::with('employe')->get();
        return response()->json($soldeConges);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'soldeAnnuel' => 'required|integer',
            'soldeAbsence' => 'required|integer',
            'annee' => 'required|integer',
        ]);

        $soldeConge = SoldeConge::create($request->all());
        return response()->json($soldeConge, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SoldeConge $soldeConge)
    {
        return response()->json($soldeConge->load('employe'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SoldeConge $soldeConge)
    {
        $request->validate([
            'soldeAnnuel' => 'sometimes|integer',
            'soldeAbsence' => 'sometimes|integer',
            'annee' => 'sometimes|integer',
        ]);

        $soldeConge->update($request->all());
        return response()->json($soldeConge);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SoldeConge $soldeConge)
    {
        $soldeConge->delete();
        return response()->json(['message' => 'SoldeConge deleted successfully']);
    }

    /**
     * Debit conge.
     */
    public function debiterConge(Request $request, SoldeConge $soldeConge)
    {
        $request->validate([
            'jours' => 'required|integer|min:1',
        ]);

        $soldeConge->debiterConge($request->jours);
        return response()->json($soldeConge);
    }

    /**
     * Debit absence.
     */
    public function debiterAbsence(Request $request, SoldeConge $soldeConge)
    {
        $request->validate([
            'jours' => 'required|integer|min:1',
        ]);

        $soldeConge->debiterAbsence($request->jours);
        return response()->json($soldeConge);
    }

    /**
     * Reinitialize solde.
     */
    public function reinitialiserSolde(Request $request, SoldeConge $soldeConge)
    {
        $request->validate([
            'soldeAnnuel' => 'required|integer',
            'soldeAbsence' => 'required|integer',
        ]);

        $soldeConge->reinitialiserSolde($request->soldeAnnuel, $request->soldeAbsence);
        return response()->json($soldeConge);
    }
}
