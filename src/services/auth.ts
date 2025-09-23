/**
 * Authentication Service
 * Servicio de autenticación siguiendo principios de Single Responsibility
 */

import { API_CONFIG, STORAGE_KEYS } from '@/constants';
import { saveToStorage, getFromStorage, removeFromStorage, getErrorMessage } from '@/utils';
import type { User, LoginResponse, AuthState } from '@/types';

/**
 * Tipo para los datos de sesión almacenados
 */
interface SessionData {
  token: string;
  user: User;
  timestamp: number;
}

/**
 * Tipo para listeners de autenticación
 */
type AuthListener = (authState: AuthState) => void;

/**
 * Clase para manejo de autenticación
 */
export class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private listeners: AuthListener[] = [];

  constructor() {
    // Auto-verificar sesión guardada al inicializar
    if (typeof window !== 'undefined') {
      this.checkSavedSession();
    }
  }

  /**
   * Realiza el login del usuario
   */
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Manejar tanto 'token' como 'access_token' para compatibilidad
        const token = data.access_token || data.token;
        
        if (!token) {
          return {
            success: false,
            error: 'No se recibió token de autenticación'
          };
        }

        this.token = token;
        this.user = data.user;
        if (this.token && this.user) {
          this.saveSession(this.token, this.user);
        }
        this.notifyListeners({ 
          isAuthenticated: true, 
          token: this.token, 
          user: this.user 
        });

        return {
          success: true,
          user: this.user || undefined,
          token: this.token || undefined
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error de autenticación'
        };
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.'
      };
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.token = null;
    this.user = null;
    this.clearSession();
    this.notifyListeners({ 
      isAuthenticated: false, 
      token: null, 
      user: null 
    });
  }

  /**
   * Verifica si hay una sesión guardada válida
   */
  checkSavedSession(): boolean {
    if (typeof window === 'undefined') return false;
    
    const savedSession = getFromStorage<SessionData>(STORAGE_KEYS.SESSION);
    
    if (savedSession) {
      try {
        // Verificar que la sesión no tenga más de 7 días
        if (Date.now() - savedSession.timestamp < API_CONFIG.SESSION_DURATION) {
          this.token = savedSession.token;
          this.user = savedSession.user;
          this.notifyListeners({ 
            isAuthenticated: true, 
            token: this.token, 
            user: this.user 
          });
          return true;
        } else {
          // Sesión expirada
          this.clearSession();
        }
      } catch (error) {
        console.error('Error al verificar sesión guardada:', error);
        this.clearSession();
      }
    }
    
    return false;
  }

  /**
   * Guarda la sesión en localStorage
   */
  private saveSession(token: string, user: User): void {
    const sessionData: SessionData = {
      token: token,
      user: user,
      timestamp: Date.now()
    };
    saveToStorage(STORAGE_KEYS.SESSION, sessionData);
  }

  /**
   * Limpia la sesión del localStorage
   */
  private clearSession(): void {
    removeFromStorage(STORAGE_KEYS.SESSION);
  }

  /**
   * Obtiene los headers de autenticación para las requests
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtiene el estado actual de autenticación
   */
  getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      token: this.token,
      user: this.user
    };
  }

  /**
   * Añade un listener para cambios de autenticación
   */
  addAuthListener(listener: AuthListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remueve un listener de autenticación
   */
  removeAuthListener(listener: AuthListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Remueve todos los listeners
   */
  clearAuthListeners(): void {
    this.listeners = [];
  }

  /**
   * Notifica a todos los listeners sobre cambios de autenticación
   */
  private notifyListeners(authState: AuthState): void {
    this.listeners.forEach(listener => {
      try {
        listener(authState);
      } catch (error) {
        console.error('Error en auth listener:', error);
      }
    });
  }

  /**
   * Verifica si el token está próximo a expirar
   */
  isTokenNearExpiry(hoursBeforeExpiry: number = 24): boolean {
    if (!this.token) return false;
    
    const savedSession = getFromStorage<SessionData>(STORAGE_KEYS.SESSION);
    if (!savedSession) return false;
    
    const timeUntilExpiry = API_CONFIG.SESSION_DURATION - (Date.now() - savedSession.timestamp);
    const hoursInMs = hoursBeforeExpiry * 60 * 60 * 1000;
    
    return timeUntilExpiry <= hoursInMs;
  }

  /**
   * Obtiene el tiempo restante de la sesión en milisegundos
   */
  getSessionTimeRemaining(): number {
    if (!this.token) return 0;
    
    const savedSession = getFromStorage<SessionData>(STORAGE_KEYS.SESSION);
    if (!savedSession) return 0;
    
    const timeRemaining = API_CONFIG.SESSION_DURATION - (Date.now() - savedSession.timestamp);
    return Math.max(0, timeRemaining);
  }

  /**
   * Renueva la timestamp de la sesión (útil para mantener sesión activa)
   */
  refreshSessionTimestamp(): void {
    if (this.token && this.user) {
      this.saveSession(this.token, this.user);
    }
  }

  /**
   * Valida formato de credenciales antes de enviar
   */
  validateCredentials(usernameOrEmail: string, password: string): string | null {
    if (!usernameOrEmail.trim()) {
      return 'El nombre de usuario o email es requerido';
    }
    
    if (!password.trim()) {
      return 'La contraseña es requerida';
    }
    
    if (password.length < 3) {
      return 'La contraseña debe tener al menos 3 caracteres';
    }
    
    return null;
  }
}

// Instancia singleton del servicio de autenticación
let authServiceInstance: AuthService | null = null;

/**
 * Factory function para obtener la instancia singleton del servicio de autenticación
 */
export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

// Exportar también la clase para casos donde se necesite crear instancias específicas
export default AuthService;
