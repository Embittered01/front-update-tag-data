/**
 * Constants and Configuration
 * Configuraciones y constantes de la aplicación
 */

import type { DayType, DayColorInfo, TimeBlockInfo, MessageType } from '@/types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login'
    },
    TOLL_GATES: {
      ALL: '/toll-gates/reference/all-toll-gates',
      CRUD: '/toll-gates',
      ASSIGN_PAYMENT_VALUES: '/payment-toll-gate/payment-values',
      ASSIGN_TIME_WINDOWS: '/payment-toll-gate/time-windows',
      EXIT_TOLL_GATES: '/toll-gates'
    },
    ENTRY_TO_EXIT: {
      BASE: '/payment-toll-gate/entry-to-exit',
      BY_ENTRY: '/payment-toll-gate/entry-to-exit/entry-toll-gate',
      PAYMENT_VALUES: '/payment-toll-gate/entry-to-exit',
      TIME_WINDOWS: '/payment-toll-gate/entry-to-exit'
    },
    PAYMENT_CATEGORIES: '/payment-toll-gate/categories',
    VEHICLE_CATEGORIES: '/payment-toll-gate/vehicle-categories',
    TIME_WINDOWS: '/payment-toll-gate/time-windows',
    CONCESSIONAIRES: '/concessionaires',
    DIRECTION_TOLL_GATES: '/toll-gates/reference/direction-toll-gates',
    PAYMENT_BY_CRANE_ROUTE: '/tag/payment-by-crane-route'
  },
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  BATCH_SIZE: 10 // Tamaño de lote para carga de configuraciones
} as const;

// Day Types Configuration
export const DAY_TYPES: Record<DayType, DayType> = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY', 
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
  HOLIDAY: 'HOLIDAY',
  ALL_DAYS: 'ALL_DAYS'
} as const;

// Day Labels for Display
export const DAY_LABELS: Record<DayType, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
  HOLIDAY: 'Feriado',
  ALL_DAYS: 'Todos los días'
} as const;

// Day Colors for UI
export const DAY_COLORS: Record<DayType, DayColorInfo> = {
  MONDAY: { color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  TUESDAY: { color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  WEDNESDAY: { color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  THURSDAY: { color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  FRIDAY: { color: 'pink', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  SATURDAY: { color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
  SUNDAY: { color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  HOLIDAY: { color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  ALL_DAYS: { color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
} as const;

// Time Block Configuration
export const TIME_BLOCKS: Record<string, TimeBlockInfo> = {
  MORNING: { label: 'Mañana', range: '06:00-11:59' },
  AFTERNOON: { label: 'Tarde', range: '12:00-17:59' },
  NIGHT: { label: 'Noche', range: '18:00-05:59' }
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  REQUIRED_FIELDS: {
    TOLL_GATE: ['name', 'portico', 'concessionaireId', 'latitude', 'longitude'] as const,
    TIME_WINDOW: ['from', 'to', 'paymentCategoryId', 'dayTypes'] as const,
    PAYMENT_VALUE: ['paymentCategoryId', 'vehicleCategoryIds', 'value'] as const
  }
} as const;

// Message Types
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  SESSION: 'tollGateManagerSession'
} as const;

// UI Constants
export const UI_CONSTANTS = {
  SCROLL_DEBOUNCE_DELAY: 100,
  MESSAGE_AUTO_HIDE_DELAY: 5000,
  BATCH_LOAD_DELAY: 100
} as const;

// Default Values
export const DEFAULT_VALUES = {
  NEW_TOLL_GATE: {
    name: '',
    portico: '',
    concessionaireId: '',
    latitude: '',
    longitude: '',
    directionId: null,
    isEntryorExit: ''
  },
  NEW_TIME_WINDOW: {
    from: '',
    to: '',
    dayTypes: [] as DayType[],
    paymentCategoryId: 0
  },
  NEW_PAYMENT_VALUE: {
    paymentCategoryId: '',
    vehicleCategoryIds: [] as number[],
    value: ''
  }
} as const;
