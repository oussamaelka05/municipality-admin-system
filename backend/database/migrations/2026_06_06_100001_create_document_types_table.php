<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g. Birth Certificate
            $table->string('name_ar')->nullable(); // Arabic name
            $table->string('code')->unique(); // e.g. BC, DC, MC
            $table->text('description')->nullable();
            $table->string('color')->default('#3B82F6'); // UI color
            $table->string('icon')->default('FileText');  // Lucide icon name
            $table->decimal('fee', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->integer('processing_days')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
