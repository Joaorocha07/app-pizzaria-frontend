import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCliente: boolean;
  isFuncionario: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, telefone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('@pizzaria:token');
      if (storedToken) {
        setToken(storedToken);
        const user = await userService.getMe();
        setUsuario(user);
      }
    } catch {
      await AsyncStorage.multiRemove(['@pizzaria:token']);
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, senha: string) => {
    const { token: newToken, usuario: user } = await authService.login(email, senha);
    await AsyncStorage.setItem('@pizzaria:token', newToken);
    setToken(newToken);
    setUsuario(user);
  }, []);

  const register = useCallback(
    async (nome: string, email: string, senha: string, telefone?: string) => {
      const { token: newToken, usuario: user } = await authService.register(
        nome,
        email,
        senha,
        telefone,
      );
      await AsyncStorage.setItem('@pizzaria:token', newToken);
      setToken(newToken);
      setUsuario(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['@pizzaria:token']);
    setToken(null);
    setUsuario(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await userService.getMe();
    setUsuario(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isLoading,
        isAuthenticated: !!token && !!usuario,
        isCliente: usuario?.papel === 'CLIENTE',
        isFuncionario: usuario?.papel === 'FUNCIONARIO',
        isAdmin: usuario?.papel === 'ADMIN',
        isStaff: usuario?.papel === 'FUNCIONARIO' || usuario?.papel === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
