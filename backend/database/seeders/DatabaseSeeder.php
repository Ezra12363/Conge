<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user
        $admin = \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'role' => 'admin',
        ]);

        // Create RH user
        $rh = \App\Models\User::create([
            'name' => 'RH User',
            'email' => 'rh@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'role' => 'rh',
        ]);

        // Create sample employees
        $employees = [
            [
                'im' => 'EMP001',
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'corps' => 'Corps A',
                'grades' => 'Grade 1',
                'sexe' => 'M',
                'types_personnel' => 'Permanent',
                'date_naissance' => '1980-01-15',
                'date_prise_service' => '2005-03-01',
                'poste' => 'Développeur',
                'role' => 'employe',
                'user_id' => null,
            ],
            [
                'im' => 'EMP002',
                'nom' => 'Martin',
                'prenom' => 'Marie',
                'corps' => 'Corps B',
                'grades' => 'Grade 2',
                'sexe' => 'F',
                'types_personnel' => 'Contractuel',
                'date_naissance' => '1985-05-20',
                'date_prise_service' => '2010-07-15',
                'poste' => 'Designer',
                'role' => 'employe',
                'user_id' => null,
            ],
            [
                'im' => 'EMP003',
                'nom' => 'Dubois',
                'prenom' => 'Pierre',
                'corps' => 'Corps A',
                'grades' => 'Grade 3',
                'sexe' => 'M',
                'types_personnel' => 'Permanent',
                'date_naissance' => '1975-11-10',
                'date_prise_service' => '2000-09-01',
                'poste' => 'Manager',
                'role' => 'responsable',
                'user_id' => null,
            ],
            [
                'im' => 'EMP004',
                'nom' => 'Leroy',
                'prenom' => 'Sophie',
                'corps' => 'Corps C',
                'grades' => 'Grade 1',
                'sexe' => 'F',
                'types_personnel' => 'Permanent',
                'date_naissance' => '1990-03-25',
                'date_prise_service' => '2015-01-10',
                'poste' => 'Analyste',
                'role' => 'employe',
                'user_id' => null,
            ],
            [
                'im' => 'EMP005',
                'nom' => 'Moreau',
                'prenom' => 'Antoine',
                'corps' => 'Corps B',
                'grades' => 'Grade 2',
                'sexe' => 'M',
                'types_personnel' => 'Contractuel',
                'date_naissance' => '1988-07-30',
                'date_prise_service' => '2012-04-20',
                'poste' => 'Consultant',
                'role' => 'employe',
                'user_id' => null,
            ],
        ];

        foreach ($employees as $employeeData) {
            // Create user for employee
            $user = \App\Models\User::create([
                'name' => $employeeData['prenom'] . ' ' . $employeeData['nom'],
                'email' => strtolower($employeeData['prenom']) . '.' . strtolower($employeeData['nom']) . '@example.com',
                'password' => Hash::make('password'),
                'status' => 'active',
                'role' => 'employee',
            ]);

            $employeeData['user_id'] = $user->id;
            $employee = \App\Models\Employe::create($employeeData);

            // Create leave balance for each employee
            \App\Models\SoldeConge::create([
                'employe_id' => $employee->id,
                'annual_leave' => 30,
                'absence_leave' => 15,
                'annee' => date('Y'),
            ]);
        }
    }
}
