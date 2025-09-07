'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  age: number;
  email?: string;
  mobile?: string;
  address: string;
  aadharCardNumber: number;
  role: 'voter' | 'admin';
  isVoted: boolean;
  // Candidacy fields
  isCandidateApplicant: boolean;
  candidateApplicationStatus: 'pending' | 'approved' | 'rejected' | 'none';
  candidateParty?: string;
  candidateManifesto?: string;
  candidateAppliedAt?: Date;
  candidateApprovedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginPending, setLoginPending] = useState(false);

  useEffect(() => {
    // Only run on initial mount - don't re-run during logout/login cycles
    console.log('🔄 AuthContext useEffect - initial auth check on mount');
    
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    console.log('🔄 AuthContext useEffect - checking stored auth:', {
      hasToken: !!storedToken,
      hasRole: !!storedRole
    });
    
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Fetch user profile
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []); // Empty dependency array - only run on mount

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log('🔍 Fetching user profile with token:', authToken ? 'Token exists' : 'No token', 'Current states:', { loggingOut, loading });
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ User profile fetched successfully:', response.data);
      
      // Don't set user if logout is in progress
      if (loggingOut) {
        console.log('⚠️ Profile fetch completed but logout in progress - ignoring');
        return;
      }
      
      setUser(response.data.user);
      console.log('👤 User state updated with profile data');
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      console.error('Response:', (error as any).response?.data);
      console.error('Status:', (error as any).response?.status);
      
      // Don't call logout if we're already logging out
      if (!loggingOut) {
        console.log('🔄 Calling logout due to profile fetch failure...');
        logout(); // Clear invalid token
      } else {
        console.log('⚠️ Profile fetch failed but logout already in progress');
      }
    } finally {
      if (!loggingOut) {
        setLoginPending(false);
        setLoading(false);
        console.log('🏁 fetchUserProfile completed - login pending and loading cleared');
      } else {
        console.log('⚠️ fetchUserProfile completed but logout in progress - keeping states');
      }
    }
  };

  const login = (token: string, role: string) => {
    console.log('🔗 AuthContext login called with:', { token: token ? 'Token provided' : 'No token', role, currentUser: user ? 'User exists' : 'No user', loggingOut, loginPending });
    
    // Don't proceed if logout is in progress or login is already pending
    if (loggingOut || loginPending) {
      console.log('⚠️ Login attempt blocked - logout or login already in progress');
      return;
    }
    
    // Set login pending to prevent multiple simultaneous logins
    setLoginPending(true);
    setLoading(true);
    
    setToken(token);
    setRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    
    console.log('💾 State and localStorage updated');
    
    // Set cookie for middleware (expires in 24 hours)
    const cookieString = `token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=strict`;
    console.log('🍪 Setting cookie:', cookieString);
    document.cookie = cookieString;
    
    // Verify cookie was set
    setTimeout(() => {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      console.log('🔍 Cookie verification:', tokenCookie ? 'Cookie set successfully' : 'Cookie not found');
      if (tokenCookie) console.log('🍪 Cookie value:', tokenCookie.substring(0, 20) + '...');
    }, 100);
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('📋 Axios header set');
    
    // Fetch user profile
    console.log('👤 About to fetch user profile...');
    fetchUserProfile(token);
  };

  const logout = () => {
    console.log('😪 Starting logout process...');
    
    // Set logout state to prevent race conditions
    setLoggingOut(true);
    setLoading(true);
    
    // Clear all state immediately
    setUser(null);
    setToken(null);
    setRole(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Clear cookie with proper expiry
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=strict';
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('✨ Logout completed - all state cleared');
    
    // Reset states after logout process
    setTimeout(() => {
      setLoggingOut(false);
      setLoginPending(false);
      setLoading(false);
      console.log('🏁 Ready for new authentication');
    }, 150);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    login,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
