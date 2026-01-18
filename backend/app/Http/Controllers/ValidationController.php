<?php

namespace App\Http\Controllers;

use App\Models\Validation;
use App\Models\Demande;
use App\Models\Historique;
use Illuminate\Http\Request;

class ValidationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $validations = Validation::with('demande', 'responsable')->get();
        return response()->json($validations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'demande_id' => 'required|exists:demandes,id',
            'decision' => 'required|in:approuvee,refusee',
            'commentaire' => 'nullable|string',
        ]);

        // Get or create responsable based on logged-in RH user
        $user = auth()->user();
        $responsable = \App\Models\Responsable::where('email', $user->email)->first();

        if (!$responsable) {
            $responsable = \App\Models\Responsable::create([
                'nom' => $user->employee ? $user->employee->nom : $user->name,
                'prenom' => $user->employee ? $user->employee->prenom : '',
                'email' => $user->email,
            ]);
        }

        $validation = Validation::create([
            'demande_id' => $request->demande_id,
            'responsable_id' => $responsable->id,
            'decision' => $request->decision,
            'commentaire' => $request->commentaire,
            'dateValidation' => now()->toDateString(),
            'status' => $request->decision, // Set status based on decision
        ]);

        $demande = Demande::find($request->demande_id);
        $demande->statut = $request->decision;
        $demande->save();

        // Handle balance adjustments for annual leave and absence
        if ($request->decision === 'refusee') {
            // Restore balance for rejected requests
            $employee = $demande->employe;
            $balance = $employee->leaveBalance();

            // Calculate days to restore
            $startDate = \Carbon\Carbon::parse($demande->dateDebut);
            $endDate = \Carbon\Carbon::parse($demande->dateFin);
            $daysToRestore = $endDate->diffInDays($startDate) + 1;

            // Restore days based on request type
            if ($demande->typeDemande === 'conge') {
                $balance->annual_leave += $daysToRestore;
            } elseif ($demande->typeDemande === 'absence') {
                $balance->absence_leave += $daysToRestore;
            }

            $balance->save();
        }
        // For approved requests, balance was already deducted when request was created

        Historique::create([
            'demande_id' => $request->demande_id,
            'action' => 'Demande ' . $request->decision,
            'dateAction' => now()->toDateString(),
            'utilisateur' => $user->name,
        ]);

        return response()->json($validation, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Validation $validation)
    {
        return response()->json($validation->load('demande', 'responsable'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Validation $validation)
    {
        $request->validate([
            'decision' => 'sometimes|in:approuvee,refusee',
            'commentaire' => 'nullable|string',
        ]);

        $validation->update($request->all());
        return response()->json($validation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Validation $validation)
    {
        $validation->delete();
        return response()->json(['message' => 'Validation deleted successfully']);
    }

    /**
     * Valider demande.
     */
    public function validerDemande(Request $request, Demande $demande)
    {
        $request->validate([
            'responsable_id' => 'required|exists:responsables,id',
            'commentaire' => 'nullable|string',
        ]);

        $responsable = \App\Models\Responsable::find($request->responsable_id);
        $validation = $responsable->validerDemande($demande, $request->commentaire);

        return response()->json($validation);
    }

    /**
     * Refuser demande.
     */
    public function refuserDemande(Request $request, Demande $demande)
    {
        $request->validate([
            'responsable_id' => 'required|exists:responsables,id',
            'commentaire' => 'nullable|string',
        ]);

        $validation = Validation::create([
            'demande_id' => $demande->id,
            'responsable_id' => $request->responsable_id,
            'decision' => 'refusee',
            'commentaire' => $request->commentaire,
            'dateValidation' => now()->toDateString(),
        ]);

        $demande->statut = 'refusee';
        $demande->save();

        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande refusée',
            'dateAction' => now()->toDateString(),
            'utilisateur' => auth()->user()->name,
        ]);

        return response()->json($validation);
    }
}
