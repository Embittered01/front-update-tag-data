/**
 * Application Context
 * Contexto principal de la aplicación para compartir servicios y estado
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthService, AuthService } from '@/services/auth';
import { createApiService, ApiService } from '@/services/api';
import type { AuthState, User } from '@/types';

interface AppContextType {
  authService: AuthService;
  apiService: ApiService;
  authState: AuthState;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [authService] = useState(() => getAuthService());
  const [apiService] = useState(() => createApiService(getAuthService()));
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configurar listener para cambios de autenticación
    const handleAuthChange = (newAuthState: AuthState) => {
      setAuthState(newAuthState);
    };

    authService.addAuthListener(handleAuthChange);

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        // Verificar si hay una sesión guardada
        const hasSession = authService.checkSavedSession();
        if (hasSession) {
          setAuthState(authService.getAuthState());
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, [authService]);

  const contextValue: AppContextType = {
    authService,
    apiService,
    authState,
    isLoading
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
