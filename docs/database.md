Cómo usar los scripts en la ruta `scripts/db/`

Script `apply-schema.bat`:

- Inyecta el archivo SQL de estructura (`001_init.sql`) en la base de datos que corre en Docker

Script `apply-seed.bat`:

- Inyecta el archivo SQL de datos iniciales (`002_seed.sql`) en la base de datos que corre en Docker

Script `apply-suppliers.bat`:

- Inyecta los datos de proveedores (`003_suppliers.sql` + `006_seed_suppliers.sql`)

Script `reset-db.bat`:

- Elimina la base de datos que corre en Docker y la vuelve a crear desde cero (destructivo)

Script `psql.bat`:

- Abre una terminal interactiva para hacer consultas manuales

Se necesita Docker Desktop funcionando para ejecutar los scripts.

---

Scripts SQL disponibles (se ejecutan en orden numérico al iniciar el contenedor por primera vez):

| Fichero | Descripción |
|---|---|
| `001_init.sql` | Esquema completo (tablas, enums, índices) |
| `002_seed.sql` | Datos de prueba: productos, ingredientes y materiales |
| `003_suppliers.sql` | Estructura de proveedores |
| `004_fix_suppliers_inventory.sql` | Correcciones de integridad sobre el inventario de proveedores |
| `005_make_supplier_nullable.sql` | Permite que `supplier_id` en `products` sea nulo |
| `006_seed_suppliers.sql` | Datos de prueba de proveedores adicionales |
| `007_create_import_jobs.sql` | Tabla `import_jobs` para el worker de importación CSV |
| `008_recipes.sql` | Tablas de recetas, ingredientes de recetas y alérgenos |
| `009_fix_supplier_encoding.sql` | Correcciones de codificación UTF-8 en nombres de proveedores |
| `010_inventory_movements.sql` | Enum `inventory_movement_type` y tabla `inventory_movements` |
