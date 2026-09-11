// ============================================================
// CONFIGURATION
// ============================================================

// Google Apps Script Web App URL
const EVENT_API_URL =
    "https://script.google.com/macros/s/AKfycbxEFSCWLMcBMuPZlmiY95qv5rSN5_Z23ZXrzoiIILNEqpzwNWVfs6jD-V1YXilEOX20/exec";

const EVENT_FALLBACK_IMAGE = 
    "assets/events/fallback.png";
// ============================================================
// GLOBAL DATA
// ============================================================

let allEvents = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadEvents();

    setupFilters();

    setupDialog();

});


// ============================================================
// MARKDOWN
// ============================================================

function markdownToHTML(markdown) {
    if (!markdown) return "";

    let text = String(markdown).trim();

    // --------------------------------------------------------
    // Escape HTML
    // --------------------------------------------------------

    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");


    // --------------------------------------------------------
    // Inline formatting
    // --------------------------------------------------------

    function formatInline(text) {

        // Links
        text = text.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Bold
        text = text.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

        // Italic
        text = text.replace(
            /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
            "<em>$1</em>"
        );

        return text;
    }


    // --------------------------------------------------------
    // Process blocks line by line
    // --------------------------------------------------------

    const lines = text.split("\n");
    const output = [];

    let paragraph = [];
    let listItems = [];
    let listType = null;


    function flushParagraph() {
        if (!paragraph.length) return;

        const content = paragraph
            .map(line => formatInline(line))
            .join("<br>");

        output.push(`<p>${content}</p>`);
        paragraph = [];
    }


    function flushList() {
        if (!listItems.length) return;

        const items = listItems
            .map(item => `<li>${formatInline(item)}</li>`)
            .join("");

        output.push(
            listType === "ol"
                ? `<ol>${items}</ol>`
                : `<ul>${items}</ul>`
        );

        listItems = [];
        listType = null;
    }


    for (let i = 0; i < lines.length; i++) {

        const line = lines[i].trim();


        // ----------------------------------------------------
        // Empty line
        // ----------------------------------------------------

        if (!line) {
            flushParagraph();
            flushList();
            continue;
        }


        // ----------------------------------------------------
        // Unordered list
        // ----------------------------------------------------

        const unorderedMatch = line.match(/^[-*] (.+)$/);

        if (unorderedMatch) {

            flushParagraph();

            if (listType && listType !== "ul") {
                flushList();
            }

            listType = "ul";
            listItems.push(unorderedMatch[1]);

            continue;
        }


        // ----------------------------------------------------
        // Ordered list
        // ----------------------------------------------------

        const orderedMatch = line.match(/^\d+\. (.+)$/);

        if (orderedMatch) {

            flushParagraph();

            if (listType && listType !== "ol") {
                flushList();
            }

            listType = "ol";
            listItems.push(orderedMatch[1]);

            continue;
        }


        // ----------------------------------------------------
        // Heading
        // ----------------------------------------------------

        const headingMatch = line.match(/^(#{1,4}) (.+)$/);

        if (headingMatch) {

            flushParagraph();
            flushList();

            const level = headingMatch[1].length;

            // Map Markdown levels to h2–h5.
            const headingLevel = Math.min(level + 1, 5);

            output.push(
                `<h${headingLevel}>${formatInline(headingMatch[2])}</h${headingLevel}>`
            );

            continue;
        }


        // ----------------------------------------------------
        // Blockquote
        // ----------------------------------------------------

        const quoteMatch = line.match(/^&gt; (.+)$/);

        if (quoteMatch) {

            flushParagraph();
            flushList();

            output.push(
                `<blockquote>${formatInline(quoteMatch[1])}</blockquote>`
            );

            continue;
        }


        // ----------------------------------------------------
        // Normal paragraph text
        // ----------------------------------------------------

        flushList();

        paragraph.push(line);
    }


    // --------------------------------------------------------
    // Flush remaining content
    // --------------------------------------------------------

    flushParagraph();
    flushList();


    return output.join("");
}


// ============================================================
// LOAD EVENTS
// ============================================================

async function loadEvents() {

    const container =
        document.getElementById("events-container");

    if (!container) {
        console.error(
            "Could not find #events-container"
        );
        return;
    }


    try {

        const response =
            await fetch(EVENT_API_URL, {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "The API did not return an array of events."
            );

        }


        allEvents =
            data
                .map(normalizeEvent)
                .filter(event => event.id);


        renderFilteredEvents();


    } catch (error) {

        console.error(
            "Events konnten nicht geladen werden:",
            error
        );


        container.innerHTML = `
            <div class="no-events">
                <p>Events konnten nicht geladen werden.</p>
            </div>
        `;

    }

}


// ============================================================
// NORMALIZE EVENT
// ============================================================

function normalizeEvent(event) {

    return {

        id:
            String(
                event.id || ""
            ).trim(),

        title:
            String(
                event.title || ""
            ).trim(),

        dateStart:
            String(
                event.dateStart || ""
            ).trim(),

        dateEnd:
            String(
                event.dateEnd ||
                event.dateStart ||
                ""
            ).trim(),

        time:
            String(
                event.time || ""
            ).trim(),

        type:
            normalizeType(event.type),

        location:
            String(
                event.location || ""
            ).trim(),

        image:
            String(
                event.image || ""
            ).trim(),
        
        dialogImage:
            String(
                event.dialogImage || ""
            ).trim(),

        short:
            String(
                event.short || ""
            ).trim(),

        description:
            String(
                event.description || ""
            ).trim(),

        registrationRequired:
            toBoolean(
                event.registrationRequired
            ),

        registrationUrl:
            String(
                event.registrationUrl || ""
            ).trim(),

        registrationOpen:
            toBoolean(
                event.registrationOpen
            ),

        audience:
            String(
                event.audience || ""
            ).trim(),

        language:
            String(
                event.language || ""
            ).trim(),

        cost:
            String(
                event.cost || ""
            ).trim(),

        semester:
            String(
                event.semester || ""
            ).trim(),

        published:
            toBoolean(
                event.published
            )

    };

}


// ============================================================
// BOOLEAN
// ============================================================

function toBoolean(value) {

    if (typeof value === "boolean") {
        return value;
    }


    const normalized =
        String(value || "")
            .trim()
            .toLowerCase();


    return (
        normalized === "yes" ||
        normalized === "true" ||
        normalized === "1"
    );

}


// ============================================================
// TYPE
// ============================================================

function normalizeType(type) {

    const normalized =
        String(type || "")
            .trim()
            .toLowerCase();


    const allowedTypes = [
        "excursion",
        "workshop",
        "talk",
        "session",
        "event"
    ];


    if (
        allowedTypes.includes(normalized)
    ) {

        return normalized;

    }


    return "event";

}


// ============================================================
// PAGE DETECTION
// ============================================================

function isArchivePage() {

    return (
        document.body.dataset.page === "archiv"
    );

}


// ============================================================
// TODAY
// ============================================================

function getTodayString() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// ============================================================
// EVENTS FOR CURRENT PAGE
// ============================================================

function getPageEvents() {

    const today =
        getTodayString();


    return allEvents.filter(event => {

        if (!event.published) {
            return false;
        }


        if (!event.dateStart) {
            return false;
        }


        const endDate =
            event.dateEnd ||
            event.dateStart;


        if (isArchivePage()) {

            return endDate < today;

        }


        return endDate >= today;

    });

}


// ============================================================
// RENDER EVENTS
// ============================================================
//
// This function ONLY renders the events it receives.
// Filtering is handled separately by renderFilteredEvents().
// ============================================================

function renderEvents(events) {
    const container = document.getElementById("events-container");
    if (!container) return;

    if (!events.length) {
        container.innerHTML = `
            <div class="event-status-card">
                <p class="event-status-title">
                    Hier ist noch nichts los...
                </p>
                <p>
                    Schau später wieder vorbei!
                </p>
            </div>
        `;
        return;
    }

    if (isArchivePage()) {
        renderArchiveBySemester(container, events);
        return;
    }

    // Upcoming events: oldest first
    events.sort((a, b) =>
        a.dateStart.localeCompare(b.dateStart)
    );

    container.innerHTML =
        events.map(createEventCard).join("");

    attachEventCardListeners(container);
}

// ============================================================
// RENDER ARCHIVE BY SEMESTER
// ============================================================

function renderArchiveBySemester(container, events) {
    const semesters = {};

    events.forEach(event => {
        const semester = event.semester || "other";

        if (!semesters[semester]) {
            semesters[semester] = [];
        }

        semesters[semester].push(event);
    });

    const sortedSemesters = Object.keys(semesters).sort(compareSemesters);

    container.innerHTML = sortedSemesters
        .map(semester => {
            const semesterEvents = semesters[semester];

            // Newest events first within the archive
            semesterEvents.sort((a, b) =>
                b.dateStart.localeCompare(a.dateStart)
            );

            return `
                <details class="archive-semester" open>
                    <summary class="archive-semester-heading">
                        <span class="archive-semester-title">
                            ${escapeHTML(formatSemesterLabel(semester))}
                        </span>

                        <span class="archive-semester-toggle"
                              aria-hidden="true"></span>
                    </summary>

                    <div class="archive-semester-events">
                        ${semesterEvents
                            .map(createEventCard)
                            .join("")}
                    </div>
                </details>
            `;
        })
        .join("");

    attachEventCardListeners(container);
}


// ============================================================
// ARCHIVE: SORT SEMESTERS
// ============================================================
function compareSemesters(a, b) {
    const semesterA = String(a || "").toUpperCase();
    const semesterB = String(b || "").toUpperCase();

    const matchA = semesterA.match(/^(FS|HS)(\d{4})$/);
    const matchB = semesterB.match(/^(FS|HS)(\d{4})$/);

    // Known semester format comes before unknown values
    if (!matchA && !matchB) {
        return semesterB.localeCompare(semesterA);
    }

    if (!matchA) return 1;
    if (!matchB) return -1;

    const yearA = Number(matchA[2]);
    const yearB = Number(matchB[2]);

    if (yearA !== yearB) {
        return yearB - yearA;
    }

    // HS comes before FS within the same year
    if (matchA[1] === matchB[1]) {
        return 0;
    }

    return matchA[1] === "HS" ? -1 : 1;
}

// ============================================================
// ARCHIVE: SEMESTER LABEL
// ============================================================
function formatSemesterLabel(semester) {
    const normalized = String(semester || "")
        .trim()
        .toUpperCase();

    const match = normalized.match(/^(FS|HS)(\d{4})$/);

    if (!match) {
        return semester || "Sonstige";
    }

    const type = match[1];
    const year = match[2];

    if (type === "FS") {
        return `Frühjahrssemester ${year}`;
    }

    if (type === "HS") {
        return `Herbstsemester ${year}`;
    }

    return semester;
}

// ============================================================
// EVENT CARD LISTENERS
// ============================================================
function attachEventCardListeners(container) {

    container.querySelectorAll(".event-card").forEach(card => {

        const openCard = () => {

            const eventId = card.dataset.eventId;

            const event = allEvents.find(
                event => String(event.id) === String(eventId)
            );

            if (!event) return;

            openEventDialog(event);
        };


        card.addEventListener("click", (event) => {

            event.preventDefault();

            openCard();

        });


        card.addEventListener("keydown", (event) => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                openCard();

            }

        });

    });

}

// ============================================================
// CREATE EVENT CARD
// ============================================================

function createEventCard(event) {

    const imageURL = getImageURL(event.image);

const imageHTML = `
    <div class="event-card-image">
        <img
            src="${escapeAttribute(imageURL)}"
            alt=""
            loading="lazy"
        >
    </div>
`;


    // --------------------------------------------------------
    // REGISTRATION + AUDIENCE LABELS
    // --------------------------------------------------------

    let labelsHTML = "";

    if (event.registrationRequired) {

        labelsHTML += `
            <span class="event-label registration-required">
                Anmeldung erforderlich
            </span>
        `;

        labelsHTML += event.registrationOpen
            ? `
                <span class="event-label registration-open">
                    Offen
                </span>
              `
            : `
                <span class="event-label registration-closed">
                    Ausgebucht
                </span>
              `;

    }


    if (event.audience) {

        labelsHTML += `
            <span class="event-label audience-label">
                ${escapeHTML(
                    getAudienceLabel(event.audience)
                )}
            </span>
        `;

    }


    return `
        <article
            class="event-card"
            data-event-id="${escapeAttribute(event.id)}"
            tabindex="0"
            role="button"
            aria-label="${escapeAttribute(event.title)}"
        >

            ${imageHTML}


            <div class="event-card-content">

                <!-- TITLE + TYPE -->

                <div class="event-card-heading">

                    <h2 class="event-card-title">
                        ${escapeHTML(event.title)}
                    </h2>

                    <span class="
                        event-type-label
                        type-${escapeAttribute(event.type)}
                    ">
                        ${escapeHTML(
                            getTypeLabel(event.type)
                        )}
                    </span>

                </div>


                <!-- DATE / TIME / LOCATION -->

                <div class="event-card-meta">

                    <span class="event-meta-item">

                        <img
                            src="assets/icons/calendar_gray.svg"
                            alt=""
                            aria-hidden="true"
                        >

                        <span>
                            ${formatEventDate(
                                event.dateStart,
                                event.dateEnd
                            )}
                        </span>

                    </span>


                    ${
                        event.time
                            ? `
                                <span class="event-meta-item">

                                    <img
                                        src="assets/icons/clock.svg"
                                        alt=""
                                        aria-hidden="true"
                                    >

                                    <span>
                                        ${escapeHTML(event.time)}
                                    </span>

                                </span>
                              `
                            : ""
                    }


                    ${
                        event.location
                            ? `
                                <span class="event-meta-item">

                                    <img
                                        src="assets/icons/location.svg"
                                        alt=""
                                        aria-hidden="true"
                                    >

                                    <span>
                                        ${escapeHTML(event.location)}
                                    </span>

                                </span>
                              `
                            : ""
                    }

                </div>


                <!-- REGISTRATION / AUDIENCE -->

                ${
                    labelsHTML
                        ? `
                            <div class="event-card-labels">
                                ${labelsHTML}
                            </div>
                          `
                        : ""
                }


                <!-- SHORT DESCRIPTION -->

                ${
                    event.short
                        ? `
                            <p class="event-card-short">
                                ${escapeHTML(event.short)}
                            </p>
                          `
                        : ""
                }

            </div>


            <!-- MORE INFO -->

            <div class="event-card-more">
                <span>Mehr Infos</span>
            </div>

        </article>
    `;

}

function getDialogImage(event) {

    const dialogImage = String(event.dialogImage || "").trim();

    // "empty" means: deliberately show no image
    if (dialogImage.toLowerCase() === "empty") {
        return "";
    }

    // "duplicate" means: use the normal event image
    if (dialogImage.toLowerCase() === "duplicate") {
        return getImageURL(event.image);
    }

    // A URL or path means: use that image
    if (
        /^https?:\/\//i.test(dialogImage) ||
        dialogImage.startsWith("/") ||
        dialogImage.startsWith("assets/")
    ) {
        return getImageURL(dialogImage);
    }

    // A filename is also a valid image path
    if (dialogImage) {
        return getImageURL(dialogImage);
    }

    // Anything else, including blank, gets the fallback
    return EVENT_FALLBACK_IMAGE;
}

// ============================================================
// EVENT DIALOG
// ============================================================
function openEventDialog(event) {
    
    const dialog = document.getElementById("event-dialog");
    const imageContainer = document.getElementById("dialog-image");
    const content = document.getElementById("dialog-content");

    if (!dialog || !imageContainer || !content) {
        console.error("Event dialog elements not found.");
        return;
    }

    // --------------------------------------------------------
    // DIALOG IMAGE
    // --------------------------------------------------------

    // Use the dedicated dialog image if available.
    // Otherwise fall back to the regular event image.
    const dialogImage = getDialogImage(event);

    if (dialogImage) {
        imageContainer.innerHTML = `
            <div class="dialog-image-wrap">
                <img
                    class="dialog-image"
                    src="${escapeAttribute(getImageURL(dialogImage))}"
                    alt="${escapeAttribute(event.title)}"
                >
            </div>
        `;

        imageContainer.hidden = false;
    } else {
        imageContainer.innerHTML = "";
        imageContainer.hidden = true;
    }


    // --------------------------------------------------------
    // REGISTRATION
    // --------------------------------------------------------

    const registrationHTML = createRegistrationHTML(event);


    // --------------------------------------------------------
    // DIALOG CONTENT
    // --------------------------------------------------------

    content.innerHTML = `

        <div class="dialog-layout">

            <!-- =================================================
                 MAIN CONTENT
                 ================================================= -->

            <div class="dialog-main">

                <div class="
                    event-type
                    type-${escapeAttribute(event.type)}
                ">
                    ${escapeHTML(getTypeLabel(event.type))}
                </div>

                <h2 class="dialog-title">
                    ${escapeHTML(event.title)}
                </h2>

                ${registrationHTML}

                ${ event.description ? ` <div class="dialog-description"> ${markdownToHTML(event.description)} </div> ` : "" }

            </div>


            <!-- =================================================
                 SIDEBAR / EVENT DETAILS
                 ================================================= -->

            <aside class="dialog-sidebar">

                <div class="dialog-details">

                    ${
                        event.dateStart
                            ? `
                                <div class="dialog-detail">
                                    <strong>Datum</strong>
                                    <span>
                                        ${formatEventDate(
                                            event.dateStart,
                                            event.dateEnd
                                        )}
                                    </span>
                                </div>
                              `
                            : ""
                    }

                    ${
                        event.time
                            ? `
                                <div class="dialog-detail">
                                    <strong>Zeit</strong>
                                    <span>
                                        ${escapeHTML(event.time)}
                                    </span>
                                </div>
                              `
                            : ""
                    }

                    ${
                        event.location
                            ? `
                                <div class="dialog-detail">
                                    <strong>Treffpunkt</strong>
                                    <span>
                                        ${escapeHTML(event.location)}
                                    </span>
                                </div>
                              `
                            : ""
                    }

                    ${
                        event.audience
                            ? `
                                <div class="dialog-detail">
                                    <strong>Zielgruppe</strong>
                                    <span>
                                        ${escapeHTML(
                                            getAudienceLabel(event.audience)
                                        )}
                                    </span>
                                </div>
                              `
                            : ""
                    }

                    ${
                        event.language
                            ? `
                                <div class="dialog-detail">
                                    <strong>Sprache</strong>
                                    <span>
                                        ${escapeHTML(event.language)}
                                    </span>
                                </div>
                              `
                            : ""
                    }

                    ${
                        event.cost
                            ? `
                                <div class="dialog-detail">
                                    <strong>Kosten</strong>
                                    <span>
                                        ${escapeHTML(event.cost)}
                                    </span>
                                </div>
                              `
                            : ""
                    }


                </div>

            </aside>

        </div>
    `;


    // --------------------------------------------------------
    // OPEN
    // --------------------------------------------------------

    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        dialog.setAttribute("open", "");
    }
}



// ============================================================
// REGISTRATION
// ============================================================
function createRegistrationHTML(event) {
    if (!event.registrationRequired) return "";

    if (!event.registrationOpen) {
        return `
            <div class="dialog-registration-closed registration-info registration-closed">
                Anmeldung ist geschlossen
            </div>
        `;
    }

    if (!event.registrationUrl) {
        return `
            <div class="registration-info">
                Anmeldung erforderlich.
            </div>
        `;
    }

    return `
        <div class="registration-action">
            <a
                class="registration-button"
                href="${escapeAttribute(event.registrationUrl)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Zur Anmeldung
                <span aria-hidden="true">→</span>
            </a>
        </div>
    `;
}

// ============================================================
// DIALOG SETUP
// ============================================================

function setupDialog() {

    const dialog =
        document.getElementById(
            "event-dialog"
        );


    const closeButton =
        document.getElementById(
            "dialog-close"
        );


    if (!dialog || !closeButton) {

        console.error(
            "Event dialog or close button not found."
        );

        return;

    }


    closeButton.onclick =
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            closeEventDialog();

        };


    dialog.oncancel =
        function (event) {

            event.preventDefault();

            closeEventDialog();

        };


    dialog.onclick =
        function (event) {

            if (
                event.target === dialog
            ) {

                closeEventDialog();

            }

        };

}


// ============================================================
// CLOSE DIALOG
// ============================================================

function closeEventDialog() {

    const dialog =
        document.getElementById(
            "event-dialog"
        );


    if (!dialog) {
        return;
    }


    if (dialog.open) {

        dialog.close();

    }


    document.body.style.overflow =
        "";

}



// ============================================================
// FILTER SETUP
// ============================================================

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".event-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                // Remove active state from all buttons.

                filterButtons.forEach(
                    otherButton => {

                        otherButton.classList.remove(
                            "active"
                        );

                        otherButton.setAttribute(
                            "aria-pressed",
                            "false"
                        );

                    }
                );


                // Activate clicked button.

                this.classList.add(
                    "active"
                );

                this.setAttribute(
                    "aria-pressed",
                    "true"
                );


                // Re-render using the selected filter.

                renderFilteredEvents();

            }
        );

    });

}



// ============================================================
// RENDER FILTERED EVENTS
// ============================================================

function renderFilteredEvents() {

    const activeButton =
        document.querySelector(
            ".event-filter.active"
        );


    const selectedType =
        activeButton
            ? activeButton.dataset.filterType
            : "";


    console.log(
        "Selected event type:",
        selectedType || "all"
    );


    // First get events appropriate for the page:
    //
    // Events page  → upcoming events
    // Archive page → past events
    //
    const pageEvents =
        getPageEvents();


    // Then apply the type filter.

    const filteredEvents =
        pageEvents.filter(event => {

            // Empty filter = show everything.

            if (!selectedType) {
                return true;
            }


            return (
                event.type ===
                selectedType
            );

        });


    console.log(
        "Events before filter:",
        pageEvents.length
    );


    console.log(
        "Events after filter:",
        filteredEvents.length
    );


    renderEvents(
        filteredEvents
    );

}




// ============================================================
// TYPE LABELS
// ============================================================

function getTypeLabel(type) {

    const labels = {

        excursion: "Exkursion",

        workshop: "Workshop",

        talk: "Vortrag",

        session: "Sitzung",

        event: "Event"

    };


    return (
        labels[type] ||
        "Event"
    );

}


// ============================================================
// AUDIENCE LABELS
// ============================================================

function getAudienceLabel(audience) {

    const normalized =
        String(audience || "")
            .trim()
            .toLowerCase();


    if (
        normalized ===
        "members only"
    ) {

        return "Nur für Mitglieder";

    }


    if (
        normalized === "all"
    ) {

        return "Für alle";

    }


    return audience || "—";

}

// ============================================================
// DATE FORMATTING
// ============================================================
//
// German format:
//
// 15. September 2026
//
// Date range:
//
// 15.–17. September 2026
//
// If the range crosses months:
//
// 30. September – 2. Oktober 2026
//
// If it crosses years:
//
// 30. Dezember 2026 – 2. Januar 2027
// ============================================================

function formatEventDate(
    startDateString,
    endDateString
) {

    if (!startDateString) {
        return "";
    }


    const start =
        parseLocalDate(
            startDateString
        );


    const end =
        endDateString
            ? parseLocalDate(
                endDateString
            )
            : start;


    if (!start || !end) {
        return startDateString;
    }


    const months = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ];


    // --------------------------------------------------------
    // SAME DATE
    // --------------------------------------------------------

    if (
        startDateString ===
        endDateString
    ) {

        return (
            `${start.getDate()}. ` +
            `${months[start.getMonth()]} ` +
            `${start.getFullYear()}`
        );

    }


    // --------------------------------------------------------
    // SAME MONTH + SAME YEAR
    // Example:
    //
    // 15.–17. September 2026
    // --------------------------------------------------------

    if (
        start.getFullYear() ===
            end.getFullYear() &&

        start.getMonth() ===
            end.getMonth()
    ) {

        return (
            `${start.getDate()}.–` +
            `${end.getDate()}. ` +
            `${months[end.getMonth()]} ` +
            `${end.getFullYear()}`
        );

    }


    // --------------------------------------------------------
    // DIFFERENT MONTH, SAME YEAR
    // Example:
    //
    // 30. September – 2. Oktober 2026
    // --------------------------------------------------------

    if (
        start.getFullYear() ===
        end.getFullYear()
    ) {

        return (
            `${start.getDate()}. ` +
            `${months[start.getMonth()]} – ` +
            `${end.getDate()}. ` +
            `${months[end.getMonth()]} ` +
            `${end.getFullYear()}`
        );

    }


    // --------------------------------------------------------
    // DIFFERENT YEAR
    // Example:
    //
    // 30. Dezember 2026 – 2. Januar 2027
    // --------------------------------------------------------

    return (
        `${start.getDate()}. ` +
        `${months[start.getMonth()]} ` +
        `${start.getFullYear()} – ` +
        `${end.getDate()}. ` +
        `${months[end.getMonth()]} ` +
        `${end.getFullYear()}`
    );

}


// ============================================================
// PARSE LOCAL DATE
// ============================================================

function parseLocalDate(dateString) {

    if (!dateString) {
        return null;
    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return null;
    }


    const year =
        Number(parts[0]);


    const month =
        Number(parts[1]);


    const day =
        Number(parts[2]);


    if (
        !year ||
        !month ||
        !day
    ) {

        return null;

    }


    return new Date(
        year,
        month - 1,
        day
    );

}


// ============================================================
// IMAGE URL
// ============================================================
//
// Supports:
//
// 1. External URL
//    https://example.com/image.jpg
//
// 2. Root-relative local path
//    /assets/gallery/image.webp
//
// 3. Relative local path
//    assets/gallery/image.webp
//
// 4. Simple filename
//    image.webp
//
// Simple filenames are assumed to be in /assets/events/.
// ============================================================

function getImageURL(image) {

    const value = String(image || "").trim();

    if (!value) {
        return EVENT_FALLBACK_IMAGE;
    }

    // Full external URL
    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    // Root-relative path
    if (value.startsWith("/")) {
        return value;
    }

    // Explicit assets path
    if (value.startsWith("assets/")) {
        return value;
    }

    // Otherwise assume it is an event filename
    return `assets/events/${value}`;
}


// ============================================================
// SECURITY
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}
