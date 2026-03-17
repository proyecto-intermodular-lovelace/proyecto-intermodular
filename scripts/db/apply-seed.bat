@echo off
pushd %~dp0
echo Aplicando seed...
docker exec -i lovelace_db psql -U lovelace -d lovelace < 003_seed.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 006_seed_suppliers.sql
echo Seed aplicado.
popd
pause