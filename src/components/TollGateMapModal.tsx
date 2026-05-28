/**
 * TollGateMapModal Component
 * Modal que muestra un mapa con todos los pórticos del sistema
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faMapMarkerAlt, 
  faFilter,
  faExpand,
  faCompress,
  faRoad
} from '@fortawesome/free-solid-svg-icons';
import type { TollGate, Concessionaire } from '@/types';

// Importación dinámica de Leaflet para evitar problemas con SSR
import dynamic from 'next/dynamic';

interface TollGateMapModalProps {
  isOpen: boolean;
  tollGates: TollGate[];
  concessionaires: Concessionaire[];
  onClose: () => void;
  onTollGateSelect?: (tollGate: TollGate) => void;
  loading?: boolean;
}

// Componente del mapa que se carga dinámicamente
const MapComponent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

const TollGateMapModal: React.FC<TollGateMapModalProps> = ({
  isOpen,
  tollGates,
  concessionaires,
  onClose,
  onTollGateSelect,
  loading = false
}) => {
  const [selectedConcessionaire, setSelectedConcessionaire] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtrar pórticos según los filtros seleccionados
  const filteredTollGates = useMemo(() => {
    return tollGates.filter(tg => {
      // Filtro por concesionario
      if (selectedConcessionaire && tg.concessionaireId.toString() !== selectedConcessionaire) {
        return false;
      }
      
      // Filtro por tipo (entrada/salida/ambos)
      if (selectedType && tg.isEntryorExit !== selectedType) {
        return false;
      }
      
      // Filtro por búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          tg.name.toLowerCase().includes(search) ||
          tg.portico?.toLowerCase().includes(search) ||
          tg.concessionaire?.name?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [tollGates, selectedConcessionaire, selectedType, searchTerm]);

  // Estadísticas de los pórticos filtrados
  const stats = useMemo(() => {
    const entry = filteredTollGates.filter(tg => tg.isEntryorExit === 'ENTRY').length;
    const exit = filteredTollGates.filter(tg => tg.isEntryorExit === 'EXIT').length;
    const both = filteredTollGates.filter(tg => tg.isEntryorExit === 'BOTH').length;
    const other = filteredTollGates.filter(tg => !['ENTRY', 'EXIT', 'BOTH'].includes(tg.isEntryorExit)).length;
    
    return { entry, exit, both, other, total: filteredTollGates.length };
  }, [filteredTollGates]);

  // Limpiar filtros al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedConcessionaire('');
      setSelectedType('');
      setSearchTerm('');
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  const handleTollGateClick = (tollGate: TollGate) => {
    if (onTollGateSelect) {
      onTollGateSelect(tollGate);
      onClose();
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div 
        className={`
          relative mx-auto bg-white rounded-xl shadow-2xl overflow-hidden
          transition-all duration-300 ease-in-out
          ${isFullscreen 
            ? 'fixed inset-4 top-4 w-auto h-auto' 
            : 'top-8 w-11/12 max-w-6xl h-[85vh]'
          }
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-2xl mr-3" />
              <div>
                <h2 className="text-xl font-bold">Mapa de Pórticos</h2>
                <p className="text-blue-100 text-sm">
                  {stats.total} pórtico{stats.total !== 1 ? 's' : ''} en el sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            {/* Búsqueda */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar pórtico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input text-sm py-1.5"
              />
            </div>
            
            {/* Filtro por concesionario */}
            <select
              value={selectedConcessionaire}
              onChange={(e) => setSelectedConcessionaire(e.target.value)}
              className="form-input text-sm py-1.5 min-w-[180px]"
            >
              <option value="">Todos los concesionarios</option>
              {concessionaires.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
            
            {/* Filtro por tipo */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input text-sm py-1.5 min-w-[150px]"
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Salida</option>
              <option value="BOTH">Entrada y Salida</option>
            </select>
          </div>
          
          {/* Leyenda de colores */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500">Leyenda:</span>
            <div className="flex items-center text-sm">
              <span className="w-4 h-4 rounded-full bg-emerald-500 mr-1.5" />
              <span className="text-gray-700">Entrada ({stats.entry})</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-4 h-4 rounded-full bg-rose-500 mr-1.5" />
              <span className="text-gray-700">Salida ({stats.exit})</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-4 h-4 rounded-full bg-amber-500 mr-1.5" />
              <span className="text-gray-700">Entrada y Salida ({stats.both})</span>
            </div>
            {stats.other > 0 && (
              <div className="flex items-center text-sm">
                <span className="w-4 h-4 rounded-full bg-gray-400 mr-1.5" />
                <span className="text-gray-700">Otros ({stats.other})</span>
              </div>
            )}
          </div>
        </div>

        {/* Contenedor del Mapa */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100%-180px)]' : 'h-[calc(85vh-180px)]'}`}>
          {/* Overlay de carga */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="spinner h-12 w-12 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Actualizando pórticos...</p>
                <p className="text-gray-500 text-sm mt-1">Obteniendo datos más recientes</p>
              </div>
            </div>
          )}
          
          {filteredTollGates.length > 0 ? (
            <MapComponent
              tollGates={filteredTollGates}
              onTollGateClick={handleTollGateClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <FontAwesomeIcon icon={faRoad} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No hay pórticos para mostrar
                </h3>
                <p className="text-gray-500">
                  Ajusta los filtros para ver pórticos en el mapa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TollGateMapModal;
