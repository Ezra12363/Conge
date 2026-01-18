<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoldeConge extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'annual_leave',
        'absence_leave',
        'annee',
    ];

    /**
     * Get the employe that owns the solde_conge.
     */
    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    /**
     * Debit annual leave from balance.
     */
    public function debiterConge($jours)
    {
        $this->annual_leave -= $jours;
        $this->save();
    }

    /**
     * Debit absence leave from balance.
     */
    public function debiterAbsence($jours)
    {
        $this->absence_leave -= $jours;
        $this->save();
    }

    /**
     * Reinitialize balance.
     */
    public function reinitialiserSolde($annualLeave, $absenceLeave)
    {
        $this->annual_leave = $annualLeave;
        $this->absence_leave = $absenceLeave;
        $this->save();
    }
}
