<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@municipality.gov'], [
            'name'       => 'Administrator',
            'password'   => Hash::make('Admin@1234'),
            'role'       => 'admin',
            'department' => 'Administration',
            'is_active'  => true,
        ]);

        $employees = [
            ['name' => 'Ahmed Benali',   'email' => 'ahmed@municipality.gov',   'department' => 'Civil Status'],
            ['name' => 'Fatima Zahra',   'email' => 'fatima@municipality.gov',   'department' => 'Civil Status'],
            ['name' => 'Youssef Idrissi','email' => 'youssef@municipality.gov',  'department' => 'Legalization'],
            ['name' => 'Khadija Alami',  'email' => 'khadija@municipality.gov',  'department' => 'Residence Services'],
        ];

        foreach ($employees as $emp) {
            User::firstOrCreate(['email' => $emp['email']], array_merge($emp, [
                'password'  => Hash::make('Employee@1234'),
                'role'      => 'employee',
                'is_active' => true,
            ]));
        }
    }
}
