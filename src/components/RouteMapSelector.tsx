/**
 * RouteMapSelector Component
 * Componente de mapa mejorado con mejor UX y opciones de entrada manual
 */

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEdit, faCheck, faTimes, faCrosshairs, faRoad, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import type { CoordinateDto, RoutePoint, TollGateTransactionData, LatLngTimestamp } from '@/types';
import { getLatitude, getLongitude } from '@/types';

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css';

// Constantes
const SANTIAGO_CENTER: [number, number] = [-33.4489, -70.6693];
const DEFAULT_ZOOM = 10;

interface RouteMapSelectorProps {
  firstCoordinate: CoordinateDto | null;
  lastCoordinate: CoordinateDto | null;
  onFirstCoordinateSelect: (coordinate: CoordinateDto | null) => void;
  onLastCoordinateSelect: (coordinate: CoordinateDto | null) => void;
  route?: RoutePoint[];
  tollGates?: TollGateTransactionData[];
  showControls?: boolean;
  externalActiveMode?: 'first' | 'last' | null;
  onActiveModeChange?: (mode: 'first' | 'last' | null) => void;
}

// Validar coordenadas
const isValidCoordinate = (coord: CoordinateDto | null): boolean => {
  if (!coord) return false;
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180 &&
    (coord.latitude !== 0 || coord.longitude !== 0)
  );
};

// Crear icono personalizado para marcadores
const createMarkerIcon = (color: string, label: string, isPulsing: boolean = false): L.DivIcon => {
  const pulseClass = isPulsing ? 'animate-pulse' : '';
  const iconHtml = `
    <div class="marker-container ${pulseClass}" style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 4px solid white;
      cursor: pointer;
      transition: transform 0.2s;
    ">
      <span style="
        color: white;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${label}</span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-route-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Componente para manejar los clics en el mapa
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
  isEnabled: boolean;
  activeMode: 'first' | 'last' | null;
}> = ({ onMapClick, isEnabled, activeMode }) => {
  const map = useMap();

  useEffect(() => {
    if (!isEnabled || !activeMode) {
      map.getContainer().style.cursor = '';
      return;
    }

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (isValidCoordinate({ latitude: lat, longitude: lng })) {
        onMapClick(lat, lng);
      }
    };

    map.on('click', handleClick);
    map.getContainer().style.cursor = 'crosshair';
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getContainer().style.cursor = '';
    };
  }, [map, onMapClick, isEnabled, activeMode]);

  return null;
};

// Componente para ajustar la vista del mapa
const MapBoundsAdjuster: React.FC<{ 
  firstCoordinate: CoordinateDto | null;
  lastCoordinate: CoordinateDto | null;
  route?: RoutePoint[];
  tollGates?: TollGateTransactionData[];
}> = ({ firstCoordinate, lastCoordinate, route, tollGates }) => {
  const map = useMap();

  useEffect(() => {
    const coordinates: [number, number][] = [];
    
    // Agregar coordenadas de inicio y fin
    if (isValidCoordinate(firstCoordinate)) {
      coordinates.push([firstCoordinate!.latitude, firstCoordinate!.longitude]);
    }
    
    if (isValidCoordinate(lastCoordinate)) {
      coordinates.push([lastCoordinate!.latitude, lastCoordinate!.longitude]);
    }

    // Agregar puntos de la ruta si existe
    if (route && route.length > 0) {
      route.forEach(point => {
        if (point.lat && point.lng) {
          coordinates.push([point.lat, point.lng]);
        }
      });
    }

    // Agregar pórticos si existen
    if (tollGates && tollGates.length > 0) {
      tollGates.forEach(tollGate => {
        const lat = getLatitude(tollGate.point);
        const lng = getLongitude(tollGate.point);
        if (lat && lng) {
          coordinates.push([lat, lng]);
        }
      });
    }

    if (coordinates.length === 0) {
      map.setView(SANTIAGO_CENTER, DEFAULT_ZOOM);
    } else if (coordinates.length === 1) {
      map.setView(coordinates[0], 13);
    } else {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [firstCoordinate, lastCoordinate, route, tollGates, map]);

  return null;
};

const RouteMapSelector: React.FC<RouteMapSelectorProps> = ({
  firstCoordinate,
  lastCoordinate,
  onFirstCoordinateSelect,
  onLastCoordinateSelect,
  route,
  tollGates,
  showControls = true,
  externalActiveMode,
  onActiveModeChange,
}) => {
  const [internalActiveMode, setInternalActiveMode] = useState<'first' | 'last' | null>(null);
  const activeMode: 'first' | 'last' | null = showControls ? internalActiveMode : (externalActiveMode ?? null);
  const setActiveMode = useCallback((mode: 'first' | 'last' | null) => {
    if (showControls) setInternalActiveMode(mode);
    else onActiveModeChange?.(mode);
  }, [showControls, onActiveModeChange]);
  const [editingMode, setEditingMode] = useState<'first' | 'last' | null>(null);
  const [manualInput, setManualInput] = useState({ lat: '', lng: '' });

  // Determinar qué coordenada falta
  const needsFirst = !isValidCoordinate(firstCoordinate);
  const needsLast = !isValidCoordinate(lastCoordinate);
  const hasBoth = isValidCoordinate(firstCoordinate) && isValidCoordinate(lastCoordinate);

  // Calcular el centro del mapa
  const center = useMemo(() => {
    if (isValidCoordinate(firstCoordinate) && isValidCoordinate(lastCoordinate)) {
      return {
        lat: (firstCoordinate!.latitude + lastCoordinate!.latitude) / 2,
        lng: (firstCoordinate!.longitude + lastCoordinate!.longitude) / 2
      };
    }
    if (isValidCoordinate(firstCoordinate)) {
      return { lat: firstCoordinate!.latitude, lng: firstCoordinate!.longitude };
    }
    if (isValidCoordinate(lastCoordinate)) {
      return { lat: lastCoordinate!.latitude, lng: lastCoordinate!.longitude };
    }
    return { lat: SANTIAGO_CENTER[0], lng: SANTIAGO_CENTER[1] };
  }, [firstCoordinate, lastCoordinate]);

  // Manejar clic en el mapa
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (activeMode === 'first') {
      onFirstCoordinateSelect({ latitude: lat, longitude: lng });
      setActiveMode(showControls && needsLast ? 'last' : null);
    } else if (activeMode === 'last') {
      onLastCoordinateSelect({ latitude: lat, longitude: lng });
      setActiveMode(null);
    }
  }, [activeMode, needsLast, onFirstCoordinateSelect, onLastCoordinateSelect, setActiveMode, showControls]);

  // Activar modo de selección
  const activateSelection = useCallback((mode: 'first' | 'last') => {
    setActiveMode(mode);
    setEditingMode(null);
  }, []);

  // Activar modo de edición manual
  const activateManualEdit = useCallback((mode: 'first' | 'last') => {
    setEditingMode(mode);
    setActiveMode(null);
    const coord = mode === 'first' ? firstCoordinate : lastCoordinate;
    if (coord) {
      setManualInput({ lat: coord.latitude.toString(), lng: coord.longitude.toString() });
    } else {
      setManualInput({ lat: '', lng: '' });
    }
  }, [firstCoordinate, lastCoordinate]);

  // Guardar entrada manual
  const saveManualInput = useCallback(() => {
    if (!editingMode) return;
    
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (isValidCoordinate({ latitude: lat, longitude: lng })) {
      if (editingMode === 'first') {
        onFirstCoordinateSelect({ latitude: lat, longitude: lng });
      } else {
        onLastCoordinateSelect({ latitude: lat, longitude: lng });
      }
      setEditingMode(null);
      setManualInput({ lat: '', lng: '' });
    }
  }, [editingMode, manualInput, onFirstCoordinateSelect, onLastCoordinateSelect]);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback((mode: 'first' | 'last') => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coord = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        if (mode === 'first') {
          onFirstCoordinateSelect(coord);
        } else {
          onLastCoordinateSelect(coord);
        }
        setActiveMode(null);
      },
      (error) => {
        alert(`Error al obtener ubicación: ${error.message}`);
      }
    );
  }, [onFirstCoordinateSelect, onLastCoordinateSelect]);

  // Limpiar coordenada
  const clearCoordinate = useCallback((mode: 'first' | 'last') => {
    if (mode === 'first') {
      onFirstCoordinateSelect(null);
    } else {
      onLastCoordinateSelect(null);
    }
    setActiveMode(null);
    setEditingMode(null);
  }, [onFirstCoordinateSelect, onLastCoordinateSelect]);

  // Crear iconos
  const startIcon = useMemo(() => createMarkerIcon('#10b981', 'S', activeMode === 'first'), [activeMode]);
  const endIcon = useMemo(() => createMarkerIcon('#f43f5e', 'F', activeMode === 'last'), [activeMode]);

  // Crear línea de la ruta completa o entre las dos coordenadas
  const polylinePositions: [number, number][] = useMemo(() => {
    // Si hay ruta completa, usarla
    if (route && route.length > 0) {
      return route.map(point => [point.lat, point.lng] as [number, number]);
    }
    // Si no, mostrar línea directa entre inicio y fin
    if (isValidCoordinate(firstCoordinate) && isValidCoordinate(lastCoordinate)) {
      return [
        [firstCoordinate!.latitude, firstCoordinate!.longitude],
        [lastCoordinate!.latitude, lastCoordinate!.longitude]
      ];
    }
    return [];
  }, [firstCoordinate, lastCoordinate, route]);

  // Crear icono para pórticos
  const tollGateIcon = useMemo(() => createMarkerIcon('#f59e0b', 'P', false), []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsAdjuster 
          firstCoordinate={firstCoordinate}
          lastCoordinate={lastCoordinate}
          route={route}
          tollGates={tollGates}
        />

        <MapClickHandler 
          onMapClick={handleMapClick}
          isEnabled={!!activeMode}
          activeMode={activeMode}
        />

        {/* Línea de la ruta completa */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            color={route && route.length > 0 ? "#10b981" : "#3b82f6"}
            weight={route && route.length > 0 ? 4 : 5}
            opacity={0.8}
            dashArray={route && route.length > 0 ? undefined : "20, 10"}
          />
        )}

        {/* Marcadores de pórticos */}
        {tollGates && tollGates.map((tollGate, index) => {
          const lat = getLatitude(tollGate.point);
          const lng = getLongitude(tollGate.point);
          if (!lat || !lng) return null;

          return (
            <Marker
              key={`tollgate-${tollGate.tollGate.id}-${index}`}
              position={[lat, lng]}
              icon={tollGateIcon}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faRoad} className="text-amber-600 mr-2" />
                    <h3 className="font-bold text-gray-900 text-sm">{tollGate.tollGate.name}</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    {tollGate.tollGate.portico && (
                      <p className="text-gray-600">
                        <span className="font-medium">Pórtico:</span> {tollGate.tollGate.portico}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Coordenadas:</span>{' '}
                      <span className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-700">Pago:</span>
                      <span className="font-bold text-green-600 text-base">
                        ${tollGate.paymentAmount.toLocaleString('es-CL')}
                      </span>
                    </div>
                    {tollGate.vehicleCategory && (
                      <p className="text-gray-600">
                        <span className="font-medium">Categoría:</span> {tollGate.vehicleCategory}
                      </p>
                    )}
                    {tollGate.isFreePass && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        Pase Libre
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Marcador de inicio */}
        {isValidCoordinate(firstCoordinate) && (
          <Marker
            position={[firstCoordinate!.latitude, firstCoordinate!.longitude]}
            icon={startIcon}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="font-bold text-green-700 text-sm">Punto de Inicio</h3>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Lat:</span>{' '}
                    <span className="font-mono">{firstCoordinate!.latitude.toFixed(6)}</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Lng:</span>{' '}
                    <span className="font-mono">{firstCoordinate!.longitude.toFixed(6)}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCoordinate('first');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de fin */}
        {isValidCoordinate(lastCoordinate) && (
          <Marker
            position={[lastCoordinate!.latitude, lastCoordinate!.longitude]}
            icon={endIcon}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="font-bold text-red-700 text-sm">Punto de Fin</h3>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Lat:</span>{' '}
                    <span className="font-mono">{lastCoordinate!.latitude.toFixed(6)}</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Lng:</span>{' '}
                    <span className="font-mono">{lastCoordinate!.longitude.toFixed(6)}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCoordinate('last');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {showControls && (
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl p-5 max-w-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
          Seleccionar Puntos
        </h3>

        {/* Punto de Inicio */}
        <div className={`mb-4 p-4 rounded-lg border-2 transition-all ${
          activeMode === 'first' 
            ? 'border-green-500 bg-green-50 shadow-md' 
            : editingMode === 'first'
            ? 'border-blue-300 bg-blue-50'
            : isValidCoordinate(firstCoordinate)
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-sm text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              1. Punto de Inicio
            </label>
            {isValidCoordinate(firstCoordinate) && (
              <span className="text-green-600 text-xs font-medium">✓ Seleccionado</span>
            )}
          </div>

          {editingMode === 'first' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitud"
                  value={manualInput.lat}
                  onChange={(e) => setManualInput({ ...manualInput, lat: e.target.value })}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitud"
                  value={manualInput.lng}
                  onChange={(e) => setManualInput({ ...manualInput, lng: e.target.value })}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveManualInput}
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingMode(null);
                    setManualInput({ lat: '', lng: '' });
                  }}
                  className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {isValidCoordinate(firstCoordinate) ? (
                <p className="text-xs font-mono text-gray-700 bg-white p-2 rounded border">
                  {firstCoordinate!.latitude.toFixed(6)}, {firstCoordinate!.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-gray-500 italic">No seleccionado</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => activateSelection('first')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-center ${
                    activeMode === 'first'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {activeMode === 'first' ? 'Clic en mapa...' : 'Mapa'}
                </button>
                <button
                  onClick={() => activateManualEdit('first')}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  title="Ingresar manualmente"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => getCurrentLocation('first')}
                  className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                  title="Usar mi ubicación"
                >
                  <FontAwesomeIcon icon={faCrosshairs} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Punto de Fin */}
        <div className={`mb-4 p-4 rounded-lg border-2 transition-all ${
          activeMode === 'last' 
            ? 'border-red-500 bg-red-50 shadow-md' 
            : editingMode === 'last'
            ? 'border-blue-300 bg-blue-50'
            : isValidCoordinate(lastCoordinate)
            ? 'border-red-200 bg-red-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-sm text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              2. Punto de Fin
            </label>
            {isValidCoordinate(lastCoordinate) && (
              <span className="text-red-600 text-xs font-medium">✓ Seleccionado</span>
            )}
          </div>

          {editingMode === 'last' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitud"
                  value={manualInput.lat}
                  onChange={(e) => setManualInput({ ...manualInput, lat: e.target.value })}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitud"
                  value={manualInput.lng}
                  onChange={(e) => setManualInput({ ...manualInput, lng: e.target.value })}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveManualInput}
                  className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingMode(null);
                    setManualInput({ lat: '', lng: '' });
                  }}
                  className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {isValidCoordinate(lastCoordinate) ? (
                <p className="text-xs font-mono text-gray-700 bg-white p-2 rounded border">
                  {lastCoordinate!.latitude.toFixed(6)}, {lastCoordinate!.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-gray-500 italic">No seleccionado</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => activateSelection('last')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-center ${
                    activeMode === 'last'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {activeMode === 'last' ? 'Clic en mapa...' : 'Mapa'}
                </button>
                <button
                  onClick={() => activateManualEdit('last')}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  title="Ingresar manualmente"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => getCurrentLocation('last')}
                  className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                  title="Usar mi ubicación"
                >
                  <FontAwesomeIcon icon={faCrosshairs} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón limpiar todo */}
        {hasBoth && (
          <button
            onClick={() => {
              clearCoordinate('first');
              clearCoordinate('last');
            }}
            className="w-full px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Limpiar Todo
          </button>
        )}

        {/* Indicador de estado */}
        {activeMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 animate-pulse" />
              {activeMode === 'first'
                ? 'Haz clic en el mapa para seleccionar el punto de inicio'
                : 'Haz clic en el mapa para seleccionar el punto de fin'}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default RouteMapSelector;
