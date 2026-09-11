// ============================================================
// SITE COMPONENTS
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    await Promise.all([
        loadSiteComponent(
            "site-header",
            "components/header.html"
        ),

        loadSiteComponent(
            "site-footer",
            "components/footer.html"
        )
    ]);

    setupMobileMenu()
    setCurrentYear();
});


// ============================================================
// LOAD COMPONENT
// ============================================================

async function loadSiteComponent(containerId, componentPath) {

    const container = document.getElementById(containerId);

    if (!container) return;

    try {

        const response = await fetch(componentPath, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        container.innerHTML = await response.text();

    } catch (error) {

        console.error(
            `Could not load site component "${componentPath}":`,
            error
        );

    }
}


// ============================================================
// CURRENT YEAR
// ============================================================

function setCurrentYear() {

    const year = document.getElementById("year");

    if (!year) return;

    year.textContent = new Date().getFullYear();
}

// ============================================================
// MOBILE MENU
// ============================================================

function setupMobileMenu() {

    const menuButton = document.querySelector(".menu-button");
    const mainNav = document.getElementById("main-nav");

    if (!menuButton || !mainNav) return;

    menuButton.addEventListener("click", () => {

        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        mainNav.classList.toggle("is-open", !isOpen);

    });

    mainNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            mainNav.classList.remove("is-open");

        });

    });
}