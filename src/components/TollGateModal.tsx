'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import type { TollGate, Concessionaire, DirectionTollGate, NewTollGateForm } from '@/types';

export interface TollGateModalProps {
  isOpen: boolean;
  editingTollGate: TollGate | null;
  newTollGate: NewTollGateForm;
  concessionaires: Concessionaire[];
  directionTollGates: DirectionTollGate[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof NewTollGateForm, value: string | number | null) => void;
}

export const TollGateModal: React.FC<TollGateModalProps> = ({
  isOpen,
  editingTollGate,
  newTollGate,
  concessionaires,
  directionTollGates,
  loading,
  onClose,
  onSubmit,
  onChange
}) => {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof NewTollGateForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    
    // Manejar conversiones específicas
    if (field === 'directionId') {
      onChange(field, value ? parseInt(value) : null);
    } else if (field === 'concessionaireId') {
      onChange(field, value ? parseInt(value) : '');
    } else {
      onChange(field, value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {editingTollGate ? 'Editar Pórtico' : 'Nuevo Pórtico'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {editingTollGate && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <span className="font-medium">Editando: {editingTollGate.name}</span>
              {editingTollGate.portico && (
                <span className="ml-2 text-blue-600">• Pórtico {editingTollGate.portico}</span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTollGate.name}
                  onChange={handleInputChange('name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nombre del pórtico"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pórtico
                </label>
                <input
                  type="text"
                  value={newTollGate.portico || ''}
                  onChange={handleInputChange('portico')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Número de pórtico"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Concesionaria y Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concesionaria <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTollGate.concessionaireId}
                  onChange={handleInputChange('concessionaireId')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccione una concesionaria</option>
                  {concessionaires.map(concessionaire => (
                    <option key={concessionaire.id} value={concessionaire.id}>
                      {concessionaire.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <select
                  value={newTollGate.directionId || ''}
                  onChange={handleInputChange('directionId')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                >
                  <option value="">Seleccione una dirección</option>
                  {directionTollGates.map(direction => (
                    <option key={direction.id} value={direction.id}>
                      {direction.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordenadas GPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newTollGate.latitude}
                  onChange={handleInputChange('latitude')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: -33.4489"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Coordenada de latitud GPS</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newTollGate.longitude}
                  onChange={handleInputChange('longitude')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: -70.6693"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Coordenada de longitud GPS</p>
              </div>
            </div>

            {/* Tipo de Pórtico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pórtico
              </label>
              <select
                value={newTollGate.isEntryorExit}
                onChange={handleInputChange('isEntryorExit')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              >
                <option value="">Seleccione un tipo</option>
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Salida</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Especifica si es punto de entrada o salida</p>
            </div>

            {/* Información de campos obligatorios */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-red-500 text-sm mr-2">*</span>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Campos obligatorios</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Nombre:</strong> Identificación única del pórtico</li>
                    <li>• <strong>Concesionaria:</strong> Empresa responsable del pórtico</li>
                    <li>• <strong>Coordenadas GPS:</strong> Ubicación exacta del pórtico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
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
              disabled={loading}
            >
              {loading && (
                <div className="spinner h-4 w-4 mr-2" />
              )}
              {editingTollGate ? 'Actualizar Pórtico' : 'Crear Pórtico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TollGateModal;
