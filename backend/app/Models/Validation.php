<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Validation extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'responsable_id',
        'dateValidation',
        'decision',
        'commentaire',
        'status',
    ];

    /**
     * Get the demande that owns the validation.
     */
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    /**
     * Get the responsable that owns the validation.
     */
    public function responsable()
    {
        return $this->belongsTo(Responsable::class);
    }

    /**
     * Valider.
     */
    public function valider()
    {
        $this->decision = 'approuvee';
        $this->save();
    }

    /**
     * Refuser.
     */
    public function refuser()
    {
        $this->decision = 'refusee';
        $this->save();
    }
}
