@echo off 
docker exec -i lovelace_db psql -U lovelace -d lovelace < 001_init.sql
docker exec -i lovelace_db psql -U lovelace -d lovelace < 007_recipes.sql
pause