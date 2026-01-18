<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'im',
        'nom',
        'prenom',
        'corps',
        'grades',
        'sexe',
        'types_personnel',
        'date_naissance',
        'date_prise_service',
        'poste',
        'role',
        'departement',
    ];

    /**
     * Get the user that owns the employe.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the leave balance for the employe.
     */
    public function leaveBalance()
    {
        $currentYear = now()->year;
        $balance = $this->hasOne(SoldeConge::class)->where('annee', $currentYear)->first();
        if (!$balance) {
            $balance = new SoldeConge([
                'employe_id' => $this->id,
                'annee' => $currentYear,
                'annual_leave' => 30, // Default values
                'absence_leave' => 15,
            ]);
        }
        return $balance;
    }

    /**
     * Get the demandes for the employe.
     */
    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    /**
     * Get info.
     */
    public function getInfo()
    {
        return [
            'im' => $this->im,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'corps' => $this->corps,
            'grades' => $this->grades,
            'sexe' => $this->sexe,
            'types_personnel' => $this->types_personnel,
            'date_naissance' => $this->date_naissance,
            'date_prise_service' => $this->date_prise_service,
            'poste' => $this->poste,
        ];
    }
}
