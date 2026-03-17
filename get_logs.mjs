import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const logsDir = './logs';
const logFilePath = `${logsDir}/backend_logs.txt`;

// Comprobamos si el directorio existe; si no, lo creamos
if (!existsSync(logsDir)) {
  mkdirSync(logsDir);
}

try {
  // Añadimos la bandera --no-color para evitar caracteres ANSI de la terminal
  // y convertimos el buffer a string directamente
  const output = execSync('docker compose logs --tail 20 --no-color backend', { encoding: 'utf8' });

  // Limpiamos posibles espacios en blanco extra y aseguramos el formato por línea
  const formattedLogs = output.trim();

  writeFileSync(logFilePath, formattedLogs);
  console.log(`Logs guardados con éxito en ${logFilePath}`);
} catch (err) {
  // En caso de error, capturamos el mensaje de forma estructurada
  const errorMessage = err.message;
  const errorOutput = err.stdout ? err.stdout.toString() : '';

  writeFileSync(logFilePath, `${errorMessage}\n${errorOutput}`);
  console.error(`Error guardando logs. Revisa ${logFilePath}`);
}