<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FicheDepouillementController extends Controller
{
    private const DECL_TYPES = [
        'delai_legal',
        'jugement_annee_cours',
        'jugement_annees_anterieures',
    ];

    private const MOTHER_AGE_GROUPS = [
        '-18', '18-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50+',
    ];

    private const DEATH_AGE_GROUPS = [
        'mort-ne', 'moins-1', '01-04', '05-09', '10-14', '15-19',
        '20-24', '25-29', '30-34', '35-39', '40-44', '45-49',
        '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+',
    ];

    public function monthly(Request $request): JsonResponse
    {
        $year  = $request->integer('year',  now()->year);
        $month = $request->integer('month', now()->month);

        $start = sprintf('%d-%02d-01', $year, $month);
        $end   = date('Y-m-t', strtotime($start));

        // ── Births ──────────────────────────────────────────────────────────
        $birthRows = DB::table('documents')
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->where('document_types.category', 'birth')
            ->whereBetween('documents.issue_date', [$start, $end])
            ->whereNull('documents.deleted_at')
            ->select(
                'documents.gender',
                'documents.declaration_type',
                'documents.age_group',
                'documents.birth_rank',
                DB::raw('COUNT(*) as cnt')
            )
            ->groupBy('documents.gender', 'documents.declaration_type', 'documents.age_group', 'documents.birth_rank')
            ->get();

        $births = $this->buildDeclarationSummary($birthRows);
        $births['by_mother_age'] = $this->buildGroupedCounts($birthRows, self::MOTHER_AGE_GROUPS, 'age_group');
        $births['by_rank']       = $this->buildRankCounts($birthRows);

        // ── Deaths ──────────────────────────────────────────────────────────
        $deathRows = DB::table('documents')
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->where('document_types.category', 'death')
            ->whereBetween('documents.issue_date', [$start, $end])
            ->whereNull('documents.deleted_at')
            ->select(
                'documents.gender',
                'documents.declaration_type',
                'documents.age_group',
                DB::raw('COUNT(*) as cnt')
            )
            ->groupBy('documents.gender', 'documents.declaration_type', 'documents.age_group')
            ->get();

        $deaths = $this->buildDeclarationSummary($deathRows);
        $deaths['by_age_group'] = $this->buildGroupedCounts($deathRows, self::DEATH_AGE_GROUPS, 'age_group');

        // ── Marriages ────────────────────────────────────────────────────────
        $marriages = $this->buildGenderSummary('marriage', $start, $end);

        // ── Divorces ─────────────────────────────────────────────────────────
        $divorces = $this->buildGenderSummary('divorce', $start, $end);

        // ── Other document types ──────────────────────────────────────────────
        $otherRows = DB::table('documents')
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->where('document_types.category', 'other')
            ->whereBetween('documents.issue_date', [$start, $end])
            ->whereNull('documents.deleted_at')
            ->select(
                'document_types.id',
                'document_types.name',
                'document_types.name_fr',
                'document_types.name_ar',
                'documents.gender',
                'documents.age_group',
                DB::raw('COUNT(*) as cnt')
            )
            ->groupBy('document_types.id', 'document_types.name', 'document_types.name_fr', 'document_types.name_ar', 'documents.gender', 'documents.age_group')
            ->get();

        $otherByType = [];
        foreach ($otherRows as $row) {
            $id = $row->id;
            if (!isset($otherByType[$id])) {
                $otherByType[$id] = [
                    'name'         => $row->name,
                    'name_fr'      => $row->name_fr,
                    'name_ar'      => $row->name_ar,
                    'total'        => ['masculin' => 0, 'feminin' => 0],
                    'by_age_group' => [],
                ];
            }
            $g = $row->gender === 'feminin' ? 'feminin' : 'masculin';
            $otherByType[$id]['total'][$g] += (int) $row->cnt;

            if (!empty($row->age_group)) {
                if (!isset($otherByType[$id]['by_age_group'][$row->age_group])) {
                    $otherByType[$id]['by_age_group'][$row->age_group] = ['masculin' => 0, 'feminin' => 0];
                }
                $otherByType[$id]['by_age_group'][$row->age_group][$g] += (int) $row->cnt;
            }
        }

        return response()->json([
            'year'      => $year,
            'month'     => $month,
            'births'    => $births,
            'deaths'    => $deaths,
            'marriages' => $marriages,
            'divorces'  => $divorces,
            'other'     => array_values($otherByType),
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function buildDeclarationSummary($rows): array
    {
        $empty  = ['masculin' => 0, 'feminin' => 0];
        $result = [
            'delai_legal'                 => $empty,
            'jugement_annee_cours'        => $empty,
            'jugement_annees_anterieures' => $empty,
            'total'                       => $empty,
        ];

        foreach ($rows as $row) {
            $key = in_array($row->declaration_type, self::DECL_TYPES, true)
                ? $row->declaration_type
                : 'delai_legal';
            $g   = $row->gender === 'feminin' ? 'feminin' : 'masculin';

            $result[$key][$g]    += (int) $row->cnt;
            $result['total'][$g] += (int) $row->cnt;
        }

        return $result;
    }

    private function buildGroupedCounts($rows, array $groups, string $field): array
    {
        $empty  = ['masculin' => 0, 'feminin' => 0];
        $result = array_fill_keys($groups, $empty);

        foreach ($rows as $row) {
            $key = $row->{$field} ?? null;
            if ($key === null || !array_key_exists($key, $result)) continue;
            $g = $row->gender === 'feminin' ? 'feminin' : 'masculin';
            $result[$key][$g] += (int) $row->cnt;
        }

        return $result;
    }

    private function buildGenderSummary(string $category, string $start, string $end): array
    {
        $rows = DB::table('documents')
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->where('document_types.category', $category)
            ->whereBetween('documents.issue_date', [$start, $end])
            ->whereNull('documents.deleted_at')
            ->select('documents.gender', DB::raw('COUNT(*) as cnt'))
            ->groupBy('documents.gender')
            ->get();

        $result = ['masculin' => 0, 'feminin' => 0, 'total' => 0];
        foreach ($rows as $row) {
            $g = $row->gender === 'feminin' ? 'feminin' : 'masculin';
            $result[$g]      += (int) $row->cnt;
            $result['total'] += (int) $row->cnt;
        }
        return $result;
    }

    private function buildRankCounts($rows): array
    {
        $empty  = ['masculin' => 0, 'feminin' => 0];
        $keys   = array_merge(range(1, 9), [10]);
        $result = array_fill_keys($keys, $empty);

        foreach ($rows as $row) {
            if ($row->birth_rank === null) continue;
            $rankKey = $row->birth_rank >= 10 ? 10 : (int) $row->birth_rank;
            if (!isset($result[$rankKey])) continue;
            $g = $row->gender === 'feminin' ? 'feminin' : 'masculin';
            $result[$rankKey][$g] += (int) $row->cnt;
        }

        return $result;
    }
}
