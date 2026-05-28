'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRoute,
  faClock,
  faDollarSign,
  faRoad,
  faExclamationTriangle,
  faSpinner,
  faTimes,
  faCalculator,
  faPen,
  faCheck,
  faMapMarkerAlt,
  faCrosshairs,
} from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import { useApp } from '@/contexts/AppContext';
import type {
  CoordinateDto,
  CalculatePaymentToCraneDto,
  PaymentByCraneRouteResponse,
  TollGateTransactionData,
} from '@/types';
import { getLatitude, getLongitude } from '@/types';

const RouteMapSelector = dynamic(
  () => import('@/components/RouteMapSelector'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const formatDistance = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(0)} m`;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

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

const PaymentByCraneRoutePage: React.FC = () => {
  const router = useRouter();
  const { apiService, authState } = useApp();

  const [firstCoordinate, setFirstCoordinate] = useState<CoordinateDto | null>(null);
  const [lastCoordinate, setLastCoordinate] = useState<CoordinateDto | null>(null);
  const [activeMode, setActiveMode] = useState<'first' | 'last' | null>(null);
  const [editingPoint, setEditingPoint] = useState<'first' | 'last' | null>(null);
  const [manualInput, setManualInput] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentByCraneRouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push('/');
    }
  }, [authState.isAuthenticated, router]);

  const handleFirstCoordinateSelect = useCallback((coordinate: CoordinateDto | null) => {
    setFirstCoordinate(coordinate);
    setResult(null);
    setError(null);
    if (coordinate && !isValidCoordinate(lastCoordinate)) {
      setActiveMode('last');
    } else {
      setActiveMode(null);
    }
  }, [lastCoordinate]);

  const handleLastCoordinateSelect = useCallback((coordinate: CoordinateDto | null) => {
    setLastCoordinate(coordinate);
    setResult(null);
    setError(null);
    setActiveMode(null);
  }, []);

  const handleActiveModeChange = useCallback((mode: 'first' | 'last' | null) => {
    setActiveMode(mode);
  }, []);

  const openManualEdit = useCallback((point: 'first' | 'last') => {
    const coord = point === 'first' ? firstCoordinate : lastCoordinate;
    setEditingPoint(point);
    setManualInput({
      lat: coord ? coord.latitude.toString() : '',
      lng: coord ? coord.longitude.toString() : '',
    });
    setActiveMode(null);
  }, [firstCoordinate, lastCoordinate]);

  const cancelManualEdit = useCallback(() => {
    setEditingPoint(null);
    setManualInput({ lat: '', lng: '' });
  }, []);

  const saveManualEdit = useCallback(() => {
    if (!editingPoint) return;
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    const coord = { latitude: lat, longitude: lng };
    if (!isValidCoordinate(coord)) return;
    if (editingPoint === 'first') {
      handleFirstCoordinateSelect(coord);
    } else {
      handleLastCoordinateSelect(coord);
    }
    setEditingPoint(null);
    setManualInput({ lat: '', lng: '' });
  }, [editingPoint, manualInput, handleFirstCoordinateSelect, handleLastCoordinateSelect]);

  const getCurrentLocation = useCallback((point: 'first' | 'last') => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coord = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (point === 'first') handleFirstCoordinateSelect(coord);
        else handleLastCoordinateSelect(coord);
      },
      () => {}
    );
  }, [handleFirstCoordinateSelect, handleLastCoordinateSelect]);

  const handleCalculate = useCallback(async () => {
    if (!isValidCoordinate(firstCoordinate) || !isValidCoordinate(lastCoordinate)) {
      setError('Selecciona ambas coordenadas antes de calcular');
      return;
    }
    if (!apiService) {
      setError('Servicio no disponible');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const requestData: CalculatePaymentToCraneDto = {
        firstCoordinate: firstCoordinate!,
        lastCoordinate: lastCoordinate!,
      };
      const response = await apiService.paymentByCraneRoute.calculatePaymentByCraneRoute(requestData);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al calcular el pago');
    } finally {
      setLoading(false);
    }
  }, [firstCoordinate, lastCoordinate, apiService]);

  const canCalculate = useMemo(
    () => isValidCoordinate(firstCoordinate) && isValidCoordinate(lastCoordinate) && !loading,
    [firstCoordinate, lastCoordinate, loading]
  );

  const CoordPointSection = ({
    point,
    label,
    coordinate,
    dotColor,
  }: {
    point: 'first' | 'last';
    label: string;
    coordinate: CoordinateDto | null;
    dotColor: string;
  }) => {
    const isEditing = editingPoint === point;
    const isActiveModeThis = activeMode === point;

    return (
      <div className="px-5 py-4 border-b border-slate-100 last:border-b-0">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-[family-name:var(--font-display)]">
            {label}
          </span>
        </div>

        {isValidCoordinate(coordinate) ? (
          <p className="text-sm font-mono text-slate-800 mb-3 tabular-nums">
            {coordinate!.latitude.toFixed(6)}, {coordinate!.longitude.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-slate-400 mb-3 italic">Sin coordenada</p>
        )}

        {isEditing && (
          <div className="mb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitud"
                value={manualInput.lat}
                onChange={(e) => setManualInput((m) => ({ ...m, lat: e.target.value }))}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitud"
                value={manualInput.lng}
                onChange={(e) => setManualInput((m) => ({ ...m, lng: e.target.value }))}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveManualEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                Guardar
              </button>
              <button
                onClick={cancelManualEdit}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setActiveMode(isActiveModeThis ? null : point)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              isActiveModeThis
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
            {isActiveModeThis ? 'Clic en mapa...' : 'Mapa'}
          </button>
          <button
            onClick={() => openManualEdit(point)}
            title="Ingresar manualmente"
            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md hover:bg-slate-200 transition-colors"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            onClick={() => getCurrentLocation(point)}
            title="Usar mi ubicacion"
            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md hover:bg-slate-200 transition-colors"
          >
            <FontAwesomeIcon icon={faCrosshairs} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-[family-name:var(--font-sans)]">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-5 h-14">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <FontAwesomeIcon icon={faRoute} className="text-blue-600" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              Calculo de Pago por Ruta
            </h1>
            <p className="text-xs text-slate-400">Selecciona inicio y fin de la ruta</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-display)]">
              Ruta
            </p>
          </div>

          <CoordPointSection
            point="first"
            label="Origen"
            coordinate={firstCoordinate}
            dotColor="bg-blue-600"
          />
          <CoordPointSection
            point="last"
            label="Destino"
            coordinate={lastCoordinate}
            dotColor="bg-slate-700"
          />

          <div className="px-5 py-4 border-t border-slate-100">
            <button
              onClick={handleCalculate}
              disabled={!canCalculate}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                canCalculate
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCalculator} />
                  Calcular Pago
                </>
              )}
            </button>
            {!canCalculate && !loading && (
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Selecciona ambos puntos para continuar
              </p>
            )}
          </div>

          {error && (
            <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-xs mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>
          )}

          {result && (
            <div className="flex flex-col">
              <div className="px-5 pt-4 pb-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-display)]">
                  Resultados
                </p>
              </div>

              <div className="mx-5 mb-4 rounded-lg bg-slate-900 text-white p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FontAwesomeIcon icon={faDollarSign} className="text-emerald-400 text-xs" />
                  <span className="text-xs font-medium text-slate-300 font-[family-name:var(--font-display)]">
                    Pago Total
                  </span>
                </div>
                <p className="text-3xl font-bold text-emerald-400 font-[family-name:var(--font-display)] tabular-nums">
                  {formatCurrency(result.totalPayment)}
                </p>
              </div>

              <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FontAwesomeIcon icon={faRoute} className="text-blue-600 text-[10px]" />
                    <span className="text-[10px] font-medium text-slate-500 font-[family-name:var(--font-display)]">
                      Distancia
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-800 tabular-nums">
                    {formatDistance(result.distance)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FontAwesomeIcon icon={faClock} className="text-blue-600 text-[10px]" />
                    <span className="text-[10px] font-medium text-slate-500 font-[family-name:var(--font-display)]">
                      Duracion
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-800 tabular-nums">
                    {formatTime(result.timeToTravel)}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faRoad} className="text-blue-600 text-xs" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-display)]">
                      Porticos
                    </span>
                  </div>
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                    {result.tollGatesWithValues.length}
                  </span>
                </div>

                {result.tollGatesWithValues.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No hay porticos en esta ruta
                  </p>
                ) : (
                  <div className="space-y-2 pb-4">
                    {result.tollGatesWithValues.map((tg: TollGateTransactionData, i: number) => (
                      <div
                        key={`${tg.tollGate.id}-${i}`}
                        className="flex items-start justify-between py-2.5 px-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {tg.tollGate.name}
                          </p>
                          {tg.tollGate.portico && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {tg.tollGate.portico}
                            </p>
                          )}
                          {tg.point && (() => {
                            const lat = getLatitude(tg.point);
                            const lng = getLongitude(tg.point);
                            if (!lat || !lng) return null;
                            return (
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {lat.toFixed(4)}, {lng.toFixed(4)}
                              </p>
                            );
                          })()}
                        </div>
                        <p className="text-sm font-bold text-emerald-600 ml-3 flex-shrink-0 tabular-nums">
                          {formatCurrency(tg.paymentAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 relative">
          <div className="absolute inset-0">
            <RouteMapSelector
              firstCoordinate={firstCoordinate}
              lastCoordinate={lastCoordinate}
              onFirstCoordinateSelect={handleFirstCoordinateSelect}
              onLastCoordinateSelect={handleLastCoordinateSelect}
              route={result?.route}
              tollGates={result?.tollGatesWithValues}
              showControls={false}
              externalActiveMode={activeMode}
              onActiveModeChange={handleActiveModeChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentByCraneRoutePage;
