<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('gender', ['masculin', 'feminin'])->nullable()->after('status');
            $table->enum('declaration_type', [
                'delai_legal',
                'jugement_annee_cours',
                'jugement_annees_anterieures',
            ])->nullable()->after('gender');
            $table->string('age_group', 15)->nullable()->after('declaration_type');
            $table->tinyInteger('birth_rank')->unsigned()->nullable()->after('age_group');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['gender', 'declaration_type', 'age_group', 'birth_rank']);
        });
    }
};
