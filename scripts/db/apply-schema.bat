@echo off
pushd %~dp0
echo Aplicando scripts de esquema...
docker exec -i lovelace_db psql -U lovelace -d lovelace < 001_init.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 002_suppliers.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 004_fix_suppliers_inventory.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 005_make_supplier_nullable.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 007_create_import_jobs.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 008_recipes.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 009_fix_supplier_encoding.sql
echo Esquema aplicado.
popd
pause