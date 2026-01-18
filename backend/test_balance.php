<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employe;
use Illuminate\Support\Facades\Auth;

echo "Testing Balance Checking and Deduction\n";
echo "=====================================\n";

// Find an employee user
$user = User::where('role', 'employee')->first();
if (!$user) {
    echo "No employee user found. Please create one first.\n";
    exit(1);
}

echo "Found employee user: {$user->name} (ID: {$user->id})\n";

// Get employee record
$employee = $user->employee;
if (!$employee) {
    echo "No employee record found for user.\n";
    exit(1);
}

echo "Employee ID: {$employee->id}\n";

// Get initial balance
$balance = $employee->leaveBalance();
echo "Initial Balance:\n";
echo "  Annual Leave: {$balance->annual_leave}\n";
echo "  Absence Leave: {$balance->absence_leave}\n";
echo "  Maladie: {$balance->maladie}\n";
echo "  Maternite: {$balance->maternite}\n\n";

// Simulate authentication
Auth::login($user);

// Test creating a leave request with sufficient balance
echo "Testing Annual Leave Request (3 days)...\n";
$controller = new \App\Http\Controllers\DemandeController();
$request = new \Illuminate\Http\Request([
    'typeDemande' => 'conge',
    'annees_demande' => date('Y'),
    'droit_conge' => 30,
    'lieu_demande' => 'Test Location',
    'dateDebut' => now()->addDays(1)->toDateString(),
    'dateFin' => now()->addDays(3)->toDateString(),
    'commentaire' => 'Test annual leave request',
]);

try {
    $response = $controller->store($request);
    $data = json_decode($response->getContent(), true);

    if (isset($data['message']) && strpos($data['message'], 'insuffisant') !== false) {
        echo "  ❌ Request rejected due to insufficient balance: {$data['message']}\n";
    } else {
        echo "  ✅ Request created successfully\n";
        $balance->refresh();
        echo "  Updated Balance - Annual Leave: {$balance->annual_leave}\n";
    }
} catch (Exception $e) {
    echo "  ❌ Error: {$e->getMessage()}\n";
}

echo "\nTesting Absence Request (2 days)...\n";
$request2 = new \Illuminate\Http\Request([
    'typeDemande' => 'absence',
    'annees_demande' => date('Y'),
    'droit_conge' => 15,
    'lieu_demande' => 'Test Location',
    'dateDebut' => now()->addDays(5)->toDateString(),
    'dateFin' => now()->addDays(6)->toDateString(),
    'commentaire' => 'Test absence request',
]);

try {
    $response2 = $controller->store($request2);
    $data2 = json_decode($response2->getContent(), true);

    if (isset($data2['message']) && strpos($data2['message'], 'insuffisant') !== false) {
        echo "  ❌ Request rejected due to insufficient balance: {$data2['message']}\n";
    } else {
        echo "  ✅ Request created successfully\n";
        $balance->refresh();
        echo "  Updated Balance - Absence Leave: {$balance->absence_leave}\n";
    }
} catch (Exception $e) {
    echo "  ❌ Error: {$e->getMessage()}\n";
}

echo "\nTesting Insufficient Balance Scenario...\n";
$request3 = new \Illuminate\Http\Request([
    'typeDemande' => 'conge',
    'annees_demande' => date('Y'),
    'droit_conge' => 30,
    'lieu_demande' => 'Test Location',
    'dateDebut' => now()->addDays(10)->toDateString(),
    'dateFin' => now()->addDays(50)->toDateString(), // Requesting 41 days
    'commentaire' => 'Test insufficient balance request',
]);

try {
    $response3 = $controller->store($request3);
    $data3 = json_decode($response3->getContent(), true);

    if (isset($data3['message']) && strpos($data3['message'], 'insuffisant') !== false) {
        echo "  ✅ Correctly rejected due to insufficient balance: {$data3['message']}\n";
    } else {
        echo "  ❌ Should have been rejected but was accepted\n";
    }
} catch (Exception $e) {
    echo "  ❌ Error: {$e->getMessage()}\n";
}

echo "\nFinal Balance:\n";
$balance->refresh();
echo "  Annual Leave: {$balance->annual_leave}\n";
echo "  Absence Leave: {$balance->absence_leave}\n";

echo "\nTesting completed.\n";
