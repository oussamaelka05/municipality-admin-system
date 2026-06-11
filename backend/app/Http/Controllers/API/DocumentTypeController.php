<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = DocumentType::withCount('documents')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $types]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'name_fr'         => 'nullable|string|max:255',
            'name_ar'         => 'nullable|string|max:255',
            'code'            => 'required|string|max:20|unique:document_types,code',
            'category'        => 'nullable|in:birth,death,marriage,divorce,other',
            'description'     => 'nullable|string',
            'color'           => 'nullable|string|max:20',
            'icon'            => 'nullable|string|max:50',
            'fee'             => 'nullable|numeric|min:0',
            'is_active'       => 'boolean',
            'processing_days' => 'nullable|integer|min:1',
        ]);

        $type = DocumentType::create($data);

        return response()->json(['data' => $type, 'message' => 'Document type created'], 201);
    }

    public function show(DocumentType $documentType): JsonResponse
    {
        $documentType->loadCount('documents');
        return response()->json(['data' => $documentType]);
    }

    public function update(Request $request, DocumentType $documentType): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'name_fr'         => 'nullable|string|max:255',
            'name_ar'         => 'nullable|string|max:255',
            'code'            => 'sometimes|string|max:20|unique:document_types,code,' . $documentType->id,
            'category'        => 'nullable|in:birth,death,marriage,divorce,other',
            'description'     => 'nullable|string',
            'color'           => 'nullable|string|max:20',
            'icon'            => 'nullable|string|max:50',
            'fee'             => 'nullable|numeric|min:0',
            'is_active'       => 'boolean',
            'processing_days' => 'nullable|integer|min:1',
        ]);

        $documentType->update($data);

        return response()->json(['data' => $documentType, 'message' => 'Document type updated']);
    }

    public function destroy(DocumentType $documentType): JsonResponse
    {
        if ($documentType->documents()->exists()) {
            return response()->json(['message' => 'Cannot delete: document type has issued documents'], 422);
        }

        $documentType->delete();

        return response()->json(['message' => 'Document type deleted']);
    }
}
