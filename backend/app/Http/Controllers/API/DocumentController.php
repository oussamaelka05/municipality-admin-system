<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['documentType', 'issuedBy', 'citizen'])
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('reference_number', 'like', "%{$s}%")
                  ->orWhere('applicant_name', 'like', "%{$s}%")
                  ->orWhere('applicant_national_id', 'like', "%{$s}%")
                  ->orWhere('subject_name', 'like', "%{$s}%");
            });
        }

        if ($request->filled('document_type_id')) {
            $query->where('document_type_id', $request->document_type_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        if ($request->filled('issued_by')) {
            $query->where('issued_by', $request->issued_by);
        }

        $perPage = $request->integer('per_page', 15);
        $documents = $query->paginate($perPage);

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
            'issue_date'       => 'required|date',
            'expiry_date'      => 'nullable|date',
            'status'           => 'nullable|in:pending,processing,issued,rejected,cancelled',
            'fee_paid'         => 'nullable|numeric|min:0',
            'payment_method'   => 'nullable|in:cash,card,online,exempt',
            'gender'           => 'nullable|in:masculin,feminin',
            'declaration_type' => 'nullable|in:delai_legal,jugement_annee_cours,jugement_annees_anterieures',
            'age_group'        => 'nullable|string|max:15',
            'birth_rank'       => 'nullable|integer|min:1|max:10',
            'notes'            => 'nullable|string',
        ]);

        $data['applicant_name'] = 'N/A';
        $data['fee_paid']       = $data['fee_paid'] ?? 0;

        $data['issued_by'] = $request->user()->id;
        $data['status']    = $data['status'] ?? 'issued';

        $document = Document::create($data);
        $document->load(['documentType', 'issuedBy', 'citizen']);

        return response()->json(['data' => $document, 'message' => 'Document issued successfully'], 201);
    }

    public function show(Document $document): JsonResponse
    {
        $document->load(['documentType', 'issuedBy', 'citizen']);
        return response()->json(['data' => $document]);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'issue_date'       => 'sometimes|date',
            'expiry_date'      => 'nullable|date',
            'status'           => 'sometimes|in:pending,processing,issued,rejected,cancelled',
            'fee_paid'         => 'nullable|numeric|min:0',
            'payment_method'   => 'nullable|in:cash,card,online,exempt',
            'gender'           => 'nullable|in:masculin,feminin',
            'declaration_type' => 'nullable|in:delai_legal,jugement_annee_cours,jugement_annees_anterieures',
            'age_group'        => 'nullable|string|max:15',
            'birth_rank'       => 'nullable|integer|min:1|max:10',
            'notes'            => 'nullable|string',
        ]);

        $document->update($data);
        $document->load(['documentType', 'issuedBy', 'citizen']);

        return response()->json(['data' => $document, 'message' => 'Document updated']);
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }
}
