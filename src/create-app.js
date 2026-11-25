import express from 'express';
import { openDatabase } from './db.js';
import { createAuth } from './auth.js';
import { createPhoneRepository } from './phones/phone.repository.js';
import { createPhoneRouter } from './phones/phone.routes.js';
import { createBranchRepository, createBranchRouter } from './branches/branch.module.js';

/**
 * Uygulamayı kurar. Testlerde ':memory:' veritabanı ile çağrılır.
 * @param {{ db: {url:string, authToken?:string}, branchNames: string[], password?: string, secureCookie?: boolean, publicDir?: string }} options
 */
export async function createApp({ db: dbOptions, branchNames, password = '', secureCookie = false, publicDir }) {
  const db = await openDatabase(dbOptions, branchNames);
  const phones = createPhoneRepository(db);
  const branches = createBranchRepository(db);
  const auth = createAuth({ password, secureCookie });

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '20kb' }));

  app.use('/api/auth', auth.router);
  app.use('/api', auth.requireLogin);
  app.use('/api/phones', createPhoneRouter({ phones, branches }));
  app.use('/api/branches', createBranchRouter({ branches }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Bulunamadı.' }));

  // Vercel'de public/ klasörünü CDN sunar; bu satır yerelde çalışır.
  if (publicDir) app.use(express.static(publicDir));

  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Sunucu hatası.' : err.message });
  });

  return { app, db };
}
