'use strict';

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    'header.dashboard':       'Dashboard',
    'header.collect':         'Collect',
    'header.lang_toggle':     'ಕನ್ನಡ',

    'collect.title':          'Collect Rent',
    'collect.subtitle':       'Scan the QR code on the house door to begin',
    'collect.scan_btn':       'Scan QR Code',
    'collect.manual_toggle':  'Enter house manually',
    'collect.cancel':         'Cancel',
    'collect.select_house':   'Select House',
    'collect.house_ph':       '— select a house —',
    'collect.continue':       'Continue',
    'collect.amount_label':   'Amount Received (₹)',
    'collect.amount_ph':      'e.g. 8000',
    'collect.month_label':    'Rent For Month',
    'collect.year_label':     'Year',
    'collect.back':           '← Back',
    'collect.save':           'Save',
    'collect.saving':         'Saving…',

    'dashboard.filter':       'Filter',
    'dashboard.year_label':   'Year',
    'dashboard.month_label':  'Month',
    'dashboard.all_months':   'All Months',
    'dashboard.house_label':  'House (optional)',
    'dashboard.all_houses':   'All Houses',
    'dashboard.total':        'Total Collected',
    'dashboard.loading':      'Loading…',

    'month.1':  'January',   'month.2':  'February',  'month.3':  'March',
    'month.4':  'April',     'month.5':  'May',        'month.6':  'June',
    'month.7':  'July',      'month.8':  'August',     'month.9':  'September',
    'month.10': 'October',   'month.11': 'November',   'month.12': 'December',

    'msg.house_not_found':    'House not found for this QR code.',
    'msg.network_error':      'Network error — please try again.',
    'msg.camera_denied':      'Camera access denied. Use manual entry below.',
    'msg.select_house':       'Please select a house.',
    'msg.invalid_amount':     'Enter a valid amount.',
    'msg.saved':              'Saved!',
    'msg.duplicate_prefix':   'Saved! Note: a record already exists for',
    'msg.net_check':          'Network error — check your connection.',
    'msg.no_records':         'No records found for the selected filters.',
    'msg.all_of':             'All of',
  },

  kn: {
    'header.dashboard':       'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'header.collect':         'ಸಂಗ್ರಹ',
    'header.lang_toggle':     'English',

    'collect.title':          'ಬಾಡಿಗೆ ಸಂಗ್ರಹ',
    'collect.subtitle':       'ಪ್ರಾರಂಭಿಸಲು ಮನೆಯ ಬಾಗಿಲಿನ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    'collect.scan_btn':       'QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    'collect.manual_toggle':  'ಹಸ್ತಚಾಲಿತವಾಗಿ ಮನೆ ಆಯ್ಕೆ ಮಾಡಿ',
    'collect.cancel':         'ರದ್ದುಮಾಡಿ',
    'collect.select_house':   'ಮನೆ ಆಯ್ಕೆ',
    'collect.house_ph':       '— ಮನೆ ಆಯ್ಕೆ ಮಾಡಿ —',
    'collect.continue':       'ಮುಂದುವರಿಸಿ',
    'collect.amount_label':   'ಸ್ವೀಕರಿಸಿದ ಮೊತ್ತ (₹)',
    'collect.amount_ph':      'ಉದಾ. 8000',
    'collect.month_label':    'ಬಾಡಿಗೆ ತಿಂಗಳಿಗೆ',
    'collect.year_label':     'ವರ್ಷ',
    'collect.back':           '← ಹಿಂದೆ',
    'collect.save':           'ಉಳಿಸಿ',
    'collect.saving':         'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',

    'dashboard.filter':       'ಫಿಲ್ಟರ್',
    'dashboard.year_label':   'ವರ್ಷ',
    'dashboard.month_label':  'ತಿಂಗಳು',
    'dashboard.all_months':   'ಎಲ್ಲಾ ತಿಂಗಳುಗಳು',
    'dashboard.house_label':  'ಮನೆ (ಐಚ್ಛಿಕ)',
    'dashboard.all_houses':   'ಎಲ್ಲಾ ಮನೆಗಳು',
    'dashboard.total':        'ಒಟ್ಟು ಸಂಗ್ರಹ',
    'dashboard.loading':      'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',

    'month.1':  'ಜನವರಿ',    'month.2':  'ಫೆಬ್ರವರಿ',  'month.3':  'ಮಾರ್ಚ್',
    'month.4':  'ಏಪ್ರಿಲ್',  'month.5':  'ಮೇ',          'month.6':  'ಜೂನ್',
    'month.7':  'ಜುಲೈ',     'month.8':  'ಆಗಸ್ಟ್',      'month.9':  'ಸೆಪ್ಟೆಂಬರ್',
    'month.10': 'ಅಕ್ಟೋಬರ್', 'month.11': 'ನವೆಂಬರ್',    'month.12': 'ಡಿಸೆಂಬರ್',

    'msg.house_not_found':    'ಈ QR ಕೋಡ್‌ಗೆ ಮನೆ ಕಂಡುಬಂದಿಲ್ಲ.',
    'msg.network_error':      'ನೆಟ್‌ವರ್ಕ್ ದೋಷ — ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'msg.camera_denied':      'ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಕೆಳಗೆ ಹಸ್ತಚಾಲಿತ ಆಯ್ಕೆ ಬಳಸಿ.',
    'msg.select_house':       'ದಯವಿಟ್ಟು ಮನೆ ಆಯ್ಕೆ ಮಾಡಿ.',
    'msg.invalid_amount':     'ಸರಿಯಾದ ಮೊತ್ತ ನಮೂದಿಸಿ.',
    'msg.saved':              'ಉಳಿಸಲಾಗಿದೆ!',
    'msg.duplicate_prefix':   'ಉಳಿಸಲಾಗಿದೆ! ಗಮನಿಸಿ: ಈ ತಿಂಗಳಿಗೆ ದಾಖಲೆ ಈಗಾಗಲೇ ಇದೆ',
    'msg.net_check':          'ನೆಟ್‌ವರ್ಕ್ ದೋಷ — ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.',
    'msg.no_records':         'ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ದಾಖಲೆಗಳಿಲ್ಲ.',
    'msg.all_of':             'ಎಲ್ಲಾ',
  },
};

// ─── LOCALE API ───────────────────────────────────────────────────────────────
function getLang() {
  return localStorage.getItem('rms-lang') || 'en';
}

/** Returns the translated string for key, falling back to English */
function t(key) {
  const lang = getLang();
  return (TRANSLATIONS[lang]?.[key]) ?? TRANSLATIONS.en[key] ?? key;
}

function setLang(lang) {
  localStorage.setItem('rms-lang', lang);
  location.reload();
}

// Updates [data-i18n] text and [data-i18n-placeholder] placeholder attributes
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = getLang();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();

  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.classList.add(getLang() === 'kn' ? 'lang-kn-active' : 'lang-en-active');
    btn.addEventListener('click', () => setLang(getLang() === 'kn' ? 'en' : 'kn'));
  }
});
