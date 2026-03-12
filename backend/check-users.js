const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'lovelace',
  password: 'lovelace',
  database: 'lovelace',
});

async function checkUsers() {
  try {
    console.log('🔌 Conectando a PostgreSQL...\n');
    await client.connect();

    const result = await client.query('SELECT id, email, role, nombre, apellido1, is_active FROM public.users ORDER BY created_at');
    
    if (result.rows.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos.\n');
      console.log('📝 Creando usuarios...\n');
      
      // Crear usuarios
      const insertQuery = `
        INSERT INTO public.users (id, email, password_hash, role, nombre, apellido1, apellido2, is_active)
        VALUES
          (
            '11111111-1111-1111-1111-111111111111',
            'admin@lovelace.edu',
            crypt('SuperAdmin2026!', gen_salt('bf', 10)),
            'SUPERADMIN',
            'Ana',
            'Martínez',
            'López',
            true
          ),
          (
            '22222222-2222-2222-2222-222222222222',
            'carlos.ruiz@lovelace.edu',
            crypt('Admin2026!', gen_salt('bf', 10)),
            'ADMIN',
            'Carlos',
            'Ruiz',
            'Fernández',
            true
          ),
          (
            '33333333-3333-3333-3333-333333333333',
            'maria.garcia@lovelace.edu',
            crypt('Usuario2026!', gen_salt('bf', 10)),
            'USER',
            'María',
            'García',
            'Sánchez',
            true
          )
        ON CONFLICT (email) DO NOTHING;
      `;
      
      await client.query(insertQuery);
      
      const newResult = await client.query('SELECT id, email, role, nombre, apellido1, is_active FROM public.users ORDER BY created_at');
      
      console.log('✅ Usuarios creados exitosamente:\n');
      newResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Nombre: ${user.nombre} ${user.apellido1}`);
        console.log(`   Activo: ${user.is_active ? '✅' : '❌'}\n`);
      });
    } else {
      console.log('✅ Usuarios encontrados en la base de datos:\n');
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Nombre: ${user.nombre} ${user.apellido1}`);
        console.log(`   Activo: ${user.is_active ? '✅' : '❌'}\n`);
      });
    }

    console.log('📊 Estadísticas de la base de datos:');
    
    const tables = ['users', 'products', 'orders', 'suppliers', 'categories', 'inventory'];
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM public.${table}`);
        const count = countResult.rows[0].count;
        console.log(`   ${table}: ${count} registros`);
      } catch (err) {
        console.log(`   ${table}: tabla no existe`);
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUsers();
