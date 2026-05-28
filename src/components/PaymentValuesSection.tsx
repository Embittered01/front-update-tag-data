'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faDollarSign, faTag, faCar, faExclamationTriangle, faInfoCircle, faSave } from '@fortawesome/free-solid-svg-icons';
import type { PaymentCategory, VehicleCategory, PaymentValue, PaymentValueForm, TollGate, EntryToExitTollGate } from '@/types';

export interface PaymentValuesSectionProps {
  selectedTollGate: TollGate | null;
  paymentValues: PaymentValueForm[];
  paymentCategories: PaymentCategory[];
  vehicleCategories: VehicleCategory[];
  existingPaymentValues?: PaymentValue[];
  onAddPaymentValue: () => void;
  onUpdatePaymentValue: (index: number, field: keyof PaymentValueForm, value: string | number[]) => void;
  onRemovePaymentValue: (index: number) => void;
  onVehicleCategoryChange: (paymentIndex: number, vehicleCategoryId: number, checked: boolean) => void;
  getDuplicateWarning: (paymentCategoryId: string, vehicleCategoryIds: number[], currentIndex: number) => { type: string; message: string } | null;
  entryToExitRelation?: EntryToExitTollGate | null;
  onSavePaymentValues?: () => Promise<void>;
  savingPaymentValues?: boolean;
}

export const PaymentValuesSection: React.FC<PaymentValuesSectionProps> = ({
  selectedTollGate,
  paymentValues,
  paymentCategories,
  vehicleCategories,
  existingPaymentValues = [],
  onAddPaymentValue,
  onUpdatePaymentValue,
  onRemovePaymentValue,
  onVehicleCategoryChange,
  getDuplicateWarning,
  entryToExitRelation,
  onSavePaymentValues,
  savingPaymentValues = false
}) => {
  if (!selectedTollGate) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        <FontAwesomeIcon icon={faDollarSign} className="text-4xl mb-4" />
        <p>Selecciona un pórtico para configurar valores de pago</p>
      </div>
    );
  }

  // Determinar si estamos en modo entry-to-exit
  const isEntryToExitMode = !!entryToExitRelation;
  
  // Debug: Log para diagnóstico
  console.log('🔍 [PaymentValues Debug] isEntryToExitMode:', isEntryToExitMode);
  console.log('🔍 [PaymentValues Debug] entryToExitRelation:', entryToExitRelation);
  console.log('🔍 [PaymentValues Debug] existingPaymentValues:', existingPaymentValues);
  console.log('🔍 [PaymentValues Debug] existingPaymentValues.length:', existingPaymentValues?.length || 0);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '$0' : `$${numValue.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-500" />
          Valores de Pago
          {paymentValues.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {paymentValues.length}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={onAddPaymentValue}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Agregar Valor
        </button>
      </div>

      {/* Lista de valores de pago existentes del pórtico */}
      {existingPaymentValues.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-500" />
            {isEntryToExitMode ? 
              `Valores Configurados en la Relación (${existingPaymentValues.length})` : 
              `Valores Configurados en el Pórtico (${existingPaymentValues.length})`
            }
          </h4>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {existingPaymentValues.map((pv, index) => (
              <div key={`existing-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-blue-700 flex items-center">
                      <FontAwesomeIcon icon={faTag} className="mr-1" />
                      Categoría:
                    </span>
                    <p className="text-blue-900 font-semibold">{pv.paymentCategory?.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-blue-700 flex items-center">
                      <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                      Valor:
                    </span>
                    <p className="text-blue-900 font-bold text-lg">{formatCurrency(pv.value)}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-blue-700 flex items-center">
                      <FontAwesomeIcon icon={faCar} className="mr-1" />
                      Vehículos:
                    </span>
                    <p className="text-blue-900 text-sm">
                      {pv.vehicleCategories && pv.vehicleCategories.length > 0
                        ? pv.vehicleCategories.map(vc => vc.name).join(', ')
                        : 'Todas las categorías'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para nuevos valores de pago */}
      <div className="space-y-6">
        {paymentValues.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FontAwesomeIcon icon={faDollarSign} className="text-4xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              No hay valores de pago nuevos
            </h4>
            <p className="text-gray-500 mb-4">
              {isEntryToExitMode ? 
                'Agrega valores de pago para configurar las tarifas de esta relación entrada→salida' :
                'Agrega valores de pago para configurar las tarifas de este pórtico'
              }
            </p>
            <button
              type="button"
              onClick={onAddPaymentValue}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center mx-auto"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Agregar Primer Valor
            </button>
          </div>
        ) : (
          paymentValues.map((pv, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500" />
                  Valor de Pago #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => onRemovePaymentValue(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Eliminar este valor"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Categoría de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría de Pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pv.paymentCategoryId}
                    onChange={(e) => onUpdatePaymentValue(index, 'paymentCategoryId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Seleccione una categoría</option>
                    {paymentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor Monetario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pv.value}
                      onChange={(e) => onUpdatePaymentValue(index, 'value', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  {pv.value && (
                    <p className="text-sm text-gray-600 mt-1">
                      Valor: <span className="font-semibold text-green-600">{formatCurrency(pv.value)}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Categorías de Vehículos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categorías de Vehículos
                  <span className="ml-2 text-xs text-gray-500">
                    (Dejar vacío aplica a todas las categorías)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {vehicleCategories.map(vc => {
                    const isChecked = pv.vehicleCategoryIds.includes(vc.id);
                    return (
                      <label 
                        key={vc.id} 
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => onVehicleCategoryChange(index, vc.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm font-medium">
                          <FontAwesomeIcon icon={faCar} className="mr-1" />
                          {vc.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {pv.vehicleCategoryIds.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    Se aplicará a todas las categorías de vehículos
                  </p>
                )}
              </div>

              {/* Advertencia de duplicados */}
              {pv.paymentCategoryId && pv.value && (() => {
                const warning = getDuplicateWarning(pv.paymentCategoryId, pv.vehicleCategoryIds, index);
                if (warning) {
                  return (
                    <div className={`p-3 rounded-lg text-sm ${
                      warning.type === 'update'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      <div className="flex items-start">
                        <FontAwesomeIcon 
                          icon={warning.type === 'update' ? faExclamationTriangle : faInfoCircle} 
                          className="mr-2 mt-0.5 flex-shrink-0" 
                        />
                        <p>{warning.message}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Resumen del valor */}
              {pv.paymentCategoryId && pv.value && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <FontAwesomeIcon icon={faTag} className="mr-2 text-gray-400" />
                      <span>
                        {paymentCategories.find(pc => pc.id.toString() === pv.paymentCategoryId)?.name || 'Categoría'}
                      </span>
                      {pv.vehicleCategoryIds.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{pv.vehicleCategoryIds.length} categoría{pv.vehicleCategoryIds.length !== 1 ? 's' : ''} de vehículos</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(pv.value)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resumen total y botón de guardar */}
      {paymentValues.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-700">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                Total de valores configurados: <strong>{paymentValues.length}</strong>
              </div>
              <div className="text-sm text-green-600">
                {paymentValues.filter(pv => pv.paymentCategoryId && pv.value).length} completados
              </div>
            </div>
          </div>
          
          {/* Botón de guardar valores de pago */}
          {onSavePaymentValues && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onSavePaymentValues}
                disabled={savingPaymentValues || paymentValues.filter(pv => pv.paymentCategoryId && pv.value).length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPaymentValues ? (
                  <>
                    <div className="spinner h-5 w-5 mr-2" />
                    Guardando valores...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Guardar Valores de Pago
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentValuesSection;
