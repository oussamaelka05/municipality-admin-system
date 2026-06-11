<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'name_fr', 'name_ar', 'code', 'category', 'description', 'color', 'icon',
        'fee', 'is_active', 'processing_days',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'fee' => 'decimal:2',
            'processing_days' => 'integer',
        ];
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function getDocumentsCountAttribute(): int
    {
        return $this->documents()->count();
    }
}
