<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference_number', 'document_type_id', 'citizen_id', 'issued_by',
        'applicant_name', 'applicant_national_id', 'subject_name',
        'issue_date', 'expiry_date', 'status', 'fee_paid', 'payment_method',
        'gender', 'declaration_type', 'age_group', 'birth_rank',
        'notes', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'fee_paid' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Document $document) {
            $document->reference_number = static::generateReference();
        });
    }

    public static function generateReference(): string
    {
        $year = now()->year;
        $count = static::whereYear('created_at', $year)->withTrashed()->count() + 1;
        return sprintf('MUN-%d-%06d', $year, $count);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
