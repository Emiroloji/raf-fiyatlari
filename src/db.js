import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS branches (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS phones (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id    INTEGER NOT NULL REFERENCES branches(id),
    brand        TEXT    NOT NULL,
    model        TEXT    NOT NULL,
    storage_gb   INTEGER NOT NULL,
    battery      INTEGER,
    warranty     INTEGER NOT NULL DEFAULT 0,
    buy_price    INTEGER NOT NULL,
    sell_price   INTEGER NOT NULL,
    note         TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_phones_branch ON phones(branch_id);
  CREATE INDEX IF NOT EXISTS idx_phones_brand  ON phones(brand);
`;

/** Yerel dosya veritabanı için klasörü oluşturur. */
function ensureLocalDir(url) {
  if (!url.startsWith('file:')) return;
  const target = url.slice('file:'.length);
  const filePath = target.startsWith('/') ? target : fileURLToPath(new URL(url));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/** libSQL satırlarını düz JSON nesnelerine çevirir. */
export const toObjects = ({ columns, rows }) =>
  rows.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])));

/**
 * Veritabanına bağlanır, tabloları oluşturur ve şubeleri ilk kez ekler.
 * @param {{ url: string, authToken?: string }} options  url: 'file:...', ':memory:' veya Turso 'libsql://...'
 * @param {string[]} branchNames
 */
export async function openDatabase({ url, authToken }, branchNames) {
  if (url !== ':memory:') ensureLocalDir(url);

  const db = createClient({ url, authToken });
  await db.executeMultiple(SCHEMA);
  await db.batch(
    branchNames.map((name, i) => ({
      sql: 'INSERT OR IGNORE INTO branches (id, name) VALUES (?, ?)',
      args: [i + 1, name],
    })),
    'write',
  );

  return db;
}
