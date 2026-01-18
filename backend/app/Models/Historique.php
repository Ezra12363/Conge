<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'action',
        'dateAction',
        'utilisateur',
    ];

    /**
     * Get the demande that owns the historique.
     */
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    /**
     * Enregistrer action.
     */
    public function enregistrerAction($action, $utilisateur)
    {
        $this->action = $action;
        $this->dateAction = now()->toDateString();
        $this->utilisateur = $utilisateur;
        $this->save();
    }
}
