<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rapport;
use App\Models\User;
use Carbon\Carbon;

class RapportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get an admin user or the first user if no admin exists
        $adminUser = User::where('role', 'admin')->first();
        if (!$adminUser) {
            $adminUser = User::first();
        }

        if (!$adminUser) {
            return; // No users exist, skip seeding
        }

        $rapports = [
            [
                'titre' => 'Rapport Mensuel des Congés - Janvier 2024',
                'contenu' => 'Rapport détaillé des congés pour le mois de janvier 2024.

Statistiques générales:
- Total des demandes: 45
- Demandes approuvées: 38 (84%)
- Demandes rejetées: 7 (16%)
- Congés utilisés: 156 jours
- Solde restant moyen: 18 jours

Répartition par département:
- Ressources Humaines: 12 demandes
- Développement: 15 demandes
- Marketing: 8 demandes
- Finance: 10 demandes

Observations:
- Forte demande en période de fin d\'année
- Taux d\'approbation satisfaisant
- Nécessité de planifier les congés à l\'avance',
                'type' => 'mensuel',
                'date_generation' => Carbon::now()->subDays(5),
                'user_id' => $adminUser->id,
            ],
            [
                'titre' => 'Rapport Trimestriel des Absences - Q1 2024',
                'contenu' => 'Analyse trimestrielle des absences pour le premier trimestre 2024.

Résumé des absences:
- Congés annuels: 234 jours
- Congés maladie: 45 jours
- Congés exceptionnels: 12 jours
- Formation: 28 jours

Taux d\'absence par employé:
- Moyenne: 4.2 jours par employé
- Maximum: 15 jours (Employé ID: 123)
- Minimum: 0 jours (Employé ID: 456)

Impact sur la productivité:
- Jours travaillés perdus: 319
- Coût estimé: 45,000€
- Recommandations pour réduction des absences',
                'type' => 'trimestriel',
                'date_generation' => Carbon::now()->subDays(10),
                'user_id' => $adminUser->id,
            ],
            [
                'titre' => 'Rapport Annuel des Ressources Humaines 2023',
                'contenu' => 'Rapport annuel complet des ressources humaines pour l\'année 2023.

Effectif total: 150 employés
- Hommes: 85 (57%)
- Femmes: 65 (43%)

Turnover: 12%
- Départs volontaires: 8
- Licenciements: 4
- Retraites: 3

Formation:
- Heures de formation totales: 2,450
- Budget formation: 85,000€
- Satisfaction moyenne: 4.2/5

Objectifs 2024:
- Réduire le turnover à 8%
- Augmenter le budget formation de 15%
- Améliorer la satisfaction employé',
                'type' => 'annuel',
                'date_generation' => Carbon::now()->subDays(15),
                'user_id' => $adminUser->id,
            ],
            [
                'titre' => 'Rapport des Solde de Congés - Février 2024',
                'contenu' => 'État des lieux des soldes de congés au 28 février 2024.

Soldes par catégorie:
- Congés annuels: Moyenne 22 jours
- Congés exceptionnels: Moyenne 3 jours
- RTT: Moyenne 8 jours

Employés avec solde faible (< 5 jours):
- Dupont Jean: 3 jours
- Martin Marie: 2 jours
- Durand Paul: 4 jours

Actions recommandées:
- Encourager la prise de congés
- Planifier les congés d\'été
- Réviser la politique de congés',
                'type' => 'solde',
                'date_generation' => Carbon::now()->subDays(2),
                'user_id' => $adminUser->id,
            ],
        ];

        foreach ($rapports as $rapportData) {
            Rapport::create($rapportData);
        }
    }
}
