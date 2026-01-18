<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employe;
use App\Models\SoldeConge;
use App\Models\Demande;
use Carbon\Carbon;

class LeaveBalancesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentYear = Carbon::now()->year;

        // Get all employees
        $employees = Employe::all();

        if ($employees->isEmpty()) {
            $this->command->info('No employees found. Skipping leave balance creation.');
            return;
        }

        $created = 0;
        $skipped = 0;
        $updated = 0;

        foreach ($employees as $employee) {
            // Check if leave balance already exists for current year
            $existingBalance = SoldeConge::where('employe_id', $employee->id)
                ->where('annee', $currentYear)
                ->first();

            if ($existingBalance) {
                // Recalculate balance based on approved requests
                $updatedBalance = $this->recalculateBalance($employee, $currentYear, $existingBalance);
                if ($updatedBalance) {
                    $updated++;
                }
                $skipped++;
                continue;
            }

            // Calculate leave days based on role and grades
            $annualLeave = $this->calculateAnnualLeave($employee->role, $employee->grades);
            $absenceLeave = $this->calculateAbsenceLeave($employee->role, $employee->grades);

            // Create leave balance
            SoldeConge::create([
                'employe_id' => $employee->id,
                'annual_leave' => $annualLeave,
                'absence_leave' => $absenceLeave,
                'annee' => $currentYear,
            ]);

            $created++;
        }

        $this->command->info("Leave balances seeding completed:");
        $this->command->line("- Created: {$created}");
        $this->command->line("- Updated: {$updated}");
        $this->command->line("- Skipped: {$skipped}");
    }

    /**
     * Recalculate balance based on approved leave requests
     */
    protected function recalculateBalance($employee, $year, $balance)
    {
        // Get base leave days
        $baseAnnualLeave = $this->calculateAnnualLeave($employee->role, $employee->grades);
        $baseAbsenceLeave = $this->calculateAbsenceLeave($employee->role, $employee->grades);

        // Get all approved requests for the current year
        $approvedRequests = Demande::where('employe_id', $employee->id)
            ->where('statut', 'approuvee')
            ->whereYear('dateDebut', $year)
            ->get();

        $usedAnnualLeave = 0;
        $usedAbsenceLeave = 0;

        foreach ($approvedRequests as $request) {
            $startDate = Carbon::parse($request->dateDebut);
            $endDate = Carbon::parse($request->dateFin);
            $days = $endDate->diffInDays($startDate) + 1;

            if ($request->typeDemande === 'conge') {
                $usedAnnualLeave += $days;
            } elseif ($request->typeDemande === 'absence') {
                $usedAbsenceLeave += $days;
            }
        }

        // Calculate remaining balance
        $remainingAnnualLeave = $baseAnnualLeave - $usedAnnualLeave;
        $remainingAbsenceLeave = $baseAbsenceLeave - $usedAbsenceLeave;

        // Update balance if different
        if ($balance->annual_leave != $remainingAnnualLeave || $balance->absence_leave != $remainingAbsenceLeave) {
            $balance->update([
                'annual_leave' => max(0, $remainingAnnualLeave), // Ensure non-negative
                'absence_leave' => max(0, $remainingAbsenceLeave),
            ]);
            return true;
        }

        return false;
    }

    /**
     * Calculate annual leave days based on role and grades
     */
    protected function calculateAnnualLeave($role, $grades)
    {
        // Base leave days
        $baseLeave = 30;

        // Adjust based on role
        switch ($role) {
            case 'admin':
                $baseLeave += 5; // Additional days for admin
                break;
            case 'rh':
                $baseLeave += 3; // Additional days for RH
                break;
            case 'employe':
            default:
                // Base leave for regular employees
                break;
        }

        // Adjust based on grades (example logic)
        if ($grades) {
            $gradeMultipliers = [
                'A1' => 1.2,
                'A2' => 1.15,
                'B1' => 1.1,
                'B2' => 1.05,
                // Add more grades as needed
            ];

            if (isset($gradeMultipliers[$grades])) {
                $baseLeave = ceil($baseLeave * $gradeMultipliers[$grades]);
            }
        }

        return min($baseLeave, 45); // Cap at 45 days maximum
    }

    /**
     * Calculate absence leave days based on role and grades
     */
    protected function calculateAbsenceLeave($role, $grades)
    {
        // Base absence days
        $baseAbsence = 15;

        // Adjust based on role
        switch ($role) {
            case 'admin':
                $baseAbsence += 3; // Additional days for admin
                break;
            case 'rh':
                $baseAbsence += 2; // Additional days for RH
                break;
            case 'employe':
            default:
                // Base absence for regular employees
                break;
        }

        // Adjust based on grades (example logic)
        if ($grades) {
            $gradeMultipliers = [
                'A1' => 1.2,
                'A2' => 1.15,
                'B1' => 1.1,
                'B2' => 1.05,
                // Add more grades as needed
            ];

            if (isset($gradeMultipliers[$grades])) {
                $baseAbsence = ceil($baseAbsence * $gradeMultipliers[$grades]);
            }
        }

        return min($baseAbsence, 25); // Cap at 25 days maximum
    }
}
