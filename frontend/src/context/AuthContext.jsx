import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCitizen, registerCitizen, getCurrentCitizen, updateCitizenProfile, verifyLoginOtp } from '../api/auth.api';
import { fetchSavedSchemes, bookmarkScheme, removeBookmark } from '../api/savedSchemes.api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bharatseva_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [savedSchemesList, setSavedSchemesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user profile on startup if token exists
  useEffect(() => {
    const token = localStorage.getItem('bharatseva_auth_token');
    if (token) {
      getCurrentCitizen()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('bharatseva_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('bharatseva_auth_token');
          localStorage.removeItem('bharatseva_user');
          setUser(null);
        });

      // Load saved schemes from database
      fetchSavedSchemes()
        .then((res) => {
          if (res?.data) {
            setSavedSchemesList(res.data.map((item) => item.scheme?.slug || item.schemeSlug));
          }
        })
        .catch(() => {});
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginCitizen({ email, password });
      if (response.token) {
        localStorage.setItem('bharatseva_auth_token', response.token);
      }
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('bharatseva_user', JSON.stringify(response.user));
      }

      // Fetch saved schemes from server
      const savedRes = await fetchSavedSchemes().catch(() => null);
      if (savedRes?.data) {
        setSavedSchemesList(savedRes.data.map((item) => item.scheme?.slug || item.schemeSlug));
      }

      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (mobile, otp) => {
    setLoading(true);
    try {
      const response = await verifyLoginOtp(mobile, otp);
      if (response.token) {
        localStorage.setItem('bharatseva_auth_token', response.token);
      }
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('bharatseva_user', JSON.stringify(response.user));
      }

      // Fetch saved schemes from server
      const savedRes = await fetchSavedSchemes().catch(() => null);
      if (savedRes?.data) {
        setSavedSchemesList(savedRes.data.map((item) => item.scheme?.slug || item.schemeSlug));
      }

      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await registerCitizen(userData);
      if (response.token) {
        localStorage.setItem('bharatseva_auth_token', response.token);
      }
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('bharatseva_user', JSON.stringify(response.user));
      }
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSavedSchemesList([]);
    localStorage.removeItem('bharatseva_user');
    localStorage.removeItem('bharatseva_auth_token');
  };

  const toggleSaveScheme = async (schemeSlug) => {
    if (!user) return false;

    const isSaved = savedSchemesList.includes(schemeSlug);
    try {
      if (isSaved) {
        await removeBookmark(schemeSlug);
        setSavedSchemesList((prev) => prev.filter((s) => s !== schemeSlug));
        return false;
      } else {
        await bookmarkScheme(schemeSlug);
        setSavedSchemesList((prev) => [...prev, schemeSlug]);
        return true;
      }
    } catch {
      // Local fallback in case network hiccup
      const updated = isSaved
        ? savedSchemesList.filter((s) => s !== schemeSlug)
        : [...savedSchemesList, schemeSlug];
      setSavedSchemesList(updated);
      return !isSaved;
    }
  };

  const isSchemeSaved = (schemeSlug) => {
    return Boolean(savedSchemesList.includes(schemeSlug));
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return;
    try {
      const res = await updateCitizenProfile(updatedFields);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('bharatseva_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch {
      const localUpdated = { ...user, ...updatedFields };
      setUser(localUpdated);
      localStorage.setItem('bharatseva_user', JSON.stringify(localUpdated));
      return localUpdated;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        savedSchemes: savedSchemesList,
        login,
        loginWithOtp,
        register,
        logout,
        toggleSaveScheme,
        isSchemeSaved,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
