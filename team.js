const teamGrid = document.querySelector("#vorstand-grid");
const honoraryGrid = document.querySelector("#honorary-grid");

fetch("data/team.json")
  .then(response => response.json())
  .then(vorstand => {

    teamGrid.textContent = "";

    for (const member of vorstand) {

      const card = document.createElement("article");
      card.className = "vorstand-card";

      // Portrait
      const portrait = document.createElement("img");
      portrait.className = "vorstand-portrait";

      const fallbackPortrait = "assets/team/placeholder.png"

      portrait.src = member.portrait;
      portrait.alt = ``;
      portrait.loading = "lazy";
      portrait.decoding = "async";

      portrait.addEventListener("error", () => {
      portrait.src = fallbackPortrait;
      });

      // Role
      const role = document.createElement("p");
      role.className = "vorstand-role";
      role.textContent = member.role;

      // Name
      const name = document.createElement("h3");
      name.className = "vorstand-name";
      name.textContent = member.name;

      // Attributes
      const details = document.createElement("dl");
      details.className = "vorstand-details";

      const studyLabel = document.createElement("dt");
      studyLabel.textContent = "Studium";

      const studyValue = document.createElement("dd");
      studyValue.textContent = member.study;

      const insectLabel = document.createElement("dt");
      insectLabel.textContent = "Lieblingsinsekt";

      const insectValue = document.createElement("dd");

      const insectName = document.createElement("i");
      insectName.textContent = member.favouriteInsect;

      insectValue.appendChild(insectName);

      details.appendChild(studyLabel);
      details.appendChild(studyValue);
      details.appendChild(insectLabel);
      details.appendChild(insectValue);

      // Content
      const content = document.createElement("div");
      content.className = "vorstand-content";

      content.appendChild(role);
      content.appendChild(name);
      content.appendChild(details);

      // Contact
      if (member.contact) {
        const contact = document.createElement("a");
        contact.className = "vorstand-contact";

        contact.href = `mailto:${member.contact}`;
        contact.textContent = "Kontakt";

        content.appendChild(contact);
      }

      // Card
      card.appendChild(portrait);
      card.appendChild(content);

      // Add card to grid
      teamGrid.appendChild(card);
    }

  });

fetch("data/honorary.json")
  .then(response => response.json())
  .then(vorstand => {

    honoraryGrid.textContent = "";

    for (const member of vorstand) {

      const card = document.createElement("article");
      card.className = "vorstand-card";

      // Portrait
      const portrait = document.createElement("img");
      portrait.className = "vorstand-portrait";

      const fallbackPortrait = "assets/team/placeholder.png"

      portrait.src = member.portrait;
      portrait.alt = ``;
      portrait.loading = "lazy";
      portrait.decoding = "async";

      portrait.addEventListener("error", () => {
      portrait.src = fallbackPortrait;
      });


      // Name
      const name = document.createElement("h3");
      name.className = "vorstand-name";
      name.textContent = member.name;

      // Attributes
      const details = document.createElement("dl");
      details.className = "vorstand-details";

      const insectLabel = document.createElement("dt");
      insectLabel.textContent = "Lieblingsinsekt";

      const insectValue = document.createElement("dd");

      const insectName = document.createElement("i");
      insectName.textContent = member.favouriteInsect;

      insectValue.appendChild(insectName);

      details.appendChild(insectLabel);
      details.appendChild(insectValue);

      // Content
      const content = document.createElement("div");
      content.className = "vorstand-content";

      content.appendChild(name);
      content.appendChild(details);

      // Contact
      if (member.contact) {
        const contact = document.createElement("a");
        contact.className = "vorstand-contact";

        contact.href = `mailto:${member.contact}`;
        contact.textContent = "Kontakt";

        content.appendChild(contact);
      }

      // Card
      card.appendChild(portrait);
      card.appendChild(content);

      // Add card to grid
      honoraryGrid.appendChild(card);
    }

  });


const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector("#main-nav");

if (menuButton && mainNav) {
  menuButton.addEventListener("click", () => {

    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    const newState = !isOpen;

    menuButton.setAttribute(
      "aria-expanded",
      String(newState)
    );

    menuButton.setAttribute(
      "aria-label",
      newState
        ? "Navigation schliessen"
        : "Navigation öffnen"
    );

    mainNav.classList.toggle("is-open", newState);
  });
}