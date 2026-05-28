"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoad,
  faMapMarkerAlt,
  faBuilding,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "@/contexts/AppContext";
import type { TollGate, EntryToExitTollGate } from "@/types";

export interface ExitTollGatesSectionProps {
  selectedTollGate: TollGate;
  selectedExitRelation: EntryToExitTollGate | null;
  onExitRelationSelect: (relation: EntryToExitTollGate) => void;
}

export const ExitTollGatesSection: React.FC<ExitTollGatesSectionProps> = ({
  selectedTollGate,
  selectedExitRelation,
  onExitRelationSelect,
}) => {
  const { apiService } = useApp();
  const [entryToExitRelations, setEntryToExitRelations] = useState<EntryToExitTollGate[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar relaciones entry-to-exit cuando el pórtico seleccionado sea de entrada
  useEffect(() => {
    const loadEntryToExitRelations = async () => {
      if (!apiService || selectedTollGate.isEntryorExit !== "ENTRY") {
        setEntryToExitRelations([]);
        return;
      }

      setLoading(true);
      try {
        console.log("ExitTollGatesSection: Loading entry-to-exit relations for entry toll gate:", selectedTollGate.id);
        const relations = await apiService.entryToExit.getEntryToExitRelations(selectedTollGate.id);
        console.log("ExitTollGatesSection: Entry-to-exit relations loaded:", relations);
        setEntryToExitRelations(relations || []);
      } catch (error) {
        console.error("Error loading entry-to-exit relations:", error);
        setEntryToExitRelations([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntryToExitRelations();
  }, [selectedTollGate, apiService]);

  // Helper para determinar el estado de una relación
  const getRelationStatus = (relation: EntryToExitTollGate) => {
    const hasPaymentValues = relation.paymentValues && relation.paymentValues.length > 0;
    const hasTimeWindows = relation.entryToExitTimeWindows && relation.entryToExitTimeWindows.length > 0;

    if (hasPaymentValues && hasTimeWindows) {
      return {
        label: "Configurado",
        icon: faCheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        count: `${relation.paymentValues?.length || 0} valores • ${relation.entryToExitTimeWindows?.length || 0} ventanas`
      };
    } else if (hasPaymentValues || hasTimeWindows) {
      return {
        label: "Parcialmente configurado",
        icon: faExclamationTriangle,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        count: `${relation.paymentValues?.length || 0} valores • ${relation.entryToExitTimeWindows?.length || 0} ventanas`
      };
    } else {
      return {
        label: "Sin configurar",
        icon: faExclamationTriangle,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        count: null
      };
    }
  };

  // Solo mostrar si es un pórtico de entrada
  if (selectedTollGate.isEntryorExit !== "ENTRY") {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faRoad} className="mr-2 text-green-600" />
          Pórticos de Salida Asignados
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Haz clic en un pórtico de salida para configurar la relación entrada→salida
        </p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner h-6 w-6 mr-3" />
            <span className="text-gray-600">Cargando pórticos de salida...</span>
          </div>
        ) : entryToExitRelations.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-300 text-3xl mb-3" />
            <p className="text-gray-500">
              No hay pórticos de salida asignados a este pórtico de entrada
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entryToExitRelations.map((relation) => {
              const exitGate = relation.exitTollGate;
              const status = getRelationStatus(relation);
              const isSelected = selectedExitRelation?.id === relation.id;

              if (!exitGate) return null;

              return (
                <div
                  key={relation.id}
                  onClick={() => onExitRelationSelect(relation)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FontAwesomeIcon
                          icon={faRoad}
                          className="text-red-600 text-sm mr-2"
                        />
                        <h4 className="text-sm font-medium text-gray-900">
                          {exitGate.name}
                        </h4>
                        <div className={`ml-2 px-2 py-0.5 text-xs rounded-full flex items-center ${status.bgColor} ${status.textColor}`}>
                          <FontAwesomeIcon icon={status.icon} className="mr-1" />
                          {status.label}
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 w-3" />
                          <span>Pórtico: {exitGate.portico || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faBuilding} className="mr-1 w-3" />
                          <span>{exitGate.concessionaire?.name || "N/A"}</span>
                        </div>
                        {status.count && (
                          <div className={`flex items-center ${status.textColor}`}>
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                            <span>{status.count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-4">
                        <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                          Seleccionado
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitTollGatesSection;
