<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\DemandeController;
use App\Models\User;
use App\Models\Employe;
use Illuminate\Support\Facades\Auth;

// Simulate authentication and test the index method
function testDemandeIndex() {
    echo "Testing DemandeController index method...\n";

    // Test with employee role
    $employeeUser = User::where('role', 'employee')->first();
    if ($employeeUser) {
        Auth::login($employeeUser);
        $controller = new DemandeController();
        $request = new Request();
        $response = $controller->index($request);
        $demandes = json_decode($response->getContent(), true);

        echo "Employee user demandes count: " . count($demandes) . "\n";
        if (count($demandes) > 0) {
            echo "First demande employe_id: " . $demandes[0]['employe_id'] . "\n";
            echo "Employee user employe_id: " . $employeeUser->employee->id . "\n";
        }
    }

    // Test with admin role
    $adminUser = User::where('role', 'admin')->first();
    if ($adminUser) {
        Auth::login($adminUser);
        $controller = new DemandeController();
        $request = new Request();
        $response = $controller->index($request);
        $demandes = json_decode($response->getContent(), true);

        echo "Admin user demandes count: " . count($demandes) . "\n";
    }

    echo "Test completed.\n";
}

testDemandeIndex();
