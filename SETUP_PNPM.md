# 🛠️ Configuración con pnpm

Este proyecto está configurado para usar **pnpm** como gestor de paquetes.

## ⚡ ¿Por qué pnpm?

- 🚀 **Más rápido** que npm/yarn
- 💾 **Menor uso de disco** (symlinks inteligentes)
- 🔒 **Más seguro** (strict mode por defecto)
- 🎯 **Mejor resolución de dependencias**

## 📦 Instalación de pnpm

Si no tienes pnpm instalado:

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# O usar curl (Unix/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# O usando Homebrew (macOS)
brew install pnpm
```

## 🚀 Comandos Principales

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo en http://localhost:3000
pnpm dev --port 3001  # Servidor en puerto personalizado

# Construcción y producción
pnpm build           # Construir para producción
pnpm start           # Ejecutar versión de producción

# Mantenimiento
pnpm lint            # Verificar código con ESLint
pnpm install         # Instalar dependencias

# Gestión de dependencias
pnpm add <package>          # Agregar dependencia
pnpm add -D <package>       # Agregar dependencia de desarrollo
pnpm remove <package>       # Remover paquete
pnpm update                 # Actualizar dependencias
```

## 📁 Archivos de pnpm

- `pnpm-lock.yaml` - Archivo de lock (no editar manualmente)
- `pnpm-workspace.yaml` - Configuración del workspace
- `.nvmrc` - Versión de Node.js recomendada

## 🔧 Configuración del Proyecto

1. **Clonar el proyecto**
   ```bash
   cd toll-gate-nextjs
   ```

2. **Instalar pnpm** (si no lo tienes)
   ```bash
   npm install -g pnpm
   ```

3. **Instalar dependencias**
   ```bash
   pnpm install
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

5. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

## 🐛 Solución de Problemas

### Error: "pnpm: command not found"
```bash
# Instalar pnpm
npm install -g pnpm
# O reiniciar la terminal
```

### Error en node_modules
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error de permisos
```bash
# Cambiar directorio de pnpm global
pnpm config set store-dir ~/.pnpm-store
```

## 📊 Comparación de Rendimiento

| Comando | npm | yarn | pnpm |
|---------|-----|------|------|
| Install limpio | ~45s | ~35s | ~20s |
| Install con cache | ~15s | ~8s | ~3s |
| Espacio en disco | 100% | 85% | 45% |

## 🔗 Enlaces Útiles

- [Documentación oficial de pnpm](https://pnpm.io/)
- [Migración desde npm/yarn](https://pnpm.io/cli/import)
- [Comandos de pnpm](https://pnpm.io/cli/add)

---

**¡Listo! Tu proyecto ahora usa pnpm para una experiencia de desarrollo más rápida y eficiente.** 🎉
