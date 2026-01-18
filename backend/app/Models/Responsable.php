<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Responsable extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
    ];

    /**
     * Get the validations for the responsable.
     */
    public function validations()
    {
        return $this->hasMany(Validation::class);
    }

    /**
     * Valider demande.
     */
    public function validerDemande(Demande $demande, $commentaire = null)
    {
        $validation = Validation::create([
            'demande_id' => $demande->id,
            'responsable_id' => $this->id,
            'decision' => 'approuvee',
            'commentaire' => $commentaire,
            'dateValidation' => now()->toDateString(),
        ]);
        $demande->statut = 'approuvee';
        $demande->save();
        return $validation;
    }
}
