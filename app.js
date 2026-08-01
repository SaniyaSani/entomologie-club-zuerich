(() => {
  const config = window.ENTO_SITE_CONFIG || {};
  const calendarConfig = config.calendar || {};
  const state = { events: [], filter: "all", showPast: false };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const locale = "de-CH";

  const TYPE_LABELS = {
    excursion: "Exkursion",
    identification: "Bestimmung",
    bioblitz: "BioBlitz",
    workshop: "Workshop",
    talk: "Vortrag",
    social: "Treffen",
    default: "Event"
  };

  const STATUS_LABELS = {
    open: "Offen",
    registration: "Anmeldung erforderlich",
    full: "Ausgebucht",
    members: "Nur für Mitglieder",
    finished: "Beendet"
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    }[character]));
  }

  function safeUrl(value = "") {
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
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
    document.title = club.name || "Studentischer Entomologie-Club Zürich";
    $$('[data-brand]').forEach(element => element.textContent = club.name || "Studentischer Entomologie-Club Zürich");
    $$('[data-member-link]').forEach(element => {
      element.href = club.membershipUrl || "#";
      element.addEventListener("click", placeholderLink);
    });
    $$('[data-calendar-subscribe]').forEach(element => {
      element.href = club.calendarSubscribeUrl || "#";
      element.addEventListener("click", placeholderLink);
    });
    $$('[data-email-link]').forEach(element => {
      element.href = `mailto:${club.email || "info@example.org"}`;
      element.textContent = club.email || "info@example.org";
    });
    $$('[data-address]').forEach(element => element.textContent = club.address || "c/o Universität Zürich");
    $$('[data-instagram-link]').forEach(element => {
      element.href = club.instagramUrl || "#";
      element.addEventListener("click", placeholderLink);
    });
    $$('[data-inaturalist-link]').forEach(element => {
      element.href = club.inaturalistUrl || "#";
      element.addEventListener("click", placeholderLink);
    });
    $('[data-statutes-link]').href = config.documents?.statutes || "documents/statuten.pdf";
    $('[data-code-link]').href = config.documents?.codeOfConduct || "documents/ehrenkodex.pdf";
    $('#year').textContent = new Date().getFullYear();
  }

  async function loadCalendar() {
    setStatus("loading", "Kalender wird geladen …");
    try {
      const sourceUrl = calendarConfig.mode === "proxy" ? calendarConfig.proxyUrl : calendarConfig.icsUrl;
      if (!sourceUrl || sourceUrl.includes("YOUR-")) throw new Error("Kalenderquelle fehlt in calendar-config.js");
      const response = await fetch(sourceUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Kalender antwortet mit HTTP ${response.status}`);
      const icsText = await response.text();
      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth() - (calendarConfig.monthsPast || 12), 1);
      const windowEnd = new Date(now.getFullYear(), now.getMonth() + (calendarConfig.monthsFuture || 24), 1);
      const parsed = window.EntoICS.expand(icsText, {
        timeZone: calendarConfig.timeZone || "Europe/Zurich",
        windowStart,
        windowEnd,
        maxOccurrences: calendarConfig.maxOccurrences || 300
      });
      state.events = parsed.map(normalizeEvent).sort((a, b) => a.start - b.start);
      setStatus("success", `${state.events.length} Kalendereinträge geladen`);
      renderEvents();
      openEventFromUrl();
    } catch (error) {
      console.error(error);
      setStatus("error", `Kalender konnte nicht geladen werden: ${error.message}`);
      $('#event-list').innerHTML = "";
      $('#empty-state').hidden = false;
    }
  }

  function parseDescription(description = "") {
    const metadata = {};
    const bodyLines = [];
    let metadataBlock = true;
    for (const line of String(description).split(/\r?\n/)) {
      const match = line.match(/^([A-Z_]+):\s*(.*)$/);
      if (metadataBlock && match) metadata[match[1].toLowerCase()] = match[2].trim();
      else {
        if (line.trim()) metadataBlock = false;
        bodyLines.push(line);
      }
    }
    return { metadata, body: bodyLines.join("\n").trim() };
  }

  function slugify(value = "") {
    return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function driveImageUrl(url = "") {
    const patterns = [/\/d\/([^/]+)/, /[?&]id=([^&]+)/, /\/file\/d\/([^/]+)/];
    for (const pattern of patterns) {
      const match = String(url).match(pattern);
      if (match) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w1600`;
    }
    return url;
  }

  function chooseImage(event, metadata, type) {
    if (metadata.image) return driveImageUrl(metadata.image);
    const attachedImage = (event.attachments || []).find(attachment =>
      String(attachment.mimeType || "").startsWith("image/") || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(attachment.url || "")
    );
    if (attachedImage?.url) return driveImageUrl(attachedImage.url);
    return config.images?.fallbackByType?.[type] || config.images?.fallbackByType?.default || "assets/event-moth.svg";
  }

  function normalizeEvent(event) {
    const { metadata, body } = parseDescription(event.description);
    const type = String(metadata.type || "default").toLowerCase();
    const firstParagraph = body.split(/\n\s*\n/)[0] || "Weitere Informationen folgen bald.";
    return {
      id: event.id,
      title: event.summary,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      timeZone: event.timeZone || calendarConfig.timeZone || "Europe/Zurich",
      location: event.location || "Ort wird noch bekanntgegeben",
      body,
      short: metadata.short || firstParagraph,
      type,
      language: metadata.language || "DE / EN",
      status: String(metadata.status || "open").toLowerCase(),
      registration: safeUrl(metadata.registration || event.url),
      eventUrl: safeUrl(event.url),
      image: chooseImage(event, metadata, type),
      slug: slugify(event.title)
    };
  }

  function setStatus(type, text) {
    const status = $('#calendar-status');
    status.className = `calendar-status is-${type}`;
    status.querySelector('span:last-child').textContent = text;
  }

  function visibleEvents() {
    const now = new Date();
    return state.events.filter(event => {
      const isPast = event.end < now;
      if (state.showPast !== isPast) return false;
      return state.filter === "all" || event.type === state.filter;
    });
  }

  function renderEvents() {
    const events = visibleEvents();
    $('#event-list').innerHTML = events.map(eventRowTemplate).join("");
    $('#empty-state').hidden = events.length > 0;
    $('#events-title').innerHTML = `<span class="section-icon" aria-hidden="true">▦</span>${state.showPast ? "Vergangene Events" : "Kommende Events"}`;
    $('#toggle-past').textContent = state.showPast ? "Kommende Events" : "Vergangene Events";

    $$('.event-row').forEach(row => {
      row.addEventListener("click", event => {
        if (event.target.closest("a, button")) return;
        openEvent(row.dataset.eventId);
      });
      row.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEvent(row.dataset.eventId);
        }
      });
    });
    $$('[data-open-event]').forEach(button => button.addEventListener("click", () => openEvent(button.dataset.openEvent)));
  }

  function formatDate(event) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: event.timeZone
    }).format(event.start);
  }

  function formatTime(event) {
    if (event.allDay) return "Ganztägig";
    return `${new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: event.timeZone }).format(event.start)} Uhr`;
  }

  function eventRowTemplate(event) {
    const typeLabel = TYPE_LABELS[event.type] || TYPE_LABELS.default;
    const fallback = config.images?.fallbackByType?.default || "assets/event-moth.svg";
    return `<article class="event-row" tabindex="0" data-event-id="${escapeHtml(event.id)}" aria-label="${escapeHtml(event.title)} öffnen">
      <div class="event-thumbnail">
        <img src="${escapeHtml(event.image)}" alt="" loading="lazy" onerror="this.src='${escapeHtml(fallback)}'" />
      </div>
      <div class="event-main">
        <div class="event-title-line">
          <h3>${escapeHtml(event.title)}</h3>
          <span class="event-type">${escapeHtml(typeLabel)}</span>
        </div>
        <div class="event-meta">
          <span><b aria-hidden="true">□</b>${escapeHtml(formatDate(event))}</span>
          <span><b aria-hidden="true">◷</b>${escapeHtml(formatTime(event))}</span>
          <span><b aria-hidden="true">⌖</b>${escapeHtml(event.location)}</span>
        </div>
        <p>${escapeHtml(event.short)}</p>
      </div>
      <button class="event-more" type="button" data-open-event="${escapeHtml(event.id)}">Mehr Infos <span aria-hidden="true">›</span></button>
    </article>`;
  }

  function openEvent(id) {
    const event = state.events.find(item => item.id === id);
    if (!event) return;
    const dialog = $('#event-dialog');
    $('#dialog-content').innerHTML = dialogTemplate(event);
    document.body.classList.add("dialog-open");
    history.replaceState(null, "", `${location.pathname}?event=${encodeURIComponent(event.id)}${location.hash || "#events"}`);
    dialog.showModal();
  }

  function dialogTemplate(event) {
    const fullDate = new Intl.DateTimeFormat(locale, {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: event.timeZone
    }).format(event.start);
    const startTime = event.allDay ? "Ganztägig" : new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: event.timeZone }).format(event.start);
    const endTime = event.allDay ? "" : new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: event.timeZone }).format(event.end);
    const paragraphs = (event.body || "Weitere Informationen folgen bald.").split(/\n\s*\n/).map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
    const status = STATUS_LABELS[event.status] || event.status;
    const type = TYPE_LABELS[event.type] || TYPE_LABELS.default;
    const action = event.registration
      ? `<a class="button button-primary" href="${escapeHtml(event.registration)}" target="_blank" rel="noopener">Anmelden ↗</a>`
      : event.eventUrl
        ? `<a class="button button-primary" href="${escapeHtml(event.eventUrl)}" target="_blank" rel="noopener">Event-Link öffnen ↗</a>`
        : "";
    return `<div class="dialog-image"><img src="${escapeHtml(event.image)}" alt="" /></div>
      <div class="dialog-layout">
        <div class="dialog-copy">
          <span class="event-type">${escapeHtml(type)}</span>
          <h2>${escapeHtml(event.title)}</h2>
          <div class="dialog-description">${paragraphs}</div>
          <div class="dialog-actions">${action}</div>
        </div>
        <aside class="dialog-facts">
          <div><strong>Datum</strong><span>${escapeHtml(fullDate)}</span></div>
          <div><strong>Zeit</strong><span>${escapeHtml(event.allDay ? startTime : `${startTime}–${endTime} Uhr`)}</span></div>
          <div><strong>Ort</strong><span>${escapeHtml(event.location)}</span></div>
          <div><strong>Sprache</strong><span>${escapeHtml(event.language)}</span></div>
          <div><strong>Status</strong><span>${escapeHtml(status)}</span></div>
        </aside>
      </div>`;
  }

  function closeDialog() {
    const dialog = $('#event-dialog');
    if (dialog.open) dialog.close();
    document.body.classList.remove("dialog-open");
    history.replaceState(null, "", `${location.pathname}${location.hash || "#events"}`);
  }

  function openEventFromUrl() {
    const eventId = new URLSearchParams(location.search).get("event");
    if (eventId) openEvent(eventId);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function bindUI() {
    const menuButton = $('.menu-button');
    const navigation = $('.main-nav');
    menuButton.addEventListener("click", () => {
      const open = navigation.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    $$('.main-nav a').forEach(link => link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }));

    $$('.filter-chip').forEach(button => button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      $$('.filter-chip').forEach(item => item.classList.toggle("is-active", item === button));
      renderEvents();
    }));

    $('#toggle-past').addEventListener("click", () => {
      state.showPast = !state.showPast;
      renderEvents();
    });

    const video = $('#hero-video');
    const videoToggle = $('#video-toggle');
    videoToggle.addEventListener("click", async () => {
      if (video.paused) {
        await video.play().catch(() => {});
        videoToggle.querySelector('.video-toggle-icon').textContent = "Ⅱ";
        videoToggle.setAttribute("aria-label", "Video pausieren");
      } else {
        video.pause();
        videoToggle.querySelector('.video-toggle-icon').textContent = "▶";
        videoToggle.setAttribute("aria-label", "Video abspielen");
      }
    });

    $('#dialog-close').addEventListener("click", closeDialog);
    $('#event-dialog').addEventListener("click", event => {
      if (event.target === $('#event-dialog')) closeDialog();
    });
    $('#event-dialog').addEventListener("close", () => document.body.classList.remove("dialog-open"));
  }

  applySiteConfig();
  bindUI();
  loadCalendar();
})();
