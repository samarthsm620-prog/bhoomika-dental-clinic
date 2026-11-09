const APPOINTMENT_WEBHOOK = 'https://api.manus.im/api/webhook/triggers/c52fc9be-e19c-4cc1-a216-bcde5fa96e94';
const CALLBACK_WEBHOOK = 'https://api.manus.im/api/webhook/triggers/4d03e54a-29c5-4948-a3dc-32f5596b279c';
const KNOWLEDGE_URL = 'clinic-knowledge.json';

const translations = {
  en: { kicker: 'Compassionate dental care, close to home', heroTitle: 'Touching lives,', heroAccent: 'perfecting smiles.', heroLead: 'A calm, clear dental experience for every age — from your first check-up to the confidence of a healthier smile.', bookingTitle: 'Find a dentist.<br><em>Find your next step.</em>', bookingLead: 'Tell us what you need and we’ll help you choose the right kind of care.' },
  kn: { kicker: 'ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರ ಕಾಳಜಿಯ ದಂತ ಚಿಕಿತ್ಸೆ', heroTitle: 'ಜೀವನ ಮುಟ್ಟುವ,', heroAccent: 'ನಗುವನ್ನು ಪರಿಪೂರ್ಣಗೊಳಿಸುವ.', heroLead: 'ಪ್ರತಿ ವಯಸ್ಸಿಗೂ ಶಾಂತ ಮತ್ತು ಸ್ಪಷ್ಟ ದಂತ ಆರೈಕೆ — ಮೊದಲ ತಪಾಸಣೆಯಿಂದ ಆರೋಗ್ಯಕರ ನಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸದವರೆಗೆ.', bookingTitle: 'ದಂತ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ.<br><em>ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಯಿರಿ.</em>', bookingLead: 'ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ತಿಳಿಸಿ; ಸರಿಯಾದ ಆರೈಕೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.' }
};

let currentLanguage = 'en';
let knowledge = null;
let lastAnswer = '';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function setStatus(element, message, kind = '') {
  element.textContent = message;
  element.className = `form-status${kind ? ` ${kind}` : ''}`;
}

async function postWebhook(url, payload) {
  // text/plain keeps the browser request simple for a static Pages frontend.
  return fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload), keepalive: true });
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
  button?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'kn' : 'en';
    document.documentElement.lang = currentLanguage === 'kn' ? 'kn' : 'en';
    button.setAttribute('aria-pressed', String(currentLanguage === 'kn'));
    $$('[data-i18n]').forEach((node) => { node.innerHTML = translations[currentLanguage][node.dataset.i18n]; });
  });
}

function initBooking() {
  const form = $('#booking-form');
  const status = $('#booking-status');
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
  let recognition;
  const open = (isOpen) => { fab.setAttribute('aria-expanded', String(isOpen)); panel.hidden = !isOpen; if (isOpen) listen.focus(); };
  fab?.addEventListener('click', () => open(panel.hidden));
  close?.addEventListener('click', () => open(false));
  read?.addEventListener('click', () => { if (lastAnswer) speak(lastAnswer); });
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    listen.disabled = true; listen.textContent = 'Voice input unavailable';
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition(); recognition.interimResults = false; recognition.maxAlternatives = 1; recognition.lang = 'en-IN';
  recognition.onstart = () => { listen.textContent = 'Listening…'; transcript.textContent = 'I’m listening. Tell me what you need.'; };
  recognition.onerror = () => { listen.textContent = 'Try again'; transcript.textContent = 'I could not hear that clearly. You can type your question or call the clinic.'; };
  recognition.onend = () => { listen.textContent = 'Start listening'; };
  recognition.onresult = async (event) => {
    const prompt = event.results[0][0].transcript;
    transcript.textContent = `“${prompt}”`;
    answer.textContent = 'Thinking…';
    const spoken = prompt.toLowerCase();
    if (spoken.includes('appointment') || spoken.includes('book')) { $('#booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#patient_name')?.focus(), 450); }
    lastAnswer = await askAssistant(prompt); answer.textContent = lastAnswer; speak(lastAnswer);
  };
  listen?.addEventListener('click', () => { recognition.lang = currentLanguage === 'kn' ? 'kn-IN' : 'en-IN'; recognition.start(); });
}

async function boot() { initNavigation(); initLanguage(); initBooking(); initCallback(); initSpecialtyCards(); await loadKnowledge(); initSearch(); initVoice(); }
boot();
