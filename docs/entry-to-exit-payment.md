# API de Configuración Entry-to-Exit

## Descripción General

Esta API permite gestionar la configuración de valores de pago y ventanas de tiempo para relaciones entrada-salida (entry-to-exit) de pórticos de peaje. 

### 🎯 **Conceptos Importantes**

- **Pórticos de Entrada**: Solo registran el paso del vehículo, NO tienen valores de pago propios
- **Pórticos de Salida**: Solo aplican la configuración entry-to-exit, NO tienen valores de pago propios  
- **Pórticos Comunes**: Tienen sus propios valores de pago independientes
- **Relaciones Entry-to-Exit**: Son las únicas que tienen valores de pago y ventanas de tiempo configurados

Cada relación entre un pórtico de entrada y un pórtico de salida puede tener sus propios valores de pago y ventanas de tiempo configurados.

## Características

- ✅ Asignación de valores de pago por categoría de pago y categoría de vehículo
- ✅ Asignación de ventanas de tiempo (horarios) para tarifas dinámicas
- ✅ Soporte para diferentes días de la semana y feriados
- ✅ Reutilización de ventanas de tiempo existentes
- ✅ Soft delete para mantener historial
- ✅ Validaciones automáticas de duplicados

---

## Base URL

```
http://localhost:3010/api/payment-toll-gate
```

**Nota:** Todos los endpoints de configuración entry-to-exit están bajo el prefijo `/payment-toll-gate/entry-to-exit` para mantener consistencia con la configuración de pórticos normales.

---

## Endpoints

### 1. Asignar Valores de Pago a Relación Entry-to-Exit

Asigna o actualiza valores de pago para diferentes categorías y tipos de vehículos en una relación entrada-salida.

**Endpoint:**
```http
POST /payment-toll-gate/entry-to-exit/:entryToExitId/payment-values
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |

**Request Body:**
```json
{
  "paymentValues": [
    {
      "paymentCategoryId": 1,
      "value": 5000,
      "vehicleCategoryIds": [1, 2]
    },
    {
      "paymentCategoryId": 2,
      "value": 7500,
      "vehicleCategoryIds": [1, 2]
    },
    {
      "paymentCategoryId": 3,
      "value": 3500,
      "vehicleCategoryIds": [1, 2]
    }
  ]
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `paymentValues` | array | Sí | Array de valores de pago |
| `paymentValues[].paymentCategoryId` | number | Sí | ID de categoría de pago (1=TBFP, 2=TBP, 3=TBV) |
| `paymentValues[].value` | number | Sí | Monto a cobrar |
| `paymentValues[].vehicleCategoryIds` | number[] | No | IDs de categorías de vehículos (C1, C2, etc.) |

**Response (200 OK):**
```json
{
  "entryToExitTollGateId": 1,
  "updatedPaymentValues": [
    {
      "id": 44,
      "value": 5500,
      "paymentCategoryId": 1,
      "entryToExitTollGateId": 1,
      "createdAt": "2025-10-09T10:00:00.000Z",
      "updatedAt": "2025-10-10T10:30:00.000Z",
      "deletedAt": null,
      "paymentCategory": {
        "id": 1,
        "name": "TBFP",
        "description": "Tarifa Base Fuera de Punta"
      },
      "vehicleCategories": [
        {
          "vehicleCategory": {
            "id": 1,
            "name": "Categoría 1",
            "abbreviation": "C1"
          }
        }
      ]
    }
  ],
  "createdPaymentValues": [
    {
      "id": 45,
      "value": 5000,
      "paymentCategoryId": 1,
      "entryToExitTollGateId": 1,
      "createdAt": "2025-10-10T10:30:00.000Z",
      "updatedAt": "2025-10-10T10:30:00.000Z",
      "deletedAt": null,
      "paymentCategory": {
        "id": 1,
        "name": "TBFP",
        "description": "Tarifa Base Fuera de Punta"
      }
    }
  ]
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/payment-toll-gate/entry-to-exit/1/payment-values \
  -H "Content-Type: application/json" \
  -d '{
    "paymentValues": [
      {
        "paymentCategoryId": 1,
        "value": 5000,
        "vehicleCategoryIds": [1, 2]
      }
    ]
  }'
```

---

### 2. Asignar Ventanas de Tiempo a Relación Entry-to-Exit

Asigna ventanas de tiempo específicas a una relación entrada-salida para aplicar tarifas dinámicas según horario.

**Endpoint:**
```http
POST /payment-toll-gate/entry-to-exit/:entryToExitId/time-windows
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |

**Request Body:**
```json
{
  "timeWindows": [
    {
      "paymentCategoryTimeWindowId": 1
    },
    {
      "paymentCategoryTimeWindowId": 2
    },
    {
      "paymentCategoryTimeWindowId": 3
    }
  ]
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `timeWindows` | array | Sí | Array de ventanas de tiempo |
| `timeWindows[].paymentCategoryTimeWindowId` | number | Sí | ID de ventana de tiempo existente |

**Response (200 OK):**
```json
{
  "entryToExitTollGateId": 1,
  "updatedTimeWindows": [],
  "createdTimeWindows": [
    {
      "id": 12,
      "entryToExitTollGateId": 1,
      "paymentCategoryTimeWindowId": 1,
      "createdAt": "2025-10-10T10:35:00.000Z",
      "updatedAt": "2025-10-10T10:35:00.000Z",
      "deletedAt": null,
      "paymentCategoryTimeWindow": {
        "id": 1,
        "timeWindowId": 1,
        "paymentCategoryId": 2,
        "dayType": "MONDAY",
        "createdAt": "2025-10-01T08:00:00.000Z",
        "updatedAt": "2025-10-01T08:00:00.000Z",
        "paymentCategory": {
          "id": 2,
          "name": "TBP",
          "description": "Tarifa Base Punta"
        },
        "timeWindow": {
          "id": 1,
          "from": "07:00",
          "to": "09:00",
          "createdAt": "2025-10-01T08:00:00.000Z",
          "updatedAt": "2025-10-01T08:00:00.000Z"
        }
      }
    },
    {
      "id": 13,
      "entryToExitTollGateId": 1,
      "paymentCategoryTimeWindowId": 2,
      "createdAt": "2025-10-10T10:35:00.000Z",
      "updatedAt": "2025-10-10T10:35:00.000Z",
      "deletedAt": null,
      "paymentCategoryTimeWindow": {
        "id": 2,
        "timeWindowId": 2,
        "paymentCategoryId": 3,
        "dayType": "MONDAY",
        "paymentCategory": {
          "id": 3,
          "name": "TBV",
          "description": "Tarifa Base Valle"
        },
        "timeWindow": {
          "id": 2,
          "from": "10:00",
          "to": "18:00"
        }
      }
    }
  ]
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/payment-toll-gate/entry-to-exit/1/time-windows \
  -H "Content-Type: application/json" \
  -d '{
    "timeWindows": [
      {"paymentCategoryTimeWindowId": 1},
      {"paymentCategoryTimeWindowId": 2}
    ]
  }'
```

---

### 3. Eliminar Valor de Pago

Elimina (soft delete) un valor de pago específico de una relación entry-to-exit.

**Endpoint:**
```http
DELETE /payment-toll-gate/entry-to-exit/:entryToExitId/payment-values/:paymentValueId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |
| `paymentValueId` | number | ID del EntryToExitPaymentValue a eliminar |

**Response (200 OK):**
```json
{
  "deletedPaymentValue": {
    "id": 45,
    "value": 5000,
    "paymentCategory": {
      "id": 1,
      "name": "TBFP",
      "description": "Tarifa Base Fuera de Punta"
    },
    "vehicleCategories": [
      {
        "id": 1,
        "name": "Categoría 1",
        "abbreviation": "C1"
      },
      {
        "id": 2,
        "name": "Categoría 2",
        "abbreviation": "C2"
      }
    ]
  },
  "entryToExitTollGate": {
    "id": 1,
    "entryTollGateId": 10,
    "exitTollGateId": 15,
    "createdAt": "2025-10-01T08:00:00.000Z",
    "updatedAt": "2025-10-01T08:00:00.000Z",
    "deletedAt": null
  }
}
```

**Ejemplo cURL:**
```bash
curl -X DELETE http://localhost:3000/payment-toll-gate/entry-to-exit/1/payment-values/45
```

---

### 4. Eliminar Ventana de Tiempo

Elimina (soft delete) una ventana de tiempo asignada a una relación entry-to-exit.

**Endpoint:**
```http
DELETE /payment-toll-gate/entry-to-exit/:entryToExitId/time-windows/:timeWindowId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |
| `timeWindowId` | number | ID del PaymentCategoryTimeWindow a desasignar |

**Response (200 OK):**
```json
{
  "id": 12,
  "entryToExitTollGateId": 1,
  "paymentCategoryTimeWindowId": 1,
  "createdAt": "2025-10-10T10:35:00.000Z",
  "updatedAt": "2025-10-10T10:40:00.000Z",
  "deletedAt": "2025-10-10T10:40:00.000Z",
  "paymentCategoryTimeWindow": {
    "id": 1,
    "timeWindowId": 1,
    "paymentCategoryId": 2,
    "dayType": "MONDAY",
    "paymentCategory": {
      "id": 2,
      "name": "TBP",
      "description": "Tarifa Base Punta"
    },
    "timeWindow": {
      "id": 1,
      "from": "07:00",
      "to": "09:00"
    }
  }
}
```

**Ejemplo cURL:**
```bash
curl -X DELETE http://localhost:3000/payment-toll-gate/entry-to-exit/1/time-windows/1
```

---

### 5. Listar Todas las Configuraciones Entry-to-Exit

Obtiene todas las relaciones entry-to-exit con sus valores de pago y ventanas de tiempo.

**Endpoint:**
```http
GET /payment-toll-gate/entry-to-exit
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "entryTollGateId": 10,
    "exitTollGateId": 15,
    "createdAt": "2025-10-01T08:00:00.000Z",
    "updatedAt": "2025-10-01T08:00:00.000Z",
    "deletedAt": null,
    "entryTollGate": {
      "id": 10,
      "name": "Entrada Norte",
      "portico": "P-EN-01",
      "latitude": -33.4372,
      "longitude": -70.6506,
      "isEntryorExit": "ENTRY",
      "concessionaire": {
        "id": 1,
        "name": "Autopista Central"
      }
    },
    "exitTollGate": {
      "id": 15,
      "name": "Salida Sur",
      "portico": "P-SL-01",
      "latitude": -33.5372,
      "longitude": -70.7506,
      "isEntryorExit": "EXIT",
      "concessionaire": {
        "id": 1,
        "name": "Autopista Central"
      }
    },
    "paymentValues": [
      {
        "id": 45,
        "value": 5000,
        "paymentCategoryId": 1,
        "entryToExitTollGateId": 1,
        "createdAt": "2025-10-10T10:30:00.000Z",
        "updatedAt": "2025-10-10T10:30:00.000Z",
        "deletedAt": null,
        "paymentCategory": {
          "id": 1,
          "name": "TBFP",
          "description": "Tarifa Base Fuera de Punta"
        },
        "vehicleCategories": [
          {
            "entryToExitPaymentValueId": 45,
            "vehicleCategoryId": 1,
            "vehicleCategory": {
              "id": 1,
              "name": "Categoría 1",
              "abbreviation": "C1",
              "description": "Motocicletas, motonetas, bicimotos o similar"
            }
          }
        ]
      }
    ],
    "entryToExitTimeWindows": [
      {
        "id": 12,
        "entryToExitTollGateId": 1,
        "paymentCategoryTimeWindowId": 1,
        "createdAt": "2025-10-10T10:35:00.000Z",
        "updatedAt": "2025-10-10T10:35:00.000Z",
        "deletedAt": null,
        "paymentCategoryTimeWindow": {
          "id": 1,
          "timeWindowId": 1,
          "paymentCategoryId": 2,
          "dayType": "MONDAY",
          "paymentCategory": {
            "id": 2,
            "name": "TBP",
            "description": "Tarifa Base Punta"
          },
          "timeWindow": {
            "id": 1,
            "from": "07:00",
            "to": "09:00"
          }
        }
      }
    ]
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit
```

---

### 6. Obtener Configuración Específica

Obtiene una relación entry-to-exit específica con toda su configuración.

**Endpoint:**
```http
GET /payment-toll-gate/entry-to-exit/:entryToExitId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |

**Response (200 OK):**
```json
{
  "id": 1,
  "entryTollGateId": 10,
  "exitTollGateId": 15,
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-01T08:00:00.000Z",
  "deletedAt": null,
  "entryTollGate": {
    "id": 10,
    "name": "Entrada Norte",
    "portico": "P-EN-01",
    "latitude": -33.4372,
    "longitude": -70.6506,
    "isEntryorExit": "ENTRY",
    "concessionaire": {
      "id": 1,
      "name": "Autopista Central"
    }
  },
  "exitTollGate": {
    "id": 15,
    "name": "Salida Sur",
    "portico": "P-SL-01",
    "latitude": -33.5372,
    "longitude": -70.7506,
    "isEntryorExit": "EXIT",
    "concessionaire": {
      "id": 1,
      "name": "Autopista Central"
    }
  },
  "paymentValues": [
    {
      "id": 45,
      "value": 5000,
      "paymentCategoryId": 1,
      "entryToExitTollGateId": 1,
      "paymentCategory": {
        "id": 1,
        "name": "TBFP"
      },
      "vehicleCategories": [
        {
          "vehicleCategory": {
            "id": 1,
            "name": "Categoría 1",
            "abbreviation": "C1"
          }
        }
      ]
    }
  ],
  "entryToExitTimeWindows": [
    {
      "id": 12,
      "entryToExitTollGateId": 1,
      "paymentCategoryTimeWindowId": 1,
      "paymentCategoryTimeWindow": {
        "id": 1,
        "dayType": "MONDAY",
        "paymentCategory": {
          "id": 2,
          "name": "TBP"
        },
        "timeWindow": {
          "id": 1,
          "from": "07:00",
          "to": "09:00"
        }
      }
    }
  ]
}
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit/1
```

---

### 7. Obtener Relaciones Básicas por Pórtico de Entrada

Obtiene solo las relaciones básicas (salidas disponibles) para un pórtico de entrada específico. Este endpoint es eficiente y retorna información mínima para listar las opciones disponibles.

**Endpoint:**
```http
GET /payment-toll-gate/entry-to-exit/entry-toll-gate/:entryTollGateId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryTollGateId` | number | ID del TollGate de entrada |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "exitTollGate": {
      "id": 15,
      "name": "Salida Sur",
      "portico": "P-SL-01",
      "isEntryorExit": "EXIT",
      "latitude": -33.5372,
      "longitude": -70.7506
    }
  },
  {
    "id": 2,
    "exitTollGate": {
      "id": 16,
      "name": "Salida Este",
      "portico": "P-SL-02",
      "isEntryorExit": "EXIT",
      "latitude": -33.4372,
      "longitude": -70.6506
    }
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit/entry-toll-gate/10
```

---

### 8. Obtener Valores de Pago de una Configuración Específica

Obtiene únicamente los valores de pago para una relación entrada-salida específica.

**Endpoint:**
```http
GET /payment-toll-gate/entry-to-exit/:entryToExitId/payment-values
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |

**Response (200 OK):**
```json
[
  {
    "id": 45,
    "value": 5000,
    "paymentCategoryId": 1,
    "entryToExitTollGateId": 1,
    "createdAt": "2025-10-10T10:30:00.000Z",
    "updatedAt": "2025-10-10T10:30:00.000Z",
    "deletedAt": null,
    "paymentCategory": {
      "id": 1,
      "name": "TBFP",
      "description": "Tarifa Base Fuera de Punta"
    },
    "vehicleCategories": [
      {
        "entryToExitPaymentValueId": 45,
        "vehicleCategoryId": 1,
        "vehicleCategory": {
          "id": 1,
          "name": "Categoría 1",
          "abbreviation": "C1",
          "description": "Motocicletas, motonetas, bicimotos o similar"
        }
      },
      {
        "entryToExitPaymentValueId": 45,
        "vehicleCategoryId": 2,
        "vehicleCategory": {
          "id": 2,
          "name": "Categoría 2",
          "abbreviation": "C2",
          "description": "Automóviles, camionetas y furgonetas"
        }
      }
    ]
  },
  {
    "id": 46,
    "value": 7500,
    "paymentCategoryId": 2,
    "entryToExitTollGateId": 1,
    "createdAt": "2025-10-10T10:30:00.000Z",
    "updatedAt": "2025-10-10T10:30:00.000Z",
    "deletedAt": null,
    "paymentCategory": {
      "id": 2,
      "name": "TBP",
      "description": "Tarifa Base Punta"
    },
    "vehicleCategories": [
      {
        "entryToExitPaymentValueId": 46,
        "vehicleCategoryId": 1,
        "vehicleCategory": {
          "id": 1,
          "name": "Categoría 1",
          "abbreviation": "C1"
        }
      }
    ]
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit/1/payment-values
```

---

### 9. Obtener Ventanas de Tiempo de una Configuración Específica

Obtiene únicamente las ventanas de tiempo para una relación entrada-salida específica.

**Endpoint:**
```http
GET /payment-toll-gate/entry-to-exit/:entryToExitId/time-windows
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entryToExitId` | number | ID de la relación EntryToExitTollGate |

**Response (200 OK):**
```json
[
  {
    "id": 12,
    "entryToExitTollGateId": 1,
    "paymentCategoryTimeWindowId": 1,
    "createdAt": "2025-10-10T10:35:00.000Z",
    "updatedAt": "2025-10-10T10:35:00.000Z",
    "deletedAt": null,
    "paymentCategoryTimeWindow": {
      "id": 1,
      "timeWindowId": 1,
      "paymentCategoryId": 2,
      "dayType": "MONDAY",
      "createdAt": "2025-10-01T08:00:00.000Z",
      "updatedAt": "2025-10-01T08:00:00.000Z",
      "paymentCategory": {
        "id": 2,
        "name": "TBP",
        "description": "Tarifa Base Punta"
      },
      "timeWindow": {
        "id": 1,
        "from": "07:00",
        "to": "09:00",
        "createdAt": "2025-10-01T08:00:00.000Z",
        "updatedAt": "2025-10-01T08:00:00.000Z"
      }
    }
  },
  {
    "id": 13,
    "entryToExitTollGateId": 1,
    "paymentCategoryTimeWindowId": 2,
    "createdAt": "2025-10-10T10:35:00.000Z",
    "updatedAt": "2025-10-10T10:35:00.000Z",
    "deletedAt": null,
    "paymentCategoryTimeWindow": {
      "id": 2,
      "timeWindowId": 2,
      "paymentCategoryId": 3,
      "dayType": "MONDAY",
      "paymentCategory": {
        "id": 3,
        "name": "TBV",
        "description": "Tarifa Base Valle"
      },
      "timeWindow": {
        "id": 2,
        "from": "10:00",
        "to": "18:00"
      }
    }
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit/1/time-windows
```

---

## Endpoints Auxiliares (Compartidos)

### Crear Ventana de Tiempo

**Endpoint:**
```http
POST /payment-toll-gate/time-windows
```

**Request Body:**
```json
{
  "from": "07:00",
  "to": "09:00",
  "dayType": "MONDAY",
  "paymentCategoryId": 2
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `from` | string | Sí | Hora de inicio (formato HH:mm) |
| `to` | string | Sí | Hora de fin (formato HH:mm) |
| `dayType` | string | Sí | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY, HOLIDAY, ALL_DAYS |
| `paymentCategoryId` | number | Sí | ID de categoría de pago |

**Response (200 OK):**
```json
{
  "id": 1,
  "timeWindowId": 1,
  "paymentCategoryId": 2,
  "dayType": "MONDAY",
  "createdAt": "2025-10-10T10:00:00.000Z",
  "updatedAt": "2025-10-10T10:00:00.000Z",
  "deletedAt": null,
  "from": "07:00",
  "to": "09:00",
  "paymentCategory": {
    "id": 2,
    "name": "TBP",
    "description": "Tarifa Base Punta"
  }
}
```

---

### Obtener Todas las Ventanas de Tiempo

**Endpoint:**
```http
GET /payment-toll-gate/time-windows
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "timeWindowId": 1,
    "paymentCategoryId": 2,
    "dayType": "MONDAY",
    "from": "07:00",
    "to": "09:00",
    "paymentCategory": {
      "id": 2,
      "name": "TBP",
      "description": "Tarifa Base Punta"
    },
    "createdAt": "2025-10-01T08:00:00.000Z",
    "updatedAt": "2025-10-01T08:00:00.000Z"
  }
]
```

---

### Obtener Categorías de Pago

**Endpoint:**
```http
GET /payment-toll-gate/categories
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "TBFP",
    "description": "Tarifa Base Fuera de Punta",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  {
    "id": 2,
    "name": "TBP",
    "description": "Tarifa Base Punta",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  {
    "id": 3,
    "name": "TBV",
    "description": "Tarifa Base Valle",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

### Obtener Categorías de Vehículos

**Endpoint:**
```http
GET /payment-toll-gate/vehicle-categories
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Categoría 1",
    "abbreviation": "C1",
    "description": "Motocicletas, motonetas, bicimotos o similar",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  {
    "id": 2,
    "name": "Categoría 2",
    "abbreviation": "C2",
    "description": "Automóviles, camionetas y furgonetas",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

## Tipos de Pórticos y Valores de Pago

### 🚪 **Pórticos de Entrada (ENTRY)**
```typescript
// NO tienen paymentValues propios
TollGate {
  id: number;
  isEntryorExit: "ENTRY";
  // ❌ NO tiene: paymentValues[]
  // ✅ Solo registra: paso del vehículo
}
```

### 🚪 **Pórticos de Salida (EXIT)**
```typescript
// NO tienen paymentValues propios
TollGate {
  id: number;
  isEntryorExit: "EXIT";
  // ❌ NO tiene: paymentValues[]
  // ✅ Solo aplica: configuración entry-to-exit
}
```

### 🚪 **Pórticos Comunes (COMMON)**
```typescript
// SÍ tienen paymentValues propios
TollGate {
  id: number;
  isEntryorExit: "COMMON";
  // ✅ SÍ tiene: paymentValues[]
  // ✅ Cobra: independientemente
}
```

### 🔗 **Relaciones Entry-to-Exit**
```typescript
// SÍ tienen paymentValues específicos
EntryToExitTollGate {
  id: number;
  entryTollGateId: number;  // Pórtico de entrada
  exitTollGateId: number;   // Pórtico de salida
  // ✅ SÍ tiene: entryToExitPaymentValues[]
  // ✅ Define: tarifas para el trayecto completo
}
```

### 💡 **Flujo de Pago**

1. **Vehículo pasa por pórtico de entrada** → Solo se registra el paso
2. **Vehículo pasa por pórtico de salida** → Se calcula pago basado en la relación entry-to-exit
3. **Vehículo pasa por pórtico común** → Se cobra según sus propios paymentValues

---

## Arquitectura de Endpoints Eficientes

### 🎯 **Diseño Granular**

La API está diseñada con **endpoints granulares** que permiten obtener solo la información necesaria:

#### **Nivel 1: Listado Básico**
- `GET /entry-to-exit/entry-toll-gate/:entryTollGateId` - Solo relaciones disponibles
- **Uso**: Para listar opciones en dropdowns o selecciones

#### **Nivel 2: Detalles Específicos**
- `GET /entry-to-exit/:entryToExitId/payment-values` - Solo valores de pago
- `GET /entry-to-exit/:entryToExitId/time-windows` - Solo ventanas de tiempo
- **Uso**: Para cálculos específicos o validaciones

#### **Nivel 3: Configuración Completa**
- `GET /entry-to-exit/:entryToExitId` - Toda la configuración
- **Uso**: Para administración o configuración completa

### 🚀 **Beneficios de Rendimiento**

| Endpoint | Payload Tamaño | Tiempo Respuesta | Caso de Uso |
|----------|----------------|------------------|-------------|
| **Básico** | ~200 bytes | ~50ms | Listar opciones |
| **Valores** | ~2KB | ~100ms | Cálculo de tarifas |
| **Tiempos** | ~3KB | ~120ms | Validación horarios |
| **Completo** | ~15KB | ~300ms | Administración |

### 💡 **Guía de Uso Recomendada**

```typescript
// ✅ CORRECTO: Flujo eficiente
// 1. Listar opciones disponibles
const relations = await fetch('/entry-to-exit/entry-toll-gate/10');

// 2. Solo si el usuario selecciona una relación específica
const paymentValues = await fetch('/entry-to-exit/1/payment-values');

// ❌ INCORRECTO: Traer todo de una vez
const everything = await fetch('/entry-to-exit/entry-toll-gate/10'); // Muy pesado
```

---

## Flujo de Trabajo Recomendado

### Configuración Inicial

1. **Obtener categorías de pago disponibles:**
   ```bash
   GET /payment-toll-gate/categories
   ```

2. **Obtener categorías de vehículos disponibles:**
   ```bash
   GET /payment-toll-gate/vehicle-categories
   ```

3. **Crear ventanas de tiempo necesarias** (si no existen):
   ```bash
   POST /payment-toll-gate/time-windows
   ```
   - Crear una ventana para horario punta (07:00-09:00, LUNES, TBP)
   - Crear una ventana para horario valle (10:00-18:00, LUNES, TBV)
   - Repetir para cada día de la semana según necesidad

4. **Listar ventanas de tiempo creadas:**
   ```bash
   GET /payment-toll-gate/time-windows
   ```

### Configuración de Relación Entry-to-Exit

5. **Asignar valores de pago a la relación:**
   ```bash
   POST /payment-toll-gate/entry-to-exit/1/payment-values
   ```
   - Asignar valor para TBFP (tarifa normal)
   - Asignar valor para TBP (tarifa punta)
   - Asignar valor para TBV (tarifa valle)
   - Para cada categoría de vehículo necesaria

6. **Asignar ventanas de tiempo a la relación:**
   ```bash
   POST /payment-toll-gate/entry-to-exit/1/time-windows
   ```
   - Asignar todas las ventanas horarias que aplicarán

7. **Verificar configuración:**
   ```bash
   GET /payment-toll-gate/entry-to-exit/1
   ```

### Gestión y Mantenimiento

8. **Consultar todas las configuraciones:**
   ```bash
   GET /payment-toll-gate/entry-to-exit
   ```

9. **Consultar relaciones básicas por pórtico de entrada (eficiente):**
   ```bash
   GET /payment-toll-gate/entry-to-exit/entry-toll-gate/10
   ```
   - Retorna solo información básica para listar opciones disponibles
   - Incluye coordenadas geográficas para mapas

10. **Consultar valores de pago específicos (si es necesario):**
    ```bash
    GET /payment-toll-gate/entry-to-exit/1/payment-values
    ```
    - Solo cuando necesites información detallada de tarifas

11. **Consultar ventanas de tiempo específicas (si es necesario):**
    ```bash
    GET /payment-toll-gate/entry-to-exit/1/time-windows
    ```
    - Solo cuando necesites información detallada de horarios

12. **Eliminar valor de pago (si es necesario):**
    ```bash
    DELETE /payment-toll-gate/entry-to-exit/1/payment-values/45
    ```

13. **Eliminar ventana de tiempo (si es necesario):**
    ```bash
    DELETE /payment-toll-gate/entry-to-exit/1/time-windows/1
    ```

---

## Ejemplo Completo de Configuración

### Escenario
Configurar la relación entrada-salida entre "Entrada Norte" (ID: 10) y "Salida Sur" (ID: 15) con:
- Tarifa punta de 7500 en horario 07:00-09:00 los días de semana
- Tarifa valle de 3500 en horario 10:00-18:00 los días de semana
- Tarifa normal de 5000 fuera de estos horarios

### Paso 1: Crear ventanas de tiempo

```bash
# Ventana para horario punta - Lunes
curl -X POST http://localhost:3000/payment-toll-gate/time-windows \
  -H "Content-Type: application/json" \
  -d '{
    "from": "07:00",
    "to": "09:00",
    "dayType": "MONDAY",
    "paymentCategoryId": 2
  }'
# Respuesta: {"id": 1, ...}

# Ventana para horario valle - Lunes
curl -X POST http://localhost:3000/payment-toll-gate/time-windows \
  -H "Content-Type: application/json" \
  -d '{
    "from": "10:00",
    "to": "18:00",
    "dayType": "MONDAY",
    "paymentCategoryId": 3
  }'
# Respuesta: {"id": 2, ...}

# Repetir para los demás días de la semana...
```

### Paso 2: Asignar valores de pago

```bash
curl -X POST http://localhost:3000/payment-toll-gate/entry-to-exit/1/payment-values \
  -H "Content-Type: application/json" \
  -d '{
    "paymentValues": [
      {
        "paymentCategoryId": 1,
        "value": 5000,
        "vehicleCategoryIds": [1, 2]
      },
      {
        "paymentCategoryId": 2,
        "value": 7500,
        "vehicleCategoryIds": [1, 2]
      },
      {
        "paymentCategoryId": 3,
        "value": 3500,
        "vehicleCategoryIds": [1, 2]
      }
    ]
  }'
```

### Paso 3: Asignar ventanas de tiempo

```bash
curl -X POST http://localhost:3000/payment-toll-gate/entry-to-exit/1/time-windows \
  -H "Content-Type: application/json" \
  -d '{
    "timeWindows": [
      {"paymentCategoryTimeWindowId": 1},
      {"paymentCategoryTimeWindowId": 2}
    ]
  }'
```

### Paso 4: Verificar configuración

```bash
curl -X GET http://localhost:3000/payment-toll-gate/entry-to-exit/1
```

---

## Códigos de Error

| Código HTTP | Descripción |
|-------------|-------------|
| 200 | Operación exitosa |
| 400 | Request inválido (datos mal formados) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

### Ejemplos de Errores

**EntryToExitTollGate no encontrado:**
```json
{
  "statusCode": 500,
  "message": "EntryToExitTollGate with id 999 not found"
}
```

**PaymentCategoryTimeWindow no encontrado:**
```json
{
  "statusCode": 500,
  "message": "PaymentCategoryTimeWindow with id 999 not found"
}
```

**Ventana de tiempo duplicada:**
```json
{
  "statusCode": 500,
  "message": "Ya existe una ventana de tiempo para esta combinación: 07:00-09:00, categoría 2, día MONDAY"
}
```

---

## Notas Técnicas

### Soft Delete
Todas las operaciones de eliminación utilizan "soft delete", lo que significa que:
- Los registros no se eliminan físicamente de la base de datos
- Se marca el campo `deletedAt` con la fecha/hora de eliminación
- Los registros eliminados no aparecen en las consultas (filtrados por `deletedAt: null`)
- Se mantiene el historial completo para auditoría

### Reutilización de TimeWindows
El sistema reutiliza automáticamente los objetos `TimeWindow` cuando coinciden los horarios:
- Si existe un TimeWindow con "07:00-09:00", se reutiliza
- Esto optimiza el almacenamiento y facilita cambios globales de horarios

### Validación de Duplicados
El sistema previene automáticamente:
- Valores de pago duplicados para la misma combinación de categoría de pago + categorías de vehículos
- Ventanas de tiempo duplicadas para la misma relación entry-to-exit

### Actualización Automática
Al enviar un valor de pago que ya existe (misma categoría de pago y mismas categorías de vehículos):
- El sistema actualiza el valor existente en lugar de crear uno nuevo
- Esto permite modificar tarifas fácilmente reenviando la configuración completa

---

## Modelos de Datos

### TollGate (Pórticos Individuales)
```typescript
{
  id: number;
  name: string;
  portico: string;
  isEntryorExit: "ENTRY" | "EXIT" | "COMMON";
  latitude: number;
  longitude: number;
  // ❌ ENTRY/EXIT: NO tienen paymentValues propios
  // ✅ COMMON: SÍ tienen paymentValues[] (tabla PaymentValue)
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### EntryToExitTollGate (Relaciones Entrada-Salida)
```typescript
{
  id: number;
  entryTollGateId: number;  // Referencia a TollGate con isEntryorExit: "ENTRY"
  exitTollGateId: number;   // Referencia a TollGate con isEntryorExit: "EXIT"
  // ✅ SÍ tiene: entryToExitPaymentValues[] (tabla EntryToExitPaymentValue)
  // ✅ SÍ tiene: entryToExitTimeWindows[] (tabla EntryToExitTollGateTimeWindow)
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### EntryToExitPaymentValue (Valores de Pago para Relaciones)
```typescript
{
  id: number;
  value: number;
  paymentCategoryId: number;
  entryToExitTollGateId: number;  // Referencia a EntryToExitTollGate
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### PaymentValue (Valores de Pago para Pórticos Comunes)
```typescript
{
  id: number;
  value: number;
  paymentCategoryId: number;
  tollGateId: number;  // Referencia a TollGate con isEntryorExit: "COMMON"
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### EntryToExitTollGateTimeWindow
```typescript
{
  id: number;
  entryToExitTollGateId: number;
  paymentCategoryTimeWindowId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### PaymentCategory
```typescript
{
  id: number;
  name: string; // "TBFP", "TBP", "TBV"
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### VehicleCategory
```typescript
{
  id: number;
  name: string;
  abbreviation: string; // "C1", "C2", etc.
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### DayType (Enum)
```typescript
enum DayType {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  HOLIDAY = "HOLIDAY",
  ALL_DAYS = "ALL_DAYS"
}
```

---

## Arquitectura del Sistema

### Servicios
- **EntryToExitConfigurationService**: Gestiona la configuración de valores y ventanas de tiempo para relaciones entry-to-exit
  - `getBasicConfigurationsByEntryTollGate()`: Consulta eficiente solo con información básica
  - `getPaymentValuesByConfiguration()`: Consulta específica de valores de pago
  - `getTimeWindowsByConfiguration()`: Consulta específica de ventanas de tiempo
- **PaymentConfigurationService**: Gestiona la configuración compartida de ventanas de tiempo y categorías
- **EntryToExitPaymentService**: Calcula los pagos considerando ventanas de tiempo
- **EntryToExitTollGateService**: Maneja la caché y consultas optimizadas de relaciones entry-to-exit

### Controladores
- **PaymentTollGateController**: Expone todos los endpoints REST de configuración con arquitectura granular
  - Endpoints básicos para listados eficientes
  - Endpoints específicos para información detallada
  - Endpoints completos para administración

### DTOs
Todos los DTOs reutilizan clases base para mantener consistencia:
- `AssignEntryToExitPaymentValuesDto` extiende `PaymentValueDto`
- `AssignEntryToExitTimeWindowsDto` extiende `TimeWindowDto`

---

## Versión
**Versión de la API:** 1.0.0  
**Última actualización:** 10 de Octubre, 2025

---

## Contacto y Soporte
Para dudas o soporte sobre esta API, consulta la documentación técnica del proyecto o contacta al equipo de desarrollo.

