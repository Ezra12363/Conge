<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Models\SoldeConge;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Update the leave balance for employee ID 1
    $balance = SoldeConge::where('employe_id', 1)->first();
    if ($balance) {
        $balance->annual_leave = 30;
        $balance->absence_leave = 15;
        $balance->save();
        echo "✅ Leave balance updated successfully!\n";
        echo "Annual leave: {$balance->annual_leave} days\n";
        echo "Absence leave: {$balance->absence_leave} days\n";
    } else {
        echo "❌ No leave balance found for employee ID 1\n";
    }
} catch (Exception $e) {
    echo "❌ Error updating balance: " . $e->getMessage() . "\n";
}
