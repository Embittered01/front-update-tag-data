/**
 * Types and Interfaces for Toll Gate Manager
 * Tipos e interfaces para el Gestor de Toll Gates
 */

// Authentication Types
export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  access_token?: string;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

// Toll Gate Types
export interface TollGate {
  id: number;
  name: string;
  portico: string;
  concessionaireId: number;
  latitude: number;
  longitude: number;
  directionId?: number;
  isEntryorExit: string;
  concessionaire?: Concessionaire;
  directiontollgate?: DirectionTollGate;
  exitTollGates?: TollGate[]; // Pórticos de salida asignados (solo para pórticos de entrada)
}

export interface TollGateFormData {
  name: string;
  portico: string;
  concessionaireId: string;
  latitude: string;
  longitude: string;
  directionId: number | null;
  isEntryorExit: string;
}

export interface NewTollGateForm {
  name: string;
  portico: string;
  concessionaireId: string | number;
  latitude: string;
  longitude: string;
  directionId: number | null;
  isEntryorExit: string;
}

// Payment Types
export interface PaymentCategory {
  id: number;
  name: string;
  description?: string;
}

export interface VehicleCategory {
  id: number;
  name: string;
  description?: string;
}

export interface PaymentValue {
  id?: number;
  paymentCategoryId: string;
  vehicleCategoryIds: number[];
  value: string;
  paymentCategory?: PaymentCategory;
  vehicleCategories?: VehicleCategory[];
}

export interface PaymentValueForm {
  paymentCategoryId: string;
  value: string;
  vehicleCategoryIds: number[];
}

// Interfaz para datos enviados a la API (números)
export interface PaymentValueApi {
  id?: number;
  paymentCategoryId: number;
  vehicleCategoryIds: number[];
  value: number;
  paymentCategory?: PaymentCategory;
  vehicleCategories?: VehicleCategory[];
}

// Time Window Types
export type DayType = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY' | 'ALL_DAYS';

export interface TimeWindow {
  id: number;
  from: string;
  to: string;
  dayTypes: DayType[];
  dayType?: DayType; // Legacy support
  paymentCategoryId: number;
  paymentCategory?: PaymentCategory;
}

export interface AssignedTimeWindow {
  id: number;
  paymentCategoryTimeWindow: PaymentCategoryTimeWindow;
}

export interface PaymentCategoryTimeWindow {
  id: number;
  dayType: DayType;
  from: string;
  to: string;
  paymentCategory: PaymentCategory;
}

export interface TimeWindowFormData {
  from: string;
  to: string;
  dayTypes: DayType[];
  paymentCategoryId: number;
}

// Configuration Types
export interface TollGateConfig {
  id: number;
  tollGate: TollGate;
  paymentValues: PaymentValue[];
  assignedTimeWindows: AssignedTimeWindow[];
}

// API Response type that can have different structure
export interface TollGateConfigResponse {
  id: number;
  tollGate: TollGate;
  paymentValues?: PaymentValue[];
  assignedTimeWindows?: AssignedTimeWindow[];
  timeWindows?: AssignedTimeWindow[]; // Some API responses have this instead
}

export interface TollGateConfigSummary {
  hasPaymentValues: boolean;
  hasTimeWindows: boolean;
  paymentCount: number;
  timeWindowCount: number;
}

// Reference Data Types
export interface Concessionaire {
  id: number;
  name: string;
  description?: string;
}

export interface DirectionTollGate {
  id: number;
  name: string;
  description?: string;
  abbreviation?: string;
}

export interface ReferenceData {
  tollGates: TollGate[];
  paymentCategories: PaymentCategory[];
  vehicleCategories: VehicleCategory[];
  timeWindows: TimeWindow[];
  concessionaires: Concessionaire[];
  directionTollGates: DirectionTollGate[];
}

// UI State Types
export interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export interface LoadingStates {
  [key: string]: boolean;
}

// Entry-to-Exit Types
export interface EntryToExitTollGate {
  id: number;
  entryTollGateId: number;
  exitTollGateId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  entryTollGate?: TollGate;
  exitTollGate?: TollGate;
  paymentValues?: EntryToExitPaymentValue[];
  entryToExitTimeWindows?: EntryToExitTimeWindow[];
}

export interface EntryToExitPaymentValue {
  id: number;
  value: number;
  paymentCategoryId: number;
  entryToExitTollGateId: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  paymentCategory?: PaymentCategory;
  vehicleCategories?: EntryToExitVehicleCategory[];
}

export interface EntryToExitVehicleCategory {
  entryToExitPaymentValueId: number;
  vehicleCategoryId: number;
  vehicleCategory: VehicleCategory;
}

export interface EntryToExitTimeWindow {
  id: number;
  entryToExitTollGateId: number;
  paymentCategoryTimeWindowId: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  paymentCategoryTimeWindow: PaymentCategoryTimeWindow;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields?: string[];
}

// Filter Types
export interface TimeWindowFilters {
  paymentCategoryId: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  dayType: string;
  searchText: string;
  timeBlock: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Color Types for UI
export interface DayColorInfo {
  color: string;
  bgColor: string;
  textColor: string;
}

// Time Block Types
export interface TimeBlockInfo {
  label: string;
  range: string;
}

// Utility Types
export type TimeBlock = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type MessageType = 'success' | 'error' | 'warning' | 'info';

// Component Props Types (to be extended as needed)
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Hook Return Types
export interface UseMessagesReturn {
  message: Message;
  showMessage: (type: MessageType, text: string) => void;
  clearMessage: () => void;
}

export interface UseLoadingReturn {
  loading: boolean;
  loadingStates: LoadingStates;
  isAnyLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  setSpecificLoading: (key: string, loading: boolean) => void;
}

// Warning Types
export interface DuplicateWarning {
  type: 'exact' | 'partial';
  message: string;
}

// Payment by Crane Route Types
export interface CoordinateDto {
  latitude: number;
  longitude: number;
}

export interface CalculatePaymentToCraneDto {
  firstCoordinate: CoordinateDto;
  lastCoordinate: CoordinateDto;
}

// Tipo que acepta tanto lat/lng como latitude/longitude para compatibilidad
export interface LatLngTimestamp {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  timestamp?: string;
}

// Helper para obtener latitud de un punto (acepta ambas formas)
export const getLatitude = (point: LatLngTimestamp): number => {
  return point.latitude ?? point.lat ?? 0;
};

// Helper para obtener longitud de un punto (acepta ambas formas)
export const getLongitude = (point: LatLngTimestamp): number => {
  return point.longitude ?? point.lng ?? 0;
};

export interface PointsWithTollGateContact {
  point: LatLngTimestamp;
  tollGate: TollGate;
  paymentAmount: number;
}

export interface TollGateTransactionData extends PointsWithTollGateContact {
  vehicleCategory?: string;
  timeWindowApplied?: string;
  dayTypeApplied?: string;
  isHoliday?: boolean;
  paymentValueId?: number;
  paymentCategoryId?: number;
  isFreePass?: boolean;
  entryToExitPaymentValueId?: number;
  isEntryTollGate?: boolean;
  isExitTollGate?: boolean;
}

// Tipo para puntos de ruta
export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface PaymentByCraneRouteResponse {
  distance: number;
  route?: RoutePoint[];
  timeToTravel: number;
  tollGatesWithValues: TollGateTransactionData[];
  totalPayment: number;
}
