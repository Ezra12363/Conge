import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getUser } from '../api';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      // Set authorization header first
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Refresh user data to include employee relationship
      const refreshUserData = async () => {
        try {
          const response = await getUser();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // Fallback to stored user data
          setUser(JSON.parse(user));
        } finally {
          setLoading(false);
        }
      };

      refreshUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setLoginLoading(true);
    try {
      console.log('AuthContext login: Calling apiLogin with credentials:', credentials);
      const res = await apiLogin(credentials);
      console.log('AuthContext login: Response data from API:', res);

      if (!res) {
        throw new Error('Empty response data from server');
      }

      // Handle different response structures
      let data = res;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', data);
          throw new Error('Invalid JSON response from server');
        }
      }

      console.log('AuthContext login: Parsed data:', data);

      // Sanctum returns user data directly, no token needed
      const { user } = data;

      if (!user) {
        console.error('AuthContext login: Missing user data. user:', user);
        throw new Error('Invalid login response: missing user data');
      }

      console.log('AuthContext login: User data:', user);

      // Store token and user in localStorage after login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Set user data
      setUser(user);

      return { user };
    } catch (error) {
      console.error('AuthContext login: Error occurred:', error);
      console.error('AuthContext login: Error response:', error.response);
      console.error('AuthContext login: Error message:', error.message);

      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Network error
        throw new Error('Network error - please check your connection');
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await getUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      refreshUser,
      loading,
      loginLoading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
