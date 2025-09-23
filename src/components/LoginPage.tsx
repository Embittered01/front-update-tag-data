/**
 * LoginPage Component
 * Componente de autenticación/login
 */

'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faUser, faLock, faExclamationTriangle, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '@/contexts/AppContext';

interface LoginCredentials {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { authService } = useApp();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.login(credentials.username, credentials.password);
      
      if (!result.success) {
        setError(result.error || 'Error de autenticación');
      }
      // Si el login es exitoso, el contexto se actualizará automáticamente
    } catch (error) {
      setError('Error de conexión. Verifica tu conexión a internet.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = credentials.username.trim() && credentials.password.trim() && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faRoad} className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Gestor de Toll Gates
          </h2>
          <p className="text-gray-600 mt-2">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field */}
          <div>
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="form-input pl-12"
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
                autoComplete="username"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input pl-12"
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-error flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="btn-primary w-full py-3 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="spinner h-5 w-5 mr-2" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Gestor de Toll Gates. Arquitectura Modular.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
