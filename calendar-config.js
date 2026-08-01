window.ENTO_SITE_CONFIG = {
  calendar: {
    /*
      "ics"   = eine ICS-Datei direkt laden (lokale Datei oder CORS-fähiger Feed)
      "proxy" = ICS über den mitgelieferten Cloudflare Worker laden
    */
    mode: "ics",

    // Funktioniert sofort mit dem mitgelieferten Demo-Kalender.
    // Für GitHub-Sync später auf "data/calendar.ics" ändern.
    icsUrl: "data/calendar.ics",

    // Für die Worker-Variante hier die veröffentlichte Worker-Adresse eintragen.
    proxyUrl: "https://YOUR-CALENDAR-PROXY.workers.dev/calendar.ics",

    timeZone: "Europe/Zurich",
    monthsPast: 12,
    monthsFuture: 24,
    maxOccurrences: 300
  },

  club: {
    name: "Studentischer Entomologie-Club Zürich",
    membershipUrl: "https://forms.gle/REPLACE_WITH_MEMBERSHIP_FORM",
    calendarSubscribeUrl: "https://REPLACE_WITH_PUBLIC_SUBSCRIPTION_LINK",
    email: "info@example.org",
    address: "c/o Universität Zürich · Winterthurerstrasse 190 · 8057 Zürich",
    instagramUrl: "https://instagram.com/REPLACE_ME",
    inaturalistUrl: "https://www.inaturalist.org/projects/REPLACE_ME"
  },

  documents: {
    statutes: "documents/statuten.pdf",
    codeOfConduct: "documents/ehrenkodex.pdf"
  },

  images: {
    fallbackByType: {
      excursion: "assets/event-moth.svg",
      identification: "assets/event-idnight.svg",
      bioblitz: "assets/event-bioblitz.svg",
      workshop: "assets/event-idnight.svg",
      talk: "assets/event-talk.svg",
      social: "assets/event-bioblitz.svg",
      default: "assets/event-moth.svg"
    }
  }
};
