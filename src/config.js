import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Vercel entegrasyonu değişkenlere özel ön ek koyabiliyor (TURSO_DATABASE_URL, STORAGE_URL…).
 * Değeri libsql:// ile başlayan ilk *_URL değişkenini ve aynı ön ekli token'ı bulur.
 */
function findRemoteDb(env) {
  if (env.TURSO_DATABASE_URL) return { url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN };

  const urlKey = Object.keys(env).find((k) => k.endsWith('_URL') && /^libsql:\/\//.test(env[k] || ''));
  if (!urlKey) return null;

  const prefix = urlKey.slice(0, -'_URL'.length);
  const tokenKey = [`${prefix}_AUTH_TOKEN`, `${prefix}_TOKEN`].find((k) => env[k])
    || Object.keys(env).find((k) => k.endsWith('_AUTH_TOKEN'));
  return { url: env[urlKey], authToken: tokenKey ? env[tokenKey] : undefined };
}

const remoteDb = findRemoteDb(process.env);

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),

  // Vercel'de Turso (Marketplace) bu iki değişkeni otomatik ekler.
  // Yerelde ayarlı değilse data/magaza.db dosyası kullanılır.
  db: remoteDb ?? { url: `file:${path.join(rootDir, 'data', 'magaza.db')}` },
  hasRemoteDb: Boolean(remoteDb),

  // Boş bırakılırsa giriş ekranı kapalıdır (sadece yerelde böyle kullan).
  appPassword: process.env.APP_PASSWORD || '',

  publicDir: path.join(rootDir, 'public'),

  // Şube adları ilk çalıştırmada veritabanına yazılır.
  // Sonradan değiştirmek için uygulamadaki "Şube adları" ekranını kullan.
  branches: ['1. Şube', '2. Şube'],
};
