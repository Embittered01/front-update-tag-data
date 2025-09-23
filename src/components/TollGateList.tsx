'use client';

import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRoad, 
  faMapMarkerAlt, 
  faBuilding, 
  faSearch,
  faPlus,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import type { TollGate, Concessionaire } from '@/types';

export interface TollGateListProps {
  tollGates: TollGate[];
  concessionaires: Concessionaire[];
  selectedTollGate?: TollGate | null;
  searchTerm: string;
  selectedConcessionaire: string;
  onTollGateSelect: (tollGate: TollGate) => void;
  onSearchChange: (term: string) => void;
  onConcessionaireChange: (concessionaireId: string) => void;
  onNewTollGate: () => void;
  onEditTollGate: (tollGate: TollGate) => void;
  onDeleteTollGate: (tollGateId: number) => void;
  loading?: boolean;
}

export const TollGateList: React.FC<TollGateListProps> = ({
  tollGates,
  concessionaires,
  selectedTollGate,
  searchTerm,
  selectedConcessionaire,
  onTollGateSelect,
  onSearchChange,
  onConcessionaireChange,
  onNewTollGate,
  onEditTollGate,
  onDeleteTollGate,
  loading = false
}) => {
  // Filtrar toll gates según el término de búsqueda y concesionario seleccionado (memoizado)
  const filteredTollGates = useMemo(() => {
    return tollGates.filter(tollGate => {
      const matchesSearch = !searchTerm || 
        tollGate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tollGate.portico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tollGate.concessionaire?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesConcessionaire = !selectedConcessionaire || 
        selectedConcessionaire === '' ||
        tollGate.concessionaireId.toString() === selectedConcessionaire;
      
      return matchesSearch && matchesConcessionaire;
    });
  }, [tollGates, searchTerm, selectedConcessionaire]);

  // Obtener información del concesionario (memoizado)
  const getConcessionaireName = useMemo(() => {
    const concessionaireMap = new Map(concessionaires.map(c => [c.id, c.name]));
    return (concessionaireId: number): string => {
      return concessionaireMap.get(concessionaireId) || 'N/A';
    };
  }, [concessionaires]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Pórticos</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="spinner h-8 w-8 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando pórticos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faRoad} className="mr-2 text-blue-600" />
          Pórticos ({filteredTollGates.length})
        </h3>
      </div>
      
      <div className="card-body">
        {/* Controles de búsqueda y filtrado */}
        <div className="space-y-3 mb-4">
          {/* Búsqueda */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" 
            />
            <input
              type="text"
              placeholder="Buscar por nombre o pórtico..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          {/* Filtro por concesionario */}
          <select
            value={selectedConcessionaire}
            onChange={(e) => onConcessionaireChange(e.target.value)}
            className="input"
          >
            <option value="">Todos los concesionarios</option>
            {concessionaires.map(concessionaire => (
              <option key={concessionaire.id} value={concessionaire.id.toString()}>
                {concessionaire.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Nuevo Toll Gate */}
        <div className="mb-4">
          <button
            onClick={onNewTollGate}
            className="btn-primary w-full flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nuevo Pórtico
          </button>
        </div>

        {/* Lista de Toll Gates */}
        {filteredTollGates.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faRoad} className="text-gray-300 text-4xl mb-4" />
            <p className="text-gray-500">
              {tollGates.length === 0 
                ? 'No hay pórticos disponibles'
                : 'No se encontraron pórticos con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTollGates.map(tollGate => (
              <div
                key={tollGate.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedTollGate?.id === tollGate.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onTollGateSelect(tollGate)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Información principal */}
                    <div className="flex items-center mb-1">
                      <FontAwesomeIcon icon={faRoad} className="text-blue-600 text-sm mr-2 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {tollGate.name}
                      </h4>
                    </div>
                    
                    {/* Detalles */}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 w-3" />
                        <span className="truncate">Pórtico: {tollGate.portico ?? 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBuilding} className="mr-1 w-3" />
                        <span className="truncate">
                          {getConcessionaireName(tollGate.concessionaireId)}
                        </span>
                      </div>
                      
                      {tollGate.latitude && tollGate.longitude && (
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 w-3" />
                          <span className="truncate">
                            {tollGate.latitude.toFixed(4)}, {tollGate.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTollGate(tollGate);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Estás seguro de eliminar el pórtico "${tollGate.name}"?`)) {
                          onDeleteTollGate(tollGate.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                </div>
                
                {/* Indicador de selección */}
                {selectedTollGate?.id === tollGate.id && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✓ Seleccionado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TollGateList;
