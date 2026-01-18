<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class EmployeController extends Controller
{
    /**
     * Check if user has required role
     */
    protected function checkRole($requiredRoles = [])
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => 'You must be logged in to access this resource.'
            ], 401);
        }

        // Check user role first, then employee role
        $userRole = $user->role;

        if (!$userRole && $user->employee) {
            $userRole = $user->employee->role;
        }

        if (!$userRole || !in_array($userRole, $requiredRoles)) {
            return response()->json([
                'message' => 'Forbidden.',
                'error' => 'You do not have permission to access this resource.'
            ], 403);
        }

        return null; // No error, user has permission
    }

    /**
     * Get dynamic validation rules based on operation type
     */
    protected function getValidationRules($operation = 'create', $employeId = null)
    {
        $baseRules = [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'corps' => 'nullable|string|max:255',
            'grades' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'types_personnel' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
            'date_prise_service' => 'nullable|date',
            'poste' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'role' => 'nullable|in:admin,rh,employe',
        ];

        // Add unique IM validation
        if ($operation === 'create') {
            $baseRules['im'] = 'required|string|max:255|unique:employes';
        } elseif ($operation === 'update' && $employeId) {
            $baseRules['im'] = 'required|string|max:255|unique:employes,im,' . $employeId;
        }

        return $baseRules;
    }

    /**
     * Get fillable fields dynamically from the model
     */
    protected function getFillableFields()
    {
        $employe = new Employe();
        return $employe->getFillable();
    }

    /**
     * Apply dynamic filtering, sorting, and pagination
     */
    protected function applyDynamicQuery(Request $request, Builder $query)
    {
        // Dynamic search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nom', 'like', "%{$searchTerm}%")
                  ->orWhere('prenom', 'like', "%{$searchTerm}%")
                  ->orWhere('im', 'like', "%{$searchTerm}%")
                  ->orWhere('poste', 'like', "%{$searchTerm}%");
            });
        }

        // Dynamic filtering
        $filterableFields = ['sexe', 'corps', 'grades', 'types_personnel', 'role'];
        foreach ($filterableFields as $field) {
            if ($request->has($field) && !empty($request->$field)) {
                $query->where($field, $request->$field);
            }
        }

        // Date range filtering
        if ($request->has('date_prise_service_from')) {
            $query->where('date_prise_service', '>=', $request->date_prise_service_from);
        }
        if ($request->has('date_prise_service_to')) {
            $query->where('date_prise_service', '<=', $request->date_prise_service_to);
        }

        // Dynamic sorting with secure validation
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort direction
        $allowedDirections = ['asc', 'desc'];
        if (!in_array(strtolower($sortDirection), $allowedDirections)) {
            $sortDirection = 'desc';
        }

        // Validate sort field is allowed and use parameterized query
        $allowedSortFields = ['id', 'im', 'nom', 'prenom', 'corps', 'grades', 'sexe', 'types_personnel', 'date_naissance', 'date_prise_service', 'poste', 'role', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            // Default safe sorting
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Display a listing of the resource with dynamic features.
     */
    public function index(Request $request)
    {
        $query = Employe::query();

        // Apply dynamic filtering, searching, and sorting
        $query = $this->applyDynamicQuery($request, $query);

        // Dynamic pagination
        $perPage = $request->get('per_page', 15);
        $employes = $query->paginate($perPage);

        // Calculate dynamic employee statistics
        $total_employees = Employe::count();
        $active_employees = Employe::whereHas('user', function($q) {
            $q->where('status', 'active');
        })->count();

        // Add metadata for frontend
        $response = $employes->toArray();
        $response['total_employees'] = $total_employees;
        $response['active_employees'] = $active_employees;
        $response['filters'] = [
            'sexes' => ['M', 'F'],
            'roles' => ['admin', 'rh', 'employe'],
        ];

        return response()->json($response);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Format dates to ensure consistency
        $request->merge([
            'date_naissance' => $request->date_naissance ? Carbon::parse($request->date_naissance)->format('Y-m-d') : null,
            'date_prise_service' => $request->date_prise_service ? Carbon::parse($request->date_prise_service)->format('Y-m-d') : null,
        ]);

        $validator = Validator::make($request->all(), $this->getValidationRules('create'));

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $validatedData = $validator->validated();

        // Filter only fillable fields
        $fillableData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));

        $employe = Employe::create($fillableData);

        // Create or update leave balance for the employee
        $this->updateLeaveBalance($employe);

        // Load relationships if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $employe->load($relationships);
        }

        return response()->json([
            'employe' => $employe,
            'message' => 'Employé créé avec succès'
        ], 201);
    }

    /**
     * Create employee with user account
     */
    public function createWithUser(Request $request)
    {
        // Format dates to ensure consistency
        $request->merge([
            'date_naissance' => $request->date_naissance ? Carbon::parse($request->date_naissance)->format('Y-m-d') : null,
            'date_prise_service' => $request->date_prise_service ? Carbon::parse($request->date_prise_service)->format('Y-m-d') : null,
        ]);

        $validator = Validator::make($request->all(), array_merge($this->getValidationRules('create'), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'status' => 'required|in:active,inactive',
        ]));

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $validatedData = $validator->validated();

        // Create user first
        $user = \App\Models\User::create([
            'name' => $validatedData['nom'] . ' ' . $validatedData['prenom'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'status' => $validatedData['status'],
        ]);

        // Create employee with user_id
        $employeData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));
        $employeData['user_id'] = $user->id;

        $employe = Employe::create($employeData);

        // Create or update leave balance for the employee
        $this->updateLeaveBalance($employe);

        // Load relationships if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $employe->load($relationships);
        }

        return response()->json([
            'employe' => $employe,
            'user' => $user,
            'message' => 'Employé et compte utilisateur créés avec succès'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Employe $employe)
    {
        // Load relationships dynamically if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $employe->load($relationships);
        }

        return response()->json($employe);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employe $employe)
    {
        // Format dates to ensure consistency
        $request->merge([
            'date_naissance' => $request->date_naissance ? Carbon::parse($request->date_naissance)->format('Y-m-d') : null,
            'date_prise_service' => $request->date_prise_service ? Carbon::parse($request->date_prise_service)->format('Y-m-d') : null,
        ]);

        $validator = Validator::make($request->all(), $this->getValidationRules('update', $employe->id));

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $validatedData = $validator->validated();

        // Filter only fillable fields
        $fillableData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));

        // Store old values for comparison
        $oldRole = $employe->role;
        $oldGrades = $employe->grades;

        $employe->update($fillableData);

        // Update or create leave balance based on employee changes
        $this->updateLeaveBalance($employe, $oldRole, $oldGrades);

        // Load relationships if requested
        if ($request->has('with')) {
            $relationships = explode(',', $request->with);
            $employe->load($relationships);
        }

        return response()->json([
            'employe' => $employe,
            'message' => 'Employé mis à jour avec succès'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employe $employe)
    {
        // Check if employe can be deleted (e.g., don't delete employes with active demandes)
        if ($employe->demandes()->where('statut', 'en_cours')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un employé avec des demandes en cours'
            ], 403);
        }

        $employe->delete();

        return response()->json([
            'message' => 'Employé supprimé avec succès'
        ]);
    }

    /**
     * Bulk operations for employes
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employe_ids' => 'required|array',
            'employe_ids.*' => 'integer|exists:employes,id',
            'action' => 'required|in:update_corps,update_grades,update_poste,update_role,delete',
            'value' => 'required_unless:action,delete'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employeIds = $request->employe_ids;
        $action = $request->action;
        $value = $request->value;

        switch ($action) {
            case 'update_corps':
                Employe::whereIn('id', $employeIds)->update(['corps' => $value]);
                $message = 'Corps mis à jour pour ' . count($employeIds) . ' employés';
                break;

            case 'update_grades':
                Employe::whereIn('id', $employeIds)->update(['grades' => $value]);
                // Update leave balances for all affected employees
                $employees = Employe::whereIn('id', $employeIds)->get();
                foreach ($employees as $employee) {
                    $this->updateLeaveBalance($employee, $employee->role, null); // Old grades was null, new grades is $value
                }
                $message = 'Grades mis à jour pour ' . count($employeIds) . ' employés';
                break;

            case 'update_poste':
                Employe::whereIn('id', $employeIds)->update(['poste' => $value]);
                $message = 'Poste mis à jour pour ' . count($employeIds) . ' employés';
                break;

            case 'update_role':
                Employe::whereIn('id', $employeIds)->update(['role' => $value]);
                // Update leave balances for all affected employees
                $employees = Employe::whereIn('id', $employeIds)->get();
                foreach ($employees as $employee) {
                    $this->updateLeaveBalance($employee, null, $employee->grades); // Old role was null, new role is $value
                }
                $message = 'Rôle mis à jour pour ' . count($employeIds) . ' employés';
                break;

            case 'delete':
                // Check if any employe has active demandes
                $activeDemandes = Employe::whereIn('id', $employeIds)
                    ->whereHas('demandes', function ($q) {
                        $q->where('statut', 'en_cours');
                    })->count();

                if ($activeDemandes > 0) {
                    return response()->json([
                        'message' => 'Impossible de supprimer des employés avec des demandes en cours'
                    ], 403);
                }
                Employe::whereIn('id', $employeIds)->delete();
                $message = count($employeIds) . ' employés supprimés';
                break;
        }

        return response()->json(['message' => $message]);
    }

    /**
     * Get employe statistics
     */
    public function statistics()
    {
        $stats = [
            'total_employes' => Employe::count(),
            'employes_par_sexe' => Employe::selectRaw('sexe, COUNT(*) as count')
                ->groupBy('sexe')
                ->pluck('count', 'sexe')
                ->toArray(),
            'employes_par_corps' => Employe::selectRaw('corps, COUNT(*) as count')
                ->whereNotNull('corps')
                ->groupBy('corps')
                ->pluck('count', 'corps')
                ->toArray(),
            'employes_par_role' => Employe::selectRaw('role, COUNT(*) as count')
                ->whereNotNull('role')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray(),
            'employes_par_types_personnel' => Employe::selectRaw('types_personnel, COUNT(*) as count')
                ->whereNotNull('types_personnel')
                ->groupBy('types_personnel')
                ->pluck('count', 'types_personnel')
                ->toArray(),
            'nouveaux_employes_ce_mois' => Employe::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get employe by IM (legacy method for backward compatibility)
     */
    public function showByIm($im)
    {
        $employe = Employe::where('im', $im)->firstOrFail();
        return response()->json($employe);
    }

    /**
     * Update employe by IM (legacy method for backward compatibility)
     */
    public function updateByIm(Request $request, $im)
    {
        $employe = Employe::where('im', $im)->firstOrFail();

        // Format dates to ensure consistency
        $request->merge([
            'date_naissance' => $request->date_naissance ? Carbon::parse($request->date_naissance)->format('Y-m-d') : null,
            'date_prise_service' => $request->date_prise_service ? Carbon::parse($request->date_prise_service)->format('Y-m-d') : null,
        ]);

        $validator = Validator::make($request->all(), $this->getValidationRules('update', $employe->id));

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Filter only fillable fields
        $fillableData = array_intersect_key($validatedData, array_flip($this->getFillableFields()));

        // Store old values for comparison
        $oldRole = $employe->role;
        $oldGrades = $employe->grades;

        $employe->update($fillableData);

        // Update or create leave balance based on employee changes
        $this->updateLeaveBalance($employe, $oldRole, $oldGrades);

        return response()->json($employe);
    }

    /**
     * Delete employe by IM (legacy method for backward compatibility)
     */
    public function destroyByIm($im)
    {
        $employe = Employe::where('im', $im)->firstOrFail();

        if ($employe->demandes()->where('statut', 'en_cours')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un employé avec des demandes en cours'
            ], 403);
        }

        $employe->delete();
        return response()->json(['message' => 'Employé supprimé avec succès']);
    }

    /**
     * Update or create leave balance based on employee changes
     */
    protected function updateLeaveBalance(Employe $employe, $oldRole = null, $oldGrades = null)
    {
        $currentYear = Carbon::now()->year;

        // Check if leave balance exists for current year
        $leaveBalance = \App\Models\SoldeConge::where('employe_id', $employe->id)
            ->where('annee', $currentYear)
            ->first();

        // Calculate leave days based on role and grades
        $annualLeave = $this->calculateAnnualLeave($employe->role, $employe->grades);
        $absenceLeave = $this->calculateAbsenceLeave($employe->role, $employe->grades);

        if ($leaveBalance) {
            // Update existing balance if role or grades changed
            if ($oldRole !== $employe->role || $oldGrades !== $employe->grades) {
                $leaveBalance->update([
                    'annual_leave' => $annualLeave,
                    'absence_leave' => $absenceLeave,
                ]);
            }
        } else {
            // Create new leave balance if it doesn't exist
            \App\Models\SoldeConge::create([
                'employe_id' => $employe->id,
                'annual_leave' => $annualLeave,
                'absence_leave' => $absenceLeave,
                'annee' => $currentYear,
            ]);
        }
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
