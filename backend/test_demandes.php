<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employe;
use App\Models\Demande;
use Illuminate\Http\Request;
use App\Http\Controllers\DemandeController;

// Create test users and employees if they don't exist
$adminUser = User::where('email', 'admin@test.com')->first();
if (!$adminUser) {
    $adminUser = User::create([
        'name' => 'Admin Test',
        'email' => 'admin@test.com',
        'password' => bcrypt('password123'),
        'role' => 'admin',
        'status' => 'active',
    ]);
}

$rhUser = User::where('email', 'rh@test.com')->first();
if (!$rhUser) {
    $rhUser = User::create([
        'name' => 'RH Test',
        'email' => 'rh@test.com',
        'password' => bcrypt('password123'),
        'role' => 'rh',
        'status' => 'active',
    ]);
}

$employeeUser = User::where('email', 'employee@test.com')->first();
if (!$employeeUser) {
    $employeeUser = User::create([
        'name' => 'Employee Test',
        'email' => 'employee@test.com',
        'password' => bcrypt('password123'),
        'role' => 'employe',
        'status' => 'active',
    ]);
}

// Create employees linked to users
$adminEmployee = Employe::where('user_id', $adminUser->id)->first();
if (!$adminEmployee) {
    $adminEmployee = Employe::create([
        'user_id' => $adminUser->id,
        'nom' => 'Admin',
        'prenom' => 'Test',
        'im' => 'ADMIN001',
        'corps' => 'Admin',
        'grades' => 'A1',
        'sexe' => 'M',
        'types_personnel' => 'Admin',
        'date_naissance' => '1980-01-01',
        'date_prise_service' => '2020-01-01',
        'poste' => 'Administrator',
        'role' => 'admin',
    ]);
}

$rhEmployee = Employe::where('user_id', $rhUser->id)->first();
if (!$rhEmployee) {
    $rhEmployee = Employe::create([
        'user_id' => $rhUser->id,
        'nom' => 'RH',
        'prenom' => 'Test',
        'im' => 'RH001',
        'corps' => 'RH',
        'grades' => 'B1',
        'sexe' => 'F',
        'types_personnel' => 'RH',
        'date_naissance' => '1985-01-01',
        'date_prise_service' => '2021-01-01',
        'poste' => 'HR Manager',
        'role' => 'rh',
    ]);
}

$regularEmployee = Employe::where('user_id', $employeeUser->id)->first();
if (!$regularEmployee) {
    $regularEmployee = Employe::create([
        'user_id' => $employeeUser->id,
        'nom' => 'Employee',
        'prenom' => 'Test',
        'im' => 'EMP001',
        'corps' => 'Employee',
        'grades' => 'C1',
        'sexe' => 'M',
        'types_personnel' => 'Employee',
        'date_naissance' => '1990-01-01',
        'date_prise_service' => '2022-01-01',
        'poste' => 'Developer',
        'role' => 'employe',
    ]);
}

// Create some test demandes
$adminDemande = Demande::where('employe_id', $adminEmployee->id)->first();
if (!$adminDemande) {
    $adminDemande = Demande::create([
        'employe_id' => $adminEmployee->id,
        'type_conge' => 'annual',
        'date_debut' => '2025-01-01',
        'date_fin' => '2025-01-05',
        'motif' => 'Vacation',
        'statut' => 'en_cours',
        'duree' => 5,
    ]);
}

$rhDemande = Demande::where('employe_id', $rhEmployee->id)->first();
if (!$rhDemande) {
    $rhDemande = Demande::create([
        'employe_id' => $rhEmployee->id,
        'type_conge' => 'sick',
        'date_debut' => '2025-02-01',
        'date_fin' => '2025-02-03',
        'motif' => 'Medical leave',
        'statut' => 'approuvee',
        'duree' => 3,
    ]);
}

$employeeDemande = Demande::where('employe_id', $regularEmployee->id)->first();
if (!$employeeDemande) {
    $employeeDemande = Demande::create([
        'employe_id' => $regularEmployee->id,
        'type_conge' => 'personal',
        'date_debut' => '2025-03-01',
        'date_fin' => '2025-03-02',
        'motif' => 'Personal matter',
        'statut' => 'refusee',
        'duree' => 2,
    ]);
}

// Test the controller logic
$controller = new DemandeController();

// Test as admin user
echo "Testing as Admin User:\n";
$request = new Request();
$request->setUserResolver(function () use ($adminUser) {
    return $adminUser;
});
try {
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "Admin sees " . count($data['data']) . " demandes\n";
    foreach ($data['data'] as $demande) {
        echo "  - Demande ID: {$demande['id']}, Employee: {$demande['employe']['nom']} {$demande['employe']['prenom']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test as RH user
echo "\nTesting as RH User:\n";
$request = new Request();
$request->setUserResolver(function () use ($rhUser) {
    return $rhUser;
});
try {
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "RH sees " . count($data['data']) . " demandes\n";
    foreach ($data['data'] as $demande) {
        echo "  - Demande ID: {$demande['id']}, Employee: {$demande['employe']['nom']} {$demande['employe']['prenom']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test as regular employee
echo "\nTesting as Regular Employee:\n";
$request = new Request();
$request->setUserResolver(function () use ($employeeUser) {
    return $employeeUser;
});
try {
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "Employee sees " . count($data['data']) . " demandes\n";
    foreach ($data['data'] as $demande) {
        echo "  - Demande ID: {$demande['id']}, Employee: {$demande['employe']['nom']} {$demande['employe']['prenom']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nTest completed!\n";
