import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const logsDir = './logs';
if (!existsSync(logsDir)) mkdirSync(logsDir);

const CONTAINERS = {
  db: 'lovelace_db',
  backend: 'lovelace_back',
};

// ── Obtener logs de un contenedor ─────────────────────────────────────────────
function fetchLogs(containerName, lines = 200) {
  try {
    return execSync(
      `docker logs ${containerName} --timestamps --tail ${lines} 2>&1`,
      { encoding: 'utf8' }
    );
  } catch (err) {
    return err.stdout?.toString() || err.message;
  }
}

// ── Parsear timestamp ISO al inicio de la línea (docker --timestamps) ─────────
function parseTimestamp(line) {
  const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s/);
  return match ? new Date(match[1]).getTime() : 0;
}

// ── Etiquetar y parsear cada línea ────────────────────────────────────────────
function tagLines(raw, label) {
  return raw
    .split('\n')
    .filter(l => l.trim())
    .map(line => ({ ts: parseTimestamp(line), label, line }));
}

// ── Recoger logs ──────────────────────────────────────────────────────────────
console.log('Recogiendo logs...');
const rawDb = fetchLogs(CONTAINERS.db);
const rawBackend = fetchLogs(CONTAINERS.backend);

// ── Mezclar y ordenar por timestamp ──────────────────────────────────────────
const merged = [
  ...tagLines(rawDb, '[DB     ]'),
  ...tagLines(rawBackend, '[BACKEND]'),
].sort((a, b) => a.ts - b.ts);

// ── Formatear salida ──────────────────────────────────────────────────────────
const output = merged
  .map(({ label, line }) => `${label} ${line}`)
  .join('\n');

// ── Separar sección de errores/warnings ──────────────────────────────────────
const issues = merged
  .filter(({ line }) => /error|warn|fatal|exception/i.test(line))
  .map(({ label, line }) => `${label} ${line}`)
  .join('\n');

const separator = '\n\n' + '='.repeat(80) + '\n⚠️  ERRORES Y WARNINGS\n' + '='.repeat(80) + '\n\n';

const finalOutput = output + separator + (issues || '(ninguno)');

// ── Guardar ───────────────────────────────────────────────────────────────────
const filePath = `${logsDir}/all_logs.txt`;
writeFileSync(filePath, finalOutput, 'utf8');
console.log(`✅ Logs guardados en ${filePath}`);
console.log(`   Total líneas: ${merged.length}`);
console.log(`   Errores/Warnings: ${issues.split('\n').filter(Boolean).length}`);
