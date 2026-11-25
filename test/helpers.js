import { createApp } from '../src/create-app.js';

/** Bellek içi veritabanıyla uygulamayı başlatır ve basit bir istek fonksiyonu döner. */
export async function startTestApp({ password = '' } = {}) {
  const { app, db } = await createApp({
    db: { url: ':memory:' },
    branchNames: ['Merkez', 'Çarşı'],
    password,
  });

  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const request = async (path, method = 'GET', body, cookie) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return {
      status: res.status,
      cookie: res.headers.get('set-cookie')?.split(';')[0],
      body: res.status === 204 ? null : await res.json(),
    };
  };

  const stop = () => { server.close(); db.close(); };
  return { request, stop };
}
