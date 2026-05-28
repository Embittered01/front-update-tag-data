# Implementación de Entry-to-Exit Configuration

## Resumen

Se ha implementado completamente la funcionalidad para configurar valores de pago y ventanas de tiempo para relaciones entrada-salida (entry-to-exit) de pórticos de peaje.

**⚠️ IMPORTANTE:** Los pórticos de tipo ENTRY (entrada) o EXIT (salida) NO se configuran directamente con valores de pago o ventanas de tiempo. La configuración se realiza ÚNICAMENTE en las relaciones entry-to-exit (entrada→salida). Solo los pórticos de tipo BOTH u otro tipo pueden tener configuración directa.

## Archivos Modificados

### 1. Tipos (`src/types/index.ts`)
**Nuevos tipos agregados:**
- `EntryToExitTollGate`: Representa la relación entre un pórtico de entrada y uno de salida
- `EntryToExitPaymentValue`: Valor de pago específico para una relación entry-to-exit
- `EntryToExitVehicleCategory`: Categoría de vehículo asociada a un valor de pago entry-to-exit
- `EntryToExitTimeWindow`: Ventana de tiempo asignada a una relación entry-to-exit

### 2. Constantes (`src/constants/index.ts`)
**Nuevos endpoints agregados:**
```typescript
ENTRY_TO_EXIT: {
  BASE: '/payment-toll-gate/entry-to-exit',
  BY_ENTRY: '/payment-toll-gate/entry-to-exit/entry-toll-gate',
  PAYMENT_VALUES: '/payment-toll-gate/entry-to-exit',
  TIME_WINDOWS: '/payment-toll-gate/entry-to-exit'
}
```

### 3. Servicios API (`src/services/api.ts`)
**Nueva clase de servicio:**
- `EntryToExitService`: Maneja todas las operaciones de API para entry-to-exit
  - `getEntryToExitRelations()`: Obtiene todas las relaciones de un pórtico de entrada
  - `getEntryToExitConfig()`: Obtiene la configuración de una relación específica
  - `assignPaymentValues()`: Asigna valores de pago a una relación
  - `assignTimeWindows()`: Asigna ventanas de tiempo a una relación
  - `deletePaymentValue()`: Elimina un valor de pago
  - `deleteTimeWindow()`: Elimina una ventana de tiempo

### 4. Componentes Nuevos

#### `ExitTollGatesSection.tsx`
- Muestra la lista de pórticos de salida asignados a un pórtico de entrada
- Solo se renderiza cuando el pórtico seleccionado es de tipo "ENTRY"
- Muestra el estado de cada relación (Configurado, Parcialmente configurado, Sin configurar)
- Permite expandir/colapsar cada pórtico de salida para configurarlo
- Implementa un acordeón donde solo una relación puede estar expandida a la vez

#### `EntryToExitConfig.tsx`
- Componente contenedor para la configuración expandida de una relación
- Muestra información de la relación (entrada → salida, ID)
- Integra los componentes de valores de pago y ventanas de tiempo
- Maneja el guardado de la configuración completa
- Muestra botones de guardar/cancelar solo cuando hay cambios pendientes

#### `EntryToExitPaymentValues.tsx`
- Maneja la visualización y edición de valores de pago para una relación entry-to-exit
- Separa valores existentes de valores nuevos (pendientes de guardar)
- Permite agregar nuevos valores con formulario inline
- Permite eliminar valores existentes
- Carga dinámicamente las categorías de pago y vehículos

#### `EntryToExitTimeWindows.tsx`
- Maneja la visualización y asignación de ventanas de tiempo para una relación entry-to-exit
- Separa ventanas existentes de ventanas nuevas (pendientes de guardar)
- Usa un mini-modal para seleccionar ventanas de la lista disponible
- Permite eliminar ventanas existentes
- Formatea correctamente los horarios que cruzan medianoche

## Lógica de Configuración

### Tipos de Pórticos y su Configuración

#### Pórticos de ENTRADA (ENTRY)
- ✅ Se muestran sus pórticos de salida asignados
- ✅ Se configura cada relación entrada→salida individualmente
- ❌ NO se configuran valores de pago directamente
- ❌ NO se configuran ventanas de tiempo directamente

#### Pórticos de SALIDA (EXIT)
- ℹ️ Se muestra mensaje informativo
- ❌ NO se configuran valores de pago directamente
- ❌ NO se configuran ventanas de tiempo directamente
- 💡 Su configuración se hace desde el pórtico de entrada

#### Pórticos de tipo BOTH u otros
- ✅ Se configuran valores de pago directamente
- ✅ Se configuran ventanas de tiempo directamente
- ✅ Usan las secciones tradicionales de configuración

## Flujo de Usuario

### 1. Seleccionar Pórtico de Entrada
```
Usuario selecciona un pórtico de tipo "ENTRY" en la lista principal
↓
Se muestra la sección "Pórticos de Salida Asignados"
↓
Se cargan automáticamente las relaciones entry-to-exit desde la API
```

### 2. Expandir Configuración de un Pórtico de Salida
```
Usuario hace clic en un pórtico de salida
↓
Se expande la sección mostrando:
  - Información de la relación (Entrada → Salida, ID)
  - Valores de pago existentes y nuevos
  - Ventanas de tiempo existentes y nuevas
↓
Los otros pórticos de salida se colapsan automáticamente (acordeón)
```

### 3. Agregar Valores de Pago
```
Usuario hace clic en "Agregar Valor"
↓
Se muestra formulario inline con:
  - Categoría de Pago (dropdown)
  - Valor (input numérico)
  - Categorías de Vehículos (checkboxes opcionales)
↓
Usuario completa el formulario y hace clic en "Agregar"
↓
El valor se agrega a la lista de "Nuevos Valores (sin guardar)"
```

### 4. Asignar Ventanas de Tiempo
```
Usuario hace clic en "Asignar Ventanas"
↓
Se abre un mini-modal con la lista de ventanas disponibles
↓
Usuario selecciona una o más ventanas (checkboxes)
↓
Usuario hace clic en "Asignar X ventana(s)"
↓
Las ventanas se agregan a la lista de "Nuevas Ventanas (sin guardar)"
```

### 5. Guardar Configuración
```
Usuario revisa los cambios pendientes
↓
Usuario hace clic en "Guardar Configuración"
↓
Se envían las peticiones a la API:
  - POST /payment-toll-gate/entry-to-exit/{id}/payment-values
  - POST /payment-toll-gate/entry-to-exit/{id}/time-windows
↓
Se recarga la configuración de la relación
↓
Se limpian los formularios
```

## Endpoints de API Utilizados

### Obtener Relaciones Entry-to-Exit
```
GET /payment-toll-gate/entry-to-exit/entry-toll-gate/{entryTollGateId}
```
Retorna todas las relaciones entrada-salida para un pórtico de entrada específico.

### Asignar Valores de Pago
```
POST /payment-toll-gate/entry-to-exit/{entryToExitId}/payment-values

Body:
{
  "paymentValues": [
    {
      "paymentCategoryId": 1,
      "value": 5000,
      "vehicleCategoryIds": [1, 2]
    }
  ]
}
```

### Asignar Ventanas de Tiempo
```
POST /payment-toll-gate/entry-to-exit/{entryToExitId}/time-windows

Body:
{
  "timeWindows": [
    {"paymentCategoryTimeWindowId": 1},
    {"paymentCategoryTimeWindowId": 2}
  ]
}
```

### Eliminar Valor de Pago
```
DELETE /payment-toll-gate/entry-to-exit/{entryToExitId}/payment-values/{paymentValueId}
```

### Eliminar Ventana de Tiempo
```
DELETE /payment-toll-gate/entry-to-exit/{entryToExitId}/time-windows/{timeWindowId}
```

## Cómo Probar

### Prerrequisitos
1. Backend corriendo en `http://localhost:3010`
2. Base de datos con:
   - Al menos un pórtico de tipo "ENTRY"
   - Al menos un pórtico de tipo "EXIT"
   - Una relación EntryToExitTollGate entre ellos
   - Categorías de pago configuradas
   - Categorías de vehículos configuradas
   - Ventanas de tiempo creadas

### Pasos de Prueba

#### Test 1: Visualizar Relaciones
1. Iniciar la aplicación
2. Seleccionar un pórtico de tipo "ENTRY"
3. Verificar que aparece la sección "Pórticos de Salida Asignados"
4. Verificar que se listan los pórticos de salida correctamente
5. Verificar que cada pórtico muestra su estado (Configurado/Sin configurar)

#### Test 2: Expandir/Colapsar Relación
1. Hacer clic en un pórtico de salida
2. Verificar que se expande mostrando la configuración
3. Verificar que aparece el ícono de "Configurando"
4. Hacer clic en otro pórtico de salida
5. Verificar que el primero se colapsa y el segundo se expande

#### Test 3: Agregar Valores de Pago
1. Expandir un pórtico de salida
2. Hacer clic en "Agregar Valor"
3. Completar el formulario:
   - Seleccionar una categoría de pago
   - Ingresar un valor (ej: 5000)
   - Opcionalmente seleccionar categorías de vehículos
4. Hacer clic en "Agregar"
5. Verificar que el valor aparece en "Nuevos Valores (sin guardar)" con fondo azul
6. Verificar que aparecen los botones "Cancelar Cambios" y "Guardar Configuración"

#### Test 4: Asignar Ventanas de Tiempo
1. Expandir un pórtico de salida (con valores agregados del test anterior)
2. Hacer clic en "Asignar Ventanas"
3. Verificar que se abre el modal con ventanas disponibles
4. Seleccionar una o más ventanas
5. Hacer clic en "Asignar X ventana(s)"
6. Verificar que las ventanas aparecen en "Nuevas Ventanas (sin guardar)" con fondo azul

#### Test 5: Guardar Configuración
1. Con valores y ventanas pendientes de guardar
2. Hacer clic en "Guardar Configuración"
3. Verificar que aparece el mensaje de éxito
4. Verificar que los valores y ventanas ahora aparecen en "Existentes"
5. Verificar que se limpiaron los cambios pendientes
6. Verificar que el estado del pórtico cambió a "Configurado"

#### Test 6: Eliminar Valores/Ventanas Existentes
1. Expandir un pórtico de salida configurado
2. Hacer clic en el ícono de basura de un valor existente
3. Confirmar la eliminación
4. Verificar que se elimina correctamente
5. Repetir para una ventana de tiempo existente

#### Test 7: Cancelar Cambios
1. Expandir un pórtico de salida
2. Agregar valores y ventanas
3. Hacer clic en "Cancelar Cambios"
4. Verificar que se limpian todos los cambios pendientes
5. Verificar que desaparecen los botones de acción

## Estados Visuales

### Pórtico de Salida Configurado
- Badge verde con ícono de check
- Muestra contador: "X valores • Y ventanas"
- Estado: "Configurado"

### Pórtico de Salida Sin Configurar
- Badge amarillo con ícono de advertencia
- Estado: "Sin configurar"
- Mensaje: "Haz clic para configurar"

### Pórtico de Salida Configurando (Expandido)
- Fondo azul claro
- Borde izquierdo azul
- Badge azul: "Configurando"
- Ícono chevron hacia abajo

### Valores/Ventanas Existentes
- Fondo blanco
- Borde gris
- Título: "Existentes:"

### Valores/Ventanas Nuevos (Pendientes)
- Fondo azul claro
- Borde azul
- Título: "Nuevos (sin guardar):"

## Mejoras Futuras

1. **Actualización en tiempo real**: En lugar de `window.location.reload()`, actualizar el estado local
2. **Validaciones**: Agregar validaciones más robustas antes de guardar
3. **Confirmaciones**: Modales de confirmación más elegantes en lugar de `alert()`
4. **Edición inline**: Permitir editar valores existentes sin eliminarlos
5. **Búsqueda/filtrado**: Para listas grandes de ventanas de tiempo
6. **Bulk actions**: Asignar las mismas configuraciones a múltiples relaciones
7. **Preview**: Vista previa de los cambios antes de guardar
8. **Historial**: Ver historial de cambios en la configuración

## Notas Técnicas

- Todos los componentes usan TypeScript con tipos estrictos
- Se implementó el patrón de componentes controlados
- Los estados de carga se manejan con flags boolean y spinners
- Los errores se capturan y se muestran al usuario
- Los logs de consola ayudan en el debugging
- Se siguieron los principios SOLID en el diseño
- Todos los métodos del servicio API son reutilizables
- La UI es responsive y usa Tailwind CSS
- No se usan modales secundarios, todo es visible en la misma página

## Dependencias

- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Font Awesome 6+
- Next.js 14+

## Soporte

Para dudas o problemas con esta funcionalidad:
1. Revisar los logs de consola del navegador
2. Verificar que el backend esté corriendo correctamente
3. Verificar que existan los datos necesarios en la base de datos
4. Revisar la documentación de la API en `docs/entry-to-exit-payment.md`


