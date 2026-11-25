import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp } from './helpers.js';

let req;
let stop;

before(async () => {
  ({ request: req, stop } = await startTestApp({ password: 'dukkan123' }));
});

after(() => stop());

test('şifre ayarlıysa giriş yapmadan veri görülmez', async () => {
  assert.equal((await req('/phones')).status, 401);
  assert.deepEqual((await req('/auth/session')).body, { loggedIn: false, authEnabled: true });
});

test('yanlış şifre reddedilir', async () => {
  const res = await req('/auth/login', 'POST', { password: 'yanlis' });
  assert.equal(res.status, 401);
  assert.equal(res.cookie, undefined);
});

test('doğru şifreyle alınan çerez veriye erişim verir', async () => {
  const { status, cookie } = await req('/auth/login', 'POST', { password: 'dukkan123' });
  assert.equal(status, 200);
  assert.ok(cookie);
  assert.equal((await req('/phones', 'GET', undefined, cookie)).status, 200);
  assert.equal((await req('/phones', 'GET', undefined, 'raf_oturum=sahte')).status, 401);
});
