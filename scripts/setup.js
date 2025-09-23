#!/usr/bin/env node

/**
 * Setup script for Toll Gate Manager
 * Configura el entorno de desarrollo
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Toll Gate Manager...\n');

// Verificar si existe .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
    console.log('📄 Copiando .env.example a .env.local...');
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ .env.local creado\n');
} else {
    console.log('ℹ️  .env.local ya existe\n');
}

// Mostrar siguiente paso
console.log('🎉 ¡Configuración completada!\n');
console.log('📋 Próximos pasos:');
console.log('   1. Verifica la configuración en .env.local');
console.log('   2. Asegúrate de que tu API esté corriendo en http://localhost:3010');
console.log('   3. Ejecuta: pnpm dev');
console.log('   4. Abre: http://localhost:3000\n');

console.log('🔧 Scripts disponibles:');
console.log('   pnpm dev      - Servidor de desarrollo');
console.log('   pnpm build    - Construir para producción');
console.log('   pnpm start    - Ejecutar en producción');
console.log('   pnpm lint     - Verificar código\n');
