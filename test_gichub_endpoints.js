#!/usr/bin/env node

/**
 * Script de prueba para verificar que los endpoints de gichub 
 * estén disponibles en http://192.168.100.184:3002/api/gichub/
 */

const config = require('./config');

// Configuración de prueba
const BASE_URL = 'http://192.168.100.184:3002';
const API_KEY = config.SECRET_KEY;

// Lista de endpoints a verificar
const GICHUB_ENDPOINTS = [
  'gichubUpload',
  'gichubMove', 
  'gichubList',
  'gichubDelete'
];

console.log('🔍 Verificando endpoints de gichub...');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`🔑 API Key: ${API_KEY}`);
console.log('');

// Función para hacer una petición de prueba
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}/api/gichub/${endpoint}`;
  
  try {
    // Usamos fetch si está disponible (Node 18+) o require('http')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': API_KEY
      },
      body: JSON.stringify({
        // Datos de prueba mínimos para evitar errores de validación
        inFolder: 'test',
        toFilename: 'test.txt'
      })
    });

    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 200) {
      console.log(`✅ ${endpoint}: ${url} - OK (${status})`);
    } else {
      console.log(`⚠️  ${endpoint}: ${url} - ${status} ${statusText}`);
    }
    
    return { endpoint, url, status, ok: status === 200 };
  } catch (error) {
    console.log(`❌ ${endpoint}: ${url} - ERROR: ${error.message}`);
    return { endpoint, url, status: 'ERROR', ok: false, error: error.message };
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de endpoints...\n');
  
  const results = [];
  
  for (const endpoint of GICHUB_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Pequeña pausa entre peticiones
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Resumen de resultados:');
  console.log('========================');
  
  const successful = results.filter(r => r.ok).length;
  const total = results.length;
  
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 ¡Todos los endpoints están funcionando correctamente!');
    console.log(`📍 Los endpoints de gichub están disponibles en: ${BASE_URL}/api/gichub/`);
  } else {
    console.log('\n⚠️  Algunos endpoints presentan problemas.');
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en el puerto 3002');
  }
}

// Verificar si fetch está disponible (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ con fetch nativo');
  console.log('💡 Alternativamente, puedes probar los endpoints manualmente:');
  console.log('');
  
  GICHUB_ENDPOINTS.forEach(endpoint => {
    console.log(`curl -X POST "${BASE_URL}/api/gichub/${endpoint}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "key: ${API_KEY}" \\`);
    console.log(`  -d '{"inFolder":"test","toFilename":"test.txt"}'`);
    console.log('');
  });
  
  process.exit(1);
}

// Ejecutar las pruebas
main().catch(console.error);