# Guía de Configuración de Pórticos

## 🎯 Regla Principal

**Los valores de pago y ventanas de tiempo SOLO se configuran en las relaciones entrada-salida (entry-to-exit), NO en los pórticos individuales de tipo ENTRY o EXIT.**

---

## 📋 Tipos de Pórticos y su Configuración

### 1️⃣ Pórtico de ENTRADA (ENTRY)

#### ¿Qué se muestra?
- ✅ Lista de pórticos de salida asignados
- ✅ Estado de configuración de cada relación
- ✅ Opción para expandir y configurar cada relación

#### ¿Qué NO se muestra?
- ❌ Sección de "Valores de Pago" directa
- ❌ Sección de "Ventanas de Tiempo" directa
- ❌ Botón "Guardar Configuración" global

#### Flujo de Configuración
```
1. Seleccionar pórtico de ENTRADA
   ↓
2. Ver lista de pórticos de SALIDA asignados
   ↓
3. Hacer clic en un pórtico de SALIDA
   ↓
4. Configurar valores y ventanas para ESA relación específica
   ↓
5. Guardar configuración de la relación
```

---

### 2️⃣ Pórtico de SALIDA (EXIT)

#### ¿Qué se muestra?
- ℹ️ Mensaje informativo explicativo
- 📝 Instrucciones para configurar desde el pórtico de entrada

#### ¿Qué NO se muestra?
- ❌ Sección de "Valores de Pago"
- ❌ Sección de "Ventanas de Tiempo"
- ❌ Sección de pórticos relacionados

#### Mensaje Mostrado
```
"Los pórticos de salida no se configuran directamente. 
Su configuración de valores de pago y ventanas de tiempo 
se realiza desde el pórtico de entrada correspondiente, 
en la relación entrada→salida.

Para configurar este pórtico, selecciona el pórtico 
de entrada asociado."
```

---

### 3️⃣ Pórtico de tipo BOTH u otro tipo

#### ¿Qué se muestra?
- ✅ Sección de "Valores de Pago" tradicional
- ✅ Sección de "Ventanas de Tiempo" tradicional
- ✅ Botón "Guardar Configuración" global

#### ¿Qué NO se muestra?
- ❌ Sección de pórticos de salida

#### Flujo de Configuración
```
1. Seleccionar pórtico de tipo BOTH
   ↓
2. Agregar valores de pago
   ↓
3. Asignar ventanas de tiempo
   ↓
4. Guardar configuración global
```

---

## 🔄 Comparación: Antes vs Ahora

### ❌ ANTES (Incorrecto)

```
Pórtico ENTRADA → Configurar valores/ventanas directamente ❌
Pórtico SALIDA  → Configurar valores/ventanas directamente ❌
```

**Problema:** Los pórticos de entrada/salida no deben tener configuración directa.

---

### ✅ AHORA (Correcto)

```
Pórtico ENTRADA → Ver salidas → Configurar relación entrada→salida ✅
Pórtico SALIDA  → Mensaje informativo (configurar desde entrada) ✅
Pórtico BOTH    → Configurar valores/ventanas directamente ✅
```

**Solución:** La configuración se hace en las relaciones, no en los pórticos individuales.

---

## 📊 Estructura de Datos

### Relación Entry-to-Exit

```typescript
{
  id: 1,                    // ID de la relación
  entryTollGateId: 10,      // ID del pórtico de entrada
  exitTollGateId: 15,       // ID del pórtico de salida
  
  // Configuración específica de esta relación
  paymentValues: [...],     // Valores de pago para entrada→salida
  entryToExitTimeWindows: [...] // Ventanas de tiempo para entrada→salida
}
```

### Ejemplo Real

```
Entrada Norte (ID: 10) → Salida Sur (ID: 15)
  Valores:
    - TBFP: $5,000 (C1, C2)
    - TBP:  $7,500 (C1, C2)
  Ventanas:
    - Lunes 07:00-09:00 (TBP)
    - Lunes 10:00-18:00 (TBV)

Entrada Norte (ID: 10) → Salida Este (ID: 16)
  Valores:
    - TBFP: $4,500 (C1, C2)
    - TBP:  $7,000 (C1, C2)
  Ventanas:
    - Lunes 07:00-09:00 (TBP)
```

**Nota:** La misma entrada puede tener diferentes tarifas para diferentes salidas.

---

## 🎨 Estados Visuales

### Pórtico de Entrada Seleccionado
```
┌─────────────────────────────────────────────┐
│ Configuración: Entrada Norte               │
│ Tipo: Entrada                              │
├─────────────────────────────────────────────┤
│                                             │
│ 🚪 Pórticos de Salida Asignados           │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🚪 Salida Sur      ✅ Configurado   │   │
│ │ Pórtico: P-SL-01                    │   │
│ │ 3 valores • 5 ventanas              │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🚪 Salida Este     ⚠️ Sin configurar│   │
│ │ Pórtico: P-SL-02                    │   │
│ │ Haz clic para configurar            │   │
│ └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Pórtico de Salida Seleccionado
```
┌─────────────────────────────────────────────┐
│ Configuración: Salida Sur                  │
│ Tipo: Salida                               │
├─────────────────────────────────────────────┤
│                                             │
│         ℹ️  Pórtico de Salida              │
│                                             │
│ Los pórticos de salida no se configuran    │
│ directamente. Su configuración se realiza  │
│ desde el pórtico de entrada correspondiente│
│                                             │
│ Para configurar este pórtico, selecciona   │
│ el pórtico de entrada asociado.            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Condicional en Dashboard.tsx

```typescript
// Solo mostrar lista de salidas si es ENTRY
{selectedTollGate.isEntryorExit === 'ENTRY' && (
  <ExitTollGatesSection selectedTollGate={selectedTollGate} />
)}

// Mostrar mensaje informativo si es EXIT
{selectedTollGate.isEntryorExit === 'EXIT' && (
  <div>Mensaje informativo...</div>
)}

// Solo mostrar configuración tradicional si NO es ENTRY ni EXIT
{selectedTollGate.isEntryorExit !== 'ENTRY' && 
 selectedTollGate.isEntryorExit !== 'EXIT' && (
  <>
    <PaymentValuesSection ... />
    <TimeWindowsSection ... />
  </>
)}
```

---

## ✅ Checklist de Verificación

### Para Pórtico de ENTRADA
- [ ] Se muestra sección "Pórticos de Salida Asignados"
- [ ] NO se muestra sección "Valores de Pago" directa
- [ ] NO se muestra sección "Ventanas de Tiempo" directa
- [ ] Se pueden expandir los pórticos de salida
- [ ] Se puede configurar cada relación individualmente

### Para Pórtico de SALIDA
- [ ] Se muestra mensaje informativo
- [ ] NO se muestra sección "Pórticos de Salida Asignados"
- [ ] NO se muestra sección "Valores de Pago"
- [ ] NO se muestra sección "Ventanas de Tiempo"

### Para Pórtico BOTH u otro
- [ ] Se muestra sección "Valores de Pago"
- [ ] Se muestra sección "Ventanas de Tiempo"
- [ ] Se muestra botón "Guardar Configuración"
- [ ] NO se muestra sección "Pórticos de Salida"

---

## 📚 Referencias

- **Documentación de API:** `docs/entry-to-exit-payment.md`
- **Guía de Implementación:** `docs/ENTRY_TO_EXIT_IMPLEMENTATION.md`
- **Diseño Visual:** `docs/entry-exit-ui-design.html`

---

## 💡 Preguntas Frecuentes

### ¿Por qué los pórticos ENTRY/EXIT no se configuran directamente?

Porque en un sistema de peaje con entrada y salida, el cobro se calcula basándose en el RECORRIDO (entrada → salida), no en puntos individuales. Diferentes combinaciones de entrada-salida pueden tener diferentes tarifas.

### ¿Qué pasa con los pórticos de tipo BOTH?

Los pórticos de tipo BOTH pueden funcionar como entrada y salida simultáneamente, por lo que sí tienen configuración directa, ya que pueden procesar transacciones completas por sí mismos.

### ¿Puedo tener diferentes tarifas para la misma entrada con diferentes salidas?

¡Sí! Ese es precisamente el objetivo del sistema entry-to-exit. Cada relación entrada→salida tiene su propia configuración independiente.

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0


