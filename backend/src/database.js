import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePath = join(__dirname, '..', 'data', 'db.json');

export async function readDatabase() {
  const rawDatabase = await readFile(databasePath, 'utf8');
  return JSON.parse(rawDatabase);
}

export async function writeDatabase(database) {
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}
