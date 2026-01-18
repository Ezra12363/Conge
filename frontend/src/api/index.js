import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Set default authorization header if token exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }

  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not on the home page or login page
      // and not making a getUser call during auth initialization
      const currentPath = window.location.pathname;
      const isAuthRelated = error.config?.url?.includes('/user') && currentPath === '/';

      if (!isAuthRelated && currentPath !== '/' && currentPath !== '/login') {
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (credentials) => {
  try {
    console.log('API login: Attempting login with credentials:', credentials);

    // First, get CSRF cookie for Sanctum
    console.log('API login: Getting CSRF cookie...');
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    console.log('API login: CSRF cookie obtained');

    // Now login with CSRF token
    console.log('API login: Making login request...');
    const response = await axios.post('http://localhost:8000/api/login', credentials, { withCredentials: true });
    console.log('API login response:', response);
    console.log('API login response.data:', response.data);
    console.log('API login response.status:', response.status);
    return response.data;
  } catch (error) {
    console.error('API login error:', error);
    console.error('API login error.response:', error.response);
    console.error('API login error.response?.data:', error.response?.data);
    console.error('API login error.response?.status:', error.response?.status);
    throw error;
  }
};
export const logout = () => api.post('/logout');
export const getUser = () => api.get('/user');

// Users
export const getUsers = (params = {}) => api.get('/users', { params });
export const getUserById = (id, params = {}) => api.get(`/users/${id}`, { params });
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const resetPassword = (id, data = {}) => api.post(`/users/${id}/reset-password`, data);
export const toggleStatus = (id) => api.post(`/users/${id}/toggle-status`);
export const bulkUpdateUsers = (data) => api.post('/users/bulk-update', data);
export const getUserStatistics = () => api.get('/users-statistics');

// Employés
export const getEmployes = (params = {}) => api.get('/employes', { params });
export const getEmploye = (id, params = {}) => api.get(`/employes/${id}`, { params });
export const createEmploye = (data) => api.post('/employes', data);
export const createEmployeWithUser = (data) => api.post('/employes/create-with-user', data);
export const updateEmploye = (id, data) => api.put(`/employes/${id}`, data);
export const deleteEmploye = (id) => api.delete(`/employes/${id}`);
export const bulkUpdateEmployes = (data) => api.post('/employes/bulk-update', data);
export const getEmployeStatistics = () => api.get('/employes-statistics');
// Legacy methods for backward compatibility
export const getEmployeByIm = (im) => api.get(`/employes/im/${im}`);
export const updateEmployeByIm = (im, data) => api.put(`/employes/im/${im}`, data);
export const deleteEmployeByIm = (im) => api.delete(`/employes/im/${im}`);

// Demandes (Congés et Absences)
export const getDemandes = () => api.get('/demandes');
export const createDemande = (demande) => api.post('/demandes', demande);
export const updateDemande = (id, demande) => api.put(`/demandes/${id}`, demande);
export const deleteDemande = (id) => api.delete(`/demandes/${id}`);
export const approveDemande = (id, commentaire = '') => api.post('/validations', { demande_id: id, decision: 'approuvee', commentaire });
export const rejectDemande = (id, commentaire = '') => api.post('/validations', { demande_id: id, decision: 'refusee', commentaire });

// Solde Congés
export const getSoldeConges = () => api.get('/solde-conges');
export const getSoldeConge = (id) => api.get(`/solde-conges/${id}`);
export const updateSoldeConge = (id, data) => api.put(`/solde-conges/${id}`, data);

// Validations
export const getValidations = () => api.get('/validations');
export const createValidation = (validation) => api.post('/validations', validation);
export const updateValidation = (id, validation) => api.put(`/validations/${id}`, validation);

// Historiques
export const getHistoriques = () => api.get('/historiques');

// Rapports
export const getRapports = () => api.get('/rapports');
export const createRapport = (rapport) => api.post('/rapports', rapport);
export const deleteRapport = (id) => api.delete(`/rapports/${id}`);

// Stats
export const getStats = () => api.get('/stats');

// Admin Dashboard
export const getAdminDashboard = (params = {}) => api.get('/admin/dashboard', { params });

export default api;
