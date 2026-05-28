'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faBuilding,
  faRoad,
  faMapMarkerAlt,
  faSearch,
  faInfoCircle,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import type { Concessionaire, TollGate, TollGateConfigSummary } from '@/types';

export interface ConcessionaireViewModalProps {
  isOpen: boolean;
  concessionaires: Concessionaire[];
  tollGates: TollGate[];
  tollGateConfigs: Record<number, TollGateConfigSummary>;
  selectedConcessionaireForView: string;
  onClose: () => void;
  onConcessionaireChange: (concessionaireId: string) => void;
  onTollGateSelect: (tollGate: TollGate) => void;
  onLoadConfigs?: (tollGates: TollGate[]) => Promise<Record<number, TollGateConfigSummary>>;
}

export const ConcessionaireViewModal: React.FC<ConcessionaireViewModalProps> = ({
  isOpen,
  concessionaires,
  tollGates,
  tollGateConfigs,
  selectedConcessionaireForView,
  onClose,
  onConcessionaireChange,
  onTollGateSelect,
  onLoadConfigs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const lastLoadedConcessionaireRef = useRef<string>('');

  // Cargar configuraciones bajo demanda cuando cambie el concesionario seleccionado
  useEffect(() => {
    if (!isOpen || !selectedConcessionaireForView || !onLoadConfigs) return;
    
    // Evitar recargar si ya se cargó para este concesionario
    if (lastLoadedConcessionaireRef.current === selectedConcessionaireForView) return;
    
    const loadConfigsForConcessionaire = async () => {
      const concessionaireTollGates = tollGates.filter(
        tg => tg.concessionaireId.toString() === selectedConcessionaireForView
      );
      
      if (concessionaireTollGates.length === 0) return;
      
      // Verificar si ya tenemos las configuraciones para todos los pórticos de este concesionario
      const hasAllConfigs = concessionaireTollGates.every(tg => tollGateConfigs[tg.id]);
      if (hasAllConfigs) return;
      
      setLoadingConfigs(true);
      try {
        console.log(`Loading configs for ${concessionaireTollGates.length} toll gates of concessionaire ${selectedConcessionaireForView}`);
        await onLoadConfigs(concessionaireTollGates);
        lastLoadedConcessionaireRef.current = selectedConcessionaireForView;
      } catch (error) {
        console.error('Error loading configs for concessionaire:', error);
      } finally {
        setLoadingConfigs(false);
      }
    };
    
    loadConfigsForConcessionaire();
  }, [isOpen, selectedConcessionaireForView, tollGates, onLoadConfigs, tollGateConfigs]);

  // Filtrar toll gates por concesionario seleccionado
  const filteredTollGates = useMemo(() => {
    if (!isOpen) return [];
    
    let gates = tollGates;

    if (selectedConcessionaireForView) {
      gates = gates.filter(tg => tg.concessionaireId.toString() === selectedConcessionaireForView);
    }

    if (searchTerm) {
      gates = gates.filter(tg => 
        tg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tg.portico.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return gates;
  }, [isOpen, tollGates, selectedConcessionaireForView, searchTerm]);

  // Obtener información del concesionario seleccionado
  const selectedConcessionaire = concessionaires.find(c => 
    c.id.toString() === selectedConcessionaireForView
  );

  // Estadísticas por concesionario
  const stats = useMemo(() => {
    const tollGatesCount = filteredTollGates.length;
    const configuredCount = filteredTollGates.filter(tg => {
      const config = tollGateConfigs[tg.id];
      return config && (config.hasPaymentValues || config.hasTimeWindows);
    }).length;
    const unconfiguredCount = tollGatesCount - configuredCount;

    return {
      tollGatesCount,
      configuredCount,
      unconfiguredCount,
      configurationPercentage: tollGatesCount > 0 ? Math.round((configuredCount / tollGatesCount) * 100) : 0
    };
  }, [filteredTollGates, tollGateConfigs]);

  if (!isOpen) return null;

  const handleTollGateClick = (tollGate: TollGate) => {
    onTollGateSelect(tollGate);
    onClose(); // Cerrar modal después de seleccionar
  };

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-600" />
            Vista por Concesionario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo: Selector de concesionario */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">Seleccionar Concesionario</h3>
              <select
                value={selectedConcessionaireForView}
                onChange={(e) => onConcessionaireChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un concesionario</option>
                {concessionaires.map(concessionaire => (
                  <option key={concessionaire.id} value={concessionaire.id}>
                    {concessionaire.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedConcessionaire && (
              <div className="p-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                    {selectedConcessionaire.name}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pórticos:</span>
                      <span className="font-medium text-blue-900">{stats.tollGatesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Configurados:</span>
                      <span className="font-medium text-green-600">{stats.configuredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Sin configurar:</span>
                      <span className="font-medium text-red-600">{stats.unconfiguredCount}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Progreso:</span>
                        <span className="font-bold text-blue-900">{stats.configurationPercentage}%</span>
                      </div>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.configurationPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho: Lista de pórticos */}
          <div className="flex-1 flex flex-col">
            {!selectedConcessionaireForView ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FontAwesomeIcon icon={faBuilding} className="text-4xl mb-4" />
                  <p className="text-lg font-medium mb-2">Seleccione un Concesionario</p>
                  <p className="text-sm">Elija un concesionario del panel izquierdo para ver sus pórticos</p>
                </div>
              </div>
            ) : (
              <>
                {/* Buscador y estadísticas */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800">
                      Pórticos de {selectedConcessionaire?.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {filteredTollGates.length} pórtico{filteredTollGates.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Búsqueda */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar pórticos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Lista de pórticos */}
                <div className="flex-1 overflow-y-auto">
                  {loadingConfigs && (
                    <div className="p-4 bg-blue-50 border-b border-blue-200">
                      <div className="flex items-center text-blue-700">
                        <div className="spinner h-4 w-4 mr-2" />
                        <span className="text-sm">Cargando configuraciones de pórticos...</span>
                      </div>
                    </div>
                  )}
                  {filteredTollGates.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faSearch} className="text-3xl mb-2" />
                        <p>No se encontraron pórticos</p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Limpiar búsqueda
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredTollGates.map(tollGate => {
                        const config = tollGateConfigs[tollGate.id];
                        const isConfigured = config && (config.hasPaymentValues || config.hasTimeWindows);

                        return (
                          <div
                            key={tollGate.id}
                            onClick={() => handleTollGateClick(tollGate)}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {tollGate.name}
                                  </h4>
                                  {tollGate.portico && (
                                    <span className="ml-2 text-sm text-gray-500">
                                      • Pórtico {tollGate.portico}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                    {parseFloat(tollGate.latitude.toString()).toFixed(4)}, {parseFloat(tollGate.longitude.toString()).toFixed(4)}
                                  </div>
                                  {tollGate.isEntryorExit && (
                                    <div className="flex items-center">
                                      <FontAwesomeIcon icon={faRoad} className="mr-1" />
                                      {tollGate.isEntryorExit === 'ENTRY' ? 'Entrada' : 
                                       tollGate.isEntryorExit === 'EXIT' ? 'Salida' : 'Ambos'}
                                    </div>
                                  )}
                                </div>

                                {/* Estado de configuración */}
                                <div className="mt-2 flex items-center space-x-3">
                                  {isConfigured ? (
                                    <div className="flex items-center text-green-600">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                      <span className="text-sm font-medium">Configurado</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-red-600">
                                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                      <span className="text-sm font-medium">Sin configurar</span>
                                    </div>
                                  )}

                                  {config && (
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      {config.hasPaymentValues && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                          {config.paymentCount} pagos
                                        </span>
                                      )}
                                      {config.hasTimeWindows && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                          {config.timeWindowCount} horarios
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="ml-4 flex items-center">
                                <FontAwesomeIcon 
                                  icon={faChevronRight} 
                                  className="text-gray-400 group-hover:text-blue-600 transition-colors" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Haga clic en un pórtico para configurarlo
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcessionaireViewModal;
