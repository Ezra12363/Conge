<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Demande;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RapportExport;

class RapportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rapports = Rapport::all();
        return response()->json($rapports);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rapport = Rapport::create($request->all());
        return response()->json($rapport, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rapport $rapport)
    {
        return response()->json($rapport);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rapport $rapport)
    {
        $rapport->update($request->all());
        return response()->json($rapport);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rapport $rapport)
    {
        $rapport->delete();
        return response()->json(['message' => 'Rapport supprimé avec succès']);
    }
}
