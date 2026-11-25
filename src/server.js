import os from 'node:os';
import express from 'express';
import { config } from './config.js';
import { createApp } from './create-app.js';

/**
 * Vercel'de dosyaya yazılamaz; Turso bağlı değilse uygulamayı çökertmek yerine
 * ne eksik olduğunu söyleyen küçük bir uygulama döndürür.
 */
function setupErrorApp(message) {
  const app = express();
  app.use('/api', (_req, res) => res.status(503).json({ error: message }));
  app.use(express.static(config.publicDir));
  return app;
}

async function buildApp() {
  if (process.env.VERCEL && !config.hasRemoteDb) {
    const pgKey = Object.keys(process.env).find((k) => /^postgres(ql)?:\/\//.test(process.env[k] || ''));
    if (pgKey) {
      return setupErrorApp('Bağlanan veritabanı Postgres. Bu uygulama Turso ile çalışır; Storage kısmından Turso ekle.');
    }
    return setupErrorApp('Veritabanı bağlı değil. Vercel > Storage kısmından Turso ekleyip yeniden yayınla.');
  }
  try {
    const { app } = await createApp({
      db: config.db,
      branchNames: config.branches,
      password: config.appPassword,
      secureCookie: config.isProduction,
      publicDir: config.publicDir,
    });
    return app;
  } catch (err) {
    console.error('Uygulama başlatılamadı:', err);
    return setupErrorApp('Veritabanına bağlanılamadı. Turso ayarlarını kontrol et.');
  }
}

const app = await buildApp();

// Vercel bu dosyadaki Express uygulamasını kendisi çalıştırır.
export default app;

if (!process.env.VERCEL) {
  app.listen(config.port, config.host, () => {
    const lanIps = Object.values(os.networkInterfaces())
      .flat()
      .filter((i) => i && i.family === 'IPv4' && !i.internal)
      .map((i) => `http://${i.address}:${config.port}`);

    console.log(`Uygulama hazır: http://localhost:${config.port}`);
    if (lanIps.length) console.log(`Telefondan aç (aynı Wi-Fi): ${lanIps.join('  ')}`);
    if (!config.appPassword) console.log('Not: APP_PASSWORD ayarlı değil, giriş ekranı kapalı.');
  });
}
