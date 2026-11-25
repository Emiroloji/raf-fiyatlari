import { Router } from 'express';
import { validatePhone } from './phone.validation.js';

const positiveInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

function parseFilters(query) {
  return {
    q: typeof query.q === 'string' ? query.q.trim().slice(0, 80) : undefined,
    branch_id: positiveInt(query.branch_id),
    brand: typeof query.brand === 'string' && query.brand ? query.brand : undefined,
    storage_gb: positiveInt(query.storage_gb),
    warranty: query.warranty === '1' ? 1 : query.warranty === '0' ? 0 : undefined,
    min_battery: positiveInt(query.min_battery),
    min_price: positiveInt(query.min_price),
    max_price: positiveInt(query.max_price),
    sort: query.sort,
  };
}

// Express 5, async route hatalarını otomatik olarak hata yakalayıcıya iletir.
export function createPhoneRouter({ phones, branches }) {
  const router = Router();
  const branchIds = async () => (await branches.list()).map((b) => b.id);

  router.get('/', async (req, res) => {
    res.json(await phones.list(parseFilters(req.query)));
  });

  router.get('/options', async (_req, res) => {
    res.json(await phones.filterOptions());
  });

  router.post('/', async (req, res) => {
    const { data, errors } = validatePhone(req.body ?? {}, await branchIds());
    if (!data) return res.status(400).json({ errors });
    res.status(201).json(await phones.create(data));
  });

  router.put('/:id', async (req, res) => {
    const id = positiveInt(req.params.id);
    const { data, errors } = validatePhone(req.body ?? {}, await branchIds());
    if (!data) return res.status(400).json({ errors });
    const updated = id && (await phones.update(id, data));
    if (!updated) return res.status(404).json({ error: 'Telefon bulunamadı.' });
    res.json(updated);
  });

  router.delete('/:id', async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id || !(await phones.remove(id))) return res.status(404).json({ error: 'Telefon bulunamadı.' });
    res.status(204).end();
  });

  return router;
}
