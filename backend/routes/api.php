<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\SoldeCongeController;
use App\Http\Controllers\ValidationController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\ResponsableController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-admin', [AuthController::class, 'registerAdmin']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('employee');
    });

    // Employee accessible routes (basic access for all authenticated users)
    Route::get('employes/{employe}', [EmployeController::class, 'show']);
    Route::get('demandes', [DemandeController::class, 'index']);
    Route::post('demandes', [DemandeController::class, 'store']);
    Route::get('demandes/{demande}', [DemandeController::class, 'show']);
    Route::get('/employee/dashboard', [StatController::class, 'employeeDashboard']);
    Route::get('solde-conges', [SoldeCongeController::class, 'index']);
    Route::get('solde-conges/{solde_conge}', [SoldeCongeController::class, 'show']);
    Route::get('historiques', [HistoriqueController::class, 'index']);
    Route::get('historiques/{historique}', [HistoriqueController::class, 'show']);

    // RH accessible routes (HR management)
    Route::middleware(['auth:sanctum'])->group(function () {
        // Check role in controller methods instead
        // Employés management - temporarily public for testing
        Route::get('employes', [EmployeController::class, 'index'])->withoutMiddleware(['auth:sanctum']);
        Route::post('employes', [EmployeController::class, 'store']);
        Route::post('employes/create-with-user', [EmployeController::class, 'createWithUser']);
        Route::put('employes/{employe}', [EmployeController::class, 'update']);
        Route::delete('employes/{employe}', [EmployeController::class, 'destroy']);
        Route::post('employes/bulk-update', [EmployeController::class, 'bulkUpdate']);
        Route::get('employes-statistics', [EmployeController::class, 'statistics']);
        // Legacy routes for backward compatibility
        Route::get('employes/im/{im}', [EmployeController::class, 'showByIm']);
        Route::put('employes/im/{im}', [EmployeController::class, 'updateByIm']);
        Route::delete('employes/im/{im}', [EmployeController::class, 'destroyByIm']);

        // Demandes management
        Route::put('demandes/{demande}', [DemandeController::class, 'update']);
        Route::delete('demandes/{demande}', [DemandeController::class, 'destroy']);

        // Solde Congés management
        Route::post('solde-conges', [SoldeCongeController::class, 'store']);
        Route::put('solde-conges/{solde_conge}', [SoldeCongeController::class, 'update']);
        Route::delete('solde-conges/{solde_conge}', [SoldeCongeController::class, 'destroy']);

        // Validations routes
        Route::apiResource('validations', ValidationController::class);

        // Responsables routes
        Route::apiResource('responsables', ResponsableController::class);

        // Historiques management
        Route::post('historiques', [HistoriqueController::class, 'store']);
        Route::put('historiques/{historique}', [HistoriqueController::class, 'update']);
        Route::delete('historiques/{historique}', [HistoriqueController::class, 'destroy']);

        // Stats route
        Route::get('/stats', [StatController::class, 'index']);

        // Rapports routes (accessible to RH users)
        Route::apiResource('rapports', RapportController::class);
        Route::get('rapports/{rapport}/download/pdf', [RapportController::class, 'downloadPdf']);
        Route::get('rapports/{rapport}/download/excel', [RapportController::class, 'downloadExcel']);
        Route::get('rapports/{rapport}/download/txt', [RapportController::class, 'downloadTxt']);
    });

    // Admin only routes (full system access)
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // User management
        Route::apiResource('users', UserController::class);
        Route::post('users/reset-balances', [UserController::class, 'resetBalances']);
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('users/bulk-update', [UserController::class, 'bulkUpdate']);
        Route::get('users-statistics', [UserController::class, 'statistics']);

        // Admin Dashboard
        Route::get('/admin/dashboard', [StatController::class, 'adminDashboard']);
    });
});
