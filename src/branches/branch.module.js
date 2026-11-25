import { Router } from 'express';
import { toObjects } from '../db.js';

export function createBranchRepository(db) {
  return {
    list: async () => toObjects(await db.execute('SELECT id, name FROM branches ORDER BY id')),
    rename: async (id, name) =>
      (await db.execute({ sql: 'UPDATE branches SET name = ? WHERE id = ?', args: [name, id] })).rowsAffected > 0,
  };
}

export function createBranchRouter({ branches }) {
  const router = Router();

  router.get('/', async (_req, res) => res.json(await branches.list()));

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 40) : '';
    if (!name) return res.status(400).json({ errors: { name: 'Şube adı yaz.' } });
    if (!(await branches.rename(id, name))) return res.status(404).json({ error: 'Şube bulunamadı.' });
    res.json({ id, name });
  });

  return router;
}
