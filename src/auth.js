import crypto from 'node:crypto';
import { Router } from 'express';

const COOKIE = 'raf_oturum';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 gün

const sign = (password) => crypto.createHmac('sha256', password).update('raf-fiyatlari-oturum-v1').digest('hex');

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

/**
 * Tek ortak şifreli basit giriş.
 * Şifre değişirse tüm cihazların oturumu kendiliğinden kapanır.
 * password boşsa giriş kapalıdır.
 */
export function createAuth({ password, secureCookie }) {
  const enabled = Boolean(password);
  const token = enabled ? sign(password) : '';

  const isLoggedIn = (req) => !enabled || safeEqual(readCookie(req, COOKIE), token);

  const router = Router();

  router.get('/session', (req, res) => {
    res.json({ loggedIn: isLoggedIn(req), authEnabled: enabled });
  });

  router.post('/login', async (req, res) => {
    const attempt = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!enabled || safeEqual(attempt, password)) {
      res.cookie(COOKIE, token, { httpOnly: true, secure: secureCookie, sameSite: 'lax', maxAge: MAX_AGE_MS, path: '/' });
      return res.json({ loggedIn: true });
    }
    await new Promise((r) => setTimeout(r, 600)); // deneme-yanılmayı yavaşlatır
    res.status(401).json({ error: 'Şifre yanlış.' });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(COOKIE, { path: '/' });
    res.status(204).end();
  });

  const requireLogin = (req, res, next) =>
    isLoggedIn(req) ? next() : res.status(401).json({ error: 'Giriş yapman gerekiyor.' });

  return { router, requireLogin };
}
