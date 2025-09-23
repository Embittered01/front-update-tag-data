/**
 * Home Page - Toll Gate Manager
 * Página principal que maneja la autenticación y redirección al dashboard
 */

'use client';

import { useApp } from '@/contexts/AppContext';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { authState, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
