<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Citizen extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'national_id', 'first_name', 'last_name', 'first_name_ar', 'last_name_ar',
        'date_of_birth', 'gender', 'phone', 'email', 'address', 'city',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
