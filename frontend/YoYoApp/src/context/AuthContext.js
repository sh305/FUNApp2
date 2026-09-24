import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banError, setBanError] = useState(null);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('yoyo_token');
      const savedUser = await AsyncStorage.getItem('yoyo_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Refresh latest profile
        refreshProfile(savedToken);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (authToken = token) => {
    if (!authToken) return;
    try {
      const latestUser = await userApi.getMe(authToken);
      setUser(latestUser);
      await AsyncStorage.setItem('yoyo_user', JSON.stringify(latestUser));
    } catch (e) {
      console.warn('Profile refresh error:', e);
    }
  };

  const saveAuthSession = async (authData) => {
    setToken(authData.token);
    setUser(authData.user);
    setBanError(null);
    await AsyncStorage.setItem('yoyo_token', authData.token);
    await AsyncStorage.setItem('yoyo_user', JSON.stringify(authData.user));
  };

  const phoneLogin = async (phone, otp, displayName) => {
    try {
      const data = await authApi.phoneLogin(phone, otp, displayName);
      await saveAuthSession(data);
      return data;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('ban')) {
        setBanError(err.message);
      }
      throw err;
    }
  };

  const googleLogin = async (email, displayName, avatarUrl) => {
    try {
      const data = await authApi.googleLogin(email, displayName, avatarUrl);
      await saveAuthSession(data);
      return data;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('ban')) {
        setBanError(err.message);
      }
      throw err;
    }
  };

  const facebookLogin = async (socialId, displayName, avatarUrl) => {
    try {
      const data = await authApi.facebookLogin(socialId, displayName, avatarUrl);
      await saveAuthSession(data);
      return data;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('ban')) {
        setBanError(err.message);
      }
      throw err;
    }
  };

  const guestLogin = async (preferredName) => {
    const data = await authApi.guestLogin(preferredName);
    await saveAuthSession(data);
    return data;
  };

  const updateCoins = (amount) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, coins: prev.coins + amount };
      AsyncStorage.setItem('yoyo_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setBanError(null);
    await AsyncStorage.removeItem('yoyo_token');
    await AsyncStorage.removeItem('yoyo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        banError,
        isAuthenticated: !!token && !!user,
        phoneLogin,
        googleLogin,
        facebookLogin,
        guestLogin,
        updateCoins,
        refreshProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
