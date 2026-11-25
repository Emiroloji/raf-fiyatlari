const MAX_PRICE = 10_000_000;

function toInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[.\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/**
 * Formdan gelen telefon verisini doğrular ve temizler.
 * @returns {{ data: object|null, errors: Record<string,string> }}
 */
export function validatePhone(input, branchIds) {
  const errors = {};

  const data = {
    branch_id: toInt(input.branch_id),
    brand: cleanText(input.brand, 40),
    model: cleanText(input.model, 80),
    storage_gb: toInt(input.storage_gb),
    battery: toInt(input.battery),
    warranty: input.warranty === true || input.warranty === 1 || input.warranty === '1' ? 1 : 0,
    buy_price: toInt(input.buy_price),
    sell_price: toInt(input.sell_price),
    note: cleanText(input.note, 200) || null,
  };

  if (!branchIds.includes(data.branch_id)) errors.branch_id = 'Şube seç.';
  if (!data.brand) errors.brand = 'Marka yaz.';
  if (!data.model) errors.model = 'Model yaz.';
  if (!Number.isInteger(data.storage_gb) || data.storage_gb <= 0) errors.storage_gb = 'Hafızayı GB olarak yaz.';
  if (data.battery !== null && (!Number.isInteger(data.battery) || data.battery < 1 || data.battery > 100)) {
    errors.battery = 'Pil 1 ile 100 arasında olmalı.';
  }
  if (!Number.isInteger(data.buy_price) || data.buy_price < 0 || data.buy_price > MAX_PRICE) {
    errors.buy_price = 'Alış fiyatını yaz.';
  }
  if (!Number.isInteger(data.sell_price) || data.sell_price < 0 || data.sell_price > MAX_PRICE) {
    errors.sell_price = 'Satış fiyatını yaz.';
  }

  return Object.keys(errors).length ? { data: null, errors } : { data, errors };
}
