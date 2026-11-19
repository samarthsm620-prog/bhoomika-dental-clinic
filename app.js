const CALLBACK_WEBHOOK = 'https://api.manus.im/api/webhook/triggers/4d03e54a-29c5-4948-a3dc-32f5596b279c';
const KNOWLEDGE_URL = 'clinic-knowledge.json';
const CLINIC_PHONE = '919481731482';

const translations = {
  en: { kicker: 'Compassionate dental care, close to home', heroTitle: 'Care that feels close,', heroAccent: 'smiles that move with you.', heroLead: 'A calm, clear dental experience for every age — from your first check-up to the confidence of a healthier smile.', heroCta: 'Find your next step', heroExplore: 'Explore our care', navCare: 'Our care', navDoctor: 'Meet Dr. Lata', navVisit: 'Visit us', navBook: 'Book appointment', bookingTitle: 'Find a dentist.<br><em>Find your next step.</em>', bookingLead: 'Tell us what you need and we’ll help you choose the right kind of care.', careLabel: '02 / Our care', careTitle: 'Clear care for<br><em>real life.</em>', careIntro: 'From prevention to precision treatment, your plan starts with listening. Search a concern below or choose a specialty to learn more.', searchLabel: 'Search a dental concern', searchPlaceholder: 'Try “toothache”, “braces”, or “missing tooth”', galleryLabel: '05 / Inside the clinic', galleryTitle: 'A real place.<br><em>Ready for you.</em>', galleryIntro: 'See the rooms, equipment, entrance and people behind your care. These are photographs from Bhoomika Dental Clinic in Badami.', doctorLabel: '06 / Your clinician', hoursLabel: '07 / Find us', conditionsLabel: '04 / Understand your mouth', conditionsTitle: 'Oral health,<br><em>from A to Z.</em>', conditionsIntro: 'A calm starting point for common symptoms, conditions and care questions. Browse a letter or search a topic — this is education, not a diagnosis.', conditionsCta: 'Talk to the clinic <span aria-hidden="true">↗</span>', conditionsSearch: 'Search Aphthous ulcer, gum bleeding, dry mouth…', quizLabel: '03 / Quick self-check', quizTitle: 'Find your next step<br><em>in under a minute.</em>', quizIntro: 'Answer three simple questions and we’ll suggest a conversation to have with the clinic. This is guidance, not a diagnosis.', quizSubmit: 'Show my suggested next step <span aria-hidden="true">↗</span>' },
  kn: { kicker: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರ ಕಾಳಜಿಯ ದಂತ ಚಿಕಿತ್ಸೆ', heroTitle: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಕಾಳಜಿ,', heroAccent: 'ನಿಮ್ಮ ನಗುವಿನ ಹೊಸ ಹೆಜ್ಜೆ.', heroLead: 'ಪ್ರತಿ ವಯಸ್ಸಿಗೂ ಶಾಂತ ಮತ್ತು ಸ್ಪಷ್ಟ ದಂತ ಆರೈಕೆ — ಮೊದಲ ತಪಾಸಣೆಯಿಂದ ಆರೋಗ್ಯಕರ ನಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸದವರೆಗೆ.', heroCta: 'ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ', heroExplore: 'ನಮ್ಮ ಆರೈಕೆ ನೋಡಿ', navCare: 'ನಮ್ಮ ಆರೈಕೆ', navDoctor: 'ಡಾ. ಲತಾ ಅವರನ್ನು ಭೇಟಿ ಮಾಡಿ', navVisit: 'ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ', navBook: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', bookingTitle: 'ದಂತ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ.<br><em>ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ.</em>', bookingLead: 'ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ತಿಳಿಸಿ; ಸರಿಯಾದ ಆರೈಕೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.', careLabel: '02 / ನಮ್ಮ ಆರೈಕೆ', careTitle: 'ಸ್ಪಷ್ಟ ಆರೈಕೆ<br><em>ನಿಜ ಜೀವನಕ್ಕಾಗಿ.</em>', careIntro: 'ತಡೆಗಟ್ಟುವ ಆರೈಕೆಯಿಂದ ನಿಖರ ಚಿಕಿತ್ಸೆಯವರೆಗೆ, ನಿಮ್ಮ ಯೋಜನೆ ಕೇಳುವುದರಿಂದ ಆರಂಭವಾಗುತ್ತದೆ. ಸಮಸ್ಯೆಯನ್ನು ಹುಡುಕಿ ಅಥವಾ ಆರೈಕೆ ಆಯ್ಕೆಮಾಡಿ.', searchLabel: 'ದಂತ ಸಮಸ್ಯೆ ಹುಡುಕಿ', searchPlaceholder: '“ಹಲ್ಲು ನೋವು”, “ಬ್ರೇಸಸ್” ಅಥವಾ “ಹಲ್ಲು ಕಾಣೆಯಾಗಿದೆ” ಎಂದು ಪ್ರಯತ್ನಿಸಿ', galleryLabel: '05 / ಕ್ಲಿನಿಕ್ ಒಳಗೆ', galleryTitle: 'ನಿಜವಾದ ಸ್ಥಳ.<br><em>ನಿಮಗಾಗಿ ಸಿದ್ಧ.</em>', galleryIntro: 'ನಿಮ್ಮ ಆರೈಕೆಯ ಹಿಂದೆ ಇರುವ ಕೊಠಡಿಗಳು, ಉಪಕರಣಗಳು ಮತ್ತು ಜನರನ್ನು ನೋಡಿ. ಇವು ಬಾದಾಮಿಯ ಭೂಮಿಕಾ ದಂತ ಚಿಕಿತ್ಸಾಲಯದ ಚಿತ್ರಗಳು.', doctorLabel: '06 / ನಿಮ್ಮ ವೈದ್ಯರು', hoursLabel: '07 / ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ', conditionsLabel: '04 / ನಿಮ್ಮ ಬಾಯಿಯ ಆರೋಗ್ಯ ತಿಳಿಯಿರಿ', conditionsTitle: 'ಬಾಯಿಯ ಆರೋಗ್ಯ,<br><em>A ರಿಂದ Z ವರೆಗೆ.</em>', conditionsIntro: 'ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು, ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಆರೈಕೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಶಾಂತ ಆರಂಭ. ಅಕ್ಷರದ ಮೂಲಕ ನೋಡಿ ಅಥವಾ ಹುಡುಕಿ — ಇದು ಶಿಕ್ಷಣಕ್ಕಾಗಿ, ರೋಗನಿರ್ಣಯವಲ್ಲ.', conditionsCta: 'ಕ್ಲಿನಿಕ್ ಜೊತೆ ಮಾತನಾಡಿ <span aria-hidden="true">↗</span>', conditionsSearch: 'ಅಫ್ತಸ್ ಹುಣ್ಣು, ಒಸಡು ರಕ್ತಸ್ರಾವ, ಬಾಯಿ ಒಣಗುವುದು… ಹುಡುಕಿ', quizLabel: '03 / ತ್ವರಿತ ಸ್ವಯಂ ಪರಿಶೀಲನೆ', quizTitle: 'ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ<br><em>ಒಂದು ನಿಮಿಷದಲ್ಲಿ.</em>', quizIntro: 'ಮೂರು ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ; ಕ್ಲಿನಿಕ್ ಜೊತೆ ಮಾತನಾಡಲು ಸೂಕ್ತವಾದ ಮುಂದಿನ ವಿಷಯವನ್ನು ನಾವು ಸೂಚಿಸುತ್ತೇವೆ. ಇದು ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ, ರೋಗನಿರ್ಣಯವಲ್ಲ.', quizSubmit: 'ನನ್ನ ಮುಂದಿನ ಹೆಜ್ಜೆ ತೋರಿಸಿ <span aria-hidden="true">↗</span>' }
};

let currentLanguage = 'en';
let knowledge = null;
let lastAnswer = '';
let disorders = [];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function setStatus(element, message, kind = '') {
  element.textContent = message;
  element.className = `form-status${kind ? ` ${kind}` : ''}`;
}

async function postWebhook(url, payload) {
  // The Trigger webhook accepts JSON; CORS is enabled on the live endpoint.
  return fetch(url, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true });
}

async function submitAppointment(payload) {
  const response = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.checkout_url) throw new Error(result.error || 'Payment checkout could not be created.');
  window.location.assign(result.checkout_url);
  return result;
}

function collectForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const files = $('#patient_files', form)?.files;
  if (files?.length) data.attachment_names = [...files].map((file) => file.name);
  delete data.patient_files;
  return data;
}

function buildWhatsAppUrl(payload) {
  const lines = [
    'Bhoomika Dental Clinic appointment request',
    `Name: ${payload.patient_name || ''}`,
    `Phone: ${payload.patient_phone || ''}`,
    `Email: ${payload.patient_email || ''}`,
    `Care: ${payload.specialty || ''}`,
    `Preferred: ${payload.preferred_date || 'Flexible'} ${payload.preferred_time || ''}`,
    `Concern: ${payload.dental_concern || 'Not specified'}`
  ];
  return `https://wa.me/${CLINIC_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function initNavigation() {
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  const closeMenu = () => {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open navigation menu');
  };
  const openMenu = () => {
    nav?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', 'Close navigation menu');
    $('a, button', nav)?.focus();
  };
  toggle?.addEventListener('click', () => {
    if (nav?.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    } else {
      openMenu();
    }
  });
  toggle?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
  nav?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle?.focus();
    }
  });
  $$('a', nav).forEach((link) => link.addEventListener('click', () => {
    if (window.matchMedia?.('(max-width: 720px)').matches) closeMenu();
  }));
  $$('[data-scroll]').forEach((button) => button.addEventListener('click', () => $(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));
  $$('[data-open-booking]').forEach((button) => button.addEventListener('click', () => {
    $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('#patientName')?.focus(), 450);
  }));
}

function initHeroMedia() {
  const slides = $$('.hero-slide');
  const count = $('.hero-slide-count');
  const toggle = $('.hero-slide-toggle');
  if (slides.length < 2) return;
  let active = 0;
  let timer = 0;
  let paused = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const show = (next) => {
    active = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => { slide.hidden = index !== active; });
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };
  const stop = () => { if (timer) window.clearInterval(timer); timer = 0; };
  const start = () => { stop(); if (!paused && !document.hidden) timer = window.setInterval(() => show(active + 1), 6500); };
  $('.hero-slide-prev')?.addEventListener('click', () => show(active - 1));
  $('.hero-slide-next')?.addEventListener('click', () => show(active + 1));
  toggle?.addEventListener('click', () => { paused = !paused; toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Play automatic clinic highlights' : 'Pause automatic clinic highlights'); toggle.textContent = paused ? '▶' : 'Ⅱ'; start(); });
  $('.hero-media')?.addEventListener('mouseenter', stop);
  $('.hero-media')?.addEventListener('mouseleave', start);
  $('.hero-media')?.addEventListener('focusin', stop);
  $('.hero-media')?.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', start);
  start();
}

function selectSpecialty(value) {
  const select = $('#careArea');
  if (!select) return;
  const option = [...select.options].find((candidate) => candidate.value.toLowerCase() === value.toLowerCase() || candidate.text.toLowerCase().includes(value.toLowerCase()));
  if (option) select.value = option.value;
  $$('.specialty-card').forEach((card) => card.classList.toggle('is-selected', card.dataset.specialty === value));
  $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('#patientName')?.focus(), 450);
  setStatus($('#booking-status'), `${value} selected — tell us your name and phone number to request a visit.`);
}

function initSpecialtyCards() {
  $$('.specialty-card[data-specialty]').forEach((card) => {
    card.addEventListener('click', () => selectSpecialty(card.dataset.specialty));
  });
}

function initLanguage() {
  const button = $('.language-toggle');
  const apply = () => {
    $$('[data-i18n]').forEach((node) => { const value = translations[currentLanguage][node.dataset.i18n]; if (value) node.innerHTML = value; });
    $$('[data-i18n-placeholder]').forEach((node) => { const value = translations[currentLanguage][node.dataset.i18nPlaceholder]; if (value) node.setAttribute('placeholder', value); });
    $$('[data-l10n-en][data-l10n-kn]').forEach((node) => { node.textContent = node.dataset[currentLanguage === 'kn' ? 'l10nKn' : 'l10nEn']; });
    const allTab = $('#condition-letters .condition-letter');
    if (allTab) allTab.textContent = currentLanguage === 'kn' ? 'ಎಲ್ಲಾ' : 'All';
  };
  button?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'kn' : 'en';
    document.documentElement.lang = currentLanguage === 'kn' ? 'kn' : 'en';
    button.setAttribute('aria-pressed', String(currentLanguage === 'kn'));
    apply();
  });
  apply();
}

function initBooking() {
  const form = $('#booking-form');
  const status = $('#booking-status');
  const workflow = $('#workflow_type');
  const specialty = $('#careArea');
  const specialtyLabel = $('label[for="careArea"]');
  const confirmation = $('#booking-confirmation');
  const appointmentOptions = ['General dental consultation', 'Dental X-Ray', 'Implants, Dentures, Crowns & Bridges', 'Orthodontic Braces Treatment', 'Teeth Scaling & Bleaching', 'Smile Design & Veneering', 'Dental Filling', 'Root Canal Treatment (RCT)', 'Extraction & Impaction Surgery'];
  const screeningOptions = ['Routine Cleaning', 'Deep Scaling or Root Planing', "Kids' Dental Preventive", 'Senior Oral Care'];
  const updateCareOptions = () => {
    if (!workflow || !specialty) return;
    const preventive = workflow.value === 'preventive_screening';
    specialty.innerHTML = `<option value="">${preventive ? 'Select a screening package' : 'Select a care area'}</option>${(preventive ? screeningOptions : appointmentOptions).map((item) => `<option>${item}</option>`).join('')}`;
    if (specialtyLabel) specialtyLabel.childNodes[0].textContent = preventive ? 'Screening package ' : 'What can we help with? ';
  };
  workflow?.addEventListener('change', updateCareOptions);
  updateCareOptions();
  $('#booking-whatsapp')?.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const payload = { ...collectForm(form), workflow_type: workflow?.value || 'appointment' };
    window.open(buildWhatsAppUrl(payload), '_blank', 'noopener,noreferrer');
  });
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const payload = { ...collectForm(form), submitted_at: new Date().toISOString(), language: currentLanguage, source: 'website-booking-form' };
    const isPreventive = payload.workflow_type === 'preventive_screening';
    setStatus(status, isPreventive ? 'Sending your preventive screening request…' : 'Sending your appointment request…');
    if (confirmation) confirmation.hidden = true;
    try {
      const automation = await submitAppointment(payload);
      const emailStatus = automation.email_status || (automation.email_configured ? 'sent' : 'not_configured');
      const emailReady = emailStatus === 'sent' || Boolean(automation.email_configured);
      const smsStatus = automation.sms_status || (payload.sms_opt_in === 'yes' ? 'not_configured' : 'not_opted_in');
      const emailMessage = emailStatus === 'partial'
        ? 'Your request reached the clinic, but one of the email notifications could not be delivered. The clinic will contact you by phone.'
        : emailReady
          ? 'Thank you — your request and email confirmation have been sent.'
          : 'Thank you — your request reached the clinic. Automated email confirmation is not active yet; the clinic will contact you by phone.';
      const smsMessage = payload.sms_opt_in !== 'yes' ? '' : smsStatus === 'sent'
        ? (currentLanguage === 'kn' ? ' ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ SMS ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ.' : ' An appointment-related SMS request was sent.')
        : smsStatus === 'not_configured'
          ? (currentLanguage === 'kn' ? ' SMS ಸೇವೆ ಇನ್ನೂ ಸಕ್ರಿಯವಾಗಿಲ್ಲ; ಕ್ಲಿನಿಕ್ ಫೋನ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸುತ್ತದೆ.' : ' SMS updates are not active yet; the clinic will contact you by phone.')
          : (currentLanguage === 'kn' ? ' SMS ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ; ದಯವಿಟ್ಟು ಕ್ಲಿನಿಕ್‌ಗೆ ಕರೆ ಮಾಡಿ.' : ' The SMS could not be sent; please call the clinic if you need help.');
      setStatus(status, `${emailMessage}${smsMessage}`, 'success');
      if (confirmation) {
        confirmation.hidden = false;
        const confirmationMessage = emailStatus === 'partial' ? 'Request received. Email delivery was incomplete, so the clinic will contact you by phone. This is a request, not a confirmed appointment.' : emailReady ? 'Request received. The clinic team has been notified and a confirmation email was sent to you. This is a request, not a confirmed appointment.' : 'Request received. The clinic team has your request; automated email confirmation is still being set up. This is a request, not a confirmed appointment. For urgent concerns, call +91 9481731482.';
        confirmation.textContent = `${confirmationMessage}${smsMessage}`;
      }
      form.reset();
    } catch (error) {
      if (confirmation) confirmation.hidden = false;
      if (confirmation) confirmation.textContent = 'We could not complete the request just now. Please call +91 9481731482 so the clinic can help you directly.';
      setStatus(status, 'Your request could not be fully sent just now. Please call +91 9481731482.', 'error');
    }
  });
}

function initCheckup() {
  const form = $('#checkup-form');
  const result = $('#checkup-result');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const answers = Object.fromEntries(new FormData(form).entries());
    const labels = currentLanguage === 'kn'
      ? { pain: 'ನೋವು ಅಥವಾ ಹಲ್ಲಿನ ಸಂವೇದನೆ', gums: 'ಒಸಡುಗಳ ರಕ್ತಸ್ರಾವ ಅಥವಾ ಊತ', missing: 'ಕಾಣೆಯಾದ ಅಥವಾ ಹಾನಿಗೊಂಡ ಹಲ್ಲು', alignment: 'ಹಲ್ಲುಗಳ ಜೋಡಣೆ ಕುರಿತು ಪ್ರಶ್ನೆ', preventive: 'ನಿಯಮಿತ ತಪಾಸಣೆ ಅಥವಾ ಸ್ವಚ್ಛತೆ', soon: 'ಸಾಧ್ಯವಾದಷ್ಟು ಬೇಗ', week: 'ಮುಂದಿನ ವಾರದೊಳಗೆ', routine: 'ಮುಂಚಿತವಾಗಿ ಯೋಜನೆ', recent: 'ಕಳೆದ 6 ತಿಂಗಳೊಳಗೆ', year: '6–12 ತಿಂಗಳುಗಳ ಹಿಂದೆ', long: 'ಒಂದು ವರ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಹಿಂದೆ' }
      : { pain: 'Pain or tooth sensitivity', gums: 'Bleeding or swollen gums', missing: 'Missing or damaged tooth', alignment: 'Question about tooth alignment', preventive: 'Routine check-up or cleaning', soon: 'As soon as possible', week: 'Within the next week', routine: 'Planning ahead', recent: 'Within the last 6 months', year: '6–12 months ago', long: 'More than a year ago' };
    const concern = labels[answers.concern] || labels.preventive;
    const urgency = labels[answers.urgency] || labels.week;
    const lastVisit = labels[answers.last_visit] || labels.long;
    const title = currentLanguage === 'kn' ? 'ಸಾಮಾನ್ಯ ದಂತ ಸಮಾಲೋಚನೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ.' : 'Start with a general dental consultation.';
    const text = currentLanguage === 'kn' ? 'ಈ ಸ್ವಯಂ ಪರಿಶೀಲನೆ ರೋಗನಿರ್ಣಯವಲ್ಲ. ವೈದ್ಯರು ನಿಮ್ಮನ್ನು ಪರಿಶೀಲಿಸಿ, ಸೂಕ್ತ ಮುಂದಿನ ಹೆಜ್ಜೆಯನ್ನು ವಿವರಿಸುತ್ತಾರೆ.' : 'This self-check is not a diagnosis. A dentist can assess your concern and explain the appropriate next step.';
    const urgencyNote = answers.urgency === 'soon' ? (currentLanguage === 'kn' ? ' ಮುಖದ ತೀವ್ರ ಊತ, ನಿಯಂತ್ರಿಸಲಾಗದ ರಕ್ತಸ್ರಾವ ಅಥವಾ ಉಸಿರಾಟ/ನುಂಗುವ ತೊಂದರೆ ಇದ್ದರೆ ತಕ್ಷಣ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ.' : ' If you have severe facial swelling, uncontrolled bleeding, or difficulty breathing or swallowing, seek urgent medical care now.') : '';
    const bookLabel = currentLanguage === 'kn' ? 'ಈ ಮಾಹಿತಿಯೊಂದಿಗೆ ವಿನಂತಿ ಮಾಡಿ' : 'Use this result to request a visit';
    result.hidden = false;
    result.innerHTML = `<strong>${title}</strong><p>${text}${urgencyNote}</p><button class="button button-dark" id="checkup-book" type="button">${bookLabel} <span aria-hidden="true">↗</span></button>`;
    $('#checkup-book')?.addEventListener('click', () => {
      const workflow = $('#workflow_type');
      if (workflow) { workflow.value = 'appointment'; workflow.dispatchEvent(new Event('change', { bubbles: true })); }
      selectSpecialty('General dental consultation');
      const concernField = $('#dental_concern');
      if (concernField) concernField.value = `${concern}; preferred timing: ${urgency}; last dental visit: ${lastVisit}. Self-check only; no diagnosis.`;
      concernField?.focus();
    });
  });
}

function initCallback() {
  const form = $('#callback-form');
  const status = $('#callback-status');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    setStatus(status, 'Sending…');
    const payload = { ...collectForm(form), submitted_at: new Date().toISOString(), source: 'sticky-callback-row', language: currentLanguage };
    if (payload.website) return;
    delete payload.website;
    try {
      await postWebhook(CALLBACK_WEBHOOK, payload);
      setStatus(status, 'Received — the clinic will call you back soon.', 'success');
      form.reset();
    } catch (error) {
      setStatus(status, 'Please call +91 9481731482 directly.', 'error');
    }
  });
}
function initFeedback() {
  const form = $('#feedback-form');
  const status = $('#feedback-status');
  const average = $('#feedback-average');
  const count = $('#feedback-count');
  const key = 'bhoomika-patient-feedback-v1';
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem(key) || '[]'); } catch { entries = []; }
  const renderSummary = () => {
    if (!entries.length) { average.textContent = '—'; count.textContent = 'No reviews yet'; return; }
    const value = entries.reduce((sum, entry) => sum + Number(entry.rating), 0) / entries.length;
    average.textContent = value.toFixed(1);
    count.textContent = `${entries.length} ${entries.length === 1 ? 'review' : 'reviews'} shared`;
  };
  renderSummary();
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = collectForm(form);
    entries.push({ rating: Number(data.rating), message: data.message.trim(), name: data.name.trim(), created_at: new Date().toISOString() });
    try { localStorage.setItem(key, JSON.stringify(entries.slice(-20))); } catch { /* keep the interaction useful if storage is blocked */ }
    renderSummary();
    form.reset();
    setStatus(status, 'Thank you — your feedback has been saved on this device.', 'success');
  });
}
async function loadKnowledge() {
  try { knowledge = await fetch(KNOWLEDGE_URL).then((response) => response.json()); } catch { knowledge = { specialties: {} }; }
}

function initSearch() {
  const input = $('#specialty-search');
  const result = $('#search-result');
  $('#search-clear')?.addEventListener('click', () => { input.value = ''; result.textContent = ''; input.focus(); });
  input?.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) { result.textContent = ''; return; }
    const match = Object.entries(knowledge?.specialties || {}).find(([term]) => query.includes(term) || term.includes(query));
    if (match) {
      result.innerHTML = `We can help with <strong>${match[1]}</strong>. <button type="button" class="search-action" data-search-specialty="${match[1]}">Select it in the booking form ↗</button>`;
      $('.search-action', result)?.addEventListener('click', () => selectSpecialty(match[1]));
    } else result.textContent = 'Try “toothache”, “braces”, “missing tooth”, or “cleaning”.';
  });
}

function initConditions() {
  const grid = $('#condition-grid');
  const letters = $('#condition-letters');
  const input = $('#condition-search');
  if (!grid || !letters || !disorders.length) return;
  let activeLetter = '';
  const renderCards = () => {
    const query = input.value.trim().toLowerCase();
    const visible = disorders.filter((item) => (!activeLetter || item.letter === activeLetter) && (!query || `${item.name} ${item.summary} ${item.type}`.toLowerCase().includes(query)));
    grid.innerHTML = visible.length ? visible.map((item) => `<article class="condition-card"><div class="condition-card-top"><span class="condition-letter-mark">${item.letter}</span><span class="condition-type">${item.type}</span></div><h3>${item.name}</h3><p>${item.summary}</p><p class="condition-care"><strong>When to ask for care:</strong> ${item.care}</p><a class="condition-source" href="${item.url}" ${item.url.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>Source: ${item.source} ↗</a></article>`).join('') : '<p class="condition-empty">No topic matches that search. Try a symptom, condition or care question.</p>';
  };
  letters.innerHTML = `<button class="condition-letter is-active" type="button" data-letter="" role="tab" aria-selected="true">${currentLanguage === 'kn' ? 'ಎಲ್ಲಾ' : 'All'}</button>${disorders.map((item) => `<button class="condition-letter" type="button" data-letter="${item.letter}" role="tab" aria-selected="false">${item.letter}</button>`).join('')}`;
  $$('.condition-letter', letters).forEach((button) => button.addEventListener('click', () => {
    activeLetter = button.dataset.letter;
    input.value = '';
    $$('.condition-letter', letters).forEach((item) => { const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-selected', String(selected)); });
    renderCards();
  }));
  input.addEventListener('input', () => { activeLetter = ''; $$('.condition-letter', letters).forEach((item, index) => { item.classList.toggle('is-active', index === 0); item.setAttribute('aria-selected', String(index === 0)); }); renderCards(); });
  renderCards();
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage === 'kn' ? 'kn-IN' : 'en-IN';
  utterance.rate = .96;
  window.speechSynthesis.speak(utterance);
}

function localAnswer(prompt) {
  const text = prompt.toLowerCase();
  const specialties = knowledge?.specialties || {};
  const match = Object.entries(specialties).find(([term]) => text.includes(term));
  if (text.includes('hour') || text.includes('time') || text.includes('open')) return currentLanguage === 'kn' ? 'ನಮ್ಮ ಕ್ಲಿನಿಕ್ ಬೆಳಿಗ್ಗೆ 10:30 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2:30 ರವರೆಗೆ ಮತ್ತು ಸಂಜೆ 5 ರಿಂದ 7:30 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ. ಸೋಮವಾರ ಉಚಿತ ಸಮಾಲೋಚನೆ ಬೆಳಿಗ್ಗೆ 10:30 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2 ರವರೆಗೆ.' : 'We are open from 10:30 AM to 2:30 PM and 5:00 PM to 7:30 PM. Monday free consultations run from 10:30 AM to 2:00 PM.';
  if (text.includes('where') || text.includes('address') || text.includes('location')) return currentLanguage === 'kn' ? 'ನಾವು ಬಾದಾಮಿಯ ಟಿಎಂಸಿ ಕಾಂಪ್ಲೆಕ್ಸ್‌ನಲ್ಲಿ ಇದ್ದೇವೆ.' : 'We are at TMC Complex in Badami.';
  if (match) return currentLanguage === 'kn' ? `${match[1]} ಕುರಿತು ನಾವು ಸಹಾಯ ಮಾಡಬಹುದು. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿನಂತಿಸಲು ಬುಕ್ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಫಾರ್ಮ್ ಬಳಸಿ.` : `We can help with ${match[1]}. Use the appointment form to request a visit.`;
  if (text.includes('urgent') || text.includes('swelling') || text.includes('bleeding') || text.includes('knocked')) return currentLanguage === 'kn' ? 'ತೀವ್ರ ನೋವು, ಊತ ಅಥವಾ ನಿಯಂತ್ರಿಸಲಾಗದ ರಕ್ತಸ್ರಾವ ಇದ್ದರೆ ತಕ್ಷಣ ಕ್ಲಿನಿಕ್‌ಗೆ ಕರೆ ಮಾಡಿ: +91 9481731482.' : 'For severe pain, swelling, uncontrolled bleeding, or a knocked-out tooth, please call the clinic now at +91 9481731482.';
  return currentLanguage === 'kn' ? 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವು ಇಲ್ಲಿದ್ದೇವೆ. ಗಂಟೆಗಳು, ಸ್ಥಳ ಅಥವಾ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕುರಿತು ಕೇಳಿ.' : 'I’m here to help. Ask about clinic hours, location, or booking an appointment.';
}

function setAssistantMode(mode) {
  const label = $('#voice-mode');
  if (!label) return;
  const messages = currentLanguage === 'kn'
    ? { checking: 'ಜೆಮಿನಿ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…', online: 'ಜೆಮಿನಿ ಸಂಪರ್ಕಗೊಂಡಿದೆ.', offline: 'ಜೆಮಿನಿ ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ — ಕ್ಲಿನಿಕ್ ಮಾಹಿತಿಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.' }
    : { checking: 'Checking Gemini connection…', online: 'Gemini is connected.', offline: 'Gemini is not connected yet — showing clinic information instead.' };
  label.textContent = messages[mode] || messages.offline;
  label.dataset.state = mode;
}

async function askAssistant(prompt) {
  setAssistantMode('checking');
  try {
    const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, language: currentLanguage === 'kn' ? 'Kannada' : 'English' }) });
    if (response.ok) { const data = await response.json(); if (data.text) { setAssistantMode('online'); return data.text; } }
  } catch { /* local fallback is intentional */ }
  setAssistantMode('offline');
  return localAnswer(prompt);
}

function initVoice() {
  const fab = $('#voice-toggle');
  const panel = $('#voice-panel');
  const close = $('#voice-close');
  const listen = $('#voice-listen');
  const transcript = $('#voice-transcript');
  const answer = $('#voice-answer');
  const read = $('#voice-speak');
  const question = $('#voice-question');
  const ask = $('#voice-ask');
  let recognition;
  const open = (isOpen) => {
    fab.setAttribute('aria-expanded', String(isOpen));
    panel.hidden = !isOpen;
    if (isOpen) {
      listen.focus();
    } else {
      fab.focus();
    }
  };
  fab?.addEventListener('click', () => open(panel.hidden));
  close?.addEventListener('click', () => open(false));
  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      open(false);
    }
  });
  read?.addEventListener('click', () => { if (lastAnswer) speak(lastAnswer); });
  const handlePrompt = async (prompt) => {
    transcript.textContent = `“${prompt}”`;
    answer.textContent = 'Thinking…';
    const spoken = prompt.toLowerCase();
    const matched = Object.entries(knowledge?.specialties || {}).find(([term]) => spoken.includes(term));
    if (matched) selectSpecialty(matched[1]);
    else if (spoken.includes('appointment') || spoken.includes('book')) { $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#patientName')?.focus(), 450); }
    lastAnswer = await askAssistant(prompt); answer.textContent = lastAnswer; speak(lastAnswer);
  };
  ask?.addEventListener('click', () => { const prompt = question.value.trim(); if (prompt) { question.value = ''; handlePrompt(prompt); } });
  question?.addEventListener('keydown', (event) => { if (event.key === 'Enter') ask?.click(); });
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    listen.disabled = true; listen.textContent = 'Voice input unavailable';
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition(); recognition.interimResults = false; recognition.maxAlternatives = 1; recognition.lang = 'en-IN';
  recognition.onstart = () => { listen.textContent = 'Listening…'; transcript.textContent = 'I’m listening. Tell me what you need.'; };
  recognition.onerror = () => { listen.textContent = 'Try again'; transcript.textContent = 'I could not hear that clearly. You can type your question or call the clinic.'; };
  recognition.onend = () => { listen.textContent = 'Start listening'; };
  recognition.onresult = (event) => handlePrompt(event.results[0][0].transcript);
  listen?.addEventListener('click', () => { recognition.lang = currentLanguage === 'kn' ? 'kn-IN' : 'en-IN'; recognition.start(); });
}

function initCookieConsent() {
  const banner = $('#cookie-consent');
  if (!banner) return;
  const key = 'bhoomika-analytics-consent-v1';
  const measurementId = document.documentElement.dataset.gaMeasurementId?.trim();
  const loadAnalytics = () => {
    if (!measurementId || window.__bhoomikaAnalyticsLoaded) return;
    window.__bhoomikaAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  };
  const save = (value) => {
    try { localStorage.setItem(key, value); } catch { /* consent remains session-only if storage is unavailable */ }
    banner.hidden = true;
    if (value === 'accepted') loadAnalytics();
  };
  let consent = '';
  try { consent = localStorage.getItem(key) || ''; } catch { consent = ''; }
  if (consent === 'accepted') loadAnalytics();
  if (!consent) banner.hidden = false;
  $('#cookie-accept')?.addEventListener('click', () => save('accepted'));
  $('#cookie-essential')?.addEventListener('click', () => save('essential'));
}

async function loadDisorders() { try { disorders = await fetch('oral-disorders.json').then((response) => response.json()); } catch { disorders = []; } }
function initPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('payment');
  const confirmation = $('#booking-confirmation');
  if (!confirmation || !state) return;
  confirmation.hidden = false;
  confirmation.className = state === 'success' ? 'form-status success' : 'form-status';
  confirmation.textContent = state === 'success'
    ? 'Payment received. The clinic and patient confirmation emails are being sent directly from the clinic system. Please check the patient email for the appointment number.'
    : 'Payment was cancelled. No appointment payment was completed.';
  $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
async function boot() { initCookieConsent(); initNavigation(); initHeroMedia(); initLanguage(); initBooking(); initCheckup(); initCallback(); initFeedback(); initSpecialtyCards(); initPaymentReturn(); await Promise.all([loadKnowledge(), loadDisorders()]); initSearch(); initConditions(); initVoice(); }
boot();
