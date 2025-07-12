import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const UserAuthContext = createContext();

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Assuming apiService has getCurrentUser method for user data fetching
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('User auth initialization failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.loginUser(email, password);
      setUser(response.user);  // Note: response user data key
      return true;
    } catch (error) {
      console.error('User login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.removeToken();
  };

  return (
    <UserAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};
