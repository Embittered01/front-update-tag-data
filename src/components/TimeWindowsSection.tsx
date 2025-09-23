'use client';

import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faPlus, 
  faLink, 
  faEdit, 
  faTrash, 
  faCalendarDay,
  faInfoCircle,
  faFilter,
  faSearch,
  faList,
  faTags,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import type { TimeWindow, PaymentCategory, TollGate, DayType, AssignedTimeWindow, PaymentCategoryTimeWindow } from '@/types';

export interface TimeWindowsSectionProps {
  selectedTollGate: TollGate | null;
  timeWindows: TimeWindow[];
  paymentCategories: PaymentCategory[];
  existingTimeWindows?: AssignedTimeWindow[];
  searchTerm: string;
  selectedCategory: string;
  selectedDay: DayType | '';
  selectedTimeBlock: string;
  onNewTimeWindow: () => void;
  onAssignTimeWindows: () => void;
  onEditTimeWindow: (paymentCategoryTimeWindow: PaymentCategoryTimeWindow) => void;
  onDeleteTimeWindow: (timeWindowId: number) => void;
  onSearchChange: (term: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDayChange: (day: DayType | '') => void;
  onTimeBlockChange: (block: string) => void;
  loading?: boolean;
}

const DAY_LABELS: Record<DayType, string> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mié',
  THURSDAY: 'Jue',
  FRIDAY: 'Vie',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
  ALL_DAYS: 'Todos'
};

const TIME_BLOCKS = [
  { value: '', label: 'Todos los horarios' },
  { value: 'morning', label: 'Mañana (06:00-12:00)' },
  { value: 'afternoon', label: 'Tarde (12:00-18:00)' },
  { value: 'evening', label: 'Noche (18:00-00:00)' },
  { value: 'overnight', label: 'Madrugada (00:00-06:00)' }
];

export const TimeWindowsSection: React.FC<TimeWindowsSectionProps> = ({
  selectedTollGate,
  timeWindows,
  paymentCategories,
  existingTimeWindows = [],
  searchTerm,
  selectedCategory,
  selectedDay,
  selectedTimeBlock,
  onNewTimeWindow,
  onAssignTimeWindows,
  onEditTimeWindow,
  onDeleteTimeWindow,
  onSearchChange,
  onCategoryChange,
  onDayChange,
  onTimeBlockChange,
  loading = false
}) => {
  // Función para obtener el bloque de tiempo
  const getTimeBlock = (time: string): string => {
    const [hour] = time.split(':').map(Number);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';  
    if (hour >= 18 && hour < 24) return 'evening';
    return 'overnight';
  };

  // Función para formatear horarios overnight
  const formatTimeRange = (from: string, to: string): string => {
    const [fromHour, fromMin] = from.split(':').map(Number);
    const [toHour, toMin] = to.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    if (fromMinutes >= toMinutes) {
      return `${from} - ${to} +1`;  // +1 indica día siguiente
    }
    
    return `${from} - ${to}`;
  };

  // Filtrar ventanas de tiempo existentes del pórtico
  const filteredExistingTimeWindows = useMemo(() => {
    console.log('=== DEBUG TimeWindowsSection ===');
    console.log('existingTimeWindows recibidas:', existingTimeWindows);
    console.log('cantidad:', existingTimeWindows.length);
    
    const filteredResult = existingTimeWindows.filter(tw => {
      const paymentCategoryTimeWindow = tw.paymentCategoryTimeWindow;
      // Validar que el timeWindow sea válido primero
      if (!paymentCategoryTimeWindow || !paymentCategoryTimeWindow.from || !paymentCategoryTimeWindow.to) {
        console.log('TimeWindow inválido filtrado - estructura completa:', {
          completo: tw,
          tienFrom: !!paymentCategoryTimeWindow?.from,
          tienTo: !!paymentCategoryTimeWindow?.to,
          tienePaymentCategoryTimeWindow: !!tw?.paymentCategoryTimeWindow,
          estructuraPaymentCategoryTimeWindow: tw?.paymentCategoryTimeWindow
        });
        return false;
      }
      
      const matchesSearch = !searchTerm || 
        paymentCategoryTimeWindow.paymentCategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paymentCategoryTimeWindow.from.includes(searchTerm) ||
        paymentCategoryTimeWindow.to.includes(searchTerm);
      
      const matchesCategory = !selectedCategory || 
        paymentCategoryTimeWindow.paymentCategory?.id.toString() === selectedCategory;
      
      const matchesDay = !selectedDay || 
        paymentCategoryTimeWindow.dayType === selectedDay || 
        paymentCategoryTimeWindow.dayType === 'ALL_DAYS';
      
      const matchesTimeBlock = !selectedTimeBlock || 
        getTimeBlock(paymentCategoryTimeWindow.from) === selectedTimeBlock;
      
      const passes = matchesSearch && matchesCategory && matchesDay && matchesTimeBlock;
      
      if (!passes) {
        console.log('TimeWindow no pasa filtros:', {
          tw,
          searchTerm,
          selectedCategory,
          selectedDay,
          selectedTimeBlock,
          matchesSearch,
          matchesCategory,
          matchesDay,
          matchesTimeBlock
        });
      }
      
      return passes;
    });
    
    console.log('ventanas después del filtro:', filteredResult);
    console.log('cantidad después del filtro:', filteredResult.length);
    return filteredResult;
  }, [existingTimeWindows, searchTerm, selectedCategory, selectedDay, selectedTimeBlock]);

  // Agrupar ventanas por categoría de pago
  const groupedTimeWindows = useMemo(() => {
    const groups: Record<string, PaymentCategoryTimeWindow[]> = {};
    
    // Los timeWindows ya vienen validados del filtro anterior
    filteredExistingTimeWindows.forEach(tw => {
      const paymentCategoryTimeWindow = tw.paymentCategoryTimeWindow;
      const categoryName = tw.paymentCategoryTimeWindow.paymentCategory?.name || 'Sin categoría';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(paymentCategoryTimeWindow);
    });
    
    // Ordenar dentro de cada grupo por hora de inicio
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.from.localeCompare(b.from));
    });
    
    console.log('grupos finales:', groups);
    console.log('cantidad de grupos:', Object.keys(groups).length);
    
    return groups;
  }, [filteredExistingTimeWindows]);

  if (!selectedTollGate) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        <FontAwesomeIcon icon={faClock} className="text-4xl mb-4" />
        <p>Selecciona un pórtico para configurar ventanas de tiempo</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-48">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl mr-3" />
          <span className="text-gray-600">Cargando ventanas de tiempo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-500" />
          Ventanas de Tiempo
          {filteredExistingTimeWindows.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {filteredExistingTimeWindows.length}
            </span>
          )}
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onAssignTimeWindows}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center text-sm"
          >
            <FontAwesomeIcon icon={faLink} className="mr-2" />
            Asignar
          </button>
          <button
            type="button"
            onClick={onNewTimeWindow}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nueva Ventana
          </button>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en ventanas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        </div>

        {/* Filtro por Categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las categorías</option>
          {paymentCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Filtro por Día */}
        <select
          value={selectedDay}
          onChange={(e) => onDayChange(e.target.value as DayType | '')}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los días</option>
          {Object.entries(DAY_LABELS).map(([day, label]) => (
            <option key={day} value={day}>
              {label}
            </option>
          ))}
        </select>

        {/* Filtro por Bloque Horario */}
        <select
          value={selectedTimeBlock}
          onChange={(e) => onTimeBlockChange(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {TIME_BLOCKS.map(block => (
            <option key={block.value} value={block.value}>
              {block.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Ventanas Existentes */}
      {existingTimeWindows.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FontAwesomeIcon icon={faClock} className="text-4xl text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            No hay ventanas de tiempo configuradas
          </h4>
          <p className="text-gray-500 mb-4">
            Configura ventanas de tiempo para definir horarios específicos por categoría de pago
          </p>
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={onNewTimeWindow}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Crear Primera Ventana
            </button>
            <button
              type="button"
              onClick={onAssignTimeWindows}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faLink} className="mr-2" />
              Asignar Existentes
            </button>
          </div>
        </div>
      ) : filteredExistingTimeWindows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FontAwesomeIcon icon={faFilter} className="text-3xl mb-2" />
          <p className="text-sm">No se encontraron ventanas que coincidan con los filtros.</p>
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('');
              onDayChange('');
              onTimeBlockChange('');
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTimeWindows).map(([categoryName, windows]) => (
            <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faTags} className="mr-2 text-gray-500" />
                  {categoryName}
                  <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {windows.length} ventana{windows.length !== 1 ? 's' : ''}
                  </span>
                </h4>
              </div>
              
              <div className="divide-y divide-gray-200">
                {windows.map((tw) => (
                  <div key={tw.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-lg font-semibold text-gray-800">
                            <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-500" />
                            {formatTimeRange(tw.from, tw.to)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                            {DAY_LABELS[tw.dayType as DayType] || tw.dayType}
                          </div>
                        </div>
                        
                        {/* Indicador de horario overnight */}
                        {tw.from >= tw.to && (
                          <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mb-2">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Cruza medianoche
                          </div>
                        )}
                        
                        {/* Bloque de tiempo */}
                        <div className="text-sm text-gray-500">
                          {TIME_BLOCKS.find(block => block.value === getTimeBlock(tw.from))?.label || 'Horario personalizado'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onEditTimeWindow(tw)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="Editar ventana de tiempo"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => onDeleteTimeWindow(tw.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Eliminar ventana de tiempo"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {existingTimeWindows.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-700">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              <strong>{existingTimeWindows.length}</strong> ventana{existingTimeWindows.length !== 1 ? 's' : ''} de tiempo configurada{existingTimeWindows.length !== 1 ? 's' : ''}
            </div>
            <div className="text-blue-600">
              {Object.keys(groupedTimeWindows).length} categoría{Object.keys(groupedTimeWindows).length !== 1 ? 's' : ''} con horarios
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeWindowsSection;
