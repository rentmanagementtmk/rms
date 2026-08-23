'use strict';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your deployed Apps Script Web App URL after running setup
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzO3X6KBk0v87nRUyYP5xYPySzVwc-Id8oPDFk5QkzDb9PAeDR5bASWQjD7268PCQI/exec',
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const BUILDINGS = ['Jalanidhi', 'Spatika', 'Manikya', 'Vaidurya', 'Aparanji'];

const FLOOR_LABELS = { GF: 'Ground Floor', FF: 'First Floor', SF: 'Second Floor' };

const HOUSES = [
  { id: 'JLN-GF-01', building: 'Jalanidhi', floor: 'GF', num: '01', displayNum: 1 },
  { id: 'JLN-GF-02', building: 'Jalanidhi', floor: 'GF', num: '02', displayNum: 2 },
  { id: 'JLN-FF-01', building: 'Jalanidhi', floor: 'FF', num: '01', displayNum: 3 },
  { id: 'JLN-FF-02', building: 'Jalanidhi', floor: 'FF', num: '02', displayNum: 4 },
  { id: 'JLN-SF-01', building: 'Jalanidhi', floor: 'SF', num: '01', displayNum: 5 },
  { id: 'JLN-SF-02', building: 'Jalanidhi', floor: 'SF', num: '02', displayNum: 6 },
  { id: 'SPT-GF-01', building: 'Spatika',   floor: 'GF', num: '01', displayNum: 1 },
  { id: 'SPT-GF-02', building: 'Spatika',   floor: 'GF', num: '02', displayNum: 2 },
  { id: 'SPT-FF-01', building: 'Spatika',   floor: 'FF', num: '01', displayNum: 3 },
  { id: 'SPT-FF-02', building: 'Spatika',   floor: 'FF', num: '02', displayNum: 4 },
  { id: 'MNK-GF-01', building: 'Manikya',   floor: 'GF', num: '01', displayNum: 1 },
  { id: 'MNK-GF-02', building: 'Manikya',   floor: 'GF', num: '02', displayNum: 2 },
  { id: 'MNK-FF-01', building: 'Manikya',   floor: 'FF', num: '01', displayNum: 3 },
  { id: 'MNK-FF-02', building: 'Manikya',   floor: 'FF', num: '02', displayNum: 4 },
  { id: 'VDR-GF-01', building: 'Vaidurya',  floor: 'GF', num: '01', displayNum: 1 },
  { id: 'VDR-GF-02', building: 'Vaidurya',  floor: 'GF', num: '02', displayNum: 2 },
  { id: 'VDR-FF-01', building: 'Vaidurya',  floor: 'FF', num: '01', displayNum: 3 },
  { id: 'VDR-FF-02', building: 'Vaidurya',  floor: 'FF', num: '02', displayNum: 4 },
  { id: 'APR-GF-01', building: 'Aparanji',  floor: 'GF', num: '01', displayNum: 1 },
  { id: 'APR-GF-02', building: 'Aparanji',  floor: 'GF', num: '02', displayNum: 2 },
  { id: 'APR-FF-01', building: 'Aparanji',  floor: 'FF', num: '01', displayNum: 3 },
  { id: 'APR-FF-02', building: 'Aparanji',  floor: 'FF', num: '02', displayNum: 4 },
  { id: 'APR-SF-01', building: 'Aparanji',  floor: 'SF', num: '01', displayNum: 5 },
  { id: 'APR-SF-02', building: 'Aparanji',  floor: 'SF', num: '02', displayNum: 6 },
];

// ─── API ──────────────────────────────────────────────────────────────────────
async function apiGet(params, { forceRefresh = false } = {}) {
  const url = new URL(CONFIG.API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  if (forceRefresh) url.searchParams.set('_t', Date.now()); // bust browser HTTP cache
  const resp = await fetch(url.toString(), forceRefresh ? { cache: 'reload' } : {});
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// Omitting Content-Type keeps this a "simple request" — no CORS preflight needed
async function apiPost(body) {
  const resp = await fetch(CONFIG.API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────
function showToast(msg, type = 'info', ms) {
  // duration by type: success 4s, warning 5s, error 6s
  const duration = ms ?? (type === 'success' ? 4000 : type === 'error' ? 6000 : 5000);
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), duration);
}

/** Returns { month, year } of the previous calendar month (1-based month) */
function prevMonth() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return m === 1 ? { month: 12, year: y - 1 } : { month: m - 1, year: y };
}

function showLoader() { document.getElementById('page-loader').classList.remove('hidden'); }
function hideLoader() { document.getElementById('page-loader').classList.add('hidden'); }

function showValidateResult(res) {
  const renderItem = item => {
    const msg = t('validate.err.' + item.code).replace('{value}', item.value || '');
    return `<li><strong>${item.house}:</strong> ${msg}</li>`;
  };

  const summary = `✅ ${res.passed} ${t('validate.passed')}  ❌ ${res.issues.length} ${t('validate.issues_count')}  ⚠️ ${res.warnings.length} ${t('validate.warnings_count')}`;

  const lines = [
    `<div class="val-summary">${summary}</div>`,
    ...(res.issues.length   ? [`<p class="val-section-label">${t('validate.issues')}</p>`,   `<ul class="val-list">${res.issues.map(renderItem).join('')}</ul>`]   : []),
    ...(res.warnings.length ? [`<p class="val-section-label">${t('validate.warnings')}</p>`, `<ul class="val-list">${res.warnings.map(renderItem).join('')}</ul>`] : []),
    ...(res.issues.length === 0 && res.warnings.length === 0 ? [`<p class="val-ok">${t('validate.all_ok')}</p>`] : []),
  ].join('');

  // Reuse dup-modal structure for the result overlay
  const modal    = document.getElementById('dup-modal');
  const detailEl = document.getElementById('dup-existing');
  const cancelBtn  = document.getElementById('dup-cancel');
  const confirmBtn = document.getElementById('dup-confirm');

  document.getElementById('dup-title').textContent    = t('validate.title');
  document.getElementById('dup-body').textContent     = '';
  document.getElementById('dup-question').textContent = '';
  cancelBtn.textContent  = t('validate.close');
  confirmBtn.classList.add('hidden');
  detailEl.innerHTML = lines;
  modal.classList.remove('hidden');

  function close() {
    modal.classList.add('hidden');
    confirmBtn.classList.remove('hidden');
    cancelBtn.removeEventListener('click', close);
  }
  cancelBtn.addEventListener('click', close);
}

function showDupModal(records) {
  return new Promise(resolve => {
    const modal      = document.getElementById('dup-modal');
    const detailEl   = document.getElementById('dup-existing');
    const cancelBtn  = document.getElementById('dup-cancel');
    const confirmBtn = document.getElementById('dup-confirm');

    const first    = records[0];
    const entry    = HOUSES.find(x => x.id === first.HouseID);
    const name     = entry ? houseLabel(entry) : first.HouseLabel;
    const monthYear = `${t('month.' + first.RentForMonth)} ${first.RentForYear}`;
    const multi    = records.length > 1;

    // House + month context in body; table focuses on Amount / Date columns only
    const bodyText = `${name} \u00b7 ${monthYear} \u00b7 ${records.length} ${t('msg.payments')}`;

    const dataRows = records.map(r => `
      <tr>
        <td class="dt-amount">${inr(r.AmountReceived)}</td>
        <td class="dt-date">${formatDate(r.CollectedDate)}</td>
      </tr>`).join('');

    const totalRow = multi
      ? `<tr class="dt-total-row">
          <td class="dt-total-label">${t('modal.total')}</td>
          <td class="dt-total-val">${inr(records.reduce((s, r) => s + r.AmountReceived, 0))}</td>
         </tr>`
      : '';

    detailEl.innerHTML = `
      <table class="dup-table">
        <thead>
          <tr>
            <th>${t('modal.amount')}</th>
            <th>${t('modal.collected')}</th>
          </tr>
        </thead>
        <tbody>${dataRows}</tbody>
        ${totalRow ? `<tfoot>${totalRow}</tfoot>` : ''}
      </table>`;

    document.getElementById('dup-title').textContent    = t('modal.dup_title');
    document.getElementById('dup-body').textContent     = bodyText;
    document.getElementById('dup-question').textContent = t('modal.dup_question');
    cancelBtn.textContent  = t('collect.cancel');
    confirmBtn.textContent = t('modal.save_anyway');

    modal.classList.remove('hidden');

    function cleanup() {
      modal.classList.add('hidden');
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
    }
    function onCancel()  { cleanup(); resolve(false); }
    function onConfirm() { cleanup(); resolve(true);  }

    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
  });
}

function inr(amount) {
  const n = Number(amount);
  const opts = Number.isInteger(n)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return '₹' + n.toLocaleString('en-IN', opts);
}

const _MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d  = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = _MONTHS_SHORT[d.getMonth()];
  const yr = d.getFullYear();
  let   h  = d.getHours();
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${dd}-${mo}-${yr} ${h}:${mi} ${ap}`;
}

function populateMonthSelect(el) {
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = t('month.' + i);
    el.appendChild(opt);
  }
}

function populateYearSelect(el) {
  const y = new Date().getFullYear();
  [y - 1, y, y + 1].forEach((yr, i) => {
    const opt = document.createElement('option');
    opt.value = yr;
    opt.textContent = yr;
    if (i === 1) opt.selected = true;
    el.appendChild(opt);
  });
}

// Single source of truth for house display name — update here when tenant name is added
function houseLabel(h) {
  const base   = `${h.building} ${h.displayNum}`;
  const tenant = HOUSE_CACHE[h.id]?.TenantName || '';
  return tenant ? `${base} - ${tenant}` : base;
}

// houseId → full house row from Masters_Houses (loaded once on page init)
let HOUSE_CACHE = {};
let _dashboardRecords = null; // last rendered records, used for silent re-render after cache refresh
let _dashboardBalances = null; // last rendered balances, kept in sync with _dashboardRecords

const LS_HOUSE_KEY = 'rms_houses';
const LS_TTL_MS    = 60 * 60 * 1000; // 1 hour

const _houseSelectEls = new Set(); // tracks all house <select> elements for silent refresh

/** Returns true when a notification was not successfully delivered */
function notifFailed(status) {
  return status !== 'SENT' && status !== true && status !== '' && status != null;
}

/** Balance status dot with tooltip. isVacant shows orange (no tenant, not pre-booked). */
function balDot(balance, expectedRent, today, isVacant) {
  if (isVacant)
    return `<span class="bal-dot tip dot-orange" data-tip="${t('dot.vacant')}"></span>`;
  if (balance === 0)
    return `<span class="bal-dot tip dot-green" data-tip="${t('dot.paid')}"></span>`;
  if (today.getDate() <= 10) return '';
  if (expectedRent > 0 && balance >= 2 * expectedRent)
    return `<span class="bal-dot tip dot-red" data-tip="${t('dot.overdue')}"></span>`;
  if (expectedRent > 0 && balance < 2 * expectedRent)
    return `<span class="bal-dot tip dot-yellow" data-tip="${t('dot.due')}"></span>`;
  return '';
}

// Mobile tap: toggle tooltip visibility; click elsewhere dismisses
document.addEventListener('click', e => {
  const tip = e.target.closest('.tip');
  document.querySelectorAll('.tip.show-tip').forEach(el => { if (el !== tip) el.classList.remove('show-tip'); });
  if (tip) tip.classList.toggle('show-tip');
});

/** Loads from localStorage instantly, then silently refreshes from API in background */
function loadHouseCache() {
  // Synchronous: populate from localStorage if fresh
  try {
    const raw = localStorage.getItem(LS_HOUSE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < LS_TTL_MS) Object.assign(HOUSE_CACHE, data);
    }
  } catch (_) {}

  // Async background refresh — silently updates cache and selects when done
  apiGet({ action: 'getHouses' }).then(res => {
    if (!res.houses) return;
    const fresh = {};
    res.houses.forEach(h => { fresh[h.HouseID] = h; });
    Object.assign(HOUSE_CACHE, fresh);
    try { localStorage.setItem(LS_HOUSE_KEY, JSON.stringify({ ts: Date.now(), data: fresh })); } catch (_) {}
    _refreshHouseSelects();
  }).catch(() => {});
}

function _renderHouseSelect(el) {
  const savedVal        = el.value;
  const includeBuildings = el.dataset.buildings === 'true';
  Array.from(el.children).filter(c => c.tagName === 'OPTGROUP').forEach(c => c.remove());
  BUILDINGS.forEach(building => {
    const grp = document.createElement('optgroup');
    grp.label = building;

    if (includeBuildings) {
      const count   = HOUSES.filter(h => h.building === building).length;
      const bldgOpt = document.createElement('option');
      bldgOpt.value       = `BLDG:${building}`;
      bldgOpt.textContent = t('dashboard.all_building').replace('{name}', building).replace('{count}', count);
      grp.appendChild(bldgOpt);
    }
    HOUSES.filter(h => h.building === building).forEach(h => {
      const opt    = document.createElement('option');
      opt.value    = h.id;
      const cached = HOUSE_CACHE[h.id];
      // IsActive can be boolean true or string 'TRUE' depending on sheet format
      const active  = cached ? (cached.IsActive === true || String(cached.IsActive).toUpperCase() === 'TRUE') : true;
      const tenant  = cached?.TenantName || '';
      const base    = `${h.building} ${h.displayNum}`;
      if (!active) {
        opt.textContent = `${base} — Vacant`;
        opt.disabled    = true;
      } else if (!tenant) {
        opt.textContent = `${base} ⚠️`;
      } else {
        opt.textContent = `${base} - ${tenant}`;
      }
      grp.appendChild(opt);
    });
    el.appendChild(grp);
  });
  el.value = savedVal;
}

function _refreshHouseSelects() {
  _houseSelectEls.forEach(el => _renderHouseSelect(el));
  // Re-render dashboard rows silently if they are already on screen
  if (_dashboardRecords) {
    const resultsEl = document.getElementById('results');
    if (resultsEl && resultsEl.children.length > 0) {
      const renderFn = resultsEl._render;
      if (typeof renderFn === 'function') renderFn(_dashboardRecords, _dashboardBalances);
    }
  }
}

function populateHouseSelect(el) {
  _houseSelectEls.add(el);
  _renderHouseSelect(el);
}

// ─── COLLECT PAGE ─────────────────────────────────────────────────────────────
async function initCollectPage() {
  loadHouseCache(); // localStorage (instant) + background API refresh

  const monthSel  = document.getElementById('rent-month');
  const yearSel   = document.getElementById('rent-year');
  populateMonthSelect(monthSel);
  populateYearSelect(yearSel);
  const { month, year } = prevMonth();
  monthSel.value = month;
  yearSel.value  = year;

  const manualSel = document.getElementById('manual-house-select');
  populateHouseSelect(manualSel);

  const scanSection  = document.getElementById('scan-section');
  const formSection  = document.getElementById('form-section');
  const qrWrapper    = document.getElementById('qr-reader-wrapper');
  const scanBtn      = document.getElementById('scan-btn');
  const stopScanBtn  = document.getElementById('stop-scan-btn');
  const manualToggle = document.getElementById('manual-toggle');
  const manualSection = document.getElementById('manual-section');
  const useManualBtn = document.getElementById('use-manual-btn');
  const rescanBtn    = document.getElementById('rescan-btn');
  const rentForm     = document.getElementById('rent-form');
  const houseInfoEl  = document.getElementById('house-info');
  const saveBtn      = document.getElementById('save-btn');
  const amountEl     = document.getElementById('amount');
  const paymentModeEl = document.getElementById('payment-mode');
  const paymentModeToggleEl = document.getElementById('payment-mode-toggle');

  const previewWrap     = document.getElementById('collect-preview');
  const previewExpected = document.getElementById('preview-expected');
  const previewArrears  = document.getElementById('preview-arrears');
  const previewDue      = document.getElementById('preview-due');
  const previewPost     = document.getElementById('preview-post');

  let currentHouse = null;
  let scanner      = null;
  let _previewBase = null;
  let _previewTimer = null;

  function setPaymentMode(mode) {
    const normalized = String(mode || 'ONLINE').toUpperCase() === 'CASH' ? 'CASH' : 'ONLINE';
    paymentModeEl.value = normalized;
    if (!paymentModeToggleEl) return;
    paymentModeToggleEl.querySelectorAll('.mode-option').forEach(btn => {
      const isActive = btn.dataset.mode === normalized;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  setPaymentMode('ONLINE');

  function renderPreview(base) {
    if (!base) {
      previewWrap.classList.add('hidden');
      return;
    }
    _previewBase = base;
    previewExpected.textContent = inr(base.expectedRent || 0);
    previewArrears.textContent  = inr(base.arrears || 0);
    previewDue.textContent      = inr(base.currentBalance || 0);
    updatePostPayment();
    previewWrap.classList.remove('hidden');
  }

  function updatePostPayment() {
    if (!_previewBase) return;
    const amt = parseFloat(amountEl.value);
    const paid = isNaN(amt) || amt < 0 ? 0 : amt;
    const post = Math.max(0, (_previewBase.currentBalance || 0) - paid);
    previewPost.textContent = inr(post);
  }

  async function refreshPreview() {
    if (!currentHouse) return;
    const year = parseInt(yearSel.value, 10);
    const month = parseInt(monthSel.value, 10);
    if (!year || !month) return;
    try {
      const res = await apiGet({
        action: 'getCollectionPreview',
        houseId: currentHouse.HouseID,
        year,
        month,
      });
      if (res.error) {
        renderPreview(null);
        return;
      }
      renderPreview(res);
    } catch {
      renderPreview(null);
    }
  }

  function schedulePreviewRefresh() {
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(refreshPreview, 220);
  }

  async function stopScanner() {
    if (scanner) {
      try { await scanner.stop(); } catch (_) {}
      scanner = null;
    }
    qrWrapper.classList.add('hidden');
    scanBtn.classList.remove('hidden');
  }

  function showForm(house) {
    currentHouse = house;
    const entry       = HOUSES.find(x => x.id === house.HouseID);
    const baseName    = entry ? `${entry.building} ${entry.displayNum}` : house.HouseLabel;
    const tenantName  = house.TenantName || '';
    const displayLine = tenantName ? `${baseName} - ${tenantName}` : baseName;
    houseInfoEl.innerHTML = `
      <p class="house-building">${house.BuildingName}</p>
      <p class="house-name">${displayLine}</p>
      <p class="house-id">${house.HouseID}</p>
    `;
    scanSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    amountEl.value = '';
    setPaymentMode('ONLINE');
    _previewBase = null;
    previewExpected.textContent = '—';
    previewArrears.textContent  = '—';
    previewDue.textContent      = '—';
    previewPost.textContent     = '—';
    previewWrap.classList.add('hidden');
    amountEl.focus();
    refreshPreview();
  }

  function resetToScan() {
    currentHouse = null;
    formSection.classList.add('hidden');
    scanSection.classList.remove('hidden');
    _previewBase = null;
    previewWrap.classList.add('hidden');
    const p = prevMonth();
    monthSel.value = p.month;
    yearSel.value  = p.year;
  }

  scanBtn.addEventListener('click', () => {
    scanBtn.classList.add('hidden');
    qrWrapper.classList.remove('hidden');

    scanner = new Html5Qrcode('qr-reader');
    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (w, h) => {
          const side = Math.floor(Math.min(w, h) * 0.7);
          return { width: side, height: side };
        },
      },
      async (qrValue) => {
        await stopScanner();
        showLoader();
        try {
          const res = await apiGet({ action: 'getHouse', qr: qrValue });
          hideLoader();
          if (res.error === 'VACANT') return showToast(t('msg.house_vacant'), 'warning');
          if (res.error) return showToast(t('msg.house_not_found'), 'error');
          showForm(res.house);
        } catch {
          hideLoader();
          showToast(t('msg.network_error'), 'error');
        }
      },
      () => {} // per-frame decode errors are expected and ignored
    ).catch(() => {
      showToast(t('msg.camera_denied'), 'warning');
      stopScanner();
    });
  });

  stopScanBtn.addEventListener('click', stopScanner);

  manualToggle.addEventListener('click', () => {
    manualSection.classList.toggle('hidden');
    manualSel.value = '';
  });

  useManualBtn.addEventListener('click', async () => {
    const houseId = manualSel.value;
    if (!houseId) return showToast(t('msg.select_house'), 'warning');
    useManualBtn.disabled = true;
    showLoader();
    try {
      const res = await apiGet({ action: 'getHouse', qr: houseId });
      if (res.error === 'VACANT') { showToast(t('msg.house_vacant'), 'warning'); return; }
      if (res.error) { showToast(t('msg.house_not_found'), 'error'); return; }
      manualSection.classList.add('hidden');
      showForm(res.house);
    } catch {
      showToast(t('msg.network_error'), 'error');
    } finally {
      hideLoader();
      useManualBtn.disabled = false;
    }
  });

  rescanBtn.addEventListener('click', resetToScan);
  amountEl.addEventListener('input', updatePostPayment);
  monthSel.addEventListener('change', schedulePreviewRefresh);
  yearSel.addEventListener('change', schedulePreviewRefresh);
  if (paymentModeToggleEl) {
    paymentModeToggleEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-option');
      if (!btn) return;
      setPaymentMode(btn.dataset.mode);
    });
  }

  rentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentHouse) return;

    const amount    = parseFloat(document.getElementById('amount').value);
    const rentMonth = parseInt(monthSel.value);
    const rentYear  = parseInt(yearSel.value);
    const paymentMode = (paymentModeEl.value || 'ONLINE').toUpperCase();

    if (isNaN(amount) || amount <= 0) return showToast(t('msg.invalid_amount'), 'error');

    saveBtn.disabled    = true;
    saveBtn.textContent = t('collect.saving');

    try {
      // Pre-check: show details + confirmation if a record already exists
      const dupCheck = await apiGet({ action: 'getDashboard', year: rentYear, month: rentMonth, houseId: currentHouse.HouseID });
      if (dupCheck.records?.length > 0) {
        saveBtn.disabled    = false;
        saveBtn.textContent = t('collect.save');
        const proceed = await showDupModal(dupCheck.records);
        if (!proceed) return;
        saveBtn.disabled    = true;
        saveBtn.textContent = t('collect.saving');
      }

      const res = await apiPost({
        action: 'saveRent',
        houseId: currentHouse.HouseID,
        rentForYear: rentYear,
        rentForMonth: rentMonth,
        amount,
        paymentMode,
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        const entry = HOUSES.find(x => x.id === currentHouse.HouseID);
        const friendlyName = entry ? `${entry.building} ${entry.displayNum}` : currentHouse.HouseLabel;
        const msg = res.duplicate
          ? `${t('msg.duplicate_prefix')} ${t('month.' + rentMonth)} ${rentYear}`
          : `${t('msg.saved')} ${friendlyName} — ${inr(amount)}`;
        showToast(msg, res.duplicate ? 'warning' : 'success');
        resetToScan();
      }
    } catch {
      showToast(t('msg.network_error'), 'error');
    } finally {
      saveBtn.disabled    = false;
      saveBtn.textContent = t('collect.save');
    }
  });
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
async function initDashboardPage() {
  loadHouseCache(); // localStorage (instant) + background API refresh

  const filterYear  = document.getElementById('filter-year');
  const filterMonth = document.getElementById('filter-month');
  const filterHouse = document.getElementById('filter-house');
  const loadingEl   = document.getElementById('loading');
  const resultsEl   = document.getElementById('results');

  populateYearSelect(filterYear);
  populateMonthSelect(filterMonth);
  populateHouseSelect(filterHouse);

  filterMonth.value = prevMonth().month;

  async function load(forceRefresh = false) {
    loadingEl.classList.remove('hidden');
    resultsEl.innerHTML = '';

    const params = { action: 'getDashboard', year: filterYear.value };
    if (filterMonth.value) params.month = filterMonth.value;
    // BLDG: prefix = building-level filter, handled client-side; don't send houseId to server
    if (filterHouse.value && !filterHouse.value.startsWith('BLDG:')) params.houseId = filterHouse.value;
    if (forceRefresh) params.forceRefresh = '1';

    const balParams = { action: 'getBalanceSummary', year: filterYear.value, month: filterMonth.value || new Date().getMonth() + 1 };
    if (forceRefresh) balParams.forceRefresh = '1';

    // Fetch balance summary alongside dashboard data (parallel)
    let balances = {};
    try {
      const [dashRes, balRes] = await Promise.all([
        apiGet(params, { forceRefresh }),
        apiGet(balParams, { forceRefresh }),
      ]);
      if (dashRes.error) { resultsEl.innerHTML = `<p class="msg-error">${dashRes.error}</p>`; return; }
      if (balRes.balances) balances = balRes.balances;
      render(dashRes.records, balances);
    } catch {
      resultsEl.innerHTML = `<p class="msg-error">${t('msg.net_check')}</p>`;
    } finally {
      loadingEl.classList.add('hidden');
    }
  }

  function render(records, balances) {
    balances = balances || {};
    _dashboardRecords  = records;
    _dashboardBalances = balances;
    resultsEl._render  = render;
    // Build a lookup: houseId → [payment, ...]
    const byHouse = {};
    records.forEach(r => (byHouse[r.HouseID] = byHouse[r.HouseID] || []).push(r));

    // Derive which building (and optionally which single house) to show
    const isBldgFilter  = filterHouse.value.startsWith('BLDG:');
    const targetBuilding = isBldgFilter
      ? filterHouse.value.slice(5)
      : (filterHouse.value ? HOUSES.find(h => h.id === filterHouse.value)?.building : null);

    const isMonthSelected = !!filterMonth.value;
    let grandTotal = 0;
    let cardsHtml  = '';

    BUILDINGS.forEach(building => {
      if (targetBuilding && building !== targetBuilding) return;

      let buildingTotal = 0;
      let rowsHtml = '';

      HOUSES.filter(h => h.building === building).forEach(h => {
        if (filterHouse.value && !isBldgFilter && h.id !== filterHouse.value) return;

        const payments = byHouse[h.id] || [];

        const bEntry      = balances[h.id] || {};
        const isFuture     = !!bEntry.futureOccupancy;
        const isVacant     = !balances[h.id] && !isFuture; // no active balance entry = no tenant
        const futureClass  = isFuture ? ' future-house' : '';
        const vacantClass  = isVacant ? ' vacant' : '';
        const today        = new Date();
        // Guard against stale boolean (pre-redeploy) — only use if object with expected fields
        const inc     = (bEntry.upcomingIncrement && typeof bEntry.upcomingIncrement === 'object')
          ? bEntry.upcomingIncrement : null;
        const notif   = (!inc && bEntry.recentIncrement && typeof bEntry.recentIncrement === 'object')
          ? bEntry.recentIncrement : null;
        const incIcon0 = inc
          ? ` <span class="tip" data-tip="${t('tip.increment')}">⬆️</span>`
          : (notif ? ` <span class="tip" data-tip="${t('tip.increment_notified')}">📩</span>` : '');
        const incLine  = inc
          ? `<span class="row-sub row-increment">${t('msg.increment_detail').replace('{rent}', inr(inc.newRent)).replace('{date}', inc.effectiveDate).replace('{inc}', inr(inc.increment))}</span>`
          : (notif
            ? `<span class="row-sub row-increment-notified">${t('msg.increment_notified').replace('{rent}', inr(notif.newRent)).replace('{date}', notif.effectiveDate)}</span>`
            : '');

        if (payments.length === 0) {
          const bal     = bEntry.balance || 0;
          const incIcon = bEntry.upcomingIncrement ? ` <span class="tip" data-tip="${t('tip.increment')}">⬆️</span>` : '';
          const dot     = isFuture ? '' : balDot(bal, bEntry.expectedRent || 0, today, isVacant);
          const subLine = isFuture
            ? `<span class="row-sub">${t('msg.prebooked')} ${bEntry.futureOccupancy}</span>`
            : (bal > 0 ? `<span class="row-sub row-balance">${t('msg.balance')} ${inr(bal)}</span>` : '');
          rowsHtml += `
            <div class="house-row unpaid${futureClass}${vacantClass}">
              <div class="row-info">
                <span class="row-label">${houseLabel(h)}${incIcon}${dot}</span>
                ${subLine}
                ${incLine}
              </div>
              <span class="row-amount no-pay">—</span>
            </div>`;
        } else {
          const hasDup = isMonthSelected && payments.length > 1;

          if (hasDup) {
            const total    = payments.reduce((s, p) => s + p.AmountReceived, 0);
            buildingTotal += total;
            grandTotal    += total;
            const monthLabel  = `${t('month.' + payments[0].RentForMonth)} ${payments[0].RentForYear}`;
            const tenant      = HOUSE_CACHE[h.id]?.TenantName || '';
            const rowLabel    = tenant ? `${h.building} ${h.displayNum} - ${tenant}` : `${h.building} ${h.displayNum}`;
            const bell        = payments.some(p => notifFailed(p.NotificationSent)) ? ` <span class="tip" data-tip="${t('tip.notif_failed')}">🔕</span>` : '';
            const incIcon     = incIcon0;
            const histBal     = bEntry.balance || 0;
            const dot         = balDot(histBal, bEntry.expectedRent || 0, today, false);
            const balLine     = histBal > 0 ? `<span class="row-sub row-balance">${t('msg.balance')} ${inr(histBal)}</span>` : '';
            const splitLines  = payments.map(p =>
              `<div class="dup-split">
                <span class="split-amount">${inr(p.AmountReceived)}</span>
                <span class="split-date">${formatDate(p.CollectedDate)}</span>
              </div>`
            ).join('');
            rowsHtml += `
              <div class="house-row paid dup-entry${futureClass}">
                <div class="row-info">
                  <span class="row-label">${rowLabel} <span class="tip" data-tip="${t('tip.duplicate')}">⚠️</span>${bell}${incIcon}${dot}</span>
                  <span class="row-sub">${monthLabel} · ${payments.length} ${t('msg.payments')}</span>
                  ${balLine}
                  ${incLine}
                  <div class="dup-splits">${splitLines}</div>
                </div>
                <span class="row-amount">${inr(total)}</span>
              </div>`;
          } else {
            payments.forEach(p => {
              buildingTotal += p.AmountReceived;
              grandTotal    += p.AmountReceived;
              const tenant2   = HOUSE_CACHE[h.id]?.TenantName || '';
              const rowLabel2 = tenant2 ? `${h.building} ${h.displayNum} - ${tenant2}` : `${h.building} ${h.displayNum}`;
              const bell2     = notifFailed(p.NotificationSent) ? ` <span class="tip" data-tip="${t('tip.notif_failed')}">🔕</span>` : '';
              const incIcon2  = incIcon0;
              const histBal2  = bEntry.balance || 0;
              const dot2      = balDot(histBal2, bEntry.expectedRent || 0, today, false);
              const balLine2  = histBal2 > 0 ? `<span class="row-sub row-balance">${t('msg.balance')} ${inr(histBal2)}</span>` : '';
              rowsHtml += `
              <div class="house-row paid${futureClass}">
                <div class="row-info">
                  <span class="row-label">${rowLabel2}${bell2}${incIcon2}${dot2}</span>
                  <span class="row-sub">${t('month.' + p.RentForMonth)} ${p.RentForYear}</span>
                  <span class="row-date">${formatDate(p.CollectedDate)}</span>
                  ${balLine2}
                  ${incLine}
                </div>
                <span class="row-amount">${inr(p.AmountReceived)}</span>
              </div>`;
            });
          }
        }
      });

      if (!rowsHtml) return;

      cardsHtml += `
        <div class="building-card">
          <div class="building-head">
            <span>${building}</span>
            <span class="building-total">${inr(buildingTotal)}</span>
          </div>
          <div class="building-rows">${rowsHtml}</div>
        </div>`;
    });

    if (!cardsHtml) {
      resultsEl.innerHTML = `<p class="msg-empty">${t('msg.no_records')}</p>`;
      document.getElementById('retry-btn')?.classList.add('hidden');
      return;
    }

    // Show retry button when any visible record has a retryable failed notification
    const hasRetryable = records.some(r => {
      const s = String(r.NotificationSent || '').toUpperCase();
      return s === 'DISCONNECTED' || s === 'FAILED';
    });
    document.getElementById('retry-btn')?.classList.toggle('hidden', !hasRetryable);

    const periodLabel = filterMonth.value
      ? `${t('month.' + filterMonth.value)} ${filterYear.value}`
      : `${t('msg.all_of')} ${filterYear.value}`;

    resultsEl.innerHTML = `
      <div class="summary-bar">
        <div>
          <div class="summary-label">${t('dashboard.total')}</div>
          <div class="summary-period">${periodLabel}</div>
        </div>
        <div class="summary-amount">${inr(grandTotal)}</div>
      </div>
      ${cardsHtml}`;
  }

  // Debounce: wait 350ms after last change before firing API call
  let _loadTimer = null;
  function debouncedLoad() { clearTimeout(_loadTimer); _loadTimer = setTimeout(load, 350); }
  [filterYear, filterMonth, filterHouse].forEach(el => el.addEventListener('change', debouncedLoad));

  const retryBtn    = document.getElementById('retry-btn');
  const validateBtn = document.getElementById('validate-btn');
  const refreshBtn  = document.getElementById('refresh-btn');

  // Set tooltips in current language (static buttons can't use data-i18n pattern)
  if (validateBtn) validateBtn.dataset.tip = t('tip.validate');
  if (refreshBtn)  refreshBtn.dataset.tip  = t('tip.refresh');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const p = prevMonth();
      filterYear.value  = p.year;
      filterMonth.value = p.month;
      filterHouse.value = '';
      refreshBtn.disabled    = true;
      refreshBtn.textContent = '⏳';
      load(true).finally(() => {
        refreshBtn.disabled    = false;
        refreshBtn.textContent = '🔄';
      });
    });
  }

  if (validateBtn) {
    validateBtn.addEventListener('click', async () => {
      validateBtn.disabled  = true;
      validateBtn.textContent = '⏳';
      try {
        const res = await apiGet({ action: 'validateMasters' });
        showValidateResult(res);
      } catch {
        showToast(t('msg.network_error'), 'error');
      } finally {
        validateBtn.disabled   = false;
        validateBtn.textContent = '📋';
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', async () => {
      retryBtn.disabled = true;
      retryBtn.textContent = '…';
      try {
        const res = await apiGet({ action: 'retryDisconnected' });
        showToast(`${res.succeeded}/${res.retried} ${t('msg.notif_retried')}`, res.succeeded > 0 ? 'success' : 'warning');
        load();
      } catch {
        showToast(t('msg.network_error'), 'error');
      } finally {
        retryBtn.disabled    = false;
        retryBtn.textContent = t('dashboard.retry_btn');
      }
    });
  }

  load();
}

// ─── REPORT PAGE ─────────────────────────────────────────────────────────────
async function initReportPage() {
  applyTranslations();
  document.getElementById('lang-toggle')?.addEventListener('click', () =>
    setLang(getLang() === 'en' ? 'kn' : 'en'));

  const { month, year } = prevMonth();
  const badge = document.getElementById('report-month-badge');
  if (badge) badge.textContent = `${t('month.' + month)} ${year}`;

  const contentEl = document.getElementById('report-content');
  showLoader();
  loadHouseCache();

  // Building order as specified for the report sheet
  const REPORT_ORDER = ['Spatika', 'Manikya', 'Jalanidhi', 'Vaidurya', 'Aparanji'];

  try {
    const [dashRes, balRes] = await Promise.all([
      apiGet({ action: 'getDashboard', year, month }),
      apiGet({ action: 'getBalanceSummary', year, month }),
    ]);

    const balances = balRes.balances || {};
    const byHouse  = {};
    (dashRes.records || []).forEach(r => (byHouse[r.HouseID] = byHouse[r.HouseID] || []).push(r));

    const hdr = `<tr>
      <th>${t('report.col_house')}</th>
      <th>${t('report.col_rent')}</th>
      <th>${t('report.col_paid')}</th>
      <th>${t('report.col_balance')}</th>
      <th>${t('report.col_increment')}</th>
    </tr>`;

    let html = '';
    REPORT_ORDER.forEach(building => {
      const houses = HOUSES.filter(h => h.building === building);
      const rows   = houses.map(h => {
        const bEntry   = balances[h.id] || {};
        const isVacant = !balances[h.id] && !bEntry.futureOccupancy;
        // Building name and tenant name omitted — building shown in section header, number sufficient
        const label    = `${h.displayNum}`;

        if (isVacant) {
          return `<tr class="report-row-vacant">
            <td>${label} <span class="report-vacant-tag">${t('report.vacant')}</span></td>
            <td>—</td><td>—</td><td>—</td><td>—</td></tr>`;
        }

        // Payments for this month — computed first as needed for rent breakdown
        const paid        = (byHouse[h.id] || []).filter(p =>
          parseInt(p.RentForMonth) === month && parseInt(p.RentForYear) === year);
        const totalPaid   = paid.reduce((s, p) => s + parseFloat(p.AmountReceived || 0), 0);

        const bal         = bEntry.balance || 0;
        const thisRent    = bEntry.expectedRent || 0;
        // prevBal = what was owed at the start of this month (before this month's rent was added)
        const prevBal     = Math.max(0, bal + totalPaid - thisRent);
        const rentCell    = thisRent
          ? (prevBal > 0
            ? `<td class="report-cell-rent-detail">
                 <span class="report-rent-prev">${inr(prevBal)}</span>
                 <span class="report-rent-add">+ ${inr(thisRent)}</span>
                 <span class="report-rent-total">= ${inr(prevBal + thisRent)}</span>
               </td>`
            : `<td>${inr(thisRent)}</td>`)
          : `<td class="report-cell-nil">—</td>`;

        const balCell     = bal > 0
          ? `<td class="report-cell-balance">${inr(bal)}</td>`
          : `<td class="report-cell-nil">—</td>`;

        const isPartial   = totalPaid > 0 && totalPaid < thisRent;
        const paidClass   = isPartial ? 'report-cell-partial' : (totalPaid > 0 ? 'report-cell-paid' : 'report-cell-nil');
        // Sort payments by date; show each on its own line
        const sortedPaid  = [...paid].sort((a, b) => new Date(a.CollectedDate) - new Date(b.CollectedDate));
        const paidCell    = sortedPaid.length
          ? `<td class="${paidClass}">${sortedPaid.map(p =>
              `${inr(p.AmountReceived)}<br><span class="report-paid-date">${_fmtDateOnly(p.CollectedDate)}</span>`
            ).join('<br>')}</td>`
          : `<td class="report-cell-nil">—</td>`;

        const inc = (bEntry.upcomingIncrement && typeof bEntry.upcomingIncrement === 'object')
          ? bEntry.upcomingIncrement : null;
        const incCell = inc
          ? `<td class="report-cell-increment">⬆️ ${inc.effectiveDate}</td>`
          : (bEntry.nextIncrementDate
            ? `<td class="report-cell-inc-future">${bEntry.nextIncrementDate}</td>`
            : `<td class="report-cell-nil">—</td>`);

        return `<tr>${[
          `<td>${label}</td>`, rentCell, paidCell, balCell, incCell
        ].join('')}</tr>`;
      }).join('');

      html += `
        <div class="report-section">
          <div class="report-building-title">${building.toUpperCase()}</div>
          <div class="report-table-wrap">
            <table class="report-table">
              <thead>${hdr}</thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    });

    contentEl.innerHTML = html;
  } catch {
    contentEl.innerHTML = `<p class="msg-error">${t('msg.net_check')}</p>`;
  } finally {
    hideLoader();
  }
}

function _fmtDateOnly(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2,'0')}-${_MONTHS_SHORT[d.getMonth()]}-${d.getFullYear()}`;
}
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'collect')   initCollectPage();
  if (page === 'dashboard') initDashboardPage();
  if (page === 'report')    initReportPage();
});
