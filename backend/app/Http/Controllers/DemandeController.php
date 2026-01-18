<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Employe;
use App\Models\Historique;
use App\Models\Validation;
use App\Models\Responsable;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role === 'employe') {
            $employe = Employe::where('user_id', $user->id)->first();
            if (!$employe) {
                return response()->json(['message' => "Votre profil employé n'est pas configuré. Contactez l'administrateur."], 403);
            }
            $demandes = Demande::where('employe_id', $employe->id)->with('employe')->get();
        } else {
            $demandes = Demande::with('employe')->get();
        }
        return response()->json($demandes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'typeDemande' => 'required|in:conge,absence,maladie,maternite',
            'annees_demande' => 'required|integer',
            'droit_conge' => 'required|integer',
            'lieu_demande' => 'required|string|max:255',
            'dateDebut' => 'required|date',
            'dateFin' => 'required|date|after_or_equal:dateDebut',
            'commentaire' => 'nullable|string',
            'justification' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $employee = Employe::where('user_id', $user->id)->first();
        if (!$employee) {
            // Automatically create employee record if missing
            $employee = Employe::create([
                'user_id' => $user->id,
                'nom' => $user->name,
                'prenom' => '',
                'im' => $this->generateUniqueIm(),
                'corps' => '',
                'grades' => '',
                'sexe' => 'M',
                'types_personnel' => '',
                'date_naissance' => now()->toDateString(),
                'date_prise_service' => now()->toDateString(),
                'poste' => '',
                'role' => 'employe',
            ]);

            // Ensure leave balance is created for the new employee
            $employee->createLeaveBalanceIfNotExists();
        }
        $balance = $employee->leaveBalance();

        // Calculate days requested
        $startDate = \Carbon\Carbon::parse($request->dateDebut);
        $endDate = \Carbon\Carbon::parse($request->dateFin);
        $daysRequested = $endDate->diffInDays($startDate) + 1;

        // Calculate days until start date
        $currentDate = \Carbon\Carbon::now();
        $daysUntilStart = $currentDate->diffInDays($startDate, false);

        // Check if this is the first request of this type for the employee
        $previousRequestsCount = Demande::where('employe_id', $employee->id)
            ->where('typeDemande', $request->typeDemande)
            ->whereIn('statut', ['approuvee', 'en_attente'])
            ->count();

        $isFirstRequest = $previousRequestsCount === 0;

        // Validation rules for Congé Annuel
        if ($request->typeDemande === 'conge') {
            if ($isFirstRequest) {
                // First annual leave request must be exactly 15 days
                if ($daysRequested !== 15) {
                    return response()->json(['message' => 'La première demande de congé annuel doit obligatoirement porter sur une durée de 15 jours'], 400);
                }
            }
            // Check balance for annual leave
            if ($balance->annual_leave < $daysRequested) {
                return response()->json(['message' => 'Solde insuffisant pour congé annuel'], 400);
            }
        }

        // Validation rules for Absence
        if ($request->typeDemande === 'absence') {
            if ($isFirstRequest) {
                // First absence request must be exactly 3 days
                if ($daysRequested !== 3) {
                    return response()->json(['message' => 'La première demande d\'absence doit obligatoirement porter sur une durée de 3 jours'], 400);
                }
            }
            // Check balance for absence
            if ($balance->absence_leave < $daysRequested) {
                return response()->json(['message' => 'Solde insuffisant pour absence'], 400);
            }
        }

        // Debit balance only for annual leave and absence
        if ($request->typeDemande === 'conge') {
            $balance->annual_leave -= $daysRequested;
        } elseif ($request->typeDemande === 'absence') {
            $balance->absence_leave -= $daysRequested;
        }
        $balance->save();

        // Handle file upload
        $justificationPath = null;
        if ($request->hasFile('justification')) {
            $justificationPath = $request->file('justification')->store('justifications', 'public');
        }

        $demande = Demande::create(array_merge($request->all(), [
            'user_id' => $user->id,
            'employe_id' => $employee->id,
            'statut' => 'en_attente',
            'dateCreation' => now()->toDateString(),
            'justification' => $justificationPath,
        ]));

        $demande->calculerNombreJours();

        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande créée',
            'dateAction' => now()->toDateString(),
            'utilisateur' => auth()->user()->name,
        ]);

        // Automatically create validation record for HR
        $responsable = Responsable::first(); // Get first responsable, or create default if none
        if (!$responsable) {
            $responsable = Responsable::create([
                'nom' => 'RH',
                'prenom' => 'Manager',
                'email' => 'rh@company.com',
            ]);
        }

        Validation::create([
            'demande_id' => $demande->id,
            'responsable_id' => $responsable->id,
            'dateValidation' => now()->toDateString(),
            'decision' => null, // Pending decision
            'status' => 'en_attente',
            'commentaire' => null,
        ]);

        return response()->json($demande, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Demande $demande)
    {
        return response()->json($demande->load('employe', 'historiques', 'validation'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Demande $demande)
    {
        $request->validate([
            'typeDemande' => 'sometimes|in:conge,absence,maladie,maternite',
            'annees_demande' => 'sometimes|integer',
            'droit_conge' => 'sometimes|integer',
            'lieu_demande' => 'sometimes|string|max:255',
            'dateDebut' => 'sometimes|date',
            'dateFin' => 'sometimes|date|after_or_equal:dateDebut',
            'commentaire' => 'nullable|string',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Store old values for balance calculation
        $oldType = $demande->typeDemande;
        $oldStartDate = $demande->dateDebut;
        $oldEndDate = $demande->dateFin;
        $oldStatus = $demande->statut;

        // Calculate old days
        $oldStart = \Carbon\Carbon::parse($oldStartDate);
        $oldEnd = \Carbon\Carbon::parse($oldEndDate);
        $oldDays = $oldEnd->diffInDays($oldStart) + 1;

        // Update the demande
        $demande->update($request->all());
        $demande->calculerNombreJours();

        // Handle balance adjustments if the request was approved and dates/type changed
        if ($oldStatus === 'approuvee') {
            $employee = $demande->employe;
            $balance = $employee->leaveBalance();

            // Calculate new days
            $newStart = \Carbon\Carbon::parse($demande->dateDebut);
            $newEnd = \Carbon\Carbon::parse($demande->dateFin);
            $newDays = $newEnd->diffInDays($newStart) + 1;

            // Check if dates or type changed
            $datesChanged = ($oldStartDate !== $demande->dateDebut) || ($oldEndDate !== $demande->dateFin);
            $typeChanged = $oldType !== $demande->typeDemande;

            if ($datesChanged || $typeChanged) {
                // Restore days from old request
                if ($oldType === 'conge') {
                    $balance->annual_leave += $oldDays;
                } elseif ($oldType === 'absence') {
                    $balance->absence_leave += $oldDays;
                }

                // Deduct days for new request
                if ($demande->typeDemande === 'conge') {
                    if ($balance->annual_leave < $newDays) {
                        return response()->json(['message' => 'Solde insuffisant pour congé annuel après modification'], 400);
                    }
                    $balance->annual_leave -= $newDays;
                } elseif ($demande->typeDemande === 'absence') {
                    if ($balance->absence_leave < $newDays) {
                        return response()->json(['message' => 'Solde insuffisant pour absence après modification'], 400);
                    }
                    $balance->absence_leave -= $newDays;
                }

                $balance->save();
            }
        }

        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande mise à jour',
            'dateAction' => now()->toDateString(),
            'utilisateur' => $user->name,
        ]);

        return response()->json($demande);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Demande $demande)
    {
        // Restore balance before deleting the request
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

        // Create history record for cancellation
        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande annulée',
            'dateAction' => now()->toDateString(),
            'utilisateur' => auth()->user()->name,
        ]);

        $demande->delete();
        return response()->json(['message' => 'Demande deleted successfully']);
    }

    /**
     * Soumettre demande.
     */
    public function soumettre(Demande $demande)
    {
        $demande->soumettre();

        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande soumise',
            'dateAction' => now()->toDateString(),
            'utilisateur' => auth()->user()->name,
        ]);

        return response()->json($demande);
    }

    /**
     * Annuler demande.
     */
    public function annuler(Demande $demande)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Store old status for balance calculation
        $oldStatus = $demande->statut;

        $demande->annuler();

        // Restore balance if the request was approved
        if ($oldStatus === 'approuvee') {
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

        Historique::create([
            'demande_id' => $demande->id,
            'action' => 'Demande annulée',
            'dateAction' => now()->toDateString(),
            'utilisateur' => $user->name,
        ]);

        return response()->json($demande);
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
}
