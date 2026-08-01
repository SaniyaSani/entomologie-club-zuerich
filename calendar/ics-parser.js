/*
  Lightweight browser-side iCalendar reader for this prototype.
  Supports VEVENT, folded lines, DTSTART/DTEND, URL, ATTACH, EXDATE,
  simple RECURRENCE-ID overrides and common DAILY/WEEKLY/MONTHLY/YEARLY RRULEs.
*/
(() => {
  const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  function unfold(text) {
    return String(text || "")
      .replace(/\r\n[ \t]/g, "")
      .replace(/\n[ \t]/g, "")
      .replace(/\r/g, "");
  }

  function splitOutsideQuotes(value, delimiter) {
    const parts = [];
    let current = "";
    let quoted = false;
    for (const char of value) {
      if (char === '"') quoted = !quoted;
      if (char === delimiter && !quoted) {
        parts.push(current);
        current = "";
      } else current += char;
    }
    parts.push(current);
    return parts;
  }

  function parseContentLine(line) {
    const colon = line.indexOf(":");
    if (colon < 0) return null;
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const pieces = splitOutsideQuotes(head, ";");
    const name = pieces.shift().toUpperCase();
    const params = {};
    for (const piece of pieces) {
      const eq = piece.indexOf("=");
      if (eq < 0) continue;
      const key = piece.slice(0, eq).toUpperCase();
      let paramValue = piece.slice(eq + 1);
      if (paramValue.startsWith('"') && paramValue.endsWith('"')) paramValue = paramValue.slice(1, -1);
      params[key] = paramValue;
    }
    return { name, params, value };
  }

  function decodeText(value = "") {
    return String(value)
      .replace(/\\n/gi, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\\\/g, "\\");
  }

  function parseComponents(value) {
    const compact = String(value).replace(/[-:]/g, "");
    const match = compact.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
    if (!match) return null;
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4] || 0),
      minute: Number(match[5] || 0),
      second: Number(match[6] || 0),
      utc: Boolean(match[7])
    };
  }

  function getZoneParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
    return {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      second: parts.second
    };
  }

  function zonedComponentsToDate(components, timeZone) {
    if (components.utc) {
      return new Date(Date.UTC(components.year, components.month - 1, components.day, components.hour, components.minute, components.second));
    }
    let guess = Date.UTC(components.year, components.month - 1, components.day, components.hour, components.minute, components.second);
    for (let iteration = 0; iteration < 3; iteration += 1) {
      const observed = getZoneParts(new Date(guess), timeZone);
      const observedUtc = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute, observed.second);
      const desiredUtc = Date.UTC(components.year, components.month - 1, components.day, components.hour, components.minute, components.second);
      const difference = desiredUtc - observedUtc;
      if (difference === 0) break;
      guess += difference;
    }
    return new Date(guess);
  }

  function parseDateProperty(property, defaultZone) {
    if (!property) return null;
    const components = parseComponents(property.value);
    if (!components) return null;
    const allDay = property.params.VALUE === "DATE" || !String(property.value).includes("T");
    const timeZone = components.utc ? "UTC" : (property.params.TZID || defaultZone || "Europe/Zurich");
    if (allDay) {
      components.hour = 12;
      components.minute = 0;
      components.second = 0;
    }
    return {
      date: zonedComponentsToDate(components, timeZone),
      components,
      timeZone,
      allDay
    };
  }

  function parseDuration(value = "") {
    const match = String(value).match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
    if (!match) return 0;
    return (((Number(match[1] || 0) * 7 + Number(match[2] || 0)) * 24 + Number(match[3] || 0)) * 60 + Number(match[4] || 0)) * 60 * 1000 + Number(match[5] || 0) * 1000;
  }

  function propertyMap(lines) {
    const map = {};
    for (const line of lines) {
      const property = parseContentLine(line);
      if (!property) continue;
      if (!map[property.name]) map[property.name] = [];
      map[property.name].push(property);
    }
    return map;
  }

  function first(map, name) {
    return map[name]?.[0] || null;
  }

  function parseRRule(value = "") {
    const result = {};
    for (const part of String(value).split(";")) {
      const [key, raw] = part.split("=");
      if (!key || raw == null) continue;
      result[key.toUpperCase()] = raw;
    }
    result.INTERVAL = Math.max(1, Number(result.INTERVAL || 1));
    if (result.COUNT) result.COUNT = Number(result.COUNT);
    if (result.BYDAY) result.BYDAY = result.BYDAY.split(",");
    if (result.BYMONTHDAY) result.BYMONTHDAY = result.BYMONTHDAY.split(",").map(Number);
    return result;
  }

  function localDateSerial(components) {
    return Date.UTC(components.year, components.month - 1, components.day);
  }

  function addLocalDays(components, days) {
    const date = new Date(localDateSerial(components));
    date.setUTCDate(date.getUTCDate() + days);
    return {
      ...components,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    };
  }

  function daysDifference(a, b) {
    return Math.floor((localDateSerial(a) - localDateSerial(b)) / 86400000);
  }

  function monthsDifference(a, b) {
    return (a.year - b.year) * 12 + (a.month - b.month);
  }

  function weekdayOf(components) {
    return new Date(localDateSerial(components)).getUTCDay();
  }

  function startOfWeekSerial(components, weekStartCode = "MO") {
    const weekStart = Math.max(0, DAY_CODES.indexOf(weekStartCode));
    const weekday = weekdayOf(components);
    const back = (weekday - weekStart + 7) % 7;
    return localDateSerial(addLocalDays(components, -back));
  }

  function matchesRule(candidate, start, rule) {
    const frequency = String(rule.FREQ || "").toUpperCase();
    const interval = rule.INTERVAL || 1;
    const byDays = rule.BYDAY || [];
    const byMonthDays = rule.BYMONTHDAY || [];
    const weekdayCode = DAY_CODES[weekdayOf(candidate)];

    if (byDays.length && !byDays.some(value => value.replace(/^[+-]?\d+/, "") === weekdayCode)) return false;
    if (byMonthDays.length && !byMonthDays.includes(candidate.day)) return false;

    if (frequency === "DAILY") {
      return daysDifference(candidate, start) >= 0 && daysDifference(candidate, start) % interval === 0;
    }
    if (frequency === "WEEKLY") {
      const startWeek = startOfWeekSerial(start, rule.WKST || "MO");
      const candidateWeek = startOfWeekSerial(candidate, rule.WKST || "MO");
      const weeks = Math.floor((candidateWeek - startWeek) / (7 * 86400000));
      const defaultDayOk = byDays.length ? true : weekdayOf(candidate) === weekdayOf(start);
      return weeks >= 0 && weeks % interval === 0 && defaultDayOk;
    }
    if (frequency === "MONTHLY") {
      const months = monthsDifference(candidate, start);
      const defaultDayOk = byDays.length || byMonthDays.length ? true : candidate.day === start.day;
      return months >= 0 && months % interval === 0 && defaultDayOk;
    }
    if (frequency === "YEARLY") {
      const years = candidate.year - start.year;
      return years >= 0 && years % interval === 0 && candidate.month === start.month && candidate.day === start.day;
    }
    return false;
  }

  function occurrenceKey(date) {
    return String(Math.round(date.getTime() / 1000));
  }

  function parseRawEvents(text) {
    const lines = unfold(text).split("\n");
    const events = [];
    let collecting = false;
    let current = [];
    for (const line of lines) {
      if (line === "BEGIN:VEVENT") {
        collecting = true;
        current = [];
        continue;
      }
      if (line === "END:VEVENT") {
        if (collecting) events.push(propertyMap(current));
        collecting = false;
        current = [];
        continue;
      }
      if (collecting) current.push(line);
    }
    return events;
  }

  function mapEvent(map, defaultZone) {
    const startInfo = parseDateProperty(first(map, "DTSTART"), defaultZone);
    if (!startInfo) return null;
    const endProperty = first(map, "DTEND");
    let endInfo = parseDateProperty(endProperty, defaultZone);
    let durationMs = 0;
    if (endInfo) durationMs = endInfo.date - startInfo.date;
    else if (first(map, "DURATION")) durationMs = parseDuration(first(map, "DURATION").value);
    else durationMs = startInfo.allDay ? 86400000 : 60 * 60 * 1000;

    const recurrenceId = parseDateProperty(first(map, "RECURRENCE-ID"), defaultZone);
    const exdates = (map.EXDATE || []).flatMap(property => String(property.value).split(",").map(value => parseDateProperty({ ...property, value }, defaultZone)).filter(Boolean));
    const attachments = (map.ATTACH || []).map(property => ({
      url: decodeText(property.value),
      mimeType: property.params.FMTTYPE || "",
      title: property.params.FILENAME || ""
    }));

    return {
      uid: decodeText(first(map, "UID")?.value || crypto.randomUUID()),
      summary: decodeText(first(map, "SUMMARY")?.value || "Unbenanntes Event"),
      description: decodeText(first(map, "DESCRIPTION")?.value || ""),
      location: decodeText(first(map, "LOCATION")?.value || ""),
      url: decodeText(first(map, "URL")?.value || ""),
      status: String(first(map, "STATUS")?.value || "CONFIRMED").toUpperCase(),
      startInfo,
      durationMs,
      rrule: first(map, "RRULE") ? parseRRule(first(map, "RRULE").value) : null,
      recurrenceId,
      exdates,
      attachments
    };
  }

  function materialize(base, startDate, suffix = "") {
    return {
      id: `${base.uid}${suffix}`,
      uid: base.uid,
      summary: base.summary,
      description: base.description,
      location: base.location,
      url: base.url,
      status: base.status,
      start: startDate,
      end: new Date(startDate.getTime() + base.durationMs),
      allDay: base.startInfo.allDay,
      timeZone: base.startInfo.timeZone,
      attachments: base.attachments
    };
  }

  function expand(text, options = {}) {
    const defaultZone = options.timeZone || "Europe/Zurich";
    const now = options.now || new Date();
    const windowStart = options.windowStart || new Date(now.getFullYear(), now.getMonth() - 12, 1);
    const windowEnd = options.windowEnd || new Date(now.getFullYear(), now.getMonth() + 24, 1);
    const maxOccurrences = options.maxOccurrences || 300;

    const parsed = parseRawEvents(text).map(map => mapEvent(map, defaultZone)).filter(Boolean);
    const masters = parsed.filter(event => !event.recurrenceId);
    const overrides = new Map();
    for (const event of parsed.filter(item => item.recurrenceId)) {
      overrides.set(`${event.uid}:${occurrenceKey(event.recurrenceId.date)}`, event);
    }

    const result = [];
    for (const event of masters) {
      if (event.status === "CANCELLED") continue;
      if (!event.rrule) {
        const occurrence = materialize(event, event.startInfo.date);
        if (occurrence.end >= windowStart && occurrence.start <= windowEnd) result.push(occurrence);
        continue;
      }

      const rule = event.rrule;
      const untilInfo = rule.UNTIL ? parseDateProperty({ value: rule.UNTIL, params: {} }, event.startInfo.timeZone) : null;
      const excluded = new Set(event.exdates.map(item => occurrenceKey(item.date)));
      let candidate = { ...event.startInfo.components };
      let emittedByRule = 0;
      let guard = 0;

      while (guard < 5000 && result.length < maxOccurrences) {
        guard += 1;
        const candidateDate = zonedComponentsToDate(candidate, event.startInfo.timeZone);
        if (candidateDate > windowEnd) break;

        if (matchesRule(candidate, event.startInfo.components, rule)) {
          emittedByRule += 1;
          if (rule.COUNT && emittedByRule > rule.COUNT) break;
          if (untilInfo && candidateDate > untilInfo.date) break;

          const key = `${event.uid}:${occurrenceKey(candidateDate)}`;
          const override = overrides.get(key);
          const excludedOccurrence = excluded.has(occurrenceKey(candidateDate));
          if (!excludedOccurrence) {
            if (override) {
              if (override.status !== "CANCELLED") {
                const occurrence = materialize(override, override.startInfo.date, `:${occurrenceKey(candidateDate)}`);
                if (occurrence.end >= windowStart && occurrence.start <= windowEnd) result.push(occurrence);
              }
            } else {
              const occurrence = materialize(event, candidateDate, `:${occurrenceKey(candidateDate)}`);
              if (occurrence.end >= windowStart && occurrence.start <= windowEnd) result.push(occurrence);
            }
          }
        }
        candidate = addLocalDays(candidate, 1);
      }
    }

    for (const event of parsed.filter(item => item.recurrenceId && !masters.some(master => master.uid === item.uid))) {
      if (event.status === "CANCELLED") continue;
      const occurrence = materialize(event, event.startInfo.date, `:${occurrenceKey(event.startInfo.date)}`);
      if (occurrence.end >= windowStart && occurrence.start <= windowEnd) result.push(occurrence);
    }

    return result.sort((a, b) => a.start - b.start).slice(0, maxOccurrences);
  }

  window.EntoICS = { expand };
})();
