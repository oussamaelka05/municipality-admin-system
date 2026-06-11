<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique(); // Auto-generated: MUN-2026-000001
            $table->foreignId('document_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('citizen_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('issued_by')->constrained('users')->restrictOnDelete();
            $table->string('applicant_name');           // Name of the person requesting
            $table->string('applicant_national_id')->nullable();
            $table->string('subject_name')->nullable(); // Name the document is about
            $table->date('issue_date');
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['pending', 'processing', 'issued', 'rejected', 'cancelled'])->default('issued');
            $table->decimal('fee_paid', 8, 2)->default(0);
            $table->enum('payment_method', ['cash', 'card', 'online', 'exempt'])->default('cash');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Extra flexible fields
            $table->timestamps();
            $table->softDeletes();

            $table->index(['issue_date', 'document_type_id']);
            $table->index(['issued_by', 'issue_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
