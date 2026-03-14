@echo off 
docker exec -i lovelace_db psql -U lovelace -d lovelace < 003_seed.sql
pause