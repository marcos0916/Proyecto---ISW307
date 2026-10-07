// jeep-sqlite (SQLite en el navegador) necesita este .wasm servido como asset estático.
// Se copia desde sql.js (dependencia de jeep-sqlite) a src/assets en cada install/build
// para no depender de que alguien lo copie a mano.
const fs = require('fs');
const path = require('path');

const origen = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const destinoDir = path.join(__dirname, '..', 'src', 'assets');
const destino = path.join(destinoDir, 'sql-wasm.wasm');

if (!fs.existsSync(origen)) {
  console.warn('[copy-sqlite-wasm] No se encontró sql-wasm.wasm en node_modules/sql.js/dist. ¿Está instalado jeep-sqlite?');
  process.exit(0);
}

fs.mkdirSync(destinoDir, { recursive: true });
fs.copyFileSync(origen, destino);
console.log('[copy-sqlite-wasm] sql-wasm.wasm copiado a src/assets/');
