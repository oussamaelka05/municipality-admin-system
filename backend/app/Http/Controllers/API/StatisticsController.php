<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $today     = now()->toDateString();
        $thisMonth = now()->month;
        $thisYear  = now()->year;

        $todayCount     = Document::whereDate('issue_date', $today)->count();
        $monthCount     = Document::whereMonth('issue_date', $thisMonth)->whereYear('issue_date', $thisYear)->count();
        $yearCount      = Document::whereYear('issue_date', $thisYear)->count();
        $totalCount     = Document::count();

        $todayRevenue   = Document::whereDate('issue_date', $today)->sum('fee_paid');
        $monthRevenue   = Document::whereMonth('issue_date', $thisMonth)->whereYear('issue_date', $thisYear)->sum('fee_paid');
        $yearRevenue    = Document::whereYear('issue_date', $thisYear)->sum('fee_paid');
        $totalRevenue   = Document::sum('fee_paid');

        $byType = DocumentType::withCount(['documents as total' => function ($q) use ($thisYear) {
            $q->whereYear('issue_date', $thisYear);
        }, 'documents as today_total' => function ($q) use ($today) {
            $q->whereDate('issue_date', $today);
        }, 'documents as month_total' => function ($q) use ($thisMonth, $thisYear) {
            $q->whereMonth('issue_date', $thisMonth)->whereYear('issue_date', $thisYear);
        }])->get(['id', 'name', 'code', 'color', 'icon']);

        $statusBreakdown = Document::whereYear('issue_date', $thisYear)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'summary' => [
                'today'  => ['count' => $todayCount,  'revenue' => $todayRevenue],
                'month'  => ['count' => $monthCount,  'revenue' => $monthRevenue],
                'year'   => ['count' => $yearCount,   'revenue' => $yearRevenue],
                'total'  => ['count' => $totalCount,  'revenue' => $totalRevenue],
            ],
            'by_type'          => $byType,
            'status_breakdown' => $statusBreakdown,
            'recent_documents' => Document::with(['documentType', 'issuedBy'])
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }

    public function daily(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year'  => 'nullable|integer|min:2000',
        ]);

        $month = $request->integer('month', now()->month);
        $year  = $request->integer('year', now()->year);

        $data = Document::whereMonth('issue_date', $month)
            ->whereYear('issue_date', $year)
            ->select(
                DB::raw('DATE(issue_date) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(fee_paid) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byType = Document::whereMonth('issue_date', $month)
            ->whereYear('issue_date', $year)
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->select(
                DB::raw('DATE(issue_date) as date'),
                'document_types.name as type_name',
                'document_types.color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date', 'document_types.id', 'document_types.name', 'document_types.color')
            ->orderBy('date')
            ->get();

        return response()->json(['daily' => $data, 'by_type' => $byType, 'month' => $month, 'year' => $year]);
    }

    public function monthly(Request $request): JsonResponse
    {
        $year = $request->integer('year', now()->year);

        $data = Document::whereYear('issue_date', $year)
            ->select(
                DB::raw('MONTH(issue_date) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(fee_paid) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $byType = Document::whereYear('issue_date', $year)
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->select(
                DB::raw('MONTH(issue_date) as month'),
                'document_types.name as type_name',
                'document_types.color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month', 'document_types.id', 'document_types.name', 'document_types.color')
            ->orderBy('month')
            ->get();

        return response()->json(['monthly' => $data, 'by_type' => $byType, 'year' => $year]);
    }

    public function yearly(): JsonResponse
    {
        $data = Document::select(
                DB::raw('YEAR(issue_date) as year'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(fee_paid) as revenue')
            )
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        $byType = Document::join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->select(
                DB::raw('YEAR(issue_date) as year'),
                'document_types.name as type_name',
                'document_types.color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('year', 'document_types.id', 'document_types.name', 'document_types.color')
            ->orderBy('year')
            ->get();

        return response()->json(['yearly' => $data, 'by_type' => $byType]);
    }

    public function employeeStats(Request $request): JsonResponse
    {
        $year  = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $data = User::where('role', 'employee')
            ->where('is_active', true)
            ->withCount(['documents as total_year' => function ($q) use ($year) {
                $q->whereYear('issue_date', $year);
            }, 'documents as total_month' => function ($q) use ($year, $month) {
                $q->whereYear('issue_date', $year)->whereMonth('issue_date', $month);
            }, 'documents as total_today' => function ($q) {
                $q->whereDate('issue_date', now()->toDateString());
            }])
            ->get(['id', 'name', 'email', 'department']);

        return response()->json(['data' => $data, 'year' => $year, 'month' => $month]);
    }

    public function availableYears(): JsonResponse
    {
        $years = Document::selectRaw('YEAR(issue_date) as year')
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        if ($years->isEmpty()) {
            $years = collect([now()->year]);
        }

        return response()->json(['years' => $years]);
    }
}
