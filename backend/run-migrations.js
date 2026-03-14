const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de conexión
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'lovelace',
  password: 'lovelace',
  database: 'lovelace',
});

// Scripts a ejecutar en orden - Usa el esquema real de la BD
const scripts = [
  '../estructura_lovelace.sql',
];

async function cleanSql(sql) {
  // Remove psql-specific commands like \restrict, \connect, etc.
  return sql
    .split('\n')
    .filter(line => !line.trim().startsWith('\\'))
    .join('\n');
}

async function runMigrations() {
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    for (const scriptPath of scripts) {
      const fullPath = path.join(__dirname, scriptPath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Archivo no encontrado: ${scriptPath}`);
        continue;
      }

      let sql = fs.readFileSync(fullPath, 'utf8');
      sql = await cleanSql(sql);
      const scriptName = path.basename(fullPath);
      
      try {
        console.log(`⏳ Ejecutando ${scriptName}...`);
        await client.query(sql);
        console.log(`✅ ${scriptName} completado\n`);
      } catch (err) {
        console.error(`❌ Error en ${scriptName}:`);
        console.error(err.message);
        console.log('');
      }
    }

    console.log('🎉 Migraciones completadas');
    console.log('\n📋 Usuarios creados:');
    console.log('  - admin@lovelace.edu (SUPERADMIN)');
    console.log('  - carlos.ruiz@lovelace.edu (ADMIN)');
    console.log('  - maria.garcia@lovelace.edu (USER)');
    
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
