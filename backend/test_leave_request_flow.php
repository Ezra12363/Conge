<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🧪 TESTING LEAVE REQUEST CREATION FLOW\n";
echo "=====================================\n\n";

// Test 1: Check employee profile access
echo "1. Testing Employee Profile Access\n";
echo "-----------------------------------\n";

$user = App\Models\User::where('email', 'jean.dupont@example.com')->first();
if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

echo "✅ User found: {$user->name} ({$user->email})\n";
echo "✅ Role: {$user->role}\n";

$employee = $user->employee;
if (!$employee) {
    echo "❌ Employee relationship not found\n";
    exit(1);
}

echo "✅ Employee relationship exists\n";
echo "✅ Employee ID: {$employee->id}\n";
echo "✅ Employee Name: {$employee->nom} {$employee->prenom}\n\n";

// Test 2: Check leave balances
echo "2. Testing Leave Balances\n";
echo "-------------------------\n";

$balance = $employee->leaveBalance();
if (!$balance) {
    echo "❌ Leave balance not found\n";
    exit(1);
}

// Reset balance for testing
$balance->annual_leave = 21;
$balance->absence_leave = 15;
$balance->save();

echo "✅ Leave balance found and reset\n";
echo "✅ Annual leave: {$balance->annual_leave} days\n";
echo "✅ Absence leave: {$balance->absence_leave} days\n\n";

// Test 3: Test leave request creation
echo "3. Testing Leave Request Creation\n";
echo "----------------------------------\n";

// Simulate authenticated user
$app['auth']->guard()->setUser($user);

$requestData = [
    'typeDemande' => 'conge',
    'annees_demande' => date('Y'),
    'droit_conge' => $balance->annual_leave,
    'lieu_demande' => 'Bureau',
    'dateDebut' => date('Y-m-d', strtotime('+1 week')),
    'dateFin' => date('Y-m-d', strtotime('+1 week +2 days')),
    'commentaire' => 'Test leave request from automated test',
];

$request = new Illuminate\Http\Request();
$request->merge($requestData);

$controller = new App\Http\Controllers\DemandeController();
$updatedBalance = null;

try {
    $response = $controller->store($request);
    $responseData = json_decode($response->getContent(), true);

    if ($response->getStatusCode() === 201) {
        echo "✅ Leave request created successfully!\n";
        echo "✅ Request ID: {$responseData['id']}\n";
        echo "✅ Status: {$responseData['statut']}\n";
        echo "✅ Type: {$responseData['typeDemande']}\n";
        echo "✅ Days: {$responseData['nb_jours']}\n\n";

        // Test 4: Verify balance deduction
        echo "4. Testing Balance Deduction\n";
        echo "-----------------------------\n";

        $updatedBalance = $employee->fresh()->leaveBalance();
        $expectedAnnualLeave = $balance->annual_leave - $responseData['nb_jours'];

        if ($updatedBalance->annual_leave == $expectedAnnualLeave) {
            echo "✅ Balance correctly deducted\n";
            echo "✅ Previous balance: {$balance->annual_leave} days\n";
            echo "✅ New balance: {$updatedBalance->annual_leave} days\n";
            echo "✅ Deducted: {$responseData['nb_jours']} days\n\n";
        } else {
            echo "❌ Balance deduction failed\n";
            echo "Expected: {$expectedAnnualLeave}, Got: {$updatedBalance->annual_leave}\n\n";
        }

        // Test 5: Verify request appears in user's requests
        echo "5. Testing Request Retrieval\n";
        echo "-----------------------------\n";

        $userRequests = $controller->index($request);
        $userRequestsData = json_decode($userRequests->getContent(), true);

        $found = false;
        foreach ($userRequestsData as $req) {
            if ($req['id'] == $responseData['id']) {
                $found = true;
                break;
            }
        }

        if ($found) {
            echo "✅ Request appears in user's request list\n\n";
        } else {
            echo "❌ Request not found in user's request list\n\n";
        }

    } else {
        echo "❌ Leave request creation failed\n";
        echo "Status: {$response->getStatusCode()}\n";
        echo "Response: " . $response->getContent() . "\n\n";
    }

} catch (Exception $e) {
    echo "❌ Exception during leave request creation: {$e->getMessage()}\n\n";
}

// Test 6: Test absence request (only if leave request was successful)
echo "6. Testing Absence Request Creation\n";
echo "------------------------------------\n";

if ($updatedBalance) {
$absenceRequestData = [
    'typeDemande' => 'absence',
    'annees_demande' => date('Y'),
    'droit_conge' => $updatedBalance->absence_leave,
    'lieu_demande' => 'Bureau',
    'dateDebut' => date('Y-m-d', strtotime('+2 weeks')),
    'dateFin' => date('Y-m-d', strtotime('+2 weeks')),
    'commentaire' => 'Test absence request from automated test',
    'nombreJours' => 1, // Add the calculated number of days
];

    $absenceRequest = new Illuminate\Http\Request();
    $absenceRequest->merge($absenceRequestData);

    try {
        $absenceResponse = $controller->store($absenceRequest);
        $absenceResponseData = json_decode($absenceResponse->getContent(), true);

        if ($absenceResponse->getStatusCode() === 201) {
            echo "✅ Absence request created successfully!\n";
            echo "✅ Request ID: {$absenceResponseData['id']}\n";
            echo "✅ Type: {$absenceResponseData['typeDemande']}\n\n";
        } else {
            echo "❌ Absence request creation failed\n";
            echo "Status: {$absenceResponse->getStatusCode()}\n";
            echo "Response: " . $absenceResponse->getContent() . "\n\n";
        }

    } catch (Exception $e) {
        echo "❌ Exception during absence request creation: {$e->getMessage()}\n\n";
    }
} else {
    echo "⚠️ Skipping absence request test - leave request creation failed\n\n";
}

echo "🎉 LEAVE REQUEST FLOW TESTING COMPLETED\n";
echo "========================================\n";
