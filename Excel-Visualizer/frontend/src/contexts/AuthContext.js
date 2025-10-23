import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userDataStr = params.get('userData');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to process OAuth callback:', error);
      }
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear auth
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login with:', { email: credentials.email });
      setLoading(true);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Attempt login
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Raw API response:', response);
      
      const { token, user } = response;
      if (!token || !user) {
        console.error('AuthContext: Invalid response format:', response);
        throw new Error('Invalid server response');
      }

      // Store auth data
      console.log('AuthContext: Setting user and auth state');
      setUser(user);
      setIsAuthenticated(true);
      
      // Verify the state was updated
      console.log('AuthContext: Verifying state update:', { 
        userSet: !!user, 
        authSet: true 
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle different error types
      let errorMessage = 'An unexpected error occurred';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || 'Server error';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { token, user } = await authAPI.register(userData);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};