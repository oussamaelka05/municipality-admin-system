<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Birth Certificate',          'name_ar' => 'شهادة الميلاد',           'code' => 'BC',  'color' => '#3B82F6', 'icon' => 'Baby',       'fee' => 50,  'processing_days' => 1],
            ['name' => 'Death Certificate',          'name_ar' => 'شهادة الوفاة',            'code' => 'DC',  'color' => '#6B7280', 'icon' => 'HeartCrack', 'fee' => 50,  'processing_days' => 1],
            ['name' => 'Marriage Certificate',       'name_ar' => 'عقد الزواج',              'code' => 'MC',  'color' => '#EC4899', 'icon' => 'Heart',      'fee' => 100, 'processing_days' => 2],
            ['name' => 'Residence Certificate',      'name_ar' => 'شهادة الإقامة',           'code' => 'RC',  'color' => '#10B981', 'icon' => 'Home',       'fee' => 30,  'processing_days' => 1],
            ['name' => 'Single Status Certificate',  'name_ar' => 'شهادة العزوبة',           'code' => 'SS',  'color' => '#8B5CF6', 'icon' => 'UserCheck',  'fee' => 80,  'processing_days' => 3],
            ['name' => 'Document Legalization',      'name_ar' => 'تصديق الوثائق',           'code' => 'DL',  'color' => '#F59E0B', 'icon' => 'Stamp',      'fee' => 120, 'processing_days' => 2],
            ['name' => 'Family Record Extract',      'name_ar' => 'مستخرج من سجل الأسرة',    'code' => 'FRE', 'color' => '#06B6D4', 'icon' => 'Users',      'fee' => 40,  'processing_days' => 1],
            ['name' => 'Identity Certificate',       'name_ar' => 'شهادة الهوية',            'code' => 'IC',  'color' => '#EF4444', 'icon' => 'IdCard',     'fee' => 60,  'processing_days' => 2],
            ['name' => 'Nationality Certificate',    'name_ar' => 'شهادة الجنسية',           'code' => 'NC',  'color' => '#14B8A6', 'icon' => 'Flag',       'fee' => 80,  'processing_days' => 5],
            ['name' => 'Good Conduct Certificate',   'name_ar' => 'شهادة حسن السيرة والسلوك','code' => 'GCC', 'color' => '#84CC16', 'icon' => 'ShieldCheck', 'fee' => 70, 'processing_days' => 3],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(['code' => $type['code']], array_merge($type, ['is_active' => true]));
        }
    }
}
