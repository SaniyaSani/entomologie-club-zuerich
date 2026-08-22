(() => {
  const config = window.ENTO_SITE_CONFIG || {};
  const calendarConfig = config.calendar || {};
  const page = document.body.dataset.page || "home";
  const state = { events: [], filter: "all" };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const locale = "de-CH";
  const displayTimeZone = calendarConfig.timeZone || "Europe/Zurich";

  const TYPE_LABELS = {
    meeting: "Sitzung", excursion: "Exkursion", identification: "Bestimmung",
    bioblitz: "BioBlitz", workshop: "Workshop", talk: "Vortrag",
    social: "Treffen", event: "Event", default: "Event"
  };
  const STATUS_LABELS = {
    open: "Offen", registration: "Anmeldung erforderlich", full: "Ausgebucht",
    members: "Nur für Mitglieder", finished: "Beendet"
  };
  const DEFAULT_HONORARY_MEMBERS = [
    {
      firstName: "Oliver",
      lastName: "Hawlitschek",
      portrait: "assets/club-logo-maskottchen.png"
    }
  ];

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[character]));
  }
  function safeUrl(value = "") {
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function truthy(value = "") { return /^(yes|true|ja|1|required|erforderlich)$/i.test(String(value).trim()); }
  function firstValue(metadata, keys, fallback = "") {
    for (const key of keys) if (metadata[key] != null && metadata[key] !== "") return metadata[key];
    return fallback;
  }
  function placeholderLink(event) {
    const href = event.currentTarget.getAttribute("href") || "";
    if (!href || href === "#" || href.includes("REPLACE_")) {
      event.preventDefault();
      showToast("Diesen Link bitte in calendar-config.js ersetzen.");
    }
  }

  function applySiteConfig() {
    const club = config.club || {};
    $$('[data-brand]').forEach(el => el.textContent = club.name || "Studentischer Entomologie-Club Zürich");
    $$('[data-home-intro]').forEach(el => el.textContent = config.content?.homeIntro || "");
    $$('[data-about-intro]').forEach(el => el.textContent = config.content?.aboutIntro || "");
    $$('[data-member-only]').forEach(el => el.hidden = club.showMembership !== true);
    $$('[data-member-link]').forEach(el => { el.href = club.membershipUrl || "#"; el.addEventListener("click", placeholderLink); });
    $$('[data-calendar-subscribe]').forEach(el => { el.href = club.calendarSubscribeUrl || "#"; el.addEventListener("click", placeholderLink); });
    $$('[data-email-link]').forEach(el => { el.href = `mailto:${club.email || "info@example.org"}`; el.textContent = club.email || "info@example.org"; });
    $$('[data-address]').forEach(el => el.textContent = club.address || "c/o Universität Zürich");
    $$('[data-instagram-link]').forEach(el => { el.href = club.instagramUrl || "#"; el.addEventListener("click", placeholderLink); });
    $$('[data-inaturalist-link]').forEach(el => { el.href = club.inaturalistUrl || "#"; el.addEventListener("click", placeholderLink); });
    $$('[data-statutes-link]').forEach(el => el.href = config.documents?.statutes || "documents/statuten.pdf");
    $$('[data-code-link]').forEach(el => el.href = config.documents?.codeOfConduct || "documents/ehrenkodex.pdf");
    const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
    const active = $(`[data-nav="${page}"]`); if (active) active.classList.add("is-active");
    configureHero();
    configureDonations();
  }

  function configureDonations() {
    const donations = config.donations || {};
    const section = $('[data-donations-section]');
    if (!section) return;
    section.hidden = donations.show === false;

    const iban = String(donations.iban || "").trim();
    const accountHolder = String(donations.accountHolder || "").trim();
    const bankDetails = $('[data-bank-details]', section);
    const bankPlaceholder = $('[data-bank-placeholder]', section);
    if (bankDetails) bankDetails.hidden = !iban;
    if (bankPlaceholder) bankPlaceholder.hidden = Boolean(iban);
    const ibanElement = $('[data-donation-iban]', section);
    const holderElement = $('[data-donation-holder]', section);
    if (ibanElement) ibanElement.textContent = iban;
    if (holderElement) {
      holderElement.textContent = accountHolder;
      holderElement.parentElement.hidden = !accountHolder;
    }

    const qrImageUrl = safeUrl(donations.qrImageUrl || "");
    const qrContainer = $('[data-donation-qr]', section);
    const qrImage = $('img', qrContainer || section);
    if (qrContainer) qrContainer.hidden = !qrImageUrl;
    if (qrImage && qrImageUrl) qrImage.src = qrImageUrl;
  }

  function configureHero() {
    const image = $('#hero-image');
    const video = $('#hero-video');
    const toggle = $('#video-toggle');
    if (!image || !video || !toggle) return;
    const hero = config.hero || {};
    image.src = hero.imageUrl || "assets/hero-group-placeholder.svg";
    image.style.objectPosition = hero.imagePosition || "center center";
    video.poster = hero.posterUrl || "assets/hero-poster.jpg";
    const source = $('source', video);
    if (source) source.src = hero.videoUrl || "assets/hero-loop.mp4";
    if (hero.mode === "video") {
      image.hidden = true; video.hidden = false; toggle.hidden = false;
      video.autoplay = true; video.load(); video.play().catch(() => {});
    } else {
      image.hidden = false; video.hidden = true; toggle.hidden = true;
    }
  }

  async function loadCalendar() {
    setStatus("loading", page === "archive" ? "Archiv wird geladen …" : "Kalender wird geladen …");
    try {
      const sourceUrl = calendarConfig.mode === "proxy" ? calendarConfig.proxyUrl : calendarConfig.icsUrl;
      if (!sourceUrl || sourceUrl.includes("YOUR-")) throw new Error("Kalenderquelle fehlt in calendar-config.js");
      const response = await fetch(sourceUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Kalender antwortet mit HTTP ${response.status}`);
      const icsText = await response.text();
      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth() - (calendarConfig.monthsPast || 72), 1);
      const windowEnd = new Date(now.getFullYear(), now.getMonth() + (calendarConfig.monthsFuture || 36), 1);
      const parsed = window.EntoICS.expand(icsText, { timeZone: displayTimeZone, windowStart, windowEnd, maxOccurrences: calendarConfig.maxOccurrences || 800 });
      state.events = parsed.map(normalizeEvent).sort((a,b) => a.start - b.start);
      setStatus("success", `${state.events.length} Kalendereinträge geladen`);
      renderCurrentPage();
      openEventFromUrl();
    } catch (error) {
      console.error(error);
      setStatus("error", `Kalender konnte nicht geladen werden: ${error.message}`);
      const empty = $('#empty-state'); if (empty) empty.hidden = false;
    }
  }

  function parseDescription(description = "") {
    const metadata = {};
    const bodyLines = [];
    let metadataBlock = true;
    for (const line of String(description).split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_-]+):\s*(.*)$/);
      if (metadataBlock && match) metadata[match[1].toLowerCase().replace(/-/g,"_")] = match[2].trim();
      else { if (line.trim()) metadataBlock = false; bodyLines.push(line); }
    }
    return { metadata, body: bodyLines.join("\n").trim() };
  }
  function driveImageUrl(url = "") {
    const patterns = [/\/d\/([^/]+)/, /[?&]id=([^&]+)/, /\/file\/d\/([^/]+)/];
    for (const pattern of patterns) { const match = String(url).match(pattern); if (match) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w1600`; }
    return url;
  }
  function chooseImage(event, metadata, type) {
    if (metadata.image) return driveImageUrl(metadata.image);
    const attached = (event.attachments || []).find(a => String(a.mimeType || "").startsWith("image/") || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(a.url || ""));
    if (attached?.url) return driveImageUrl(attached.url);
    return config.images?.fallbackByType?.[type] || config.images?.fallbackByType?.default || "assets/event-moth.svg";
  }
  function normalizedCost(value = "") {
    const raw = String(value || "free").trim();
    if (/^(free|kostenlos|gratis|0)$/i.test(raw)) return "Kostenlos";
    if (/^(variable|variabel)$/i.test(raw)) return "Kosten variabel";
    return raw;
  }
  function normalizedAudience(value = "") {
    return /^(members|member|mitglieder|nur mitglieder)$/i.test(String(value).trim()) ? "Nur für Mitglieder" : "Für alle";
  }
  function automaticSemester(date) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: displayTimeZone, year:"numeric", month:"2-digit" }).formatToParts(date);
    const map = Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
    if (map.month === 1) return `HS ${map.year - 1}`;
    if (map.month >= 2 && map.month <= 7) return `FS ${map.year}`;
    return `HS ${map.year}`;
  }
  function normalizeEvent(event) {
    const { metadata, body } = parseDescription(event.description);
    const typeRaw = String(firstValue(metadata, ["type"], "event")).toLowerCase();
    const typeAliases = { normal:"event", sitzung:"meeting", meeting:"meeting", exkursion:"excursion", vortrag:"talk", workshop:"workshop", event:"event" };
    const type = typeAliases[typeRaw] || typeRaw;
    const registrationUrl = safeUrl(firstValue(metadata, ["registration_url","registration","anmeldung_url","anmeldung"], ""));
    const registrationRequiredRaw = firstValue(metadata, ["registration_required","anmeldung_erforderlich"], registrationUrl ? "yes" : "no");
    const firstParagraph = body.split(/\n\s*\n/)[0] || "Weitere Informationen folgen bald.";
    return {
      id: event.id,
      title: event.summary || "Unbenanntes Event",
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      timeZone: displayTimeZone, // Wichtig: UTC-ICS immer als Zürcher Ortszeit anzeigen.
      location: event.location || "Treffpunkt wird noch bekanntgegeben",
      body,
      short: firstValue(metadata, ["short","kurzbeschreibung"], firstParagraph),
      type,
      language: firstValue(metadata, ["language","sprache"], "DE / EN"),
      status: String(firstValue(metadata, ["status"], "open")).toLowerCase(),
      registrationRequired: truthy(registrationRequiredRaw),
      registrationUrl,
      cost: normalizedCost(firstValue(metadata, ["cost","kosten"], "free")),
      audience: normalizedAudience(firstValue(metadata, ["audience","zielgruppe"], "all")),
      semester: firstValue(metadata, ["semester"], automaticSemester(event.start)),
      eventUrl: safeUrl(event.url),
      image: chooseImage(event, metadata, type)
    };
  }

  function setStatus(type, text) {
    const status = $('#calendar-status'); if (!status) return;
    status.className = `calendar-status is-${type}`;
    const textNode = status.querySelector('span:last-child'); if (textNode) textNode.textContent = text;
  }
  function renderCurrentPage() {
    if (page === "home") renderHomeEvents();
    if (page === "events") renderEvents();
    if (page === "archive") renderArchive();
  }
  function futureEvents() { const now = new Date(); return state.events.filter(e => e.end >= now); }
  function pastEvents() { const now = new Date(); return state.events.filter(e => e.end < now).sort((a,b) => b.start - a.start); }
  function renderHomeEvents() {
    const events = futureEvents().slice(0,3);
    const container = $('#home-event-list'); if (!container) return;
    container.innerHTML = events.map(eventRowTemplate).join("");
    $('#empty-state').hidden = events.length > 0;
    bindEventRows(container);
  }
  function renderEvents() {
    const events = futureEvents().filter(e => state.filter === "all" || e.type === state.filter);
    const container = $('#event-list'); if (!container) return;
    container.innerHTML = events.map(eventRowTemplate).join("");
    $('#empty-state').hidden = events.length > 0;
    bindEventRows(container);
  }
  function renderArchive() {
    const events = pastEvents();
    const groups = new Map();
    for (const event of events) { if (!groups.has(event.semester)) groups.set(event.semester, []); groups.get(event.semester).push(event); }
    const container = $('#archive-groups'); if (!container) return;
    container.innerHTML = [...groups.entries()].map(([semester, items]) => `<section class="archive-semester"><div class="archive-semester-header"><h2>${escapeHtml(semester)}</h2><span class="archive-count">${items.length} ${items.length === 1 ? "Event" : "Events"}</span></div><div class="event-list">${items.map(eventRowTemplate).join("")}</div></section>`).join("");
    $('#empty-state').hidden = events.length > 0;
    bindEventRows(container);
  }
  function bindEventRows(root) {
    $$('.event-row', root).forEach(row => {
      row.addEventListener("click", ev => { if (!ev.target.closest("a,button")) openEvent(row.dataset.eventId); });
      row.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openEvent(row.dataset.eventId); } });
    });
    $$('[data-open-event]', root).forEach(button => button.addEventListener("click", () => openEvent(button.dataset.openEvent)));
  }

  function formatDate(event) {
    return new Intl.DateTimeFormat(locale, { weekday:"short", day:"2-digit", month:"short", year:"numeric", timeZone:displayTimeZone }).format(event.start);
  }
  function formatTime(event) {
    if (event.allDay) return "Ganztägig";
    const fmt = new Intl.DateTimeFormat(locale, { hour:"2-digit", minute:"2-digit", timeZone:displayTimeZone });
    return `${fmt.format(event.start)}–${fmt.format(event.end)} Uhr`;
  }
  function eventRowTemplate(event) {
    const typeLabel = TYPE_LABELS[event.type] || TYPE_LABELS.default;
    const fallback = config.images?.fallbackByType?.default || "assets/event-moth.svg";
    const registrationLabel = event.registrationRequired ? "Anmeldung erforderlich" : "Keine Anmeldung nötig";
    return `<article class="event-row" tabindex="0" data-event-id="${escapeHtml(event.id)}" aria-label="${escapeHtml(event.title)} öffnen">
      <div class="event-thumbnail"><img src="${escapeHtml(event.image)}" alt="" loading="lazy" onerror="this.src='${escapeHtml(fallback)}'" /></div>
      <div class="event-main">
        <div class="event-title-line"><h3>${escapeHtml(event.title)}</h3><span class="event-type">${escapeHtml(typeLabel)}</span></div>
        <div class="event-meta">
        <span>
          <img class="event-meta-icon" src="assets/icons/calendar_gray.svg" alt="" aria-hidden="true">
          ${escapeHtml(formatDate(event))}
        </span>
        <span>
          <img class="event-meta-icon" src="assets/icons/clock.svg" alt="" aria-hidden="true">
          ${escapeHtml(formatTime(event))}
        </span>
        <span>
          <img class="event-meta-icon" src="assets/icons/location.svg" alt="" aria-hidden="true">
          ${escapeHtml(event.location)}
        </span>
        </div>
        <div class="event-badges"><span class="info-badge ${event.registrationRequired ? "is-important" : ""}">${escapeHtml(registrationLabel)}</span><span class="info-badge">${escapeHtml(event.cost)}</span><span class="info-badge">${escapeHtml(event.audience)}</span></div>
        <p>${escapeHtml(event.short)}</p>
      </div>
      <button class="event-more" type="button" data-open-event="${escapeHtml(event.id)}">Mehr Infos <span aria-hidden="true">›</span></button>
    </article>`;
  }

  function openEvent(id) {
    const event = state.events.find(item => item.id === id); if (!event) return;
    const dialog = $('#event-dialog'); if (!dialog) return;
    $('#dialog-content').innerHTML = dialogTemplate(event);
    document.body.classList.add("dialog-open");
    history.replaceState(null,"",`${location.pathname}?event=${encodeURIComponent(event.id)}`);
    dialog.showModal();
  }
  function dialogTemplate(event) {
    const date = new Intl.DateTimeFormat(locale, { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:displayTimeZone }).format(event.start);
    const paragraphs = (event.body || "Weitere Informationen folgen bald.").split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g,"<br>")}</p>`).join("");
    const type = TYPE_LABELS[event.type] || TYPE_LABELS.default;
    const status = STATUS_LABELS[event.status] || event.status;
    const actions = [
      event.registrationUrl ? `<a class="button button-primary" href="${escapeHtml(event.registrationUrl)}" target="_blank" rel="noopener">Zur Anmeldung ↗</a>` : "",
      event.eventUrl ? `<a class="button" href="${escapeHtml(event.eventUrl)}" target="_blank" rel="noopener">Event-Link öffnen ↗</a>` : ""
    ].join("");
    return `<div class="dialog-image"><img src="${escapeHtml(event.image)}" alt="" /></div><div class="dialog-layout"><div class="dialog-copy"><span class="event-type">${escapeHtml(type)}</span><h2>${escapeHtml(event.title)}</h2><div class="dialog-description">${paragraphs}</div><div class="dialog-actions">${actions}</div></div><aside class="dialog-facts"><div><strong>Datum</strong><span>${escapeHtml(date)}</span></div><div><strong>Zeit</strong><span>${escapeHtml(formatTime(event))}</span></div><div><strong>Treffpunkt</strong><span>${escapeHtml(event.location)}</span></div><div><strong>Anmeldung</strong><span>${escapeHtml(event.registrationRequired ? "Erforderlich" : "Nicht erforderlich")}</span></div><div><strong>Kosten</strong><span>${escapeHtml(event.cost)}</span></div><div><strong>Teilnahme</strong><span>${escapeHtml(event.audience)}</span></div><div><strong>Sprache</strong><span>${escapeHtml(event.language)}</span></div><div><strong>Status</strong><span>${escapeHtml(status)}</span></div></aside></div>`;
  }
  function closeDialog() {
    const dialog = $('#event-dialog'); if (dialog?.open) dialog.close();
    document.body.classList.remove("dialog-open"); history.replaceState(null,"",location.pathname);
  }
  function openEventFromUrl() { const id = new URLSearchParams(location.search).get("event"); if (id) openEvent(id); }

  function personName(person) {
    const structuredName = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
    return structuredName || person.name || "Name";
  }

  function personCardTemplate(person, type) {
    const name = personName(person);
    const pronouns = person.pronouns ? `<span class="team-pronouns">${escapeHtml(person.pronouns)}</span>` : "";
    const role = type === "board" && person.role ? `<span class="team-role">${escapeHtml(person.role)}</span>` : "";
    const facts = [
      type === "board" && person.study ? `<div><dt>Studiengang</dt><dd>${escapeHtml(person.study)}</dd></div>` : "",
      person.favouriteInsect ? `<div><dt>Lieblingsinsekt</dt><dd><i>${escapeHtml(person.favouriteInsect)}</i></dd></div>` : ""
    ].join("");
    const contactUrl = safeUrl(person.contact || "");
    const contact = contactUrl ? `<a class="team-contact" href="${escapeHtml(contactUrl)}">Kontakt →</a>` : "";
    return `<article class="team-card${type === "honorary" ? " team-card-honorary" : ""}">
      <div class="team-portrait"><img src="${escapeHtml(person.portrait || "assets/club-logo-maskottchen.png")}" alt="Porträt von ${escapeHtml(name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/club-logo-maskottchen.png'" /></div>
      <div class="team-copy">${role}<div class="team-name-line"><h3>${escapeHtml(name)}</h3>${pronouns}</div>${facts ? `<dl class="team-facts">${facts}</dl>` : ""}${contact}</div>
    </article>`;
  }

  function renderPeople(gridSelector, emptySelector, people, type) {
    const grid = $(gridSelector);
    const empty = $(emptySelector);
    if (!grid || !empty) return;
    grid.innerHTML = people.map(person => personCardTemplate(person, type)).join("");
    empty.hidden = people.length > 0;
  }

  async function loadTeam() {
    if (!$('#board-grid') && !$('#honorary-grid')) return;
    try {
      const dataUrl = config.team?.dataUrl || "data/team.json";
      const cacheBustedUrl = `${dataUrl}${dataUrl.includes("?") ? "&" : "?"}_=${Date.now()}`;
      const response = await fetch(cacheBustedUrl, { cache:"no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const board = Array.isArray(data) ? data : data.board || [];
      const honoraryMembers = !Array.isArray(data) && Array.isArray(data.honoraryMembers) && data.honoraryMembers.length
        ? data.honoraryMembers
        : DEFAULT_HONORARY_MEMBERS;
      renderPeople('#board-grid', '#board-empty', board, 'board');
      renderPeople('#honorary-grid', '#honorary-empty', honoraryMembers, 'honorary');
    } catch (error) {
      console.error(error);
      const boardEmpty = $('#board-empty'); if (boardEmpty) boardEmpty.hidden = false;
      const honoraryEmpty = $('#honorary-empty'); if (honoraryEmpty) honoraryEmpty.hidden = false;
    }
  }

  function showToast(message) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = message; toast.classList.add("is-visible");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }
  function bindUI() {
    const menuButton = $('.menu-button'); const navigation = $('.main-nav');
    if (menuButton && navigation) {
      menuButton.addEventListener("click", () => { const open = navigation.classList.toggle("is-open"); menuButton.setAttribute("aria-expanded", String(open)); });
      $$('.main-nav a').forEach(link => link.addEventListener("click", () => { navigation.classList.remove("is-open"); menuButton.setAttribute("aria-expanded","false"); }));
    }
    $$('.filter-chip').forEach(button => button.addEventListener("click", () => { state.filter = button.dataset.filter; $$('.filter-chip').forEach(item => item.classList.toggle("is-active", item === button)); renderEvents(); }));
    const video = $('#hero-video'); const toggle = $('#video-toggle');
    if (video && toggle) toggle.addEventListener("click", async () => { if (video.paused) { await video.play().catch(()=>{}); toggle.querySelector('.video-toggle-icon').textContent="Ⅱ"; } else { video.pause(); toggle.querySelector('.video-toggle-icon').textContent="▶"; } });
    const close = $('#dialog-close'); if (close) close.addEventListener("click", closeDialog);
    const dialog = $('#event-dialog'); if (dialog) { dialog.addEventListener("click", ev => { if (ev.target === dialog) closeDialog(); }); dialog.addEventListener("close", () => document.body.classList.remove("dialog-open")); }
  }

  applySiteConfig();
  bindUI();
  if (["home","events","archive"].includes(page)) loadCalendar();
  if (page === "about") loadTeam();
})();
