/* Vetra Services: site scripts */
(function () {
  'use strict';

  /* ===== Config ===== */
  var CONFIG = {
    phone: '+16892487410',
    whatsapp: '16892487410',
    email: 'vetraservices25@gmail.com',
    // Leads are emailed through FormSubmit (free, no backend needed).
    // The very first submission sends an activation email to the address below —
    // click "Activate" once and every following lead arrives in your inbox.
    // Preferred: Google Apps Script web app (branded email + WhatsApp + Google Sheet).
    // Paste the web app URL here after deploying google-apps-script/Code.gs.
    // While it is empty, leads go through FormSubmit below.
    appsScriptUrl: '',
    endpoint: 'https://formsubmit.co/ajax/vetraservices25@gmail.com',
    // WhatsApp alert for every new lead, sent through CallMeBot (free).
    // Paste the API key CallMeBot sends you on WhatsApp below. While it is empty,
    // no WhatsApp alert is sent (leads still arrive by email).
    whatsappAlert: {
      phone: '+16892487410',
      apikey: ''
    }
  };

  function t(en, vars) { return window.VetraI18n ? window.VetraI18n.t(en, vars) : en.replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); }

  /* ===== Header shadow on scroll ===== */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===== Mobile drawer ===== */
  var drawer = document.getElementById('drawer');
  var menuBtn = document.getElementById('menuBtn');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (drawer && menuBtn) {
    menuBtn.addEventListener('click', function () { setDrawer(true); });
    document.getElementById('drawerClose').addEventListener('click', function () { setDrawer(false); });
    drawer.addEventListener('click', function (e) { if (e.target === drawer || e.target.closest('a')) setDrawer(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
  }

  /* ===== Reveal on scroll ===== */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ===== Year ===== */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ===== Lead form ===== */
  var form = document.getElementById('leadForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.fstep'));
  var bars = form.querySelectorAll('.progress span');
  var stepLabel = document.getElementById('stepLabel');
  var backBtn = document.getElementById('backBtn');
  var nextBtn = document.getElementById('nextBtn');
  var submitBtn = document.getElementById('submitBtn');
  var sendError = document.getElementById('sendError');
  var current = 0;

  function show(i) {
    current = i;
    steps.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    bars.forEach(function (b, k) {
      b.classList.toggle('done', k < i);
      b.classList.toggle('on', k === i);
    });
    stepLabel.textContent = t('Step {n} of {total}', { n: i + 1, total: steps.length });
    backBtn.hidden = i === 0;
    nextBtn.hidden = i === steps.length - 1;
    submitBtn.hidden = i !== steps.length - 1;
    sendError.classList.remove('show');
  }

  function stepError(n, on) {
    var el = form.querySelector('[data-err="' + n + '"]');
    if (el) el.classList.toggle('show', on);
  }

  function digits(v) { return (v || '').replace(/\D/g, ''); }
  function validPhone(v) { var d = digits(v); return d.length === 10 || (d.length === 11 && d[0] === '1'); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim()); }

  function checkField(id, test) {
    var input = document.getElementById(id);
    var ok = test(input.value);
    input.closest('.field').classList.toggle('invalid', !ok);
    return ok;
  }

  function validate(i) {
    var n = i + 1;
    if (n === 1) {
      var ok1 = !!form.querySelector('input[name="client_type"]:checked');
      stepError(1, !ok1); return ok1;
    }
    if (n === 2) {
      var ok2 = form.querySelectorAll('input[name="services"]:checked').length > 0;
      stepError(2, !ok2); return ok2;
    }
    if (n === 3) {
      var a = checkField('city', function (v) { return v.trim().length >= 2; });
      var b = checkField('timeline', function (v) { return !!v; });
      return a && b;
    }
    if (n === 4) {
      var c = checkField('name', function (v) { return v.trim().length >= 2; });
      var d = checkField('phone', validPhone);
      var e = checkField('email', validEmail);
      var f = document.getElementById('consent').checked;
      stepError(4, !f);
      return c && d && e && f;
    }
    return true;
  }

  function focusFirstInvalid() {
    var el = steps[current].querySelector('.invalid input, .invalid select, input:not([type=hidden])');
    if (el) el.focus({ preventScroll: true });
  }

  nextBtn.addEventListener('click', function () {
    if (!validate(current)) { focusFirstInvalid(); return; }
    show(current + 1);
    var card = document.getElementById('formCard');
    if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('vetra:lang', function () { show(current); });
  backBtn.addEventListener('click', function () { show(Math.max(0, current - 1)); });

  // Enter key advances instead of submitting early
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && current < steps.length - 1) {
      e.preventDefault(); nextBtn.click();
    }
  });

  // Clear errors as the user fixes things
  form.addEventListener('change', function (e) {
    var fs = e.target.closest('.fstep');
    if (fs) stepError(fs.getAttribute('data-step'), false);
    var f = e.target.closest('.field');
    if (f) f.classList.remove('invalid');
    // Auto-advance on step 1 radio choice
    if (e.target.name === 'client_type') setTimeout(function () { if (current === 0) nextBtn.click(); }, 220);
  });
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('invalid');
  });

  // Phone mask: (407) 555-0123
  var phone = document.getElementById('phone');
  phone.addEventListener('input', function () {
    var d = digits(phone.value);
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    d = d.slice(0, 10);
    var out = d;
    if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
    else if (d.length > 0) out = '(' + d;
    phone.value = out;
  });

  // Pre-fill from URL (?type=builder&service=cctv)
  var params = new URLSearchParams(location.search);
  var typeMap = { homeowner: 'ct1', builder: 'ct2', investor: 'ct3', flipper: 'ct3', business: 'ct4' };
  var ct = typeMap[(params.get('type') || '').toLowerCase()];
  if (ct) document.getElementById(ct).checked = true;
  var svc = (params.get('service') || '').toLowerCase();
  if (svc) {
    var box = form.querySelector('input[name="services"][data-key="' + svc + '"]');
    if (box) box.checked = true;
  }
  if (ct) show(1); else show(0);

  function collect() {
    var fd = new FormData(form);
    var services = fd.getAll('services').join(', ');
    return {
      name: (fd.get('name') || '').trim(),
      phone: fd.get('phone'),
      email: (fd.get('email') || '').trim(),
      company: fd.get('company') || '-',
      client_type: fd.get('client_type'),
      services: services,
      city_zip: fd.get('city'),
      timeline: fd.get('timeline'),
      property_type: fd.get('property') || '-',
      budget: fd.get('budget') || 'Not sure yet',
      details: fd.get('details') || '-',
      preferred_contact: fd.get('contact_pref'),
      language: ({ en: 'English', pt: 'Portuguese', es: 'Spanish' })[document.documentElement.lang] || 'English',
      source: (params.get('utm_source') || document.referrer || 'direct') + (params.get('utm_campaign') ? ' / ' + params.get('utm_campaign') : ''),
      page: location.href.split('#')[0],
      _honey: fd.get('_honey') || ''
    };
  }

  function waText(d) {
    return encodeURIComponent(t("Hi Vetra, I'd like an estimate.") + '\n') +
      encodeURIComponent('Name: ' + d.name + '\nI am: ' + d.client_type + '\nServices: ' + d.services +
        '\nLocation: ' + d.city_zip + '\nTimeline: ' + d.timeline + '\nDetails: ' + d.details);
  }

  // Builds the WhatsApp alert sent to the owner (always in Portuguese).
  function alertText(d) {
    var pt = function (v) { return window.VetraI18n ? window.VetraI18n.to('pt', v) : v; };
    var val = function (v) { return (!v || v === '-') ? 'não informado' : v; };
    var digits = (d.phone || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '1' + digits;
    var services = (d.services || '').split(', ').map(pt).join(', ');
    var lang = { English: 'inglês', Portuguese: 'português', Spanish: 'espanhol' }[d.language] || d.language;
    var lines = [
      '*Novo pedido de orçamento (site Vetra)*',
      '',
      'Nome: ' + d.name,
      'Telefone: ' + d.phone,
      'Email: ' + d.email,
      'Cliente: ' + pt(d.client_type) + (d.company && d.company !== '-' ? ' (' + d.company + ')' : ''),
      'Serviços: ' + services,
      'Local: ' + d.city_zip,
      'Prazo: ' + pt(d.timeline),
      'Imóvel: ' + val(pt(d.property_type)),
      'Investimento: ' + pt(d.budget),
      'Detalhes: ' + val(d.details),
      'Prefere contato por: ' + pt(d.preferred_contact),
      'Idioma do cliente: ' + lang,
      '',
      'Responder no WhatsApp: https://wa.me/' + digits,
      'Ligar: +' + digits
    ];
    return lines.join('\n');
  }

  // Adds Portuguese labels (owner email/WhatsApp) and labels in the customer's language (confirmation email).
  function scriptPayload(d) {
    var lang = document.documentElement.lang || 'en';
    var tr = function (l, v) { return window.VetraI18n ? window.VetraI18n.to(l, v) : v; };
    var list = function (l, v) { return (v || '').split(', ').map(function (x) { return tr(l, x); }).join(', '); };
    var out = Object.assign({}, d, {
      lang: lang,
      pt: {
        client_type: tr('pt', d.client_type),
        services: list('pt', d.services),
        timeline: tr('pt', d.timeline),
        property_type: tr('pt', d.property_type),
        budget: tr('pt', d.budget),
        preferred_contact: tr('pt', d.preferred_contact),
        language: { English: 'inglês', Portuguese: 'português', Spanish: 'espanhol' }[d.language] || d.language
      },
      local: { services: list(lang, d.services), timeline: tr(lang, d.timeline) }
    });
    return out;
  }

  function sendWhatsappAlert(d) {
    var cfg = CONFIG.whatsappAlert;
    if (!cfg || !cfg.apikey) return;
    var url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(cfg.phone) +
      '&text=' + encodeURIComponent(alertText(d)) + '&apikey=' + encodeURIComponent(cfg.apikey);
    try { fetch(url, { mode: 'no-cors', keepalive: true }).catch(function () {}); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(current)) { focusFirstInvalid(); return; }
    var data = collect();
    if (data._honey) return; // bot

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    sendError.classList.remove('show');

    var payload = Object.assign({}, data, {
      _subject: 'New lead: ' + data.client_type + ' | ' + data.services + ' (' + data.city_zip + ')',
      _template: 'table',
      _captcha: 'false',
      _replyto: data.email
    });
    delete payload._honey;

    var request;
    if (CONFIG.appsScriptUrl) {
      // Apps Script sends the branded email, the WhatsApp alert and saves the lead.
      request = fetch(CONFIG.appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify(scriptPayload(data))   // text/plain: no CORS preflight
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          return { ok: r.ok && j.ok === true, j: j };
        });
      });
    } else {
      sendWhatsappAlert(data);
      request = fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); });
    }

    request
      .then(function (res) {
        if (!res.ok || String(res.j.success) === 'false') throw new Error(res.j.message || 'Send failed');
        done(data);
      })
      .catch(function () {
        var wa = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + waText(data);
        var mail = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Estimate request: ' + data.name) +
          '&body=' + encodeURIComponent(Object.keys(data).filter(function (k) { return k[0] !== '_'; }).map(function (k) { return k + ': ' + data[k]; }).join('\n'));
        var link = function (href, label, blank) { return '<a style="text-decoration:underline"' + (blank ? ' target="_blank" rel="noopener"' : '') + ' href="' + href + '">' + label + '</a>'; };
        var tpl = t('SEND_ERROR');
        if (tpl === 'SEND_ERROR') tpl = 'We couldn\u2019t send the form right now. Please send it in one tap via {wa}, {mail} or call {tel}.';
        sendError.innerHTML = tpl.replace('{wa}', link(wa, 'WhatsApp', true)).replace('{mail}', link(mail, t('email'))).replace('{tel}', link('tel:' + CONFIG.phone, '(689) 248-7410'));
        sendError.classList.add('show');
      })
      .then(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      });
  });

  function done(data) {
    form.hidden = true;
    var s = document.getElementById('success');
    document.getElementById('successName').textContent = data.name.split(' ')[0] || t('there');
    document.getElementById('successWa').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + waText(data);
    s.classList.add('show');
    s.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Conversion tracking hooks (fire only if GA4 / Meta Pixel are installed later)
    try { if (window.gtag) window.gtag('event', 'generate_lead', { value: 1, service: data.services }); } catch (e) {}
    try { if (window.fbq) window.fbq('track', 'Lead'); } catch (e) {}
  }
})();
