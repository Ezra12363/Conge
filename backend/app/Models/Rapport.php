<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'contenu',
        'type',
        'date_generation',
        'user_id',
    ];

    protected $casts = [
        'date_generation' => 'datetime',
    ];

    /**
     * Get the user that owns the rapport.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
