<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Demande;
use App\Models\Employe;
use App\Models\User;
use Carbon\Carbon;

class StatController extends Controller
{
    /**
     * Display statistics for API.
     */
    public function index()
    {
        $stats = [
            'total_employees' => Employe::count(),
            'total_users' => User::count(),
            'total_requests' => Demande::count(),
            'pending_requests' => Demande::where('statut', Demande::STATUT_PENDING)->count(),
            'approved_requests' => Demande::where('statut', Demande::STATUT_APPROVED)->count(),
            'rejected_requests' => Demande::where('statut', Demande::STATUT_REJECTED)->count(),
        ];

        // Monthly leave requests data for chart (last 12 months)
        $conges = [];
        $currentDate = Carbon::now();
        for ($i = 11; $i >= 0; $i--) {
            $date = $currentDate->copy()->subMonths($i);
            $monthName = $date->format('M Y');
            $count = Demande::whereNotNull('dateCreation')
                           ->whereYear('dateCreation', $date->year)
                           ->whereMonth('dateCreation', $date->month)
                           ->count();
            $conges[] = [
                'month' => $monthName,
                'count' => $count
            ];
        }

        // Assuming absences are a type of demande, use same data for now
        $absences = $conges;

        // Top absent employees (most demandes)
        $topAbsent = Demande::selectRaw('user_id, COUNT(*) as absences')
                           ->with('user.employee')
                           ->groupBy('user_id')
                           ->orderBy('absences', 'desc')
                           ->limit(10)
                           ->get()
                           ->map(function ($demande) {
                               return [
                                   'name' => $demande->user->employee->nom . ' ' . $demande->user->employee->prenom ?? $demande->user->name,
                                   'absences' => $demande->absences
                               ];
                           });

        return response()->json(array_merge($stats, [
            'conges' => $conges,
            'absences' => $absences,
            'topAbsent' => $topAbsent
        ]));
    }

    /**
     * Get comprehensive admin dashboard data with dynamic calculations
     */
    public function adminDashboard(Request $request)
    {
        try {
            // Get date range from request or default to current year
            $startDate = $request->get('start_date', Carbon::now()->startOfYear()->format('Y-m-d'));
            $endDate = $request->get('end_date', Carbon::now()->endOfYear()->format('Y-m-d'));

            // Validate date format
            $startDate = Carbon::parse($startDate)->format('Y-m-d');
            $endDate = Carbon::parse($endDate)->format('Y-m-d');

        // Basic stats with date filtering
        $totalUsers = User::count();
        $activeEmployees = User::where('status', 'active')->count();
        $totalRequests = Demande::whereNotNull('dateCreation')
                                ->whereBetween('dateCreation', [$startDate, $endDate])
                                ->count();
        $pendingRequests = Demande::where('statut', Demande::STATUT_PENDING)
                                 ->whereNotNull('dateCreation')
                                 ->whereBetween('dateCreation', [$startDate, $endDate])
                                 ->count();
        $approvedRequests = Demande::where('statut', Demande::STATUT_APPROVED)
                                  ->whereNotNull('dateCreation')
                                  ->whereBetween('dateCreation', [$startDate, $endDate])
                                  ->count();
        $rejectedRequests = Demande::where('statut', Demande::STATUT_REJECTED)
                                  ->whereNotNull('dateCreation')
                                  ->whereBetween('dateCreation', [$startDate, $endDate])
                                  ->count();

        // Monthly requests data for chart (last 12 months)
        $monthlyData = [];
        $currentDate = Carbon::now();
        for ($i = 11; $i >= 0; $i--) {
            $date = $currentDate->copy()->subMonths($i);
            $monthName = $date->format('M Y');
            $count = Demande::whereNotNull('dateCreation')
                           ->whereYear('dateCreation', $date->year)
                           ->whereMonth('dateCreation', $date->month)
                           ->count();
            $monthlyData[] = [
                'month' => $monthName,
                'demandes' => $count,
                'approved' => Demande::where('statut', Demande::STATUT_APPROVED)
                                    ->whereNotNull('dateCreation')
                                    ->whereYear('dateCreation', $date->year)
                                    ->whereMonth('dateCreation', $date->month)
                                    ->count(),
                'pending' => Demande::where('statut', Demande::STATUT_PENDING)
                                   ->whereNotNull('dateCreation')
                                   ->whereYear('dateCreation', $date->year)
                                   ->whereMonth('dateCreation', $date->month)
                                   ->count()
            ];
        }

        // Status distribution for pie chart
        $statusData = [];
        $statuses = [
            Demande::STATUT_PENDING => 'En attente',
            Demande::STATUT_APPROVED => 'Approuvée',
            Demande::STATUT_REJECTED => 'Refusée'
        ];

        foreach ($statuses as $key => $label) {
            $count = Demande::where('statut', $key)
                           ->whereNotNull('dateCreation')
                           ->whereBetween('dateCreation', [$startDate, $endDate])
                           ->count();
            if ($count > 0) {
                $statusData[] = [
                    'name' => $label,
                    'value' => $count,
                    'color' => $this->getStatusColor($key),
                    'percentage' => $totalRequests > 0 ? round(($count / $totalRequests) * 100, 1) : 0
                ];
            }
        }

        // Recent users with employee details
        $recentUsers = User::with(['employee'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10)
                          ->get()
                          ->map(function ($user) {
                              try {
                                  return [
                                      'id' => $user->id,
                                      'name' => $user->name ?? 'N/A',
                                      'email' => $user->email ?? 'N/A',
                                      'role' => $user->role ?? 'Employé',
                                      'status' => $user->status ?? 'N/A',
                                      'employee_id' => $user->employee?->id,
                                      'department' => $user->employee?->departement ?? 'N/A',
                                      'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : 'N/A',
                                      'last_login' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'N/A'
                                  ];
                              } catch (\Exception $e) {
                                  \Log::warning('Error mapping user ' . $user->id . ': ' . $e->getMessage());
                                  return [
                                      'id' => $user->id,
                                      'name' => 'Erreur de données',
                                      'email' => 'N/A',
                                      'role' => 'N/A',
                                      'status' => 'N/A',
                                      'employee_id' => null,
                                      'department' => 'N/A',
                                      'created_at' => 'N/A',
                                      'last_login' => 'N/A'
                                  ];
                              }
                          });

        // Recent requests
        $recentRequests = Demande::with(['user.employee'])
                                ->whereNotNull('dateCreation')
                                ->orderBy('dateCreation', 'desc')
                                ->limit(10)
                                ->get()
                                ->map(function ($demande) {
                                    try {
                                        return [
                                            'id' => $demande->id,
                                            'user_name' => $demande->user?->name ?? 'N/A',
                                            'type' => $demande->typeDemande ?? 'N/A',
                                            'statut' => $demande->statut ?? 'N/A',
                                            'date_creation' => $demande->dateCreation ? $demande->dateCreation->format('Y-m-d') : 'N/A',
                                            'date_debut' => $demande->dateDebut ? $demande->dateDebut->format('Y-m-d') : 'N/A',
                                            'date_fin' => $demande->dateFin ? $demande->dateFin->format('Y-m-d') : 'N/A',
                                            'nombre_jours' => $demande->nombreJours ?? 0
                                        ];
                                    } catch (\Exception $e) {
                                        \Log::warning('Error mapping demande ' . $demande->id . ': ' . $e->getMessage());
                                        return [
                                            'id' => $demande->id,
                                            'user_name' => 'Erreur de données',
                                            'type' => 'N/A',
                                            'statut' => 'N/A',
                                            'date_creation' => 'N/A',
                                            'date_debut' => 'N/A',
                                            'date_fin' => 'N/A',
                                            'nombre_jours' => 0
                                        ];
                                    }
                                });

        // Department-wise stats
        $departmentStats = Employe::selectRaw('departement, COUNT(*) as count')
                                 ->whereNotNull('departement')
                                 ->groupBy('departement')
                                 ->get()
                                 ->map(function ($dept) {
                                     return [
                                         'department' => $dept->departement,
                                         'count' => $dept->count,
                                         'requests' => Demande::whereHas('user.employee', function($q) use ($dept) {
                                             $q->where('departement', $dept->departement);
                                         })->count()
                                     ];
                                 });

        // Performance metrics
        $avgRequestsPerUser = $totalUsers > 0 ? round($totalRequests / $totalUsers, 1) : 0;
        $approvalRate = $totalRequests > 0 ? round(($approvedRequests / $totalRequests) * 100) : 0;
        $pendingRate = $totalRequests > 0 ? round(($pendingRequests / $totalRequests) * 100) : 0;
        $rejectionRate = $totalRequests > 0 ? round(($rejectedRequests / $totalRequests) * 100) : 0;

        // Growth metrics (comparing with previous period)
        $daysInPeriod = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
        $previousPeriodStart = Carbon::parse($startDate)->subDays($daysInPeriod);
        $previousPeriodEnd = Carbon::parse($startDate)->subDay();
        $previousRequests = Demande::whereNotNull('dateCreation')
                                  ->whereBetween('dateCreation', [$previousPeriodStart, $previousPeriodEnd])
                                  ->count();
        $growthRate = $previousRequests > 0 ? round((($totalRequests - $previousRequests) / $previousRequests) * 100, 1) : 0;

            return response()->json([
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'activeEmployees' => $activeEmployees,
                    'totalRequests' => $totalRequests,
                    'pendingRequests' => $pendingRequests,
                    'approvedRequests' => $approvedRequests,
                    'rejectedRequests' => $rejectedRequests,
                    'avgRequestsPerUser' => $avgRequestsPerUser,
                    'approvalRate' => $approvalRate,
                    'pendingRate' => $pendingRate,
                    'rejectionRate' => $rejectionRate,
                    'growthRate' => $growthRate
                ],
                'charts' => [
                    'monthly' => $monthlyData,
                    'status' => $statusData,
                    'department' => $departmentStats
                ],
                'recentUsers' => $recentUsers,
                'recentRequests' => $recentRequests,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'lastUpdated' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin Dashboard Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'error' => 'Erreur lors du chargement des données du tableau de bord',
                'message' => config('app.debug') ? $e->getMessage() : 'Une erreur interne s\'est produite'
            ], 500);
        }
    }

    /**
     * Display admin dashboard view.
     */
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'active_employees' => User::where('status', 'active')->count(),
            'total_requests' => Demande::count(),
            'pending_requests' => Demande::where('statut', Demande::STATUT_PENDING)->count(),
            'approved_requests' => Demande::where('statut', Demande::STATUT_APPROVED)->count(),
            'rejected_requests' => Demande::where('statut', Demande::STATUT_REJECTED)->count(),
        ];

        return view('admin.dashboard', compact('stats'));
    }

    /**
     * Get color for status
     */
    private function getStatusColor($status)
    {
        $colors = [
            Demande::STATUT_PENDING => '#ff9800',
            Demande::STATUT_APPROVED => '#4caf50',
            Demande::STATUT_REJECTED => '#f44336',
            'ANNULER' => '#9e9e9e'
        ];

        return $colors[$status] ?? '#9e9e9e';
    }

    /**
     * Get employee dashboard statistics
     */
    public function employeeDashboard(Request $request)
    {
        try {
            $user = auth()->user();
            $currentYear = Carbon::now()->year;

            // Get employee's total requests
            $totalRequests = Demande::where('user_id', $user->id)->count();

            // Get employee's approved requests for current year
            $approvedRequestsThisYear = Demande::where('user_id', $user->id)
                ->where('statut', Demande::STATUT_APPROVED)
                ->whereYear('dateCreation', $currentYear)
                ->count();

            // Get employee's pending requests
            $pendingRequests = Demande::where('user_id', $user->id)
                ->where('statut', Demande::STATUT_PENDING)
                ->count();

            // Get employee's active requests (approved requests that are currently active)
            $activeRequests = Demande::where('user_id', $user->id)
                ->where('statut', Demande::STATUT_APPROVED)
                ->where('dateDebut', '<=', Carbon::now()->format('Y-m-d'))
                ->where('dateFin', '>=', Carbon::now()->format('Y-m-d'))
                ->count();

            // Get employee's rejected requests
            $rejectedRequests = Demande::where('user_id', $user->id)
                ->where('statut', Demande::STATUT_REJECTED)
                ->count();

            return response()->json([
                'total_requests' => $totalRequests,
                'approved_requests_this_year' => $approvedRequestsThisYear,
                'pending_requests' => $pendingRequests,
                'active_requests' => $activeRequests,
                'rejected_requests' => $rejectedRequests,
                'current_year' => $currentYear
            ]);
        } catch (\Exception $e) {
            \Log::error('Employee Dashboard Stats Error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Erreur lors du chargement des statistiques',
                'message' => config('app.debug') ? $e->getMessage() : 'Une erreur interne s\'est produite'
            ], 500);
        }
    }
}
