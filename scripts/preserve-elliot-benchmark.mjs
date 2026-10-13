import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Pass the Elliot V1 JSON path as the first argument.');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'reference', 'elliot-v1-benchmark');
const outputPath = path.join(outputDirectory, 'elliot-v1-benchmark.redacted.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function redact(value) {
  if (typeof value === 'string') return value.replaceAll('Dave', 'Learner');
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, redact(nested)]));
  }
  return value;
}

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(redact(source), null, 2)}\n`);
console.log(`Preserved redacted Elliot benchmark at ${path.relative(root, outputPath)}`);
