<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Citizen::withCount('documents')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('national_id', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate($request->integer('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'national_id'   => 'nullable|string|max:50|unique:citizens,national_id',
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'first_name_ar' => 'nullable|string|max:100',
            'last_name_ar'  => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female',
            'phone'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
            'address'       => 'nullable|string|max:255',
            'city'          => 'nullable|string|max:100',
        ]);

        $citizen = Citizen::create($data);

        return response()->json(['data' => $citizen, 'message' => 'Citizen created'], 201);
    }

    public function show(Citizen $citizen): JsonResponse
    {
        $citizen->loadCount('documents');
        $citizen->load(['documents.documentType']);
        return response()->json(['data' => $citizen]);
    }

    public function update(Request $request, Citizen $citizen): JsonResponse
    {
        $data = $request->validate([
            'national_id'   => 'nullable|string|max:50|unique:citizens,national_id,' . $citizen->id,
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'first_name_ar' => 'nullable|string|max:100',
            'last_name_ar'  => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female',
            'phone'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
            'address'       => 'nullable|string|max:255',
            'city'          => 'nullable|string|max:100',
        ]);

        $citizen->update($data);

        return response()->json(['data' => $citizen, 'message' => 'Citizen updated']);
    }

    public function destroy(Citizen $citizen): JsonResponse
    {
        $citizen->delete();
        return response()->json(['message' => 'Citizen deleted']);
    }
}
