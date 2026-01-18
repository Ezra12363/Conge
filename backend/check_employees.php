<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo 'Checking employee records for seeded users...' . PHP_EOL;

$users = App\Models\User::whereIn('email', ['jean.dupont@example.com', 'marie.martin@example.com', 'pierre.durand@example.com'])->get();

foreach ($users as $user) {
    echo 'User: ' . $user->name . ' (' . $user->email . ')' . PHP_EOL;
    echo '  Role: ' . $user->role . PHP_EOL;
    echo '  Employee relationship: ' . ($user->employee ? 'EXISTS' : 'MISSING') . PHP_EOL;

    if ($user->employee) {
        echo '  Employee ID: ' . $user->employee->id . PHP_EOL;
        echo '  Employee Name: ' . $user->employee->nom . ' ' . $user->employee->prenom . PHP_EOL;
    } else {
        echo '  ❌ No employee record found!' . PHP_EOL;
    }
    echo PHP_EOL;
}

// Check total counts
echo 'Total Users: ' . App\Models\User::count() . PHP_EOL;
echo 'Total Employees: ' . App\Models\Employe::count() . PHP_EOL;
