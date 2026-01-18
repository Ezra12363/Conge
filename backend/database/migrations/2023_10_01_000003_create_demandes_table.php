<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained()->onDelete('cascade');
            $table->enum('typeDemande', ['conge', 'absence']);
            $table->integer('annees_demande');
            $table->integer('droit_conge');
            $table->string('lieu_demande');
            $table->date('dateDebut');
            $table->date('dateFin');
            $table->integer('nombreJours');
            $table->enum('statut', ['en_attente', 'approuvee', 'refusee', 'annulee']);
            $table->text('commentaire')->nullable();
            $table->date('dateCreation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('demandes');
    }
};
