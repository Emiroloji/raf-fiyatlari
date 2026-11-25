// ---------- Yardımcılar ----------
const $ = (sel, root = document) => root.querySelector(sel);
const tl = new Intl.NumberFormat('tr-TR');
const money = (n) => `${tl.format(n)} ₺`;
const parseMoney = (s) => Number(String(s ?? '').replace(/[^\d]/g, '')) || 0;
const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024];
const gbLabel = (gb) => (gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`);
const BRANCH_COLORS = ['var(--branch-1)', 'var(--branch-2)'];

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, v) { try { localStorage.setItem(key, v); } catch { /* yoksay */ } },
};

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth/')) showLogin();
  if (!res.ok) throw Object.assign(new Error(data.error || 'İstek başarısız.'), { status: res.status, data });
  return data;
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

// ---------- Durum ----------
const state = {
  branches: [],
  phones: [],
  options: { brands: [], storages: [] },
  filters: { q: '', branch_id: storage.get('branch') || '', sort: 'newest' },
  editingId: null,
};

const branchColor = (id) => BRANCH_COLORS[(id - 1) % BRANCH_COLORS.length];
const ADVANCED_FILTERS = ['brand', 'storage_gb', 'warranty', 'min_battery', 'min_price', 'max_price'];

// ---------- Veri yükleme ----------
async function loadPhones() {
  const params = new URLSearchParams();
  Object.entries(state.filters).forEach(([k, v]) => { if (v !== '' && v != null) params.set(k, v); });
  try {
    state.phones = await api(`/phones?${params}`);
    renderList();
  } catch {
    toast('Liste yüklenemedi. Sunucunun açık olduğunu kontrol et.');
  }
}

async function loadOptions() {
  state.options = await api('/phones/options');
  $('#brandList').innerHTML = state.options.brands.map((b) => `<option value="${escapeHtml(b)}">`).join('');
}

async function loadBranches() {
  state.branches = await api('/branches');
  renderTabs();
}

// ---------- Çizim ----------
function renderTabs() {
  const tabs = [{ id: '', name: 'Tüm şubeler' }, ...state.branches];
  $('#branchTabs').innerHTML = tabs.map((b) => `
    <button class="tab" type="button" data-branch="${b.id}" aria-pressed="${String(state.filters.branch_id) === String(b.id)}">
      ${b.id ? `<span class="tab__dot" style="background:${branchColor(b.id)}"></span>` : ''}${escapeHtml(b.name)}
    </button>`).join('');
}

function renderRow(p) {
  const profit = p.sell_price - p.buy_price;
  const specs = [
    `<span>${gbLabel(p.storage_gb)}</span>`,
    p.battery != null ? `<span class="${p.battery < 80 ? 'spec--low' : ''}">Pil %${p.battery}</span>` : '',
    p.warranty ? '<span class="spec--warranty">Garantili</span>' : '<span>Garantisiz</span>',
    !state.filters.branch_id ? `<span>${escapeHtml(p.branch_name)}</span>` : '',
  ].join('');

  return `
    <li>
      <button class="row" type="button" data-id="${p.id}" style="--branch-color:${branchColor(p.branch_id)}">
        <div>
          <p class="row__brand">${escapeHtml(p.brand)}</p>
          <p class="row__model">${escapeHtml(p.model)}</p>
          <div class="specs">${specs}</div>
          ${p.note ? `<p class="row__note">${escapeHtml(p.note)}</p>` : ''}
        </div>
        <div class="row__price">
          <span class="tag">${money(p.sell_price)}</span>
          <span class="cost">Alış ${money(p.buy_price)}<br>Kâr <b class="${profit < 0 ? 'neg' : ''}">${money(profit)}</b></span>
        </div>
      </button>
    </li>`;
}

function renderList() {
  const { phones } = state;
  $('#list').innerHTML = phones.map(renderRow).join('');

  const hasFilters = state.filters.q || ADVANCED_FILTERS.some((k) => state.filters[k]);
  $('#empty').hidden = phones.length > 0;
  $('#emptyTitle').textContent = hasFilters ? 'Bu filtreye uyan telefon yok' : 'Rafta henüz telefon yok';
  $('#emptyText').textContent = hasFilters ? 'Aramayı veya filtreleri değiştir.' : 'Sağ alttaki + ile ilk telefonu ekle.';

  const total = phones.reduce((sum, p) => sum + p.sell_price, 0);
  $('#summary').innerHTML = phones.length
    ? `<strong>${phones.length} telefon</strong>, raftaki toplam satış değeri <strong>${money(total)}</strong>`
    : '';

  const activeCount = ADVANCED_FILTERS.filter((k) => state.filters[k] !== '' && state.filters[k] != null).length;
  $('#filterCount').hidden = activeCount === 0;
  $('#filterCount').textContent = activeCount;
}

// ---------- Telefon formu ----------
const phoneSheet = $('#phoneSheet');
const phoneForm = $('#phoneForm');

function renderPhoneFormChoices() {
  $('#branchChoice').innerHTML = state.branches.map((b) => `
    <label><input type="radio" name="branch_id" value="${b.id}"><span>${escapeHtml(b.name)}</span></label>`).join('');
  $('#storageChoice').innerHTML = STORAGE_OPTIONS.map((gb) => `
    <label><input type="radio" name="storage_gb" value="${gb}"><span>${gbLabel(gb)}</span></label>`).join('');
}

function clearErrors(form) {
  form.querySelectorAll('[data-error]').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
}

function showErrors(form, errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const el = form.querySelector(`[data-error="${field}"]`);
    if (el) { el.textContent = msg; el.closest('.field')?.classList.add('has-error'); }
  });
  form.querySelector('.has-error input')?.focus();
}

function updateProfitPreview() {
  const buy = parseMoney(phoneForm.buy_price.value);
  const sell = parseMoney(phoneForm.sell_price.value);
  const el = $('#profitPreview');
  if (!buy || !sell) { el.textContent = ''; return; }
  const profit = sell - buy;
  el.innerHTML = `Bu telefondan kâr: <b class="${profit < 0 ? 'neg' : ''}">${money(profit)}</b>`;
}

function formatMoneyInput(input) {
  const n = parseMoney(input.value);
  input.value = n ? tl.format(n) : '';
}

function openPhoneSheet(phone = null) {
  state.editingId = phone?.id ?? null;
  renderPhoneFormChoices();
  phoneForm.reset();
  clearErrors(phoneForm);

  $('#phoneSheetTitle').textContent = phone ? 'Telefonu düzenle' : 'Telefon ekle';
  $('#deletePhone').hidden = !phone;
  $('#deletePhone').classList.remove('is-armed');
  $('#deletePhone').textContent = 'Sil';

  const defaultBranch = phone?.branch_id ?? (state.filters.branch_id || state.branches[0]?.id);
  const branchInput = phoneForm.querySelector(`[name="branch_id"][value="${defaultBranch}"]`);
  if (branchInput) branchInput.checked = true;

  if (phone) {
    phoneForm.brand.value = phone.brand;
    phoneForm.model.value = phone.model;
    phoneForm.battery.value = phone.battery ?? '';
    phoneForm.warranty.checked = Boolean(phone.warranty);
    phoneForm.buy_price.value = tl.format(phone.buy_price);
    phoneForm.sell_price.value = tl.format(phone.sell_price);
    phoneForm.note.value = phone.note ?? '';
    if (!STORAGE_OPTIONS.includes(phone.storage_gb)) {
      $('#storageChoice').insertAdjacentHTML('beforeend',
        `<label><input type="radio" name="storage_gb" value="${phone.storage_gb}"><span>${gbLabel(phone.storage_gb)}</span></label>`);
    }
    phoneForm.querySelector(`[name="storage_gb"][value="${phone.storage_gb}"]`).checked = true;
  }

  updateProfitPreview();
  phoneSheet.showModal();
  if (!phone) phoneForm.brand.focus();
}

async function savePhone(event) {
  event.preventDefault();
  clearErrors(phoneForm);
  const fd = new FormData(phoneForm);
  const body = {
    branch_id: fd.get('branch_id'),
    brand: fd.get('brand'),
    model: fd.get('model'),
    storage_gb: fd.get('storage_gb'),
    battery: fd.get('battery'),
    warranty: phoneForm.warranty.checked,
    buy_price: parseMoney(fd.get('buy_price')) || fd.get('buy_price'),
    sell_price: parseMoney(fd.get('sell_price')) || fd.get('sell_price'),
    note: fd.get('note'),
  };

  const btn = $('#savePhone');
  btn.disabled = true;
  try {
    if (state.editingId) {
      await api(`/phones/${state.editingId}`, { method: 'PUT', body });
      toast('Değişiklikler kaydedildi');
    } else {
      await api('/phones', { method: 'POST', body });
      toast('Telefon rafa eklendi');
    }
    phoneSheet.close();
    await Promise.all([loadPhones(), loadOptions()]);
  } catch (err) {
    if (err.data?.errors) showErrors(phoneForm, err.data.errors);
    else toast(err.message);
  } finally {
    btn.disabled = false;
  }
}

// Silme: tarayıcı onay penceresi yerine iki dokunuşlu onay.
async function deletePhone() {
  const btn = $('#deletePhone');
  if (!btn.classList.contains('is-armed')) {
    btn.classList.add('is-armed');
    btn.textContent = 'Emin misin? Tekrar dokun';
    return;
  }
  try {
    await api(`/phones/${state.editingId}`, { method: 'DELETE' });
    phoneSheet.close();
    toast('Telefon silindi');
    await Promise.all([loadPhones(), loadOptions()]);
  } catch (err) {
    toast(err.message);
  }
}

// ---------- Filtreler ----------
const filterSheet = $('#filterSheet');
const filterForm = $('#filterForm');

function openFilterSheet() {
  const f = state.filters;
  $('#filterBrand').innerHTML = '<option value="">Hepsi</option>' +
    state.options.brands.map((b) => `<option>${escapeHtml(b)}</option>`).join('');
  $('#filterStorage').innerHTML = '<option value="">Hepsi</option>' +
    state.options.storages.map((gb) => `<option value="${gb}">${gbLabel(gb)}</option>`).join('');

  filterForm.brand.value = f.brand ?? '';
  filterForm.storage_gb.value = f.storage_gb ?? '';
  filterForm.warranty.value = f.warranty ?? '';
  filterForm.min_battery.value = f.min_battery ?? '';
  filterForm.min_price.value = f.min_price ? tl.format(f.min_price) : '';
  filterForm.max_price.value = f.max_price ? tl.format(f.max_price) : '';
  filterForm.sort.value = f.sort ?? 'newest';
  filterSheet.showModal();
}

function applyFilters(event) {
  event.preventDefault();
  const fd = new FormData(filterForm);
  Object.assign(state.filters, {
    brand: fd.get('brand'),
    storage_gb: fd.get('storage_gb'),
    warranty: fd.get('warranty'),
    min_battery: fd.get('min_battery'),
    min_price: parseMoney(fd.get('min_price')) || '',
    max_price: parseMoney(fd.get('max_price')) || '',
    sort: fd.get('sort'),
  });
  filterSheet.close();
  loadPhones();
}

function resetFilters() {
  ADVANCED_FILTERS.forEach((k) => { state.filters[k] = ''; });
  state.filters.sort = 'newest';
  filterSheet.close();
  loadPhones();
}

// ---------- Şube adları ----------
const branchSheet = $('#branchSheet');

function openBranchSheet() {
  $('#branchInputs').innerHTML = state.branches.map((b) => `
    <label class="field" style="margin-bottom:12px">
      <span>Şube ${b.id}</span>
      <input name="branch-${b.id}" value="${escapeHtml(b.name)}" maxlength="40" required>
    </label>`).join('');
  branchSheet.showModal();
}

async function saveBranches(event) {
  event.preventDefault();
  try {
    await Promise.all(state.branches.map((b) => {
      const name = $(`[name="branch-${b.id}"]`).value.trim();
      return name && name !== b.name ? api(`/branches/${b.id}`, { method: 'PUT', body: { name } }) : null;
    }));
    branchSheet.close();
    toast('Şube adları kaydedildi');
    await loadBranches();
    loadPhones();
  } catch (err) {
    toast(err.message);
  }
}

// ---------- Giriş ----------
function showLogin() {
  document.querySelectorAll('dialog[open]').forEach((d) => d.close());
  $('#login').hidden = false;
  document.body.classList.add('locked');
  $('#loginForm').password.focus();
}

async function login(event) {
  event.preventDefault();
  const form = event.target;
  $('#loginError').textContent = '';
  try {
    await api('/auth/login', { method: 'POST', body: { password: form.password.value } });
    form.reset();
    $('#login').hidden = true;
    document.body.classList.remove('locked');
    await loadAll();
  } catch (err) {
    $('#loginError').textContent = err.message;
    form.password.select();
  }
}

async function logout() {
  await api('/auth/logout', { method: 'POST' });
  location.reload();
}

// ---------- Olaylar ----------
function bindEvents() {
  let searchTimer;
  $('#search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.filters.q = e.target.value.trim(); loadPhones(); }, 200);
  });

  $('#branchTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-branch]');
    if (!tab) return;
    state.filters.branch_id = tab.dataset.branch;
    storage.set('branch', tab.dataset.branch);
    renderTabs();
    loadPhones();
  });

  $('#list').addEventListener('click', (e) => {
    const row = e.target.closest('[data-id]');
    if (!row) return;
    const phone = state.phones.find((p) => p.id === Number(row.dataset.id));
    if (phone) openPhoneSheet(phone);
  });

  const toggleBuy = $('#toggleBuy');
  const applyHideBuy = (hide) => {
    document.body.classList.toggle('hide-buy', hide);
    toggleBuy.setAttribute('aria-pressed', String(hide));
    toggleBuy.title = hide ? 'Alış fiyatlarını göster' : 'Alış fiyatlarını gizle';
  };
  applyHideBuy(storage.get('hideBuy') === '1');
  toggleBuy.addEventListener('click', () => {
    const hide = !document.body.classList.contains('hide-buy');
    applyHideBuy(hide);
    storage.set('hideBuy', hide ? '1' : '0');
    toast(hide ? 'Alış fiyatları gizlendi' : 'Alış fiyatları gösteriliyor');
  });

  $('#openAdd').addEventListener('click', () => openPhoneSheet());
  $('#openFilters').addEventListener('click', openFilterSheet);
  $('#openBranches').addEventListener('click', openBranchSheet);

  phoneForm.addEventListener('submit', savePhone);
  phoneForm.addEventListener('input', updateProfitPreview);
  ['buy_price', 'sell_price'].forEach((n) => phoneForm[n].addEventListener('blur', (e) => formatMoneyInput(e.target)));
  ['min_price', 'max_price'].forEach((n) => filterForm[n].addEventListener('blur', (e) => formatMoneyInput(e.target)));
  $('#deletePhone').addEventListener('click', deletePhone);

  filterForm.addEventListener('submit', applyFilters);
  filterForm.addEventListener('reset', (e) => { e.preventDefault(); resetFilters(); });
  $('#branchForm').addEventListener('submit', saveBranches);
  $('#loginForm').addEventListener('submit', login);
  $('#logout').addEventListener('click', logout);

  // Kapat düğmeleri ve arka plana dokunma
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
  });
}

// ---------- Başlat ----------
async function loadAll() {
  await Promise.all([loadBranches(), loadOptions()]);
  if (state.filters.branch_id && !state.branches.some((b) => String(b.id) === state.filters.branch_id)) {
    state.filters.branch_id = '';
    renderTabs();
  }
  await loadPhones();
}

async function init() {
  bindEvents();
  try {
    const session = await api('/auth/session');
    $('#logout').hidden = !session.authEnabled;
    if (!session.loggedIn) return showLogin();
    await loadAll();
  } catch (err) {
    $('#empty').hidden = false;
    $('#emptyTitle').textContent = 'Uygulama açılamadı';
    $('#emptyText').textContent = err.message || 'Sunucuya bağlanılamadı.';
  }
}

init();
