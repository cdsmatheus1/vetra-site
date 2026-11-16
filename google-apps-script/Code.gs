/**
 * Vetra Services: lead handler (Google Apps Script web app)
 *
 * Receives each estimate request from www.vetraservices.tech and:
 *   1. emails a branded summary to the owner (Portuguese),
 *   2. sends a WhatsApp alert to the owner (CallMeBot),
 *   3. emails a branded confirmation to the customer (in their language),
 *   4. appends the lead to a Google Sheet ("Vetra Leads").
 *
 * Setup: see README.md, section "Email bonito e WhatsApp".
 * Script properties (Project Settings > Script properties):
 *   WA_TOKEN            Meta permanent access token (system user)
 *   WA_PHONE_NUMBER_ID  Phone number ID shown in Meta > WhatsApp > API Setup
 *   WA_TO               (optional) number that receives alerts, default 16892487410
 *   WA_TEMPLATE         (optional) approved template name, default novo_orcamento
 *   WA_TEMPLATE_LANG    (optional) template language code, default pt_BR
 *   WHATSAPP_APIKEY     (optional) CallMeBot key, used only if the Meta settings are empty
 * Without any of these, everything works except the WhatsApp alert.
 */

var SETTINGS = {
  ownerEmail: 'vetraservices25@gmail.com',
  ownerWhatsapp: '+16892487410',
  businessPhone: '(689) 248-7410',
  businessPhoneLink: '+16892487410',
  site: 'https://www.vetraservices.tech',
  logo: 'https://www.vetraservices.tech/assets/logo.png',
  sendCustomerConfirmation: true,
  sheetName: 'Vetra Leads'
};

var C = {
  blue: '#4364af', blueDark: '#26407c', blueSoft: '#eef2fb',
  lime: '#d7df21', limeSoft: '#f8fadb',
  navy: '#131f33', ink: '#1d2a40', muted: '#5d6a80', line: '#e6eaf2', bg: '#f3f5fa'
};

/* ---------------- Web app entry points ---------------- */

function doPost(e) {
  var out = { ok: false };
  try {
    var d = JSON.parse(e.postData.contents);
    if (d._honey) return json({ ok: true });            // bot trap
    if (!d.name || !d.phone || !d.email) throw new Error('Missing required fields');
    d.receivedAt = Utilities.formatDate(new Date(), 'America/New_York', "dd/MM/yyyy 'às' HH:mm");

    sendOwnerEmail(d);
    out.email = true;
    try { sendWhatsapp(d); out.whatsapp = true; } catch (err) { out.whatsappError = String(err); }
    if (SETTINGS.sendCustomerConfirmation) {
      try { sendCustomerEmail(d); out.confirmation = true; } catch (err) { out.confirmationError = String(err); }
    }
    try { saveToSheet(d); out.sheet = true; } catch (err) { out.sheetError = String(err); }
    out.ok = true;
  } catch (err) {
    out.error = String(err);
  }
  return json(out);
}

function doGet() {
  return json({ ok: true, service: 'Vetra Services leads' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Senders ---------------- */

function sendOwnerEmail(d) {
  var pt = d.pt || {};
  MailApp.sendEmail({
    to: SETTINGS.ownerEmail,
    replyTo: d.email,
    name: 'Site Vetra Services',
    subject: 'Novo orçamento: ' + d.name + ' | ' + (pt.services || d.services),
    htmlBody: buildOwnerEmail(d),
    body: buildWhatsappText(d)
  });
}

function sendCustomerEmail(d) {
  var t = CUSTOMER_TEXT[d.lang] || CUSTOMER_TEXT.en;
  MailApp.sendEmail({
    to: d.email,
    replyTo: SETTINGS.ownerEmail,
    name: 'Vetra Services',
    subject: t.subject,
    htmlBody: buildCustomerEmail(d),
    body: t.plain.replace('{name}', firstName(d.name))
  });
}

function sendWhatsapp(d) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('WA_TOKEN');
  var phoneId = props.getProperty('WA_PHONE_NUMBER_ID');
  if (token && phoneId) return sendWhatsappMeta(d, props, token, phoneId);

  var key = props.getProperty('WHATSAPP_APIKEY');            // CallMeBot fallback
  if (!key) return;
  var url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(SETTINGS.ownerWhatsapp) +
    '&text=' + encodeURIComponent(buildWhatsappText(d)) + '&apikey=' + encodeURIComponent(key);
  UrlFetchApp.fetch(url, { muteHttpExceptions: true });
}

/* Official WhatsApp Cloud API (Meta). Sends the approved template "novo_orcamento". */
function sendWhatsappMeta(d, props, token, phoneId) {
  var pt = d.pt || {};
  // Template variables cannot contain line breaks, tabs or long runs of spaces.
  var v = function (x) { return String(clean(x) || '-').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').slice(0, 300); };
  var params = [
    d.name + (clean(d.company) ? ' (' + d.company + ')' : ''),
    d.phone,
    pt.services || d.services,
    d.city_zip,
    pt.timeline || d.timeline,
    'https://wa.me/' + phoneDigits(d.phone)
  ].map(function (x) { return { type: 'text', text: v(x) }; });

  var body = {
    messaging_product: 'whatsapp',
    to: (props.getProperty('WA_TO') || SETTINGS.ownerWhatsapp).replace(/\D/g, ''),
    type: 'template',
    template: {
      name: props.getProperty('WA_TEMPLATE') || 'novo_orcamento',
      language: { code: props.getProperty('WA_TEMPLATE_LANG') || 'pt_BR' },
      components: [{ type: 'body', parameters: params }]
    }
  };
  var res = UrlFetchApp.fetch('https://graph.facebook.com/v23.0/' + phoneId + '/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() >= 300) throw new Error('WhatsApp API ' + res.getResponseCode() + ': ' + res.getContentText());
}

function saveToSheet(d) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : null;
  if (!ss) {
    ss = SpreadsheetApp.create(SETTINGS.sheetName);
    props.setProperty('SHEET_ID', ss.getId());
    ss.getSheets()[0].appendRow(['Data', 'Nome', 'Telefone', 'Email', 'Empresa', 'Cliente', 'Serviços',
      'Local', 'Prazo', 'Imóvel', 'Investimento', 'Detalhes', 'Contato preferido', 'Idioma', 'Origem']);
    ss.getSheets()[0].setFrozenRows(1);
  }
  var pt = d.pt || {};
  ss.getSheets()[0].appendRow([d.receivedAt, d.name, d.phone, d.email, clean(d.company), pt.client_type || d.client_type,
    pt.services || d.services, d.city_zip, pt.timeline || d.timeline, clean(pt.property_type || d.property_type),
    pt.budget || d.budget, clean(d.details), pt.preferred_contact || d.preferred_contact, d.language, d.source]);
}

/* ---------------- Helpers ---------------- */

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function clean(v) { return (!v || v === '-') ? '' : v; }
function orNone(v) { return clean(v) || 'não informado'; }
function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
function phoneDigits(p) {
  var x = String(p || '').replace(/\D/g, '');
  return x.length === 10 ? '1' + x : x;
}

function buildWhatsappText(d) {
  var pt = d.pt || {};
  var digits = phoneDigits(d.phone);
  return [
    '*🔔 Novo pedido de orçamento*',
    '',
    '👤 *' + d.name + '*' + (clean(d.company) ? ' (' + d.company + ')' : ''),
    '📞 ' + d.phone,
    '✉️ ' + d.email,
    '',
    '🏷️ *Cliente:* ' + (pt.client_type || d.client_type),
    '⚡ *Serviços:* ' + (pt.services || d.services),
    '📍 *Local:* ' + d.city_zip,
    '⏱️ *Prazo:* ' + (pt.timeline || d.timeline),
    '🏠 *Imóvel:* ' + orNone(pt.property_type || d.property_type),
    '💰 *Investimento:* ' + (pt.budget || d.budget),
    '',
    '📝 *Detalhes:* ' + orNone(d.details),
    '',
    'Prefere contato por: ' + (pt.preferred_contact || d.preferred_contact) + ' · Idioma: ' + (pt.language || d.language),
    '',
    '👉 Responder no WhatsApp: https://wa.me/' + digits
  ].join('\n');
}

/* ---------------- Email templates ---------------- */

function button(href, label, bg, color) {
  return '<a href="' + esc(href) + '" style="display:inline-block;margin:4px 6px 4px 0;padding:12px 20px;border-radius:999px;' +
    'background:' + bg + ';color:' + color + ';font-weight:700;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif">' +
    label + '</a>';
}

function row(label, value) {
  return '<tr>' +
    '<td style="padding:10px 0;border-bottom:1px solid ' + C.line + ';color:' + C.muted + ';font-size:13px;width:38%;vertical-align:top">' + esc(label) + '</td>' +
    '<td style="padding:10px 0;border-bottom:1px solid ' + C.line + ';color:' + C.navy + ';font-size:14px;font-weight:700;vertical-align:top">' + esc(value) + '</td>' +
    '</tr>';
}

function chips(list) {
  return String(list || '').split(/,\s*/).filter(String).map(function (s) {
    return '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;background:' + C.blueSoft +
      ';color:' + C.blueDark + ';font-size:13px;font-weight:700">' + esc(s) + '</span>';
  }).join('');
}

function shell(inner, preheader) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:' + C.bg + '">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + esc(preheader) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.bg + ';padding:24px 12px">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:' + C.ink + '">' +
    // header
    '<tr><td style="padding:22px 28px;border-bottom:4px solid ' + C.lime + '">' +
    '<img src="' + SETTINGS.logo + '" alt="Vetra Services" height="44" style="display:block;height:44px;border:0"></td></tr>' +
    inner +
    // footer
    '<tr><td style="background:' + C.navy + ';padding:20px 28px;color:#aab6cc;font-size:12px;line-height:1.6">' +
    '<b style="color:#ffffff">Vetra Services</b> · Orlando, FL<br>' +
    '<a href="tel:' + SETTINGS.businessPhoneLink + '" style="color:' + C.lime + ';text-decoration:none">' + SETTINGS.businessPhone + '</a> · ' +
    '<a href="mailto:' + SETTINGS.ownerEmail + '" style="color:' + C.lime + ';text-decoration:none">' + SETTINGS.ownerEmail + '</a> · ' +
    '<a href="' + SETTINGS.site + '" style="color:' + C.lime + ';text-decoration:none">vetraservices.tech</a>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function buildOwnerEmail(d) {
  var pt = d.pt || {};
  var digits = phoneDigits(d.phone);
  var waText = encodeURIComponent((CUSTOMER_TEXT[d.lang] || CUSTOMER_TEXT.en).waReply.replace('{name}', firstName(d.name)));
  var urgent = /urgent/i.test(d.timeline);
  var inner =
    // title band
    '<tr><td style="background:' + C.blue + ';padding:26px 28px;color:#ffffff">' +
    '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:' + C.lime + ';font-weight:700">Novo pedido de orçamento</div>' +
    '<div style="font-size:26px;font-weight:800;line-height:1.25;margin-top:6px">' + esc(d.name) + '</div>' +
    '<div style="font-size:14px;color:#dbe3f5;margin-top:4px">' + esc(pt.client_type || d.client_type) +
    (clean(d.company) ? ' · ' + esc(d.company) : '') + ' · ' + esc(d.city_zip) + '</div>' +
    (urgent ? '<div style="display:inline-block;margin-top:12px;padding:5px 12px;border-radius:999px;background:' + C.lime + ';color:' + C.navy + ';font-size:12px;font-weight:800">URGENTE</div>' : '') +
    '</td></tr>' +
    // actions
    '<tr><td style="padding:22px 28px 6px">' +
    '<div style="font-size:13px;color:' + C.muted + ';margin-bottom:8px">Responda com um toque:</div>' +
    button('https://wa.me/' + digits + '?text=' + waText, 'Responder no WhatsApp', '#25d366', '#ffffff') +
    button('tel:+' + digits, 'Ligar ' + d.phone, C.blue, '#ffffff') +
    button('mailto:' + d.email, 'Responder por email', C.lime, C.navy) +
    '</td></tr>' +
    // services
    '<tr><td style="padding:18px 28px 0">' +
    '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.blue + ';font-weight:800;margin-bottom:10px">Serviços pedidos</div>' +
    chips(pt.services || d.services) + '</td></tr>' +
    // project
    '<tr><td style="padding:14px 28px 0">' +
    '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.blue + ';font-weight:800;margin-bottom:4px">Projeto</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    row('Prazo', pt.timeline || d.timeline) +
    row('Local', d.city_zip) +
    row('Tipo de imóvel', orNone(pt.property_type || d.property_type)) +
    row('Investimento previsto', pt.budget || d.budget) +
    '</table></td></tr>' +
    // details
    '<tr><td style="padding:18px 28px 0">' +
    '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.blue + ';font-weight:800;margin-bottom:10px">Detalhes do cliente</div>' +
    '<div style="background:' + C.limeSoft + ';border-left:4px solid ' + C.lime + ';border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.55;color:' + C.navy + '">' +
    esc(orNone(d.details)).replace(/\n/g, '<br>') + '</div></td></tr>' +
    // contact
    '<tr><td style="padding:18px 28px 24px">' +
    '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.blue + ';font-weight:800;margin-bottom:4px">Contato</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    row('Telefone', d.phone) +
    row('Email', d.email) +
    row('Prefere contato por', pt.preferred_contact || d.preferred_contact) +
    row('Idioma do cliente', pt.language || d.language) +
    row('Recebido em', d.receivedAt + ' (horário de Orlando)') +
    '</table></td></tr>';
  return shell(inner, d.name + ' pediu orçamento: ' + (pt.services || d.services));
}

var CUSTOMER_TEXT = {
  en: {
    subject: 'We received your estimate request | Vetra Services',
    hello: 'Hi {name},',
    title: 'Your request is in!',
    body: 'Thank you for contacting Vetra Services. A Vetra electrician will review your project and get back to you within 24 hours with next steps and a written, itemized estimate.',
    summary: 'Your request',
    services: 'Services', timeline: 'Timeline', location: 'Location',
    sooner: 'Need it sooner? Call or WhatsApp us:',
    call: 'Call', whatsapp: 'WhatsApp',
    waReply: 'Hi {name}, this is Vetra Services. We received your estimate request.',
    plain: 'Hi {name}, thank you for contacting Vetra Services. We will get back to you within 24 hours. Need it sooner? Call (689) 248-7410.'
  },
  pt: {
    subject: 'Recebemos seu pedido de orçamento | Vetra Services',
    hello: 'Olá, {name}!',
    title: 'Seu pedido chegou!',
    body: 'Obrigado por entrar em contato com a Vetra Services. Um eletricista da Vetra vai analisar o seu projeto e responder em até 24 horas com os próximos passos e um orçamento detalhado por escrito.',
    summary: 'Seu pedido',
    services: 'Serviços', timeline: 'Prazo', location: 'Local',
    sooner: 'Precisa antes? Ligue ou chame no WhatsApp:',
    call: 'Ligar', whatsapp: 'WhatsApp',
    waReply: 'Olá, {name}! Aqui é da Vetra Services. Recebemos o seu pedido de orçamento.',
    plain: 'Olá, {name}! Obrigado por entrar em contato com a Vetra Services. Vamos responder em até 24 horas. Precisa antes? Ligue (689) 248-7410.'
  },
  es: {
    subject: 'Recibimos su solicitud de presupuesto | Vetra Services',
    hello: 'Hola, {name}:',
    title: '¡Recibimos su solicitud!',
    body: 'Gracias por contactar a Vetra Services. Un electricista de Vetra revisará su proyecto y le responderá en menos de 24 horas con los próximos pasos y un presupuesto detallado por escrito.',
    summary: 'Su solicitud',
    services: 'Servicios', timeline: 'Plazo', location: 'Ubicación',
    sooner: '¿Lo necesita antes? Llámenos o escríbanos por WhatsApp:',
    call: 'Llamar', whatsapp: 'WhatsApp',
    waReply: 'Hola, {name}. Le escribimos de Vetra Services. Recibimos su solicitud de presupuesto.',
    plain: 'Hola, {name}. Gracias por contactar a Vetra Services. Le responderemos en menos de 24 horas. ¿Lo necesita antes? Llame al (689) 248-7410.'
  }
};

function buildCustomerEmail(d) {
  var t = CUSTOMER_TEXT[d.lang] || CUSTOMER_TEXT.en;
  var loc = d.local || {};
  var inner =
    '<tr><td style="background:' + C.blue + ';padding:28px;color:#ffffff">' +
    '<div style="font-size:15px;color:#dbe3f5">' + esc(t.hello.replace('{name}', firstName(d.name))) + '</div>' +
    '<div style="font-size:26px;font-weight:800;margin-top:6px">' + esc(t.title) + '</div></td></tr>' +
    '<tr><td style="padding:24px 28px 0;font-size:15px;line-height:1.6;color:' + C.ink + '">' + esc(t.body) + '</td></tr>' +
    '<tr><td style="padding:20px 28px 0">' +
    '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.blue + ';font-weight:800;margin-bottom:4px">' + esc(t.summary) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    row(t.services, loc.services || d.services) +
    row(t.timeline, loc.timeline || d.timeline) +
    row(t.location, d.city_zip) +
    '</table></td></tr>' +
    '<tr><td style="padding:22px 28px 26px">' +
    '<div style="font-size:14px;color:' + C.muted + ';margin-bottom:8px">' + esc(t.sooner) + '</div>' +
    button('tel:' + SETTINGS.businessPhoneLink, t.call + ' ' + SETTINGS.businessPhone, C.blue, '#ffffff') +
    button('https://wa.me/' + SETTINGS.businessPhoneLink.replace('+', ''), t.whatsapp, '#25d366', '#ffffff') +
    '</td></tr>';
  return shell(inner, t.title);
}

/* Run once from the editor to test everything with a sample lead. */
function testLead() {
  var sample = {
    name: 'Maria Souza', phone: '(407) 555-0123', email: SETTINGS.ownerEmail, company: 'MS Homes',
    client_type: 'Builder / GC', services: 'New construction, CCTV / security cameras', city_zip: 'Lake Nona',
    timeline: 'Urgent / ASAP', property_type: 'New construction (lot / plans)', budget: '$15,000 to $50,000',
    details: 'Casa nova de 3.200 sq ft. Preciso de infraestrutura, acabamento e 8 câmeras. Planta pronta.',
    preferred_contact: 'WhatsApp', language: 'Portuguese', lang: 'pt', source: 'teste',
    pt: { client_type: 'Construtora / Empreiteiro', services: 'Obras novas, CFTV e câmeras de segurança', timeline: 'Urgente, o quanto antes',
      property_type: 'Obra nova (terreno ou planta)', budget: 'De $15,000 a $50,000', preferred_contact: 'WhatsApp', language: 'português' },
    local: { services: 'Obras novas, CFTV e câmeras de segurança', timeline: 'Urgente, o quanto antes' }
  };
  var res = doPost({ postData: { contents: JSON.stringify(sample) } });
  Logger.log(res.getContent());
}

/* Run from the editor to test only the WhatsApp alert. */
function testWhatsapp() {
  sendWhatsapp({
    name: 'Cliente Teste', phone: '(407) 555-0123', email: 'teste@exemplo.com', company: '',
    services: 'CCTV / security cameras', city_zip: 'Orlando', timeline: 'Within 2 weeks', details: '',
    pt: { services: 'CFTV e câmeras de segurança', timeline: 'Em até 2 semanas' }
  });
  Logger.log('WhatsApp enviado. Confira o celular.');
}
