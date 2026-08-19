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
async function apiGet(params) {
  const url = new URL(CONFIG.API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString());
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
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  return `${h.building} ${h.displayNum}`;
}

function populateHouseSelect(el) {
  BUILDINGS.forEach(building => {
    const grp = document.createElement('optgroup');
    grp.label = building;
    HOUSES.filter(h => h.building === building).forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = houseLabel(h);
      grp.appendChild(opt);
    });
    el.appendChild(grp);
  });
}

// ─── COLLECT PAGE ─────────────────────────────────────────────────────────────
function initCollectPage() {
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

  let currentHouse = null;
  let scanner      = null;

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
    const entry = HOUSES.find(x => x.id === house.HouseID);
    const friendlyName = entry ? `${entry.building} ${entry.displayNum}` : house.HouseLabel;
    houseInfoEl.innerHTML = `
      <p class="house-building">${house.BuildingName}</p>
      <p class="house-name">${friendlyName}</p>
      <p class="house-id">${house.HouseID}</p>
    `;
    scanSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    document.getElementById('amount').value = '';
    document.getElementById('amount').focus();
  }

  function resetToScan() {
    currentHouse = null;
    formSection.classList.add('hidden');
    scanSection.classList.remove('hidden');
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

  rentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentHouse) return;

    const amount    = parseFloat(document.getElementById('amount').value);
    const rentMonth = parseInt(monthSel.value);
    const rentYear  = parseInt(yearSel.value);

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
function initDashboardPage() {
  const filterYear  = document.getElementById('filter-year');
  const filterMonth = document.getElementById('filter-month');
  const filterHouse = document.getElementById('filter-house');
  const loadingEl   = document.getElementById('loading');
  const resultsEl   = document.getElementById('results');

  populateYearSelect(filterYear);
  populateMonthSelect(filterMonth);
  populateHouseSelect(filterHouse);

  filterMonth.value = prevMonth().month;

  async function load() {
    loadingEl.classList.remove('hidden');
    resultsEl.innerHTML = '';

    const params = { action: 'getDashboard', year: filterYear.value };
    if (filterMonth.value) params.month  = filterMonth.value;
    if (filterHouse.value) params.houseId = filterHouse.value;

    try {
      const res = await apiGet(params);
      if (res.error) {
        resultsEl.innerHTML = `<p class="msg-error">${res.error}</p>`;
        return;
      }
      render(res.records);
    } catch {
      resultsEl.innerHTML = `<p class="msg-error">${t('msg.net_check')}</p>`;
    } finally {
      loadingEl.classList.add('hidden');
    }
  }

  function render(records) {
    // Build a lookup: houseId → [payment, ...]
    const byHouse = {};
    records.forEach(r => (byHouse[r.HouseID] = byHouse[r.HouseID] || []).push(r));

    // When a specific house is chosen, show only its building
    const targetBuilding = filterHouse.value
      ? HOUSES.find(h => h.id === filterHouse.value)?.building
      : null;

    const isMonthSelected = !!filterMonth.value;
    let grandTotal = 0;
    let cardsHtml  = '';

    BUILDINGS.forEach(building => {
      if (targetBuilding && building !== targetBuilding) return;

      let buildingTotal = 0;
      let rowsHtml = '';

      HOUSES.filter(h => h.building === building).forEach(h => {
        if (filterHouse.value && h.id !== filterHouse.value) return;

        const payments = byHouse[h.id] || [];

        if (payments.length === 0) {
          rowsHtml += `
            <div class="house-row unpaid">
              <div class="row-info">
                <span class="row-label">${h.building} ${h.displayNum}</span>
              </div>
              <span class="row-amount no-pay">—</span>
            </div>`;
        } else {
          const hasDup = isMonthSelected && payments.length > 1;

          if (hasDup) {
            // Consolidated row: total + per-payment split lines always visible
            const total = payments.reduce((s, p) => s + p.AmountReceived, 0);
            buildingTotal += total;
            grandTotal    += total;
            const monthLabel  = `${t('month.' + payments[0].RentForMonth)} ${payments[0].RentForYear}`;
            const splitLines  = payments.map(p =>
              `<div class="dup-split">
                <span class="split-amount">${inr(p.AmountReceived)}</span>
                <span class="split-date">${formatDate(p.CollectedDate)}</span>
              </div>`
            ).join('');
            rowsHtml += `
              <div class="house-row paid dup-entry">
                <div class="row-info">
                  <span class="row-label">${h.building} ${h.displayNum} ⚠️</span>
                  <span class="row-sub">${monthLabel} · ${payments.length} ${t('msg.payments')}</span>
                  <div class="dup-splits">${splitLines}</div>
                </div>
                <span class="row-amount">${inr(total)}</span>
              </div>`;
          } else {
            payments.forEach(p => {
              buildingTotal += p.AmountReceived;
              grandTotal    += p.AmountReceived;
              rowsHtml += `
              <div class="house-row paid">
                <div class="row-info">
                  <span class="row-label">${h.building} ${h.displayNum}</span>
                  <span class="row-sub">${t('month.' + p.RentForMonth)} ${p.RentForYear}</span>
                  <span class="row-date">${formatDate(p.CollectedDate)}</span>
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
      return;
    }

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

  [filterYear, filterMonth, filterHouse].forEach(el => el.addEventListener('change', load));
  load();
}

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'collect')   initCollectPage();
  if (page === 'dashboard') initDashboardPage();
});
