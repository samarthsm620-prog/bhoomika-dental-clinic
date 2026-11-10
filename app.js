const APPOINTMENT_WEBHOOK = 'https://api.manus.im/api/webhook/triggers/c52fc9be-e19c-4cc1-a216-bcde5fa96e94';
const CALLBACK_WEBHOOK = 'https://api.manus.im/api/webhook/triggers/4d03e54a-29c5-4948-a3dc-32f5596b279c';
const KNOWLEDGE_URL = 'clinic-knowledge.json';

const translations = {
  en: { kicker: 'Compassionate dental care, close to home', heroTitle: 'Care that feels close,', heroAccent: 'smiles that move with you.', heroLead: 'A calm, clear dental experience for every age — from your first check-up to the confidence of a healthier smile.', heroCta: 'Find your next step', heroExplore: 'Explore our care', navCare: 'Our care', navDoctor: 'Meet Dr. Lata', navVisit: 'Visit us', navBook: 'Book appointment', bookingTitle: 'Find a dentist.<br><em>Find your next step.</em>', bookingLead: 'Tell us what you need and we’ll help you choose the right kind of care.', careLabel: '02 / Our care', careTitle: 'Clear care for<br><em>real life.</em>', careIntro: 'From prevention to precision treatment, your plan starts with listening. Search a concern below or choose a specialty to learn more.', searchLabel: 'Search a dental concern', searchPlaceholder: 'Try “toothache”, “braces”, or “missing tooth”', galleryLabel: '05 / Inside the clinic', galleryTitle: 'A real place.<br><em>Ready for you.</em>', galleryIntro: 'See the rooms, equipment, entrance and people behind your care. These are photographs from Bhoomika Dental Clinic in Badami.', doctorLabel: '06 / Your clinician', hoursLabel: '07 / Find us', conditionsLabel: '04 / Understand your mouth', conditionsTitle: 'Oral health,<br><em>from A to Z.</em>', conditionsIntro: 'A calm starting point for common symptoms, conditions and care questions. Browse a letter or search a topic — this is education, not a diagnosis.', conditionsCta: 'Talk to the clinic <span aria-hidden="true">↗</span>', conditionsSearch: 'Search Aphthous ulcer, gum bleeding, dry mouth…' },
  kn: { kicker: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರ ಕಾಳಜಿಯ ದಂತ ಚಿಕಿತ್ಸೆ', heroTitle: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಕಾಳಜಿ,', heroAccent: 'ನಿಮ್ಮ ನಗುವಿನ ಹೊಸ ಹೆಜ್ಜೆ.', heroLead: 'ಪ್ರತಿ ವಯಸ್ಸಿಗೂ ಶಾಂತ ಮತ್ತು ಸ್ಪಷ್ಟ ದಂತ ಆರೈಕೆ — ಮೊದಲ ತಪಾಸಣೆಯಿಂದ ಆರೋಗ್ಯಕರ ನಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸದವರೆಗೆ.', heroCta: 'ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ', heroExplore: 'ನಮ್ಮ ಆರೈಕೆ ನೋಡಿ', navCare: 'ನಮ್ಮ ಆರೈಕೆ', navDoctor: 'ಡಾ. ಲತಾ ಅವರನ್ನು ಭೇಟಿ ಮಾಡಿ', navVisit: 'ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ', navBook: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', bookingTitle: 'ದಂತ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ.<br><em>ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ.</em>', bookingLead: 'ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ತಿಳಿಸಿ; ಸರಿಯಾದ ಆರೈಕೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.', careLabel: '02 / ನಮ್ಮ ಆರೈಕೆ', careTitle: 'ಸ್ಪಷ್ಟ ಆರೈಕೆ<br><em>ನಿಜ ಜೀವನಕ್ಕಾಗಿ.</em>', careIntro: 'ತಡೆಗಟ್ಟುವ ಆರೈಕೆಯಿಂದ ನಿಖರ ಚಿಕಿತ್ಸೆಯವರೆಗೆ, ನಿಮ್ಮ ಯೋಜನೆ ಕೇಳುವುದರಿಂದ ಆರಂಭವಾಗುತ್ತದೆ. ಸಮಸ್ಯೆಯನ್ನು ಹುಡುಕಿ ಅಥವಾ ಆರೈಕೆ ಆಯ್ಕೆಮಾಡಿ.', searchLabel: 'ದಂತ ಸಮಸ್ಯೆ ಹುಡುಕಿ', searchPlaceholder: '“ಹಲ್ಲು ನೋವು”, “ಬ್ರೇಸಸ್” ಅಥವಾ “ಹಲ್ಲು ಕಾಣೆಯಾಗಿದೆ” ಎಂದು ಪ್ರಯತ್ನಿಸಿ', galleryLabel: '05 / ಕ್ಲಿನಿಕ್ ಒಳಗೆ', galleryTitle: 'ನಿಜವಾದ ಸ್ಥಳ.<br><em>ನಿಮಗಾಗಿ ಸಿದ್ಧ.</em>', galleryIntro: 'ನಿಮ್ಮ ಆರೈಕೆಯ ಹಿಂದೆ ಇರುವ ಕೊಠಡಿಗಳು, ಉಪಕರಣಗಳು ಮತ್ತು ಜನರನ್ನು ನೋಡಿ. ಇವು ಬಾದಾಮಿಯ ಭೂಮಿಕಾ ದಂತ ಚಿಕಿತ್ಸಾಲಯದ ಚಿತ್ರಗಳು.', doctorLabel: '06 / ನಿಮ್ಮ ವೈದ್ಯರು', hoursLabel: '07 / ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ', conditionsLabel: '04 / ನಿಮ್ಮ ಬಾಯಿಯ ಆರೋಗ್ಯ ತಿಳಿಯಿರಿ', conditionsTitle: 'ಬಾಯಿಯ ಆರೋಗ್ಯ,<br><em>A ರಿಂದ Z ವರೆಗೆ.</em>', conditionsIntro: 'ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು, ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಆರೈಕೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಶಾಂತ ಆರಂಭ. ಅಕ್ಷರದ ಮೂಲಕ ನೋಡಿ ಅಥವಾ ಹುಡುಕಿ — ಇದು ಶಿಕ್ಷಣಕ್ಕಾಗಿ, ರೋಗನಿರ್ಣಯವಲ್ಲ.', conditionsCta: 'ಕ್ಲಿನಿಕ್ ಜೊತೆ ಮಾತನಾಡಿ <span aria-hidden="true">↗</span>', conditionsSearch: 'ಅಫ್ತಸ್ ಹುಣ್ಣು, ಒಸಡು ರಕ್ತಸ್ರಾವ, ಬಾಯಿ ಒಣಗುವುದು… ಹುಡುಕಿ' }
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

function collectForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function initNavigation() {
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('[data-scroll]').forEach((button) => button.addEventListener('click', () => $(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));
  $$('[data-open-booking]').forEach((button) => button.addEventListener('click', () => {
    $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('#patient_name')?.focus(), 450);
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
  const select = $('#specialty');
  if (!select) return;
  const option = [...select.options].find((candidate) => candidate.value.toLowerCase() === value.toLowerCase() || candidate.text.toLowerCase().includes(value.toLowerCase()));
  if (option) select.value = option.value;
  $$('.specialty-card').forEach((card) => card.classList.toggle('is-selected', card.dataset.specialty === value));
  $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('#patient_name')?.focus(), 450);
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
  const specialty = $('#specialty');
  const specialtyLabel = $('label[for="specialty"]');
  const appointmentOptions = ['Dental X-Ray', 'Implants, Dentures, Crowns & Bridges', 'Orthodontic Braces Treatment', 'Teeth Scaling & Bleaching', 'Smile Design & Veneering', 'Dental Filling', 'Root Canal Treatment (RCT)', 'Extraction & Impaction Surgery'];
  const screeningOptions = ['Routine Cleaning', 'Deep Scaling or Root Planing', "Kids' Dental Preventive", 'Senior Oral Care'];
  const updateCareOptions = () => {
    if (!workflow || !specialty) return;
    const preventive = workflow.value === 'preventive_screening';
    specialty.innerHTML = `<option value="">${preventive ? 'Select a screening package' : 'Select a care area'}</option>${(preventive ? screeningOptions : appointmentOptions).map((item) => `<option>${item}</option>`).join('')}`;
    if (specialtyLabel) specialtyLabel.childNodes[0].textContent = preventive ? 'Screening package ' : 'What can we help with? ';
  };
  workflow?.addEventListener('change', updateCareOptions);
  updateCareOptions();
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const payload = { ...collectForm(form), submitted_at: new Date().toISOString(), language: currentLanguage, source: 'website-booking-form' };
    const isPreventive = payload.workflow_type === 'preventive_screening';
    setStatus(status, isPreventive ? 'Sending your preventive screening request…' : 'Sending your appointment request…');
    try {
      await postWebhook(APPOINTMENT_WEBHOOK, payload);
      setStatus(status, 'Thank you — your request is on its way to the clinic. We’ll be in touch shortly.', 'success');
      form.reset();
    } catch (error) {
      setStatus(status, 'We could not send that just now. Please call +91 9481731482 and we’ll help you directly.', 'error');
    }
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

async function askAssistant(prompt) {
  try {
    const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, language: currentLanguage === 'kn' ? 'Kannada' : 'English' }) });
    if (response.ok) { const data = await response.json(); if (data.text) return data.text; }
  } catch { /* local fallback is intentional */ }
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
  const open = (isOpen) => { fab.setAttribute('aria-expanded', String(isOpen)); panel.hidden = !isOpen; if (isOpen) listen.focus(); };
  fab?.addEventListener('click', () => open(panel.hidden));
  close?.addEventListener('click', () => open(false));
  read?.addEventListener('click', () => { if (lastAnswer) speak(lastAnswer); });
  const handlePrompt = async (prompt) => {
    transcript.textContent = `“${prompt}”`;
    answer.textContent = 'Thinking…';
    const spoken = prompt.toLowerCase();
    const matched = Object.entries(knowledge?.specialties || {}).find(([term]) => spoken.includes(term));
    if (matched) selectSpecialty(matched[1]);
    else if (spoken.includes('appointment') || spoken.includes('book')) { $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#patient_name')?.focus(), 450); }
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

async function loadDisorders() { try { disorders = await fetch('oral-disorders.json').then((response) => response.json()); } catch { disorders = []; } }
async function boot() { initNavigation(); initHeroMedia(); initLanguage(); initBooking(); initCallback(); initFeedback(); initSpecialtyCards(); await Promise.all([loadKnowledge(), loadDisorders()]); initSearch(); initConditions(); initVoice(); }
boot();
