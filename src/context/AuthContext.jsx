import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    
    if (accessToken) {
      try {
        const profile = await fetchProfile();
        if (profile) {
          setUser({
            email: profile.email,
            name: profile.name,
            role: role || 'Learner',
            experience_level: profile.experience_level,
          });
        } else {
          // If profile fails, local storage might be cleared by interceptor
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Use OAuth2 Form Data for /login (expected by backend)
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await api.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token, refresh_token, role } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('role', role);

      const profile = await fetchProfile();
      if (profile) {
        setUser({
          email: profile.email,
          name: profile.name,
          role: role,
          experience_level: profile.experience_level,
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Invalid email or password' 
      };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password, role) => {
    setLoading(true);
    try {
      await api.post('/register', { name, email, password, role });
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post(`/logout?refresh_token_str=${refreshToken}`);
      } catch (error) {
        console.error('Logout error on backend:', error);
      }
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register: registerUser, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
