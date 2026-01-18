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
        Schema::create('solde_conges', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->unsignedBigInteger('employe_id');
            // Temporarily removed foreign key to resolve errno: 150
            // $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
            $table->integer('annual_leave')->default(30);   // Congés annuels
            $table->integer('absence_leave')->default(15);  // Absences
            $table->year('annee'); // ex: 2025
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
        Schema::dropIfExists('solde_conges');
    }
};
