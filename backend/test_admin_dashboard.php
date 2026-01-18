<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\StatController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function testAdminDashboard() {
    echo "Testing Admin Dashboard...\n";

    // Find an admin user
    $adminUser = User::where('role', 'admin')->first();
    if (!$adminUser) {
        echo "No admin user found. Creating one...\n";
        // Try to create admin if none exists
        $adminUser = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active'
        ]);
        echo "Admin user created: {$adminUser->email}\n";
    }

    // Authenticate as admin
    Auth::login($adminUser);
    echo "Authenticated as: {$adminUser->name} ({$adminUser->role})\n";

    // Test the admin dashboard
    $controller = new StatController();
    $request = new Request();

    // Test with default dates
    try {
        echo "Calling adminDashboard method...\n";
        $response = $controller->adminDashboard($request);
        $data = json_decode($response->getContent(), true);

        if (isset($data['error'])) {
            echo "Error in response: {$data['error']}\n";
            if (isset($data['message'])) {
                echo "Error message: {$data['message']}\n";
            }
        } else {
            echo "Success! Dashboard data loaded.\n";
            echo "Stats keys: " . implode(', ', array_keys($data['stats'])) . "\n";
            echo "Charts keys: " . implode(', ', array_keys($data['charts'])) . "\n";
            echo "Recent users count: " . count($data['recentUsers']) . "\n";
            echo "Recent requests count: " . count($data['recentRequests']) . "\n";
        }
    } catch (Exception $e) {
        echo "Exception caught: " . $e->getMessage() . "\n";
        echo "Stack trace: " . $e->getTraceAsString() . "\n";
    }

    // Test with specific dates
    try {
        echo "\nTesting with specific date range...\n";
        $request = new Request();
        $request->merge([
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31'
        ]);

        $response = $controller->adminDashboard($request);
        $data = json_decode($response->getContent(), true);

        if (isset($data['error'])) {
            echo "Error with date range: {$data['error']}\n";
        } else {
            echo "Success with date range!\n";
        }
    } catch (Exception $e) {
        echo "Exception with date range: " . $e->getMessage() . "\n";
    }

    echo "Test completed.\n";
}

testAdminDashboard();
