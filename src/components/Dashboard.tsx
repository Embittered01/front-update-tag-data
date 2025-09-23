/**
 * Dashboard Component
 * Componente principal del dashboard que integra todos los componentes
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faSignOutAlt, faCog, faTimes, faCheckCircle, faExclamationTriangle, faInfoCircle, faSave, faPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import TollGateList from './TollGateList';
import TollGateModal from './TollGateModal';
import PaymentValuesSection from './PaymentValuesSection';
import TimeWindowsSection from './TimeWindowsSection';
import TimeWindowModal from './TimeWindowModal';
import AssignTimeWindowModal from './AssignTimeWindowModal';
import ConcessionaireViewModal from './ConcessionaireViewModal';
import { useApp } from '@/contexts/AppContext';
import { useAppState } from '@/hooks';
import type { TollGate, DayType, PaymentCategoryTimeWindow, TimeWindow } from '@/types';

const Dashboard: React.FC = () => {
  const { authService, apiService, authState } = useApp();
  const appState = useAppState(authService, apiService);

  const {
    // Mensajes
    message,
    showMessage,
    clearMessage,
    
    // Loading
    loading,
    setGlobalLoading,
    
    // Datos de referencia  
    tollGates,
    paymentCategories,
    vehicleCategories,
    timeWindows: timeWindowsData,
    concessionaires,
    directionTollGates,
    hasLoaded,
    loadReferenceData,
    addTollGate,
    updateTollGate,
    updateTollGates,
    
    // Selección de toll gates
    selectedTollGate,
    setSelectedTollGate,
    currentConfig,
    tollGateConfigs,
    configLoading,
    bulkConfigsLoading,
    handleTollGateSelect,
    loadTollGateConfig,
    loadAllTollGateConfigs,
    
    // Formularios
    showNewTollGateForm,
    editingTollGate,
    newTollGate,
    setShowNewTollGateForm,
    resetNewTollGateForm,
    handleNewTollGateChange,
    handleEditTollGate,
    
    // Filtros
    searchTerm,
    selectedConcessionaire,
    filteredTollGates,
    setSearchTerm,
    setSelectedConcessionaire,
    
    // Configuración de pagos
    paymentValues,
    setPaymentValues,
    addPaymentValue,
    updatePaymentValue,
    removePaymentValue,
    handleVehicleCategoryChange,
    getDuplicateWarning,
    resetPaymentValues,
    
    // Time windows
    selectedTimeWindows,
    showNewTimeWindowForm,
    showAssignTimeWindowForm,
    editingTimeWindow,
    newTimeWindow,
    setSelectedTimeWindows,
    setShowNewTimeWindowForm,
    setShowAssignTimeWindowForm,
    handleTimeWindowChange,
    resetNewTimeWindowForm,
    handleNewTimeWindowChange,
    validateNewTimeWindow,
    handleEditTimeWindow,
    
    // Concessionaire view
    showConcessionaireView,
    setShowConcessionaireView,
    selectedConcessionaireForView,
    setSelectedConcessionaireForView
  } = appState;

  // Estados locales para filtros de ventanas de tiempo
  const [timeWindowSearchTerm, setTimeWindowSearchTerm] = useState<string>('');
  const [selectedTimeWindowCategory, setSelectedTimeWindowCategory] = useState<string>('');
  const [selectedTimeWindowDay, setSelectedTimeWindowDay] = useState<DayType | ''>('');
  const [selectedTimeWindowBlock, setSelectedTimeWindowBlock] = useState<string>('');

  // Cargar datos al montar el componente
  // Cargar datos de referencia al montar el componente (solo una vez)
  useEffect(() => {
    if (!hasLoaded && !loading) {
      console.log('Dashboard: Loading reference data for the first time');
      loadReferenceData();
    }
  }, [hasLoaded, loading, loadReferenceData]);

  // Cargar configuraciones de toll gates cuando cambie la lista (evitando cargas duplicadas)
  useEffect(() => {
    if (tollGates.length > 0 && hasLoaded) {
      console.log('Dashboard: Loading toll gate configs because toll gates changed');
      loadAllTollGateConfigs(tollGates);
    }
  }, [tollGates, hasLoaded, loadAllTollGateConfigs]);

  const handleSaveConfig = async () => {
    if (!selectedTollGate || !apiService) return;

    setGlobalLoading(true);
    try {
      const configData = {
        paymentValues,
        timeWindowIds: selectedTimeWindows
      };

      await apiService.tollGate.saveTollGateConfig(selectedTollGate.id, configData);
      showMessage('success', 'Configuración guardada exitosamente');
      
      // Recargar la configuración del toll gate
      await loadTollGateConfig(selectedTollGate.id);
      
      // Limpiar formularios
      resetPaymentValues();
      setSelectedTimeWindows([]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showMessage('error', `Error al guardar la configuración: ${errorMessage}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationTriangle;
      case 'warning':
        return faExclamationTriangle;
      default:
        return faInfoCircle;
    }
  };

  const getMessageClasses = () => {
    switch (message.type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  };


  // Wrapper para handleTollGateSelect que acepta el objeto TollGate completo
  const handleTollGateSelectWrapper = (tollGate: TollGate) => {
    handleTollGateSelect(tollGate.id);
  };

  // Handler para crear nuevo toll gate
  const handleCreateTollGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiService) return;

    setGlobalLoading(true);

    try {
      const response = await apiService.tollGate.createTollGate({
        name: newTollGate.name,
        portico: newTollGate.portico || undefined,
        concessionaireId: typeof newTollGate.concessionaireId === 'string' 
          ? parseInt(newTollGate.concessionaireId) 
          : newTollGate.concessionaireId,
        latitude: parseFloat(newTollGate.latitude),
        longitude: parseFloat(newTollGate.longitude),
        directionId: newTollGate.directionId || undefined,
        isEntryorExit: newTollGate.isEntryorExit || undefined
      });

      showMessage('success', `Pórtico creado exitosamente: ${response.name}`);
      
      // Actualizar la lista de toll gates
      addTollGate(response);
      
      // Limpiar formulario y cerrar modal
      resetNewTollGateForm();
      setShowNewTollGateForm(false);
    } catch (error) {
      console.error('Error creating toll gate:', error);
      showMessage('error', `Error al crear pórtico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Handler para actualizar toll gate existente
  const handleUpdateTollGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiService || !editingTollGate) return;

    setGlobalLoading(true);

    try {
      const response = await apiService.tollGate.updateTollGate(editingTollGate.id, {
        name: newTollGate.name,
        portico: newTollGate.portico || undefined,
        concessionaireId: typeof newTollGate.concessionaireId === 'string' 
          ? parseInt(newTollGate.concessionaireId) 
          : newTollGate.concessionaireId,
        latitude: parseFloat(newTollGate.latitude),
        longitude: parseFloat(newTollGate.longitude),
        directionId: newTollGate.directionId || undefined,
        isEntryorExit: newTollGate.isEntryorExit || undefined
      });

      showMessage('success', `Pórtico actualizado exitosamente: ${response.name}`);
      
      // Actualizar en la lista
      updateTollGate(response);
      
      // Si era el pórtico seleccionado, actualizarlo
      if (selectedTollGate?.id === response.id) {
        handleTollGateSelect(response.id);
      }
      
      // Limpiar formulario y cerrar modal
      resetNewTollGateForm();
      setShowNewTollGateForm(false);
    } catch (error) {
      console.error('Error updating toll gate:', error);
      showMessage('error', `Error al actualizar pórtico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Handler para eliminar toll gate
  const handleDeleteTollGate = async (tollGateId: number) => {
    if (!apiService) return;

    const tollGateToDelete = tollGates.find(tg => tg.id === tollGateId);
    if (!tollGateToDelete) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar este pórtico?\n\n` +
      `🏷️ Nombre: ${tollGateToDelete.name}\n` +
      `🚪 Pórtico: ${tollGateToDelete.portico || 'N/A'}\n` +
      `🏢 Concesionaria: ${tollGateToDelete.concessionaire?.name || 'N/A'}\n\n` +
      `Esta acción eliminará permanentemente el pórtico y toda su configuración.\n` +
      `Esta acción no se puede deshacer.`;

    if (!window.confirm(confirmMessage)) return;

    setGlobalLoading(true);

    try {
      await apiService.tollGate.deleteTollGate(tollGateId);
      showMessage('success', `Pórtico eliminado exitosamente: ${tollGateToDelete.name}`);
      
      // Actualizar la lista de toll gates
      const updatedTollGates = tollGates.filter(tg => tg.id !== tollGateId);
      updateTollGates(updatedTollGates);
      
      // Si el pórtico eliminado estaba seleccionado, deseleccionarlo
      if (selectedTollGate?.id === tollGateId) {
        setSelectedTollGate(null);
      }
    } catch (error) {
      console.error('Error deleting toll gate:', error);
      showMessage('error', `Error eliminando pórtico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Handler para cerrar modal
  const handleCloseModal = () => {
    setShowNewTollGateForm(false);
    resetNewTollGateForm();
  };

  // Wrapper para getDuplicateWarning que incluye currentConfig
  const getDuplicateWarningWrapper = (paymentCategoryId: string, vehicleCategoryIds: number[], currentIndex: number) => {
    return getDuplicateWarning(paymentCategoryId, vehicleCategoryIds, currentIndex, currentConfig);
  };

  // Wrapper para handleEditTimeWindow que convierte PaymentCategoryTimeWindow a TimeWindow
  const handleEditTimeWindowWrapper = (paymentCategoryTimeWindow: PaymentCategoryTimeWindow) => {
    // Convertir PaymentCategoryTimeWindow a TimeWindow para compatibilidad
    const timeWindow: TimeWindow = {
      id: paymentCategoryTimeWindow.id,
      from: paymentCategoryTimeWindow.from,
      to: paymentCategoryTimeWindow.to,
      dayType: paymentCategoryTimeWindow.dayType,
      dayTypes: [paymentCategoryTimeWindow.dayType], // Convertir singular a array
      paymentCategoryId: paymentCategoryTimeWindow.paymentCategory.id.toString(),
      paymentCategory: paymentCategoryTimeWindow.paymentCategory
    };
    
    handleEditTimeWindow(timeWindow);
  };

  // Handlers para Ventanas de Tiempo
  const handleCreateTimeWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiService) return;

    setGlobalLoading(true);

    try {
      // Si tiene múltiples días, crear ventanas para cada día
      const dayTypes = newTimeWindow.dayTypes.includes('ALL_DAYS') 
        ? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
        : newTimeWindow.dayTypes;

      const createdWindows = [];
      
      for (const dayType of dayTypes) {
        const timeWindowData = {
          from: newTimeWindow.from,
          to: newTimeWindow.to,
          dayType,
          paymentCategoryId: newTimeWindow.paymentCategoryId
        };
        
        const createdWindow = await apiService.timeWindow.createTimeWindow(timeWindowData);
        createdWindows.push(createdWindow);
      }

      showMessage('success', `${createdWindows.length} ventana${createdWindows.length > 1 ? 's' : ''} de tiempo creada${createdWindows.length > 1 ? 's' : ''} exitosamente`);
      
      // Recargar datos de referencia para incluir las nuevas ventanas
      await loadReferenceData();
      
      // Si hay un pórtico seleccionado, recargar su configuración
      if (selectedTollGate) {
        await loadTollGateConfig(selectedTollGate.id);
      }
      
      resetNewTimeWindowForm();
      setShowNewTimeWindowForm(false);
    } catch (error) {
      console.error('Error creating time windows:', error);
      showMessage('error', `Error al crear ventana${newTimeWindow.dayTypes.length > 1 ? 's' : ''} de tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleUpdateTimeWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiService || !editingTimeWindow) return;

    setGlobalLoading(true);

    try {
      // Si se seleccionaron múltiples días, crear ventanas adicionales
      const dayTypes = newTimeWindow.dayTypes.includes('ALL_DAYS') 
        ? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
        : newTimeWindow.dayTypes;

      // Actualizar la ventana original
      const updatedWindow = await apiService.timeWindow.updateTimeWindow(editingTimeWindow.id, {
        from: newTimeWindow.from,
        to: newTimeWindow.to,
        dayType: dayTypes[0], // Usar el primer día para la ventana original
        paymentCategoryId: newTimeWindow.paymentCategoryId
      });

      let createdAdditionalWindows = 0;
      
      // Crear ventanas adicionales para otros días
      if (dayTypes.length > 1) {
        for (let i = 1; i < dayTypes.length; i++) {
          try {
            await apiService.timeWindow.createTimeWindow({
              from: newTimeWindow.from,
              to: newTimeWindow.to,
              dayType: dayTypes[i],
              paymentCategoryId: newTimeWindow.paymentCategoryId
            });
            createdAdditionalWindows++;
          } catch (error) {
            console.warn(`Error creating additional window for ${dayTypes[i]}:`, error);
          }
        }
      }

      const totalMessage = createdAdditionalWindows > 0 
        ? `Ventana actualizada y ${createdAdditionalWindows} ventana${createdAdditionalWindows > 1 ? 's' : ''} adicional${createdAdditionalWindows > 1 ? 'es' : ''} creada${createdAdditionalWindows > 1 ? 's' : ''}`
        : 'Ventana de tiempo actualizada exitosamente';

      showMessage('success', totalMessage);
      
      // Recargar datos
      await loadReferenceData();
      if (selectedTollGate) {
        await loadTollGateConfig(selectedTollGate.id);
      }
      
      resetNewTimeWindowForm();
      setShowNewTimeWindowForm(false);
    } catch (error) {
      console.error('Error updating time window:', error);
      showMessage('error', `Error al actualizar ventana de tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeleteTimeWindow = async (timeWindowId: number) => {
    if (!apiService) return;

    const timeWindow = timeWindowsData.find(tw => tw.id === timeWindowId);
    if (!timeWindow) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar esta ventana de tiempo?\n\n` +
      `⏰ Horario: ${timeWindow.from} - ${timeWindow.to}\n` +
      `📅 Día: ${timeWindow.dayType}\n` +
      `📋 Categoría: ${timeWindow.paymentCategory?.name || 'N/A'}\n\n` +
      `Esta acción no se puede deshacer.`;

    if (!window.confirm(confirmMessage)) return;

    setGlobalLoading(true);

    try {
      await apiService.timeWindow.deleteTimeWindow(timeWindowId);
      showMessage('success', 'Ventana de tiempo eliminada exitosamente');
      
      // Recargar datos
      await loadReferenceData();
      if (selectedTollGate) {
        await loadTollGateConfig(selectedTollGate.id);
      }
    } catch (error) {
      console.error('Error deleting time window:', error);
      showMessage('error', `Error eliminando ventana de tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleAssignTimeWindows = async (timeWindowIds: number[]) => {
    if (!apiService || !selectedTollGate || timeWindowIds.length === 0) return;

    setGlobalLoading(true);

    try {
      await apiService.tollGate.assignTimeWindows(selectedTollGate.id, timeWindowIds);
      showMessage('success', `${timeWindowIds.length} ventana${timeWindowIds.length > 1 ? 's' : ''} de tiempo asignada${timeWindowIds.length > 1 ? 's' : ''} exitosamente`);
      
      // Recargar configuración del pórtico
      await loadTollGateConfig(selectedTollGate.id);
      
      // Limpiar selección y cerrar modal
      setSelectedTimeWindows([]);
      setShowAssignTimeWindowForm(false);
    } catch (error) {
      console.error('Error assigning time windows:', error);
      showMessage('error', `Error asignando ventanas de tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Handler para cerrar modal de ventana de tiempo
  const handleCloseTimeWindowModal = () => {
    setShowNewTimeWindowForm(false);
    resetNewTimeWindowForm();
  };

  // Handler para cerrar modal de asignación
  const handleCloseAssignModal = () => {
    setShowAssignTimeWindowForm(false);
    setSelectedTimeWindows([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faRoad} className="text-white text-sm" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestor de Toll Gates
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bienvenido, <span className="font-medium">{authState.user?.name || authState.user?.username}</span>
              </div>
              <button
                onClick={() => setShowConcessionaireView(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                Vista por Concesionario
              </button>
              <button
                onClick={() => setShowNewTollGateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nuevo Pórtico
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`alert ${getMessageClasses()} flex items-center justify-between`}>
            <div className="flex items-center">
              <FontAwesomeIcon icon={getMessageIcon()} className="mr-2" />
              <span>{message.text}</span>
            </div>
            <button
              onClick={clearMessage}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Toll Gates */}
          <div className="lg:col-span-1">
            <TollGateList
              tollGates={tollGates}
              concessionaires={concessionaires}
              selectedTollGate={selectedTollGate}
              searchTerm={searchTerm}
              selectedConcessionaire={selectedConcessionaire}
              onTollGateSelect={handleTollGateSelectWrapper}
              onSearchChange={setSearchTerm}
              onConcessionaireChange={setSelectedConcessionaire}
              onNewTollGate={() => setShowNewTollGateForm(true)}
              onEditTollGate={handleEditTollGate}
              onDeleteTollGate={handleDeleteTollGate}
              loading={bulkConfigsLoading}
            />
          </div>

          {/* Configuración del Toll Gate */}
          <div className="lg:col-span-2">
            {selectedTollGate ? (
              <div className="space-y-6">
                {/* Información del toll gate seleccionado */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FontAwesomeIcon icon={faCog} className="mr-2 text-blue-600" />
                      Configuración: {selectedTollGate.name}
                      {configLoading && (
                        <div className="ml-3 flex items-center">
                          <div className="spinner h-4 w-4 mr-2" />
                          <span className="text-sm text-gray-600">Cargando configuración...</span>
                        </div>
                      )}
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Pórtico:</span>
                        <span className="ml-2 font-medium">{selectedTollGate.portico}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Concesionario:</span>
                        <span className="ml-2 font-medium">{selectedTollGate.concessionaire?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Coordenadas:</span>
                        <span className="ml-2 font-mono text-xs">
                          {parseFloat(selectedTollGate.latitude.toString()).toFixed(4)}, {parseFloat(selectedTollGate.longitude.toString()).toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <span className="ml-2 font-medium">
                          {selectedTollGate.isEntryorExit === 'ENTRY' ? 'Entrada' :
                           selectedTollGate.isEntryorExit === 'EXIT' ? 'Salida' :
                           selectedTollGate.isEntryorExit === 'BOTH' ? 'Entrada y Salida' : 'No definido'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de Valores de Pago */}
                <PaymentValuesSection
                  selectedTollGate={selectedTollGate}
                  paymentValues={paymentValues}
                  paymentCategories={paymentCategories}
                  vehicleCategories={vehicleCategories}
                  existingPaymentValues={currentConfig?.paymentValues || []}
                  onAddPaymentValue={addPaymentValue}
                  onUpdatePaymentValue={updatePaymentValue}
                  onRemovePaymentValue={removePaymentValue}
                  onVehicleCategoryChange={handleVehicleCategoryChange}
                  getDuplicateWarning={getDuplicateWarningWrapper}
                />

                {/* Sección de Ventanas de Tiempo */}
                <TimeWindowsSection
                  selectedTollGate={selectedTollGate}
                  timeWindows={timeWindowsData}
                  paymentCategories={paymentCategories}
                  existingTimeWindows={currentConfig?.assignedTimeWindows || []}
                  searchTerm={timeWindowSearchTerm}
                  selectedCategory={selectedTimeWindowCategory}
                  selectedDay={selectedTimeWindowDay}
                  selectedTimeBlock={selectedTimeWindowBlock}
                  onNewTimeWindow={() => setShowNewTimeWindowForm(true)}
                  onAssignTimeWindows={() => setShowAssignTimeWindowForm(true)}
                  onEditTimeWindow={handleEditTimeWindowWrapper}
                  onDeleteTimeWindow={handleDeleteTimeWindow}
                  onSearchChange={setTimeWindowSearchTerm}
                  onCategoryChange={setSelectedTimeWindowCategory}
                  onDayChange={setSelectedTimeWindowDay}
                  onTimeBlockChange={setSelectedTimeWindowBlock}
                  loading={configLoading}
                />

                {/* Botón de guardado */}
                <div className="card">
                  <div className="card-body">
                    <button
                      onClick={handleSaveConfig}
                      disabled={loading || (paymentValues.length === 0 && selectedTimeWindows.length === 0)}
                      className="btn-success w-full py-3 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="spinner h-5 w-5 mr-2" />
                          Guardando configuración...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Guardar Configuración
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl text-gray-300 mb-4">
                  <FontAwesomeIcon icon={faRoad} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Selecciona un Pórtico
                </h3>
                <p className="text-gray-500">
                  Elige un pórtico de la lista para configurar sus valores de pago y ventanas de tiempo.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center">
              <div className="spinner h-8 w-8 mr-4" />
              <span className="text-gray-700">Procesando...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Toll Gate */}
      <TollGateModal
        isOpen={showNewTollGateForm}
        editingTollGate={editingTollGate}
        newTollGate={newTollGate}
        concessionaires={concessionaires}
        directionTollGates={directionTollGates}
        loading={loading}
        onClose={handleCloseModal}
        onSubmit={editingTollGate ? handleUpdateTollGate : handleCreateTollGate}
        onChange={handleNewTollGateChange}
      />

      {/* Modal de Ventana de Tiempo */}
      <TimeWindowModal
        isOpen={showNewTimeWindowForm}
        editingTimeWindow={editingTimeWindow}
        newTimeWindow={newTimeWindow}
        paymentCategories={paymentCategories}
        loading={loading}
        onClose={handleCloseTimeWindowModal}
        onSubmit={editingTimeWindow ? handleUpdateTimeWindow : handleCreateTimeWindow}
        onChange={handleNewTimeWindowChange}
      />

      {/* Modal para Asignar Ventanas de Tiempo */}
      <AssignTimeWindowModal
        isOpen={showAssignTimeWindowForm}
        selectedTollGate={selectedTollGate}
        assignedTimeWindows={currentConfig?.assignedTimeWindows || []}
        paymentCategories={paymentCategories}
        selectedTimeWindowIds={selectedTimeWindows}
        loading={loading}
        onClose={handleCloseAssignModal}
        onSubmit={handleAssignTimeWindows}
        onSelectionChange={setSelectedTimeWindows}
      />

      {/* Modal de Vista por Concesionario */}
      <ConcessionaireViewModal
        isOpen={showConcessionaireView}
        concessionaires={concessionaires}
        tollGates={tollGates}
        tollGateConfigs={tollGateConfigs}
        selectedConcessionaireForView={selectedConcessionaireForView}
        onClose={() => setShowConcessionaireView(false)}
        onConcessionaireChange={setSelectedConcessionaireForView}
        onTollGateSelect={(tollGate) => {
          setSelectedTollGate(tollGate);
          handleTollGateSelect(tollGate.id);
        }}
      />
    </div>
  );
};

export default Dashboard;
