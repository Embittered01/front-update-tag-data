'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClock, faCalendarDay, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import type { PaymentCategory, DayType, TimeWindowFormData, TimeWindow } from '@/types';

export interface TimeWindowModalProps {
  isOpen: boolean;
  editingTimeWindow: TimeWindow | null;
  newTimeWindow: TimeWindowFormData;
  paymentCategories: PaymentCategory[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof TimeWindowFormData, value: string | DayType[]) => void;
  onValidate?: () => boolean;
}

const DAY_LABELS: Record<DayType, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes', 
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
  ALL_DAYS: 'Todos los días'
};

const DAY_COLORS: Record<DayType, string> = {
  MONDAY: 'bg-blue-500',
  TUESDAY: 'bg-green-500',
  WEDNESDAY: 'bg-yellow-500',
  THURSDAY: 'bg-purple-500',
  FRIDAY: 'bg-pink-500',
  SATURDAY: 'bg-indigo-500',
  SUNDAY: 'bg-red-500',
  ALL_DAYS: 'bg-gray-800'
};

export const TimeWindowModal: React.FC<TimeWindowModalProps> = ({
  isOpen,
  editingTimeWindow,
  newTimeWindow,
  paymentCategories,
  loading,
  onClose,
  onSubmit,
  onChange,
  onValidate
}) => {
  if (!isOpen) return null;

  const validateTime = (from: string, to: string): { isValid: boolean; warning?: string } => {
    if (!from || !to) return { isValid: false };

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(from) || !timeRegex.test(to)) {
      return { isValid: false };
    }

    const [fromHour, fromMin] = from.split(':').map(Number);
    const [toHour, toMin] = to.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;

    if (fromMinutes >= toMinutes) {
      return {
        isValid: true,
        warning: `⚠️ Esta ventana cruza medianoche (${from} - ${to}). Ejemplo: 22:00 - 06:00 del día siguiente.`
      };
    }

    return { isValid: true };
  };

  const handleDayToggle = (day: DayType) => {
    const currentDays = newTimeWindow.dayTypes || [];
    
    if (day === 'ALL_DAYS') {
      // Si se selecciona "Todos los días"
      if (currentDays.includes('ALL_DAYS')) {
        // Deseleccionar todos
        onChange('dayTypes', []);
      } else {
        // Seleccionar "Todos los días" y limpiar otros
        onChange('dayTypes', ['ALL_DAYS']);
      }
    } else {
      // Si se selecciona un día específico
      let newDays = currentDays.filter(d => d !== 'ALL_DAYS'); // Quitar "Todos los días" si está
      
      if (newDays.includes(day)) {
        // Deseleccionar el día
        newDays = newDays.filter(d => d !== day);
      } else {
        // Seleccionar el día
        newDays.push(day);
      }
      
      onChange('dayTypes', newDays);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!newTimeWindow.from || !newTimeWindow.to || !newTimeWindow.paymentCategoryId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!newTimeWindow.dayTypes || newTimeWindow.dayTypes.length === 0) {
      alert('Por favor seleccione al menos un día');
      return;
    }

    const timeValidation = validateTime(newTimeWindow.from, newTimeWindow.to);
    if (!timeValidation.isValid) {
      alert('Por favor ingrese horarios válidos en formato HH:MM (24 horas)');
      return;
    }

    // Si cruza medianoche, pedir confirmación
    if (timeValidation.warning) {
      const confirmed = window.confirm(`${timeValidation.warning}\n\n¿Desea continuar?`);
      if (!confirmed) return;
    }

    // Validación adicional si existe
    if (onValidate && !onValidate()) {
      return;
    }

    onSubmit(e);
  };

  const timeValidation = validateTime(newTimeWindow.from, newTimeWindow.to);
  const selectedDays = newTimeWindow.dayTypes || [];
  const hasAllDays = selectedDays.includes('ALL_DAYS');

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-600" />
            {editingTimeWindow ? 'Editar Ventana de Tiempo' : 'Nueva Ventana de Tiempo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Información de edición */}
        {editingTimeWindow && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              <span className="font-medium">
                Editando: {editingTimeWindow.paymentCategory?.name} - {DAY_LABELS[editingTimeWindow.dayType]}
              </span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Si selecciona múltiples días, se crearán ventanas adicionales
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Categoría de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={newTimeWindow.paymentCategoryId}
                onChange={(e) => onChange('paymentCategoryId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              >
                <option value="">Seleccione una categoría</option>
                {paymentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newTimeWindow.from}
                  onChange={(e) => onChange('from', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newTimeWindow.to}
                  onChange={(e) => onChange('to', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Advertencia de horario overnight */}
            {timeValidation.warning && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-yellow-800 text-sm">{timeValidation.warning}</p>
                </div>
              </div>
            )}

            {/* Selección de Días */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                Días <span className="text-red-500">*</span>
                {selectedDays.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {hasAllDays ? '7 días' : `${selectedDays.length} día${selectedDays.length > 1 ? 's' : ''}`}
                  </span>
                )}
              </label>

              <div className="space-y-3">
                {/* Opción "Todos los días" */}
                <button
                  type="button"
                  onClick={() => handleDayToggle('ALL_DAYS')}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                    hasAllDays
                      ? 'border-gray-800 bg-gray-800 text-white shadow-sm'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                      Todos los días
                    </span>
                    {hasAllDays && <span className="text-sm">✓ Seleccionado</span>}
                  </div>
                </button>

                {/* Días específicos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as DayType[]).map(day => {
                    const isSelected = selectedDays.includes(day);
                    const isDisabled = hasAllDays || loading;
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        disabled={isDisabled}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? `${DAY_COLORS[day]} text-white shadow-sm`
                            : isDisabled
                            ? 'border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {DAY_LABELS[day]}
                      </button>
                    );
                  })}
                </div>

                {hasAllDays && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    Al seleccionar &quot;Todos los días&quot;, se aplicará de Lunes a Domingo
                  </div>
                )}
              </div>
            </div>

            {/* Resumen */}
            {newTimeWindow.from && newTimeWindow.to && newTimeWindow.paymentCategoryId && selectedDays.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  <div className="font-medium mb-2">Resumen de la ventana de tiempo:</div>
                  <div className="space-y-1">
                    <div>⏰ <strong>Horario:</strong> {newTimeWindow.from} - {newTimeWindow.to}</div>
                    <div>📋 <strong>Categoría:</strong> {paymentCategories.find(pc => pc.id.toString() === newTimeWindow.paymentCategoryId)?.name}</div>
                    <div>📅 <strong>Días:</strong> {hasAllDays ? 'Todos los días' : selectedDays.map(d => DAY_LABELS[d]).join(', ')}</div>
                    <div>🔢 <strong>Ventanas a crear:</strong> {editingTimeWindow ? `Actualizar + ${selectedDays.length - 1} adicionales` : selectedDays.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !newTimeWindow.from || !newTimeWindow.to || !newTimeWindow.paymentCategoryId || selectedDays.length === 0}
            >
              {loading && (
                <div className="spinner h-4 w-4 mr-2" />
              )}
              {editingTimeWindow ? 'Actualizar Ventana' : 'Crear Ventana'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeWindowModal;
