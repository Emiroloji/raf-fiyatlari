import os from 'node:os';
import { config } from './config.js';
import { createApp } from './create-app.js';

const { app } = await createApp({
  db: config.db,
  branchNames: config.branches,
  password: config.appPassword,
  secureCookie: config.isProduction,
  publicDir: config.publicDir,
});

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
