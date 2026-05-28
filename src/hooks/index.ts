/**
 * State Management Hooks
 * Hooks de manejo de estado usando hooks personalizados
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MESSAGE_TYPES, UI_CONSTANTS, DEFAULT_VALUES, VALIDATION_RULES } from '@/constants';
import { debounce, validateTimeWindow } from '@/utils';
import type { 
  MessageType, 
  Message, 
  LoadingStates,
  ReferenceData,
  TollGate,
  TollGateFormData,
  TollGateConfig,
  TollGateConfigResponse,
  TollGateConfigSummary,
  TimeWindowFormData,
  PaymentValue,
  PaymentValueForm,
  TimeWindow,
  DayType,
  TimeWindowFilters,
  UseMessagesReturn,
  UseLoadingReturn,
  DuplicateWarning
} from '@/types';
import type { ApiService } from '@/services/api';
import type { AuthService } from '@/services/auth';

/**
 * Hook para manejo de mensajes del sistema
 */
export const useMessages = (): UseMessagesReturn => {
  const [message, setMessage] = useState<Message>({ type: 'info', text: '' });

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });
    
    // Auto-hide después de un tiempo para mensajes de éxito
    if (type === MESSAGE_TYPES.SUCCESS) {
      setTimeout(() => {
        setMessage({ type: 'info', text: '' });
      }, UI_CONSTANTS.MESSAGE_AUTO_HIDE_DELAY);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage({ type: 'info', text: '' });
  }, []);

  return {
    message,
    showMessage,
    clearMessage
  };
};

/**
 * Hook para manejo de estado de carga
 */
export const useLoading = (): UseLoadingReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const setGlobalLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setSpecificLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isAnyLoading = useMemo(() => {
    return loading || Object.values(loadingStates).some(Boolean);
  }, [loading, loadingStates]);

  return {
    loading,
    loadingStates,
    isAnyLoading,
    setGlobalLoading,
    setSpecificLoading
  };
};

/**
 * Hook para manejo de datos de referencia
 */
export const useReferenceData = (apiService: ApiService | null) => {
  const [data, setData] = useState<ReferenceData>({
    tollGates: [],
    paymentCategories: [],
    vehicleCategories: [],
    timeWindows: [],
    concessionaires: [],
    directionTollGates: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  const loadReferenceData = useCallback(async () => {
    if (!apiService) {
      console.warn('ApiService not available for loading reference data');
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Reference data already loading, skipping...');
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Loading reference data...');
      const referenceData = await apiService.loadReferenceData();
      console.log('Reference data loaded successfully:', referenceData);
      setData(referenceData);
      setHasLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading reference data:', err);
      
      // Set empty data to prevent app crash
      setData({
        tollGates: [],
        paymentCategories: [],
        vehicleCategories: [],
        timeWindows: [],
        concessionaires: [],
        directionTollGates: []
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [apiService]);

  const updateTollGates = useCallback((tollGates: TollGate[]) => {
    setData(prev => ({ ...prev, tollGates }));
  }, []);

  const addTollGate = useCallback((newTollGate: TollGate) => {
    setData(prev => ({
      ...prev,
      tollGates: [...prev.tollGates, newTollGate]
    }));
  }, []);

  const updateTollGate = useCallback((updatedTollGate: TollGate) => {
    setData(prev => ({
      ...prev,
      tollGates: prev.tollGates.map(tg => 
        tg.id === updatedTollGate.id ? updatedTollGate : tg
      )
    }));
  }, []);

  const updateTimeWindows = useCallback((timeWindows: TimeWindow[]) => {
    setData(prev => ({ ...prev, timeWindows }));
  }, []);

  const addTimeWindow = useCallback((newTimeWindow: TimeWindow) => {
    setData(prev => ({
      ...prev,
      timeWindows: [...prev.timeWindows, newTimeWindow]
    }));
  }, []);

  const removeTimeWindow = useCallback((timeWindowId: number) => {
    setData(prev => ({
      ...prev,
      timeWindows: prev.timeWindows.filter(tw => tw.id !== timeWindowId)
    }));
  }, []);

  return {
    ...data,
    loading,
    error,
    hasLoaded,
    loadReferenceData,
    updateTollGates,
    addTollGate,
    updateTollGate,
    updateTimeWindows,
    addTimeWindow,
    removeTimeWindow
  };
};

/**
 * Hook para manejo de selección y configuración de Toll Gates
 */
export const useTollGateSelection = (tollGates: TollGate[], apiService: ApiService | null) => {
  const [selectedTollGate, setSelectedTollGate] = useState<TollGate | null>(null);
  const [currentConfig, setCurrentConfig] = useState<TollGateConfig | null>(null);
  const [tollGateConfigs, setTollGateConfigs] = useState<Record<number, TollGateConfigSummary>>({});
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [bulkConfigsLoading, setBulkConfigsLoading] = useState<boolean>(false);
  const configLoadingRef = useRef<boolean>(false);

  const handleTollGateSelect = useCallback(async (tollGateId: string | number) => {
    const tollGate = tollGates.find(tg => tg.id === parseInt(String(tollGateId)));
    setSelectedTollGate(tollGate || null);

    if (tollGate && apiService) {
      await loadTollGateConfig(tollGate.id);
    } else {
      setCurrentConfig(null);
    }
  }, [tollGates, apiService]);

  const loadTollGateConfig = useCallback(async (tollGateId: number) => {
    if (!apiService) return;
    
    setConfigLoading(true);
    try {
      const config: TollGateConfigResponse = await apiService.tollGate.getTollGateConfig(tollGateId);

      console.log('config', config);
      const normalizedConfig: TollGateConfig = {
        ...config,
        paymentValues: config.paymentValues || [],
        assignedTimeWindows: config.assignedTimeWindows || config.timeWindows || []
      };
      
      setCurrentConfig(normalizedConfig);
    } catch (error) {
      console.error('Error loading toll gate config:', error);
      setCurrentConfig(null);
    } finally {
      setConfigLoading(false);
    }
  }, [apiService]);

  const loadTollGateConfigsOnDemand = useCallback(async (tollGatesList: TollGate[], onlyIfNeeded: boolean = true) => {
    if (!tollGatesList || tollGatesList.length === 0 || !apiService) return {};

    // Prevent multiple simultaneous loads
    if (configLoadingRef.current) {
      console.log('Toll gate configs already loading, skipping...');
      return {};
    }

    configLoadingRef.current = true;
    setBulkConfigsLoading(true);
    try {
      console.log('Loading toll gate configs for', tollGatesList.length, 'toll gates (on-demand)');
      const configs = await apiService.tollGate.loadTollGateConfigsOnDemand(tollGatesList, onlyIfNeeded);
      
      // Merge with existing configs instead of replacing
      setTollGateConfigs(prev => ({ ...prev, ...configs }));
      return configs;
    } catch (error) {
      console.error('Error loading toll gate configs on demand:', error);
      return {};
    } finally {
      setBulkConfigsLoading(false);
      configLoadingRef.current = false;
    }
  }, [apiService]);

  // DEPRECATED: Mantener por compatibilidad
  const loadAllTollGateConfigs = useCallback(async (tollGatesList: TollGate[]) => {
    console.warn('loadAllTollGateConfigs is deprecated. Consider using loadTollGateConfigsOnDemand.');
    return loadTollGateConfigsOnDemand(tollGatesList, false);
  }, [loadTollGateConfigsOnDemand]);

  return {
    selectedTollGate,
    setSelectedTollGate,
    currentConfig,
    tollGateConfigs,
    configLoading,
    bulkConfigsLoading,
    handleTollGateSelect,
    loadTollGateConfig,
    loadTollGateConfigsOnDemand,
    loadAllTollGateConfigs, // DEPRECATED - mantener por compatibilidad
    setCurrentConfig
  };
};

/**
 * Hook para manejo de formularios de Toll Gates
 */
export const useTollGateForm = () => {
  const [showNewTollGateForm, setShowNewTollGateForm] = useState<boolean>(false);
  const [editingTollGate, setEditingTollGate] = useState<TollGate | null>(null);
  const [newTollGate, setNewTollGate] = useState<TollGateFormData>(DEFAULT_VALUES.NEW_TOLL_GATE);

  const resetNewTollGateForm = useCallback(() => {
    setNewTollGate(DEFAULT_VALUES.NEW_TOLL_GATE);
    setShowNewTollGateForm(false);
    setEditingTollGate(null);
  }, []);

  const handleNewTollGateChange = useCallback((field: keyof TollGateFormData, value: string | number | null) => {
    setNewTollGate(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditTollGate = useCallback((tollGate: TollGate) => {
    setEditingTollGate(tollGate);
    setNewTollGate({
      name: tollGate.name,
      portico: tollGate.portico,
      concessionaireId: tollGate.concessionaireId?.toString() || '',
      latitude: tollGate.latitude?.toString() || '',
      longitude: tollGate.longitude?.toString() || '',
      directionId: tollGate.directionId || null,
      isEntryorExit: tollGate.isEntryorExit || ''
    });
    setShowNewTollGateForm(true);
  }, []);

  const validateTollGateForm = useCallback((): string[] => {
    const errors: string[] = [];
    const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.TOLL_GATE;
    
    requiredFields.forEach(field => {
      if (!newTollGate[field] || newTollGate[field] === '') {
        errors.push(`El campo ${field} es requerido`);
      }
    });

    // Validaciones específicas
    if (newTollGate.latitude && isNaN(Number(newTollGate.latitude))) {
      errors.push('La latitud debe ser un número válido');
    }

    if (newTollGate.longitude && isNaN(Number(newTollGate.longitude))) {
      errors.push('La longitud debe ser un número válido');
    }

    return errors;
  }, [newTollGate]);

  return {
    showNewTollGateForm,
    editingTollGate,
    newTollGate,
    setShowNewTollGateForm,
    setEditingTollGate,
    resetNewTollGateForm,
    handleNewTollGateChange,
    handleEditTollGate,
    validateTollGateForm
  };
};

/**
 * Hook para manejo de configuración de pagos
 */
export const usePaymentConfig = () => {
  const [paymentValues, setPaymentValues] = useState<PaymentValueForm[]>([]);

  const addPaymentValue = useCallback(() => {
    setPaymentValues(prev => [...prev, {
      id: Date.now(),
      paymentCategoryId: '',
      vehicleCategoryIds: [],
      value: ''
    }]);
  }, []);

  const updatePaymentValue = useCallback((index: number, field: keyof PaymentValueForm, value: any) => {
    setPaymentValues(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removePaymentValue = useCallback((index: number) => {
    setPaymentValues(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleVehicleCategoryChange = useCallback((paymentIndex: number, vehicleCategoryId: number, checked: boolean) => {
    setPaymentValues(prev => {
      const updated = [...prev];
      if (checked) {
        if (!updated[paymentIndex].vehicleCategoryIds.includes(vehicleCategoryId)) {
          updated[paymentIndex].vehicleCategoryIds.push(vehicleCategoryId);
        }
      } else {
        updated[paymentIndex].vehicleCategoryIds = updated[paymentIndex].vehicleCategoryIds.filter(
          (id: number) => id !== vehicleCategoryId
        );
      }
      return updated;
    });
  }, []);

  const getDuplicateWarning = useCallback((
    paymentCategoryId: string, 
    vehicleCategoryIds: number[], 
    currentIndex: number, 
    currentConfig: TollGateConfig | null
  ): DuplicateWarning | null => {
    if (!paymentCategoryId || !currentConfig || !currentConfig.paymentValues) return null;

    const existingForCategory = currentConfig.paymentValues.filter(
      pv => pv.paymentCategory && pv.paymentCategory.id.toString() === paymentCategoryId
    );

    if (existingForCategory.length === 0) return null;

    const currentVehicleIds = vehicleCategoryIds.sort();
    const exactMatch = existingForCategory.find(pv => {
      if (!pv.vehicleCategories) return false;
      const existingVehicleIds = pv.vehicleCategories.map(vc => vc.id).sort();
      return existingVehicleIds.length === currentVehicleIds.length &&
        existingVehicleIds.every((id, index) => id === currentVehicleIds[index]);
    });

    if (exactMatch) {
      return {
        type: 'exact',
        message: `Ya existe una configuración exacta para esta categoría de pago con las mismas categorías de vehículo (Valor: $${exactMatch.value})`
      };
    }

    return {
      type: 'partial',
      message: 'Existen otras configuraciones para esta categoría de pago con diferentes vehículos'
    };
  }, []);

  const resetPaymentValues = useCallback(() => {
    setPaymentValues([]);
  }, []);

  return {
    paymentValues,
    setPaymentValues,
    addPaymentValue,
    updatePaymentValue,
    removePaymentValue,
    handleVehicleCategoryChange,
    getDuplicateWarning,
    resetPaymentValues
  };
};

/**
 * Hook para manejo de Time Windows
 */
export const useTimeWindows = () => {
  const [selectedTimeWindows, setSelectedTimeWindows] = useState<number[]>([]);
  const [showNewTimeWindowForm, setShowNewTimeWindowForm] = useState<boolean>(false);
  const [showAssignTimeWindowForm, setShowAssignTimeWindowForm] = useState<boolean>(false);
  const [editingTimeWindow, setEditingTimeWindow] = useState<TimeWindow | null>(null);
  const [newTimeWindow, setNewTimeWindow] = useState<TimeWindowFormData>(DEFAULT_VALUES.NEW_TIME_WINDOW);

  const handleTimeWindowChange = useCallback((timeWindowId: number, checked: boolean) => {
    if (checked) {
      setSelectedTimeWindows(prev => [...prev, timeWindowId]);
    } else {
      setSelectedTimeWindows(prev => prev.filter(id => id !== timeWindowId));
    }
  }, []);

  const resetNewTimeWindowForm = useCallback(() => {
    setNewTimeWindow(DEFAULT_VALUES.NEW_TIME_WINDOW);
    setShowNewTimeWindowForm(false);
    setEditingTimeWindow(null);
  }, []);

  const handleNewTimeWindowChange = useCallback((field: keyof TimeWindowFormData, value: string | DayType | DayType[]) => {
    if (field === 'dayTypes' && typeof value === 'string') {
      setNewTimeWindow(prev => {
        let newDayTypes = [...prev.dayTypes];
        const dayType = value as DayType;
        
        if (dayType === 'ALL_DAYS') {
          if (newDayTypes.includes('ALL_DAYS')) {
            newDayTypes = [];
          } else {
            newDayTypes = ['ALL_DAYS'];
          }
        } else {
          if (newDayTypes.includes(dayType)) {
            newDayTypes = newDayTypes.filter(day => day !== dayType);
          } else {
            const hadAllDays = newDayTypes.includes('ALL_DAYS');
            newDayTypes = newDayTypes.filter(day => day !== 'ALL_DAYS');
            if (!hadAllDays) {
              newDayTypes.push(dayType);
            } else {
              newDayTypes = [dayType];
            }
          }
        }
        
        return { ...prev, dayTypes: newDayTypes };
      });
    } else if (field === 'paymentCategoryId') {
      // Convertir a número para paymentCategoryId
      const numericValue = typeof value === 'string' ? Number(value) : (value as unknown as number);
      setNewTimeWindow(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setNewTimeWindow(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const validateNewTimeWindow = useCallback((): { isValid: boolean; errors: string[] } => {
    return validateTimeWindow(newTimeWindow);
  }, [newTimeWindow]);

  const handleEditTimeWindow = useCallback((timeWindow: TimeWindow) => {
    setEditingTimeWindow(timeWindow);
    setNewTimeWindow({
      from: timeWindow.from,
      to: timeWindow.to,
      dayTypes: Array.isArray(timeWindow.dayTypes) ? timeWindow.dayTypes : 
                timeWindow.dayType ? [timeWindow.dayType] : [],
      paymentCategoryId: timeWindow.paymentCategory?.id || timeWindow.paymentCategoryId || 0
    });
    setShowNewTimeWindowForm(true);
  }, []);

  return {
    selectedTimeWindows,
    showNewTimeWindowForm,
    showAssignTimeWindowForm,
    editingTimeWindow,
    newTimeWindow,
    setSelectedTimeWindows,
    setShowNewTimeWindowForm,
    setShowAssignTimeWindowForm,
    setEditingTimeWindow,
    handleTimeWindowChange,
    resetNewTimeWindowForm,
    handleNewTimeWindowChange,
    validateNewTimeWindow,
    handleEditTimeWindow
  };
};

/**
 * Hook para filtros y búsqueda
 */
export const useFilters = (tollGates: TollGate[]) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedConcessionaire, setSelectedConcessionaire] = useState<string>('');
  const [timeWindowFilters, setTimeWindowFilters] = useState<TimeWindowFilters>({
    paymentCategoryId: '',
    timeRangeStart: '00:00',
    timeRangeEnd: '23:59',
    dayType: '',
    searchText: '',
    timeBlock: ''
  });

  // Debounced search para mejor rendimiento
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  const filteredTollGates = useMemo(() => {
    let filtered = [...tollGates];

    // Filtro por concesionario
    if (selectedConcessionaire) {
      filtered = filtered.filter(tg => tg.concessionaireId?.toString() === selectedConcessionaire);
    }

    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tg => 
        tg.name?.toLowerCase().includes(searchLower) ||
        tg.portico?.toLowerCase().includes(searchLower) ||
        tg.concessionaire?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [tollGates, selectedConcessionaire, searchTerm]);

  const updateTimeWindowFilter = useCallback((field: keyof TimeWindowFilters, value: string) => {
    setTimeWindowFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedConcessionaire('');
    setTimeWindowFilters({
      paymentCategoryId: '',
      timeRangeStart: '00:00',
      timeRangeEnd: '23:59',
      dayType: '',
      searchText: '',
      timeBlock: ''
    });
  }, []);

  return {
    searchTerm,
    selectedConcessionaire,
    timeWindowFilters,
    filteredTollGates,
    setSearchTerm,
    setSelectedConcessionaire,
    debouncedSearch,
    updateTimeWindowFilter,
    resetFilters
  };
};

/**
 * Hook principal que combina todos los estados de la aplicación
 */
export const useAppState = (authService: AuthService | null, apiService: ApiService | null) => {
  const messages = useMessages();
  const loading = useLoading();
  const referenceData = useReferenceData(apiService);
  const tollGateSelection = useTollGateSelection(referenceData.tollGates, apiService);
  const tollGateForm = useTollGateForm();
  const paymentConfig = usePaymentConfig();
  const timeWindows = useTimeWindows();
  const filters = useFilters(referenceData.tollGates);

  // Estado adicional específico de la aplicación
  const [showConcessionaireView, setShowConcessionaireView] = useState<boolean>(false);
  const [selectedConcessionaireForView, setSelectedConcessionaireForView] = useState<string>('');
  const [concessionaireTollGates, setConcessionaireTollGates] = useState<TollGate[]>([]);
  const [showPaymentPreview, setShowPaymentPreview] = useState<boolean>(true);

  return {
    // Servicios
    authService,
    apiService,
    
    // Estado de mensajes
    ...messages,
    
    // Estado de carga
    ...loading,
    
    // Datos de referencia
    ...referenceData,
    
    // Selección de toll gates
    ...tollGateSelection,
    
    // Formularios de toll gates
    ...tollGateForm,
    
    // Configuración de pagos
    ...paymentConfig,
    
    // Time windows
    ...timeWindows,
    
    // Filtros
    ...filters,
    
    // Estado adicional
    showConcessionaireView,
    setShowConcessionaireView,
    selectedConcessionaireForView,
    setSelectedConcessionaireForView,
    concessionaireTollGates,
    setConcessionaireTollGates,
    showPaymentPreview,
    setShowPaymentPreview
  };
};
