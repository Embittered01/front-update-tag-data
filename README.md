# 🛣️ Toll Gate Manager - Next.js

Sistema de gestión de toll gates (peajes) construido con **Next.js**, **React**, **TypeScript** y **Tailwind CSS**.

## 🚀 Características

- ✅ **Next.js 15** con App Router
- ✅ **TypeScript** para tipado estático
- ✅ **Tailwind CSS** para estilos
- ✅ **Font Awesome** para iconos
- ✅ **Arquitectura modular** siguiendo principios SOLID
- ✅ **Hooks personalizados** para manejo de estado
- ✅ **Servicios separados** para API y autenticación
- ✅ **Componentes reutilizables**
- ✅ **Sistema de autenticación** con persistencia de sesión
- ✅ **Gestión completa** de toll gates, pagos y horarios

## 🏗️ Estructura del Proyecto

```
toll-gate-nextjs/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   └── LoginPage.tsx      # Página de login
│   ├── constants/             # Constantes y configuración
│   │   └── index.ts
│   ├── contexts/              # Contextos de React
│   │   └── AppContext.tsx     # Contexto principal
│   ├── hooks/                 # Hooks personalizados
│   │   └── index.ts
│   ├── lib/                   # Librerías y configuraciones
│   │   └── fontawesome.ts     # Configuración Font Awesome
│   ├── services/              # Servicios
│   │   ├── api.ts             # Servicios API
│   │   └── auth.ts            # Servicio de autenticación
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   └── utils/                 # Funciones utilitarias
│       └── index.ts
├── .env.example               # Variables de entorno
├── next.config.ts             # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
└── tsconfig.json              # Configuración TypeScript
```

## 🛠️ Instalación y Configuración

### Prerequisitos

- Node.js (v18 o superior)
- pnpm (recomendado) - `npm install -g pnpm`
- API Backend corriendo en `http://localhost:3010`

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd toll-gate-nextjs
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3010/api
   ```

4. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

## 🏭 Construcción para Producción

```bash
# Construir la aplicación
pnpm build

# Ejecutar en producción
pnpm start
```

## 📚 Módulos Principales

### 🔐 Autenticación (`src/services/auth.ts`)
- Login/logout de usuarios
- Persistencia de sesiones con localStorage
- Gestión automática de tokens
- Listeners para cambios de estado

### 🌐 Servicios API (`src/services/api.ts`)
- Comunicación con backend REST
- Servicios organizados por entidad
- Manejo automático de headers de autenticación
- Manejo de errores centralizado

### 🎣 Hooks Personalizados (`src/hooks/index.ts`)
- `useMessages`: Gestión de mensajes del sistema
- `useLoading`: Estados de carga
- `useReferenceData`: Datos de referencia
- `useTollGateSelection`: Selección y configuración
- `useFilters`: Filtros y búsqueda

### 🎨 Componentes
- **LoginPage**: Página de autenticación
- **Dashboard**: Panel principal de administración
- **AppContext**: Proveedor de contexto global

## 🔧 Tecnologías

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 15.x | Framework React |
| React | 18.x | Librería de UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Framework CSS |
| Font Awesome | 6.x | Iconos |

## 🎯 Principios SOLID Aplicados

| Principio | ✅ Implementación |
|-----------|------------------|
| **S**ingle Responsibility | Cada módulo tiene una responsabilidad específica |
| **O**pen/Closed | Módulos extensibles sin modificar código existente |
| **L**iskov Substitution | Componentes y servicios intercambiables |
| **I**nterface Segregation | Interfaces específicas sin dependencias innecesarias |
| **D**ependency Inversion | Alto nivel no depende de bajo nivel |

## 📱 Funcionalidades

### ✅ Implementadas
- Sistema de autenticación completo
- Dashboard principal con navegación
- Arquitectura modular con TypeScript
- Configuración de estilos y temas
- Hooks de estado personalizados
- Servicios API estructurados

### 🚧 En Desarrollo
- Lista y gestión de toll gates
- Configuración de valores de pago
- Gestión de ventanas de tiempo
- Formularios CRUD completos
- Sistema de filtros avanzados

## 🚀 Scripts Disponibles

```bash
pnpm dev           # Desarrollo
pnpm build         # Construcción
pnpm start         # Producción
pnpm lint          # Linting
pnpm type-check    # Verificación de tipos
```

## 🔗 API Requirements

La aplicación requiere un backend REST con los siguientes endpoints:

- `POST /api/auth/login` - Autenticación
- `GET /api/toll-gates` - Lista de toll gates
- `GET /api/payment-categories` - Categorías de pago
- `GET /api/vehicle-categories` - Categorías de vehículos
- `GET /api/time-windows` - Ventanas de tiempo
- `GET /api/concessionaires` - Concesionarios

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'feat: nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**© 2025 Toll Gate Manager - Arquitectura Modular con Next.js y TypeScript** 🏗️