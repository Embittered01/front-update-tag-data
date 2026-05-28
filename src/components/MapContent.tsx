/**
 * MapContent Component
 * Componente interno que renderiza el mapa de Leaflet
 * Se carga dinámicamente para evitar problemas con SSR
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TollGate } from '@/types';

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css';

interface MapContentProps {
  tollGates: TollGate[];
  onTollGateClick?: (tollGate: TollGate) => void;
}

// Colores para cada tipo de pórtico
const TOLL_GATE_COLORS = {
  ENTRY: '#10b981',    // emerald-500
  EXIT: '#f43f5e',     // rose-500
  BOTH: '#f59e0b',     // amber-500
  DEFAULT: '#6b7280'   // gray-500
};

// Crear icono personalizado para marcadores
const createCustomIcon = (color: string, type: string): L.DivIcon => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">
        ${type === 'ENTRY' ? '→' : type === 'EXIT' ? '←' : type === 'BOTH' ? '↔' : '•'}
      </span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Componente para ajustar la vista del mapa a los marcadores
const MapBoundsAdjuster: React.FC<{ tollGates: TollGate[] }> = ({ tollGates }) => {
  const map = useMap();

  useEffect(() => {
    if (tollGates.length === 0) return;

    const validTollGates = tollGates.filter(
      tg => tg.latitude && tg.longitude && 
           !isNaN(Number(tg.latitude)) && !isNaN(Number(tg.longitude))
    );

    if (validTollGates.length === 0) return;

    if (validTollGates.length === 1) {
      // Si solo hay un pórtico, centrar en él
      map.setView(
        [Number(validTollGates[0].latitude), Number(validTollGates[0].longitude)],
        14
      );
    } else {
      // Si hay múltiples, ajustar los límites para mostrar todos
      const bounds = L.latLngBounds(
        validTollGates.map(tg => [Number(tg.latitude), Number(tg.longitude)] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tollGates, map]);

  return null;
};

const MapContent: React.FC<MapContentProps> = ({ tollGates, onTollGateClick }) => {
  // Calcular el centro inicial del mapa
  const center = useMemo(() => {
    const validTollGates = tollGates.filter(
      tg => tg.latitude && tg.longitude && 
           !isNaN(Number(tg.latitude)) && !isNaN(Number(tg.longitude))
    );

    if (validTollGates.length === 0) {
      // Centro por defecto (Ciudad de México)
      return { lat: 19.4326, lng: -99.1332 };
    }

    const latSum = validTollGates.reduce((sum, tg) => sum + Number(tg.latitude), 0);
    const lngSum = validTollGates.reduce((sum, tg) => sum + Number(tg.longitude), 0);

    return {
      lat: latSum / validTollGates.length,
      lng: lngSum / validTollGates.length
    };
  }, [tollGates]);

  // Crear iconos personalizados para cada tipo
  const icons = useMemo(() => ({
    ENTRY: createCustomIcon(TOLL_GATE_COLORS.ENTRY, 'ENTRY'),
    EXIT: createCustomIcon(TOLL_GATE_COLORS.EXIT, 'EXIT'),
    BOTH: createCustomIcon(TOLL_GATE_COLORS.BOTH, 'BOTH'),
    DEFAULT: createCustomIcon(TOLL_GATE_COLORS.DEFAULT, 'DEFAULT')
  }), []);

  const getIcon = (type: string): L.DivIcon => {
    return icons[type as keyof typeof icons] || icons.DEFAULT;
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'ENTRY': return 'Entrada';
      case 'EXIT': return 'Salida';
      case 'BOTH': return 'Entrada y Salida';
      default: return 'No definido';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'ENTRY': return 'bg-emerald-100 text-emerald-800';
      case 'EXIT': return 'bg-rose-100 text-rose-800';
      case 'BOTH': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar pórticos con coordenadas válidas
  const validTollGates = tollGates.filter(
    tg => tg.latitude && tg.longitude && 
         !isNaN(Number(tg.latitude)) && !isNaN(Number(tg.longitude))
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapBoundsAdjuster tollGates={validTollGates} />

      {validTollGates.map((tollGate) => (
        <Marker
          key={tollGate.id}
          position={[Number(tollGate.latitude), Number(tollGate.longitude)]}
          icon={getIcon(tollGate.isEntryorExit)}
          eventHandlers={{
            click: () => onTollGateClick?.(tollGate)
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {tollGate.name}
              </h3>
              
              <div className="space-y-1.5 text-sm">
                {tollGate.portico && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Pórtico:</span>
                    <span className="font-medium text-gray-900">{tollGate.portico}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Tipo:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(tollGate.isEntryorExit)}`}>
                    {getTypeLabel(tollGate.isEntryorExit)}
                  </span>
                </div>
                
                {tollGate.concessionaire && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Concesionario:</span>
                    <span className="font-medium text-gray-900">{tollGate.concessionaire.name}</span>
                  </div>
                )}

                {tollGate.directiontollgate && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Dirección:</span>
                    <span className="font-medium text-gray-900">
                      {tollGate.directiontollgate.name}
                      {tollGate.directiontollgate.abbreviation && (
                        <span className="text-gray-500 ml-1">
                          ({tollGate.directiontollgate.abbreviation})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Coordenadas:</span>
                  <span className="font-mono text-xs text-gray-700">
                    {Number(tollGate.latitude).toFixed(6)}, {Number(tollGate.longitude).toFixed(6)}
                  </span>
                </div>
              </div>

              {onTollGateClick && (
                <button
                  onClick={() => onTollGateClick(tollGate)}
                  className="mt-3 w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver configuración
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapContent;
