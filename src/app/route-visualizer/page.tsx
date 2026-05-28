'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRoute,
  faClock,
  faRoad,
  faSpinner,
  faExclamationTriangle,
  faTimes,
  faMapMarkedAlt,
  faSatelliteDish,
  faHandPointer,
} from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import type { CoordinateDto, RoutePoint } from '@/types';
import { osrmService } from '@/services/osrm';

const RouteMapSelector = dynamic(() => import('@/components/RouteMapSelector'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="spinner h-8 w-8 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  ),
});

type Mode = 'manual' | 'osrm';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${Math.round(seconds)}s`;
};

const formatDistance = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

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

export default function RouteVisualizerPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('osrm');
  const [firstCoordinate, setFirstCoordinate] = useState<CoordinateDto | null>(null);
  const [lastCoordinate, setLastCoordinate] = useState<CoordinateDto | null>(null);
  const [route, setRoute] = useState<RoutePoint[] | undefined>();
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBothCoords = useMemo(
    () => isValidCoordinate(firstCoordinate) && isValidCoordinate(lastCoordinate),
    [firstCoordinate, lastCoordinate]
  );

  const resetResult = useCallback(() => {
    setRoute(undefined);
    setDistance(null);
    setDuration(null);
    setError(null);
  }, []);

  const handleFirstCoordinateSelect = useCallback(
    (coord: CoordinateDto | null) => {
      setFirstCoordinate(coord);
      resetResult();
    },
    [resetResult]
  );

  const handleLastCoordinateSelect = useCallback(
    (coord: CoordinateDto | null) => {
      setLastCoordinate(coord);
      resetResult();
    },
    [resetResult]
  );

  const handleModeChange = useCallback(
    (next: Mode) => {
      setMode(next);
      resetResult();
    },
    [resetResult]
  );

  const handleOsrmRoute = useCallback(async () => {
    if (!firstCoordinate || !lastCoordinate) return;
    setLoading(true);
    setError(null);
    try {
      const result = await osrmService.getRoute(firstCoordinate, lastCoordinate);
      setRoute(result.route);
      setDistance(result.distance);
      setDuration(result.duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener la ruta OSRM');
    } finally {
      setLoading(false);
    }
  }, [firstCoordinate, lastCoordinate]);

  const manualRoute: RoutePoint[] | undefined = useMemo(() => {
    if (mode !== 'manual') return undefined;
    if (!isValidCoordinate(firstCoordinate) || !isValidCoordinate(lastCoordinate)) return undefined;
    return [
      { lat: firstCoordinate!.latitude, lng: firstCoordinate!.longitude },
      { lat: lastCoordinate!.latitude, lng: lastCoordinate!.longitude },
    ];
  }, [mode, firstCoordinate, lastCoordinate]);

  const displayRoute = mode === 'osrm' ? route : manualRoute;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <FontAwesomeIcon icon={faRoute} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visualizador de Rutas</h1>
                <p className="text-sm text-gray-500">Ruta manual o calculada por OSRM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleModeChange('osrm')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'osrm'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faSatelliteDish} />
            Ruta OSRM
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faHandPointer} />
            Línea Directa
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden shadow-xl border-2 border-gray-200">
              <div
                className={`card-header text-white ${
                  mode === 'osrm'
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              >
                <h2 className="text-xl font-semibold flex items-center">
                  <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                  {mode === 'osrm' ? 'Ruta calculada por OSRM' : 'Línea directa entre puntos'}
                </h2>
              </div>
              <div className="card-body p-0">
                <div style={{ height: '600px', width: '100%' }}>
                  <RouteMapSelector
                    firstCoordinate={firstCoordinate}
                    lastCoordinate={lastCoordinate}
                    onFirstCoordinateSelect={handleFirstCoordinateSelect}
                    onLastCoordinateSelect={handleLastCoordinateSelect}
                    route={displayRoute}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Mode description */}
            <div
              className={`card shadow border-2 ${
                mode === 'osrm' ? 'border-teal-200 bg-teal-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="card-body py-4">
                {mode === 'osrm' ? (
                  <p className="text-sm text-teal-800">
                    <strong>Modo OSRM:</strong> calcula la ruta real por calles usando el motor de
                    enrutamiento OSRM. Seleccioná inicio y fin, luego presioná <em>Calcular</em>.
                  </p>
                ) : (
                  <p className="text-sm text-blue-800">
                    <strong>Línea directa:</strong> dibuja una línea recta entre los dos puntos
                    seleccionados, sin seguir calles.
                  </p>
                )}
              </div>
            </div>

            {/* OSRM action button */}
            {mode === 'osrm' && (
              <button
                onClick={handleOsrmRoute}
                disabled={!hasBothCoords || loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasBothCoords && !loading
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSatelliteDish} />
                    Calcular ruta OSRM
                  </>
                )}
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="card border-2 border-red-300 bg-red-50 shadow">
                <div className="card-body py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OSRM result stats */}
            {mode === 'osrm' && route && distance !== null && duration !== null && (
              <div className="card shadow border-2 border-teal-200">
                <div className="card-header bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faRoute} />
                    Resultado OSRM
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center mb-1 gap-2">
                        <FontAwesomeIcon icon={faRoad} className="text-teal-600 text-xs" />
                        <span className="text-xs font-medium text-gray-700">Distancia</span>
                      </div>
                      <p className="text-xl font-bold text-teal-900">{formatDistance(distance)}</p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <div className="flex items-center mb-1 gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-cyan-600 text-xs" />
                        <span className="text-xs font-medium text-gray-700">Duración</span>
                      </div>
                      <p className="text-xl font-bold text-cyan-900">{formatTime(duration)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {route.length} puntos en la ruta
                  </p>
                </div>
              </div>
            )}

            {/* Manual result info */}
            {mode === 'manual' && hasBothCoords && (
              <div className="card shadow border-2 border-blue-200">
                <div className="card-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faRoute} />
                    Línea directa
                  </h3>
                </div>
                <div className="card-body">
                  <p className="text-sm text-gray-600">
                    Ruta dibujada entre los dos puntos seleccionados. Para calcular la ruta real por
                    calles, cambiá al modo <strong>OSRM</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!hasBothCoords && !error && (
              <div className="card shadow">
                <div className="card-body text-center py-8">
                  <FontAwesomeIcon icon={faMapMarkedAlt} className="text-4xl text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    Seleccioná los dos puntos en el mapa para comenzar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
