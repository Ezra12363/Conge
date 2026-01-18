<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create admin user
$user = User::create([
    'name' => 'Admin Test',
    'email' => 'admin@test.com',
    'password' => Hash::make('password123'),
    'role' => 'admin',
    'status' => 'active',
]);

echo "Admin user created successfully!\n";
echo "Email: admin@test.com\n";
echo "Password: password123\n";
echo "Role: admin\n";
