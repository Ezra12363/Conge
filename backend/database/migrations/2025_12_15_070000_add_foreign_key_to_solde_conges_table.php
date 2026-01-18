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
        Schema::table('solde_conges', function (Blueprint $table) {
            $table->foreign('employe_id', 'solde_conges_employe_id_fk')->references('id')->on('employes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('solde_conges', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });
    }
};
