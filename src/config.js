import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),

  // Vercel'de Turso (Marketplace) bu iki değişkeni otomatik ekler.
  // Yerelde ayarlı değilse data/magaza.db dosyası kullanılır.
  db: {
    url: process.env.TURSO_DATABASE_URL || `file:${path.join(rootDir, 'data', 'magaza.db')}`,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },

  // Boş bırakılırsa giriş ekranı kapalıdır (sadece yerelde böyle kullan).
  appPassword: process.env.APP_PASSWORD || '',

  publicDir: path.join(rootDir, 'public'),

  // Şube adları ilk çalıştırmada veritabanına yazılır.
  // Sonradan değiştirmek için uygulamadaki "Şube adları" ekranını kullan.
  branches: ['1. Şube', '2. Şube'],
};
