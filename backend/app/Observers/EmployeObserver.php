<?php

namespace App\Observers;

use App\Models\Employe;
use App\Models\SoldeConge;
use Carbon\Carbon;

class EmployeObserver
{
    /**
     * Handle the Employe "created" event.
     */
    public function created(Employe $employe)
    {
        $this->creerSoldeSiAbsent($employe->id);
    }

    /**
     * Créer le solde de congé si absent pour l'employé
     */
    public function creerSoldeSiAbsent($employeeId)
    {
        $annee = Carbon::now()->year;

        SoldeConge::firstOrCreate(
            [
                'employe_id' => $employeeId,
                'annee' => $annee
            ],
            [
                'solde_conge_annuel' => 30,
                'solde_absence' => 15
            ]
        );
    }
}
