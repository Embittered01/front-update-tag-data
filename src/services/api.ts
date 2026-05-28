/**
 * API Service Module
 * Módulo de servicios API siguiendo principios de Single Responsibility
 */

import { API_CONFIG } from '@/constants';
import { delay } from '@/utils';
import type { AuthService } from './auth';
import type { 
  TollGate, 
  TollGateConfig, 
  TollGateConfigSummary, 
  TimeWindow, 
  PaymentCategory, 
  VehicleCategory, 
  Concessionaire, 
  DirectionTollGate,
  ReferenceData,
  ApiResponse,
  EntryToExitTollGate,
  CalculatePaymentToCraneDto,
  PaymentByCraneRouteResponse
} from '@/types';

/**
 * Tipo para opciones de petición HTTP
 */
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Clase base para servicios API
 */
export class BaseApiService {
  protected authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Realiza una petición HTTP genérica
   */
  protected async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    if (!url || typeof url !== 'string') {
      throw new Error(`Invalid URL provided: ${url}`);
    }
    
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    
    const requestOptions: RequestOptions = {
      ...options,
      headers: {
        ...this.authService.getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(fullUrl, requestOptions);
      console.log('response', response);
      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        
        throw new Error(errorMessage);
      }

      // Verificar si hay contenido para parsear
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  protected async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...options });
  }

  /**
   * POST request
   */
  protected async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
  }

  /**
   * PUT request
   */
  protected async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { method: 'DELETE', ...options });
  }
}

/**
 * Servicio para manejo de Toll Gates
 */
export class TollGateService extends BaseApiService {
  /**
   * Obtiene todos los toll gates
   */
  async getAllTollGates(): Promise<TollGate[]> {
    return this.get<TollGate[]>(API_CONFIG.ENDPOINTS.TOLL_GATES.ALL);
  }

  /**
   * Obtiene un toll gate por ID
   */
  async getTollGateById(tollGateId: number): Promise<TollGate> {
    return this.get<TollGate>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.CRUD}/${tollGateId}`);
  }

  /**
   * Crea un nuevo toll gate
   */
  async createTollGate(tollGateData: Partial<TollGate>): Promise<TollGate> {
    return this.post<TollGate>(API_CONFIG.ENDPOINTS.TOLL_GATES.CRUD, tollGateData);
  }

  /**
   * Actualiza un toll gate
   */
  async updateTollGate(tollGateId: number, tollGateData: Partial<TollGate>): Promise<TollGate> {
    return this.patch<TollGate>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.CRUD}/${tollGateId}`, tollGateData);
  }

  /**
   * Elimina un toll gate
   */
  async deleteTollGate(tollGateId: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.CRUD}/${tollGateId}`);
  }

  /**
   * Obtiene la configuración de valores y tiempos de un toll gate
   */
  async getTollGateConfig(tollGateId: number): Promise<TollGateConfig> {
    return this.get<TollGateConfig>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.CRUD}/${tollGateId}/values-and-times`);
  }

  /**
   * Carga configuraciones básicas de múltiples toll gates en lotes (solo cuando es necesario)
   * @param tollGatesList Lista de toll gates para cargar configuraciones
   * @param onlyIfNeeded Si es true, carga solo si realmente se necesita mostrar indicadores
   */
  async loadTollGateConfigsOnDemand(tollGatesList: TollGate[], onlyIfNeeded: boolean = true): Promise<Record<number, TollGateConfigSummary>> {
    if (!tollGatesList || tollGatesList.length === 0) return {};

    console.log(`Loading configs for ${tollGatesList.length} toll gates (on-demand)`);
    const configs: Record<number, TollGateConfigSummary> = {};
    
    // Procesar en lotes para evitar sobrecarga
    for (let i = 0; i < tollGatesList.length; i += API_CONFIG.BATCH_SIZE) {
      const batch = tollGatesList.slice(i, i + API_CONFIG.BATCH_SIZE);
      const batchPromises = batch.map(async (tollGate) => {
        
        try {
          console.log(`Loading config for toll gate ${tollGate.name} (ID: ${tollGate.id})`);
          const config = await this.getTollGateConfig(tollGate.id);
          return { id: tollGate.id, config };
        } catch (error) {
          console.warn(`Error loading config for toll gate ${tollGate.id}:`, error);
          return { id: tollGate.id, config: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, config }) => {
        if (config) {
          configs[id] = {
            hasPaymentValues: config.paymentValues && config.paymentValues.length > 0,
            hasTimeWindows: config.assignedTimeWindows && config.assignedTimeWindows.length > 0,
            paymentCount: config.paymentValues?.length || 0,
            timeWindowCount: config.assignedTimeWindows?.length || 0
          };
        }
      });

      // Pequeña pausa entre lotes para no sobrecargar el servidor
      if (i + API_CONFIG.BATCH_SIZE < tollGatesList.length) {
        await delay(100);
      }
    }

    return configs;
  }

  /**
   * DEPRECATED: Usar loadTollGateConfigsOnDemand en su lugar
   * @deprecated
   */
  async loadAllTollGateConfigs(tollGatesList: TollGate[]): Promise<Record<number, TollGateConfigSummary>> {
    console.warn('loadAllTollGateConfigs is deprecated. Use loadTollGateConfigsOnDemand instead.');
    return this.loadTollGateConfigsOnDemand(tollGatesList, false);
  }

  /**
   * Asigna ventanas de tiempo a un toll gate
   */
  async assignTimeWindows(tollGateId: number, timeWindowIds: number[]): Promise<ApiResponse> {
    return this.post<ApiResponse>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.ASSIGN_TIME_WINDOWS}/${tollGateId}`, {
      timeWindows: timeWindowIds.map(id => ({ paymentCategoryTimeWindowId: id }))
    });
  }

  /**
   * Guarda valores de pago y ventanas de tiempo para un toll gate
   */
  async saveTollGateConfig(tollGateId: number, configData: any): Promise<ApiResponse> {
    return this.post<ApiResponse>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.ASSIGN_PAYMENT_VALUES}/${tollGateId}`, configData);
  }

  /**
   * Asigna valores de pago a un toll gate (nuevo endpoint por módulo)
   */
  async assignPaymentValues(tollGateId: number, paymentValues: Array<{
    paymentCategoryId: number;
    value: number;
    vehicleCategoryIds?: number[];
  }>): Promise<ApiResponse> {
    return this.post<ApiResponse>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.ASSIGN_PAYMENT_VALUES}/${tollGateId}`, {
      paymentValues
    });
  }

  /**
   * Asigna ventanas de tiempo a un toll gate (nuevo endpoint por módulo)
   */
  async assignTimeWindowsToTollGate(tollGateId: number, timeWindows: Array<{
    paymentCategoryTimeWindowId: number;
  }>): Promise<ApiResponse> {
    return this.post<ApiResponse>(`${API_CONFIG.ENDPOINTS.TOLL_GATES.ASSIGN_TIME_WINDOWS}/${tollGateId}`, {
      timeWindows
    });
  }

  /**
   * Obtiene los pórticos de salida asignados a un pórtico de entrada
   */
  async getExitTollGates(entryTollGateId: number): Promise<TollGate[]> {
    const url = `${API_CONFIG.ENDPOINTS.TOLL_GATES.EXIT_TOLL_GATES}/${entryTollGateId}/exit-toll-gates`;
    console.log('TollGateService: getExitTollGates called with URL:', url);
    const result = await this.get<TollGate[]>(url);
    console.log('TollGateService: getExitTollGates result:', result);
    return result;
  }
}

/**
 * Servicio para manejo de Time Windows
 */
export class TimeWindowService extends BaseApiService {
  /**
   * Obtiene todas las ventanas de tiempo
   */
  async getAllTimeWindows(): Promise<TimeWindow[]> {
    return this.get<TimeWindow[]>(API_CONFIG.ENDPOINTS.TIME_WINDOWS);
  }

  /**
   * Crea una nueva ventana de tiempo
   */
  async createTimeWindow(timeWindowData: Partial<TimeWindow>): Promise<TimeWindow> {
    return this.post<TimeWindow>(API_CONFIG.ENDPOINTS.TIME_WINDOWS, timeWindowData);
  }

  /**
   * Actualiza una ventana de tiempo
   */
  async updateTimeWindow(timeWindowId: number, timeWindowData: Partial<TimeWindow>): Promise<TimeWindow> {
    return this.put<TimeWindow>(`${API_CONFIG.ENDPOINTS.TIME_WINDOWS}/${timeWindowId}`, timeWindowData);
  }

  /**
   * Elimina una ventana de tiempo
   */
  async deleteTimeWindow(timeWindowId: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`${API_CONFIG.ENDPOINTS.TIME_WINDOWS}/${timeWindowId}`);
  }
}

/**
 * Servicio para manejo de Payment Categories
 */
export class PaymentCategoryService extends BaseApiService {
  /**
   * Obtiene todas las categorías de pago
   */
  async getAllPaymentCategories(): Promise<PaymentCategory[]> {
    return this.get<PaymentCategory[]>(API_CONFIG.ENDPOINTS.PAYMENT_CATEGORIES);
  }
}

/**
 * Servicio para manejo de Vehicle Categories
 */
export class VehicleCategoryService extends BaseApiService {
  /**
   * Obtiene todas las categorías de vehículos
   */
  async getAllVehicleCategories(): Promise<VehicleCategory[]> {
    return this.get<VehicleCategory[]>(API_CONFIG.ENDPOINTS.VEHICLE_CATEGORIES);
  }
}

/**
 * Servicio para manejo de Concessionaires
 */
export class ConcessionaireService extends BaseApiService {
  /**
   * Obtiene todos los concesionarios
   */
  async getAllConcessionaires(): Promise<Concessionaire[]> {
    return this.get<Concessionaire[]>(API_CONFIG.ENDPOINTS.CONCESSIONAIRES);
  }
}

/**
 * Servicio para manejo de Direction Toll Gates
 */
export class DirectionTollGateService extends BaseApiService {
  /**
   * Obtiene todos los toll gates direccionales
   */
  async getAllDirectionTollGates(): Promise<DirectionTollGate[]> {
    return this.get<DirectionTollGate[]>(API_CONFIG.ENDPOINTS.DIRECTION_TOLL_GATES);
  }
}

/**
 * Servicio para cálculo de pago por ruta de grúa
 */
export class PaymentByCraneRouteService extends BaseApiService {
  /**
   * Calcula el pago por ruta de grúa entre dos coordenadas
   */
  async calculatePaymentByCraneRoute(data: CalculatePaymentToCraneDto): Promise<PaymentByCraneRouteResponse> {
    return this.post<PaymentByCraneRouteResponse>(API_CONFIG.ENDPOINTS.PAYMENT_BY_CRANE_ROUTE, data);
  }
}

/**
 * Servicio para manejo de configuraciones Entry-to-Exit
 */
export class EntryToExitService extends BaseApiService {
  /**
   * Obtiene todas las relaciones entry-to-exit para un pórtico de entrada
   */
  async getEntryToExitRelations(entryTollGateId: number): Promise<EntryToExitTollGate[]> {
    const url = `${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.BY_ENTRY}/${entryTollGateId}`;
    console.log('EntryToExitService: getEntryToExitRelations called with URL:', url);
    const result = await this.get<EntryToExitTollGate[]>(url);
    console.log('EntryToExitService: getEntryToExitRelations result:', result);
    return result;
  }

  /**
   * Obtiene una relación entry-to-exit específica con su configuración
   */
  async getEntryToExitConfig(entryToExitId: number): Promise<EntryToExitTollGate> {
    return this.get<EntryToExitTollGate>(`${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.BASE}/${entryToExitId}`);
  }

  /**
   * Asigna valores de pago a una relación entry-to-exit
   */
  async assignPaymentValues(entryToExitId: number, paymentValues: any[]): Promise<ApiResponse> {
    return this.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.PAYMENT_VALUES}/${entryToExitId}/payment-values`,
      { paymentValues }
    );
  }

  /**
   * Asigna ventanas de tiempo a una relación entry-to-exit
   */
  async assignTimeWindows(entryToExitId: number, timeWindowIds: number[]): Promise<ApiResponse> {
    return this.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.TIME_WINDOWS}/${entryToExitId}/time-windows`,
      { timeWindows: timeWindowIds.map(id => ({ paymentCategoryTimeWindowId: id })) }
    );
  }

  /**
   * Elimina un valor de pago de una relación entry-to-exit
   */
  async deletePaymentValue(entryToExitId: number, paymentValueId: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.PAYMENT_VALUES}/${entryToExitId}/payment-values/${paymentValueId}`
    );
  }

  /**
   * Elimina una ventana de tiempo de una relación entry-to-exit
   */
  async deleteTimeWindow(entryToExitId: number, timeWindowId: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.ENTRY_TO_EXIT.TIME_WINDOWS}/${entryToExitId}/time-windows/${timeWindowId}`
    );
  }
}

/**
 * Clase principal que agrupa todos los servicios API
 */
export class ApiService {
  public tollGate: TollGateService;
  public timeWindow: TimeWindowService;
  public paymentCategory: PaymentCategoryService;
  public vehicleCategory: VehicleCategoryService;
  public concessionaire: ConcessionaireService;
  public directionTollGate: DirectionTollGateService;
  public entryToExit: EntryToExitService;
  public paymentByCraneRoute: PaymentByCraneRouteService;

  constructor(authService: AuthService) {
    this.tollGate = new TollGateService(authService);
    this.timeWindow = new TimeWindowService(authService);
    this.paymentCategory = new PaymentCategoryService(authService);
    this.vehicleCategory = new VehicleCategoryService(authService);
    this.concessionaire = new ConcessionaireService(authService);
    this.directionTollGate = new DirectionTollGateService(authService);
    this.entryToExit = new EntryToExitService(authService);
    this.paymentByCraneRoute = new PaymentByCraneRouteService(authService);
  }

  /**
   * Carga todos los datos de referencia necesarios
   */
  async loadReferenceData(): Promise<ReferenceData> {
    console.log('Starting to load reference data...');
    
    try {
      console.log('Making concurrent API calls for reference data');
      
      const [
        tollGates,
        paymentCategories,
        vehicleCategories,
        timeWindows,
        concessionaires,
        directionTollGates
      ] = await Promise.all([
        this.tollGate.getAllTollGates(),
        this.paymentCategory.getAllPaymentCategories(),
        this.vehicleCategory.getAllVehicleCategories(),
        this.timeWindow.getAllTimeWindows(),
        this.concessionaire.getAllConcessionaires(),
        this.directionTollGate.getAllDirectionTollGates()
      ]);

      console.log('All reference data loaded successfully');

      return {
        tollGates: Array.isArray(tollGates) ? tollGates : [],
        paymentCategories: Array.isArray(paymentCategories) ? paymentCategories : [],
        vehicleCategories: Array.isArray(vehicleCategories) ? vehicleCategories : [],
        timeWindows: Array.isArray(timeWindows) ? timeWindows : [],
        concessionaires: Array.isArray(concessionaires) ? concessionaires : [],
        directionTollGates: Array.isArray(directionTollGates) ? directionTollGates : []
      };
    } catch (error) {
      console.error('Error loading reference data:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con la API. Verifica que el servidor esté corriendo en http://localhost:3010');
      }
      
      throw new Error(`Error cargando datos de referencia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica la conectividad con la API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.tollGate.getAllTollGates();
      return true;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }
}

/**
 * Factory function para crear una instancia del servicio API
 */
export const createApiService = (authService: AuthService): ApiService => {
  return new ApiService(authService);
};

export default ApiService;
