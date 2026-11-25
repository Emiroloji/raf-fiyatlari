import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp } from './helpers.js';

let req;
let stop;

before(async () => {
  ({ request: req, stop } = await startTestApp());
});

after(() => stop());

const iphone = {
  branch_id: 1, brand: 'Apple', model: 'iPhone 13', storage_gb: 128,
  battery: 88, warranty: true, buy_price: '18.000', sell_price: 22500,
};

test('şubeler ilk açılışta oluşur', async () => {
  const { body } = await req('/branches');
  assert.deepEqual(body, [{ id: 1, name: 'Merkez' }, { id: 2, name: 'Çarşı' }]);
});

test('telefon eklenir ve fiyatlar sayıya çevrilir', async () => {
  const { status, body } = await req('/phones', 'POST', iphone);
  assert.equal(status, 201);
  assert.equal(body.buy_price, 18000);
  assert.equal(body.warranty, 1);
  assert.equal(body.branch_name, 'Merkez');
});

test('eksik alanlar Türkçe hata mesajıyla reddedilir', async () => {
  const { status, body } = await req('/phones', 'POST', { branch_id: 9, battery: 150 });
  assert.equal(status, 400);
  assert.ok(body.errors.brand && body.errors.model && body.errors.battery && body.errors.branch_id);
});

test('filtreler çalışır', async () => {
  await req('/phones', 'POST', {
    branch_id: 2, brand: 'Samsung', model: 'Galaxy A54', storage_gb: 256,
    battery: 95, warranty: false, buy_price: 9000, sell_price: 11500,
  });

  assert.equal((await req('/phones?branch_id=2')).body.length, 1);
  assert.equal((await req('/phones?q=iphone')).body[0].model, 'iPhone 13');
  assert.equal((await req('/phones?warranty=1')).body.length, 1);
  assert.equal((await req('/phones?min_battery=90')).body[0].brand, 'Samsung');
  assert.equal((await req('/phones?max_price=15000')).body.length, 1);
  assert.equal((await req('/phones?storage_gb=128')).body.length, 1);

  const sorted = (await req('/phones?sort=price_asc')).body.map((p) => p.sell_price);
  assert.deepEqual(sorted, [11500, 22500]);

  const { body: options } = await req('/phones/options');
  assert.deepEqual(options.brands, ['Apple', 'Samsung']);
});

test('telefon güncellenir ve silinir', async () => {
  const { body: created } = await req('/phones', 'POST', { ...iphone, model: 'iPhone 11' });
  const { body: updated } = await req(`/phones/${created.id}`, 'PUT', { ...iphone, model: 'iPhone 11', sell_price: 15000 });
  assert.equal(updated.sell_price, 15000);

  assert.equal((await req(`/phones/${created.id}`, 'DELETE')).status, 204);
  assert.equal((await req(`/phones/${created.id}`, 'DELETE')).status, 404);
});

test('şube adı değiştirilir', async () => {
  const { body } = await req('/branches/2', 'PUT', { name: 'Kadıköy' });
  assert.equal(body.name, 'Kadıköy');
  assert.equal((await req('/branches/2', 'PUT', { name: '  ' })).status, 400);
});
