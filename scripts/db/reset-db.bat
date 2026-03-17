@echo off
pushd %~dp0
echo Reiniciando la base de datos...
docker compose -f ../../docker-compose.yml down -v
docker compose -f ../../docker-compose.yml up -d
echo Esperando a que la base de datos este lista...
timeout /t 10 /nobreak
call apply-schema.bat
call apply-seed.bat
echo Reset completado.
popd
pause