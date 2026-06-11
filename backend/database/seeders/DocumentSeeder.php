<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        $types     = DocumentType::pluck('id', 'id')->keys()->toArray();
        $typeObjs  = DocumentType::all()->keyBy('id');
        $employees = User::where('role', 'employee')->pluck('id')->toArray();
        $statuses  = ['issued', 'issued', 'issued', 'issued', 'processing', 'pending'];
        $payments  = ['cash', 'cash', 'cash', 'card', 'online'];

        $names = ['Mohammed Alaoui', 'Aicha Benali', 'Hassan Tazi', 'Leila Chraibi',
                  'Omar Fassi', 'Zineb Mrani', 'Karim Idrissi', 'Samira Berrada',
                  'Youssef El Amrani', 'Nadia Bensouda'];

        $start = Carbon::now()->subYears(2)->startOfMonth();
        $end   = Carbon::now();

        $rows = [];
        $globalSeq = 1;

        $current = $start->copy();
        while ($current <= $end) {
            $isWeekend = $current->isWeekend();
            $count = $isWeekend ? rand(0, 2) : rand(3, 18);

            for ($i = 0; $i < $count; $i++) {
                $typeId     = $types[array_rand($types)];
                $fee        = $typeObjs[$typeId]->fee ?? 0;
                $employeeId = $employees[array_rand($employees)];
                $name       = $names[array_rand($names)];
                $year       = $current->year;

                $ref = sprintf('MUN-%d-%06d', $year, $globalSeq++);

                $rows[] = [
                    'reference_number'      => $ref,
                    'document_type_id'      => $typeId,
                    'citizen_id'            => null,
                    'issued_by'             => $employeeId,
                    'applicant_name'        => $name,
                    'applicant_national_id' => 'ID' . rand(100000, 999999),
                    'subject_name'          => $name,
                    'issue_date'            => $current->toDateString(),
                    'expiry_date'           => null,
                    'status'                => $statuses[array_rand($statuses)],
                    'fee_paid'              => $fee,
                    'payment_method'        => $payments[array_rand($payments)],
                    'notes'                 => null,
                    'metadata'              => null,
                    'created_at'            => $current->copy()->setTime(rand(8, 16), rand(0, 59))->toDateTimeString(),
                    'updated_at'            => $current->copy()->setTime(rand(8, 16), rand(0, 59))->toDateTimeString(),
                    'deleted_at'            => null,
                ];
            }

            // Bulk insert every 500 rows
            if (count($rows) >= 500) {
                DB::table('documents')->insert($rows);
                $rows = [];
            }

            $current->addDay();
        }

        if (!empty($rows)) {
            DB::table('documents')->insert($rows);
        }
    }
}
