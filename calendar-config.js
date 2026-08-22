window.ENTO_SITE_CONFIG = {
  calendar: {
    /* "ics" = lokale, durch GitHub Actions synchronisierte ICS-Datei */
    mode: "ics",
    icsUrl: "data/calendar.ics",
    proxyUrl: "https://YOUR-CALENDAR-PROXY.workers.dev/calendar.ics",

    // Alle Uhrzeiten werden auf der Website in dieser Zeitzone angezeigt.
    // Das behebt auch Google-ICS-Einträge, die als UTC (Z) exportiert werden.
    timeZone: "Europe/Zurich",
    monthsPast: 72,
    monthsFuture: 36,
    maxOccurrences: 800
  },

  club: {
    name: "Studentischer Entomologie-Club Zürich",
    shortName: "Entomologie-Club Zürich",

    // Samuel wollte den Mitglied-Button vorerst entfernen.
    // Sobald ihr ein Formular habt: true setzen und membershipUrl eintragen.
    showMembership: false,
    membershipUrl: "https://forms.gle/REPLACE_WITH_MEMBERSHIP_FORM",

    calendarSubscribeUrl: "https://REPLACE_WITH_PUBLIC_GOOGLE_CALENDAR_LINK",
    email: "info@example.org",
    address: "c/o Universität Zürich · Winterthurerstrasse 190 · 8057 Zürich",
    instagramUrl: "https://instagram.com/REPLACE_ME",
    inaturalistUrl: "https://www.inaturalist.org/projects/REPLACE_ME"
  },

  hero: {
    // "image" für ein Gruppenfoto, "video" für das Banner-Video.
    mode: "image",
    imageUrl: "assets/hero-group-placeholder.svg",
    videoUrl: "assets/hero-loop.mp4",
    posterUrl: "assets/hero-poster.jpg",
    imagePosition: "center center"
  },

  content: {
    homeIntro: "Wir verbinden Studierende, Forschende und Insektenbegeisterte in Zürich. Gemeinsam entdecken, bestimmen und dokumentieren wir die faszinierende Vielfalt der Insekten. Keine Vorkentnisse nötig, Anfänger willkommen!",
    aboutIntro: "Der Studentische Entomologie-Club Zürich ist eine offene Gemeinschaft für alle, die Insekten kennenlernen, bestimmen oder erforschen möchten. Vorkenntnisse sind nicht nötig, Neugier reicht völlig aus."
  },

  team: {
    dataUrl: "data/team.json?v=20260822-2"
  },

  donations: {
    // Erst nach Eröffnung des Vereinskontos und interner Prüfung eintragen.
    show: true,
    iban: "",
    accountHolder: "",
    qrImageUrl: ""
  },

  documents: {
    statutes: "statuten.html",
    codeOfConduct: "ehrenkodex.html"
  },

  images: {
    fallbackByType: {
      meeting: "assets/event-idnight.svg",
      excursion: "assets/event-moth.svg",
      identification: "assets/event-idnight.svg",
      bioblitz: "assets/event-bioblitz.svg",
      workshop: "assets/event-idnight.svg",
      talk: "assets/event-talk.svg",
      social: "assets/event-bioblitz.svg",
      event: "assets/event-bioblitz.svg",
      default: "assets/event-moth.svg"
    }
  }
};
