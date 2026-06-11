<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\DocumentController;
use App\Http\Controllers\API\DocumentTypeController;
use App\Http\Controllers\API\FicheDepouillementController;
use App\Http\Controllers\API\StatisticsController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Route;

// Public auth
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);

    // Document Types
    Route::apiResource('document-types', DocumentTypeController::class);

    // Documents
    Route::apiResource('documents', DocumentController::class);

    // Citizens
    Route::apiResource('citizens', CitizenController::class);

    // Users (admin)
    Route::apiResource('users', UserController::class);

    // Fiche de dépouillement
    Route::get('/fiche-depouillement', [FicheDepouillementController::class, 'monthly']);

    // Statistics
    Route::prefix('statistics')->group(function () {
        Route::get('/dashboard',       [StatisticsController::class, 'dashboard']);
        Route::get('/daily',           [StatisticsController::class, 'daily']);
        Route::get('/monthly',         [StatisticsController::class, 'monthly']);
        Route::get('/yearly',          [StatisticsController::class, 'yearly']);
        Route::get('/employees',       [StatisticsController::class, 'employeeStats']);
        Route::get('/available-years', [StatisticsController::class, 'availableYears']);
    });
});
