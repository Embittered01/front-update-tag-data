/**
 * Utility Functions
 * Funciones utilitarias reutilizables siguiendo principios SOLID
 */

import { 
  DAY_LABELS, 
  DAY_COLORS, 
  TIME_BLOCKS, 
  VALIDATION_RULES,
  UI_CONSTANTS,
  MESSAGE_TYPES
} from '@/constants';
import type { 
  DayType, 
  DayColorInfo, 
  TimeBlockInfo, 
  ValidationResult, 
  TimeWindowFormData, 
  MessageType,
  TimeBlock 
} from '@/types';

/**
 * Time Utilities
 */

/**
 * Convierte tiempo en formato "HH:MM" a minutos desde medianoche
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convierte minutos desde medianoche a formato "HH:MM"
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Valida si un tiempo está en formato válido HH:MM
 */
export const isValidTimeFormat = (timeStr: string): boolean => {
  return VALIDATION_RULES.TIME_FORMAT.test(timeStr);
};

/**
 * Verifica si el tiempo cruza medianoche
 */
export const crossesMidnight = (fromTime: string, toTime: string): boolean => {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);
  return fromMinutes >= toMinutes;
};

/**
 * Day Type Utilities
 */

/**
 * Obtiene la etiqueta de un día
 */
export const getDayTypeLabel = (dayType: DayType): string => {
  return DAY_LABELS[dayType] || dayType;
};

/**
 * Obtiene las etiquetas de múltiples días
 */
export const getDayTypesLabel = (dayTypes: DayType[] | DayType): string => {
  if (!Array.isArray(dayTypes)) return getDayTypeLabel(dayTypes);
  if (dayTypes.includes('ALL_DAYS')) return DAY_LABELS.ALL_DAYS;
  return dayTypes.map(day => getDayTypeLabel(day)).join(', ');
};

/**
 * Obtiene información de color para un día
 */
export const getDayColorInfo = (dayType: DayType): DayColorInfo => {
  return DAY_COLORS[dayType] || DAY_COLORS.ALL_DAYS;
};

/**
 * Validation Utilities
 */

/**
 * Valida los campos requeridos de un objeto
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  obj: T, 
  requiredFields: readonly string[]
): ValidationResult => {
  const missingFields: string[] = [];
  const errors: string[] = [];

  requiredFields.forEach(field => {
    if (!obj[field] || obj[field] === '') {
      missingFields.push(field);
      errors.push(`El campo ${field} es requerido`);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errors
  };
};

/**
 * Valida una ventana de tiempo
 */
export const validateTimeWindow = (timeWindow: TimeWindowFormData): ValidationResult => {
  const errors: string[] = [];

  // Validar campos requeridos
  const requiredValidation = validateRequiredFields(
    timeWindow, 
    VALIDATION_RULES.REQUIRED_FIELDS.TIME_WINDOW
  );
  if (!requiredValidation.isValid) {
    errors.push(...requiredValidation.errors);
  }

  // Validar formato de tiempo
  if (timeWindow.from && !isValidTimeFormat(timeWindow.from)) {
    errors.push('Formato de hora de inicio inválido (HH:MM)');
  }

  if (timeWindow.to && !isValidTimeFormat(timeWindow.to)) {
    errors.push('Formato de hora de fin inválido (HH:MM)');
  }

  // Validar días seleccionados
  if (timeWindow.dayTypes && (!Array.isArray(timeWindow.dayTypes) || timeWindow.dayTypes.length === 0)) {
    errors.push('Debe seleccionar al menos un día');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Array and Object Utilities
 */

/**
 * Agrupa elementos de un array por una propiedad
 */
export const groupBy = <T extends Record<string, any>, K extends keyof T>(
  array: T[], 
  key: K
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Elimina elementos duplicados de un array basado en una propiedad
 */
export const uniqueBy = <T extends Record<string, any>, K extends keyof T>(
  array: T[], 
  key: K
): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * UI Helper Functions
 */

/**
 * Genera un ID único
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formatea números como moneda
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = '$'): string => {
  if (amount == null) return `${currency}0`;
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * Obtiene el bloque horario de un tiempo dado
 */
export const getTimeBlock = (timeStr: string): TimeBlock => {
  const minutes = timeToMinutes(timeStr);
  
  if (minutes >= timeToMinutes('06:00') && minutes < timeToMinutes('12:00')) {
    return 'MORNING';
  } else if (minutes >= timeToMinutes('12:00') && minutes < timeToMinutes('18:00')) {
    return 'AFTERNOON';
  } else {
    return 'NIGHT';
  }
};

/**
 * Obtiene información del bloque horario
 */
export const getTimeBlockInfo = (timeStr: string): TimeBlockInfo => {
  const block = getTimeBlock(timeStr);
  return TIME_BLOCKS[block];
};

/**
 * Storage Utilities (Client-side only)
 */

/**
 * Guarda datos en localStorage de forma segura
 */
export const saveToStorage = (key: string, data: any): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Obtiene datos de localStorage de forma segura
 */
export const getFromStorage = <T = any>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Elimina datos de localStorage
 */
export const removeFromStorage = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

/**
 * Performance Utilities
 */

/**
 * Debounce function para optimizar rendimiento
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T, 
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function para limitar frecuencia de ejecución
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return function (...args: Parameters<T>) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * Utility para crear clases CSS condicionales
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Utility para delay asíncrono
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Error Handling Utilities
 */

/**
 * Extrae mensaje de error de diferentes tipos de errores
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Error desconocido';
};

/**
 * Logging Utilities (Development only)
 */

/**
 * Log condicional que solo funciona en desarrollo
 */
export const devLog = (message: string, ...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TollGate Manager] ${message}`, ...args);
  }
};

/**
 * URL and Navigation Utilities
 */

/**
 * Construye query parameters de forma segura
 */
export const buildQueryParams = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

/**
 * Type Guards
 */

/**
 * Verifica si un valor es un string no vacío
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Verifica si un valor es un número válido
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Verifica si un array no está vacío
 */
export const isNonEmptyArray = <T>(value: T[] | null | undefined): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};
