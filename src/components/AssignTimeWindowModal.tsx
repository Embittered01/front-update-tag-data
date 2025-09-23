"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faLink,
  faClock,
  faCalendarDay,
  faSearch,
  faFilter,
  faTags,
  faInfoCircle,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import type {
  TimeWindow,
  PaymentCategory,
  TollGate,
  DayType,
  AssignedTimeWindow,
  PaymentCategoryTimeWindow,
} from "@/types";

export interface AssignTimeWindowModalProps {
  isOpen: boolean;
  selectedTollGate: TollGate | null;
  assignedTimeWindows: AssignedTimeWindow[];
  paymentCategories: PaymentCategory[];
  selectedTimeWindowIds: number[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (timeWindowIds: number[]) => void;
  onSelectionChange: (timeWindowIds: number[]) => void;
}

const DAY_LABELS: Record<DayType, string> = {
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mié",
  THURSDAY: "Jue",
  FRIDAY: "Vie",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
  ALL_DAYS: "Todos",
};

export const AssignTimeWindowModal: React.FC<AssignTimeWindowModalProps> = ({
  isOpen,
  selectedTollGate,
  assignedTimeWindows,
  paymentCategories,
  selectedTimeWindowIds,
  loading,
  onClose,
  onSubmit,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayType | "">("");

  // Función para formatear horarios
  const formatTimeRange = (from: string, to: string): string => {
    const [fromHour, fromMin] = from.split(":").map(Number);
    const [toHour, toMin] = to.split(":").map(Number);

    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;

    if (fromMinutes >= toMinutes) {
      return `${from} - ${to} +1`;
    }

    return `${from} - ${to}`;
  };

  // Filtrar ventanas disponibles
  const filteredTimeWindows = useMemo(() => {
    if (!isOpen || !selectedTollGate) return false;

    const paymentCategoryTimeWindows: PaymentCategoryTimeWindow[] = assignedTimeWindows.map((tw) => tw.paymentCategoryTimeWindow);

    for (const paymentCategoryTimeWindow of paymentCategoryTimeWindows) {
      if (!paymentCategoryTimeWindow || !paymentCategoryTimeWindow.from || !paymentCategoryTimeWindow.to) return false;


    // Validar que el timeWindow sea válido primero
    const matchesSearch =
      !searchTerm ||
      paymentCategoryTimeWindow.paymentCategory?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      paymentCategoryTimeWindow.from.includes(searchTerm) ||
      paymentCategoryTimeWindow.to.includes(searchTerm);

    const matchesCategory =
      !selectedCategory ||
      paymentCategoryTimeWindow.paymentCategory?.id.toString() === selectedCategory;

    const matchesDay =
      !selectedDay || paymentCategoryTimeWindow.dayType === selectedDay || paymentCategoryTimeWindow.dayType === "ALL_DAYS";

    return matchesSearch && matchesCategory && matchesDay;
  }    }, [
    isOpen,
    selectedTollGate,
    assignedTimeWindows,
    searchTerm,
    selectedCategory,
    selectedDay,
  ]);

  // Agrupar por categoría
  const groupedTimeWindows = useMemo(() => {
    const groups: Record<string, PaymentCategoryTimeWindow[]> = {};

    // Los timeWindows ya vienen validados del filtro anterior
    assignedTimeWindows.forEach((tw) => {
      const categoryName = tw.paymentCategoryTimeWindow.paymentCategory?.name || "Sin categoría";
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(tw.paymentCategoryTimeWindow);
    });

    // Ordenar dentro de cada grupo por hora de inicio
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.from.localeCompare(b.from));
    });

    return groups;
  }, [filteredTimeWindows]);

  if (!isOpen || !selectedTollGate) return null;

  const handleTimeWindowToggle = (timeWindowId: number) => {
    const newSelection = selectedTimeWindowIds.includes(timeWindowId)
      ? selectedTimeWindowIds.filter((id) => id !== timeWindowId)
      : [...selectedTimeWindowIds, timeWindowId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = assignedTimeWindows.map((tw) => tw.id);
    const areAllSelected = allIds.every((id) =>
      selectedTimeWindowIds.includes(id)
    );

    if (areAllSelected) {
      // Deseleccionar todos los filtrados
      onSelectionChange(
        selectedTimeWindowIds.filter((id) => !allIds.includes(id))
      );
    } else {
      // Seleccionar todos los filtrados
      onSelectionChange([...new Set([...selectedTimeWindowIds, ...allIds])]);
    }
  };

  const handleCategoryToggle = (categoryWindows: PaymentCategoryTimeWindow[]) => {
    const categoryIds = categoryWindows.map((tw) => tw.id);
    const areAllSelected = categoryIds.every((id) =>
      selectedTimeWindowIds.includes(id)
    );

    if (areAllSelected) {
      // Deseleccionar toda la categoría
      onSelectionChange(
        selectedTimeWindowIds.filter((id) => !categoryIds.includes(id))
      );
    } else {
      // Seleccionar toda la categoría
      onSelectionChange([
        ...new Set([...selectedTimeWindowIds, ...categoryIds]),
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTimeWindowIds.length === 0) {
      alert("Por favor seleccione al menos una ventana de tiempo");
      return;
    }

    onSubmit(selectedTimeWindowIds);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDay("");
  };

  const allFilteredSelected =
    assignedTimeWindows.length > 0 &&
    assignedTimeWindows.every((tw) => selectedTimeWindowIds.includes(tw.id));

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faLink} className="mr-2 text-green-600" />
            Asignar Ventanas de Tiempo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Info del pórtico */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-700">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            <span className="font-medium">
              Asignando ventanas a: <strong>{selectedTollGate.name}</strong>
            </span>
            {selectedTollGate.portico && (
              <span className="ml-2 text-blue-600">
                • Pórtico {selectedTollGate.portico}
              </span>
            )}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            {selectedTimeWindowIds.length} ventana
            {selectedTimeWindowIds.length !== 1 ? "s" : ""} seleccionada
            {selectedTimeWindowIds.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar ventanas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {paymentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as DayType | "")}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los días</option>
            {Object.entries(DAY_LABELS).map(([day, label]) => (
              <option key={day} value={day}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Controles de selección */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FontAwesomeIcon
                icon={allFilteredSelected ? faCheckSquare : faSquare}
                className="mr-2"
              />
              {allFilteredSelected
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </button>

            {(searchTerm || selectedCategory || selectedDay) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
              >
                <FontAwesomeIcon icon={faFilter} className="mr-1" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {assignedTimeWindows.length} ventana
            {assignedTimeWindows.length !== 1 ? "s" : ""} disponible
            {assignedTimeWindows.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Lista de ventanas */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedTimeWindows).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faFilter} className="text-3xl mb-2" />
              <p>No se encontraron ventanas que coincidan con los filtros</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTimeWindows).map(
                ([categoryName, windows]) => {
                  const categoryIds = windows.map((tw) => tw.paymentCategory.id);
                  const allCategorySelected = categoryIds.every((id) =>
                    selectedTimeWindowIds.includes(id)
                  );
                  const someCategorySelected = categoryIds.some((id) =>
                    selectedTimeWindowIds.includes(id)
                  );

                  return (
                    <div
                      key={categoryName}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(windows)}
                          className="flex items-center justify-between w-full text-left hover:bg-gray-200 transition-colors rounded -mx-4 px-4 py-2"
                        >
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={
                                allCategorySelected ? faCheckSquare : faSquare
                              }
                              className={`mr-3 ${
                                allCategorySelected
                                  ? "text-blue-600"
                                  : someCategorySelected
                                  ? "text-blue-400"
                                  : "text-gray-400"
                              }`}
                            />
                            <FontAwesomeIcon
                              icon={faTags}
                              className="mr-2 text-gray-500"
                            />
                            <h4 className="font-medium text-gray-800">
                              {categoryName}
                            </h4>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {windows.length}
                          </span>
                        </button>
                      </div>

                      <div className="divide-y divide-gray-200">
                        {windows.map((tw) => {
                          const isSelected = selectedTimeWindowIds.includes(
                            tw.id
                          );

                          return (
                            <label
                              key={tw.id}
                              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTimeWindowToggle(tw.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                              />

                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-4 mb-1">
                                    <div className="flex items-center font-semibold text-gray-800">
                                      <FontAwesomeIcon
                                        icon={faClock}
                                        className="mr-2 text-blue-500"
                                      />
                                      {formatTimeRange(tw.from, tw.to)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <FontAwesomeIcon
                                        icon={faCalendarDay}
                                        className="mr-1"
                                      />
                                      {tw.dayType
                                        ? DAY_LABELS[tw.dayType] || tw.dayType
                                        : "N/A"}
                                    </div>
                                  </div>

                                  {tw.from >= tw.to && (
                                    <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                      <FontAwesomeIcon
                                        icon={faInfoCircle}
                                        className="mr-1"
                                      />
                                      Cruza medianoche
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <div className="flex justify-end space-x-3">
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || selectedTimeWindowIds.length === 0}
            >
              {loading && <div className="spinner h-4 w-4 mr-2" />}
              Asignar {selectedTimeWindowIds.length} Ventana
              {selectedTimeWindowIds.length !== 1 ? "s" : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTimeWindowModal;
