<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Demande extends Model
{
    use HasFactory;

    /**
     * Nom de la table (optionnel si laravel la détecte)
     */
    protected $table = 'demandes';

    /**
     * Champs autorisés en mass assignment
     */
    protected $fillable = [
        'user_id',            // AJOUTÉ
        'employe_id',
        'typeDemande',        // conge | absence
        'annees_demande',     // ex: 2025
        'droit_conge',        // solde au moment de la demande
        'lieu_demande',
        'dateDebut',
        'dateFin',
        'nombreJours',
        'statut',             // pending | approved | rejected
        'commentaire',
        'justification',      //  AJOUTÉ
        'dateCreation',
    ];

    /**
     * Champs dates
     */
    protected $dates = [
        'dateDebut',
        'dateFin',
        'dateCreation',
        'created_at',
        'updated_at',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'annees_demande' => 'integer',
        'droit_conge' => 'integer',
        'nombreJours' => 'integer',
        'dateDebut' => 'date',
        'dateFin' => 'date',
        'dateCreation' => 'datetime',
    ];

    /**
     * Appended attributes
     */
    protected $appends = [
        'nb_jours',
    ];

    /**
     * Valeurs par défaut
     */
    protected $attributes = [
        'statut' => 'en_attente',
    ];

    /* =====================================================
     |  CONSTANTES (lisible et propre)
     ===================================================== */

    public const TYPE_CONGE = 'conge';
    public const TYPE_ABSENCE = 'absence';

    public const STATUT_PENDING = 'en_attente';
    public const STATUT_APPROVED = 'approuvee';
    public const STATUT_REJECTED = 'refusee';
    public const STATUT_CANCELLED = 'annulee';

    /* =====================================================
     |  RELATIONS
     ===================================================== */

    /**
     * Une demande appartient à un employé
     */
    public function employe()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }

    /**
     * Une demande appartient à un utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /* =====================================================
     |  ACCESSEURS (auto-calcul)
     ===================================================== */

    /**
     * Calcul automatique du nombre de jours
     */
    public function getNombreJoursAttribute($value)
    {
        if ($value) {
            return $value;
        }

        if ($this->dateDebut && $this->dateFin) {
            return Carbon::parse($this->dateDebut)
                ->diffInDays(Carbon::parse($this->dateFin)) + 1;
        }

        return 0;
    }

    /**
     * Accessor for nb_jours (alias for nombreJours)
     */
    public function getNbJoursAttribute()
    {
        return $this->getNombreJoursAttribute($this->nombreJours);
    }

    /**
     * Calculer et sauvegarder le nombre de jours
     */
    public function calculerNombreJours()
    {
        $this->nombreJours = $this->getNombreJoursAttribute(null);
        $this->save();
    }

    /* =====================================================
     |  SCOPES (filtres utiles)
     ===================================================== */

    public function scopePending($query)
    {
        return $query->where('statut', self::STATUT_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('statut', self::STATUT_APPROVED);
    }

    public function scopeByYear($query, $year)
    {
        return $query->where('annees_demande', $year);
    }

    /* =====================================================
     |  HELPERS METIER
     ===================================================== */

    /**
     * Vérifier si c'est la première demande de l'année
     */
    public static function isPremiereDemande($employeId, $type, $annee)
    {
        return !self::where('employe_id', $employeId)
            ->where('typeDemande', $type)
            ->where('annees_demande', $annee)
            ->exists();
    }
}
